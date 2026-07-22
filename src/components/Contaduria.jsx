import { useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  accountsReceivable,
  expensesByCategory,
  lastMonths,
  monthlySeries,
  projectNextMonth,
  topClients
} from '../utils/accounting.js';
import { formatCurrency } from '../utils/dateHelpers.js';

const CATEGORY_LABELS = {
  fuel: 'Combustible',
  tools: 'Herramientas',
  machinery_maintenance: 'Mantenimiento maquinaria',
  supplies: 'Insumos',
  other: 'Otro'
};

function Card({ label, value, tone = 'text-slate-100', hint }) {
  return (
    <div className="rounded-2xl bg-surface border border-surface2 p-4">
      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function Contaduria({ orders, expenses }) {
  const months = useMemo(() => lastMonths(6), []);
  const series = useMemo(() => monthlySeries(orders, expenses, months), [orders, expenses, months]);
  const categories = useMemo(() => expensesByCategory(expenses), [expenses]);
  const clients = useMemo(() => topClients(orders), [orders]);
  const receivable = useMemo(() => accountsReceivable(orders), [orders]);
  const projection = useMemo(() => projectNextMonth(series), [series]);

  const totalKgAllTime = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.weightKg || 0), 0);

  const avgTicket = (() => {
    const delivered = orders.filter((o) => o.status === 'delivered');
    if (delivered.length === 0) return 0;
    return delivered.reduce((s, o) => s + Number(o.totalAmount || 0), 0) / delivered.length;
  })();

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const monthlySheet = series.map((m) => ({
      Mes: m.label,
      Ingresos: m.income,
      Gastos: m.expenses,
      Balance: m.balance,
      'Kg vendidos': m.kg
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlySheet), 'Mensual');

    const categorySheet = categories.map((c) => ({
      Categoría: CATEGORY_LABELS[c.category] || c.category,
      Monto: c.amount,
      Porcentaje: `${c.pct.toFixed(1)}%`
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categorySheet), 'Gastos por categoria');

    const clientsSheet = clients.map((c, i) => ({
      '#': i + 1,
      Cliente: c.name,
      Total: c.total,
      Pedidos: c.orders,
      'Kg totales': c.kg
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientsSheet), 'Mejores clientes');

    const receivableSheet = receivable.orders.map((o) => ({
      Cliente: o.customerName,
      Monto: o.totalAmount,
      Estado: o.status
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(receivableSheet), 'Cuentas por cobrar');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `lena-contaduria-${today}.xlsx`);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Export actions */}
      <div className="flex gap-2 no-print">
        <button
          onClick={exportToExcel}
          className="tap-target flex-1 rounded-xl bg-accent2/20 text-accent2 text-sm font-semibold py-3"
        >
          📊 Exportar a Excel
        </button>
        <button
          onClick={exportToPDF}
          className="tap-target flex-1 rounded-xl bg-surface2 text-sm font-semibold py-3"
        >
          🖨️ Exportar a PDF
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card
          label="Cuentas por cobrar"
          value={formatCurrency(receivable.total)}
          tone="text-danger"
          hint={`${receivable.count} pedido(s) sin cobrar`}
        />
        <Card label="Ticket promedio" value={formatCurrency(avgTicket)} />
        <Card label="Kg vendidos (histórico)" value={`${totalKgAllTime.toLocaleString('es-AR')} Kg`} />
      </div>

      {/* Monthly income vs expenses */}
      <div className="rounded-2xl bg-surface border border-surface2 p-4">
        <h3 className="font-bold mb-3">Ingresos vs Gastos por mes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273449" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #273449', borderRadius: 8 }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance trend */}
      <div className="rounded-2xl bg-surface border border-surface2 p-4">
        <h3 className="font-bold mb-3">Tendencia del balance</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273449" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #273449', borderRadius: 8 }}
                formatter={(value) => formatCurrency(value)}
              />
              <Line type="monotone" dataKey="balance" name="Balance" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projection */}
      {projection && (
        <div className="rounded-2xl bg-surface2 border border-surface2 p-4">
          <h3 className="font-bold mb-1">Proyección próximo mes</h3>
          <p className="text-[11px] text-muted mb-3">
            Estimado según el promedio de los últimos {projection.basedOnMonths} mes(es) completos.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted">Ingresos est.</p>
              <p className="font-bold text-accent2">{formatCurrency(projection.income)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Gastos est.</p>
              <p className="font-bold text-danger">{formatCurrency(projection.expenses)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Balance est.</p>
              <p className={`font-bold ${projection.balance >= 0 ? 'text-accent2' : 'text-danger'}`}>
                {formatCurrency(projection.balance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expense breakdown by category */}
      <div className="rounded-2xl bg-surface border border-surface2 p-4">
        <h3 className="font-bold mb-3">Gastos por categoría (histórico)</h3>
        {categories.length === 0 && <p className="text-sm text-muted">Todavía no hay gastos cargados.</p>}
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.category}>
              <div className="flex justify-between text-sm mb-1">
                <span>{CATEGORY_LABELS[c.category] || c.category}</span>
                <span className="text-muted">{formatCurrency(c.amount)} · {c.pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top clients */}
      <div className="rounded-2xl bg-surface border border-surface2 p-4">
        <h3 className="font-bold mb-3">Mejores clientes (histórico)</h3>
        {clients.length === 0 && <p className="text-sm text-muted">Todavía no hay pedidos cargados.</p>}
        <div className="space-y-2">
          {clients.map((c, i) => (
            <div key={c.name} className="flex justify-between items-center text-sm">
              <span>
                <span className="text-muted mr-2">#{i + 1}</span>
                {c.name}
              </span>
              <span className="text-right">
                <span className="font-semibold text-accent2">{formatCurrency(c.total)}</span>
                <span className="text-muted"> · {c.orders} pedido(s)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accounts receivable detail */}
      {receivable.orders.length > 0 && (
        <div className="rounded-2xl bg-surface border border-surface2 p-4">
          <h3 className="font-bold mb-3">Detalle de cuentas por cobrar</h3>
          <div className="space-y-2">
            {receivable.orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <span>{o.customerName}</span>
                <span className="font-semibold text-danger">{formatCurrency(o.totalAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
