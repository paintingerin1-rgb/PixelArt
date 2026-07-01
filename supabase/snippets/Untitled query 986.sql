alter table canvas_viewers
add constraint canvas_viewers_user_id_profiles_fkey
foreign key (user_id) references public.profiles(id);