/* EV Detector Cards — hero right column
 * Ported directly from OddSeek (1).html — exact structure + hard-coded colors
 * Colors match .hero local overrides in the HTML reference:
 *   --lime:#7BC42A  --green:#2F8F3F  --amber:#D89020
 *   --muted:#7B7770 --text:#15161A   --dim:#A8A29A
 */

export function EVDetectorCards() {
  return (
    <div className="hero-v2-right">

      {/* ── DETECTOR CARD ── */}
      <div className="det-card">
        <div className="det-head">
          <span>Engine · Detecção EV+</span>
          <span className="scan">
            <span className="scd" />
            Scan #2841
          </span>
        </div>

        {/* Match row: home | VS | away */}
        <div className="det-match">
          {/* Home team */}
          <div className="det-team">
            <div
              className="det-tlogo"
              style={{ background: 'linear-gradient(135deg,#E50914,#000)' }}
            >
              FLA
            </div>
            <div>
              <div className="det-tn">Flamengo</div>
              <div className="det-trec">2° · 3V 1E 0D</div>
            </div>
          </div>

          <div className="det-vs">VS</div>

          {/* Away team */}
          <div className="det-team r">
            <div
              className="det-tlogo"
              style={{ background: 'linear-gradient(135deg,#0B6E4F,#fff)' }}
            >
              PAL
            </div>
            <div>
              <div className="det-tn">Palmeiras</div>
              <div className="det-trec">5° · 1V 2E 1D</div>
            </div>
          </div>
        </div>

        {/* Probability row */}
        <div className="det-prob">
          <span className="ph">FLA</span>
          <span className="pv win">54%</span>
          <span className="ph">EMP</span>
          <span className="pv">26%</span>
          <span className="ph">PAL</span>
          <span className="pv">20%</span>
          <span className="ph" style={{ color: '#7BC42A' }}>↗</span>
        </div>

        {/* EV pick box */}
        <div className="det-ev-box">
          <div className="det-ev-l">
            <div className="det-ev-tip">Pick · Vitória Flamengo · Pixbet</div>
            <div className="det-ev-pick">
              3.20{' '}
              <span className="ev-muted">vs justa 2.80</span>
            </div>
          </div>
          <div className="det-ev-r">
            <div className="det-ev-num">
              +11.8<span>%</span>
            </div>
            <div className="det-ev-lab">EXPECTED VALUE</div>
          </div>
        </div>
      </div>

      {/* ── ODDS MOVEMENT CARD ── */}
      <div className="mov-card">
        <div className="mov-l">
          <div className="mov-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 13l4-5 3 3 5-7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 4h4v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="mov-tag">Odd se movendo</div>
            <div className="mov-text">
              <b>Bayern Over 2.5</b> · Betano · há 12s
            </div>
          </div>
        </div>
        <div className="mov-r">
          <span>↗</span>
          1.95 → 2.05
        </div>
      </div>

      {/* ── HIT RATE SPARKLINE CARD ── */}
      <div className="spark-card">
        <div className="spark-l">
          <div className="spark-tag">Hit rate · últimos 30 dias</div>
          <div className="spark-v">
            <b>73%</b>{' '}
            <span className="spark-muted">acima do mercado</span>
          </div>
          <div className="spark-sub">847 apostas verificadas · ROI +18.4%</div>
        </div>

        <svg
          className="spark-svg"
          width="120"
          height="46"
          viewBox="0 0 120 46"
          fill="none"
        >
          <defs>
            <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(75% 0.22 145)" stopOpacity=".4" />
              <stop offset="100%" stopColor="oklch(75% 0.22 145)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path
            d="M2 36 L14 32 L26 34 L38 26 L50 28 L62 22 L74 24 L86 16 L98 14 L110 8 L118 6 L118 44 L2 44 Z"
            fill="url(#sparkfill)"
          />
          {/* Line */}
          <path
            d="M2 36 L14 32 L26 34 L38 26 L50 28 L62 22 L74 24 L86 16 L98 14 L110 8 L118 6"
            stroke="oklch(75% 0.22 145)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* End dot */}
          <circle cx="118" cy="6" r="3" fill="oklch(75% 0.22 145)" />
          <circle
            cx="118"
            cy="6"
            r="6"
            fill="none"
            stroke="oklch(75% 0.22 145)"
            strokeOpacity=".4"
          />
        </svg>
      </div>

    </div>
  );
}
