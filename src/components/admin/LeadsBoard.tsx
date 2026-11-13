import React, { useState } from 'react';
import {
  formatINR,
  formatINRSum,
  formatShortDate,
  getLocalDateString,
  isFollowUpOverdue,
  isNeedsReply,
} from '../../lib/leadUtils';
import { Lead, LeadStatus } from '../../lib/supabase';
import { FollowUpTypeIcon } from './FollowUpTypeIcon';

interface LeadsBoardProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onMoveLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
}

export const BOARD_COLUMNS: LeadStatus[] = [
  'New',
  'Contacted',
  'Audit Sent',
  'Proposal',
  'Won',
  'Lost',
];

function getColumnHeaderAccent(status: LeadStatus): string {
  switch (status) {
    case 'New':
      return 'bg-[#1D4ED8] text-[#FFFFFF]';
    case 'Won':
      return 'bg-[#0A1F5C] text-[#FFFFFF]';
    case 'Lost':
      return 'bg-[#FFFFFF] text-[#44546F] border border-[#DCEBFF]';
    default:
      return 'bg-[#DCEBFF] text-[#1D4ED8]';
  }
}

export const LeadsBoard: React.FC<LeadsBoardProps> = ({
  leads,
  onOpenLead,
  onMoveLeadStatus,
}) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    leadId: string
  ) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    status: LeadStatus
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    status: LeadStatus
  ) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn((prev) => (prev === status ? null : prev));
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetStatus: LeadStatus
  ) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDraggedLeadId(null);
    setDragOverColumn(null);

    if (!leadId) return;
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.status === targetStatus) return;

    await onMoveLeadStatus(leadId, targetStatus);
  };

  return (
    <div className="overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-3.5 sm:gap-4 min-w-max">
        {BOARD_COLUMNS.map((columnStatus) => {
          const columnLeads = leads.filter((l) => l.status === columnStatus);
          const totalValue = columnLeads.reduce(
            (sum, l) => sum + (Number(l.deal_value) || 0),
            0
          );
          const isDropTarget = dragOverColumn === columnStatus;

          return (
            <div
              key={columnStatus}
              onDragOver={(e) => handleDragOver(e, columnStatus)}
              onDragLeave={(e) => handleDragLeave(e, columnStatus)}
              onDrop={(e) => handleDrop(e, columnStatus)}
              className={`w-[85vw] max-w-[330px] sm:w-[286px] shrink-0 snap-start rounded-2xl border p-3.5 flex flex-col transition-colors ${
                isDropTarget
                  ? 'bg-[#DCEBFF]/50 border-[#1D4ED8]'
                  : 'bg-[#F2F7FF] border-[#DCEBFF]'
              }`}
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-[#DCEBFF]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getColumnHeaderAccent(
                      columnStatus
                    )}`}
                  >
                    {columnStatus}
                  </span>
                  <span className="text-xs font-semibold text-[#0A1F5C] tabular-nums">
                    {columnLeads.length}{' '}
                    {columnLeads.length === 1 ? 'lead' : 'leads'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1D4ED8] tabular-nums">
                  {formatINRSum(totalValue)}
                </p>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 min-h-[140px] flex-1">
                {columnLeads.length === 0 ? (
                  <div className="h-24 rounded-xl border border-dashed border-[#DCEBFF] bg-[#FFFFFF]/50 flex items-center justify-center text-xs text-[#44546F]/70">
                    Drop lead here
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const isDragging = draggedLeadId === lead.id;
                    const todayStr = getLocalDateString();
                    const needsReply = isNeedsReply(lead);
                    const overdue = isFollowUpOverdue(lead, todayStr);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpenLead(lead)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenLead(lead);
                          }
                        }}
                        className={`rounded-xl border bg-[#FFFFFF] p-3.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                          isDragging
                            ? 'opacity-50 border-[#1D4ED8] shadow-md'
                            : 'border-[#DCEBFF] hover:border-[#1D4ED8] hover:shadow-[0_6px_18px_rgba(29,78,216,0.08)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display font-bold text-sm text-[#0A1F5C] leading-snug line-clamp-2">
                            {lead.business_name}
                          </h3>
                          {!lead.is_read && (
                            <span className="inline-flex items-center rounded-full bg-[#1D4ED8] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#FFFFFF] shrink-0">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#44546F] mb-2 truncate">
                          {lead.city}
                        </p>

                        {(lead.follow_up_date || needsReply || overdue) && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            {lead.follow_up_date && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium tabular-nums ${
                                  overdue
                                    ? 'text-[#DC2626] font-semibold'
                                    : 'text-[#44546F]'
                                }`}
                              >
                                <FollowUpTypeIcon
                                  type={lead.next_follow_up_type}
                                  className={`w-3 h-3 ${
                                    overdue ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                                  }`}
                                />
                                <span>
                                  {formatShortDate(lead.follow_up_date)}
                                </span>
                              </span>
                            )}
                            {overdue && (
                              <span className="inline-flex items-center rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-1.5 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                                Overdue
                              </span>
                            )}
                            {needsReply && (
                              <span className="inline-flex items-center rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-semibold text-[#C2410C]">
                                Needs reply
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#DCEBFF]/70">
                          <span className="inline-flex items-center rounded-full bg-[#F2F7FF] border border-[#DCEBFF] px-2 py-0.5 text-[11px] font-medium text-[#1D4ED8] truncate max-w-[140px]">
                            {lead.business_type}
                          </span>
                          <span className="text-xs font-semibold text-[#0A1F5C] tabular-nums shrink-0">
                            {formatINR(lead.deal_value)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
