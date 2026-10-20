-- 0003_messages_and_clicks (2026-10-20, owner request).
--
-- 1. Contact messages. Logan asked to see who wrote to him beside their
--    visit: name, email and message, under their visitor number. That is
--    real personal data, so it lives in its own table, never in events,
--    locked down the same way (RLS on, no policies, no API grants). The
--    message still reaches Logan by email through Formspree; this is the
--    copy the console reads. visitor_id is NULL when that browser was not
--    tracked (Global Privacy Control, or excluded): the message is kept,
--    the visit is not linked.
-- 2. Behaviour gets five plain counts: GitHub and LinkedIn clicks, resume
--    downloads, "Email me" clicks (Contact_Opened with from = email_me)
--    and visits to the sim racing page.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  -- Minted by the browser per message, so a retry stores it once.
  message_id   uuid PRIMARY KEY,
  received_at  timestamptz NOT NULL DEFAULT now(),
  visitor_id   text,
  session_id   text,
  name         text NOT NULL,
  email        text NOT NULL,
  message      text NOT NULL,
  page         text,
  site_env     text NOT NULL,
  CONSTRAINT contact_messages_name_size CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT contact_messages_email_size CHECK (char_length(email) BETWEEN 3 AND 320),
  CONSTRAINT contact_messages_message_size CHECK (char_length(message) BETWEEN 1 AND 5000),
  CONSTRAINT contact_messages_site_env_known CHECK (site_env IN ('production', 'preview', 'development'))
);

CREATE INDEX IF NOT EXISTS contact_messages_visitor_idx ON public.contact_messages (visitor_id, received_at DESC)
  WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS contact_messages_received_idx ON public.contact_messages (received_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_messages FROM anon, authenticated;

-- The Visitors list, now with the name and email of anyone who wrote, and
-- the messages that belong to no counted visitor (untracked browsers, or
-- a visitor later judged a crawler) so none is hidden.
CREATE OR REPLACE FUNCTION public.console_visitors(p_env text, p_limit integer, p_offset integer)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH rows AS (SELECT * FROM public.console_visitor_rows(p_env)),
  latest AS (
    SELECT DISTINCT ON (visitor_id) visitor_id, name, email
    FROM public.contact_messages
    WHERE site_env = p_env AND visitor_id IS NOT NULL
    ORDER BY visitor_id, received_at DESC
  ),
  counts AS (
    SELECT visitor_id, count(*) AS messages
    FROM public.contact_messages
    WHERE site_env = p_env AND visitor_id IS NOT NULL
    GROUP BY visitor_id
  ),
  unlinked AS (
    SELECT m.* FROM public.contact_messages m
    WHERE m.site_env = p_env
      AND NOT EXISTS (SELECT 1 FROM rows r WHERE r.visitor_id = m.visitor_id AND NOT r.crawler)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM rows WHERE NOT crawler),
    'excluded_crawlers', (SELECT count(*) FROM rows WHERE crawler),
    'ephemeral_events', (SELECT count(*) FROM public.events WHERE site_env = p_env AND identity_source = 'ephemeral'),
    'rows', coalesce((
      SELECT jsonb_agg(
        (to_jsonb(r) - 'visitor_id' - 'crawler')
          || jsonb_build_object('name', l.name, 'email', l.email, 'messages', coalesce(c.messages, 0))
        ORDER BY r.last_seen DESC, r.n DESC)
      FROM (SELECT * FROM rows WHERE NOT crawler ORDER BY last_seen DESC, n DESC
            LIMIT least(p_limit, 200) OFFSET greatest(p_offset, 0)) r
      LEFT JOIN latest l ON l.visitor_id = r.visitor_id
      LEFT JOIN counts c ON c.visitor_id = r.visitor_id
    ), '[]'::jsonb),
    'unlinked_messages', (SELECT count(*) FROM unlinked),
    'unlinked', coalesce((
      SELECT jsonb_agg(jsonb_build_object('received_at', u.received_at, 'name', u.name, 'email', u.email,
                                          'message', u.message) ORDER BY u.received_at DESC)
      FROM (SELECT * FROM unlinked ORDER BY received_at DESC LIMIT 20) u
    ), '[]'::jsonb)
  )
$$;

-- One visitor's journey, now with every message they sent, newest first.
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
    ), '[]'::jsonb),
    'messages', coalesce((
      SELECT jsonb_agg(jsonb_build_object('received_at', m.received_at, 'name', m.name, 'email', m.email,
                                          'message', m.message, 'page', m.page) ORDER BY m.received_at DESC)
      FROM public.contact_messages m, v
      WHERE m.visitor_id = v.visitor_id AND m.site_env = p_env
    ), '[]'::jsonb)
  ) END
$$;

-- Behaviour, as in 0002, plus the five counts. Each is { count, visitors }
-- over the chosen range, crawlers left out like everything else here.
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
  -- By day counts whole Pacific days only (see 0002 for why).
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
  ),
  tally AS (
    SELECT
      CASE
        WHEN event_name = 'Outbound_Link_Clicked' AND props ->> 'target' = 'github' THEN 'github'
        WHEN event_name = 'Outbound_Link_Clicked' AND props ->> 'target' = 'linkedin' THEN 'linkedin'
        WHEN event_name = 'Resume_Downloaded' THEN 'resume'
        WHEN event_name = 'Contact_Opened' AND props ->> 'from' = 'email_me' THEN 'email_me'
        WHEN event_name = 'Sim_Racing_Viewed' THEN 'sim_racing'
      END AS what,
      count(*) AS c, count(DISTINCT visitor_id) AS v
    FROM ev
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
    'clicks', (
      SELECT jsonb_object_agg(k, jsonb_build_object('count', coalesce(t.c, 0), 'visitors', coalesce(t.v, 0)))
      FROM unnest(ARRAY['github', 'linkedin', 'resume', 'email_me', 'sim_racing']) AS k
      LEFT JOIN tally t ON t.what = k
    ),
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

REVOKE ALL ON FUNCTION public.console_visitors(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_visitor(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.console_behaviour(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.console_visitors(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_visitor(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.console_behaviour(text, integer) TO service_role;
