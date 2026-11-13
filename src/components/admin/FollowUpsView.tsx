import React, { useMemo, useState } from 'react';
import {
  AlarmClock,
  Check,
  Inbox,
  MessageCircle,
  Phone,
} from 'lucide-react';
import {
  addDaysToToday,
  buildWhatsAppUrl,
  formatShortDate,
  getDaysOverdue,
  getLocalDateString,
} from '../../lib/leadUtils';
import { Lead } from '../../lib/supabase';
import { FollowUpTypeIcon } from './FollowUpTypeIcon';

interface FollowUpsViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onMarkContacted: (leadId: string) => void;
  onOpenMarkDone: (lead: Lead) => void;
  onSnoozeLead: (leadId: string, newDate: string) => Promise<void>;
}

interface FollowUpGroup {
  key: string;
  title: string;
  leads: Lead[];
  badgeClass: string;
  borderClass: string;
  titleClass: string;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  leads,
  onOpenLead,
  onMarkContacted,
  onOpenMarkDone,
  onSnoozeLead,
}) => {
  const [openSnoozeId, setOpenSnoozeId] = useState<string | null>(null);
  const [mobileSnoozeLead, setMobileSnoozeLead] = useState<Lead | null>(null);
  const [snoozingId, setSnoozingId] = useState<string | null>(null);

  const todayStr = getLocalDateString();
  const tomorrowStr = addDaysToToday(1);
  const weekEndStr = addDaysToToday(6);

  const groups = useMemo<FollowUpGroup[]>(() => {
    const activeLeads = leads.filter(
      (l) => l.status !== 'Won' && l.status !== 'Lost'
    );

    const overdue: Lead[] = [];
    const today: Lead[] = [];
    const tomorrow: Lead[] = [];
    const thisWeek: Lead[] = [];
    const later: Lead[] = [];
    const unscheduled: Lead[] = [];

    for (const lead of activeLeads) {
      const d = lead.follow_up_date;
      if (!d) {
        unscheduled.push(lead);
      } else if (d < todayStr) {
        overdue.push(lead);
      } else if (d === todayStr) {
        today.push(lead);
      } else if (d === tomorrowStr) {
        tomorrow.push(lead);
      } else if (d <= weekEndStr) {
        thisWeek.push(lead);
      } else {
        later.push(lead);
      }
    }

    const sortByDateAsc = (a: Lead, b: Lead) =>
      (a.follow_up_date || '').localeCompare(b.follow_up_date || '');

    overdue.sort(sortByDateAsc);
    thisWeek.sort(sortByDateAsc);
    later.sort(sortByDateAsc);

    const allGroups: FollowUpGroup[] = [
      {
        key: 'overdue',
        title: 'Overdue',
        leads: overdue,
        badgeClass: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
        borderClass: 'border-[#FCA5A5]',
        titleClass: 'text-[#DC2626]',
      },
      {
        key: 'today',
        title: 'Today',
        leads: today,
        badgeClass: 'bg-[#DCEBFF] text-[#1D4ED8] border-[#1D4ED8]/30',
        borderClass: 'border-[#1D4ED8]/35',
        titleClass: 'text-[#1D4ED8]',
      },
      {
        key: 'tomorrow',
        title: 'Tomorrow',
        leads: tomorrow,
        badgeClass: 'bg-[#F2F7FF] text-[#0A1F5C] border-[#DCEBFF]',
        borderClass: 'border-[#DCEBFF]',
        titleClass: 'text-[#0A1F5C]',
      },
      {
        key: 'this-week',
        title: 'This Week',
        leads: thisWeek,
        badgeClass: 'bg-[#F2F7FF] text-[#0A1F5C] border-[#DCEBFF]',
        borderClass: 'border-[#DCEBFF]',
        titleClass: 'text-[#0A1F5C]',
      },
      {
        key: 'later',
        title: 'Later',
        leads: later,
        badgeClass: 'bg-[#F2F7FF] text-[#44546F] border-[#DCEBFF]',
        borderClass: 'border-[#DCEBFF]',
        titleClass: 'text-[#44546F]',
      },
      {
        key: 'none',
        title: 'No follow-up set',
        leads: unscheduled,
        badgeClass: 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]',
        borderClass: 'border-[#FDBA74]',
        titleClass: 'text-[#C2410C]',
      },
    ];

    return allGroups.filter((g) => g.leads.length > 0);
  }, [leads, todayStr, tomorrowStr, weekEndStr]);

  const handleSnoozeSelect = async (
    e: React.MouseEvent,
    leadId: string,
    days: number
  ) => {
    e.stopPropagation();
    setSnoozingId(leadId);
    setOpenSnoozeId(null);
    setMobileSnoozeLead(null);
    try {
      await onSnoozeLead(leadId, addDaysToToday(days));
    } finally {
      setSnoozingId(null);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DCEBFF] bg-[#F2F7FF] p-10 sm:p-14 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8] mb-4">
          <Inbox className="w-5 h-5" />
        </div>
        <h2 className="font-display font-bold text-lg text-[#0A1F5C] mb-1">
          All caught up
        </h2>
        <p className="text-sm text-[#44546F] max-w-sm">
          There are no active leads matching your filters right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div
          key={group.key}
          className={`rounded-2xl border bg-[#FFFFFF] overflow-visible shadow-[0_8px_24px_rgba(29,78,216,0.04)] ${group.borderClass}`}
        >
          {/* Section Header */}
          <div className="px-4 sm:px-5 py-3.5 bg-[#F2F7FF] border-b border-[#DCEBFF] rounded-t-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2
                className={`font-display font-bold text-sm sm:text-base ${group.titleClass}`}
              >
                {group.title}
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${group.badgeClass}`}
              >
                {group.leads.length}
              </span>
            </div>
          </div>

          {/* Tablet & Desktop Row List */}
          <div className="hidden md:block divide-y divide-[#DCEBFF]">
            {group.leads.map((lead) => {
              const daysOverdue = getDaysOverdue(lead.follow_up_date, todayStr);
              const isSnoozeOpen = openSnoozeId === lead.id;

              return (
                <div
                  key={lead.id}
                  onClick={() => onOpenLead(lead)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenLead(lead);
                    }
                  }}
                  className="px-5 py-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4 hover:bg-[#F2F7FF]/70 transition-colors cursor-pointer"
                >
                  {/* Left: Follow-up Icon + Business + Contact + Note */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1 basis-[280px]">
                    <div
                      title={lead.next_follow_up_type || 'Follow-up'}
                      className="w-9 h-9 rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8] shrink-0 mt-0.5"
                    >
                      <FollowUpTypeIcon
                        type={lead.next_follow_up_type}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-sm text-[#0A1F5C] truncate">
                          {lead.business_name}
                        </span>
                        <span className="text-xs text-[#44546F]">
                          · {lead.full_name}
                        </span>
                        <span className="text-xs text-[#44546F]">
                          · {lead.city}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#F2F7FF] border border-[#DCEBFF] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#1D4ED8]">
                          {lead.source}
                        </span>
                      </div>

                      {lead.next_follow_up_note ? (
                        <p className="text-xs text-[#44546F] mt-1 truncate">
                          {lead.next_follow_up_note}
                        </p>
                      ) : (
                        <p className="text-xs text-[#44546F]/60 mt-1 italic">
                          No follow-up note
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Date + Overdue badge */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[#0A1F5C] tabular-nums">
                      {formatShortDate(lead.follow_up_date)}
                    </p>
                    {daysOverdue > 0 && (
                      <p className="text-[11px] font-semibold text-[#DC2626] mt-0.5">
                        {daysOverdue}{' '}
                        {daysOverdue === 1 ? 'day overdue' : 'days overdue'}
                      </p>
                    )}
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={() => onMarkContacted(lead.id)}
                      title={`Call ${lead.phone}`}
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] px-3.5 py-2 text-xs font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <a
                      href={buildWhatsAppUrl(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onMarkContacted(lead.id)}
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] px-3.5 py-2 text-xs font-semibold text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenMarkDone(lead)}
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        disabled={snoozingId === lead.id}
                        onClick={() =>
                          setOpenSnoozeId((prev) =>
                            prev === lead.id ? null : lead.id
                          )
                        }
                        className="min-h-[44px] inline-flex items-center gap-1.5 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#44546F] hover:border-[#1D4ED8] hover:text-[#0A1F5C] transition-colors cursor-pointer"
                      >
                        <AlarmClock className="w-3.5 h-3.5" />
                        <span>Snooze</span>
                      </button>

                      {isSnoozeOpen && (
                        <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] shadow-[0_12px_30px_rgba(10,31,92,0.14)] py-1 z-20">
                          {[
                            { label: 'Tomorrow', days: 1 },
                            { label: 'In 3 days', days: 3 },
                            { label: 'Next week', days: 7 },
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={(e) =>
                                handleSnoozeSelect(e, lead.id, opt.days)
                              }
                              className="w-full min-h-[44px] text-left px-4 py-2.5 text-xs font-medium text-[#0A1F5C] hover:bg-[#F2F7FF] hover:text-[#1D4ED8] cursor-pointer"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Stacked Cards with Large Call & WhatsApp Tap Buttons */}
          <div className="md:hidden divide-y divide-[#DCEBFF]">
            {group.leads.map((lead) => {
              const daysOverdue = getDaysOverdue(lead.follow_up_date, todayStr);

              return (
                <div
                  key={lead.id}
                  onClick={() => onOpenLead(lead)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenLead(lead);
                    }
                  }}
                  className="p-4 space-y-3 hover:bg-[#F2F7FF]/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8] shrink-0">
                        <FollowUpTypeIcon
                          type={lead.next_follow_up_type}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-[#0A1F5C] truncate">
                          {lead.business_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#44546F]">
                          {lead.full_name} · {lead.city}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-[#F2F7FF] border border-[#DCEBFF] px-2.5 py-0.5 text-[11px] font-semibold capitalize text-[#1D4ED8] shrink-0">
                      {lead.source}
                    </span>
                  </div>

                  {lead.next_follow_up_note && (
                    <p className="text-xs sm:text-sm text-[#0A1F5C] bg-[#F2F7FF] rounded-lg px-3 py-2">
                      {lead.next_follow_up_note}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[#0A1F5C] tabular-nums">
                      {formatShortDate(lead.follow_up_date)}
                    </span>
                    {daysOverdue > 0 && (
                      <span className="font-semibold text-[#DC2626]">
                        {daysOverdue}{' '}
                        {daysOverdue === 1 ? 'day overdue' : 'days overdue'}
                      </span>
                    )}
                  </div>

                  {/* Large Tap Targets for Call, WhatsApp, Done, and Snooze */}
                  <div
                    className="space-y-2.5 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={() => onMarkContacted(lead.id)}
                        className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] py-2.5 px-4 text-sm font-semibold text-[#0A1F5C] active:bg-[#1D4ED8] active:text-[#FFFFFF]"
                      >
                        <Phone className="w-4 h-4 text-[#1D4ED8]" />
                        <span>Call</span>
                      </a>
                      <a
                        href={buildWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onMarkContacted(lead.id)}
                        className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] py-2.5 px-4 text-sm font-semibold text-[#0A1F5C] active:bg-[#1D4ED8] active:text-[#FFFFFF]"
                      >
                        <MessageCircle className="w-4 h-4 text-[#1D4ED8]" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenMarkDone(lead)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] py-2.5 px-4 text-sm font-semibold text-[#FFFFFF] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Done</span>
                      </button>

                      <button
                        type="button"
                        disabled={snoozingId === lead.id}
                        onClick={() => setMobileSnoozeLead(lead)}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] py-2.5 px-4 text-sm font-semibold text-[#0A1F5C] cursor-pointer"
                      >
                        <AlarmClock className="w-4 h-4" />
                        <span>Snooze</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Mobile Snooze Bottom Sheet */}
      {mobileSnoozeLead && (
        <div
          onClick={() => setMobileSnoozeLead(null)}
          className="md:hidden fixed inset-0 z-50 flex items-end bg-[#0A1F5C]/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-[#FFFFFF] border-t border-[#DCEBFF] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3 shadow-[0_-16px_40px_rgba(10,31,92,0.18)]"
          >
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#DCEBFF]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8]">
                  Snooze Follow-up
                </p>
                <p className="font-display font-bold text-base text-[#0A1F5C] truncate">
                  {mobileSnoozeLead.business_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSnoozeLead(null)}
                className="min-h-[44px] px-3 rounded-full text-sm font-semibold text-[#44546F] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Tomorrow', days: 1 },
                { label: 'In 3 days', days: 3 },
                { label: 'Next week', days: 7 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={(e) =>
                    handleSnoozeSelect(e, mobileSnoozeLead.id, opt.days)
                  }
                  className="w-full min-h-[48px] flex items-center justify-between rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] px-4 py-3 text-base font-semibold text-[#0A1F5C] active:bg-[#1D4ED8] active:text-[#FFFFFF] cursor-pointer"
                >
                  <span>{opt.label}</span>
                  <span className="text-xs text-[#1D4ED8] font-medium tabular-nums">
                    {formatShortDate(addDaysToToday(opt.days))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
