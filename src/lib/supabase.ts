import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side anon client (safe to use in components)
export const supabase = createClient(url, anon);

// Server-side service-role client (API routes only — never import in client components)
export function getServiceClient() {
  return createClient(url, service, {
    auth: { persistSession: false },
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ForeclosureCase {
  id: string;
  case_number: string;
  county: string;
  property_address: string;
  property_address_normalized: string;
  defendant_names: string[] | null;
  sale_date: string | null;
  sale_price: number | null;
  judgment_amount: number | null;
  estimated_surplus_low: number | null;
  estimated_surplus_high: number | null;
  source: string;
  surplus_confirmed: boolean;
  surplus_confirmed_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedLink {
  token: string;
  case_id: string | null;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  property_address: string | null;
  county: string | null;
  sale_date: string | null;
  sale_price: number | null;
  estimated_surplus_low: number | null;
  estimated_surplus_high: number | null;
  judgment_amount: number | null;
  case_number: string | null;
  ghl_contact_id: string | null;
  source: string;
  expires_at: string;
  created_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  converted_to_contract: boolean;
}

export interface Recovery {
  id: string;
  amount: number;
  county: string;
  recovered_at: string;
  display_name: string | null;
  redacted_client_initials: string | null;
  is_public: boolean;
  created_at: string;
}

export type SearchStatus = 'confirmed' | 'likely' | 'needs_verification' | 'no_match';

export interface SearchResult {
  status: SearchStatus;
  case?: ForeclosureCase;
  county?: string;
  estimated_surplus?: { low: number; high: number };
  next_action: string;
}
