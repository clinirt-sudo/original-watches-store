Run the migration to add `new_arrival` boolean column to `ecom_products`.

Options:

1) Supabase CLI (recommended)

```bash
# from project root
supabase db query "ALTER TABLE public.ecom_products ADD COLUMN IF NOT EXISTS new_arrival boolean DEFAULT false;"
# or run the SQL file
supabase db query < scripts/001_add_new_arrival_column.sql
```

2) psql using DATABASE_URL

```bash
# set DATABASE_URL env var or replace it inline
psql "$DATABASE_URL" -c "ALTER TABLE public.ecom_products ADD COLUMN IF NOT EXISTS new_arrival boolean DEFAULT false;"
```

3) Run in Supabase SQL editor

Copy the contents of `scripts/001_add_new_arrival_column.sql` and run it in the SQL editor in your Supabase project.

After running the migration:

- Re-open the Admin → Products list and edit a product; the "Mark as New Arrival" checkbox should reflect the saved value.
- Create or edit a product and set `new_arrival` to true; it should appear in the Home "Our Latest Products" section.

If you'd like, I can try to run the migration for you if you provide secure access or run it via a connected CI step. Otherwise run one of the commands above and tell me the result and I'll proceed to verify and fix any remaining UI issues.