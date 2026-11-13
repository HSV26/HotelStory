import { Lead } from './supabase';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return inrFormatter.format(Number(value));
}

export function formatINRSum(value: number): string {
  return inrFormatter.format(Number.isFinite(value) ? value : 0);
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return value;
  }
}

export function isNeedsReply(lead: Lead, nowMs: number = Date.now()): boolean {
  if (lead.status !== 'New') return false;
  const createdMs = new Date(lead.created_at).getTime();
  if (Number.isNaN(createdMs)) return false;
  return nowMs - createdMs >= 24 * 60 * 60 * 1000;
}

export function isFollowUpOverdue(
  lead: Lead,
  todayStr: string = getLocalDateString()
): boolean {
  if (!lead.follow_up_date) return false;
  if (lead.status === 'Won' || lead.status === 'Lost') return false;
  return lead.follow_up_date < todayStr;
}

export function isFollowUpDueToday(
  lead: Lead,
  todayStr: string = getLocalDateString()
): boolean {
  if (!lead.follow_up_date) return false;
  if (lead.status === 'Won' || lead.status === 'Lost') return false;
  return lead.follow_up_date === todayStr;
}

export function normalizeInstagramHandle(
  raw: string | null | undefined
): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@+/, '')
    .split(/[/?#]/)[0]
    .trim();
}

export function formatLastContactedLabel(
  iso: string | null | undefined
): string {
  if (!iso) return 'Last contacted: Never';
  const contactedDate = new Date(iso);
  if (Number.isNaN(contactedDate.getTime())) return 'Last contacted: Never';

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfContacted = new Date(
    contactedDate.getFullYear(),
    contactedDate.getMonth(),
    contactedDate.getDate()
  ).getTime();

  const diffDays = Math.max(
    0,
    Math.floor((startOfToday - startOfContacted) / (24 * 60 * 60 * 1000))
  );

  if (diffDays === 1) return 'Last contacted: 1 day ago';
  return `Last contacted: ${diffDays} days ago`;
}

export function isFollowUpDueTodayOrOverdue(
  lead: Lead,
  todayStr: string = getLocalDateString()
): boolean {
  if (!lead.follow_up_date) return false;
  if (lead.status === 'Won' || lead.status === 'Lost') return false;
  return lead.follow_up_date <= todayStr;
}

export function getDaysOverdue(
  followUpDate: string | null | undefined,
  todayStr: string = getLocalDateString()
): number {
  if (!followUpDate || followUpDate >= todayStr) return 0;
  const due = new Date(`${followUpDate}T00:00:00`).getTime();
  const today = new Date(`${todayStr}T00:00:00`).getTime();
  if (Number.isNaN(due) || Number.isNaN(today)) return 0;
  return Math.max(0, Math.round((today - due) / (24 * 60 * 60 * 1000)));
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  return formatShortDate(iso);
}

export function buildWhatsAppUrl(lead: Lead): string {
  const digits = lead.phone.replace(/\D/g, '');
  if (!digits) return '#';
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${lead.full_name}, thank you for connecting with HotelStory for ${lead.business_name}.`
  )}`;
}

export function isStatusEarlierThanProposal(status: string): boolean {
  return status === 'New' || status === 'Contacted' || status === 'Audit Sent';
}
