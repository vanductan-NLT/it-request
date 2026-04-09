import { useState, useRef, useEffect } from 'react';
import type { InterviewQuestion } from '@/shared/types/api.types';

interface Step4InterviewProps {
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  questionIndex: number;
  onAnswer: (questionId: string, answer: string) => void;
  onSkip: (questionId: string) => void;
  onQuestionIndexChange: (index: number) => void;
}

export default function Step4Interview({
  questions,
  answers,
  questionIndex,
  onAnswer,
  onSkip,
  onQuestionIndexChange,
}: Step4InterviewProps) {
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allDone = questions.length > 0 && questions.every((q) => q.id in answers);
  const currentQuestion = questions[questionIndex] ?? null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questionIndex, answers]);

  useEffect(() => {
    setInputValue('');
    if (currentQuestion?.type === 'text') {
      inputRef.current?.focus();
    } else if (currentQuestion?.type === 'multiline') {
      textareaRef.current?.focus();
    }
  }, [questionIndex, currentQuestion?.type]);

  function handleSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed || !currentQuestion) return;
    onAnswer(currentQuestion.id, trimmed);
    setInputValue('');
    if (questionIndex < questions.length - 1) {
      onQuestionIndexChange(questionIndex + 1);
    }
  }

  function handleSkip() {
    if (!currentQuestion) return;
    onSkip(currentQuestion.id);
    if (questionIndex < questions.length - 1) {
      onQuestionIndexChange(questionIndex + 1);
    }
  }

  function handleSelectOption(option: string) {
    if (!currentQuestion) return;
    onAnswer(currentQuestion.id, option);
    if (questionIndex < questions.length - 1) {
      onQuestionIndexChange(questionIndex + 1);
    }
  }

  function handleTextKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  }

  return (
    <div id="interview-section" className="space-y-6">
      {/* Q-dots progress bar */}
      <div className="flex items-center justify-center gap-2 py-3">
        {questions.map((q, i) => {
          const isDone = q.id in answers;
          const isCurrent = i === questionIndex && !allDone;
          let dotClass = 'w-2.5 h-2.5 rounded-full transition-all duration-300 ';
          if (isDone) {
            dotClass += 'bg-green-500';
          } else if (isCurrent) {
            dotClass += 'bg-violet-500 ring-2 ring-violet-400/50 scale-125';
          } else {
            dotClass += 'bg-[var(--text-dim)]';
          }
          return (
            <button
              key={q.id}
              type="button"
              className={dotClass}
              onClick={() => {
                if (isDone || i <= questionIndex) {
                  onQuestionIndexChange(i);
                }
              }}
              aria-label={`Question ${i + 1}`}
            />
          );
        })}
      </div>

      {/* Chat area */}
      <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto px-1">
        {questions.map((q, i) => {
          const answer = answers[q.id];
          const isAnswered = q.id in answers;
          const isCurrent = i === questionIndex && !allDone;

          if (!isAnswered && !isCurrent) return null;

          return (
            <div key={q.id} className="space-y-3">
              {/* IT avatar bubble - left */}
              <div className="flex items-start gap-2.5">
                <div className="w-[23px] h-[23px] rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[9px] font-bold leading-none">IT</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed ${
                    isCurrent
                      ? 'bg-[var(--bg-card)] border border-violet-500/50 text-[var(--text-primary)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                  }`}
                >
                  {q.question}
                </div>
              </div>

              {/* User answer bubble - right */}
              {isAnswered && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed bg-violet-600/20 border border-violet-500/30 text-[var(--text-primary)]">
                    {answer === '(bỏ qua)' ? (
                      <span className="text-[var(--text-secondary)] italic">Bỏ qua</span>
                    ) : (
                      <span className="whitespace-pre-wrap">{answer}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Input area for current question */}
              {isCurrent && !isAnswered && (
                <div className="pl-[33px] space-y-2">
                  {q.type === 'text' && (
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        placeholder="Nhập câu trả lời..."
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmit(inputValue)}
                        disabled={!inputValue.trim()}
                        className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                      >
                        Gửi
                      </button>
                    </div>
                  )}

                  {q.type === 'multiline' && (
                    <div className="space-y-1.5">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Nhập câu trả lời..."
                        rows={3}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--text-dim)]">Nhấn Ctrl+Enter để gửi</span>
                        <button
                          type="button"
                          onClick={() => handleSubmit(inputValue)}
                          disabled={!inputValue.trim()}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                        >
                          Gui
                        </button>
                      </div>
                    </div>
                  )}

                  {q.type === 'select' && q.options && (
                    <div className="space-y-1.5">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(opt)}
                          className="w-full text-left px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] hover:border-violet-500/50 hover:bg-violet-600/10 rounded-lg text-sm text-[var(--text-primary)] transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Skip button */}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Bỏ qua câu này
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Completion message */}
        {allDone && questions.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 text-sm text-green-400 text-center">
              Đã trả lời tất cả {questions.length} câu hỏi. Chuyển sang bước tiếp theo!
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
