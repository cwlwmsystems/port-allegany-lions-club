import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(115deg, #071b37, #00338d)',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '800px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#EBB700',
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 30,
            }}
          >
            PORT ALLEGANY, PENNSYLVANIA
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            <span>Port Allegany</span>
            <span>Lions Club</span>
          </div>

          <div
            style={{
              width: 110,
              height: 6,
              backgroundColor: '#EBB700',
              marginTop: 35,
              marginBottom: 30,
            }}
          />

          <div
            style={{
              fontSize: 29,
              color: '#E0EAF7',
              fontWeight: 500,
            }}
          >
            Rooted in Community. Driven by Service.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
