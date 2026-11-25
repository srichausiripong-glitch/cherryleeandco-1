ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS cover_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image_alt text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.article_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('view', 'contact_line', 'contact_programs')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_events_slug_type_created
  ON public.article_events (slug, event_type, created_at DESC);

GRANT INSERT ON public.article_events TO anon, authenticated;
GRANT SELECT ON public.article_events TO authenticated;
GRANT ALL ON public.article_events TO service_role;

ALTER TABLE public.article_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_events_public_insert"
  ON public.article_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IN ('view', 'contact_line', 'contact_programs')
    AND length(slug) BETWEEN 2 AND 120
  );

CREATE POLICY "article_events_staff_read"
  ON public.article_events
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );