import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const CATEGORIES = [
  ['fuel', 'Combustible'],
  ['tools', 'Herramientas'],
  ['machinery_maintenance', 'Mantenimiento maquinaria'],
  ['supplies', 'Insumos'],
  ['other', 'Otro']
];

const empty = {
  category: 'fuel',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10)
};

export default function ExpenseForm({ expense, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category || 'fuel',
        amount: expense.amount ?? '',
        description: expense.description || '',
        date: expense.date?.toDate
          ? expense.date.toDate().toISOString().slice(0, 10)
          : empty.date
      });
    } else {
      setForm(empty);
    }
  }, [expense]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount) {
      setError('Ingresá un monto.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        amount: Number(form.amount),
        description: form.description.trim(),
        date: Timestamp.fromDate(new Date(form.date))
      };

      if (expense?.id) {
        await updateDoc(doc(db, 'expenses', expense.id), {
          ...payload,
          updatedBy: user.uid
        });
      } else {
        await addDoc(collection(db, 'expenses'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el gasto. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center px-3">
      <div className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-surface2 max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{expense ? 'Editar gasto' : 'Nuevo gasto'}</h2>
            <button onClick={onClose} className="tap-target text-muted px-2">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-muted mb-1 block">Categoría</label>
              <select
                value={form.category}
                onChange={handleChange('category')}
                className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              >
                {CATEGORIES.map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Monto</label>
              <input
                type="number"
                value={form.amount}
                onChange={handleChange('amount')}
                className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Ej: Nafta camioneta"
                className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
              />
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="tap-target w-full rounded-xl bg-accent text-base font-semibold py-3 disabled:opacity-60 active:scale-[0.98] transition"
            >
              {saving ? 'Guardando...' : 'Guardar gasto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
