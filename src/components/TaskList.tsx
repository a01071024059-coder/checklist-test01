import React, { useState } from 'react';
import { Task, Category, FilterStatus } from '../types';
import { TaskItem } from './TaskItem';
import { Search, Filter, Plus, Trash2, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  onToggleDone: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenBatchModal: () => void;
  onDeleteCompleted: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeFilter,
  onSelectFilter,
  onToggleDone,
  onEdit,
  onDelete,
  onOpenAddModal,
  onOpenBatchModal,
  onDeleteCompleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchMemo = task.memo?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchMemo) return false;
    }

    // Category match
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    // Status filter match
    if (activeFilter === 'pending') {
      return !task.done;
    }
    if (activeFilter === 'completed') {
      return task.done;
    }
    if (activeFilter === 'urgent') {
      if (task.done || !task.due_date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [y, m, d] = task.due_date.split('-').map(Number);
      const due = new Date(y, m - 1, d);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    }
    if (activeFilter === 'delayed') {
      if (task.done || !task.due_date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [y, m, d] = task.due_date.split('-').map(Number);
      const due = new Date(y, m - 1, d);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays < 0;
    }

    return true; // 'all'
  });

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <div className="space-y-4">
      {/* 상단 검색 및 필터 컨트롤 바 */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {/* 검색 입력 */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="업무 제목 또는 메모 검색..."
              className="w-full pl-10 pr-3.5 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* 분류 필터 및 액션 버튼 */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">모든 분류</option>
                <option value="설비">설비</option>
                <option value="품질">품질</option>
                <option value="안전">안전</option>
                <option value="행정">행정</option>
                <option value="기타">기타</option>
              </select>
              <Filter className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={onOpenBatchModal}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="CSV 일괄등록 및 백업"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">일괄/백업</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={onDeleteCompleted}
                className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
                title="완료된 항목 전체 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">완료 청소</span>
              </button>
            )}
          </div>
        </div>

        {/* 상태 필터 탭 바 (F-05) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100">
          {[
            { id: 'all', label: '전체' },
            { id: 'pending', label: '미완료' },
            { id: 'urgent', label: '마감임박·오늘' },
            { id: 'delayed', label: '지연됨' },
            { id: 'completed', label: '완료됨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id as FilterStatus)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 업무 목록 헤더 & 신규등록 버튼 */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          업무 목록 ({filteredTasks.length}건)
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>새 업무 추가</span>
        </button>
      </div>

      {/* 목록 컨테이너 */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">등록된 업무가 없습니다</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all' || activeFilter !== 'all'
              ? '조건에 일치하는 업무가 없습니다. 필터를 초기화해보세요.'
              : '새로운 업무를 등록하거나 CSV 일괄등록을 통해 업무를 시작하세요.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>첫 업무 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleDone={onToggleDone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
