import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { formatCurrency, formatDate } from '../utils/dateHelpers.js';

const CATEGORY_LABELS = {
  fuel: '⛽ Combustible',
  tools: '🔧 Herramientas',
  machinery_maintenance: '🛠️ Mantenimiento',
  supplies: '📦 Insumos',
  other: '🗂️ Otro'
};

export default function ExpenseList({ expenses, users, onEdit }) {
  const handleDelete = async (exp) => {
    const ok = window.confirm(
      `¿Eliminar el gasto "${CATEGORY_LABELS[exp.category] || exp.category}" de ${formatCurrency(exp.amount)}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'expenses', exp.id));
    } catch (err) {
      console.error(err);
      window.alert('No se pudo eliminar el gasto. Probá de nuevo.');
    }
  };

  return (
    <div className="space-y-2">
      {expenses.length === 0 && (
        <p className="text-muted text-sm text-center py-8">Todavía no hay gastos cargados.</p>
      )}

      {expenses.map((exp) => (
        <div key={exp.id} className="rounded-2xl bg-surface border border-surface2 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{CATEGORY_LABELS[exp.category] || exp.category}</p>
              {exp.description && <p className="text-xs text-muted">{exp.description}</p>}
              <p className="text-[10px] text-muted mt-0.5">
                {formatDate(exp.date)} · {users?.[exp.createdBy]?.name || 'Socio'}
              </p>
            </div>
            <p className="font-bold text-danger">-{formatCurrency(exp.amount)}</p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit(exp)}
              className="tap-target flex-1 rounded-xl bg-surface2 text-sm font-semibold py-2"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => handleDelete(exp)}
              className="tap-target flex-1 rounded-xl bg-danger/20 text-danger text-sm font-semibold py-2"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
