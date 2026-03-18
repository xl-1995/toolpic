import Link from 'next/link';
import { tools } from '@/data/tools';

export default function NotFound() {
  const popularTools = tools.slice(0, 6);

  return (
    <html lang="en">
      <head>
        <title>Page Not Found | ToolPic</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body
        style={{
          backgroundColor: '#09090b',
          color: '#f4f4f5',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          {/* 404 Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1
              style={{
                fontSize: '8rem',
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: '1rem',
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              404
            </h1>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              Page Not Found
            </h2>
            <p
              style={{
                color: '#a1a1aa',
                fontSize: '1.1rem',
                maxWidth: '28rem',
                margin: '0 auto 2rem',
                lineHeight: 1.6,
              }}
            >
              The page you are looking for does not exist or has been moved.
            </p>
            <Link
              href="/en"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
            >
              <i className="fas fa-home"></i>
              Go to Homepage
            </Link>
          </div>

          {/* Popular Tools */}
          <div style={{ maxWidth: '900px', width: '100%' }}>
            <h3
              style={{
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Popular Tools
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/en/tools/${tool.slugs.en}`}
                  style={{
                    display: 'block',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '1.25rem',
                    textDecoration: 'none',
                    color: '#f4f4f5',
                    transition: 'transform 0.3s, background-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(59, 130, 246, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <i className={`fas fa-${tool.icon}`} style={{ fontSize: '1rem' }}></i>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {tool.id
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
