DROP POLICY "Users can insert their own pixels" ON public.pixels;
DROP POLICY "Users can update their own pixels" ON public.pixels;
ALTER TABLE public.canvas_viewers ADD CONSTRAINT canvas_viewers_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
CREATE POLICY "Owners and editors can insert pixels" ON public.pixels FOR INSERT TO authenticated WITH CHECK (((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))) OR (canvas_id IN ( SELECT canvas_viewers.canvas_id
   FROM public.canvas_viewers
  WHERE ((canvas_viewers.user_id = auth.uid()) AND (canvas_viewers.can_edit = true))))));
CREATE POLICY "Owners and editors can update pixels" ON public.pixels FOR UPDATE TO authenticated USING (((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))) OR (canvas_id IN ( SELECT canvas_viewers.canvas_id
   FROM public.canvas_viewers
  WHERE ((canvas_viewers.user_id = auth.uid()) AND (canvas_viewers.can_edit = true))))));
