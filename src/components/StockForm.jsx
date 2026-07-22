import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const empty = {
  kg: '',
  note: '',
  date: new Date().toISOString().slice(0, 10)
};

export default function StockForm({ movement, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movement) {
      setForm({
        kg: movement.kg ?? '',
        note: movement.note || '',
        date: movement.date?.toDate
          ? movement.date.toDate().toISOString().slice(0, 10)
          : empty.date
      });
    } else {
      setForm(empty);
    }
  }, [movement]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.kg || Number(form.kg) <= 0) {
      setError('Ingresá los kilos que entraron (mayor a 0).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        kg: Number(form.kg),
        note: form.note.trim(),
        date: Timestamp.fromDate(new Date(form.date))
      };

      if (movement?.id) {
        await updateDoc(doc(db, 'stock_movements', movement.id), {
          ...payload,
          updatedBy: user.uid
        });
      } else {
        await addDoc(collection(db, 'stock_movements'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el ingreso de stock. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center px-3">
      <div className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-surface2 max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{movement ? 'Editar ingreso' : 'Nuevo ingreso de leña'}</h2>
            <button onClick={onClose} className="tap-target text-muted px-2">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-muted mb-1 block">Kilos que ingresan</label>
              <input
                type="number"
                value={form.kg}
                onChange={handleChange('kg')}
                className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Nota (opcional)</label>
              <input
                type="text"
                value={form.note}
                onChange={handleChange('note')}
                placeholder="Ej: Compra a proveedor / Corte propio"
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
              {saving ? 'Guardando...' : 'Guardar ingreso'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
