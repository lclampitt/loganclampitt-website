-- 0001_events: first party visitor events (2026-10-20).
--
-- One row per thing a visitor did on loganclampitt.com, written only by
-- api/events.js with the service role. The model follows pixel-lord's
-- events table, rebuilt here in its own database; nothing is shared.
--
-- WHAT IS NEVER HERE: the IP address, the raw user agent, cookies, and
-- anything typed into the contact form. Place is city, region and
-- country from Vercel's edge, nothing finer.

CREATE TABLE IF NOT EXISTS public.events (
  -- Minted by the browser, so a retried batch inserts nothing twice.
  event_id         uuid PRIMARY KEY,
  event_name       text NOT NULL,

  -- The browser's clock, kept as sent and never backfilled. It is
  -- believed only within 30 days back and 24 hours ahead of arrival
  -- ('client'); outside that it is kept but labelled 'implausible'.
  -- 'absent' means the browser sent no time.
  occurred_at      timestamptz,
  received_at      timestamptz NOT NULL DEFAULT now(),
  clock_source     text NOT NULL,
  -- When it happened, by the rule above. Every read uses this column so
  -- the rule lives in one place.
  at               timestamptz GENERATED ALWAYS AS (
                     CASE WHEN clock_source = 'client' THEN occurred_at ELSE received_at END
                   ) STORED,

  -- A random id in the visitor's localStorage. 'ephemeral' when storage
  -- failed and the id lives only for that page load: such ids are never
  -- counted as people.
  visitor_id       text NOT NULL,
  identity_source  text NOT NULL,
  -- A new session after 30 minutes idle, or on arrival from outside.
  session_id       text,
  page             text,          -- path only, never the query string
  props            jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Channel buckets and their source (a host or utm_source). First touch
  -- is the visitor's first arrival, last touch the latest. NULL means not
  -- measured, which is not the same as 'direct'.
  ft_channel       text,
  ft_source        text,
  lt_channel       text,
  lt_source        text,

  -- From Vercel's geo headers, per batch. NULL means not resolved.
  city             text,
  region           text,          -- ISO 3166-2 subdivision, e.g. CA
  country          text,          -- ISO 3166-1 alpha 2, e.g. US

  -- Family names only, no versions. NULL means could not tell.
  device           text,
  browser          text,
  os               text,
  viewport_width   integer,
  viewport_height  integer,

  -- 'bot' from a crawler user agent, a headless browser, automation, or
  -- an address inside a cloud provider's published ranges. 'not_bot'
  -- only when a real browser was recognised. NULL means could not tell.
  bot              text,

  -- Which deployment received it. The console counts production only, so
  -- preview and local testing never mix into the numbers.
  site_env         text NOT NULL,

  CONSTRAINT events_event_name_present CHECK (event_name <> ''),
  CONSTRAINT events_visitor_id_present CHECK (visitor_id <> ''),
  CONSTRAINT events_clock_source_known CHECK (clock_source IN ('client', 'absent', 'implausible')),
  CONSTRAINT events_clock_source_matches_time CHECK (
    (clock_source = 'absent' AND occurred_at IS NULL)
    OR (clock_source <> 'absent' AND occurred_at IS NOT NULL)
  ),
  CONSTRAINT events_identity_source_known CHECK (identity_source IN ('persistent', 'ephemeral')),
  CONSTRAINT events_device_known CHECK (device IN ('phone', 'tablet', 'desktop')),
  CONSTRAINT events_viewport_width_sane CHECK (viewport_width BETWEEN 1 AND 20000),
  CONSTRAINT events_viewport_height_sane CHECK (viewport_height BETWEEN 1 AND 20000),
  CONSTRAINT events_bot_known CHECK (bot IN ('bot', 'not_bot')),
  CONSTRAINT events_site_env_known CHECK (site_env IN ('production', 'preview', 'development')),
  CONSTRAINT events_page_is_path CHECK (page IS NULL OR (page LIKE '/%' AND position('?' IN page) = 0))
);

CREATE INDEX IF NOT EXISTS events_at_idx ON public.events (at DESC);
CREATE INDEX IF NOT EXISTS events_visitor_at_idx ON public.events (visitor_id, at);
CREATE INDEX IF NOT EXISTS events_session_at_idx ON public.events (session_id, at) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_name_at_idx ON public.events (event_name, at);

-- A visitor is a crawler only when every batch that could be judged said
-- so: at least one 'bot' and no 'not_bot'. NULLs do not vote. Counts of
-- people and sessions leave these visitors out.
CREATE OR REPLACE VIEW public.bot_visitors WITH (security_invoker = true) AS
  SELECT visitor_id
  FROM public.events
  GROUP BY visitor_id
  HAVING count(*) FILTER (WHERE bot = 'bot') > 0
     AND count(*) FILTER (WHERE bot = 'not_bot') = 0;

-- Locked down: RLS on with no policies, and no grants to the API roles.
-- Only the service role (api/, server side) reads or writes. Not FORCE:
-- the owner must keep working for migrations.
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.events FROM anon, authenticated;
REVOKE ALL ON public.bot_visitors FROM anon, authenticated;
