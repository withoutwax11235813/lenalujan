import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import Balances from './Balances.jsx';
import OrderList from './OrderList.jsx';
import ExpenseList from './ExpenseList.jsx';
import OrderForm from './OrderForm.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import Contaduria from './Contaduria.jsx';
import StockCard from './StockCard.jsx';
import StockForm from './StockForm.jsx';
import FAB from './FAB.jsx';
import { daysSince } from '../utils/dateHelpers.js';

const TABS = [
  ['orders', '📦 Pedidos'],
  ['expenses', '💸 Gastos'],
  ['accounting', '📊 Contaduría']
];

const STALE_DAYS = 3;

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [tab, setTab] = useState('orders');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQ, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const expensesQ = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubExpenses = onSnapshot(expensesQ, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const stockQ = query(collection(db, 'stock_movements'), orderBy('createdAt', 'desc'));
    const unsubStock = onSnapshot(stockQ, (snap) => {
      setStockMovements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubOrders();
      unsubExpenses();
      unsubStock();
    };
  }, []);

  const stalePending = useMemo(
    () => orders.filter((o) => o.status === 'pending' && daysSince(o.createdAt) >= STALE_DAYS),
    [orders]
  );

  const openNewOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const openEditOrder = (order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const openNewExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const openNewStock = () => {
    setEditingStock(null);
    setShowStockForm(true);
  };

  const openEditStock = (movement) => {
    setEditingStock(movement);
    setShowStockForm(true);
  };

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 bg-base/95 backdrop-blur border-b border-surface2 px-4 py-3 flex items-center justify-between no-print">
        <div>
          <p className="text-xs text-muted">Hola,</p>
          <p className="font-bold">{profile?.name || 'Socio'}</p>
        </div>
        <button onClick={logout} className="tap-target text-sm text-muted px-3">
          Salir
        </button>
      </header>

      <main className="px-4 pt-4 space-y-5">
        {stalePending.length > 0 && (
          <button
            onClick={() => setTab('orders')}
            className="w-full text-left rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 no-print"
          >
            <p className="text-sm font-semibold text-amber-400">
              ⚠️ Tenés {stalePending.length} pedido(s) pendiente(s) hace {STALE_DAYS}+ días
            </p>
            <p className="text-xs text-muted mt-0.5">
              {stalePending.slice(0, 3).map((o) => o.customerName).join(', ')}
              {stalePending.length > 3 ? '...' : ''} — tocá para verlos
            </p>
          </button>
        )}

        <Balances orders={orders} expenses={expenses} />

        <StockCard stockMovements={stockMovements} orders={orders} onEdit={openEditStock} />

        <div className="flex gap-2 no-print">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`tap-target flex-1 rounded-xl py-2 text-sm font-semibold ${
                tab === value ? 'bg-accent text-base' : 'bg-surface2 text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && <OrderList orders={orders} onEdit={openEditOrder} />}
        {tab === 'expenses' && (
          <ExpenseList expenses={expenses} onEdit={openEditExpense} />
        )}
        {tab === 'accounting' && <Contaduria orders={orders} expenses={expenses} />}
      </main>

      {tab !== 'accounting' && (
        <FAB onNewOrder={openNewOrder} onNewExpense={openNewExpense} onNewStock={openNewStock} />
      )}

      {showOrderForm && (
        <OrderForm order={editingOrder} onClose={() => setShowOrderForm(false)} />
      )}
      {showExpenseForm && (
        <ExpenseForm expense={editingExpense} onClose={() => setShowExpenseForm(false)} />
      )}
      {showStockForm && (
        <StockForm movement={editingStock} onClose={() => setShowStockForm(false)} />
      )}
    </div>
  );
}
