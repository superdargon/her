import { useEffect, useMemo, useState } from 'react'
import { getBots, getCharacters, getUsage } from '../api'
import { CheckIcon, HeartDecoration, MessageIcon, ShieldIcon, StarArt, StatusOnlineIcon } from '@/components/Icons'
import { useEmotionEngine } from '@/store/emotionEngine'
import { useI18n } from '@/I18nProvider'

interface Usage {
  plan: string
  used: number
  quota: number
  remaining: number
}

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
}

const zhCopy = {
  title: '\u966a\u4f34\u6210\u957f\u4e2d\u5fc3',
  subtitle: '\u8fd9\u91cc\u4e0d\u518d\u8c08\u5957\u9910\uff0c\u800c\u662f\u8bb0\u5f55\u4f60\u548c\u5ba0\u7269\u3001\u89d2\u8272\u4e4b\u95f4\u7684\u5173\u7cfb\u5982\u4f55\u6162\u6162\u957f\u51fa\u6765\u3002',
  currentState: '\u5f53\u524d\u966a\u4f34\u72b6\u6001',
  focus: '\u4eca\u65e5\u5173\u7cfb\u7126\u70b9',
  daysTogether: '\u966a\u4f34\u5929\u6570',
  activeRoles: '\u6d3b\u8dc3\u89d2\u8272',
  interactions: '\u4eca\u65e5\u4e92\u52a8',
  emotion: '\u5f53\u524d\u60c5\u7eea',
  affection: '\u4eb2\u5bc6\u5ea6',
  trust: '\u4fe1\u4efb\u503c',
  lonely: '\u5b64\u72ec\u611f',
  fatigue: '\u75b2\u52b3\u503c',
  growthPanel: '\u6210\u957f\u9762\u677f',
  timeline: '\u5173\u7cfb\u65f6\u95f4\u7ebf',
  unlocked: '\u5df2\u89e3\u9501\u7684\u966a\u4f34\u8fdb\u5ea6',
  companionSummary: '\u966a\u4f34\u6458\u8981',
  moodLine: '\u4f60\u7684\u5ba0\u7269\u4f1a\u6839\u636e\u8fd9\u4e9b\u72b6\u6001\u7ee7\u7eed\u53d8\u5316\u3002',
  unitDays: '\u5929',
  unitRoles: '\u4e2a',
  unitMsgs: '\u6761',
  noChars: '\u4f60\u8fd8\u6ca1\u6709\u521b\u5efa\u89d2\u8272\uff0c\u5148\u4ece\u7b2c\u4e00\u4e2a\u966a\u4f34\u5bf9\u8c61\u5f00\u59cb\u5427\u3002',
  activeNow: '\u5f53\u524d\u5728\u7ebf',
  firstRole: '\u521b\u5efa\u4e86\u7b2c\u4e00\u4e2a\u89d2\u8272',
  roleCount: '\u76ee\u524d\u62e5\u6709 {count} \u4e2a\u89d2\u8272',
  connectedCount: '\u5df2\u8fde\u63a5 {count} \u4e2a\u89d2\u8272\u5230\u966a\u4f34\u7cfb\u7edf',
  usedToday: '\u4eca\u5929\u5df2\u7ecf\u4e92\u52a8 {count} \u6b21',
  trustHint: '\u53ef\u4ee5\u5b89\u6392\u66f4\u591a\u8fde\u7eed\u4e92\u52a8\uff0c\u8ba9\u4fe1\u4efb\u7ee7\u7eed\u7a33\u5b9a\u4e0a\u5347\u3002',
  lonelyHint: '\u4eca\u5929\u9002\u5408\u591a\u53d1\u8d77\u51e0\u6b21\u5bf9\u8bdd\uff0c\u964d\u4f4e\u5b83\u7684\u7b49\u5f85\u611f\u3002',
  fatigueHint: '\u5b83\u6709\u4e00\u70b9\u7d2f\u4e86\uff0c\u8f7b\u4e00\u70b9\u3001\u6162\u4e00\u70b9\u7684\u4e92\u52a8\u4f1a\u66f4\u8212\u670d\u3002',
  affectionHint: '\u73b0\u5728\u5f88\u9002\u5408\u89e6\u53d1\u6492\u5a07\u3001\u5f00\u5fc3\u3001\u8d34\u8d34\u4e00\u7c7b\u7684\u60c5\u7eea\u53cd\u9988\u3002',
  unlock1: '\u57fa\u7840\u60c5\u7eea\u53cd\u9988',
  unlock2: '\u89d2\u8272\u5173\u7cfb\u8bb0\u5fc6',
  unlock3: '\u6d3b\u8dc3\u5ea6\u8ffd\u8e2a',
  unlock4: '\u957f\u671f\u966a\u4f34\u72b6\u6001',
  milestone1: '\u4f60\u4eec\u7684\u5173\u7cfb\u5df2\u7ecf\u4ece\u201c\u4f7f\u7528\u8f6f\u4ef6\u201d\u8d70\u5411\u201c\u6301\u7eed\u966a\u4f34\u201d\u3002',
  milestone2: '\u89d2\u8272\u8d8a\u591a\uff0c\u60c5\u7eea\u7cfb\u7edf\u8d8a\u6709\u5c42\u6b21\u611f\u3002',
  milestone3: '\u540e\u7eed\u5f88\u9002\u5408\u63a5\u5165\u56de\u5fc6\u3001\u52cb\u7ae0\u548c\u52a8\u4f5c\u89e3\u9501\u3002',
} as const

