import React, { useState, useEffect } from 'react';
import { Task, Priority, Category } from '../types';
import { X, Calendar, Tag, AlertCircle, FileText } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { title: string; priority: Priority; category: Category; due_date?: string; memo?: string }) => void;
  editingTask?: Task | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('보통');
  const [category, setCategory] = useState<Category>('설비');
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setDueDate(editingTask.due_date || '');
      setMemo(editingTask.memo || '');
    } else {
      setTitle('');
      setPriority('보통');
      setCategory('설비');
      // Default due date to today or empty
      setDueDate('');
      setMemo('');
    }
    setError('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('업무 제목을 입력해주세요.');
      return;
    }
    if (title.length > 100) {
      setError('제목은 100자 이내로 입력해주세요.');
      return;
    }

    onSave({
      title: title.trim(),
      priority,
      category,
      due_date: dueDate ? dueDate : undefined,
      memo: memo.trim() ? memo.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-800">
            {editingTask ? '업무 수정' : '새 업무 등록'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              업무 내용 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 제2공장 반응기 압력계 교체"
              maxLength={100}
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              autoFocus
            />
            <div className="flex justify-end mt-1 text-[11px] text-slate-400">
              {title.length}/100자
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 분류 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                분류
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="설비">설비</option>
                  <option value="품질">품질</option>
                  <option value="안전">안전</option>
                  <option value="행정">행정</option>
                  <option value="기타">기타</option>
                </select>
                <Tag className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                우선순위
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {(['높음', '보통', '낮음'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      priority === p
                        ? p === '높음'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : p === '보통'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 마감일 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              마감일 (선택)
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              상세 메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="참고사항이나 특이사항을 입력하세요..."
              rows={2}
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              {editingTask ? '수정 완료' : '업무 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
