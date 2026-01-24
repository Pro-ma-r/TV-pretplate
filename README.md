# Tvornica vjenčanja – Admin

## Setup
1) Kopiraj `.env.example` u `.env.local`
2) Upiši:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Run
npm install
npm run dev

## Role
User metadata `role`:
- admin: može kreirati pretplate + isključiti
- user: može samo isključiti

## Data sources
Koristi VIEW-ove:
- dashboard_stats
- dashboard_packages
- dashboard_activities
- subscriptions_with_status
