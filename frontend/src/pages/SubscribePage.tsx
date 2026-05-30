import { useEffect, useMemo, useState } from 'react'
import { getBots, getCharacters, getRelationshipMemory, getUsage } from '../api'
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

interface RelationshipMemory {
  affection: number
  trust: number
  loneliness: number
  fatigue: number
  stability: number
}

const zhCopy = {
  title: '陪伴成长中心',
  subtitle: '这里不再谈套餐，而是记录你和宠物、角色之间的关系如何慢慢长出来。',
  currentState: '当前陪伴状态',
  focus: '今日关系焦点',
  daysTogether: '陪伴天数',
  activeRoles: '活跃角色',
  interactions: '今日互动',
  emotion: '当前情绪',
  affection: '亲密度',
  trust: '信任值',
  lonely: '孤独感',
  fatigue: '疲劳值',
  growthPanel: '成长面板',
  timeline: '关系时间线',
  unlocked: '已解锁的陪伴进度',
  companionSummary: '陪伴摘要',
  moodLine: '这些值会直接影响后续陪伴状态。',
  unitDays: '天',
  unitRoles: '个',
  unitMsgs: '条',
  noChars: '你还没有创建角色，先从第一个陪伴对象开始吧。',
  activeNow: '当前在线',
  firstRole: '创建了第一个角色',
  roleCount: '目前拥有 {count} 个角色',
  connectedCount: '已连接 {count} 个角色到陪伴系统',
  usedToday: '今天已经互动 {count} 次',
  trustHint: '可以安排更多连续互动，让信任继续稳定上升。',
  lonelyHint: '今天适合多发起几次对话，降低她的等待感。',
  fatigueHint: '她有一点累了，轻一点、慢一点的互动会更舒服。',
  affectionHint: '现在很适合触发撒娇、开心、贴贴一类的情绪反馈。',
  unlock1: '基础情绪反馈',
  unlock2: '角色关系记忆',
  unlock3: '活跃度追踪',
  unlock4: '长期陪伴状态',
  milestone1: '你们的关系已经从“使用软件”走向“持续陪伴”。',
  milestone2: '角色越多，情绪系统越有层次感。',
  milestone3: '后续很适合接入回忆、勋章和动作解锁。',
} as const

const enCopy = {
  title: 'Companion Growth Center',
  subtitle: 'This page is no longer about plans. It tracks how your bond with the pet and roles is growing over time.',
  currentState: 'Current Companion State',
  focus: "Today\'s Relationship Focus",
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
  moodLine: 'These values directly shape the companion state.',
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
  fatigueHint: 'The companion is a little tired. Softer, slower interaction would fit well.',
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
  const [relationshipMemory, setRelationshipMemory] = useState<RelationshipMemory>({ affection: 35, trust: 35, loneliness: 0, fatigue: 10, stability: 45 })
  const [loading, setLoading] = useState(true)
  const { label, message } = useEmotionEngine()
  const { locale } = useI18n()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [usageData, characterList, botList] = await Promise.all([getUsage(), getCharacters(), getBots()])
        if (cancelled) return
        setUsage(usageData)
        setCharacters(characterList)
        setBots(botList)

        const focusCharacterId = characterList[0]?.id
        if (focusCharacterId) {
          const memory = await getRelationshipMemory(focusCharacterId)
          if (!cancelled) {
            setRelationshipMemory({
              affection: Number(memory.affection || 35),
              trust: Number(memory.trust || 35),
              loneliness: Number(memory.loneliness || 0),
              fatigue: Number(memory.fatigue || 10),
              stability: Number(memory.stability || 45),
            })
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const copy = locale === 'zh' ? zhCopy : enCopy

  const connectedCount = bots.filter((bot) => bot.active).length
  const createdAtValues = characters.map((char) => char.created_at).filter((value): value is number => typeof value === 'number')
  const firstCreatedAt = createdAtValues.length > 0 ? Math.min(...createdAtValues) : Date.now()
  const daysTogether = Math.max(1, Math.ceil((Date.now() - firstCreatedAt) / 86400000))
  const interactionsToday = usage?.used ?? 0
  const usageQuota = usage?.quota ?? 30

  const focusText = relationshipMemory.loneliness > 50
    ? copy.lonelyHint
    : relationshipMemory.fatigue > 50
      ? copy.fatigueHint
      : relationshipMemory.trust > 55
        ? copy.affectionHint
        : copy.trustHint

  const timelineItems = [
    copy.firstRole,
    interpolate(copy.roleCount, { count: characters.length }),
    interpolate(copy.connectedCount, { count: connectedCount }),
    interpolate(copy.usedToday, { count: interactionsToday }),
  ]

  const growthItems = [
    { label: copy.affection, value: relationshipMemory.affection, Icon: HeartDecoration },
    { label: copy.trust, value: relationshipMemory.trust, Icon: ShieldIcon },
    { label: copy.lonely, value: relationshipMemory.loneliness, Icon: StarArt },
    { label: copy.fatigue, value: relationshipMemory.fatigue, Icon: MessageIcon },
  ]

  const unlockedItems = [copy.unlock1, copy.unlock2, copy.unlock3, copy.unlock4]

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