const enCopy = {
  title: 'Companion Growth Center',
  subtitle: 'This page is no longer about plans. It tracks how your bond with the pet and roles is growing over time.',
  currentState: 'Current Companion State',
  focus: "Today's Relationship Focus",
  daysTogether: 'Days Together',
  activeRoles: 'Active Roles',
  interactions: 'Today Interactions',
  emotion: 'Current Emotion',
  affection: 'Affection',
  trust: 'Trust',
  lonely: 'Loneliness',
  fatigue: 'Fatigue',
  growthPanel: 'Growth Panel',
  timeline: 'Relationship Timeline',
  unlocked: 'Unlocked Progress',
  companionSummary: 'Companion Summary',
  moodLine: 'The pet will keep evolving based on these values.',
  unitDays: 'days',
  unitRoles: 'roles',
  unitMsgs: 'msgs',
  noChars: 'You have not created any roles yet. Start with the first companion.',
  activeNow: 'Active now',
  firstRole: 'Created the first role',
  roleCount: 'Currently has {count} roles',
  connectedCount: 'Connected {count} roles to the companion system',
  usedToday: 'Interacted {count} times today',
  trustHint: 'More steady interactions today would help trust continue rising.',
  lonelyHint: 'A few more check-ins today would reduce that waiting feeling.',
  fatigueHint: 'The pet is a little tired. Softer, slower interaction would fit well.',
  affectionHint: 'This is a good moment for clingy, happy, or affectionate feedback.',
  unlock1: 'Base emotion feedback',
  unlock2: 'Role relationship memory',
  unlock3: 'Activity tracking',
  unlock4: 'Long-term companion state',
  milestone1: 'The relationship is starting to feel more like companionship than software usage.',
  milestone2: 'More roles give the emotion system more depth.',
  milestone3: 'This is a strong base for memories, badges, and animation unlocks later.',
} as const

