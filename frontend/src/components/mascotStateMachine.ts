import type { EmotionState } from '@/store/emotionEngine'

export const mascotStates = ['idle', 'happy', 'thinking', 'sleeping', 'sad', 'excited'] as const

export const mascotStateMachineTransitions = [
  { from: 'idle', to: 'happy', condition: 'emotion == happy' },
  { from: 'idle', to: 'thinking', condition: 'emotion == thinking' },
  { from: 'idle', to: 'sleeping', condition: 'inactive > 30min' },
  { from: 'happy', to: 'idle', condition: 'timeout' },
  { from: 'thinking', to: 'happy', condition: 'ai_done' },
  { from: 'thinking', to: 'sad', condition: 'api_error' },
  { from: 'sad', to: 'idle', condition: 'user_return' },
  { from: 'sleeping', to: 'happy', condition: 'user_active' },
] as const

export const mascotRiveInputs = {
  emotion: 'number',
  isThinking: 'boolean',
  isSleeping: 'boolean',
  isSad: 'boolean',
  triggerHappy: 'trigger',
  triggerExcited: 'trigger',
} as const

export const emotionToMascotState: Record<EmotionState, typeof mascotStates[number]> = {
  idle: 'idle',
  happy: 'happy',
  love: 'happy',
  listening: 'happy',
  thinking: 'thinking',
  typing: 'thinking',
  sleeping: 'sleeping',
  sad: 'sad',
  error: 'sad',
  warning: 'sad',
  excited: 'excited',
  celebrating: 'excited',
}
