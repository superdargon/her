import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
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

interface ActivityRow {
  id: string
  source: 'companion' | 'wechat'
  characterId: string
  characterName: string
  role: 'user' | 'assistant'
  content: string
  created_at?: number
}

interface RelationshipMemory {
  affection: number
  trust: number
  loneliness: number
  fatigue: number
  stability: number
}

interface DashboardSummary {
  characters: Character[]
  bots: Bot[]
  todayMessages: number
  recentActivity: ActivityRow[]
  focusCharacterId?: string
  relationshipMemory?: RelationshipMemory | null
}

interface ModelConfig {
  aiProvider?: string
  aiModel?: string
  aiBaseUrl?: string
  hasApiKey?: boolean
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

function formatProviderName(provider?: string) {
  const value = String(provider || '').trim().toLowerCase()
  if (value === 'deepseek') return 'DeepSeek'
  if (value === 'openai') return 'OpenAI'
  if (value === 'siliconflow') return 'SiliconFlow'
  if (value === 'custom') return 'Custom'
  return provider || '未选择服务'
}

export default function Dashboard() {
  const [displayName, setDisplayName] = useState('')
  const [chars, setChars] = useState<Character[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [todayMessages, setTodayMessages] = useState(0)
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([])
  const [relationshipMemory, setRelationshipMemory] = useState<RelationshipMemory>({ affection: 35, trust: 35, loneliness: 0, fatigue: 10, stability: 45 })
  const [modelConfig, setModelConfig] = useState<ModelConfig>({})
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { emotion, label, message, memory, trigger, setEmotion } = useEmotionEngine()
  const petEnabled = getPetEnabled()
  const { t, locale } = useI18n()

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [config, summary] = await Promise.all([
          api('/config'),
          api('/dashboard-summary') as Promise<DashboardSummary>,
        ])
        if (cancelled) return

        setDisplayName(String(config.displayName || '').trim())
        setModelConfig({
          aiProvider: String(config.aiProvider || ''),
          aiModel: String(config.aiModel || ''),
          aiBaseUrl: String(config.aiBaseUrl || ''),
          hasApiKey: Boolean(config.hasApiKey),
        })
        setChars(summary.characters || [])
        setBots(summary.bots || [])
        setTodayMessages(Number(summary.todayMessages || 0))
        setActivityRows(summary.recentActivity || [])
        if (summary.relationshipMemory) {
          setRelationshipMemory({
            affection: Number(summary.relationshipMemory.affection || 35),
            trust: Number(summary.relationshipMemory.trust || 35),
            loneliness: Number(summary.relationshipMemory.loneliness || 0),
            fatigue: Number(summary.relationshipMemory.fatigue || 10),
            stability: Number(summary.relationshipMemory.stability || 45),
          })
        }

        trigger(Number(summary.todayMessages || 0) > 0 ? 'successful_reply' : 'daily_login')
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
  const displayAffection = relationshipMemory.affection
  const displayTrust = relationshipMemory.trust
  const displayLoneliness = relationshipMemory.loneliness
  const modelName = modelConfig.aiModel?.trim() || '未选择模型'
  const providerName = formatProviderName(modelConfig.aiProvider)
  const modelConfigured = Boolean(modelConfig.hasApiKey && modelConfig.aiModel && modelConfig.aiBaseUrl)
  const modelStatusText = modelConfigured ? t('dashboard.configured') : '未配置'
  const modelStatusHint = modelConfigured ? `${providerName} · ${modelConfig.aiBaseUrl}` : '请在设置中心填写 API Key、模型和接口地址'

  const userName = useMemo(() => {
    return displayName ? t('dashboard.welcomeWithName', { name: displayName }) : t('dashboard.welcomeFallback')
  }, [displayName, t])

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
        title: '成长摘要',
        label: '陪伴关系',
        action: '查看成长',
        affection: '亲密度',
        trust: '信任值',
        hint1: '情绪系统已接管陪伴状态',
        hint2: '更多互动会持续拉高关系值',
        hint3: '成长中心里可以看完整关系轨迹',
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
            <span title={`Trust ${displayTrust} / Lonely ${displayLoneliness} / Fatigue ${relationshipMemory.fatigue}`}>
              {t('dashboard.affection')} {displayAffection}
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
              <strong className="model-name">{modelName}</strong>
              <em>
                <StatusOnlineIcon size={14} /> {modelStatusText}
              </em>
              <p title={modelStatusHint}>{modelStatusHint}</p>
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

                      <button className="more-btn" aria-label={t('dashboard.more')} onClick={() => navigate(`/companion/${char.id}`)}>
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
              {activityRows.length > 0 ? activityRows.map((row, index) => (
                <div key={`${row.id}-${index}`} className="chat-table-row">
                  <span className="table-avatar">
                    <CharacterAvatarArt index={index} size={34} />
                    {row.characterName}
                  </span>
                  <span>{row.content}</span>
                  <span>{formatTime(row.created_at)}</span>
                  <span>{row.source === 'wechat' ? '微信' : '陪伴'}</span>
                </div>
              )) : (
                <div className="chat-table-row">
                  <span className="table-avatar">--</span>
                  <span>还没有新的对话记录</span>
                  <span>--</span>
                  <span>--</span>
                </div>
              )}
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
                <span>{t('dashboard.trust')} {displayTrust}</span>
                <span>{t('dashboard.lonely')} {displayLoneliness}</span>
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
                  {displayAffection}
                  <small>/ 100</small>
                </b>
              </div>
              <div className="usage-bar">
                <span style={{ width: `${Math.min(100, displayAffection)}%` }} />
              </div>
              <div className="usage-row">
                <span>{growthCopy.trust}</span>
                <b>
                  {displayTrust}
                  <small>/ 100</small>
                </b>
              </div>
              <div className="usage-bar">
                <span style={{ width: `${Math.min(100, displayTrust)}%` }} />
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
