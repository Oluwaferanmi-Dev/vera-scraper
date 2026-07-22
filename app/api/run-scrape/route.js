import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isReviewer } from '../../../lib/reviewer';

export const dynamic = 'force-dynamic';

async function authorize() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  return isReviewer(user) ? user : null;
}

import { run } from '../../../src/index.js';

export async function POST() {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });

  try {
    const result = await run();
    return NextResponse.json({ message: 'Scrape completed successfully.', details: result });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Could not complete the scraper. Please try again shortly.', message: error.message }, { status: 502 });
  }
}
