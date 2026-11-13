import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Repeat,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  addDaysToToday,
  formatLastContactedLabel,
  formatRelativeTime,
  formatShortDate,
  normalizeInstagramHandle,
} from '../../lib/leadUtils';
import {
  FOLLOW_UP_TYPES,
  FollowUpType,
  LOST_REASONS,
  Lead,
  LeadActivity,
  LeadStatus,
  LostReason,
  insertLeadActivity,
  supabase,
} from '../../lib/supabase';
import { FollowUpTypeIcon } from './FollowUpTypeIcon';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  activityVersion: number;
  onClose: () => void;
  onUpdateLead: (
    leadId: string,
    updates: Partial<
      Pick<
        Lead,
        | 'status'
        | 'notes'
        | 'follow_up_date'
        | 'next_follow_up_type'
        | 'next_follow_up_note'
        | 'deal_value'
        | 'instagram'
        | 'lost_reason'
        | 'last_contacted_at'
      >
    >
  ) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
  onActivityAdded: () => void;
}

const STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Audit Sent',
  'Proposal',
  'Won',
  'Lost',
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  activityVersion,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onActivityAdded,
}) => {
  const [notesDraft, setNotesDraft] = useState('');
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [followUpTypeDraft, setFollowUpTypeDraft] =
    useState<FollowUpType>('Call');
  const [followUpNoteDraft, setFollowUpNoteDraft] = useState('');
  const [dealValueDraft, setDealValueDraft] = useState('');
  const [instagramDraft, setInstagramDraft] = useState('');

  const [notesSaveState, setNotesSaveState] = useState<SaveState>('idle');
  const [followUpSaveState, setFollowUpSaveState] = useState<SaveState>('idle');
  const [detailsSaveState, setDetailsSaveState] = useState<SaveState>('idle');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [suggestedFollowUp, setSuggestedFollowUp] = useState<string | null>(
    null
  );

  // Activity timeline & Add Note box
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState('');
  const [savingActivityNote, setSavingActivityNote] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const lastSavedNotesRef = useRef<string>('');
  const lastSavedFollowUpNoteRef = useRef<string>('');
  const lastSavedDealRef = useRef<string>('');
  const lastSavedInstagramRef = useRef<string>('');
  const activeLeadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lead) {
      activeLeadIdRef.current = lead.id;

      const initialNotes = lead.notes || '';
      const initialFollowUp = lead.follow_up_date || '';
      const initialFollowUpType = FOLLOW_UP_TYPES.includes(
        lead.next_follow_up_type as FollowUpType
      )
        ? (lead.next_follow_up_type as FollowUpType)
        : 'Call';
      const initialFollowUpNote = lead.next_follow_up_note || '';
      const initialDeal =
        lead.deal_value !== null && lead.deal_value !== undefined
          ? String(lead.deal_value)
          : '';
      const initialInstagram = lead.instagram || '';

      setNotesDraft(initialNotes);
      setFollowUpDraft(initialFollowUp);
      setFollowUpTypeDraft(initialFollowUpType);
      setFollowUpNoteDraft(initialFollowUpNote);
      setDealValueDraft(initialDeal);
      setInstagramDraft(initialInstagram);

      lastSavedNotesRef.current = initialNotes;
      lastSavedFollowUpNoteRef.current = initialFollowUpNote;
      lastSavedDealRef.current = initialDeal;
      lastSavedInstagramRef.current = initialInstagram;

      setNotesSaveState('idle');
      setFollowUpSaveState('idle');
      setDetailsSaveState('idle');
      setSuggestedFollowUp(null);
      setNewActivityNote('');
      setConfirmingDelete(false);
    } else {
      activeLeadIdRef.current = null;
      setActivities([]);
    }
  }, [lead?.id]);

  // Keep follow-up fields synced if updated externally (e.g. Mark Done / Snooze / Realtime)
  useEffect(() => {
    if (lead) {
      setFollowUpDraft(lead.follow_up_date || '');
      const syncedType = FOLLOW_UP_TYPES.includes(
        lead.next_follow_up_type as FollowUpType
      )
        ? (lead.next_follow_up_type as FollowUpType)
        : 'Call';
      setFollowUpTypeDraft(syncedType);
      const syncedNote = lead.next_follow_up_note || '';
      setFollowUpNoteDraft(syncedNote);
      lastSavedFollowUpNoteRef.current = syncedNote;
    }
  }, [
    lead?.follow_up_date,
    lead?.next_follow_up_type,
    lead?.next_follow_up_note,
  ]);

  // Fetch activity timeline for the open lead
  useEffect(() => {
    if (!lead || !supabase) return;
    let active = true;
    setLoadingActivities(true);

    supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          setActivities(data as LeadActivity[]);
        }
        setLoadingActivities(false);
      });

    return () => {
      active = false;
    };
  }, [lead?.id, activityVersion]);

  // Escape key closes drawer
  useEffect(() => {
    if (!lead) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [lead, onClose]);

  // Debounced auto-save for internal notes
  useEffect(() => {
    if (!lead) return;
    if (notesDraft === lastSavedNotesRef.current) return;

    setNotesSaveState('saving');
    const leadId = lead.id;
    const timer = window.setTimeout(async () => {
      try {
        await onUpdateLead(leadId, { notes: notesDraft });
        if (activeLeadIdRef.current === leadId) {
          lastSavedNotesRef.current = notesDraft;
          setNotesSaveState('saved');
        }
      } catch {
        if (activeLeadIdRef.current === leadId) {
          setNotesSaveState('error');
        }
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [notesDraft, lead, onUpdateLead]);

  // Debounced auto-save for Next follow-up purpose note
  useEffect(() => {
    if (!lead) return;
    if (followUpNoteDraft === lastSavedFollowUpNoteRef.current) return;

    setFollowUpSaveState('saving');
    const leadId = lead.id;
    const timer = window.setTimeout(async () => {
      try {
        await onUpdateLead(leadId, {
          next_follow_up_note: followUpNoteDraft.trim() || null,
        });
        if (activeLeadIdRef.current === leadId) {
          lastSavedFollowUpNoteRef.current = followUpNoteDraft;
          setFollowUpSaveState('saved');
        }
      } catch {
        if (activeLeadIdRef.current === leadId) {
          setFollowUpSaveState('error');
        }
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [followUpNoteDraft, lead, onUpdateLead]);

  // Debounced auto-save for Deal Value & Instagram
  useEffect(() => {
    if (!lead) return;
    const dealChanged = dealValueDraft !== lastSavedDealRef.current;
    const igChanged = instagramDraft !== lastSavedInstagramRef.current;
    if (!dealChanged && !igChanged) return;

    setDetailsSaveState('saving');
    const leadId = lead.id;
    const timer = window.setTimeout(async () => {
      const parsedDeal =
        dealValueDraft.trim() === '' ? null : Number(dealValueDraft);
      const validDeal =
        parsedDeal !== null && !Number.isNaN(parsedDeal) && parsedDeal >= 0
          ? parsedDeal
          : null;
      const cleanIg = instagramDraft.trim() || null;

      try {
        await onUpdateLead(leadId, {
          deal_value: validDeal,
          instagram: cleanIg,
        });
        if (activeLeadIdRef.current === leadId) {
          lastSavedDealRef.current = dealValueDraft;
          lastSavedInstagramRef.current = instagramDraft;
          setDetailsSaveState('saved');
        }
      } catch {
        if (activeLeadIdRef.current === leadId) {
          setDetailsSaveState('error');
        }
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [dealValueDraft, instagramDraft, lead, onUpdateLead]);

  const handleNotesBlur = async () => {
    if (!lead || notesDraft === lastSavedNotesRef.current) return;
    setNotesSaveState('saving');
    try {
      await onUpdateLead(lead.id, { notes: notesDraft });
      lastSavedNotesRef.current = notesDraft;
      setNotesSaveState('saved');
    } catch {
      setNotesSaveState('error');
    }
  };

  const handleFollowUpDateChange = async (nextDate: string) => {
    if (!lead) return;
    setFollowUpDraft(nextDate);
    setSuggestedFollowUp(null);
    setFollowUpSaveState('saving');
    try {
      await onUpdateLead(lead.id, {
        follow_up_date: nextDate || null,
        next_follow_up_type: followUpTypeDraft,
      });
      if (activeLeadIdRef.current === lead.id) {
        setFollowUpSaveState('saved');
      }
    } catch {
      if (activeLeadIdRef.current === lead.id) {
        setFollowUpSaveState('error');
      }
    }
  };

  const handleFollowUpTypeChange = async (nextType: FollowUpType) => {
    if (!lead) return;
    setFollowUpTypeDraft(nextType);
    setFollowUpSaveState('saving');
    try {
      await onUpdateLead(lead.id, { next_follow_up_type: nextType });
      if (activeLeadIdRef.current === lead.id) {
        setFollowUpSaveState('saved');
      }
    } catch {
      if (activeLeadIdRef.current === lead.id) {
        setFollowUpSaveState('error');
      }
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || statusUpdating) return;
    const prevStatus = lead.status;
    setStatusUpdating(true);

    if (prevStatus === 'New' && newStatus !== 'New' && !followUpDraft) {
      setSuggestedFollowUp(addDaysToToday(2));
    }

    try {
      await onUpdateLead(lead.id, {
        status: newStatus,
        ...(newStatus !== 'Lost' ? { lost_reason: null } : {}),
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleLostReasonChange = async (reason: LostReason | '') => {
    if (!lead || !reason) return;
    setDetailsSaveState('saving');
    try {
      await onUpdateLead(lead.id, { lost_reason: reason });
      if (activeLeadIdRef.current === lead.id) {
        setDetailsSaveState('saved');
      }
    } catch {
      if (activeLeadIdRef.current === lead.id) {
        setDetailsSaveState('error');
      }
    }
  };

  const handleQuickActionContacted = () => {
    if (!lead) return;
    const nowIso = new Date().toISOString();
    void onUpdateLead(lead.id, { last_contacted_at: nowIso });
  };

  const handleAddActivityNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || savingActivityNote || !newActivityNote.trim()) return;
    setSavingActivityNote(true);
    try {
      const inserted = await insertLeadActivity({
        lead_id: lead.id,
        type: 'Note',
        note: newActivityNote.trim(),
      });
      if (inserted) {
        setActivities((prev) => [inserted, ...prev]);
        setNewActivityNote('');
        onActivityAdded();
      }
    } finally {
      setSavingActivityNote(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!lead || deleting) return;
    setDeleting(true);
    try {
      await onDeleteLead(lead.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  // Ensure a "Lead created" entry always appears in the timeline
  const timelineItems = useMemo<LeadActivity[]>(() => {
    if (!lead) return [];
    const hasCreated = activities.some((a) => a.type === 'Created');
    if (hasCreated) return activities;

    const createdItem: LeadActivity = {
      id: `created-${lead.id}`,
      lead_id: lead.id,
      type: 'Created',
      outcome: lead.source,
      note: `Lead created via ${lead.source}`,
      created_at: lead.created_at,
    };
    return [...activities, createdItem].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities, lead]);

  const formatDateTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const whatsappDigits = lead ? lead.phone.replace(/\D/g, '') : '';
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Hi ${lead?.full_name || ''}, thank you for requesting a free social audit with HotelStory for ${lead?.business_name || 'your brand'}.`
      )}`
    : '#';

  const cleanInstagram = normalizeInstagramHandle(instagramDraft);
  const followUpCount = lead?.follow_up_count ?? 0;

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-[#0A1F5C]/50 backdrop-blur-sm"
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-lead-name"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-full sm:max-w-lg h-full bg-[#FFFFFF] sm:border-l border-[#DCEBFF] shadow-[-20px_0_60px_rgba(10,31,92,0.18)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:py-5 border-b border-[#DCEBFF] flex items-start justify-between gap-3 bg-[#F2F7FF] shrink-0">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden min-h-[44px] -ml-2 px-2 mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Leads</span>
                </button>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1D4ED8] mb-1">
                  <span>{lead.business_type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{lead.source}</span>
                </div>
                <h2
                  id="drawer-lead-name"
                  className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#0A1F5C] truncate"
                >
                  {lead.full_name}
                </h2>
                <p className="text-sm font-medium text-[#44546F] mt-0.5 truncate">
                  {lead.business_name}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close lead details"
                className="hidden sm:flex w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] items-center justify-center text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Quick Actions + Follow-up Count & Last Contacted */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1F5C]">
                    <Repeat className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>
                      Followed up {followUpCount}{' '}
                      {followUpCount === 1 ? 'time' : 'times'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D4ED8]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatLastContactedLabel(lead.last_contacted_at)}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={handleQuickActionContacted}
                    className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>Call</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleQuickActionContacted}
                    className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                      `HotelStory Social Audit – ${lead.business_name}`
                    )}`}
                    onClick={handleQuickActionContacted}
                    className="min-h-[46px] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Pipeline Status + Required Lost Reason */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#F2F7FF] p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="drawer-status-select"
                      className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]"
                    >
                      Pipeline Status
                    </label>
                    {statusUpdating && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </span>
                    )}
                  </div>
                  <select
                    id="drawer-status-select"
                    value={lead.status}
                    disabled={statusUpdating}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as LeadStatus)
                    }
                    className="w-full min-h-[46px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm font-semibold text-[#0A1F5C] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {lead.status === 'Lost' && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="drawer-lost-reason"
                        className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]"
                      >
                        Lost Reason <span className="text-[#DC2626]">*</span>
                      </label>
                      {!lead.lost_reason && (
                        <span className="text-[11px] font-semibold text-[#DC2626]">
                          Required
                        </span>
                      )}
                    </div>
                    <select
                      id="drawer-lost-reason"
                      required
                      value={lead.lost_reason || ''}
                      onChange={(e) =>
                        handleLostReasonChange(
                          e.target.value as LostReason | ''
                        )
                      }
                      className={`w-full min-h-[46px] rounded-xl bg-[#FFFFFF] border px-3.5 py-2.5 text-base sm:text-sm font-medium text-[#0A1F5C] focus:outline-none focus:ring-2 ${
                        !lead.lost_reason
                          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                          : 'border-[#DCEBFF] focus:border-[#1D4ED8] focus:ring-[#1D4ED8]/20'
                      }`}
                    >
                      <option value="">Select a lost reason...</option>
                      {LOST_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Next Follow-up Section (Date, Type, Purpose Note) */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]">
                    Next follow-up
                  </p>
                  <span className="text-xs font-medium text-[#1D4ED8]">
                    {followUpSaveState === 'saving' && 'Saving...'}
                    {followUpSaveState === 'saved' && 'Saved'}
                    {followUpSaveState === 'error' && 'Could not save'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="drawer-follow-up-date"
                        className="text-xs font-semibold text-[#0A1F5C]"
                      >
                        Date
                      </label>
                      {followUpDraft && (
                        <button
                          type="button"
                          onClick={() => handleFollowUpDateChange('')}
                          className="text-xs font-medium text-[#44546F] hover:text-[#1D4ED8] cursor-pointer px-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      id="drawer-follow-up-date"
                      type="date"
                      value={followUpDraft}
                      onChange={(e) => handleFollowUpDateChange(e.target.value)}
                      className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="drawer-follow-up-type"
                      className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                    >
                      Type
                    </label>
                    <select
                      id="drawer-follow-up-type"
                      value={followUpTypeDraft}
                      onChange={(e) =>
                        handleFollowUpTypeChange(e.target.value as FollowUpType)
                      }
                      className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                    >
                      {FOLLOW_UP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 3 days', days: 3 },
                    { label: 'Next week', days: 7 },
                  ].map((preset) => {
                    const target = addDaysToToday(preset.days);
                    const isActive = followUpDraft === target;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleFollowUpDateChange(target)}
                        className={`min-h-[40px] rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1D4ED8] text-[#FFFFFF] border-[#1D4ED8]'
                            : 'bg-[#F2F7FF] text-[#1D4ED8] border-[#DCEBFF] hover:border-[#1D4ED8]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {suggestedFollowUp && !followUpDraft && (
                  <div className="rounded-xl border border-[#1D4ED8]/35 bg-[#F2F7FF] p-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#0A1F5C]">
                      Suggested follow-up:{' '}
                      <span className="font-semibold">
                        {formatShortDate(suggestedFollowUp)}
                      </span>{' '}
                      (2 days later)
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleFollowUpDateChange(suggestedFollowUp)
                        }
                        className="min-h-[38px] rounded-full bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] cursor-pointer"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuggestedFollowUp(null)}
                        className="min-h-[38px] px-2 text-xs font-medium text-[#44546F] hover:text-[#0A1F5C] cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="drawer-follow-up-note"
                    className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                  >
                    Purpose Note
                  </label>
                  <input
                    id="drawer-follow-up-note"
                    type="text"
                    value={followUpNoteDraft}
                    onChange={(e) => setFollowUpNoteDraft(e.target.value)}
                    placeholder="e.g. Share Instagram reel concepts and pricing"
                    className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                  />
                </div>
              </div>

              {/* Deal Value & Instagram */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]">
                    Deal &amp; Social
                  </p>
                  <span className="text-xs font-medium text-[#1D4ED8]">
                    {detailsSaveState === 'saving' && 'Saving...'}
                    {detailsSaveState === 'saved' && 'Saved'}
                    {detailsSaveState === 'error' && 'Could not save'}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="drawer-deal-value"
                    className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                  >
                    Deal Value (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base sm:text-sm font-semibold text-[#44546F] pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="drawer-deal-value"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1000"
                      value={dealValueDraft}
                      onChange={(e) => setDealValueDraft(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] pl-8 pr-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="drawer-instagram"
                      className="text-xs font-semibold text-[#0A1F5C]"
                    >
                      Instagram Handle
                    </label>
                    {cleanInstagram && (
                      <a
                        href={`https://instagram.com/${cleanInstagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                      >
                        <span>@{cleanInstagram}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Instagram className="w-4 h-4 text-[#1D4ED8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="drawer-instagram"
                      type="text"
                      value={instagramDraft}
                      onChange={(e) => setInstagramDraft(e.target.value)}
                      placeholder="@brandhandle"
                      className="w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Contact & Business Info */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Building2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span className="font-medium text-[#0A1F5C]">
                    {lead.business_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span className="text-[#44546F]">{lead.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Phone className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span className="text-[#44546F] tabular-nums">
                    {lead.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Mail className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span className="text-[#44546F] break-all">{lead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span className="text-[#44546F]">
                    Added on {formatDateTime(lead.created_at)}
                  </span>
                </div>
              </div>

              {/* Enquiry Message */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-2">
                  Message
                </p>
                <p className="text-sm sm:text-base text-[#44546F] leading-relaxed whitespace-pre-wrap">
                  {lead.message?.trim()
                    ? lead.message
                    : 'No additional message provided.'}
                </p>
              </div>

              {/* Editable Auto-Saving Notes */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="drawer-notes"
                    className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]"
                  >
                    Internal Notes
                  </label>
                  <span className="text-xs font-medium text-[#1D4ED8]">
                    {notesSaveState === 'saving' && 'Saving...'}
                    {notesSaveState === 'saved' && 'Saved'}
                    {notesSaveState === 'error' && 'Could not save notes'}
                  </span>
                </div>
                <textarea
                  id="drawer-notes"
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Add call notes, Instagram audit findings, or summary..."
                  className="w-full rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-4 py-3 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 resize-y transition-all"
                />
              </div>

              {/* Activity Timeline + Add Note Box */}
              <div className="rounded-2xl border border-[#DCEBFF] bg-[#FFFFFF] p-4 sm:p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0A1F5C]">
                  Activity
                </p>

                <form onSubmit={handleAddActivityNote} className="space-y-2.5">
                  <textarea
                    rows={2}
                    value={newActivityNote}
                    onChange={(e) => setNewActivityNote(e.target.value)}
                    placeholder="Add a note to activity timeline..."
                    aria-label="Add activity note"
                    className="w-full rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingActivityNote || !newActivityNote.trim()}
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {savingActivityNote ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Add note</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {loadingActivities && timelineItems.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-[#44546F] py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8]" />
                    <span>Loading activity...</span>
                  </div>
                ) : (
                  <ol className="space-y-3 border-l-2 border-[#DCEBFF] ml-3 pl-4">
                    {timelineItems.map((item) => (
                      <li key={item.id} className="relative">
                        <span className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full bg-[#F2F7FF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8]">
                          <FollowUpTypeIcon
                            type={item.type}
                            className="w-3 h-3"
                          />
                        </span>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#0A1F5C]">
                              {item.type}
                            </span>
                            {item.outcome && (
                              <span className="inline-flex items-center rounded-full bg-[#F2F7FF] border border-[#DCEBFF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
                                {item.outcome}
                              </span>
                            )}
                          </div>
                          <time
                            dateTime={item.created_at}
                            title={formatDateTime(item.created_at)}
                            className="text-[11px] text-[#44546F]"
                          >
                            {formatRelativeTime(item.created_at)}
                          </time>
                        </div>

                        {item.note && (
                          <p className="text-xs sm:text-sm text-[#44546F] mt-1 leading-relaxed whitespace-pre-wrap">
                            {item.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* Footer Delete Control */}
            <div className="px-4 sm:px-6 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-4 border-t border-[#DCEBFF] bg-[#F2F7FF] flex items-center justify-between gap-3 shrink-0">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-[#44546F] hover:text-[#0A1F5C] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Delete Lead</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-between w-full gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-[#0A1F5C]">
                    Permanently delete this lead?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="min-h-[44px] rounded-full border border-[#DCEBFF] bg-[#FFFFFF] px-4 py-2 text-xs sm:text-sm font-semibold text-[#0A1F5C] hover:border-[#1D4ED8] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={deleting}
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full bg-[#0A1F5C] px-4 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#1D4ED8] cursor-pointer"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Confirm Delete</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
