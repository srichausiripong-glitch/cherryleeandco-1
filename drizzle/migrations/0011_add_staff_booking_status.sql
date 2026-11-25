ALTER TABLE public.class_booking_requests ADD COLUMN status text NOT NULL DEFAULT 'new';
ALTER TABLE public.class_booking_requests ADD CONSTRAINT class_booking_requests_status_allowed CHECK (status IN ('new','contacted','confirmed','closed'));
ALTER POLICY class_booking_requests_public_insert ON public.class_booking_requests WITH CHECK (status = 'new' AND length(trim(parent_name)) BETWEEN 1 AND 120 AND length(trim(contact)) BETWEEN 3 AND 120);
REVOKE UPDATE ON public.class_booking_requests FROM anon, authenticated;
GRANT UPDATE (status) ON public.class_booking_requests TO authenticated;
CREATE POLICY class_booking_requests_staff_update ON public.class_booking_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'teacher'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE INDEX class_booking_requests_created_at_idx ON public.class_booking_requests (created_at DESC);