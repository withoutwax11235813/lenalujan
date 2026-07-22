// Builds and opens a WhatsApp share link with the order receipt.
// Uses wa.me so it works both on mobile (opens the app) and desktop
// (opens WhatsApp Web) without needing the Web Share API.
export function buildReceiptMessage(order) {
  const total = Number(order.totalAmount || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  return (
    `¡Hola ${order.customerName}! Te dejamos el detalle de tu compra de leña:\n\n` +
    `- Cantidad: ${order.weightKg} Kg\n` +
    `- Precio por Kg: $${order.pricePerKg}\n` +
    `- Total: ${total}\n\n` +
    `¡Gracias por tu compra! 🪵`
  );
}

export function shareReceiptOnWhatsApp(order) {
  const message = buildReceiptMessage(order);
  const phone = (order.customerPhone || '').replace(/[^\d]/g, '');
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  const url = `${base}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
