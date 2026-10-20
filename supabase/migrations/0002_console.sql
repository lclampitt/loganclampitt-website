-- 0002_console: the read side of the private /console (2026-10-20).
--
-- Every number the console shows is defined here, once, and read only by
-- api/console/data.js with the service role. Same doctrine as pixel-lord's
-- console queries, rebuilt for this site:
--
--   * Time is the generated `at` column (client clock only when believed).
--   * People are persistent visitor ids that are not crawlers
--     (bot_visitors). Ephemeral ids never count as people.
--   * Days and hours are Pacific time (America/Los_Angeles).
--   * p_env picks the deployment's own data: production, preview or
--     development never mix.
--   * Unknown stays NULL. Nothing here turns a missing value into a zero.

-- Events from people: persistent ids, crawlers removed.
CREATE OR REPLACE FUNCTION public.console_people_events(p_env text)
RETURNS SETOF public.events
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT e.*
  FROM public.events e
  WHERE e.site_env = p_env
    AND e.identity_source = 'persistent'
    AND NOT EXISTS (SELECT 1 FROM public.bot_visitors b WHERE b.visitor_id = e.visitor_id)
$$;

-- Overview: visitors and sessions in the last p_days against the p_days
-- before. `comparable` is false until collection started before the
-- earlier period began; the console then says "not enough history"
-- instead of comparing against a period nobody measured.
CREATE OR REPLACE FUNCTION public.console_overview(p_env text, p_days integer)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH people AS (SELECT * FROM public.console_people_events(p_env)),
  b AS (
    SELECT now() - make_interval(days => p_days) AS cur_start,
           now() - make_interval(days => 2 * p_days) AS prev_start,
           (now() AT TIME ZONE 'America/Los_Angeles')::date AS today
  ),
  started AS (SELECT min(at) AS first_seen FROM public.events WHERE site_env = p_env),
  day_span AS (
    SELECT d::date AS day
    FROM b, started,
         generate_series(
           greatest(b.today - (p_days - 1), (started.first_seen AT TIME ZONE 'America/Los_Angeles')::date),
           b.today, interval '1 day') AS d
    WHERE started.first_seen IS NOT NULL
  ),
  daily AS (
    SELECT (at AT TIME ZONE 'America/Los_Angeles')::date AS day,
           count(DISTINCT visitor_id) AS visitors,
           count(DISTINCT session_id) AS sessions
    FROM people, b
    WHERE (at AT TIME ZONE 'America/Los_Angeles')::date > b.today - p_days
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'days', p_days,
    'first_seen', (SELECT first_seen FROM started),
    'comparable', coalesce((SELECT first_seen FROM started) <= (SELECT prev_start FROM b), false),
    'visitors', (SELECT count(DISTINCT visitor_id) FROM people, b WHERE at >= b.cur_start),
    'visitors_before', (SELECT count(DISTINCT visitor_id) FROM people, b WHERE at >= b.prev_start AND at < b.cur_start),
    'sessions', (SELECT count(DISTINCT session_id) FROM people, b WHERE at >= b.cur_start),
    'sessions_before', (SELECT count(DISTINCT session_id) FROM people, b WHERE at >= b.prev_start AND at < b.cur_start),
    'serious_visitors', (SELECT count(DISTINCT visitor_id) FROM people, b
                         WHERE at >= b.cur_start AND event_name IN ('Resume_Downloaded', 'Contact_Sent', 'Project_Opened')),
    'serious_visitors_before', (SELECT count(DISTINCT visitor_id) FROM people, b
                                WHERE at >= b.prev_start AND at < b.cur_start
                                  AND event_name IN ('Resume_Downloaded', 'Contact_Sent', 'Project_Opened')),
    'today_visitors', (SELECT count(DISTINCT visitor_id) FROM people, b WHERE (at AT TIME ZONE 'America/Los_Angeles')::date = b.today),
    'today_sessions', (SELECT count(DISTINCT session_id) FROM people, b WHERE (at AT TIME ZONE 'America/Los_Angeles')::date = b.today),
    'excluded_crawlers', (SELECT count(DISTINCT e.visitor_id) FROM public.events e
                          JOIN public.bot_visitors bv ON bv.visitor_id = e.visitor_id, b
                          WHERE e.site_env = p_env AND e.at >= b.cur_start),
    'ephemeral_events', (SELECT count(*) FROM public.events e, b
                         WHERE e.site_env = p_env AND e.identity_source = 'ephemeral' AND e.at >= b.cur_start),
    'newest_event', (SELECT max(received_at) FROM public.events WHERE site_env = p_env),
    'daily', coalesce((
      SELECT jsonb_agg(jsonb_build_object('day', s.day, 'visitors', coalesce(d.visitors, 0), 'sessions', coalesce(d.sessions, 0)) ORDER BY s.day)
      FROM day_span s LEFT JOIN daily d ON d.day = s.day
    ), '[]'::jsonb)
  )
