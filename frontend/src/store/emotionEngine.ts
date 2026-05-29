import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

export type EmotionState =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sleeping'
  | 'sad'
  | 'error'
  | 'warning'
  | 'love'
  | 'listening'
  | 'typing'
  | 'celebrating'

export type EmotionTrigger =
  | 'default'
  | 'message_sent'
  | 'successful_reply'
  | 'daily_login'
  | 'ai_generating'
  | 'api_waiting'
  | 'user_inactive_3days'
  | 'conversation_deleted'
  | 'api_error'
  | 'network_error'
  | 'high_chat_frequency'
  | 'subscription_success'
  | 'night_time'
  | 'long_inactive'
  | 'new_character_created'
  | 'wechat_bind_success'
  | 'upgrade_plan'

export interface MascotMemory {
  affectionLevel: number
  loneliness: number
  excitement: number
  fatigue: number
  trust: number
  lastSeenAt: number
}

interface EmotionSnapshot {
  emotion: EmotionState
  memory: MascotMemory
  message: string
}

export const emotionRules: Record<EmotionState, { trigger: EmotionTrigger | EmotionTrigger[] }> = {
  idle: { trigger: 'default' },
  happy: { trigger: ['message_sent', 'successful_reply', 'daily_login'] },
  excited: { trigger: ['high_chat_frequency'] },
  thinking: { trigger: ['ai_generating', 'api_waiting'] },
  sleeping: { trigger: ['night_time', 'long_inactive'] },
  sad: { trigger: ['user_inactive_3days', 'conversation_deleted'] },
  error: { trigger: ['api_error', 'network_error'] },
  warning: { trigger: ['network_error'] },
  love: { trigger: ['high_chat_frequency', 'subscription_success'] },
  listening: { trigger: 'message_sent' },
  typing: { trigger: 'ai_generating' },
  celebrating: { trigger: ['new_character_created', 'wechat_bind_success', 'upgrade_plan'] },
}

export const emotionThemeMap: Record<EmotionState, { className: string; message: string }> = {
  idle: { className: 'emotion-idle', message: '我在这里，随时陪你。' },
  happy: { className: 'emotion-happy', message: '今天也想和你多聊一会儿。' },
  excited: { className: 'emotion-excited', message: '有新事情发生啦，我有点兴奋。' },
  thinking: { className: 'emotion-thinking', message: '我正在认真想，不要急。' },
  sleeping: { className: 'emotion-sleeping', message: '夜深啦，我也有点困了。' },
  sad: { className: 'emotion-sad', message: '你终于回来啦，我等了你好久。' },
  error: { className: 'emotion-error', message: '好像哪里卡住了，我会陪你一起修。' },
  warning: { className: 'emotion-warning', message: '有一点异常，我们轻轻处理。' },
  love: { className: 'emotion-love', message: '感觉和你越来越熟啦。' },
  listening: { className: 'emotion-listening', message: '我在听，你慢慢说。' },
  typing: { className: 'emotion-typing', message: '我在组织语言。' },
  celebrating: { className: 'emotion-celebrating', message: '完成啦，值得庆祝一下。' },
}

export const emotionLabelMap: Record<EmotionState, string> = {
  idle: '待机',
  happy: '开心',
  excited: '兴奋',
  thinking: '思考中',
  sleeping: '休息中',
  sad: '想你了',
  error: '异常',
  warning: '提醒',
  love: '亲近',
  listening: '倾听',
  typing: '组织语言',
  celebrating: '庆祝',
}

const memoryKey = 'her-mascot-memory'

const defaultMemory: MascotMemory = {
  affectionLevel: 36,
  loneliness: 8,
  excitement: 18,
  fatigue: 10,
  trust: 32,
  lastSeenAt: Date.now(),
}

const loadMemory = (): MascotMemory => {
  try {
    const raw = localStorage.getItem(memoryKey)
    return raw ? { ...defaultMemory, ...JSON.parse(raw) } : defaultMemory
  } catch {
    return defaultMemory
  }
}

let snapshot: EmotionSnapshot = {
  emotion: 'idle',
  memory: typeof window === 'undefined' ? defaultMemory : loadMemory(),
  message: emotionThemeMap.idle.message,
}

