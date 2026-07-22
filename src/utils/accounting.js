import { toJsDate } from './dateHelpers.js';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Builds the last `count` months (oldest -> newest), including the
// current one, as { key, label } so charts always have a full,
// gap-free timeline even for months with zero activity.
export function lastMonths(count = 6) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` });
  }
  return months;
}

// Income counts only delivered + paid orders (matches the balance
// cards logic), bucketed by the month they were delivered.
export function monthlySeries(orders, expenses, months) {
  const incomeByMonth = {};
  const expenseByMonth = {};
  const kgByMonth = {};

  orders
    .filter((o) => o.status === 'delivered' && o.paymentStatus === 'paid')
    .forEach((o) => {
      const d = toJsDate(o.deliveryDate || o.createdAt);
      if (!d) return;
      const key = monthKey(d);
      incomeByMonth[key] = (incomeByMonth[key] || 0) + Number(o.totalAmount || 0);
      kgByMonth[key] = (kgByMonth[key] || 0) + Number(o.weightKg || 0);
    });

  expenses.forEach((e) => {
    const d = toJsDate(e.date || e.createdAt);
    if (!d) return;
    const key = monthKey(d);
    expenseByMonth[key] = (expenseByMonth[key] || 0) + Number(e.amount || 0);
  });

  return months.map((m) => ({
    ...m,
    income: incomeByMonth[m.key] || 0,
    expenses: expenseByMonth[m.key] || 0,
    balance: (incomeByMonth[m.key] || 0) - (expenseByMonth[m.key] || 0),
    kg: kgByMonth[m.key] || 0
  }));
}

export function expensesByCategory(expenses) {
  const totals = {};
  let grandTotal = 0;
  expenses.forEach((e) => {
    const cat = e.category || 'other';
    totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    grandTotal += Number(e.amount || 0);
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: grandTotal > 0 ? (amount / grandTotal) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function topClients(orders, limit = 5) {
  const totals = {};
  orders
    .filter((o) => o.status !== 'cancelled')
    .forEach((o) => {
      const name = o.customerName || 'Sin nombre';
      totals[name] = totals[name] || { name, total: 0, orders: 0, kg: 0 };
      totals[name].total += Number(o.totalAmount || 0);
      totals[name].orders += 1;
      totals[name].kg += Number(o.weightKg || 0);
    });
  return Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function accountsReceivable(orders) {
  const unpaid = orders.filter((o) => o.status !== 'cancelled' && o.paymentStatus !== 'paid');
  return {
    count: unpaid.length,
    total: unpaid.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    orders: unpaid
  };
}

// Very simple projection: average of the last 3 complete months
// (excluding the current, still-in-progress month) for income and
// expenses, extended one month forward. Intentionally simple --
// good enough for "where are we headed" at a glance, not a forecast
// model.
export function projectNextMonth(series) {
  const completeMonths = series.slice(0, -1).slice(-3);
  if (completeMonths.length === 0) return null;

  const avgIncome = completeMonths.reduce((s, m) => s + m.income, 0) / completeMonths.length;
  const avgExpenses = completeMonths.reduce((s, m) => s + m.expenses, 0) / completeMonths.length;

  return {
    income: avgIncome,
    expenses: avgExpenses,
    balance: avgIncome - avgExpenses,
    basedOnMonths: completeMonths.length
  };
}
