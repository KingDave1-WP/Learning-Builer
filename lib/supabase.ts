import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// For teacher pages (login, dashboard, saving). Runs in the browser and
// keeps the login session. Row-level security means a teacher can only
// ever see and change their own activities.
export function createBrowserSupabase() {
  return createBrowserClient(url, key);
}

// For the public student page. No login and no session: it can only
// read activities that are published.
export function createPublicSupabase() {
  return createClient(url, key, { auth: { persistSession: false } });
}