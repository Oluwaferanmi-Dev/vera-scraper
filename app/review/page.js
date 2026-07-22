import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import { isReviewer } from '../../lib/reviewer';
import { ReviewBoard } from './review-board';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (!isReviewer(user)) redirect('/login?reason=not-authorised');
  return <ReviewBoard reviewerEmail={user.email} />;
}
