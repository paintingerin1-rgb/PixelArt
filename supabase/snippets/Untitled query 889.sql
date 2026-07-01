drop policy "Users can insert their own pixels" on pixels;

create policy "Owners and editors can insert pixels"
on pixels for insert
to authenticated
with check (
  canvas_id in (select id from canvases where owner_id = auth.uid())
  or
  canvas_id in (select canvas_id from canvas_viewers where user_id = auth.uid() and can_edit = true)
);

drop policy "Users can update their own pixels" on pixels;

create policy "Owners and editors can update pixels"
on pixels for update
to authenticated
using (
  canvas_id in (select id from canvases where owner_id = auth.uid())
  or
  canvas_id in (select canvas_id from canvas_viewers where user_id = auth.uid() and can_edit = true)
);