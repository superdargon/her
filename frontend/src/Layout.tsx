import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  BrandLogo,
  CharactersIcon,
  ChatIcon,
  DatabaseIcon,
  HomeIcon,
  SettingsIcon,
} from '@/components/Icons'
import Mascot from '@/components/Mascot'
import TitleBar from '@/components/TitleBar'
import { useEmotionEngine } from '@/store/emotionEngine'
import { getPetEnabled } from '@/petPreference'
import { useI18n } from '@/I18nProvider'

export default function Layout() {
  const location = useLocation()
  const { emotion, label, theme, message, memory } = useEmotionEngine()
  const petEnabled = getPetEnabled()
  const { t } = useI18n()

  const navItems = [
    { path: '/dashboard', label: t('layout.home'), key: 'home', Icon: HomeIcon },
    { path: '/characters', label: t('layout.characters'), key: 'characters', Icon: CharactersIcon },
    { path: '/chat', label: t('layout.chats'), key: 'chats', Icon: ChatIcon },
    { path: '/subscribe', label: t('layout.plans'), key: 'plans', Icon: DatabaseIcon },
    { path: '/settings', label: t('layout.settingsCenter'), key: 'settingsCenter', Icon: SettingsIcon },
  ]

  const isActive = (path: string, key: string) => {
    if (path === '/characters') return location.pathname.startsWith('/characters')
    if (path === '/chat') return location.pathname.startsWith('/chat') || location.pathname.startsWith('/messages')
    return location.pathname === path
  }

  return (
    <div className={`app-shell emotion-shell ${theme.className}`} data-emotion={emotion}>
      <aside className="app-sidebar">
        <Link to="/dashboard" className="sidebar-brand" aria-label={t('layout.homeAria')}>
          <BrandLogo size={48} />
          <span>
            <strong>妳</strong>
            <small>{t('layout.brandSub')}</small>
          </span>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, key, Icon }) => (
            <Link key={`${path}-${key}`} to={path} className={`sidebar-link ${isActive(path, key) ? 'active' : ''}`}>
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {petEnabled && (
          <div className="sidebar-pet-card">
            <Mascot emotion={emotion} label={label} message={message} memory={memory} variant="sidebar" />
          </div>
        )}
      </aside>

      <div className="app-main">
        <TitleBar />
        <header className="app-titlebar">
          <div className="emotion-indicator">
            <span />
            {message}
          </div>
</header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
