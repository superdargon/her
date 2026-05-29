import { useEffect, useState } from 'react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { SparklesArt } from '@/components/Icons'
import MascotSleeping from '@/components/MascotSleeping'
import type { EmotionState, MascotMemory } from '@/store/emotionEngine'

interface MascotProps {
  emotion: EmotionState
  label: string
  message: string
  memory?: MascotMemory
  variant?: 'sidebar' | 'hero' | 'compact'
  dynamic?: boolean
}

const stateMachineName = 'State Machine 1'
const mascotSrc = '/assets/mascot/cat.riv'
const mascotConfigSrc = '/assets/mascot/mascot-config.json'

const emotionArtMap: Record<EmotionState, string> = {
  idle: '/assets/mascot/emotions/idle.png',
  happy: '/assets/mascot/emotions/happy.png',
  excited: '/assets/mascot/emotions/excited.png',
  thinking: '/assets/mascot/emotions/thinking.png',
  sleeping: '/assets/mascot/emotions/sleeping.png',
  sad: '/assets/mascot/emotions/sad.png',
  error: '/assets/mascot/emotions/error.png',
  warning: '/assets/mascot/emotions/warning.png',
  love: '/assets/mascot/emotions/love.png',
  listening: '/assets/mascot/emotions/listening.png',
  typing: '/assets/mascot/emotions/typing.png',
  celebrating: '/assets/mascot/emotions/celebrating.png',
}

const emotionToRive: Partial<Record<EmotionState, { trigger?: 'triggerHappy' | 'triggerExcited'; bool?: 'isThinking' | 'isSleeping' | 'isSad'; emotion: number }>> = {
  idle: { emotion: 0 },
  happy: { trigger: 'triggerHappy', emotion: 1 },
  love: { trigger: 'triggerHappy', emotion: 1 },
  listening: { emotion: 1 },
  thinking: { bool: 'isThinking', emotion: 2 },
  typing: { bool: 'isThinking', emotion: 2 },
  sleeping: { bool: 'isSleeping', emotion: 3 },
  sad: { bool: 'isSad', emotion: 4 },
  error: { bool: 'isSad', emotion: 4 },
  warning: { bool: 'isSad', emotion: 4 },
  excited: { trigger: 'triggerExcited', emotion: 5 },
  celebrating: { trigger: 'triggerExcited', emotion: 5 },
}

export default function Mascot({ emotion, label, message, memory, variant = 'hero', dynamic = false }: MascotProps) {
  const affection = memory?.affectionLevel ?? 0
  const [riveAvailable, setRiveAvailable] = useState(false)

  useEffect(() => {
    if (!dynamic) return

    let cancelled = false
    fetch(mascotConfigSrc)
      .then(response => response.ok ? response.json() : { enabled: false })
      .then(config => {
        if (!cancelled) setRiveAvailable(Boolean(config.enabled))
      })
      .catch(() => {
        if (!cancelled) setRiveAvailable(false)
      })

    return () => {
      cancelled = true
    }
  }, [dynamic])

  const showRive = dynamic && riveAvailable

  return (
    <div className={`companion-mascot companion-mascot-${variant}`} data-emotion={emotion}>
      <div className="mascot-aura" />
      <SparklesArt className="mascot-sparkles" />
      <div className="mascot-stage">
        {showRive ? (
          <RiveMascot emotion={emotion} />
        ) : dynamic ? (
          <EmotionArtMascot emotion={emotion} />
        ) : (
          <EmotionArtMascot emotion={emotion} />
        )}
        <span className="mascot-status">{label}</span>
      </div>
      <div className="mascot-dialog">
        <strong>{message}</strong>
        {variant !== 'compact' && (
          <span>亲密度 {affection}</span>
        )}
      </div>
    </div>
  )
}

function EmotionArtMascot({ emotion }: { emotion: EmotionState }) {
  if (emotion === 'sleeping' || emotion === 'thinking') {
    return (
      <div className="mascot-procedural" data-pose={emotion}>
        <MascotSleeping
          emotion={emotion === 'thinking' ? 'thinking' : 'sleeping'}
          fallbackSrc={emotion === 'thinking' ? '/assets/mascot/emotions/thinking.png' : '/assets/mascot/emotions/sleeping.png'}
        />
      </div>
    )
  }

  const artSrc = emotionArtMap[emotion] ?? emotionArtMap.idle

  return (
    <div className="mascot-procedural" data-pose={emotion}>
      <img className="mascot-emotion-art" src={artSrc} alt={`? ${emotion}`} draggable={false} />
    </div>
  )
}

function RiveMascot({ emotion }: { emotion: EmotionState }) {
  const { rive, RiveComponent } = useRive({
    src: mascotSrc,
    stateMachines: stateMachineName,
    autoplay: true,
  })

  const emotionInput = useStateMachineInput(rive, stateMachineName, 'emotion')
  const isThinking = useStateMachineInput(rive, stateMachineName, 'isThinking')
  const isSleeping = useStateMachineInput(rive, stateMachineName, 'isSleeping')
  const isSad = useStateMachineInput(rive, stateMachineName, 'isSad')
  const triggerHappy = useStateMachineInput(rive, stateMachineName, 'triggerHappy')
  const triggerExcited = useStateMachineInput(rive, stateMachineName, 'triggerExcited')

  useEffect(() => {
    if (!rive) return

    const mapping = emotionToRive[emotion] ?? emotionToRive.idle!

    if (emotionInput) emotionInput.value = mapping.emotion
    if (isThinking) isThinking.value = mapping.bool === 'isThinking'
    if (isSleeping) isSleeping.value = mapping.bool === 'isSleeping'
    if (isSad) isSad.value = mapping.bool === 'isSad'
    if (mapping.trigger === 'triggerHappy') triggerHappy?.fire()
    if (mapping.trigger === 'triggerExcited') triggerExcited?.fire()
  }, [emotion, emotionInput, isSad, isSleeping, isThinking, rive, triggerExcited, triggerHappy])

  return <RiveComponent className="mascot-rive" />
}