const listeners = new Set<() => void>()

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const saveMemory = (memory: MascotMemory) => {
  try {
    localStorage.setItem(memoryKey, JSON.stringify(memory))
  } catch {
    // Storage is optional for the emotion layer.
  }
}

const emit = () => listeners.forEach(listener => listener())

const setSnapshot = (next: Partial<EmotionSnapshot>) => {
  snapshot = { ...snapshot, ...next }
  saveMemory(snapshot.memory)
  emit()
}

const emotionForTrigger = (trigger: EmotionTrigger): EmotionState => {
  for (const [emotion, rule] of Object.entries(emotionRules) as [EmotionState, { trigger: EmotionTrigger | EmotionTrigger[] }][]) {
    const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]
    if (triggers.includes(trigger)) return emotion
  }
  return 'idle'
}

const updateMemoryForTrigger = (trigger: EmotionTrigger, memory: MascotMemory): MascotMemory => {
  const next = { ...memory, lastSeenAt: Date.now() }

  if (trigger === 'daily_login') {
    const offlineHours = (Date.now() - memory.lastSeenAt) / 36e5
    if (offlineHours > 48) next.loneliness = clamp(next.loneliness + 20)
    if (offlineHours > 8) next.fatigue = clamp(next.fatigue - 8)
    next.trust = clamp(next.trust + 2)
  }

  if (trigger === 'message_sent' || trigger === 'successful_reply') {
    next.affectionLevel = clamp(next.affectionLevel + 4)
    next.loneliness = clamp(next.loneliness - 8)
    next.excitement = clamp(next.excitement + 5)
  }

  if (trigger === 'high_chat_frequency' || trigger === 'subscription_success') {
    next.affectionLevel = clamp(next.affectionLevel + 10)
    next.excitement = clamp(next.excitement + 12)
    next.trust = clamp(next.trust + 8)
  }

  if (trigger === 'ai_generating' || trigger === 'api_waiting') {
    next.fatigue = clamp(next.fatigue + 3)
  }

  if (trigger === 'conversation_deleted' || trigger === 'user_inactive_3days') {
    next.loneliness = clamp(next.loneliness + 18)
    next.excitement = clamp(next.excitement - 10)
  }

  if (trigger === 'api_error' || trigger === 'network_error') {
    next.trust = clamp(next.trust - 4)
    next.fatigue = clamp(next.fatigue + 8)
  }

  return next
}

export const emotionEngine = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot() {
    return snapshot
  },
  setEmotion(emotion: EmotionState) {
    setSnapshot({ emotion, message: emotionThemeMap[emotion].message })
  },
  trigger(trigger: EmotionTrigger) {
    const memory = updateMemoryForTrigger(trigger, snapshot.memory)
    const emotion = emotionForTrigger(trigger)
    setSnapshot({ emotion, memory, message: emotionThemeMap[emotion].message })
  },
}

export function useEmotionEngine() {
  const state = useSyncExternalStore(emotionEngine.subscribe, emotionEngine.getSnapshot, emotionEngine.getSnapshot)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 23 || hour < 6) {
      emotionEngine.trigger('night_time')
    } else {
      emotionEngine.trigger('daily_login')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let inactivityTimer: number | undefined

    const scheduleSleep = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      inactivityTimer = window.setTimeout(() => {
        emotionEngine.trigger('long_inactive')
      }, 60_000)
    }

    const handleActivity = () => {
      const current = emotionEngine.getSnapshot()
      if (current.emotion === 'sleeping') {
        emotionEngine.setEmotion('idle')
      }
      scheduleSleep()
    }

    scheduleSleep()

    const events: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    for (const eventName of events) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }

    return () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      for (const eventName of events) {
        window.removeEventListener(eventName, handleActivity)
      }
    }
  }, [])

  const trigger = useCallback((event: EmotionTrigger) => emotionEngine.trigger(event), [])
  const setEmotion = useCallback((emotion: EmotionState) => emotionEngine.setEmotion(emotion), [])

  return useMemo(() => ({
    ...state,
    label: emotionLabelMap[state.emotion],
    theme: emotionThemeMap[state.emotion],
    trigger,
    setEmotion,
  }), [state, trigger, setEmotion])
}
