import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarCheck,
  Download,
  Inbox,
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  MoreVertical,
  Phone,
  Search,
  SlidersHorizontal,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../../data/siteContent';
import {
  buildWhatsAppUrl,
  formatINR,
  formatINRSum,
  formatShortDate,
  getLocalDateString,
  isFollowUpDueTodayOrOverdue,
  isFollowUpOverdue,
  isNeedsReply,
} from '../../lib/leadUtils';
import {
  ActivityOutcome,
  FollowUpType,
  Lead,
  LeadStatus,
  LostReason,
  insertLeadActivity,
  supabase,
} from '../../lib/supabase';
import { BrandWordmark } from '../ui/BrandMark';
import { FollowUpTypeIcon } from './FollowUpTypeIcon';
import { FollowUpsView } from './FollowUpsView';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { LeadsBoard } from './LeadsBoard';
import { MarkDoneModal } from './MarkDoneModal';

interface AdminDashboardProps {
  userEmail: string;
  onSignOut: () => Promise<void>;
}

type SortOption = 'newest' | 'follow_up' | 'deal_value';
type ViewMode = 'table' | 'board' | 'followups';

const STATUS_FILTERS: ('All' | LeadStatus)[] = [
  'All',
  'New',
  'Contacted',
  'Audit Sent',
  'Proposal',
  'Won',
  'Lost',
];

const BUSINESS_TYPE_FILTERS = [
  'All',
  ...BUSINESS_CATEGORIES.map((c) => c.name),
];

function getStatusBadgeClasses(status: LeadStatus): string {
  switch (status) {
    case 'New':
      return 'bg-[#1D4ED8] text-[#FFFFFF] border-[#1D4ED8]';
    case 'Won':
      return 'bg-[#0A1F5C] text-[#FFFFFF] border-[#0A1F5C]';
    case 'Lost':
      return 'bg-[#F2F7FF] text-[#44546F] border-[#DCEBFF]';
    default:
      return 'bg-[#DCEBFF] text-[#1D4ED8] border-[#DCEBFF]';
  }
}

