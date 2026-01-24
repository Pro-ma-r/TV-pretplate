# Tvornica vjenčanja – DB

Ovaj folder je **jedini izvor istine** za DB logiku (permissions, funkcije, constrainti, viewovi).

## Redoslijed izvođenja (iz nule)

1. `db/migrations/001_init.sql`  
2. `db/migrations/002_constraints.sql`  
3. `db/migrations/003_triggers.sql`  
4. `db/migrations/004_functions.sql`  
5. `db/migrations/005_views_core.sql`  
6. `db/migrations/006_views_web.sql`  
7. `db/migrations/007_dashboard.sql`  
8. `db/roles/permissions.sql`

## Pravilo

- Promjene se prvo rade u SQL fileovima i committaju.
- Tek nakon toga se primjenjuju na Supabase.
- Aplikacija koristi VIEW-ove i RPC funkcije (ne tablice).