$$;

-- One row per person, with a stable number. Numbers are given across
-- every persistent visitor before crawlers are removed, so the list has
-- gaps by design: closing them would renumber people and break links.
-- They follow arrival at the server (received_at), which only grows, so a
-- late batch or a slow browser clock never slots in and shifts the rest.
CREATE OR REPLACE FUNCTION public.console_visitor_rows(p_env text)
RETURNS TABLE (
  n bigint, visitor_id text, crawler boolean, first_seen timestamptz, last_seen timestamptz,
  sessions bigint, pages bigint, projects bigint, resumes bigint, contacts bigint,
  ft_channel text, ft_source text, lt_channel text, lt_source text,
  place jsonb, machine jsonb
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH numbered AS (
    SELECT e.visitor_id, row_number() OVER (ORDER BY min(e.received_at), e.visitor_id) AS n
    FROM public.events e
    WHERE e.site_env = p_env AND e.identity_source = 'persistent'
    GROUP BY e.visitor_id
  )
  SELECT
    nb.n,
    nb.visitor_id,
    EXISTS (SELECT 1 FROM public.bot_visitors bv WHERE bv.visitor_id = nb.visitor_id),
    min(e.at),
    max(e.at),
    count(DISTINCT e.session_id),
    count(*) FILTER (WHERE e.event_name = 'Page_Viewed'),
    count(DISTINCT e.props ->> 'slug') FILTER (WHERE e.event_name = 'Project_Opened'),
    count(*) FILTER (WHERE e.event_name = 'Resume_Downloaded'),
    count(*) FILTER (WHERE e.event_name = 'Contact_Sent'),
    (array_agg(e.ft_channel ORDER BY e.at) FILTER (WHERE e.ft_channel IS NOT NULL))[1],
    (array_agg(e.ft_source ORDER BY e.at) FILTER (WHERE e.ft_channel IS NOT NULL))[1],
    (array_agg(e.lt_channel ORDER BY e.at DESC) FILTER (WHERE e.lt_channel IS NOT NULL))[1],
    (array_agg(e.lt_source ORDER BY e.at DESC) FILTER (WHERE e.lt_channel IS NOT NULL))[1],
    (array_agg(jsonb_build_object('city', e.city, 'region', e.region, 'country', e.country) ORDER BY e.at DESC)
       FILTER (WHERE e.city IS NOT NULL OR e.country IS NOT NULL))[1],
    (array_agg(jsonb_build_object('device', e.device, 'browser', e.browser, 'os', e.os) ORDER BY e.at DESC)
       FILTER (WHERE e.device IS NOT NULL OR e.browser IS NOT NULL OR e.os IS NOT NULL))[1]
  FROM numbered nb
  JOIN public.events e ON e.visitor_id = nb.visitor_id AND e.site_env = p_env
  GROUP BY nb.n, nb.visitor_id
$$;

-- The Visitors list: people only, most recent first.
CREATE OR REPLACE FUNCTION public.console_visitors(p_env text, p_limit integer, p_offset integer)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH rows AS (SELECT * FROM public.console_visitor_rows(p_env))
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM rows WHERE NOT crawler),
    'excluded_crawlers', (SELECT count(*) FROM rows WHERE crawler),
    'ephemeral_events', (SELECT count(*) FROM public.events WHERE site_env = p_env AND identity_source = 'ephemeral'),
    'rows', coalesce((
      SELECT jsonb_agg(to_jsonb(r) - 'visitor_id' - 'crawler' ORDER BY r.last_seen DESC, r.n DESC)
      FROM (SELECT * FROM rows WHERE NOT crawler ORDER BY last_seen DESC, n DESC
            LIMIT least(p_limit, 200) OFFSET greatest(p_offset, 0)) r
    ), '[]'::jsonb)
  )
$$;

