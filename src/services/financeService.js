export const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const summarizeTransactions = (items) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return {
    total,
    count: items.length,
  };
};

export const getUpcomingExpenseReminders = (expenses = [], days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expenses
    .filter((item) => item?.status !== "paid" && item?.paidThisMonth !== true && item?.date)
    .map((item) => {
      const dueDate = new Date(item.date);
      if (Number.isNaN(dueDate.getTime())) return null;

      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dueDate - today) / 86400000);
      const reminderWindow = Number(item.reminderDays) || days;

      if (diffDays < 0 || diffDays > reminderWindow) return null;

      return {
        ...item,
        daysUntil: diffDays,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysUntil - b.daysUntil);
};
