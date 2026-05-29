import { DiscoverIcon, CatDecoration } from '@/components/Icons'

export default function DiscoverPage() {
  return (
    <div className="animate-fade-up" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            发现
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            探索更多有趣的功能
          </p>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          padding: '48px 24px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--color-primary)', opacity: 0.4 }}>
            <DiscoverIcon size={64} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
            敬请期待
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            更多功能正在开发中...
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, opacity: 0.6 }}>
          <CatDecoration size={48} />
        </div>
      </div>
    </div>
  )
}
