// Current available stock = everything logged as "ingreso" (wood
// bought/produced) minus the kg of every delivered order. Cancelled
// or still-pending orders don't touch stock -- only wood that
// actually went out the door counts.
export function currentStock(stockMovements, orders) {
  const totalIn = stockMovements.reduce((sum, m) => sum + Number(m.kg || 0), 0);
  const totalOut = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.weightKg || 0), 0);
  return totalIn - totalOut;
}