function getSourceBadgeClasses(source: string): string {
  if (source.toLowerCase() === 'popup') {
    return 'bg-[#DCEBFF] text-[#1D4ED8] border-[#1D4ED8]/25';
  }
  return 'bg-[#F2F7FF] text-[#0A1F5C] border-[#DCEBFF]';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userEmail,
  onSignOut,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const leadsRef = useRef<Lead[]>([]);
  leadsRef.current = leads;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>('All');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [markDoneLeadId, setMarkDoneLeadId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(
    null
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activityVersion, setActivityVersion] = useState(0);

  const todayStr = getLocalDateString();

  useEffect(() => {
    if (!openActionMenuId) return;
    const handleDocClick = () => {
      setOpenActionMenuId(null);
      setConfirmDeleteRowId(null);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [openActionMenuId]);

  const fetchLeads = useCallback(async () => {
    if (!supabase) return;
    setLoadError(null);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(
        'Could not load leads. Ensure your authenticated admin user has SELECT permission on the leads table.'
      );
    } else {
      setLeads((data as Lead[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Supabase Realtime subscription for live lead inserts, updates, and deletes
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('leads-inbox-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => {
            if (prev.some((l) => l.id === newLead.id)) return prev;
            return [newLead, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads' },
        (payload) => {
          const updated = payload.new as Lead;
          setLeads((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leads' },
        (payload) => {
          const removedId = (payload.old as { id: string }).id;
          setLeads((prev) => prev.filter((l) => l.id !== removedId));
          setSelectedLeadId((prev) => (prev === removedId ? null : prev));
          setMarkDoneLeadId((prev) => (prev === removedId ? null : prev));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Summary metrics (6 cards)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    let newToday = 0;
    let followUpsDueTodayAndOverdue = 0;
    let pipelineValue = 0;
    let wonValue = 0;
    let wonCount = 0;

    for (const lead of leads) {
      const createdTs = new Date(lead.created_at).getTime();
      if (createdTs >= startOfToday) newToday++;

      if (isFollowUpDueTodayOrOverdue(lead, todayStr)) {
        followUpsDueTodayAndOverdue++;
      }

      const value = Number(lead.deal_value) || 0;
      if (lead.status === 'Won') {
        wonCount++;
        wonValue += value;
      } else if (lead.status !== 'Lost') {
        pipelineValue += value;
      }
    }

    const total = leads.length;
    const conversionRate =
      total > 0
        ? `${((wonCount / total) * 100).toFixed(1).replace(/\.0$/, '')}%`
        : '0%';

    return {
      total,
      newToday,
      followUpsDueTodayAndOverdue,
      pipelineValue,
      wonValue,
      conversionRate,
    };
  }, [leads, todayStr]);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = leads.filter((lead) => {
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false;
      if (
        businessTypeFilter !== 'All' &&
        lead.business_type !== businessTypeFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        lead.full_name.toLowerCase().includes(q) ||
        lead.business_name.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    if (sortBy === 'follow_up') {
      sorted.sort((a, b) => {
        if (a.follow_up_date && b.follow_up_date) {
          const cmp = a.follow_up_date.localeCompare(b.follow_up_date);
          if (cmp !== 0) return cmp;
        } else if (a.follow_up_date) {
          return -1;
        } else if (b.follow_up_date) {
          return 1;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (sortBy === 'deal_value') {
      sorted.sort((a, b) => {
        const valA = Number(a.deal_value) || 0;
        const valB = Number(b.deal_value) || 0;
        if (valB !== valA) return valB - valA;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return sorted;
  }, [leads, searchQuery, statusFilter, businessTypeFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'All' ||
    businessTypeFilter !== 'All';

  const activeSheetFilterCount =
    (statusFilter !== 'All' ? 1 : 0) +
    (businessTypeFilter !== 'All' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  const markDoneLead = useMemo(
    () => leads.find((l) => l.id === markDoneLeadId) || null,
    [leads, markDoneLeadId]
  );

  const handleOpenLead = async (lead: Lead) => {
    setSelectedLeadId(lead.id);
    if (!lead.is_read && supabase) {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, is_read: true } : l))
      );
      await supabase
        .from('leads')
        .update({ is_read: true })
        .eq('id', lead.id);
    }
  };

  const handleUpdateLead = useCallback(
    async (
      leadId: string,
      updates: Partial<
        Pick<
          Lead,
          | 'status'
          | 'notes'
          | 'follow_up_date'
          | 'next_follow_up_type'
          | 'next_follow_up_note'
          | 'follow_up_count'
          | 'deal_value'
          | 'instagram'
          | 'lost_reason'
          | 'last_contacted_at'
        >
      >
    ) => {
      if (!supabase) return;
      const prevLead = leadsRef.current.find((l) => l.id === leadId);
      const prevStatus = prevLead?.status;

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
      );
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);
      if (error) {
        throw error;
      }

      // Automatically log status changes to lead_activities
      if (updates.status && prevStatus && prevStatus !== updates.status) {
        await insertLeadActivity({
          lead_id: leadId,
          type: 'Status Change',
          outcome: updates.status,
          note: `Status changed from ${prevStatus} to ${updates.status}`,
        });
        setActivityVersion((v) => v + 1);
      }
    },
    []
  );

  const handleMoveLeadStatus = useCallback(
    async (leadId: string, status: LeadStatus) => {
      await handleUpdateLead(leadId, {
        status,
        ...(status !== 'Lost' ? { lost_reason: null } : {}),
      });
    },
    [handleUpdateLead]
  );

  const handleMarkContacted = useCallback(
    (leadId: string) => {
      void handleUpdateLead(leadId, {
        last_contacted_at: new Date().toISOString(),
      });
    },
    [handleUpdateLead]
  );

  const handleSnoozeLead = useCallback(
    async (leadId: string, newDate: string) => {
      await handleUpdateLead(leadId, { follow_up_date: newDate });
    },
    [handleUpdateLead]
  );

  const handleCompleteActivity = useCallback(
    async (
      lead: Lead,
      payload: {
        type: FollowUpType;
        outcome: ActivityOutcome;
        note: string;
      }
    ) => {
      await insertLeadActivity({
        lead_id: lead.id,
        type: payload.type,
        outcome: payload.outcome,
        note: payload.note || null,
      });

      const nextCount = (lead.follow_up_count ?? 0) + 1;
      await handleUpdateLead(lead.id, {
        follow_up_count: nextCount,
        last_contacted_at: new Date().toISOString(),
        follow_up_date: null,
        next_follow_up_note: null,
      });
      setActivityVersion((v) => v + 1);
    },
    [handleUpdateLead]
  );

  const handleScheduleNextFollowUp = useCallback(
    async (
      lead: Lead,
      payload: {
        follow_up_date: string;
        next_follow_up_type: FollowUpType;
        next_follow_up_note: string;
        moveToProposal?: boolean;
      }
    ) => {
      await handleUpdateLead(lead.id, {
        follow_up_date: payload.follow_up_date,
        next_follow_up_type: payload.next_follow_up_type,
        next_follow_up_note: payload.next_follow_up_note || null,
        ...(payload.moveToProposal ? { status: 'Proposal' } : {}),
      });
    },
    [handleUpdateLead]
  );

  const handleMarkLostFromModal = useCallback(
    async (lead: Lead, lostReason: LostReason) => {
      await handleUpdateLead(lead.id, {
        status: 'Lost',
        lost_reason: lostReason,
        follow_up_date: null,
        next_follow_up_note: null,
      });
    },
    [handleUpdateLead]
  );

  const handleMoveToProposalFromModal = useCallback(
    async (lead: Lead) => {
      await handleUpdateLead(lead.id, { status: 'Proposal' });
    },
    [handleUpdateLead]
  );

  const handleDeleteLead = useCallback(async (leadId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
  }, []);

  const exportCsv = (rows: Lead[], filenamePrefix: string) => {
    const headers = [
      'Date',
      'Name',
      'Business',
      'City',
      'Business Type',
      'Phone',
      'Email',
      'Status',
      'Follow-up Date',
      'Follow-up Type',
      'Follow-up Note',
      'Follow-up Count',
      'Deal Value (INR)',
      'Instagram',
      'Lost Reason',
      'Last Contacted At',
      'Source',
      'Message',
      'Notes',
    ];

    const escapeCell = (value: string | number | null | undefined) => {
      const str =
        value === null || value === undefined
          ? ''
          : String(value).replace(/\r?\n/g, ' ');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const lines = [
      headers.join(','),
      ...rows.map((l) =>
        [
          escapeCell(new Date(l.created_at).toISOString()),
          escapeCell(l.full_name),
          escapeCell(l.business_name),
          escapeCell(l.city),
          escapeCell(l.business_type),
          escapeCell(l.phone),
          escapeCell(l.email),
          escapeCell(l.status),
          escapeCell(l.follow_up_date),
          escapeCell(l.next_follow_up_type),
          escapeCell(l.next_follow_up_note),
          escapeCell(l.follow_up_count ?? 0),
          escapeCell(l.deal_value),
          escapeCell(l.instagram),
          escapeCell(l.lost_reason),
          escapeCell(l.last_contacted_at),
          escapeCell(l.source),
          escapeCell(l.message),
          escapeCell(l.notes),
        ].join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSignOutClick = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setBusinessTypeFilter('All');
  };

  return (
    <div className="min-h-[100svh] bg-[#FFFFFF] text-[#44546F] pb-[env(safe-area-inset-bottom)]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 min-h-[64px] pt-[env(safe-area-inset-top)] bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCEBFF] flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <a href="/" aria-label="Go to HotelStory public website" className="shrink-0">
              <BrandWordmark light={false} />
            </a>
            <span aria-hidden="true" className="hidden xs:inline-block h-5 w-px bg-[#DCEBFF]" />
            <span className="font-display font-bold text-sm sm:text-base text-[#0A1F5C] truncate">
              Leads Inbox
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="hidden md:inline text-xs font-medium text-[#44546F] truncate max-w-[200px]">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleSignOutClick}
              disabled={signingOut}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] px-4 py-2 text-xs sm:text-sm font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* 1. Six Compact Summary Cards */}
        <section
          aria-label="Lead Summary Metrics"
          className="grid grid-cols-2 md:grid-cols-3 min-[1025px]:grid-cols-6 gap-3"
        >
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Total Leads
            </p>
            <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              New Today
            </p>
            <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums">
              {stats.newToday}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('followups')}
            className={`min-h-[44px] text-left rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer ${
              viewMode === 'followups'
                ? 'bg-[#F2F7FF] border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 shadow-[0_6px_18px_rgba(29,78,216,0.08)]'
                : 'bg-[#FFFFFF] border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] hover:border-[#1D4ED8]'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Follow-ups Due Today
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums">
                {stats.followUpsDueTodayAndOverdue}
              </p>
              <span className="text-[11px] font-semibold text-[#1D4ED8]">
                Open →
              </span>
            </div>
          </button>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Pipeline Value
            </p>
            <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums truncate">
              {formatINRSum(stats.pipelineValue)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Won Value
            </p>
            <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums truncate">
              {formatINRSum(stats.wonValue)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_6px_18px_rgba(29,78,216,0.04)] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Conversion Rate
            </p>
            <p className="font-display font-extrabold text-xl sm:text-2xl text-[#0A1F5C] tabular-nums">
              {stats.conversionRate}
            </p>
          </div>
        </section>

        {/* 2. Toolbar: Search, Mobile Filter Trigger / Desktop Filters, View Toggle & Export CSV */}
        <section
          aria-label="Filter, Sort and Export Leads"
          className="rounded-2xl bg-[#F2F7FF] border border-[#DCEBFF] p-3 sm:p-3.5 space-y-2.5 xl:space-y-0"
        >
          <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
            {/* Search Row + Mobile Filters Button */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-[#1D4ED8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, business, city..."
                  aria-label="Search leads by name, business, or city"
                  className="w-full min-h-[44px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] pl-10 pr-3.5 py-2 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] px-3.5 py-2 text-sm font-semibold text-[#0A1F5C] shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#1D4ED8]" />
                <span>Filters</span>
                {activeSheetFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#1D4ED8] px-1.5 text-[11px] font-bold text-[#FFFFFF]">
                    {activeSheetFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Inline Filters (Tablet & Desktop) + Scrollable View Toggle */}
            <div className="flex flex-col md:flex-row md:flex-wrap xl:flex-nowrap md:items-center gap-2 shrink-0">
              <div className="hidden md:flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  aria-label="Filter by Status"
                  autoComplete="off"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'All' | LeadStatus)
                  }
                  className="min-h-[44px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-3 py-2 text-xs sm:text-sm font-medium text-[#0A1F5C] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>

                {/* Business Type Filter */}
                <select
                  aria-label="Filter by Business Type"
                  autoComplete="off"
                  value={businessTypeFilter}
                  onChange={(e) => setBusinessTypeFilter(e.target.value)}
                  className="min-h-[44px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-3 py-2 text-xs sm:text-sm font-medium text-[#0A1F5C] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                >
                  {BUSINESS_TYPE_FILTERS.map((type) => (
                    <option key={type} value={type}>
                      {type === 'All' ? 'All Types' : type}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  aria-label="Sort leads"
                  autoComplete="off"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="min-h-[44px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-3 py-2 text-xs sm:text-sm font-medium text-[#0A1F5C] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                >
                  <option value="newest">Newest</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="deal_value">Deal value</option>
                </select>
              </div>

              {/* Table / Board / Follow-ups Toggle (Horizontally Scrollable on Narrow Mobile) */}
              <div className="overflow-x-auto no-scrollbar w-full md:w-auto">
                <div
                  role="group"
                  aria-label="View mode"
                  className="inline-flex rounded-full bg-[#FFFFFF] border border-[#DCEBFF] p-1 min-w-full sm:min-w-0 justify-between sm:justify-start"
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`min-h-[40px] sm:min-h-[38px] inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      viewMode === 'table'
                        ? 'bg-[#1D4ED8] text-[#FFFFFF]'
                        : 'text-[#0A1F5C] hover:text-[#1D4ED8]'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    className={`min-h-[40px] sm:min-h-[38px] inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      viewMode === 'board'
                        ? 'bg-[#1D4ED8] text-[#FFFFFF]'
                        : 'text-[#0A1F5C] hover:text-[#1D4ED8]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Board</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('followups')}
                    className={`min-h-[40px] sm:min-h-[38px] inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      viewMode === 'followups'
                        ? 'bg-[#1D4ED8] text-[#FFFFFF]'
                        : 'text-[#0A1F5C] hover:text-[#1D4ED8]'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Follow-ups</span>
                  </button>
                </div>
              </div>

              {/* Export CSV (Tablet & Desktop) */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    exportCsv(
                      filteredLeads,
                      hasActiveFilters
                        ? 'hotelstory-leads-filtered'
                        : 'hotelstory-leads'
                    )
                  }
                  disabled={filteredLeads.length === 0}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-4 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {hasActiveFilters
                      ? `Export CSV (${filteredLeads.length})`
                      : 'Export CSV'}
                  </span>
                </button>

                {hasActiveFilters && leads.length > filteredLeads.length && (
                  <button
                    type="button"
                    onClick={() => exportCsv(leads, 'hotelstory-leads-all')}
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full border border-[#1D4ED8] bg-[#FFFFFF] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:bg-[#DCEBFF]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Export All ({leads.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Leads Area (Table, Board, or Follow-ups) */}
        <section aria-label="Leads List">
          {loadError && (
            <div
              role="alert"
              className="rounded-2xl border border-[#1D4ED8]/40 bg-[#F2F7FF] p-5 text-sm text-[#0A1F5C] mb-6"
            >
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-14 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#1D4ED8] animate-spin" />
              <p className="text-sm font-medium text-[#44546F]">
                Loading leads inbox...
              </p>
            </div>
          ) : viewMode === 'followups' ? (
            <FollowUpsView
              leads={filteredLeads}
              onOpenLead={handleOpenLead}
              onMarkContacted={handleMarkContacted}
              onOpenMarkDone={(lead) => setMarkDoneLeadId(lead.id)}
              onSnoozeLead={handleSnoozeLead}
            />
          ) : viewMode === 'board' ? (
            <LeadsBoard
              leads={filteredLeads}
              onOpenLead={handleOpenLead}
              onMoveLeadStatus={handleMoveLeadStatus}
            />
          ) : filteredLeads.length === 0 ? (
            <div className="rounded-2xl border border-[#DCEBFF] bg-[#F2F7FF] p-14 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8] mb-4">
                <Inbox className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-lg text-[#0A1F5C] mb-1">
                {leads.length === 0
                  ? 'No leads yet'
                  : 'No leads match your filters'}
              </h2>
              <p className="text-sm text-[#44546F] max-w-sm">
                {leads.length === 0
                  ? 'New enquiries submitted from your audit popup or contact form will appear here in real time.'
                  : 'Try clearing your search query or adjusting the status and business type filters.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-5 rounded-full border border-[#1D4ED8] px-5 py-2 text-xs font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Fixed-Layout Single-Screen Table (1025px+, unchanged) */}
              <div className="hidden min-[1025px]:block rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] shadow-[0_8px_24px_rgba(29,78,216,0.05)]">
                <table className="w-full table-fixed text-left border-collapse">
                  <colgroup>
                    <col className="w-[23%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead className="sticky top-16 z-20">
                    <tr className="border-b border-[#DCEBFF] bg-[#F2F7FF] text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]">
                      <th className="p-3 first:rounded-tl-2xl">Business</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Follow-up</th>
                      <th className="p-3">Deal value</th>
                      <th className="p-3 text-right last:rounded-tr-2xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCEBFF] text-sm">
                    {filteredLeads.map((lead) => {
                      const needsReply = isNeedsReply(lead);
                      const overdue = isFollowUpOverdue(lead, todayStr);
                      const isMenuOpen = openActionMenuId === lead.id;
                      const isConfirmingDelete =
                        confirmDeleteRowId === lead.id;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleOpenLead(lead)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenLead(lead);
                            }
                          }}
                          className={`h-[56px] cursor-pointer transition-colors hover:bg-[#F2F7FF] focus:bg-[#F2F7FF] focus:outline-none ${
                            !lead.is_read ? 'bg-[#F2F7FF]/55' : 'bg-[#FFFFFF]'
                          }`}
                        >
                          {/* 1. Business + Contact Name + Unread Dot */}
                          <td className="px-3 py-2 align-middle">
                            <div className="flex items-center gap-2 min-w-0">
                              {!lead.is_read && (
                                <span
                                  aria-label="New unread lead"
                                  title="New unread lead"
                                  className="w-2 h-2 rounded-full bg-[#1D4ED8] shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p
                                  title={lead.business_name}
                                  className="text-sm font-semibold text-[#0A1F5C] truncate leading-tight"
                                >
                                  {lead.business_name}
                                </p>
                                <p
                                  title={lead.full_name}
                                  className="text-xs text-[#44546F] truncate leading-tight mt-0.5"
                                >
                                  {lead.full_name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. City */}
                          <td className="px-3 py-2 align-middle">
                            <p
                              title={lead.city}
                              className="text-sm text-[#44546F] truncate"
                            >
                              {lead.city}
                            </p>
                          </td>

                          {/* 3. Source Badge */}
                          <td className="px-3 py-2 align-middle">
                            <span
                              title={lead.source}
                              className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize truncate ${getSourceBadgeClasses(
                                lead.source
                              )}`}
                            >
                              {lead.source}
                            </span>
                          </td>

                          {/* 4. Status Badge */}
                          <td className="px-3 py-2 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${getStatusBadgeClasses(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          {/* 5. Follow-up Date + Icon + Overdue / Needs reply tag */}
                          <td className="px-3 py-2 align-middle">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div
                                title={
                                  lead.follow_up_date
                                    ? `${lead.next_follow_up_type || 'Follow-up'}: ${formatShortDate(lead.follow_up_date)}`
                                    : 'No follow-up date'
                                }
                                className="flex items-center gap-1.5 min-w-0"
                              >
                                {lead.follow_up_date && (
                                  <FollowUpTypeIcon
                                    type={lead.next_follow_up_type}
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      overdue
                                        ? 'text-[#DC2626]'
                                        : 'text-[#1D4ED8]'
                                    }`}
                                  />
                                )}
                                <span
                                  className={`text-sm truncate tabular-nums ${
                                    overdue
                                      ? 'font-semibold text-[#DC2626]'
                                      : 'text-[#44546F]'
                                  }`}
                                >
                                  {formatShortDate(lead.follow_up_date)}
                                </span>
                              </div>
                              {(overdue || needsReply) && (
                                <div className="flex flex-wrap items-center gap-1">
                                  {overdue && (
                                    <span className="inline-flex items-center rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-1.5 py-0 text-[10px] font-semibold text-[#DC2626] leading-4">
                                      Overdue
                                    </span>
                                  )}
                                  {needsReply && (
                                    <span className="inline-flex items-center rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-1.5 py-0 text-[10px] font-semibold text-[#C2410C] leading-4">
                                      Needs reply
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Deal Value in ₹ */}
                          <td className="px-3 py-2 align-middle">
                            <p
                              title={formatINR(lead.deal_value)}
                              className="text-sm font-semibold text-[#0A1F5C] tabular-nums truncate"
                            >
                              {formatINR(lead.deal_value)}
                            </p>
                          </td>

                          {/* 7. Actions: Call, WhatsApp & 3-dot Menu (Email, Delete) */}
                          <td
                            className="px-3 py-2 align-middle text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-1.5 relative">
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={() => handleMarkContacted(lead.id)}
                                title={`Call ${lead.phone}`}
                                aria-label={`Call ${lead.full_name}`}
                                className="w-7 h-7 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] inline-flex items-center justify-center text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              <a
                                href={buildWhatsAppUrl(lead)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleMarkContacted(lead.id)}
                                title="WhatsApp"
                                aria-label={`WhatsApp ${lead.full_name}`}
                                className="w-7 h-7 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] inline-flex items-center justify-center text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteRowId(null);
                                  setOpenActionMenuId((prev) =>
                                    prev === lead.id ? null : lead.id
                                  );
                                }}
                                aria-label={`More actions for ${lead.business_name}`}
                                aria-expanded={isMenuOpen}
                                title="More actions"
                                className="w-7 h-7 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] inline-flex items-center justify-center text-[#44546F] hover:border-[#1D4ED8] hover:text-[#0A1F5C] transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] shadow-[0_14px_34px_rgba(10,31,92,0.16)] py-1 z-30 text-left"
                                >
                                  <a
                                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                                      `HotelStory Social Audit – ${lead.business_name}`
                                    )}`}
                                    onClick={() => {
                                      handleMarkContacted(lead.id);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#0A1F5C] hover:bg-[#F2F7FF] hover:text-[#1D4ED8] transition-colors"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-[#1D4ED8]" />
                                    <span>Email</span>
                                  </a>

                                  {!isConfirmingDelete ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmDeleteRowId(lead.id)
                                      }
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  ) : (
                                    <div className="px-3 py-2 border-t border-[#DCEBFF] space-y-1.5 bg-[#FEF2F2]/60">
                                      <p className="text-[11px] font-semibold text-[#991B1B]">
                                        Delete this lead?
                                      </p>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            setOpenActionMenuId(null);
                                            setConfirmDeleteRowId(null);
                                            await handleDeleteLead(lead.id);
                                          }}
                                          className="flex-1 rounded-full bg-[#DC2626] px-2.5 py-1 text-[11px] font-semibold text-[#FFFFFF] hover:bg-[#B91C1C] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteRowId(null)
                                          }
                                          className="rounded-full border border-[#DCEBFF] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#0A1F5C] cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tablet Simplified 4-Column Table (768px to 1024px) */}
              <div className="hidden md:max-[1024px]:block rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] shadow-[0_8px_24px_rgba(29,78,216,0.05)]">
                <table className="w-full table-fixed text-left border-collapse">
                  <colgroup>
                    <col className="w-[36%]" />
                    <col className="w-[18%]" />
                    <col className="w-[22%]" />
                    <col className="w-[24%]" />
                  </colgroup>
                  <thead className="sticky top-16 z-20">
                    <tr className="border-b border-[#DCEBFF] bg-[#F2F7FF] text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]">
                      <th className="p-3 first:rounded-tl-2xl">Business</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Follow-up</th>
                      <th className="p-3 text-right last:rounded-tr-2xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCEBFF] text-sm">
                    {filteredLeads.map((lead) => {
                      const needsReply = isNeedsReply(lead);
                      const overdue = isFollowUpOverdue(lead, todayStr);
                      const isMenuOpen = openActionMenuId === lead.id;
                      const isConfirmingDelete =
                        confirmDeleteRowId === lead.id;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleOpenLead(lead)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenLead(lead);
                            }
                          }}
                          className={`min-h-[60px] cursor-pointer transition-colors hover:bg-[#F2F7FF] focus:bg-[#F2F7FF] focus:outline-none ${
                            !lead.is_read ? 'bg-[#F2F7FF]/55' : 'bg-[#FFFFFF]'
                          }`}
                        >
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex items-center gap-2 min-w-0">
                              {!lead.is_read && (
                                <span
                                  aria-label="New unread lead"
                                  className="w-2 h-2 rounded-full bg-[#1D4ED8] shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#0A1F5C] truncate leading-tight">
                                  {lead.business_name}
                                </p>
                                <p className="text-xs text-[#44546F] truncate leading-tight mt-0.5">
                                  {lead.full_name} · {lead.city}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${getStatusBadgeClasses(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {lead.follow_up_date && (
                                  <FollowUpTypeIcon
                                    type={lead.next_follow_up_type}
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      overdue
                                        ? 'text-[#DC2626]'
                                        : 'text-[#1D4ED8]'
                                    }`}
                                  />
                                )}
                                <span
                                  className={`text-sm truncate tabular-nums ${
                                    overdue
                                      ? 'font-semibold text-[#DC2626]'
                                      : 'text-[#44546F]'
                                  }`}
                                >
                                  {formatShortDate(lead.follow_up_date)}
                                </span>
                              </div>
                              {(overdue || needsReply) && (
                                <div className="flex flex-wrap items-center gap-1">
                                  {overdue && (
                                    <span className="inline-flex items-center rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-1.5 py-0 text-[10px] font-semibold text-[#DC2626] leading-4">
                                      Overdue
                                    </span>
                                  )}
                                  {needsReply && (
                                    <span className="inline-flex items-center rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-1.5 py-0 text-[10px] font-semibold text-[#C2410C] leading-4">
                                      Needs reply
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td
                            className="px-3 py-2.5 align-middle text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-2 relative">
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={() => handleMarkContacted(lead.id)}
                                title={`Call ${lead.phone}`}
                                aria-label={`Call ${lead.full_name}`}
                                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] inline-flex items-center justify-center text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                              </a>

                              <a
                                href={buildWhatsAppUrl(lead)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleMarkContacted(lead.id)}
                                title="WhatsApp"
                                aria-label={`WhatsApp ${lead.full_name}`}
                                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] inline-flex items-center justify-center text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteRowId(null);
                                  setOpenActionMenuId((prev) =>
                                    prev === lead.id ? null : lead.id
                                  );
                                }}
                                aria-label={`More actions for ${lead.business_name}`}
                                aria-expanded={isMenuOpen}
                                title="More actions"
                                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] inline-flex items-center justify-center text-[#44546F] hover:border-[#1D4ED8] hover:text-[#0A1F5C] transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] shadow-[0_14px_34px_rgba(10,31,92,0.16)] py-1 z-30 text-left"
                                >
                                  <a
                                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                                      `HotelStory Social Audit – ${lead.business_name}`
                                    )}`}
                                    onClick={() => {
                                      handleMarkContacted(lead.id);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="min-h-[44px] flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#0A1F5C] hover:bg-[#F2F7FF] hover:text-[#1D4ED8] transition-colors"
                                  >
                                    <Mail className="w-4 h-4 text-[#1D4ED8]" />
                                    <span>Email</span>
                                  </a>

                                  {!isConfirmingDelete ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmDeleteRowId(lead.id)
                                      }
                                      className="w-full min-h-[44px] flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Delete</span>
                                    </button>
                                  ) : (
                                    <div className="px-3 py-2.5 border-t border-[#DCEBFF] space-y-2 bg-[#FEF2F2]/60">
                                      <p className="text-xs font-semibold text-[#991B1B]">
                                        Delete this lead?
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            setOpenActionMenuId(null);
                                            setConfirmDeleteRowId(null);
                                            await handleDeleteLead(lead.id);
                                          }}
                                          className="flex-1 min-h-[38px] rounded-full bg-[#DC2626] px-3 py-1 text-xs font-semibold text-[#FFFFFF] hover:bg-[#B91C1C] cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteRowId(null)
                                          }
                                          className="min-h-[38px] rounded-full border border-[#DCEBFF] bg-[#FFFFFF] px-3 py-1 text-xs font-semibold text-[#0A1F5C] cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards (below 768px) */}
              <div className="md:hidden grid grid-cols-1 gap-3.5">
                {filteredLeads.map((lead) => {
                  const needsReply = isNeedsReply(lead);
                  const overdue = isFollowUpOverdue(lead, todayStr);

                  return (
                    <div
                      key={lead.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenLead(lead)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenLead(lead);
                        }
                      }}
                      className={`text-left rounded-2xl border p-4 transition-all cursor-pointer space-y-3 ${
                        !lead.is_read
                          ? 'bg-[#F2F7FF] border-[#1D4ED8]/50 shadow-[0_8px_24px_rgba(29,78,216,0.08)]'
                          : 'bg-[#FFFFFF] border-[#DCEBFF]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {!lead.is_read && (
                              <span
                                aria-label="New unread lead"
                                className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0"
                              />
                            )}
                            <h3 className="font-display font-bold text-base text-[#0A1F5C] truncate">
                              {lead.business_name}
                            </h3>
                          </div>
                          <p className="text-sm text-[#44546F] truncate mt-0.5">
                            {lead.full_name} · {lead.city}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClasses(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm pt-2 border-t border-[#DCEBFF]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getSourceBadgeClasses(
                              lead.source
                            )}`}
                          >
                            {lead.source}
                          </span>
                          {overdue && (
                            <span className="inline-flex items-center rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#DC2626]">
                              Overdue
                            </span>
                          )}
                          {needsReply && (
                            <span className="inline-flex items-center rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                              Needs reply
                            </span>
                          )}
                        </div>

                        <span className="font-semibold text-[#0A1F5C] tabular-nums">
                          {formatINR(lead.deal_value)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#44546F]">
                        <span className="inline-flex items-center gap-1.5">
                          {lead.follow_up_date && (
                            <FollowUpTypeIcon
                              type={lead.next_follow_up_type}
                              className={`w-3.5 h-3.5 ${
                                overdue ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                              }`}
                            />
                          )}
                          <span>
                            Follow-up:{' '}
                            <strong
                              className={
                                overdue ? 'text-[#DC2626]' : 'text-[#0A1F5C]'
                              }
                            >
                              {formatShortDate(lead.follow_up_date)}
                            </strong>
                          </span>
                        </span>
                      </div>

                      {/* Large Mobile Call & WhatsApp Tap Buttons */}
                      <div
                        className="grid grid-cols-2 gap-2.5 pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={() => handleMarkContacted(lead.id)}
                          className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] py-2.5 px-4 text-sm font-semibold text-[#0A1F5C] active:bg-[#1D4ED8] active:text-[#FFFFFF]"
                        >
                          <Phone className="w-4 h-4 text-[#1D4ED8]" />
                          <span>Call</span>
                        </a>
                        <a
                          href={buildWhatsAppUrl(lead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleMarkContacted(lead.id)}
                          className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] py-2.5 px-4 text-sm font-semibold text-[#0A1F5C] active:bg-[#1D4ED8] active:text-[#FFFFFF]"
                        >
                          <MessageCircle className="w-4 h-4 text-[#1D4ED8]" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFiltersOpen && (
        <div
          onClick={() => setMobileFiltersOpen(false)}
          className="md:hidden fixed inset-0 z-50 flex items-end bg-[#0A1F5C]/50 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter and Sort Leads"
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-[#FFFFFF] border-t border-[#DCEBFF] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 max-h-[85svh] overflow-y-auto shadow-[0_-16px_40px_rgba(10,31,92,0.18)]"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#DCEBFF]">
              <h2 className="font-display font-bold text-lg text-[#0A1F5C]">
                Filter &amp; Sort
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] flex items-center justify-center text-[#0A1F5C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="mobile-filter-status"
                  className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                >
                  Status
                </label>
                <select
                  id="mobile-filter-status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'All' | LeadStatus)
                  }
                  className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base font-medium text-[#0A1F5C]"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="mobile-filter-type"
                  className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                >
                  Business Type
                </label>
                <select
                  id="mobile-filter-type"
                  value={businessTypeFilter}
                  onChange={(e) => setBusinessTypeFilter(e.target.value)}
                  className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base font-medium text-[#0A1F5C]"
                >
                  {BUSINESS_TYPE_FILTERS.map((type) => (
                    <option key={type} value={type}>
                      {type === 'All' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="mobile-filter-sort"
                  className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                >
                  Sort By
                </label>
                <select
                  id="mobile-filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base font-medium text-[#0A1F5C]"
                >
                  <option value="newest">Newest</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="deal_value">Deal value</option>
                </select>
              </div>

              <div className="pt-2 space-y-2.5 border-t border-[#DCEBFF]">
                <button
                  type="button"
                  onClick={() => {
                    exportCsv(
                      filteredLeads,
                      hasActiveFilters
                        ? 'hotelstory-leads-filtered'
                        : 'hotelstory-leads'
                    );
                    setMobileFiltersOpen(false);
                  }}
                  disabled={filteredLeads.length === 0}
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full border border-[#1D4ED8] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#1D4ED8] disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {hasActiveFilters
                      ? `Export Filtered CSV (${filteredLeads.length})`
                      : 'Export CSV'}
                  </span>
                </button>

                {hasActiveFilters && leads.length > filteredLeads.length && (
                  <button
                    type="button"
                    onClick={() => {
                      exportCsv(leads, 'hotelstory-leads-all');
                      setMobileFiltersOpen(false);
                    }}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] px-5 py-3 text-sm font-semibold text-[#0A1F5C] cursor-pointer"
                  >
                    <span>Export All ({leads.length})</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFilters();
                      setSortBy('newest');
                    }}
                    className="min-h-[48px] rounded-full border border-[#DCEBFF] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#44546F] cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="min-h-[48px] rounded-full bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-[#FFFFFF] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Side Panel */}
      <LeadDetailDrawer
        lead={selectedLead}
        activityVersion={activityVersion}
        onClose={() => setSelectedLeadId(null)}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
        onActivityAdded={() => setActivityVersion((v) => v + 1)}
      />

      {/* Mark as Done Two-Step Modal */}
      <MarkDoneModal
        lead={markDoneLead}
        onClose={() => setMarkDoneLeadId(null)}
        onCompleteActivity={handleCompleteActivity}
        onScheduleNextFollowUp={handleScheduleNextFollowUp}
        onMarkLost={handleMarkLostFromModal}
        onMoveToProposal={handleMoveToProposalFromModal}
      />
    </div>
  );
};
