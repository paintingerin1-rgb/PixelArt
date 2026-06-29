SET check_function_bodies = false;
CREATE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$function$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TABLE public.canvas_viewers (id uuid DEFAULT gen_random_uuid() NOT NULL, canvas_id uuid NOT NULL, user_id uuid NOT NULL, can_edit boolean DEFAULT false NOT NULL, created_at timestamp with time zone DEFAULT now());
ALTER TABLE public.canvas_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_viewers ADD CONSTRAINT canvas_viewers_pkey PRIMARY KEY (id);
ALTER TABLE public.canvas_viewers ADD CONSTRAINT canvas_viewers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvas_viewers TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvas_viewers TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvas_viewers TO service_role;
CREATE TABLE public.canvases (id uuid DEFAULT gen_random_uuid() NOT NULL, name text, owner_id uuid, created_at timestamp with time zone DEFAULT now(), size integer DEFAULT 16, is_public boolean DEFAULT false);
CREATE POLICY "Owners can add viewers to their canvas" ON public.canvas_viewers FOR INSERT TO authenticated WITH CHECK ((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))));
CREATE POLICY "Owners can view their canvas's viewer list" ON public.canvas_viewers FOR SELECT TO authenticated USING ((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))));
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvases ADD CONSTRAINT canvases_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id);
ALTER TABLE public.canvases ADD CONSTRAINT canvases_pkey PRIMARY KEY (id);
ALTER TABLE public.canvas_viewers ADD CONSTRAINT canvas_viewers_canvas_id_fkey FOREIGN KEY (canvas_id) REFERENCES public.canvases(id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvases TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvases TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.canvases TO service_role;
CREATE POLICY "Users can create their own canvas" ON public.canvases FOR INSERT TO authenticated WITH CHECK ((owner_id = auth.uid()));
CREATE POLICY "Users can view their own canvas" ON public.canvases FOR SELECT TO authenticated USING ((owner_id = auth.uid()));
CREATE POLICY "Viewers can see canvases they've been added to" ON public.canvases FOR SELECT TO authenticated USING ((id IN ( SELECT canvas_viewers.canvas_id
   FROM public.canvas_viewers
  WHERE (canvas_viewers.user_id = auth.uid()))));
CREATE TABLE public.pixels (id uuid DEFAULT gen_random_uuid() NOT NULL, canvas_id uuid, x integer, y integer, colour text, placed_by uuid, placed_at timestamp with time zone DEFAULT now());
ALTER TABLE public.pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pixels ADD CONSTRAINT pixels_canvas_id_fkey FOREIGN KEY (canvas_id) REFERENCES public.canvases(id);
ALTER TABLE public.pixels ADD CONSTRAINT pixels_pkey PRIMARY KEY (id);
ALTER TABLE public.pixels ADD CONSTRAINT pixels_placed_by_fkey FOREIGN KEY (placed_by) REFERENCES auth.users(id);
ALTER TABLE public.pixels ADD CONSTRAINT unique_pixel_position UNIQUE (canvas_id, x, y);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pixels TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pixels TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.pixels TO service_role;
CREATE POLICY "Users can insert their own pixels" ON public.pixels FOR INSERT TO authenticated WITH CHECK ((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))));
CREATE POLICY "Users can update their own pixels" ON public.pixels FOR UPDATE TO authenticated USING ((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))));
CREATE POLICY "Users can view their own pixels" ON public.pixels FOR SELECT TO authenticated USING ((canvas_id IN ( SELECT canvases.id
   FROM public.canvases
  WHERE (canvases.owner_id = auth.uid()))));
CREATE POLICY "Viewers can see pixels on canvases they've been added to" ON public.pixels FOR SELECT TO authenticated USING ((canvas_id IN ( SELECT canvas_viewers.canvas_id
   FROM public.canvas_viewers
  WHERE (canvas_viewers.user_id = auth.uid()))));
CREATE TABLE public.profiles (id uuid NOT NULL, email text, created_at timestamp with time zone DEFAULT now());
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.profiles TO service_role;
CREATE POLICY "Authenticated users can search profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
