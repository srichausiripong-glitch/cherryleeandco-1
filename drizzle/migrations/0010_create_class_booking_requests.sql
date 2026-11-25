CREATE TABLE IF NOT EXISTS public.class_booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  contact text NOT NULL,
  child_age text NOT NULL DEFAULT '',
  preferred_day text NOT NULL DEFAULT 'เสาร์',
  package_interest text NOT NULL DEFAULT 'รายครั้ง (1,600 บาท)',
  note text NOT NULL DEFAULT '',
  source_path text NOT NULL DEFAULT '/',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_booking_requests_created
  ON public.class_booking_requests (created_at DESC);

GRANT INSERT ON public.class_booking_requests TO anon, authenticated;
GRANT SELECT ON public.class_booking_requests TO authenticated;
GRANT ALL ON public.class_booking_requests TO service_role;

ALTER TABLE public.class_booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "class_booking_requests_public_insert"
  ON public.class_booking_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(parent_name)) BETWEEN 1 AND 120
    AND length(trim(contact)) BETWEEN 3 AND 120
  );

CREATE POLICY "class_booking_requests_staff_read"
  ON public.class_booking_requests
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );