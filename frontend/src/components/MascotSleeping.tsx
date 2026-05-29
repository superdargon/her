import { useEffect, useMemo, useState } from 'react'

export type MascotAnimationEmotion = 'idle' | 'thinking' | 'sleeping' | 'happy'

export const animationMap: Record<MascotAnimationEmotion, string[]> = {
  idle: [],
  thinking: [
    '/assets/pets/her-cat/think_01.png',
    '/assets/pets/her-cat/think_02.png',
    '/assets/pets/her-cat/think_03.png',
    '/assets/pets/her-cat/think_04.png',
  ],
  sleeping: [
    '/assets/pets/her-cat/sleep_01.png',
    '/assets/pets/her-cat/sleep_02.png',
    '/assets/pets/her-cat/sleep_03.png',
    '/assets/pets/her-cat/sleep_04.png',
  ],
  happy: [],
}

interface MascotSleepingProps {
  emotion?: Extract<MascotAnimationEmotion, 'sleeping' | 'thinking'>
  size?: number
  fallbackSrc?: string
}

export default function MascotSleeping({
  emotion = 'sleeping',
  size = 96,
  fallbackSrc = '/assets/mascot/emotions/sleeping.png',
}: MascotSleepingProps) {
  const frames = useMemo(() => animationMap[emotion], [emotion])
  const loop = useMemo(() => (
    emotion === 'thinking'
      ? [0, 1, 2, 3, 1, 2, 3]
      : frames.map((_, frameIndex) => frameIndex)
  ), [emotion, frames])
  const intervalMs = emotion === 'thinking' ? 2000 : 1500
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [isChargedThinking, setIsChargedThinking] = useState(false)

  useEffect(() => {
    let cancelled = false

    setReady(false)
    setIndex(0)

    Promise.all(
      frames.map(
        (src) =>
          new Promise<boolean>((resolve) => {
            const image = new Image()
            image.onload = () => resolve(true)
            image.onerror = () => resolve(false)
            image.src = src
          }),
      ),
    ).then((results) => {
      if (!cancelled) setReady(results.every(Boolean))
    })

    return () => {
      cancelled = true
    }
  }, [frames])

  useEffect(() => {
    if (!ready) return

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % loop.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, loop.length, ready])

  useEffect(() => {
    if (emotion !== 'thinking') {
      setIsChargedThinking(false)
      return
    }

    const timer = window.setTimeout(() => {
      setIsChargedThinking(true)
    }, 3000)

    return () => {
      window.clearTimeout(timer)
      setIsChargedThinking(false)
    }
  }, [emotion])

  const activeFrame = ready && loop.length > 0 ? frames[loop[index]] : fallbackSrc

  return (
    <img
      src={activeFrame}
      alt={`? ${emotion}`}
      draggable={false}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        filter: emotion === 'thinking' && isChargedThinking
          ? 'drop-shadow(0 0 8px rgba(166, 142, 255, 0.9)) drop-shadow(0 0 16px rgba(255, 229, 135, 0.75))'
          : undefined,
      }}
    />
  )
}