-- One visitor's journey: their summary row and their newest 1000 events,
-- returned oldest first. A crawler can still be opened by number; the
-- console says it is one.
CREATE OR REPLACE FUNCTION public.console_visitor(p_env text, p_n bigint)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH v AS (SELECT * FROM public.console_visitor_rows(p_env) WHERE n = p_n)
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM v) THEN NULL ELSE jsonb_build_object(
    'visitor', (SELECT to_jsonb(v) - 'visitor_id' FROM v),
    'event_count', (SELECT count(*) FROM public.events e, v WHERE e.visitor_id = v.visitor_id AND e.site_env = p_env),
    'events', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'at', x.at, 'event_name', x.event_name, 'page', x.page, 'props', x.props,
        'session', left(x.session_id, 8), 'server_clock', x.clock_source <> 'client',
        'lt_channel', x.lt_channel, 'lt_source', x.lt_source,
        'city', x.city, 'region', x.region, 'country', x.country,
        'device', x.device, 'browser', x.browser, 'os', x.os
      ) ORDER BY x.at, x.event_id)
      FROM (
        SELECT e.* FROM public.events e, v
        WHERE e.visitor_id = v.visitor_id AND e.site_env = p_env
        ORDER BY e.at DESC, e.event_id DESC LIMIT 1000
      ) x
    ), '[]'::jsonb)
  ) END
$$;

