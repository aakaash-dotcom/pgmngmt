// Date utilities for Agam PG Management

export const getTodayDateString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getCurrentMonthYear = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const getCurrentFullMonthYear = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const formatMonthYearFromDateString = (dateStr: string): string => {
  try {
    if (!dateStr) return getCurrentMonthYear();
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = parts[2] ? Number(parts[2]) : 1;
      const date = new Date(y, m, d);
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }
  } catch {}
  return getCurrentMonthYear();
};

export const getMonthList = (rangeBack: number = 6, rangeForward: number = 2): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = -rangeBack; i <= rangeForward; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }));
  }
  return months;
};

export const getDueDateString = (dayOfMonth: number = 5): string => {
  const d = new Date();
  const day = String(dayOfMonth).padStart(2, '0');
  const m = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
  return `${day} ${m}`;
};
