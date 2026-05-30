import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useTheme } from '../ThemeProvider'
import { themes } from '../themes'
import { CheckIcon, ShieldIcon, StatusWarningIcon } from '@/components/Icons'
import { getPetEnabled, setPetEnabled } from '@/petPreference'
import { useI18n } from '@/I18nProvider'
import { getCharacters, getPersonaStabilizerEvents, getPersonaStabilizerStats, getProactiveEvents, getRelationshipMemory, getRelationshipMemoryEvents, resetRelationshipMemory, sendProactiveTest } from '@/api'

type ProviderInfo = {
  id: string
  label: string
  baseUrl: string
  models: { label: string; value: string }[]
  keyPlaceholder: string
  keyLink: string
  keyLinkLabel: string
}

const providers: ProviderInfo[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { label: 'DeepSeek V3', value: 'deepseek-chat' },
      { label: 'DeepSeek V4', value: 'deepseek-v4' },
      { label: 'DeepSeek Flash', value: 'deepseek-chat' },
      { label: 'DeepSeek Pro', value: 'deepseek-reasoner' },
      { label: 'DeepSeek R1', value: 'deepseek-reasoner' },
    ],
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.deepseek.com/api_keys',
    keyLinkLabel: 'Get DeepSeek Key',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4o-mini', value: 'gpt-4o-mini' },
      { label: 'GPT-4-turbo', value: 'gpt-4-turbo' },
      { label: 'o3-mini', value: 'o3-mini' },
    ],
    keyPlaceholder: 'sk-proj-xxxxxxxxxxxxxxxx',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'Get OpenAI Key',
  },
  {
    id: 'siliconflow',
    label: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { label: 'DeepSeek V3', value: 'deepseek-ai/DeepSeek-V3' },
      { label: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1' },
      { label: 'Qwen2.5-72B', value: 'Qwen/Qwen2.5-72B-Instruct' },
    ],
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: 'https://cloud.siliconflow.cn/account/ak',
    keyLinkLabel: 'Get SiliconFlow Key',
  },
  {
    id: 'custom',
    label: 'Custom',
    baseUrl: '',
    models: [],
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    keyLink: '',
    keyLinkLabel: '',
  },
]

type PanelProps = {
  title: string
  eyebrow?: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

const Panel = ({ title, eyebrow, description, children, action }: PanelProps) => (
  <section className="settings-panel">
    <div className="settings-panel-head">
      <div>
        {eyebrow && <span className="settings-eyebrow">{eyebrow}</span>}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="settings-panel-action">{action}</div>}
    </div>
    {children}
  </section>
)

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
  <button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} aria-pressed={checked} onClick={() => onChange(!checked)}>
    <span />
    <strong>{label}</strong>
  </button>
)

const formatEventTime = (value: number) => new Date(value).toLocaleString()

