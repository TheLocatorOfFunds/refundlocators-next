import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import PersonalizedClient from './PersonalizedClient';
import type { PersonalizedLink } from '@/lib/supabase';
import './pass.css';
import './lauren-ai.css';

// Server-side fetch — uses service role key
function getDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const db = getDB();
  const { data } = await db
    .from('personalized_links')
    .select('first_name')
    .eq('token', token)
    .single();

  if (!data) {
    return { title: 'FundLocators' };
  }
  return {
    title: `${data.first_name} — FundLocators`,
    robots: { index: false, follow: false }, // never index personal pages
  };
}

export default async function PersonalizedPage({ params }: Props) {
  const { token } = await params;
  const db = getDB();

  const { data: link } = await db
    .from('personalized_links')
    .select('*')
    .eq('token', token)
    .single();

  // Not found or expired
  if (!link) return notFound();
  if (new Date(link.expires_at) < new Date()) return notFound();

  // Record the view (fire-and-forget)
  db.from('personalized_links')
    .update({
      view_count: (link.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
      first_viewed_at: link.first_viewed_at ?? new Date().toISOString(),
    })
    .eq('token', token)
    .then(() => null);

  return <PersonalizedClient link={link as PersonalizedLink} />;
}
