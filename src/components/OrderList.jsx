import { useState } from 'react';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { daysSince, formatCurrency, formatDate } from '../utils/dateHelpers.js';
import { shareReceiptOnWhatsApp } from '../utils/whatsapp.js';

const FILTERS = [
  ['pending', 'Pendientes'],
  ['delivered', 'Completados'],
  ['all', 'Todos']
];

const STALE_DAYS = 3;

export default function OrderList({ orders, onEdit }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const filtered = orders
    .filter((o) => {
      if (filter === 'all') return true;
      if (filter === 'pending') return o.status === 'pending';
      return o.status === 'delivered';
    })
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q)
      );
    });

  const markDeliveredAndPaid = async (order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'delivered',
        paymentStatus: 'paid',
        updatedBy: user.uid
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (order) => {
    const ok = window.confirm(
      `¿Eliminar el pedido de ${order.customerName}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'orders', order.id));
    } catch (err) {
      console.error(err);
      window.alert('No se pudo eliminar el pedido. Probá de nuevo.');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`tap-target px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === value ? 'bg-accent text-base' : 'bg-surface2 text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔎 Buscar cliente, teléfono o dirección..."
        className="tap-target w-full rounded-xl bg-surface border border-surface2 px-4 py-3 text-sm text-slate-100 outline-none focus:border-accent mb-3"
      />

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-8">No hay pedidos en esta vista.</p>
        )}

        {filtered.map((order) => (
          <div key={order.id} className="rounded-2xl bg-surface border border-surface2 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-xs text-muted">{order.weightKg} Kg · {formatDate(order.deliveryDate)}</p>
                {order.status === 'pending' && daysSince(order.createdAt) >= STALE_DAYS && (
                  <p className="text-[10px] text-amber-400 mt-0.5">
                    ⚠️ Pendiente hace {daysSince(order.createdAt)} días
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-accent2">{formatCurrency(order.totalAmount)}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-accent2/20 text-accent2' : 'bg-danger/20 text-danger'
                  }`}
                >
                  {order.paymentStatus === 'paid' ? 'Pagado' : 'Sin pagar'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => onEdit(order)}
                className="tap-target flex-1 rounded-xl bg-surface2 text-sm font-semibold py-2"
              >
                ✏️ Editar
              </button>
              {order.status !== 'delivered' && (
                <button
                  onClick={() => markDeliveredAndPaid(order)}
                  className="tap-target flex-1 rounded-xl bg-accent2/20 text-accent2 text-sm font-semibold py-2"
                >
                  ✅ Entregado y pagado
                </button>
              )}
              <button
                onClick={() => shareReceiptOnWhatsApp(order)}
                className="tap-target flex-1 rounded-xl bg-[#25D366]/20 text-[#25D366] text-sm font-semibold py-2"
              >
                📲 Enviar recibo
              </button>
              <button
                onClick={() => handleDelete(order)}
                className="tap-target flex-1 rounded-xl bg-danger/20 text-danger text-sm font-semibold py-2"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