export default function SubscribePage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const { memory, label, message } = useEmotionEngine()
  const { locale } = useI18n()

  useEffect(() => {
    Promise.all([getUsage(), getCharacters(), getBots()])
      .then(([usageData, characterList, botList]) => {
        setUsage(usageData)
        setCharacters(characterList)
        setBots(botList)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const copy = locale === 'zh' ? zhCopy : enCopy

  const connectedCount = bots.filter((bot) => bot.active).length
  const createdAtValues = characters.map((char) => char.created_at).filter((value): value is number => typeof value === 'number')
  const firstCreatedAt = createdAtValues.length > 0 ? Math.min(...createdAtValues) : Date.now()
  const daysTogether = Math.max(1, Math.ceil((Date.now() - firstCreatedAt) / 86400000))
  const interactionsToday = usage?.used ?? 0
  const usageQuota = usage?.quota ?? 30

  const focusText = memory.loneliness > 50
    ? copy.lonelyHint
    : memory.fatigue > 50
      ? copy.fatigueHint
      : memory.trust > 55
        ? copy.affectionHint
        : copy.trustHint

  const timelineItems = [
    copy.firstRole,
    interpolate(copy.roleCount, { count: characters.length }),
    interpolate(copy.connectedCount, { count: connectedCount }),
    interpolate(copy.usedToday, { count: interactionsToday }),
  ]

  const growthItems = [
    { label: copy.affection, value: memory.affectionLevel, Icon: HeartDecoration },
    { label: copy.trust, value: memory.trust, Icon: ShieldIcon },
    { label: copy.lonely, value: memory.loneliness, Icon: StarArt },
    { label: copy.fatigue, value: memory.fatigue, Icon: MessageIcon },
  ]

  const unlockedItems = [
    copy.unlock1,
    copy.unlock2,
    copy.unlock3,
    copy.unlock4,
  ]

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }} className="animate-fade-up">
        <div className="apple-skeleton" style={{ height: 220, borderRadius: 24, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="apple-skeleton" style={{ height: 160, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up" style={{ padding: '28px 24px 48px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 24,
            padding: 28,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <span className="emotion-chip">{copy.currentState}</span>
              <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: '16px 0 10px', color: 'var(--color-text)', fontWeight: 800 }}>
                {copy.title}
              </h1>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 620 }}>
                {copy.subtitle}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginTop: 24 }}>
                <StatCard label={copy.daysTogether} value={`${daysTogether}`} suffix={copy.unitDays} />
                <StatCard label={copy.activeRoles} value={`${connectedCount}`} suffix={copy.unitRoles} />
                <StatCard label={copy.interactions} value={`${interactionsToday}`} suffix={copy.unitMsgs} />
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-bg)',
                borderRadius: 20,
                padding: 22,
                border: '1px solid var(--color-border)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <strong style={{ fontSize: 16, color: 'var(--color-text)' }}>{copy.focus}</strong>
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>{label}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{message}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)', fontSize: 14, fontWeight: 600 }}>
                <StatusOnlineIcon size={14} />
                {copy.emotion}: {label}
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.7 }}>{focusText}</p>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>
          <section
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 22,
              padding: 24,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text)' }}>{copy.growthPanel}</h2>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{copy.moodLine}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              {growthItems.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 18,
                    padding: 18,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600 }}>{label}</span>
                    <Icon size={18} />
                  </div>
                  <strong style={{ fontSize: 32, lineHeight: 1, color: 'var(--color-text)' }}>{value}</strong>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--color-surface-hover)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(6, value)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 22,
              padding: 24,
              boxShadow: 'var(--shadow-card)',
              display: 'grid',
              gap: 18,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text)' }}>{copy.timeline}</h2>
              <p style={{ margin: '8px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
                {characters.length === 0 ? copy.noChars : copy.activeNow}
              </p>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {timelineItems.map((item, index) => (
                <div key={item} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, alignItems: 'start' }}>
                  <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--color-primary)' }} />
                    {index < timelineItems.length - 1 && <span style={{ width: 2, height: 34, background: 'var(--color-border)' }} />}
                  </div>
                  <div style={{ paddingTop: 1, color: 'var(--color-text)', fontSize: 14, lineHeight: 1.6 }}>{item}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <section
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 22,
              padding: 24,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text)' }}>{copy.unlocked}</h2>
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {unlockedItems.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text)', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-primary)' }}>
                    <CheckIcon size={16} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 22,
              padding: 24,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text)' }}>{copy.companionSummary}</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 18, color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              <div>{copy.milestone1}</div>
              <div>{copy.milestone2}</div>
              <div>{copy.milestone3}</div>
              <div>
                {copy.interactions}: <strong style={{ color: 'var(--color-text)' }}>{interactionsToday}</strong> / {usageQuota}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        borderRadius: 18,
        border: '1px solid var(--color-border)',
        padding: 18,
      }}
    >
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <strong style={{ fontSize: 34, lineHeight: 1, color: 'var(--color-text)' }}>{value}</strong>
        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{suffix}</span>
      </div>
    </div>
  )
}

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? `{${token}}`))
}
