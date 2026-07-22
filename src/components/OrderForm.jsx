import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const emptyForm = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  weightKg: '',
  pricePerKg: '',
  status: 'pending',
  paymentStatus: 'unpaid',
  deliveryDate: new Date().toISOString().slice(0, 10)
};

export default function OrderForm({ order, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setForm({
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        deliveryAddress: order.deliveryAddress || '',
        weightKg: order.weightKg ?? '',
        pricePerKg: order.pricePerKg ?? '',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'unpaid',
        deliveryDate: order.deliveryDate?.toDate
          ? order.deliveryDate.toDate().toISOString().slice(0, 10)
          : emptyForm.deliveryDate
      });
    } else {
      setForm(emptyForm);
    }
  }, [order]);

  const total = (Number(form.weightKg) || 0) * (Number(form.pricePerKg) || 0);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.customerName || !form.weightKg || !form.pricePerKg) {
      setError('Completá cliente, kilos y precio por kilo.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        weightKg: Number(form.weightKg),
        pricePerKg: Number(form.pricePerKg),
        totalAmount: total,
        status: form.status,
        paymentStatus: form.paymentStatus,
        deliveryDate: Timestamp.fromDate(new Date(form.deliveryDate)),
        updatedBy: user.uid
      };

      if (order?.id) {
        await updateDoc(doc(db, 'orders', order.id), payload);
      } else {
        await addDoc(collection(db, 'orders'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el pedido. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center px-3">
      <div className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-surface2 max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{order ? 'Editar pedido' : 'Nuevo pedido'}</h2>
            <button onClick={onClose} className="tap-target text-muted px-2">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Cliente" value={form.customerName} onChange={handleChange('customerName')} required />
            <Input label="Teléfono (WhatsApp)" value={form.customerPhone} onChange={handleChange('customerPhone')} placeholder="549..." />
            <Input label="Dirección de entrega" value={form.deliveryAddress} onChange={handleChange('deliveryAddress')} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Kilos" type="number" value={form.weightKg} onChange={handleChange('weightKg')} required />
              <Input label="Precio x Kg" type="number" value={form.pricePerKg} onChange={handleChange('pricePerKg')} required />
            </div>

            <div className="rounded-xl bg-surface2 px-4 py-3 text-sm flex justify-between">
              <span className="text-muted">Total</span>
              <span className="font-bold text-accent2">${total.toLocaleString('es-AR')}</span>
            </div>

            <Input label="Fecha de entrega" type="date" value={form.deliveryDate} onChange={handleChange('deliveryDate')} />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Estado"
                value={form.status}
                onChange={handleChange('status')}
                options={[
                  ['pending', 'Pendiente'],
                  ['delivered', 'Entregado'],
                  ['cancelled', 'Cancelado']
                ]}
              />
              <Select
                label="Pago"
                value={form.paymentStatus}
                onChange={handleChange('paymentStatus')}
                options={[
                  ['unpaid', 'Sin pagar'],
                  ['paid', 'Pagado']
                ]}
              />
            </div>

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="tap-target w-full rounded-xl bg-accent text-base font-semibold py-3 disabled:opacity-60 active:scale-[0.98] transition"
            >
              {saving ? 'Guardando...' : 'Guardar pedido'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-muted mb-1 block">{label}</label>
      <input
        {...props}
        className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-sm text-muted mb-1 block">{label}</label>
      <select
        {...props}
        className="tap-target w-full rounded-xl bg-base border border-surface2 px-4 py-3 text-slate-100 outline-none focus:border-accent"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
