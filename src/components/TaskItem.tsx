import React from 'react';
import { Task } from '../types';
import { getTaskDueStatus, getStatusBadgeInfo } from '../utils/taskUtils';
import { Calendar, Edit3, Trash2, Check, Clock } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleDone, onEdit, onDelete }) => {
  const dueStatus = getTaskDueStatus(task);
  const badgeInfo = getStatusBadgeInfo(dueStatus);

  const priorityColors = {
    높음: 'bg-rose-50 text-rose-700 border-rose-200',
    보통: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    낮음: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const categoryColors = {
    설비: 'bg-blue-50 text-blue-700 border-blue-200',
    품질: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    안전: 'bg-amber-50 text-amber-700 border-amber-200',
    행정: 'bg-purple-50 text-purple-700 border-purple-200',
    기타: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
        task.done ? 'border-slate-200 bg-slate-50/60 opacity-75' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* 체크박스 */}
        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            task.done
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-indigo-500 bg-white'
          }`}
          title={task.done ? '미완료로 변경' : '완료로 변경'}
        >
          {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* 본문 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* 분류 배지 */}
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
                categoryColors[task.category] || categoryColors.기타
              }`}
            >
              {task.category}
            </span>

            {/* 우선순위 배지 */}
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {/* 상태 / 마감일 배지 */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border ${badgeInfo.bgClass}`}
            >
              <Clock className="w-3 h-3" />
              {task.due_date ? `${task.due_date} (${badgeInfo.label})` : badgeInfo.label}
            </span>
          </div>

          {/* 제목 */}
          <h4
            className={`text-sm sm:text-base font-medium text-slate-800 break-words leading-snug ${
              task.done ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* 메모 */}
          {task.memo && (
            <p className="mt-1.5 text-xs text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100 whitespace-pre-wrap">
              {task.memo}
            </p>
          )}

          {/* 완료 시간 표시 */}
          {task.done && task.completedAt && (
            <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center gap-1">
              <span>완료됨: {new Date(task.completedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 액션 버튼 (수정, 삭제) */}
        <div className="shrink-0 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="수정"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
