const BRT = 'America/Sao_Paulo';

/** Format ISO date as time in Brasília timezone */
export function formatTimeBRT(iso: string, status?: string, elapsed?: number): string {
  if (status === 'live' && elapsed != null) return `${elapsed}'`;
  const d = new Date(iso);
  const now = new Date();
  const todayBRT = now.toLocaleDateString('pt-BR', { timeZone: BRT });
  const dateBRT  = d.toLocaleDateString('pt-BR', { timeZone: BRT });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: BRT });
  return todayBRT === dateBRT ? time : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: BRT });
}

/** Full date + time in BRT: "dom, 26 abr · 23:30" */
export function formatDateTimeBRT(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    timeZone: BRT,
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    hour:    '2-digit',
    minute:  '2-digit',
  });
}

/** Time only in BRT: "23:30" */
export function formatTimeOnlyBRT(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour:   '2-digit',
    minute: '2-digit',
    timeZone: BRT,
  });
}

/** "Hoje · 23:30" or "26/04 · 23:30" */
export function formatGameTimeBRT(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const todayStr = now.toLocaleDateString('pt-BR', { timeZone: BRT, day: '2-digit', month: '2-digit' });
  const dateStr  = d.toLocaleDateString('pt-BR', { timeZone: BRT, day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: BRT });
  return todayStr === dateStr ? `Hoje · ${time}` : `${dateStr} · ${time}`;
}
