import { useState } from 'react';
import { useWizard } from './hooks/useWizard';
import { useTeams, useRequestTypes } from './hooks/useLookupData';
import { useSubmitTicket } from './hooks/useSubmitTicket';
import { useToast } from '@/shared/hooks/useToast';
import { buildBrief } from './utils/brief-builder';
import { buildPrompt } from './utils/prompt-builder';
import { WizardHeader } from './components/layout/WizardHeader';
import { WizardTimeline } from './components/layout/WizardTimeline';
import { ScoreBar } from './components/layout/ScoreBar';
import { GatePanel } from './components/layout/GatePanel';
import Step1Team from './components/steps/Step1Team';
import Step2RequestType from './components/steps/Step2RequestType';
import Step3Context from './components/steps/Step3Context';
import Step4Interview from './components/steps/Step4Interview';
import Step5Upload from './components/steps/Step5Upload';
import SendModal from './components/modals/SendModal';
import SuccessPage from './components/success/SuccessPage';
import { ENV } from './utils/env-detect';
import type { StepId } from './state/wizard.types';

export function ITRequestPage() {
  const wizard = useWizard();
  const { toast } = useToast();
  const [showSendModal, setShowSendModal] = useState(false);

  // Lookup data
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: requestTypes } = useRequestTypes();

  // Submit mutation
  const submitMutation = useSubmitTicket();

  // Step 6 = SuccessPage (bypasses main layout entirely)
  if (wizard.step === 6 && wizard.submittedTicketId) {
    return (
      <SuccessPage
        ticketId={wizard.submittedTicketId}
        team={wizard.team!}
        requestType={wizard.requestType!}
        severity={wizard.severity!}
        slaHours={wizard.severity!.sla_hours}
        fileCount={wizard.totalFileCount}
        createdAt={new Date().toISOString()}
        itBrief={wizard.itBriefFromServer}
        onEdit={() => wizard.setStep(5)}
        onDelete={async () => {
          if (!window.confirm('Bạn có chắc muốn xoá yêu cầu này?')) return;
          // In real app: call DELETE /it/my-tickets/:id
          toast.success('Yêu cầu đã được xoá');
          wizard.reset();
        }}
        onNew={() => wizard.reset()}
      />
    );
  }

  const handleSend = () => setShowSendModal(true);

  const handleConfirmSend = async () => {
    if (!wizard.team || !wizard.requestType || !wizard.severity) return;

    try {
      const interviewAnswers = wizard.requestType.interview_questions.map((q) => ({
        question: q.question,
        answer: wizard.answers[q.id] || '',
      }));

      const body = {
        team_id: wizard.team.id,
        request_type_id: wizard.requestType.id,
        severity_id: wizard.severity.id,
        arch_component_id: wizard.archComponent?.id,
        affected_url: wizard.affectedUrl || undefined,
        reproduced: wizard.reproduced || undefined,
        expected_behavior: wizard.expectedBehavior || undefined,
        actual_behavior: wizard.actualBehavior || undefined,
        interview_answers: interviewAnswers,
        submitted_by_name: wizard.submitterName || undefined,
        submitter_tg: wizard.submitterTg || undefined,
        completeness_score: wizard.score,
        env_info: { browser: ENV.browser, os: ENV.os, screen: ENV.screen },
      };

      const result = await submitMutation.mutateAsync(body as any);
      wizard.setSubmittedTicketId(result.data.ticket.id);
      wizard.setItBriefFromServer(result.data.it_brief);
      wizard.setStep(6);
      setShowSendModal(false);
      toast.success('Yêu cầu đã được gửi thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  // Build brief and prompt text from current wizard state
  const wizardState = wizard as any; // useWizard spreads store state
  const briefText = buildBrief(wizardState);
  const promptText = buildPrompt(wizardState);

  const currentGates = wizard.getGateForStep(wizard.step as StepId);
  const canProceed = wizard.canGoToNext(wizard.step as StepId);

  const handleNext = () => {
    if (canProceed) {
      const nextStep = Math.min(wizard.step + 1, 5) as StepId;
      wizard.setStep(nextStep);
    } else {
      wizard.scrollToMissing(wizard.step as StepId);
    }
  };

  const handleBack = () => {
    const prevStep = Math.max(wizard.step - 1, 1) as StepId;
    wizard.setStep(prevStep);
  };

  // Scroll to first missing gate item
  const handleScrollToMissing = (_targetId: string) => {
    const el = document.getElementById(_targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('outline-pulse');
    setTimeout(() => el.classList.remove('outline-pulse'), 2000);
  };

  // Loading state
  if (teamsLoading) {
    return (
      <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090F]">
      <WizardHeader />
      <ScoreBar score={wizard.score} scoreColor={wizard.scoreColor} scoreLabel={wizard.scoreLabel} />
      <WizardTimeline
        currentStep={wizard.step}
        onStepClick={(step) => wizard.setStep(step as StepId)}
        canGoFn={(step) => wizard.canGoToNext(step as StepId)}
      />

      <main className="max-w-[720px] mx-auto px-5 py-6 pb-[140px]">
        <div className="animate-fade-slide" key={wizard.step}>
          {wizard.step === 1 && (
            <Step1Team
              teams={teams || []}
              selectedTeam={wizard.team}
              onSelect={(team) => {
                wizard.setTeam(team);
                setTimeout(() => wizard.setStep(2), 300);
              }}
            />
          )}

          {wizard.step === 2 && (
            <Step2RequestType
              requestTypes={requestTypes || []}
              selectedType={wizard.requestType}
              onSelect={(rt) => {
                wizard.setRequestType(rt);
                setTimeout(() => wizard.setStep(3), 300);
              }}
            />
          )}

          {wizard.step === 3 && (
            <Step3Context
              severity={wizard.severity}
              onSeveritySelect={wizard.setSeverity}
              archComponent={wizard.archComponent}
              onArchComponentSelect={wizard.setArchComponent}
              affectedUrl={wizard.affectedUrl}
              onAffectedUrlChange={wizard.setAffectedUrl}
              expectedBehavior={wizard.expectedBehavior}
              onExpectedBehaviorChange={wizard.setExpectedBehavior}
              actualBehavior={wizard.actualBehavior}
              onActualBehaviorChange={wizard.setActualBehavior}
              reproduced={wizard.reproduced}
              onReproducedSelect={wizard.setReproduced}
              isBugType={wizard.isBugType}
            />
          )}

          {wizard.step === 4 && wizard.requestType && (
            <Step4Interview
              questions={wizard.requestType.interview_questions}
              answers={wizard.answers}
              questionIndex={wizard.questionIndex}
              onAnswer={(qId, answer) => {
                wizard.setAnswer(qId, answer);
                const nextIdx = wizard.questionIndex + 1;
                if (nextIdx < wizard.requestType!.interview_questions.length) {
                  wizard.setQuestionIndex(nextIdx);
                }
              }}
              onSkip={(qId) => {
                wizard.setAnswer(qId, '(bỏ qua)');
                const nextIdx = wizard.questionIndex + 1;
                if (nextIdx < wizard.requestType!.interview_questions.length) {
                  wizard.setQuestionIndex(nextIdx);
                }
              }}
              onQuestionIndexChange={wizard.setQuestionIndex}
            />
          )}

          {wizard.step === 5 && wizard.requestType && (
            <Step5Upload
              fileSlots={wizard.requestType.file_slots_def}
              slotFiles={wizard.slotFiles}
              extraFiles={wizard.extraFiles}
              onSlotFile={wizard.setSlotFile}
              onRemoveSlotFile={wizard.removeSlotFile}
              onAddExtraFile={wizard.addExtraFile}
              onRemoveExtraFile={wizard.removeExtraFile}
              briefText={briefText}
              promptText={promptText}
              onSend={handleSend}
              score={wizard.score}
            />
          )}
        </div>
      </main>

      <GatePanel
        step={wizard.step}
        gates={currentGates}
        canProceed={canProceed}
        onNext={handleNext}
        onBack={wizard.step > 1 ? handleBack : undefined}
        onScrollToMissing={handleScrollToMissing}
      />

      <SendModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onConfirm={handleConfirmSend}
        isSubmitting={submitMutation.isPending}
        score={wizard.score}
        briefText={briefText}
        fileCount={wizard.totalFileCount}
      />
    </div>
  );
}
