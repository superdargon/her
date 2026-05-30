import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, clearLocalMessages, getLocalMessages } from '../api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  timestamp: number
}

function parseMessageContent(content: string): { text: string; images: string[] } {
  const raw = String(content || '')
  if (!raw.trim().startsWith('{')) return { text: raw, images: [] }
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.kind === 'multimodal') {
      return {
        text: String(parsed.text || ''),
        images: Array.isArray(parsed.images) ? parsed.images.filter((url: unknown) => typeof url === 'string') : [],
      }
    }
  } catch {
    // Keep old/plain messages readable.
  }
  return { text: raw, images: [] }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function CompanionChatPage() {
  const { characterId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [characterName, setCharacterName] = useState('伴侣')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const focusInput = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      const length = inputRef.current?.value.length ?? 0
      inputRef.current?.setSelectionRange(length, length)
    })
  }

  const addImageFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, Math.max(0, 4 - pendingImages.length))
    if (!imageFiles.length) return
    const urls = await Promise.all(imageFiles.map(fileToDataUrl))
    setPendingImages((prev) => [...prev, ...urls].slice(0, 4))
    focusInput()
  }

  const loadMessages = async () => {
    if (!characterId) return
    const rows = await getLocalMessages(characterId)
    setMessages(rows.flatMap((row: any) => {
      const role = row.role === 'assistant' ? 'assistant' : 'user'
      const parsed = parseMessageContent(row.content)
      const parts = parsed.text
        .split(/\r?\n/)
        .map((part) => part.trim())
        .filter(Boolean)
      const contents = parts.length > 0 ? parts : (parsed.images.length ? [''] : [parsed.text])
      return contents.map((content, index) => ({
        id: `${row.id}-${index}`,
        role,
        content,
        images: index === 0 ? parsed.images : [],
        timestamp: row.created_at,
      }))
    }))
  }

  useEffect(() => {
    if (characterId) {
      api(`/characters/${characterId}`)
        .then((char: any) => setCharacterName(char.name || '伴侣'))
        .catch(() => {})
      loadMessages().catch(() => {})
    }
  }, [characterId])

  useEffect(() => {
    if (!characterId) return
    const timer = window.setInterval(() => {
      if (!loading) loadMessages().catch(() => {})
    }, 5000)
    return () => window.clearInterval(timer)
  }, [characterId, loading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) focusInput()
  }, [loading, characterId])

  const handleSend = async () => {
    if ((!input.trim() && pendingImages.length === 0) || !characterId || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      images: pendingImages,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setPendingImages([])
    setLoading(true)

    try {
      const data = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({
          characterId,
          message: userMessage.content,
          images: userMessage.images || [],
        })
      })

      const reply = data.reply || '抱歉，我没有理解你的意思。'
      const replyLines = Array.isArray(data.replyLines)
        ? data.replyLines.filter((line: string) => String(line).trim())
        : reply.split('\n').filter((line: string) => line.trim())

      for (let i = 0; i < replyLines.length; i++) {
        const line = String(replyLines[i]).trim()
        if (!line) continue

        if (i > 0) {
          const delay = 500 + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const assistantMessage: Message = {
          id: `${Date.now()}-${i}`,
          role: 'assistant',
          content: line,
          timestamp: Date.now()
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `错误：${err.message}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      focusInput()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    e.preventDefault()
    await addImageFiles(files)
  }

  const handleClear = async () => {
    if (!characterId || messages.length === 0) return
    if (!confirm('确定清空这段聊天记录吗？')) return
    await clearLocalMessages(characterId)
    setMessages([])
    setPendingImages([])
    focusInput()
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '20px 24px 24px', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', letterSpacing: 0, margin: 0 }}>{characterName}</h1>
          <button type="button" onClick={handleClear} disabled={messages.length === 0} className="cta-outline" style={{ padding: '8px 14px', fontSize: 13 }}>清空记录</button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4, marginBottom: 0 }}>伴侣聊天</p>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 0 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>开始和{characterName}聊天吧</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>发送消息开始对话</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const prev = messages[index - 1]
          const next = messages[index + 1]
          const groupedWithPrev = prev?.role === msg.role
          const groupedWithNext = next?.role === msg.role

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease', marginTop: groupedWithPrev ? '0' : '12px' }}>
              <div style={{
                maxWidth: '72%',
                padding: (msg.images?.length && !msg.content) ? '8px' : '12px 16px',
                borderRadius: msg.role === 'user'
                  ? (groupedWithPrev ? (groupedWithNext ? '18px 8px 8px 18px' : '18px 8px 4px 18px') : (groupedWithNext ? '18px 18px 8px 18px' : '18px 18px 4px 18px'))
                  : (groupedWithPrev ? (groupedWithNext ? '8px 18px 18px 8px' : '8px 18px 18px 4px') : (groupedWithNext ? '18px 18px 18px 8px' : '18px 18px 18px 4px')),
                background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                boxShadow: msg.role === 'user' ? '0 8px 18px rgba(255, 132, 172, 0.24)' : '0 8px 18px rgba(55, 65, 81, 0.08)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {!!msg.images?.length && (
                  <div style={{ display: 'grid', gap: 8, marginBottom: msg.content ? 8 : 0 }}>
                    {msg.images.map((src, imageIndex) => (
                      <img key={`${msg.id}-image-${imageIndex}`} src={src} alt="发送的图片" style={{ maxWidth: 240, maxHeight: 220, borderRadius: 12, objectFit: 'cover', display: 'block' }} />
                    ))}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', boxShadow: '0 8px 18px rgba(55, 65, 81, 0.08)' }}>{characterName}正在输入...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px 0 0', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        {!!pendingImages.length && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {pendingImages.map((src, index) => (
              <div key={`${src.slice(0, 24)}-${index}`} style={{ position: 'relative' }}>
                <img src={src} alt="待发送图片" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, display: 'block', boxShadow: '0 6px 14px rgba(55, 65, 81, 0.12)' }} />
                <button type="button" aria-label="移除图片" onClick={() => setPendingImages((prev) => prev.filter((_, i) => i !== index))} style={{ position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', lineHeight: '18px', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addImageFiles(Array.from(e.target.files || [])).finally(() => { e.currentTarget.value = '' })} />
          <button type="button" title="添加图片" onClick={() => fileInputRef.current?.click()} style={{ width: 48, height: 48, borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>＋</button>
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} onPaste={handlePaste} placeholder={`和${characterName}聊天...`} style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 15, lineHeight: 1.5, resize: 'none', minHeight: '48px', maxHeight: '120px', outline: 'none', fontFamily: 'inherit' }} rows={1} />
          <button onClick={handleSend} disabled={(!input.trim() && pendingImages.length === 0) || loading} style={{ padding: '12px 24px', borderRadius: '24px', border: 'none', background: (input.trim() || pendingImages.length > 0) && !loading ? 'var(--color-primary)' : 'var(--color-border)', color: (input.trim() || pendingImages.length > 0) && !loading ? 'white' : 'var(--color-text-secondary)', fontSize: 15, fontWeight: 600, cursor: (input.trim() || pendingImages.length > 0) && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', flexShrink: 0 }}>发送</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
