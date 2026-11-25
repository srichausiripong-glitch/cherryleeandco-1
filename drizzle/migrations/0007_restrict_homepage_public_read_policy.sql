DROP POLICY IF EXISTS homepage_public_read ON public.homepage_content;
CREATE POLICY homepage_public_read
  ON public.homepage_content
  FOR SELECT
  TO anon, authenticated
  USING (id = 'homepage');