import { useState, useRef, useCallback } from 'react';
import type { FileSlotDef } from '@/shared/types/api.types';
import type { UploadedFile } from '../../state/wizard.types';

interface Step5UploadProps {
  fileSlots: FileSlotDef[];
  slotFiles: Record<string, UploadedFile>;
  extraFiles: UploadedFile[];
  onSlotFile: (slotKey: string, file: UploadedFile) => void;
  onRemoveSlotFile: (slotKey: string) => void;
  onAddExtraFile: (file: UploadedFile) => void;
  onRemoveExtraFile: (index: number) => void;
  briefText: string;
  promptText: string;
  onSend: () => void;
  score: number;
}

type OutputTab = 'brief' | 'prompt';

function readFile(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

export default function Step5Upload({
  fileSlots,
  slotFiles,
  extraFiles,
  onSlotFile,
  onRemoveSlotFile,
  onAddExtraFile,
  onRemoveExtraFile,
  briefText,
  promptText,
  onSend,
  score,
}: Step5UploadProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>('brief');
  const [copiedTab, setCopiedTab] = useState<OutputTab | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [dragOverGeneral, setDragOverGeneral] = useState(false);
  const generalInputRef = useRef<HTMLInputElement>(null);
  const slotInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const totalFiles = Object.keys(slotFiles).length + extraFiles.length;

  const handleSlotFileChange = useCallback(
    async (slotKey: string, fileList: FileList | null) => {
      if (!fileList?.length) return;
      const uploaded = await readFile(fileList[0]);
      onSlotFile(slotKey, uploaded);
    },
    [onSlotFile],
  );

  const handleSlotDrop = useCallback(
    async (slotKey: string, e: React.DragEvent) => {
      e.preventDefault();
      setDragOverSlot(null);
      const files = e.dataTransfer.files;
      if (!files.length) return;
      const uploaded = await readFile(files[0]);
      onSlotFile(slotKey, uploaded);
    },
    [onSlotFile],
  );

  const handleGeneralFileChange = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;
      for (let i = 0; i < fileList.length; i++) {
        const uploaded = await readFile(fileList[i]);
        onAddExtraFile(uploaded);
      }
    },
    [onAddExtraFile],
  );

  const handleGeneralDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverGeneral(false);
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const uploaded = await readFile(files[i]);
        onAddExtraFile(uploaded);
      }
    },
    [onAddExtraFile],
  );

  async function handleCopy(tab: OutputTab) {
    const text = tab === 'brief' ? briefText : promptText;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      // fallback silent
    }
  }

  return (
    <div id="upload-section" className="space-y-8">
      {/* Section 1: Named file slots */}
      {fileSlots.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#F9FAFB]">File theo yêu cầu</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}>
            {fileSlots.map((slot) => {
              const file = slotFiles[slot.key];
              const isDragOver = dragOverSlot === slot.key;

              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(slot.key);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleSlotDrop(slot.key, e)}
                  className={`relative rounded-lg p-3 min-h-[120px] flex flex-col items-center justify-center text-center transition-colors ${
                    file
                      ? 'border border-green-500/50 bg-green-500/5'
                      : isDragOver
                        ? 'border-2 border-dashed border-violet-500 bg-violet-500/5'
                        : 'border border-dashed border-[#1F2937] hover:border-[#4B5563] bg-[#111827]'
                  }`}
                >
                  {file ? (
                    <>
                      {isImageType(file.type) ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded mb-1.5"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-[#1F2937] flex items-center justify-center mb-1.5">
                          <span className="text-lg">📄</span>
                        </div>
                      )}
                      <p className="text-[11px] text-[#F9FAFB] truncate w-full">{file.name}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{formatSize(file.size)}</p>
                      <button
                        type="button"
                        onClick={() => onRemoveSlotFile(slot.key)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                      >
                        <span className="text-red-400 text-xs leading-none">x</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📎</span>
                      <p className="text-[11px] text-[#9CA3AF] mb-1">{slot.label}</p>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          slot.required
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-[#1F2937] text-[#4B5563]'
                        }`}
                      >
                        {slot.required ? 'Cần có' : 'Tuỳ chọn'}
                      </span>
                      <input
                        ref={(el) => {
                          slotInputRefs.current[slot.key] = el;
                        }}
                        type="file"
                        accept={slot.accept}
                        className="hidden"
                        onChange={(e) => handleSlotFileChange(slot.key, e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => slotInputRefs.current[slot.key]?.click()}
                        className="mt-1.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Chọn file
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: General dropzone */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#F9FAFB]">File bổ sung</h3>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverGeneral(true);
          }}
          onDragLeave={() => setDragOverGeneral(false)}
          onDrop={handleGeneralDrop}
          className={`rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOverGeneral
              ? 'border-2 border-dashed border-violet-500 bg-violet-500/5'
              : 'border border-dashed border-[#1F2937] hover:border-[#4B5563] bg-[#111827]'
          }`}
          onClick={() => generalInputRef.current?.click()}
        >
          <span className="text-2xl block mb-2">📂</span>
          <p className="text-sm text-[#9CA3AF]">Thêm file khác</p>
          <p className="text-[11px] text-[#4B5563] mt-1">Kéo thả hoặc click để chọn</p>
          <input
            ref={generalInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleGeneralFileChange(e.target.files)}
          />
        </div>

        {/* Extra files list */}
        {extraFiles.length > 0 && (
          <div className="space-y-1.5">
            {extraFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-2.5 bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2"
              >
                {isImageType(file.type) ? (
                  <img src={file.dataUrl} alt={file.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                  <span className="text-base">📄</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F9FAFB] truncate">{file.name}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExtraFile(i)}
                  className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-colors"
                >
                  <span className="text-red-400 text-xs">x</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Output tabs */}
      <div className="space-y-3">
        <div className="flex gap-1 bg-[#111827] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'brief'
                ? 'bg-violet-600 text-white'
                : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
            }`}
          >
            Tóm tắt cho IT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'prompt'
                ? 'bg-violet-600 text-white'
                : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
            }`}
          >
            Tạo User Story
          </button>
        </div>

        <div className="relative bg-[#0D1117] border border-[#1F2937] rounded-lg">
          <pre className="p-4 text-xs text-[#9CA3AF] font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
            {activeTab === 'brief' ? briefText || 'Chưa có dữ liệu...' : promptText || 'Chưa có dữ liệu...'}
          </pre>
          <button
            type="button"
            onClick={() => handleCopy(activeTab)}
            className="absolute top-2 right-2 px-2.5 py-1 bg-[#1F2937] hover:bg-[#374151] rounded-md text-[10px] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            {copiedTab === activeTab ? 'Đã copy!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Section 4: Send zone */}
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600">
        <div className="bg-[#0D1117] rounded-xl p-5 space-y-4">
          <button
            type="button"
            onClick={onSend}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
          >
            Gửi cho IT
          </button>

          <div className="flex items-center justify-center gap-4 text-[11px]">
            <span className={score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}>
              {score >= 75 ? '>' : score >= 50 ? '~' : '!'} {score}% độ đầy đủ
            </span>
            <span className="text-[#4B5563]">|</span>
            <span className={totalFiles > 0 ? 'text-green-400' : 'text-[#4B5563]'}>
              {totalFiles} file đính kèm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
