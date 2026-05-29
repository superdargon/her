import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getBots, getCharacters, getMessages } from '../api'
import Mascot from '@/components/Mascot'
import {
  CharacterAvatarArt,
  ChartIcon,
  HeartDecoration,
  MessageIcon,
  MoreIcon,
  PlusIcon,
  RobotIcon,
  ShieldIcon,
  StarArt,
  StatusOnlineIcon,
  WechatIcon,
} from '@/components/Icons'
import { getPetEnabled } from '@/petPreference'
import { useEmotionEngine } from '@/store/emotionEngine'
import { useI18n } from '@/I18nProvider'

interface Character {
  id: string
  name: string
  avatar?: string
  personality?: string
  greeting?: string
  created_at?: number
}

interface Bot {
  id: string
  character_id: string
  status: string
  active: boolean
  created_at?: number
}

interface Message {
  id: string
  created_at?: number
}

function isToday(timestamp?: number) {
  if (!timestamp) return false
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export default function Dashboard() {
  const [displayName, setDisplayName] = useState('')
  const [chars, setChars] = useState<Character[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [todayMessages, setTodayMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { emotion, label, message, memory, trigger, setEmotion } = useEmotionEngine()
  const petEnabled = getPetEnabled()
  const { t, locale } = useI18n()

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [config, characters, botList] = await Promise.all([api('/config'), getCharacters(), getBots()])
        if (cancelled) return

        setDisplayName(String(config.displayName || '').trim())
        setChars(characters)
        setBots(botList)

        if (botList.length === 0) {
          setTodayMessages(0)
        } else {
          const messageGroups = await Promise.all(
            botList.map((bot: Bot) => getMessages(bot.id, 0, 200).catch(() => [] as Message[]))
          )
          if (!cancelled) {
            setTodayMessages(messageGroups.flat().filter((msg: Message) => isToday(msg.created_at)).length)
          }
        }

        trigger('successful_reply')
      } catch (err) {
        console.error(err)
        trigger('network_error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [trigger])

  const connectedCount = bots.filter((bot) => bot.active).length

  const userName = useMemo(() => {
    return displayName ? t('dashboard.welcomeWithName', { name: displayName }) : t('dashboard.welcomeFallback')
  }, [displayName, t])

  const activityRows = [
    { name: t('dashboard.system'), text: t('dashboard.systemRow1'), time: t('dashboard.today'), count: 0 },
    { name: t('dashboard.roles'), text: t('dashboard.systemRow2'), time: t('dashboard.today'), count: 0 },
  ]

  const systemRows = [
    { label: t('dashboard.backend'), value: t('dashboard.running') },
    { label: t('dashboard.database'), value: t('dashboard.healthy') },
    { label: t('dashboard.wechat'), value: t('dashboard.online') },
    { label: t('dashboard.aiService'), value: t('dashboard.healthy') },
  ]

  const quickActions = [
    { label: t('dashboard.quickCreate'), desc: t('dashboard.quickCreateDesc'), Icon: PlusIcon, path: '/characters/new', event: 'new_character_created' as const },
    { label: t('dashboard.quickBind'), desc: t('dashboard.quickBindDesc'), Icon: WechatIcon, path: '/characters', event: 'wechat_bind_success' as const },
    { label: t('dashboard.quickModel'), desc: t('dashboard.quickModelDesc'), Icon: RobotIcon, path: '/settings', event: 'ai_generating' as const },
    { label: t('dashboard.quickUsage'), desc: t('dashboard.quickUsageDesc'), Icon: ChartIcon, path: '/subscribe', event: 'high_chat_frequency' as const },
  ]

  const growthCopy = locale === 'zh'
    ? {
        title: '\u6210\u957f\u6458\u8981',
        label: '\u966a\u4f34\u5173\u7cfb',
        action: '\u67e5\u770b\u6210\u957f',
        affection: '\u4eb2\u5bc6\u5ea6',
        trust: '\u4fe1\u4efb\u503c',
        hint1: '\u60c5\u7eea\u7cfb\u7edf\u5df2\u63a5\u7ba1\u966a\u4f34\u72b6\u6001',
        hint2: '\u66f4\u591a\u4e92\u52a8\u4f1a\u6301\u7eed\u62c9\u9ad8\u5173\u7cfb\u503c',
        hint3: '\u6210\u957f\u4e2d\u5fc3\u91cc\u53ef\u4ee5\u770b\u5b8c\u6574\u5173\u7cfb\u8f68\u8ff9',
      }
    : {
        title: 'Growth Summary',
        label: 'Companion Bond',
        action: 'Open Growth',
        affection: 'Affection',
        trust: 'Trust',
        hint1: 'Emotion state is now driving the companion layer',
        hint2: 'More interactions will keep strengthening the bond',
        hint3: 'The growth center shows the full relationship trail',
      }

  const isConnected = (charId: string) => bots.some((bot) => bot.character_id === charId && bot.active)

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <div className="apple-skeleton" style={{ height: 260, borderRadius: 22, marginBottom: 24 }} />
            <div className="stat-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="apple-skeleton" style={{ height: 140, borderRadius: 18 }} />
              ))}
            </div>
          </section>
          <aside className="dashboard-side">
            <div className="apple-skeleton" style={{ height: 320, borderRadius: 20 }} />
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <section className="dashboard-main">
          <section className="companion-hero">
            <div className="companion-hero-copy">
              <span className="emotion-chip">{label}</span>
              <h1>{userName}</h1>
              <p>{message}</p>

              <div className="hero-focus-metric">
                <span>{t('dashboard.todayMessages')}</span>
                <strong>
                  {todayMessages}
                  <small> {t('dashboard.messagesUnit')}</small>
                </strong>
              </div>

              <div className="hero-actions">
                <button
                  className="cta-primary dashboard-create"
                  onClick={() => {
                    trigger('new_character_created')
                    navigate('/characters/new')
                  }}
                >
                  <PlusIcon size={16} /> {t('dashboard.createRole')}
                </button>
                <button className="ghost-icon" aria-label={t('dashboard.listeningAria')} onClick={() => setEmotion('listening')}>
                  <MessageIcon size={20} />
                </button>
                <button className="ghost-icon" aria-label={t('dashboard.loveAria')} onClick={() => setEmotion('love')}>
                  <StarArt size={26} />
                </button>
              </div>

            </div>
          </section>

          <div className="emotion-memory-strip compact" aria-label="Emotion memory">
            <span>{t('dashboard.emotionMemory')}: {label}</span>
            <span title={`Trust ${memory.trust} / Lonely ${memory.loneliness} / Fatigue ${memory.fatigue}`}>
              {t('dashboard.affection')} {memory.affectionLevel}
            </span>
          </div>

          <div className="stat-grid">
            <article className="metric-card primary orange">
              <span>{t('dashboard.todayMessages')}</span>
              <strong>
                {todayMessages}
                <small>{t('dashboard.messagesUnit')}</small>
              </strong>
              <p>{t('dashboard.metricDesc')}</p>
              <div className="metric-art">
                <MessageIcon size={26} />
              </div>
            </article>

            <article className="metric-card blue">
              <span>{t('dashboard.connectedRoles')}</span>
              <strong>
                {connectedCount}
                <small>{t('dashboard.connectedUnit')}</small>
              </strong>
              <p>{t('dashboard.connectedDesc')}</p>
              <div className="metric-art heart">
                <HeartDecoration size={24} />
              </div>
            </article>

            <article className="metric-card green">
              <span>{t('dashboard.modelStatus')}</span>
              <strong className="model-name">DeepSeek</strong>
              <em>
                <StatusOnlineIcon size={14} /> {t('dashboard.configured')}
              </em>
              <p>{t('dashboard.apiHealthy')}</p>
              <div className="metric-art">
                <ShieldIcon size={26} />
              </div>
            </article>
          </div>

          <section className="dash-section">
            <div className="section-heading">
              <h2>{t('dashboard.myRoles')}</h2>
              <button onClick={() => navigate('/characters')}>{t('dashboard.viewAll')}</button>
            </div>

            {chars.length > 0 ? (
              <div className="mini-character-grid">
                {chars.map((char, index) => {
                  const connected = isConnected(char.id)
                  return (
                    <article key={char.id} className="mini-character-card">
                      {char.avatar ? (
                        <img src={char.avatar} width={78} height={78} alt={char.name} className="mini-character-avatar" />
                      ) : (
                        <CharacterAvatarArt index={index} size={78} alt={char.name} />
                      )}

                      <div>
                        <div className="mini-name">
                          <strong>{char.name}</strong>
                          <span className={connected ? 'pill online' : 'pill offline'}>
                            {connected ? t('dashboard.online') : t('dashboard.offline')}
                          </span>
                        </div>
                        <p>{char.personality || char.greeting || t('dashboard.customRole')}</p>
                        <small>{t('dashboard.created')} {char.created_at ? new Date(char.created_at).toLocaleDateString() : '--'}</small>
                      </div>

                      <button className="more-btn" aria-label={t('dashboard.more')} onClick={() => setEmotion(connected ? 'happy' : 'sad')}>
                        <MoreIcon size={16} />
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="mini-character-empty">
                <p>{t('dashboard.noRoles')}</p>
                <button className="cta-primary" onClick={() => navigate('/characters/new')}>
                  {t('dashboard.createFirstRole')}
                </button>
              </div>
            )}
          </section>

          <section className="dash-section">
            <div className="section-heading">
              <h2>{t('dashboard.recentActivity')}</h2>
              <button onClick={() => navigate('/chat')}>{t('dashboard.viewMore')}</button>
            </div>

            <div className="chat-table">
              <div className="chat-table-head">
                <span>{t('dashboard.source')}</span>
                <span>{t('dashboard.content')}</span>
                <span>{t('dashboard.time')}</span>
                <span>{t('dashboard.count')}</span>
              </div>
              {activityRows.map((row, index) => (
                <div key={`${row.name}-${index}`} className="chat-table-row">
                  <span className="table-avatar">
                    <CharacterAvatarArt index={index} size={34} />
                    {row.name}
                  </span>
                  <span>{row.text}</span>
                  <span>{row.time}</span>
                  <span>{row.count}</span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="dashboard-side">
          {petEnabled && (
            <section className="side-card companion-side-card">
              <div className="side-heading">
                <h3>{t('dashboard.companionStatus')}</h3>
              </div>
              <Mascot emotion={emotion} label={label} message={message} memory={memory} variant="compact" />
              <div className="side-memory-row">
                <span>{t('dashboard.trust')} {memory.trust}</span>
                <span>{t('dashboard.lonely')} {memory.loneliness}</span>
              </div>
            </section>
          )}

          <section className="side-card subscription-card">
            <div className="side-heading">
              <h3>{growthCopy.title}</h3>
            </div>
            <div className="plan-card compact-plan growth-summary-card">
              <div>
                <strong>{growthCopy.label}</strong>
                <button onClick={() => navigate('/subscribe')}>
                  {growthCopy.action}
                </button>
              </div>
              <div className="usage-row">
                <span>{growthCopy.affection}</span>
                <b>
                  {memory.affectionLevel}
                  <small>/ 100</small>
                </b>
              </div>
              <div className="usage-bar">
                <span style={{ width: `${Math.min(100, memory.affectionLevel)}%` }} />
              </div>
              <div className="usage-row">
                <span>{growthCopy.trust}</span>
                <b>
                  {memory.trust}
                  <small>/ 100</small>
                </b>
              </div>
              <div className="usage-bar">
                <span style={{ width: `${Math.min(100, memory.trust)}%` }} />
              </div>
            </div>
            <ul className="plan-features">
              <li><StarArt size={18} /> {growthCopy.hint1}</li>
              <li><HeartDecoration size={16} /> {growthCopy.hint2}</li>
              <li><MessageIcon size={16} /> {growthCopy.hint3}</li>
            </ul>
          </section>

          <section className="side-card">
            <div className="side-heading">
              <h3>{t('dashboard.quickActions')}</h3>
            </div>
            <div className="quick-list">
              {quickActions.map(({ label: actionLabel, desc, Icon, path, event }) => (
                <button
                  key={actionLabel}
                  onClick={() => {
                    trigger(event)
                    navigate(path)
                  }}
                >
                  <span><Icon size={22} /></span>
                  <strong>
                    {actionLabel}
                    <small>{desc}</small>
                  </strong>
                </button>
              ))}
            </div>
          </section>

          <section className="side-card status-card">
            <div className="side-heading">
              <h3>{t('dashboard.systemStatus')}</h3>
            </div>
            <div className="status-list">
              {systemRows.map((row, index) => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  <em>{index === 2 ? `${connectedCount} ${t('dashboard.online')}` : row.value}</em>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
