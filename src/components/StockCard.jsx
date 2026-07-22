import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { currentStock } from '../utils/stock.js';
import { formatDate } from '../utils/dateHelpers.js';

export default function StockCard({ stockMovements, orders, onEdit }) {
  const [showHistory, setShowHistory] = useState(false);
  const stock = currentStock(stockMovements, orders);

  const handleDelete = async (m) => {
    const ok = window.confirm(`¿Eliminar el ingreso de ${m.kg} Kg? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'stock_movements', m.id));
    } catch (err) {
      console.error(err);
      window.alert('No se pudo eliminar el ingreso. Probá de nuevo.');
    }
  };

  return (
    <div className="rounded-2xl bg-surface border border-surface2 p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted text-xs uppercase tracking-wide">Stock disponible</p>
          <p className={`text-2xl font-bold mt-1 ${stock >= 0 ? 'text-accent2' : 'text-danger'}`}>
            {stock.toLocaleString('es-AR')} Kg
          </p>
        </div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="tap-target text-sm text-muted px-3"
        >
          {showHistory ? 'Ocultar historial ▲' : 'Ver historial ▼'}
        </button>
      </div>

      {showHistory && (
        <div className="mt-3 space-y-2 border-t border-surface2 pt-3">
          {stockMovements.length === 0 && (
            <p className="text-sm text-muted">Todavía no cargaste ingresos de leña.</p>
          )}
          {stockMovements.map((m) => (
            <div key={m.id} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-semibold text-accent2">+{m.kg} Kg</span>
                {m.note && <span className="text-muted"> · {m.note}</span>}
                <p className="text-[10px] text-muted">{formatDate(m.date)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(m)}
                  className="tap-target text-xs px-2 py-1 rounded-lg bg-surface2"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(m)}
                  className="tap-target text-xs px-2 py-1 rounded-lg bg-danger/20 text-danger"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
