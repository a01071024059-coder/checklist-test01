import React, { useState } from 'react';
import { Task } from '../types';
import { parseCSV } from '../utils/taskUtils';
import { X, Upload, Copy, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportTasks: (newTasks: Partial<Task>[]) => void;
  onRestoreAll: (tasks: Task[]) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportTasks,
  onRestoreAll,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json'>('csv');
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setMessage({ type: 'success', text: '파일을 성공적으로 읽었습니다. 아래 등록 버튼을 눌러주세요.' });
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: '파일을 읽는 중 오류가 발생했습니다.' });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportCSVSubmit = () => {
    if (!csvText.trim()) {
      setMessage({ type: 'error', text: '등록할 CSV 내용이 없습니다.' });
      return;
    }
    try {
      const parsed = parseCSV(csvText);
      if (parsed.length === 0) {
        setMessage({ type: 'error', text: '유효한 업무 항목을 찾지 못했습니다. 형식(제목, 우선순위, 분류, 마감일)을 확인하세요.' });
        return;
      }
      onImportTasks(parsed);
      setMessage({ type: 'success', text: `${parsed.length}건의 업무가 성공적으로 추가되었습니다!` });
      setTimeout(() => {
        onClose();
        setCsvText('');
        setMessage(null);
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: 'CSV 파싱 중 오류가 발생했습니다.' });
    }
  };

  const handleCopyJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    navigator.clipboard.writeText(dataStr);
    setMessage({ type: 'success', text: '현재 업무 목록 JSON이 클립보드에 복사되었습니다.' });
  };

  const handleRestoreJSONSubmit = () => {
    if (!jsonText.trim()) {
      setMessage({ type: 'error', text: '복원할 JSON 텍스트를 입력해주세요.' });
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setMessage({ type: 'error', text: '올바른 업무 목록 JSON 형식이 아닙니다 (배열 형태 필요).' });
        return;
      }
      onRestoreAll(parsed);
      setMessage({ type: 'success', text: `${parsed.length}건의 데이터로 복원 완료되었습니다!` });
      setTimeout(() => {
        onClose();
        setJsonText('');
        setMessage(null);
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: 'JSON 구문 분석 오류가 발생했습니다. 형식을 확인해주세요.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-800">
            데이터 일괄 등록 및 백업
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환 */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('csv'); setMessage(null); }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            CSV 일괄 등록
          </button>
          <button
            onClick={() => { setActiveTab('json'); setMessage(null); setJsonText(JSON.stringify(tasks, null, 2)); }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            JSON 백업 및 복원
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 text-sm rounded-xl border ${
                message.type === 'success'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'csv' ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">📌 CSV 형식 안내</p>
                <p>• 첫 행은 헤더(제목, 우선순위, 분류, 마감일)를 권장합니다.</p>
                <p>• 예시: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700">반응기 점검,높음,설비,2026-08-30</code></p>
                <p>• 우선순위: 높음/보통/낮음 | 분류: 설비/품질/안전/행정/기타</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CSV 파일 업로드
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  또는 CSV 텍스트 직접 붙여넣기
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="제목,우선순위,분류,마감일&#10;공정 점검,높음,안전,2026-08-28&#10;재고 파악,보통,행정,"
                  rows={5}
                  className="w-full px-3.5 py-2 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleImportCSVSubmit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>일괄 등록 실행</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">현재 데이터 백업 (JSON)</span>
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>클립보드 복사</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  JSON 복원 (붙여넣기)
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="여기에 백업한 JSON 문자열을 붙여넣으세요..."
                  rows={8}
                  className="w-full px-3.5 py-2 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleRestoreJSONSubmit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>JSON 데이터로 전체 교체 복원</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
