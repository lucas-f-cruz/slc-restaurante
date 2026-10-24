export function money(n: number): string {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}
export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
export function fmtTimeShort(iso: string): string {
  const d = new Date(iso);
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
export function fmtTimeFull(d: Date): string {
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}
export function fmtDateLong(d: Date): string {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}
export function minutesAgo(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}
export function timeAgoLabel(iso: string, now: Date): string {
  const m = minutesAgo(iso, now);
  if (m < 1) return 'agora mesmo';
  if (m === 1) return 'há 1 minuto';
  if (m < 60) return `há ${m} minutos`;
  const h = Math.floor(m / 60);
  return `há ${h}h${m % 60 ? pad2(m % 60) + 'min' : ''}`;
}
export function waitColor(mins: number): { color: string; emoji: string } {
  if (mins < 5) return { color: 'var(--st-pronto)', emoji: '🟢' };
  if (mins < 10) return { color: 'var(--st-preparando)', emoji: '🟡' };
  return { color: 'var(--st-recusado)', emoji: '🔴' };
}
export function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