-- Behaviour over all time (p_days NULL) or the last p_days. Crawlers are
-- left out of every count here; how many is reported beside them.
CREATE OR REPLACE FUNCTION public.console_behaviour(p_env text, p_days integer)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH b AS (
    SELECT CASE WHEN p_days IS NULL THEN NULL ELSE now() - make_interval(days => p_days) END AS since,
           (now() AT TIME ZONE 'America/Los_Angeles')::date AS today
  ),
  allp AS (
    SELECT p.*, (p.at AT TIME ZONE 'America/Los_Angeles') AS local_at,
           p.event_name IN ('Resume_Downloaded', 'Contact_Sent', 'Project_Opened') AS serious
    FROM public.console_people_events(p_env) p
  ),
  ev AS (SELECT allp.* FROM allp, b WHERE b.since IS NULL OR allp.at >= b.since),
  -- First touch is the visitor's own, from their first event ever.
  first_touch AS (
    SELECT DISTINCT ON (visitor_id) visitor_id, ft_channel, ft_source
    FROM public.events
    WHERE site_env = p_env AND visitor_id IN (SELECT visitor_id FROM ev)
    ORDER BY visitor_id, (ft_channel IS NULL), at
  ),
  views AS (SELECT * FROM ev WHERE event_name = 'Page_Viewed' AND session_id IS NOT NULL),
  last_view AS (
    SELECT DISTINCT ON (session_id) session_id, page FROM views ORDER BY session_id, at DESC, event_id DESC
  ),
  breadth AS (SELECT session_id, count(DISTINCT page) AS pages FROM views GROUP BY session_id),
  -- By day counts whole Pacific days only, by calendar date rather than
  -- the rolling range above: today is still happening, and the day
  -- collection began started part way through, so both are left out.
  -- 30 days uses the last 28 whole days (four of each weekday), 7 days the
  -- last 7. Every day in the span counts toward its weekday, quiet days
  -- included.
  wd AS (
    SELECT greatest(
             CASE WHEN p_days IS NULL THEN NULL WHEN p_days >= 28 THEN b.today - 28 ELSE b.today - 7 END,
             (SELECT min(local_at)::date + 1 FROM allp)
           ) AS start, b.today
    FROM b
  ),
  held AS (
    SELECT extract(isodow FROM d)::int AS weekday, count(*) AS days
    FROM wd, generate_series(wd.start, wd.today - 1, interval '1 day') AS d
    WHERE wd.start IS NOT NULL AND wd.start < wd.today
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'days', p_days,
    'visitors', (SELECT count(DISTINCT visitor_id) FROM ev),
    'sessions', (SELECT count(DISTINCT session_id) FROM ev),
    'events', (SELECT count(*) FROM ev),
    'excluded_crawlers', (SELECT count(DISTINCT e.visitor_id) FROM public.events e
                          JOIN public.bot_visitors bv ON bv.visitor_id = e.visitor_id, b
                          WHERE e.site_env = p_env AND (b.since IS NULL OR e.at >= b.since)),
    'serious', jsonb_build_object(
      'any_visitors', (SELECT count(DISTINCT visitor_id) FROM ev WHERE serious),
      'by_event', coalesce((
        SELECT jsonb_agg(jsonb_build_object('event_name', n, 'count', c, 'visitors', v) ORDER BY n)
        FROM (SELECT event_name AS n, count(*) AS c, count(DISTINCT visitor_id) AS v FROM ev WHERE serious GROUP BY 1) s
      ), '[]'::jsonb)
    ),
    'pages', coalesce((
      SELECT jsonb_agg(jsonb_build_object('page', page, 'views', c, 'visitors', v) ORDER BY c DESC, page)
      FROM (SELECT page, count(*) AS c, count(DISTINCT visitor_id) AS v FROM ev
            WHERE event_name = 'Page_Viewed' AND page IS NOT NULL GROUP BY page ORDER BY count(*) DESC, page LIMIT 15) s
    ), '[]'::jsonb),
    'projects', coalesce((
      SELECT jsonb_agg(jsonb_build_object('slug', slug, 'opens', c, 'visitors', v) ORDER BY c DESC, slug)
      FROM (SELECT props ->> 'slug' AS slug, count(*) AS c, count(DISTINCT visitor_id) AS v FROM ev
            WHERE event_name = 'Project_Opened' GROUP BY 1) s
    ), '[]'::jsonb),
    'outbound', coalesce((
      SELECT jsonb_agg(jsonb_build_object('target', target, 'host', host, 'clicks', c, 'visitors', v) ORDER BY c DESC)
      FROM (SELECT props ->> 'target' AS target, props ->> 'host' AS host, count(*) AS c, count(DISTINCT visitor_id) AS v
            FROM ev WHERE event_name = 'Outbound_Link_Clicked' GROUP BY 1, 2 ORDER BY count(*) DESC LIMIT 12) s
    ), '[]'::jsonb),
    'channels', coalesce((
      SELECT jsonb_agg(jsonb_build_object('channel', ft_channel, 'visitors', v) ORDER BY v DESC)
      FROM (SELECT ft_channel, count(*) AS v FROM first_touch GROUP BY 1) s
    ), '[]'::jsonb),
    'referrers', coalesce((
      SELECT jsonb_agg(jsonb_build_object('channel', ft_channel, 'source', ft_source, 'visitors', v) ORDER BY v DESC, ft_source)
      FROM (SELECT ft_channel, ft_source, count(*) AS v FROM first_touch
            WHERE ft_source IS NOT NULL GROUP BY 1, 2 ORDER BY count(*) DESC, ft_source LIMIT 15) s
    ), '[]'::jsonb),
    'exits', coalesce((
      SELECT jsonb_agg(jsonb_build_object('page', page, 'sessions', c, 'one_page', o) ORDER BY c DESC, page)
      FROM (SELECT l.page, count(*) AS c, count(*) FILTER (WHERE br.pages = 1) AS o
            FROM last_view l JOIN breadth br USING (session_id)
            GROUP BY l.page ORDER BY count(*) DESC, l.page LIMIT 10) s
    ), '[]'::jsonb),
    'hours', jsonb_build_object(
      'events', (SELECT count(*) FROM ev),
      'days', (SELECT count(DISTINCT local_at::date) FROM ev),
      'by_hour', (
        SELECT jsonb_agg(jsonb_build_object('hour', h, 'events', coalesce(c, 0), 'serious', coalesce(s, 0)) ORDER BY h)
        FROM generate_series(0, 23) AS h
        LEFT JOIN (SELECT extract(hour FROM local_at)::int AS hr, count(*) AS c, count(*) FILTER (WHERE serious) AS s
                   FROM ev GROUP BY 1) x ON x.hr = h
      )
    ),
    'weekdays', jsonb_build_object(
      'whole_days', (SELECT coalesce(sum(days), 0) FROM held),
      'events', (SELECT count(*) FROM allp, wd WHERE local_at::date >= wd.start AND local_at::date < wd.today),
      'by_weekday', (
        SELECT jsonb_agg(jsonb_build_object('weekday', w, 'events', coalesce(x.c, 0), 'serious', coalesce(x.s, 0),
                                            'days', coalesce(h.days, 0)) ORDER BY w)
        FROM generate_series(1, 7) AS w
        LEFT JOIN held h ON h.weekday = w
        LEFT JOIN (SELECT extract(isodow FROM local_at)::int AS wk, count(*) AS c, count(*) FILTER (WHERE serious) AS s
                   FROM allp, wd WHERE local_at::date >= wd.start AND local_at::date < wd.today GROUP BY 1) x ON x.wk = w
      )
    )
  )
$$;

-- Only the service role (api/console/data.js) may run these.
REVOKE ALL ON FUNCTION public.console_people_events(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_overview(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_visitor_rows(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_visitors(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_visitor(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_behaviour(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.console_people_events(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_overview(text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_visitor_rows(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_visitors(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_visitor(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_behaviour(text, integer) TO service_role;
