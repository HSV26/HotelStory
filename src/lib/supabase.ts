import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * ----------------------
 * Reads ONLY the public project URL and publishable anon key from Vite env vars.
 * NEVER expose or reference the `service_role` key in frontend code.
 *
 * Security relies on Supabase Row Level Security (RLS):
 * - Public (`anon`) role: INSERT allowed on `leads` (no SELECT/UPDATE/DELETE).
 * - Authenticated admin role: SELECT, UPDATE, DELETE allowed on `leads`.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Audit Sent'
  | 'Proposal'
  | 'Won'
  | 'Lost';

export type LostReason =
  | 'Price'
  | 'No response'
  | 'Chose another agency'
  | 'Not ready'
  | 'Other';

export const LOST_REASONS: LostReason[] = [
  'Price',
  'No response',
  'Chose another agency',
  'Not ready',
  'Other',
];

export type LeadSource = 'popup' | 'contact form';

export type FollowUpType = 'Call' | 'WhatsApp' | 'Meeting' | 'Email';

export const FOLLOW_UP_TYPES: FollowUpType[] = [
  'Call',
  'WhatsApp',
  'Meeting',
  'Email',
];

export type ActivityType =
  | FollowUpType
  | 'Note'
  | 'Status Change'
  | 'Created';

export type ActivityOutcome =
  | 'Spoke'
  | 'No answer'
  | 'Sent proposal'
  | 'Sent audit'
  | 'Meeting done'
  | 'Interested'
  | 'Not interested'
  | 'Other';

export const ACTIVITY_OUTCOMES: ActivityOutcome[] = [
  'Spoke',
  'No answer',
  'Sent proposal',
  'Sent audit',
  'Meeting done',
  'Interested',
  'Not interested',
  'Other',
];

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType | string;
  outcome: string | null;
  note: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  business_type: string;
  message: string | null;
  source: LeadSource | string;
  status: LeadStatus;
  notes: string | null;
  is_read: boolean;
  created_at: string;
  follow_up_date: string | null;
  deal_value: number | null;
  instagram: string | null;
  lost_reason: LostReason | string | null;
  last_contacted_at: string | null;
  next_follow_up_type: FollowUpType | string | null;
  next_follow_up_note: string | null;
  follow_up_count: number | null;
}

export interface NewLeadInput {
  full_name: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  business_type: string;
  message?: string;
  source: LeadSource;
}

/**
 * Inserts a new lead into Supabase `leads` table.
 * IMPORTANT: Because public visitors do not have SELECT permission on `leads`,
 * we must NOT chain `.select()` after `.insert()`.
 */
export async function insertLead(
  lead: NewLeadInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      ok: false,
      error:
        'Database connection is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { error } = await supabase.from('leads').insert([
    {
      full_name: lead.full_name,
      business_name: lead.business_name,
      city: lead.city,
      phone: lead.phone,
      email: lead.email,
      business_type: lead.business_type,
      message: lead.message?.trim() || '',
      source: lead.source,
      status: 'New',
      notes: '',
      is_read: false,
    },
  ]);

  if (error) {
    return {
      ok: false,
      error:
        'We could not save your request right now. Please try again in a moment.',
    };
  }

  return { ok: true };
}

export async function insertLeadActivity(input: {
  lead_id: string;
  type: ActivityType | string;
  outcome?: string | null;
  note?: string | null;
}): Promise<LeadActivity | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('lead_activities')
    .insert([
      {
        lead_id: input.lead_id,
        type: input.type,
        outcome: input.outcome ?? null,
        note: input.note ?? null,
      },
    ])
    .select('*')
    .single();

  if (error) {
    return null;
  }

  return data as LeadActivity;
}
