import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api, clearLocalMessages, getLocalMessages } from '../api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function CompanionChatPage() {
  const { characterId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [characterName, setCharacterName] = useState('伴侣')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const loadMessages = async () => {
    if (!characterId) return
    const rows = await getLocalMessages(characterId)
    setMessages(rows.map((row: any) => ({
      id: row.id,
      role: row.role === 'assistant' ? 'assistant' : 'user',
      content: row.content,
      timestamp: row.created_at,
    })))
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
  }, [messages])

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus()
    }
  }, [loading, characterId])

  const handleSend = async () => {
    if (!input.trim() || !characterId || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const data = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({
          characterId,
          message: userMessage.content
        })
      })

      const reply = data.reply || '抱歉，我没有理解你的意思。'
      
      // Split multi-message response into separate messages
      const replyLines = reply.split('\n').filter((line: string) => line.trim())
      
      // Add messages with delay for natural feeling
      for (let i = 0; i < replyLines.length; i++) {
        const line = replyLines[i].trim()
        if (!line) continue
        
        // Add delay between messages (500ms-1500ms)
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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = async () => {
    if (!characterId || messages.length === 0) return
    if (!confirm('确定清空这段聊天记录吗？')) return
    await clearLocalMessages(characterId)
    setMessages([])
  }

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: '20px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em'
          }}>
            {characterName}
          </h1>
          <button type="button" onClick={handleClear} disabled={messages.length === 0} className="cta-outline" style={{ padding: '8px 14px', fontSize: 13 }}>
            清空记录
          </button>
        </div>
        <p style={{ 
          fontSize: 14, 
          color: 'var(--color-text-secondary)',
          marginTop: 4
        }}>
          伴侣聊天
        </p>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>
              开始和{characterName}聊天吧
            </p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              发送消息开始对话
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-surface)',
                color: msg.role === 'user' 
                  ? 'white' 
                  : 'var(--color-text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {characterName}正在输入...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        padding: '16px 0',
        borderTop: '1px solid var(--color-border)'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`和${characterName}聊天...`}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'none',
              minHeight: '48px',
              maxHeight: '120px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              border: 'none',
              background: input.trim() && !loading 
                ? 'var(--color-primary)' 
                : 'var(--color-border)',
              color: input.trim() && !loading 
                ? 'white' 
                : 'var(--color-text-secondary)',
              fontSize: 15,
              fontWeight: 600,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            发送
          </button>
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
