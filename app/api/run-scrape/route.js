import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isReviewer } from '../../../lib/reviewer';

export const dynamic = 'force-dynamic';

async function authorize() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  return isReviewer(user) ? user : null;
}

export async function POST() {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Not authorised.' }, { status: 403 });

  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_ACTIONS_TOKEN;
  const ref = process.env.GITHUB_WORKFLOW_REF || 'main';
  if (!repository || !token || !/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    return NextResponse.json({ error: 'Manual scraping has not been configured yet.' }, { status: 503 });
  }

  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/scrape-events.yml/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ ref }),
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`GitHub workflow dispatch failed: ${response.status}`);
    return NextResponse.json({ error: 'Could not start the scraper. Please try again shortly.' }, { status: 502 });
  }
  return NextResponse.json({ message: 'Scrape started. New candidates should appear in a few minutes.' });
}
