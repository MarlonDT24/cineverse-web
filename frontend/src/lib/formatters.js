export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(timeStr) {
  return timeStr?.slice(0, 5) || '';
}

export function calculateEndTime(date, startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(date);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
