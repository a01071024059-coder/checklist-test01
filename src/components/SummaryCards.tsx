import React from 'react';
import { Task } from '../types';
import { getDaysUntilDue } from '../utils/taskUtils';
import { CheckCircle2, AlertTriangle, Clock, ListTodo } from 'lucide-react';

interface SummaryCardsProps {
  tasks: Task[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ tasks, activeFilter, onSelectFilter }) => {
  const total = tasks.length;
  const pending = tasks.filter(t => !t.done).length;
  
  const delayed = tasks.filter(t => {
    if (t.done || !t.due_date) return false;
    const days = getDaysUntilDue(t.due_date);
    return days !== null && days < 0;
  }).length;

  const urgentToday = tasks.filter(t => {
    if (t.done || !t.due_date) return false;
    const days = getDaysUntilDue(t.due_date);
    return days === 0;
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {/* 전체 카드 */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          activeFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            전체 업무
          </span>
          <ListTodo className={`w-4 h-4 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{total}</div>
      </button>

      {/* 미완료 카드 */}
      <button
        onClick={() => onSelectFilter('pending')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          activeFilter === 'pending'
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${activeFilter === 'pending' ? 'text-indigo-100' : 'text-slate-500'}`}>
            미완료
          </span>
          <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'pending' ? 'text-indigo-200' : 'text-indigo-500'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{pending}</div>
      </button>

      {/* 오늘 마감 카드 */}
      <button
        onClick={() => onSelectFilter('urgent')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          activeFilter === 'urgent'
            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200 hover:border-amber-200 hover:bg-amber-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${activeFilter === 'urgent' ? 'text-amber-100' : 'text-slate-500'}`}>
            오늘 마감·임박
          </span>
          <Clock className={`w-4 h-4 ${activeFilter === 'urgent' ? 'text-amber-200' : 'text-amber-500'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{urgentToday}</div>
      </button>

      {/* 지연 카드 */}
      <button
        onClick={() => onSelectFilter('delayed')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          activeFilter === 'delayed'
            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200 hover:border-rose-200 hover:bg-rose-50/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${activeFilter === 'delayed' ? 'text-rose-100' : 'text-slate-500'}`}>
            지연됨
          </span>
          <AlertTriangle className={`w-4 h-4 ${activeFilter === 'delayed' ? 'text-rose-200' : 'text-rose-500'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{delayed}</div>
      </button>
    </div>
  );
};
