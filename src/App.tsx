import React, { useState, useEffect } from 'react';
import { Task, Priority, Category, FilterStatus } from './types';
import { sortTasks } from './utils/taskUtils';
import { SummaryCards } from './components/SummaryCards';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { BatchImportModal } from './components/BatchImportModal';
import { CheckSquare, ShieldCheck, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'PERSONAL_WORK_CHECKLIST_TASKS_V1';

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: '제2공장 반응기 압력계 교체 및 누출 점검',
    priority: '높음',
    category: '설비',
    due_date: new Date().toISOString().split('T')[0], // Today
    done: false,
    createdAt: new Date().toISOString(),
    memo: '오전 10시 정비팀 입회 하에 작업 진행할 것.',
  },
  {
    id: '2',
    title: '1분기 품질 관리 지표 검토 및 보고서 작성',
    priority: '보통',
    category: '품질',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '지게차 일일 안전 점검 및 충전 상태 확인',
    priority: '높음',
    category: '안전',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (delayed)
    done: false,
    createdAt: new Date().toISOString(),
    memo: '우측 후방 타이어 마모 상태 주의',
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return INITIAL_DEMO_TASKS;
  });

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [tasks]);

  const handleToggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          return {
            ...t,
            done: nextDone,
            completedAt: nextDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData: {
    title: string;
    priority: Priority;
    category: Category;
    due_date?: string;
    memo?: string;
  }) => {
    if (editingTask) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                ...taskData,
              }
            : t
        )
      );
      setEditingTask(null);
    } else {
      // Create new
      const newTask: Task = {
        id: 'task_' + Date.now() + Math.random().toString(36).substr(2, 4),
        title: taskData.title,
        priority: taskData.priority,
        category: taskData.category,
        due_date: taskData.due_date,
        memo: taskData.memo,
        done: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('정말 이 업무를 삭제하시겠습니까?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleDeleteCompleted = () => {
    if (window.confirm('완료된 모든 업무 항목을 삭제하시겠습니까?')) {
      setTasks((prev) => prev.filter((t) => !t.done));
    }
  };

  const handleImportTasks = (newItems: Partial<Task>[]) => {
    const formatted: Task[] = newItems.map((item, index) => ({
      id: 'import_' + Date.now() + '_' + index,
      title: item.title || '제목 없음',
      priority: item.priority || '보통',
      category: item.category || '기타',
      due_date: item.due_date,
      done: item.done || false,
      completedAt: item.done ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...formatted, ...prev]);
  };

  const handleRestoreAll = (restoredTasks: Task[]) => {
    setTasks(restoredTasks);
  };

  const sortedTasks = sortTasks(tasks);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans flex flex-col items-center">
      {/* 상단 헤더 */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>개인 업무 체크리스트</span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-500">생산 현장 및 개인 업무 완결형 체크리스트</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>로컬 저장소 동기화 중</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 (최대폭 640px~768px 모바일 최적화) */}
      <main className="w-full max-w-3xl px-4 py-5 flex-1 flex flex-col">
        {/* 요약 카운터 (F-07) */}
        <SummaryCards
          tasks={tasks}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />

        {/* 업무 목록 및 필터 컨트롤 */}
        <TaskList
          tasks={sortedTasks}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onToggleDone={handleToggleDone}
          onEdit={(task) => {
            setEditingTask(task);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteTask}
          onOpenAddModal={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          onOpenBatchModal={() => setIsBatchOpen(true)}
          onDeleteCompleted={handleDeleteCompleted}
        />
      </main>

      {/* 푸터 */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto bg-white">
        <p>개인 업무 체크리스트 © 2026. 브라우저 로컬 저장소에 안전하게 보관됩니다.</p>
      </footer>

      {/* 업무 등록/수정 모달 (F-01, F-06) */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      {/* CSV 일괄 등록 및 JSON 백업 모달 (F-08a, F-10) */}
      <BatchImportModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        tasks={tasks}
        onImportTasks={handleImportTasks}
        onRestoreAll={handleRestoreAll}
      />
    </div>
  );
}
