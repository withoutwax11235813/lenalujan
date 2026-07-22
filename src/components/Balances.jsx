import { useMemo } from 'react';
import { startOfToday, startOfWeek, startOfMonth, isWithin, formatCurrency } from '../utils/dateHelpers.js';

function computeBalance(orders, expenses, since) {
  const income = orders
    .filter((o) => o.status === 'delivered' && o.paymentStatus === 'paid' && isWithin(o.deliveryDate || o.createdAt, since))
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const spent = expenses
    .filter((e) => isWithin(e.date || e.createdAt, since))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return { income, spent, balance: income - spent };
}

export default function Balances({ orders, expenses }) {
  const periods = useMemo(() => {
    return [
      { label: 'Hoy', since: startOfToday() },
      { label: 'Esta semana', since: startOfWeek() },
      { label: 'Este mes', since: startOfMonth() }
    ].map((p) => ({ ...p, ...computeBalance(orders, expenses, p.since) }));
  }, [orders, expenses]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {periods.map((p) => (
        <div key={p.label} className="rounded-2xl bg-surface border border-surface2 p-4">
          <p className="text-muted text-xs uppercase tracking-wide">{p.label}</p>
          <p
            className={`text-2xl font-bold mt-1 ${p.balance >= 0 ? 'text-accent2' : 'text-danger'}`}
          >
            {formatCurrency(p.balance)}
          </p>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Ingresos: {formatCurrency(p.income)}</span>
            <span>Gastos: {formatCurrency(p.spent)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
