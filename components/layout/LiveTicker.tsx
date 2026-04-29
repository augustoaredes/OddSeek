'use client';

const TICKER_ITEMS = [
  { teams: 'Real Madrid × Barcelona', tip: 'Vitória Real Madrid', odd: '2.10', ev: 'EV+8.2%' },
  { teams: 'Flamengo × Palmeiras', tip: 'Vitória Flamengo', odd: '2.35', ev: 'EV+11.4%' },
  { teams: 'Lakers × Celtics', tip: 'Over 215.5 pts', odd: '1.85', ev: 'EV+5.8%' },
  { teams: 'Djokovic × Alcaraz', tip: 'Alcaraz em 3 sets', odd: '3.75', ev: 'EV+9.1%' },
  { teams: 'Man City × Arsenal', tip: 'Ambas marcam', odd: '1.75', ev: 'EV+6.3%' },
  { teams: 'Corinthians × São Paulo', tip: 'Over 1.5 gols', odd: '1.62', ev: 'EV+7.4%' },
  { teams: 'NBA · Nuggets × Heat', tip: 'Nuggets -3.5', odd: '1.90', ev: 'EV+5.1%' },
  { teams: 'Sinner × Zverev', tip: 'Sinner sets totais 3', odd: '2.20', ev: 'EV+12.0%' },
];

export function LiveTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="ticker-bar" aria-hidden="true">
      <div className="tb-tag">
        <div className="tb-dot" />
        <span>Ao vivo</span>
      </div>
      <div className="ticker-track">
        <div className="ticker">
          {doubled.map((item, i) => (
            <div key={i} className="ti">
              <span className="ti-teams">{item.teams}</span>
              <span className="ti-sep">·</span>
              <span className="ti-tip">{item.tip}</span>
              <span className="ti-odd">{item.odd}</span>
              <span className="ti-ev">{item.ev}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
