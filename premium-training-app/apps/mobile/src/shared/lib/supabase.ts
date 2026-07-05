import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@shared/types/database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in your project credentials."
  );
}

/**
 * Typed Supabase client, generic over the generated `Database` type so every
 * `.from("table")` call is fully typed end-to-end (columns, relationships,
 * insert/update payload shapes). Regenerate types after every migration:
 *
 *   supabase gen types typescript --project-id <id> > src/shared/types/database.types.ts
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
