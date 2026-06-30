SET check_function_bodies = false;
DROP POLICY "Owners can add viewers to their canvas" ON public.canvas_viewers;
DROP POLICY "Owners can view their canvas's viewer list" ON public.canvas_viewers;
CREATE FUNCTION public.is_canvas_owner(check_canvas_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from canvases
    where id = check_canvas_id
    and owner_id = auth.uid()
  );
$function$;
ALTER TABLE public.canvas_viewers ADD CONSTRAINT unique_canvas_viewer UNIQUE (canvas_id, user_id);
GRANT DELETE, INSERT, SELECT, UPDATE ON public.canvas_viewers TO authenticated;
CREATE POLICY "Owners can update viewer permissions" ON public.canvas_viewers FOR UPDATE TO authenticated USING (public.is_canvas_owner(canvas_id)) WITH CHECK (public.is_canvas_owner(canvas_id));
CREATE POLICY "Users can view their own viewer entries" ON public.canvas_viewers FOR SELECT TO authenticated USING ((user_id = auth.uid()));
CREATE POLICY "Owners can add viewers to their canvas" ON public.canvas_viewers FOR INSERT TO authenticated WITH CHECK (public.is_canvas_owner(canvas_id));
CREATE POLICY "Owners can view their canvas's viewer list" ON public.canvas_viewers FOR SELECT TO authenticated USING (public.is_canvas_owner(canvas_id));
GRANT DELETE, INSERT, SELECT, UPDATE ON public.canvases TO authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.pixels TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
