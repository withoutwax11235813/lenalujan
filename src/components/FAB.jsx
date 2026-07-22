export default function FAB({ onNewOrder, onNewExpense, onNewStock }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-40 no-print">
      <button
        onClick={onNewStock}
        className="tap-target rounded-full bg-surface2 border border-surface2 shadow-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 active:scale-95 transition"
      >
        🪵 Stock
      </button>
      <button
        onClick={onNewExpense}
        className="tap-target rounded-full bg-surface2 border border-surface2 shadow-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 active:scale-95 transition"
      >
        💸 Gasto
      </button>
      <button
        onClick={onNewOrder}
        className="tap-target rounded-full bg-accent text-base shadow-lg px-5 py-3 text-sm font-bold flex items-center gap-2 active:scale-95 transition"
      >
        ➕ Pedido
      </button>
    </div>
  );
}
