'use client';

/**
 * WinTicker — dual-row infinite marquee of anonymized case wins.
 * Row 1 scrolls left. Row 2 scrolls right. Fade masks on edges.
 * CSS-only animation: no JS timers, no layout thrash.
 */

const ROW1 = [
  { i: 'J.D.', county: 'Butler County',     amt: '$142,000' },
  { i: 'M.R.', county: 'Franklin County',   amt: '$87,500'  },
  { i: 'T.W.', county: 'Cuyahoga County',   amt: '$203,000' },
  { i: 'A.P.', county: 'Hamilton County',   amt: '$118,400' },
  { i: 'K.S.', county: 'Montgomery County', amt: '$64,200'  },
  { i: 'D.L.', county: 'Summit County',     amt: '$156,800' },
  { i: 'R.H.', county: 'Stark County',      amt: '$92,300'  },
  { i: 'C.M.', county: 'Warren County',     amt: '$134,600' },
  { i: 'B.T.', county: 'Lorain County',     amt: '$78,900'  },
  { i: 'S.N.', county: 'Lake County',       amt: '$211,000' },
];

const ROW2 = [
  { i: 'P.B.', county: 'Clark County',     amt: '$55,300'  },
  { i: 'G.H.', county: 'Licking County',   amt: '$167,200' },
  { i: 'W.F.', county: 'Mahoning County',  amt: '$98,800'  },
  { i: 'L.C.', county: 'Medina County',    amt: '$121,500' },
  { i: 'E.V.', county: 'Portage County',   amt: '$73,400'  },
  { i: 'H.M.', county: 'Geauga County',    amt: '$189,000' },
  { i: 'N.K.', county: 'Greene County',    amt: '$44,600'  },
  { i: 'O.W.', county: 'Clermont County',  amt: '$138,700' },
  { i: 'Y.T.', county: 'Trumbull County',  amt: '$82,100'  },
  { i: 'Z.R.', county: 'Wood County',      amt: '$110,400' },
];

const CHECK = (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2 5l2.5 2.5L8 3" stroke="#c9a24a" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Row({ items, dir }: { items: typeof ROW1; dir: 'left' | 'right' }) {
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: `ticker-${dir} 60s linear infinite`,
        willChange: 'transform',
      }}>
        {doubled.map((w, idx) => (
          <div
            key={idx}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '11px 26px',
              borderRight: '1px solid rgba(255,255,255,.06)',
            }}
          >
            {CHECK}
            <span style={{ fontSize: 11, color: 'rgba(240,236,228,.5)', fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '.02em' }}>
              {w.i}
            </span>
            <span style={{ color: 'rgba(255,255,255,.15)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(240,236,228,.45)' }}>{w.county}</span>
            <span style={{ color: 'rgba(255,255,255,.15)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
              {w.amt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WinTicker() {
  return (
    <div style={{
      overflow: 'hidden',
      background: 'rgba(255,255,255,.022)',
      borderTop: '1px solid rgba(255,255,255,.06)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{ paddingTop: 10 }}>
        <Row items={ROW1} dir="left" />
      </div>
      <div style={{ paddingBottom: 10, marginTop: 1 }}>
        <Row items={ROW2} dir="right" />
      </div>
    </div>
  );
}