export default function SettingsPage() {
  const [provider, setProvider] = useState('deepseek')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('deepseek-chat')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [webSearchProvider, setWebSearchProvider] = useState('tavily')
  const [webSearchApiKey, setWebSearchApiKey] = useState('')
  const [webSearchEndpoint, setWebSearchEndpoint] = useState('https://api.tavily.com/search')
  const [webSearchMaxResults, setWebSearchMaxResults] = useState(5)
  const [displayName, setDisplayName] = useState('')
  const [saved, setSaved] = useState(false)
  const [petEnabled, setPetEnabledState] = useState(false)
  const [loading, setLoading] = useState(true)
  const [proactiveEnabled, setProactiveEnabled] = useState(true)
  const [proactiveMinIdleHours, setProactiveMinIdleHours] = useState(4)
  const [proactiveMinIntervalHours, setProactiveMinIntervalHours] = useState(6)
  const [proactiveQuietStart, setProactiveQuietStart] = useState(23)
  const [proactiveQuietEnd, setProactiveQuietEnd] = useState(8)
  const [proactiveDailyCap, setProactiveDailyCap] = useState(2)
  const [personaStabilizerEnabled, setPersonaStabilizerEnabled] = useState(true)
  const [personaStabilizerStrictMode, setPersonaStabilizerStrictMode] = useState(true)
  const [personaFallbackStyle, setPersonaFallbackStyle] = useState('gentle')
  const [characters, setCharacters] = useState<Array<{ id: string; name: string }>>([])
  const [memoryCharacterId, setMemoryCharacterId] = useState('')
  const [memoryForm, setMemoryForm] = useState({ affection: 35, trust: 35, loneliness: 0, fatigue: 10, stability: 45 })
  const [proactiveEvents, setProactiveEvents] = useState<Array<{ id: string; character_name?: string; content: string; created_at: number }>>([])
  const [memoryEvents, setMemoryEvents] = useState<Array<{ id: string; event_type: string; snapshot: string; created_at: number }>>([])
  const [stabilizerEvents, setStabilizerEvents] = useState<Array<{ id: string; reason: string; raw_reply: string; final_reply: string; created_at: number }>>([])
  const [memoryEventFilter, setMemoryEventFilter] = useState('all')
  const [stabilizerStats, setStabilizerStats] = useState<{ total24h: number; byReason: Array<{ reason: string; count: number }> }>({ total24h: 0, byReason: [] })

  const sanitizeHour = (value: number) => Math.min(23, Math.max(0, Math.round(value)))
  const { theme, setThemeId } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()

  useEffect(() => {
    api('/config')
      .then((data: any) => {
        if (data.aiProvider) setProvider(data.aiProvider)
        if (data.aiModel) setModel(data.aiModel)
        if (data.aiBaseUrl) setBaseUrl(data.aiBaseUrl)
        setWebSearchEnabled(data.webSearchEnabled === true)
        setWebSearchProvider(String(data.webSearchProvider || 'tavily'))
        setWebSearchApiKey(data.webSearchApiKey ? '***' : '')
        setWebSearchEndpoint(String(data.webSearchEndpoint || 'https://api.tavily.com/search'))
        setWebSearchMaxResults(Number(data.webSearchMaxResults || 5))
        setDisplayName(String(data.displayName || ''))
        setProactiveEnabled(data.proactiveEnabled !== false)
        setProactiveMinIdleHours(Number(data.proactiveMinIdleHours || 4))
        setProactiveMinIntervalHours(Number(data.proactiveMinIntervalHours || 6))
        setProactiveQuietStart(Number(data.proactiveQuietStart ?? 23))
        setProactiveQuietEnd(Number(data.proactiveQuietEnd ?? 8))
        setProactiveDailyCap(Number(data.proactiveDailyCap || 2))
        setPersonaStabilizerEnabled(data.personaStabilizerEnabled !== false)
        setPersonaStabilizerStrictMode(data.personaStabilizerStrictMode !== false)
        setPersonaFallbackStyle(String(data.personaStabilizerFallbackStyle || 'gentle'))
        setPetEnabledState(getPetEnabled())
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    getCharacters()
      .then((rows) => {
        setCharacters(rows)
        if (rows[0]?.id) {
          setMemoryCharacterId(rows[0].id)
        }
      })
      .catch(() => {})

    getProactiveEvents(20)
      .then((rows) => setProactiveEvents(rows))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!memoryCharacterId) return
    getRelationshipMemory(memoryCharacterId)
      .then((memory) => {
        setMemoryForm({
          affection: Number(memory.affection || 35),
          trust: Number(memory.trust || 35),
          loneliness: Number(memory.loneliness || 0),
          fatigue: Number(memory.fatigue || 10),
          stability: Number(memory.stability || 45),
        })
      })
      .catch(() => {})

    getRelationshipMemoryEvents(memoryCharacterId, 12)
      .then((rows) => setMemoryEvents(rows))
      .catch(() => {})

    getPersonaStabilizerEvents(memoryCharacterId, 12)
      .then((rows) => setStabilizerEvents(rows))
      .catch(() => {})

    getPersonaStabilizerStats(memoryCharacterId)
      .then((rows) => setStabilizerStats(rows))
      .catch(() => {})
  }, [memoryCharacterId])

  const handleProviderChange = (providerId: string) => {
    setProvider(providerId)
    const info = providers.find((item) => item.id === providerId)
    if (!info) return
    setBaseUrl(info.baseUrl)
    if (info.models.length > 0) setModel(info.models[0].value)
  }

  const handleSave = async () => {
    try {
      const body: any = {
        aiProvider: provider,
        aiModel: model,
        aiBaseUrl: baseUrl,
        webSearchEnabled,
        webSearchProvider,
        webSearchEndpoint: webSearchEndpoint.trim(),
        webSearchMaxResults: Math.min(10, Math.max(1, Math.round(webSearchMaxResults))),
        displayName: displayName.trim().slice(0, 24),
        proactiveEnabled,
        proactiveMinIdleHours: Math.max(1, Math.round(proactiveMinIdleHours)),
        proactiveMinIntervalHours: Math.max(1, Math.round(proactiveMinIntervalHours)),
        proactiveQuietStart: sanitizeHour(proactiveQuietStart),
        proactiveQuietEnd: sanitizeHour(proactiveQuietEnd),
        proactiveDailyCap: Math.max(0, Math.round(proactiveDailyCap)),
        personaStabilizerEnabled,
        personaStabilizerStrictMode,
        personaStabilizerFallbackStyle: personaFallbackStyle,
      }
      if (apiKey) body.aiApiKey = apiKey
      if (webSearchApiKey) body.webSearchApiKey = webSearchApiKey
      await api('/config', { method: 'PUT', body: JSON.stringify(body) })
      setPetEnabled(petEnabled)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err.message || t('settings.save'))
    }
  }

  const handleMemoryReset = async () => {
    if (!memoryCharacterId) return
    const data = await resetRelationshipMemory(memoryCharacterId)
    setMemoryForm({
      affection: Number(data.affection || 35),
      trust: Number(data.trust || 35),
      loneliness: Number(data.loneliness || 0),
      fatigue: Number(data.fatigue || 10),
      stability: Number(data.stability || 45),
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3000)
  }

  const handleMemoryExport = () => {
    const rows = memoryEvents
      .filter((event) => memoryEventFilter === 'all' || event.event_type === memoryEventFilter)
      .map((event) => {
        let snapshot: any = {}
        try {
          snapshot = JSON.parse(event.snapshot || '{}')
        } catch {
          snapshot = {}
        }
        return {
          id: event.id,
          event_type: event.event_type,
          created_at: event.created_at,
          ...snapshot,
        }
      })
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relationship-memory-events-${memoryCharacterId || 'all'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleProactiveTestSend = async () => {
    if (!memoryCharacterId) return
    await sendProactiveTest(memoryCharacterId)
    const rows = await getProactiveEvents(20)
    setProactiveEvents(rows)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3000)
  }

  const currentProvider = providers.find((item) => item.id === provider) || providers[0]

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div className="apple-skeleton" style={{ height: 32, width: 200, marginBottom: 32 }} />
        <div className="apple-skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-up" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px 8px', borderRadius: 6, fontSize: 14 }}
            >
              {t('settings.back')}
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', letterSpacing: 0 }}>{t('settings.title')}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px var(--shadow-card)' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldIcon size={18} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text)' }}>{t('settings.aiConfig')}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 42 }}>
              {t('settings.aiConfigHint')}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 8 }}>{t('settings.provider')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {providers.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleProviderChange(item.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: provider === item.id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: provider === item.id ? '#fff' : 'var(--color-text)',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>API Key</label>
            <input className="apple-input" type="password" placeholder={currentProvider.keyPlaceholder} value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%', fontSize: 14, padding: '10px 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>
                {apiKey ? t('settings.apiKeyHintReady') : t('settings.apiKeyHintSaved')}
              </p>
              {currentProvider.keyLink && (
                <a href={currentProvider.keyLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--color-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {currentProvider.keyLinkLabel}
                </a>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>{t('settings.model')}</label>
            {currentProvider.models.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {currentProvider.models.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setModel(item.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: model === item.value ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: model === item.value ? '#fff' : 'var(--color-text)',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <input className="apple-input" type="text" placeholder={t('settings.modelPlaceholder')} value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', fontSize: 14, padding: '10px 14px' }} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>{t('settings.baseUrl')}</label>
            <input className="apple-input" type="text" placeholder="https://api.openai.com/v1" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} style={{ width: '100%', fontSize: 14, padding: '10px 14px' }} />
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {t('settings.baseUrlHint')}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>联网搜索</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>用于实时信息查询，搜索内容只作为本轮临时参考，不写入关系记忆。</p>
              </div>
              <Toggle checked={webSearchEnabled} onChange={setWebSearchEnabled} label={webSearchEnabled ? '已开启' : '已关闭'} />
            </div>
            <div className="settings-control-grid two">
              <label>搜索服务
                <select
                  className="apple-input"
                  value={webSearchProvider}
                  onChange={(e) => {
                    const value = e.target.value
                    setWebSearchProvider(value)
                    if (value === 'tavily') setWebSearchEndpoint('https://api.tavily.com/search')
                    if (value === 'serper') setWebSearchEndpoint('https://google.serper.dev/search')
                    if (value === 'bing') setWebSearchEndpoint('https://api.bing.microsoft.com/v7.0/search')
                  }}
                >
                  <option value="tavily">Tavily</option>
                  <option value="serper">Serper</option>
                  <option value="bing">Bing Search</option>
                  <option value="custom">自定义</option>
                </select>
              </label>
              <label>结果数量
                <input className="apple-input" type="number" min={1} max={10} value={webSearchMaxResults} onChange={(e) => setWebSearchMaxResults(Number(e.target.value || 1))} />
              </label>
              <label>Search API Key
                <input className="apple-input" type="password" placeholder="搜索服务的 Key" value={webSearchApiKey} onChange={(e) => setWebSearchApiKey(e.target.value)} />
              </label>
              <label>搜索接口地址
                <input className="apple-input" type="text" placeholder="https://api.tavily.com/search" value={webSearchEndpoint} onChange={(e) => setWebSearchEndpoint(e.target.value)} />
              </label>
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '8px 0 0' }}>
              开源版不内置第三方搜索 Key。未配置 Key 时，聊天仍会正常走大模型，不会联网补充资料。
            </p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>我的称呼</label>
            <input className="apple-input" type="text" placeholder="不填写则只显示欢迎回来" maxLength={24} value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', fontSize: 14, padding: '10px 14px' }} />
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              仅用于首页欢迎语，本地保存，不是账号登录名。
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="cta-primary" style={{ fontSize: 14, padding: '10px 24px' }} onClick={handleSave}>
              {t('settings.save')}
            </button>
            {saved && <span style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 500 }}>{t('settings.saved')}</span>}
          </div>
        </div>

        <div className="settings-console-grid">
          <Panel
            eyebrow="COMPANION OPS"
            title="主动消息策略中心"
            description="角色会在用户空窗后自然出现，但受免打扰、发送间隔和每日上限约束。"
            action={<Toggle checked={proactiveEnabled} onChange={setProactiveEnabled} label={proactiveEnabled ? '运行中' : '已暂停'} />}
          >
            <div className="settings-kpi-row">
              <div className="settings-kpi-card"><span>每日上限</span><strong>{proactiveDailyCap}</strong></div>
              <div className="settings-kpi-card"><span>空窗触发</span><strong>{proactiveMinIdleHours}h</strong></div>
              <div className="settings-kpi-card"><span>消息间隔</span><strong>{proactiveMinIntervalHours}h</strong></div>
            </div>
            <div className="settings-control-grid">
              <label>每日上限<input className="apple-input" type="number" min={0} max={20} value={proactiveDailyCap} onChange={(e) => setProactiveDailyCap(Number(e.target.value || 0))} /></label>
              <label>最小空窗(小时)<input className="apple-input" type="number" min={1} max={72} value={proactiveMinIdleHours} onChange={(e) => setProactiveMinIdleHours(Math.max(1, Number(e.target.value || 1)))} /></label>
              <label>消息间隔(小时)<input className="apple-input" type="number" min={1} max={72} value={proactiveMinIntervalHours} onChange={(e) => setProactiveMinIntervalHours(Math.max(1, Number(e.target.value || 1)))} /></label>
              <label>免打扰开始<input className="apple-input" type="number" min={0} max={23} value={proactiveQuietStart} onChange={(e) => setProactiveQuietStart(Number(e.target.value || 0))} /></label>
              <label>免打扰结束<input className="apple-input" type="number" min={0} max={23} value={proactiveQuietEnd} onChange={(e) => setProactiveQuietEnd(Number(e.target.value || 0))} /></label>
            </div>
            <div className="settings-section-head">
              <span>最近触发</span>
              <button className="cta-ghost settings-small-button" onClick={handleProactiveTestSend}>测试发送</button>
            </div>
            <div className="settings-event-list compact">
              {proactiveEvents.length === 0 ? (
                <div className="settings-empty">暂无主动消息记录</div>
              ) : proactiveEvents.map((event) => (
                <article key={event.id} className="settings-event-item">
                  <div><strong>{event.character_name || '角色'}</strong><time>{formatEventTime(event.created_at)}</time></div>
                  <p>{event.content}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="QUALITY"
            title="人设稳定器"
            description="检测助手口吻、内部规则泄漏和角色身份漂移，必要时自动改写。"
            action={<Toggle checked={personaStabilizerEnabled} onChange={setPersonaStabilizerEnabled} label={personaStabilizerEnabled ? '守护中' : '关闭'} />}
          >
            <div className="settings-kpi-row">
              <div className="settings-kpi-card"><span>24h命中</span><strong>{stabilizerStats.total24h}</strong></div>
              <div className="settings-kpi-card"><span>Top原因</span><strong>{stabilizerStats.byReason[0]?.reason || '-'}</strong></div>
              <div className="settings-kpi-card"><span>模式</span><strong>{personaStabilizerStrictMode ? '严格' : '温和'}</strong></div>
            </div>
            <div className="settings-control-grid two">
              <label className="settings-check-row"><input type="checkbox" checked={personaStabilizerStrictMode} onChange={(e) => setPersonaStabilizerStrictMode(e.target.checked)} />严格重写</label>
              <label>回退风格<select className="apple-input" value={personaFallbackStyle} onChange={(e) => setPersonaFallbackStyle(e.target.value)}><option value="gentle">gentle</option><option value="concise">concise</option></select></label>
            </div>
            <div className="settings-event-list">
              {stabilizerEvents.length === 0 ? (
                <div className="settings-empty">暂无命中记录</div>
              ) : stabilizerEvents.map((event) => (
                <article key={event.id} className="settings-event-item quality">
                  <div><strong>{event.reason}</strong><time>{formatEventTime(event.created_at)}</time></div>
                  <p>raw: {event.raw_reply.slice(0, 90)}</p>
                  <p>final: {event.final_reply.slice(0, 90)}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="MEMORY" title="关系记忆面板" description="这里展示由聊天内容和互动频率慢慢形成的长期关系状态；即时情绪会在每次对话里实时推断，不在这里手动调。">
            <div className="settings-section-head topless">
              <label className="settings-character-select">角色<select className="apple-input" value={memoryCharacterId} onChange={(e) => setMemoryCharacterId(e.target.value)}>{characters.map((char) => <option key={char.id} value={char.id}>{char.name}</option>)}</select></label>
              <div><button className="cta-ghost settings-small-button" onClick={handleMemoryReset}>重置成长状态</button></div>
            </div>
            <div className="settings-memory-note">
              这些数值不是用户偏好开关，而是角色关系的长期记忆。温暖、稳定、频繁的聊天会提高亲密度和信任；长时间冷落会增加孤独感；高强度连续互动会增加疲劳。
            </div>
            <div className="memory-meter-list">
              {([
                ['affection', '亲密度'], ['trust', '信任值'], ['loneliness', '孤独感'], ['fatigue', '疲劳'], ['stability', '稳定度'],
              ] as const).map(([key, label]) => (
                <div key={key} className={`memory-meter readonly ${key}`}>
                  <span><strong>{label}</strong><em>{memoryForm[key]}</em></span>
                  <div className="memory-meter-track" aria-hidden="true"><i style={{ width: `${memoryForm[key]}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="settings-section-head">
              <span>变更历史</span>
              <div><select className="apple-input settings-filter" value={memoryEventFilter} onChange={(e) => setMemoryEventFilter(e.target.value)}><option value="all">all</option><option value="chat_update">chat_update</option></select><button className="cta-ghost settings-small-button" onClick={handleMemoryExport}>导出JSON</button></div>
            </div>
            <div className="settings-event-list compact">
              {memoryEvents.filter((event) => memoryEventFilter === 'all' || event.event_type === memoryEventFilter).length === 0 ? (
                <div className="settings-empty">暂无记忆变更记录</div>
              ) : memoryEvents.filter((event) => memoryEventFilter === 'all' || event.event_type === memoryEventFilter).map((event) => {
                let snapshot: any = {}
                try { snapshot = JSON.parse(event.snapshot || '{}') } catch { snapshot = {} }
                return (
                  <article key={event.id} className="settings-event-item">
                    <div><strong>{event.event_type}</strong><time>{formatEventTime(event.created_at)}</time></div>
                    <p>亲密 {snapshot.affection ?? '-'} / 信任 {snapshot.trust ?? '-'} / 孤独 {snapshot.loneliness ?? '-'} / 疲劳 {snapshot.fatigue ?? '-'} / 稳定 {snapshot.stability ?? '-'}</p>
                  </article>
                )
              })}
            </div>
          </Panel>

          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{t('settings.petPanel')}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  {t('settings.petPanelHint')}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={petEnabled}
                onClick={() => {
                  setPetEnabledState((value) => {
                    const next = !value
                    if (next) {
                      window.electronAPI?.openPet()
                    } else {
                      window.electronAPI?.closePet()
                    }
                    return next
                  })
                }}
                style={{
                  width: 56,
                  height: 32,
                  borderRadius: 999,
                  border: '1px solid var(--color-border)',
                  background: petEnabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.24)',
                  padding: 3,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: '#fff',
                    transform: petEnabled ? 'translateX(24px)' : 'translateX(0)',
                    transition: 'transform 0.18s ease',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px var(--shadow-card)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>{t('settings.theme')}</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {themes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setThemeId(item.id)}
                  style={{
                    flex: 1,
                    padding: '16px 12px',
                    borderRadius: 14,
                    border: item.id === theme.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: item.id === theme.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: item.colors.primary, boxShadow: `0 4px 12px ${item.colors.primary}40` }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px var(--shadow-card)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{t('settings.language')}</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              {t('settings.languageHint')}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {([
                { key: 'zh', label: t('settings.languageZh') },
                { key: 'en', label: t('settings.languageEn') },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setLocale(item.key)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: item.key === locale ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: item.key === locale ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-warning-subtle)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StatusWarningIcon size={16} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{t('settings.notes')}</h3>
            </div>
            <ul style={{ marginLeft: 38, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.8, padding: 0, listStyle: 'disc' }}>
              <li>{t('settings.note1')}</li>
              <li>{t('settings.note2')}</li>
              <li>{t('settings.note3')}</li>
              <li>{t('settings.note4')}</li>
            </ul>
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-success-subtle)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckIcon size={16} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{t('settings.getApiKeys')}</h3>
            </div>
            <div style={{ marginLeft: 38, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {providers.filter((item) => item.keyLink).map((item) => (
                <a key={item.id} href={item.keyLink} target="_blank" rel="noopener noreferrer" className="cta-outline" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
