import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { createDatabaseClient } from '../../../src/lib/supabase.js';
import { isReviewer } from '../../../lib/reviewer';

const REVIEW_STATES = new Set(['approved', 'rejected', 'archived']);

async function authorize() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  return isReviewer(user) ? user : null;
}

export async function GET() {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  const database = createDatabaseClient();
  const { data, error } = await database.from('event_candidates').select('id,source_name,source_url,title,starts_at,date_text,location_text,description,review_status,extracted_at').order('extracted_at', { ascending: false }).limit(150);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data });
}

export async function PATCH(request) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });
  const { id, reviewStatus } = await request.json();
  if (typeof id !== 'string' || !REVIEW_STATES.has(reviewStatus)) return NextResponse.json({ error: 'Invalid review request.' }, { status: 400 });
  const database = createDatabaseClient();
  const { data, error } = await database
    .from('event_candidates')
    .update({ review_status: reviewStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', id)
    .select('id,source_name,source_url,title,starts_at,date_text,location_text,description,review_status,extracted_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidate: data });
}
