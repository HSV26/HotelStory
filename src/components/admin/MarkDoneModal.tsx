import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  addDaysToToday,
  isStatusEarlierThanProposal,
} from '../../lib/leadUtils';
import {
  ACTIVITY_OUTCOMES,
  ActivityOutcome,
  FOLLOW_UP_TYPES,
  FollowUpType,
  LOST_REASONS,
  Lead,
  LeadStatus,
  LostReason,
} from '../../lib/supabase';

interface MarkDoneModalProps {
  lead: Lead | null;
  onClose: () => void;
  onCompleteActivity: (
    lead: Lead,
    payload: {
      type: FollowUpType;
      outcome: ActivityOutcome;
      note: string;
    }
  ) => Promise<void>;
  onScheduleNextFollowUp: (
    lead: Lead,
    payload: {
      follow_up_date: string;
      next_follow_up_type: FollowUpType;
      next_follow_up_note: string;
      moveToProposal?: boolean;
    }
  ) => Promise<void>;
  onMarkLost: (lead: Lead, lostReason: LostReason) => Promise<void>;
  onMoveToProposal: (lead: Lead) => Promise<void>;
}

export const MarkDoneModal: React.FC<MarkDoneModalProps> = ({
  lead,
  onClose,
  onCompleteActivity,
  onScheduleNextFollowUp,
  onMarkLost,
  onMoveToProposal,
}) => {
  const [step, setStep] = useState<'log' | 'next'>('log');

  // Step 1 fields
  const [activityType, setActivityType] = useState<FollowUpType>('Call');
  const [outcome, setOutcome] = useState<ActivityOutcome>('Spoke');
  const [note, setNote] = useState('');
  const [savingStep1, setSavingStep1] = useState(false);

  // Step 2 fields
  const [nextDate, setNextDate] = useState('');
  const [nextType, setNextType] = useState<FollowUpType>('Call');
  const [nextNote, setNextNote] = useState('');
  const [moveToProposal, setMoveToProposal] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason | ''>('');
  const [lostError, setLostError] = useState<string | null>(null);
  const [skipWarningShown, setSkipWarningShown] = useState(false);
  const [savingStep2, setSavingStep2] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      const initialType = FOLLOW_UP_TYPES.includes(
        lead.next_follow_up_type as FollowUpType
      )
        ? (lead.next_follow_up_type as FollowUpType)
        : 'Call';
      setStep('log');
      setActivityType(initialType);
      setOutcome('Spoke');
      setNote('');
      setNextDate(addDaysToToday(3));
      setNextType(initialType);
      setNextNote('');
      setMoveToProposal(false);
      setLostReason('');
      setLostError(null);
      setSkipWarningShown(false);
      setErrorMsg(null);
    }
  }, [lead?.id]);

  useEffect(() => {
    if (!lead) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [lead, onClose]);

  if (!lead) return null;

  const canOfferProposalMove =
    outcome === 'Sent proposal' && isStatusEarlierThanProposal(lead.status);
  const canOfferLost = outcome === 'Not interested';

  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingStep1) return;
    setSavingStep1(true);
    setErrorMsg(null);
    try {
      await onCompleteActivity(lead, {
        type: activityType,
        outcome,
        note: note.trim(),
      });
      setStep('next');
    } catch {
      setErrorMsg('Could not save activity. Please try again.');
    } finally {
      setSavingStep1(false);
    }
  };

  const handleSaveNextFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingStep2) return;
    if (!nextDate) {
      setErrorMsg('Pick a next follow-up date or click Skip.');
      return;
    }
    setSavingStep2(true);
    setErrorMsg(null);
    try {
      await onScheduleNextFollowUp(lead, {
        follow_up_date: nextDate,
        next_follow_up_type: nextType,
        next_follow_up_note: nextNote.trim(),
        moveToProposal: canOfferProposalMove && moveToProposal,
      });
      onClose();
    } catch {
      setErrorMsg('Could not schedule next follow-up. Please try again.');
    } finally {
      setSavingStep2(false);
    }
  };

  const handleMarkAsLost = async () => {
    if (savingStep2) return;
    if (!lostReason) {
      setLostError('Please select a lost reason.');
      return;
    }
    setLostError(null);
    setSavingStep2(true);
    try {
      await onMarkLost(lead, lostReason);
      onClose();
    } catch {
      setErrorMsg('Could not mark lead as Lost. Please try again.');
    } finally {
      setSavingStep2(false);
    }
  };

  const handleSkipClick = async () => {
    if (!skipWarningShown) {
      setSkipWarningShown(true);
      return;
    }
    if (canOfferProposalMove && moveToProposal) {
      setSavingStep2(true);
      try {
        await onMoveToProposal(lead);
      } finally {
        setSavingStep2(false);
      }
    }
    onClose();
  };

  const inputClass =
    'w-full min-h-[46px] rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/60 focus:bg-[#FFFFFF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0A1F5C]/55 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mark-done-title"
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 24 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_24px_60px_rgba(10,31,92,0.22)] overflow-hidden max-h-[92svh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 bg-[#F2F7FF] border-b border-[#DCEBFF] flex items-center justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8]">
                {step === 'log' ? 'Mark Follow-up Done' : 'Set Next Follow-up'}
              </p>
              <h2
                id="mark-done-title"
                className="font-display font-bold text-lg text-[#0A1F5C] truncate"
              >
                {lead.business_name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overflow-y-auto">
            {step === 'log' ? (
              <form onSubmit={handleSaveStep1} className="space-y-4">
                <div>
                  <label
                    htmlFor="done-type"
                    className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                  >
                    Type
                  </label>
                  <select
                    id="done-type"
                    value={activityType}
                    onChange={(e) =>
                      setActivityType(e.target.value as FollowUpType)
                    }
                    className={inputClass}
                  >
                    {FOLLOW_UP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="done-outcome"
                    className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                  >
                    Outcome
                  </label>
                  <select
                    id="done-outcome"
                    value={outcome}
                    onChange={(e) =>
                      setOutcome(e.target.value as ActivityOutcome)
                    }
                    className={inputClass}
                  >
                    {ACTIVITY_OUTCOMES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="done-note"
                    className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                  >
                    Note
                  </label>
                  <textarea
                    id="done-note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What happened during this follow-up?"
                    className={inputClass}
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-[#DC2626]">{errorMsg}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] rounded-full border border-[#DCEBFF] px-5 py-2 text-sm font-semibold text-[#0A1F5C] hover:border-[#1D4ED8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStep1}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] disabled:opacity-60 cursor-pointer"
                  >
                    {savingStep1 ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save &amp; Continue</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#F2F7FF] border border-[#DCEBFF] px-3.5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0A1F5C]">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                  <span>
                    Activity logged ({activityType} · {outcome}).
                  </span>
                </div>

                {canOfferLost && (
                  <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[#991B1B]">
                        Lead not interested? Mark as Lost instead
                      </p>
                      <p className="text-xs text-[#7F1D1D] mt-0.5">
                        Select a lost reason to close out this lead.
                      </p>
                    </div>
                    <select
                      aria-label="Lost reason"
                      value={lostReason}
                      onChange={(e) => {
                        setLostReason(e.target.value as LostReason | '');
                        setLostError(null);
                      }}
                      className="w-full min-h-[46px] rounded-xl bg-[#FFFFFF] border border-[#FCA5A5] px-3 py-2 text-base sm:text-sm text-[#0A1F5C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                    >
                      <option value="">Select lost reason...</option>
                      {LOST_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {lostError && (
                      <p className="text-xs font-semibold text-[#DC2626]">
                        {lostError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleMarkAsLost}
                      disabled={savingStep2}
                      className="w-full min-h-[44px] rounded-full bg-[#DC2626] px-4 py-2 text-sm font-semibold text-[#FFFFFF] hover:bg-[#B91C1C] transition-colors cursor-pointer"
                    >
                      Mark Lead as Lost
                    </button>
                  </div>
                )}

                {canOfferProposalMove && (
                  <label className="flex items-start gap-3 rounded-xl border border-[#1D4ED8]/35 bg-[#F2F7FF] p-3.5 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={moveToProposal}
                      onChange={(e) => setMoveToProposal(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-[#1D4ED8] text-[#1D4ED8]"
                    />
                    <span className="text-xs sm:text-sm text-[#0A1F5C]">
                      <strong className="font-semibold">
                        Move status to Proposal
                      </strong>{' '}
                      (currently {lead.status as LeadStatus})
                    </span>
                  </label>
                )}

                <form onSubmit={handleSaveNextFollowUp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="next-followup-date"
                      className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                    >
                      Next follow-up date
                    </label>
                    <input
                      id="next-followup-date"
                      type="date"
                      value={nextDate}
                      onChange={(e) => {
                        setNextDate(e.target.value);
                        setSkipWarningShown(false);
                      }}
                      className={inputClass}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { label: 'Tomorrow', days: 1 },
                        { label: 'In 3 days', days: 3 },
                        { label: 'Next week', days: 7 },
                        { label: 'In 2 weeks', days: 14 },
                      ].map((preset) => {
                        const val = addDaysToToday(preset.days);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setNextDate(val);
                              setSkipWarningShown(false);
                            }}
                            className={`min-h-[40px] rounded-full border px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                              nextDate === val
                                ? 'bg-[#1D4ED8] text-[#FFFFFF] border-[#1D4ED8]'
                                : 'bg-[#F2F7FF] text-[#1D4ED8] border-[#DCEBFF] hover:border-[#1D4ED8]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="next-followup-type"
                      className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                    >
                      Follow-up type
                    </label>
                    <select
                      id="next-followup-type"
                      value={nextType}
                      onChange={(e) =>
                        setNextType(e.target.value as FollowUpType)
                      }
                      className={inputClass}
                    >
                      {FOLLOW_UP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="next-followup-note"
                      className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                    >
                      Purpose note
                    </label>
                    <input
                      id="next-followup-note"
                      type="text"
                      value={nextNote}
                      onChange={(e) => setNextNote(e.target.value)}
                      placeholder="e.g. Confirm budget and send retainer deck"
                      className={inputClass}
                    />
                  </div>

                  {skipWarningShown && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[#FDBA74] bg-[#FFF7ED] px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#C2410C]"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        This lead has no next follow-up. Click Skip again to
                        leave it unscheduled.
                      </span>
                    </div>
                  )}

                  {errorMsg && (
                    <p className="text-xs font-medium text-[#DC2626]">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSkipClick}
                      disabled={savingStep2}
                      className={`min-h-[44px] rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                        skipWarningShown
                          ? 'border-[#C2410C] text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5]'
                          : 'border-[#DCEBFF] text-[#44546F] hover:border-[#1D4ED8] hover:text-[#0A1F5C]'
                      }`}
                    >
                      {skipWarningShown ? 'Skip anyway' : 'Skip'}
                    </button>

                    <button
                      type="submit"
                      disabled={savingStep2}
                      className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] disabled:opacity-60 cursor-pointer"
                    >
                      {savingStep2 ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Set Next Follow-up</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
