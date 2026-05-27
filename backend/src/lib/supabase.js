import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

let adminClient;

export function getAdminClient() {
  if (!adminClient) {
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
      throw new Error("Supabase admin client is not configured.");
    }
    adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return adminClient;
}

export async function getUserFromToken(accessToken) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return { user: null, error: error?.message ?? "Invalid token" };
  }
  return { user: data.user, error: null };
}
