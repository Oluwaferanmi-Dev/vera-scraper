import { createClient } from '@supabase/supabase-js';

export function createDatabaseClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function saveCandidates(client, candidates) {
  if (!candidates.length) return 0;
  const { error } = await client.from('event_candidates').upsert(candidates, {
    onConflict: 'source_fingerprint',
    ignoreDuplicates: false,
  });
  if (error) throw new Error(`Failed to save candidates: ${error.message}`);
  return candidates.length;
}

