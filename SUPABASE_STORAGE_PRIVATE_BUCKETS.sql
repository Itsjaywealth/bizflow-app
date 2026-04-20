begin;

update storage.buckets
set public = false
where id in ('client-files', 'staff-documents');

drop policy if exists "Client files read by business owner" on storage.objects;
create policy "Client files read by business owner"
  on storage.objects
  for select
  using (
    bucket_id = 'client-files'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

drop policy if exists "Client files upload by business owner" on storage.objects;
create policy "Client files upload by business owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'client-files'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

drop policy if exists "Client files delete by business owner" on storage.objects;
create policy "Client files delete by business owner"
  on storage.objects
  for delete
  using (
    bucket_id = 'client-files'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

drop policy if exists "Staff documents read by business owner" on storage.objects;
create policy "Staff documents read by business owner"
  on storage.objects
  for select
  using (
    bucket_id = 'staff-documents'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

drop policy if exists "Staff documents upload by business owner" on storage.objects;
create policy "Staff documents upload by business owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'staff-documents'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

drop policy if exists "Staff documents delete by business owner" on storage.objects;
create policy "Staff documents delete by business owner"
  on storage.objects
  for delete
  using (
    bucket_id = 'staff-documents'
    and exists (
      select 1
      from businesses
      where businesses.id::text = split_part(storage.objects.name, '/', 1)
        and businesses.user_id = auth.uid()
    )
  );

commit;
