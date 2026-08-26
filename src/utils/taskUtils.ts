import { Task, DueStatus } from '../types';

/**
 * Returns date difference in days between due date and today (ignoring time).
 * due_date: YYYY-MM-DD
 */
export function getDaysUntilDue(dueDateStr?: string): number | null {
  if (!dueDateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getTaskDueStatus(task: Task): DueStatus {
  if (task.done) return 'completed';
  if (!task.due_date) return 'none';

  const days = getDaysUntilDue(task.due_date);
  if (days === null) return 'none';

  if (days < 0) return 'delayed';
  if (days <= 2) return 'urgent'; // 0, 1, 2 days left (today is 0, urgent is 0-2)
  return 'normal';
}

export function getStatusBadgeInfo(status: DueStatus): { label: string; bgClass: string; textClass: string } {
  switch (status) {
    case 'completed':
      return { label: '완료됨', bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', textClass: 'text-emerald-700' };
    case 'delayed':
      return { label: '지연됨', bgClass: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', textClass: 'text-rose-700 font-semibold' };
    case 'urgent':
      return { label: '마감임박', bgClass: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-700 font-semibold' };
    case 'normal':
      return { label: '여유', bgClass: 'bg-slate-100 text-slate-600 border-slate-200', textClass: 'text-slate-600' };
    case 'none':
    default:
      return { label: '기한없음', bgClass: 'bg-slate-50 text-slate-500 border-slate-200', textClass: 'text-slate-500' };
  }
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 1st: Pending (done=false) before Completed (done=true)
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    // 2nd: Due status priority: delayed -> urgent -> normal -> none
    const statusA = getTaskDueStatus(a);
    const statusB = getTaskDueStatus(b);
    const statusOrder: Record<DueStatus, number> = {
      delayed: 0,
      urgent: 1,
      normal: 2,
      none: 3,
      completed: 4,
    };
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    // 3rd: Priority: 높음 -> 보통 -> 낮음
    const priorityOrder: Record<string, number> = { 높음: 0, 보통: 1, 낮음: 2 };
    const pA = priorityOrder[a.priority] ?? 1;
    const pB = priorityOrder[b.priority] ?? 1;
    if (pA !== pB) {
      return pA - pB;
    }

    // 4th: Created date ascending
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function parseCSV(text: string): Partial<Task>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Check header
  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t') ? '\t' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('제목') || h.includes('할일'));
  const priorityIdx = headers.findIndex(h => h.includes('priority') || h.includes('우선순위'));
  const categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('분류'));
  const dueDateIdx = headers.findIndex(h => h.includes('due') || h.includes('마감') || h.includes('날짜') || h.includes('일자'));
  const doneIdx = headers.findIndex(h => h.includes('done') || h.includes('완료'));

  const startIndex = (titleIdx !== -1 || priorityIdx !== -1) ? 1 : 0;
  const results: Partial<Task>[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i].split(delimiter).map(val => val.trim().replace(/^["']|["']$/g, ''));
    if (row.length === 0 || !row[0]) continue;

    let title = '';
    let priority: '높음' | '보통' | '낮음' = '보통';
    let category: '설비' | '품질' | '안전' | '행정' | '기타' = '기타';
    let due_date = '';
    let done = false;

    if (startIndex === 1) {
      title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : row[0] || '';
      if (priorityIdx !== -1 && row[priorityIdx]) {
        const p = row[priorityIdx];
        if (p === '높음' || p === '보통' || p === '낮음') priority = p;
      }
      if (categoryIdx !== -1 && row[categoryIdx]) {
        const c = row[categoryIdx];
        if (['설비', '품질', '안전', '행정', '기타'].includes(c)) category = c as any;
      }
      if (dueDateIdx !== -1 && row[dueDateIdx]) {
        due_date = row[dueDateIdx];
      }
      if (doneIdx !== -1 && row[doneIdx]) {
        done = ['true', '1', 'o', 'yes', '완료'].includes(row[doneIdx].toLowerCase());
      }
    } else {
      // Simple raw lines format: title, priority, category, due_date
      title = row[0] || '';
      if (row[1] && ['높음', '보통', '낮음'].includes(row[1])) priority = row[1] as any;
      if (row[2] && ['설비', '품질', '안전', '행정', '기타'].includes(row[2])) category = row[2] as any;
      if (row[3]) due_date = row[3];
    }

    if (title) {
      results.push({
        title,
        priority,
        category,
        due_date: due_date || undefined,
        done,
      });
    }
  }

  return results.slice(0, 500); // Max 500 rows
}
