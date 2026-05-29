import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { clearMessages, getMessages } from '../api'

interface Message {
  id: string
  direction: 'in' | 'out'
  content: string
  msg_type: string
  created_at: number
}

function fmtTime(ts: number) {
  const d = new Date(ts)
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function MessagesPage() {
  const { botId } = useParams()
  const [msgs, setMsgs] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const offsetRef = useRef(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 30

  const fetchMsgs = useCallback(async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offsetRef.current
      const data = await getMessages(botId!, currentOffset, limit)
      if (reset) setMsgs(data)
      else setMsgs((prev) => [...prev, ...data])
      setHasMore(data.length >= limit)
      offsetRef.current = currentOffset + data.length
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [botId])

  useEffect(() => {
    offsetRef.current = 0
    setLoading(true)
    fetchMsgs(true)
  }, [botId, fetchMsgs])

  const handleClear = async () => {
    if (!botId || msgs.length === 0) return
    if (!confirm('确定清空这段微信聊天记录吗？')) return
    await clearMessages(botId)
    offsetRef.current = 0
    setMsgs([])
    setHasMore(false)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 20px' }} className="animate-fade-up">
        <div className="apple-skeleton" style={{ height: 32, width: 128, marginBottom: 32 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div className="apple-skeleton" style={{ height: 64, width: i % 2 === 0 ? '60%' : '40%', borderRadius: 18 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }} className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--color-text)' }}>聊天记录</h2>
        <button type="button" onClick={handleClear} disabled={msgs.length === 0} className="cta-outline" style={{ padding: '8px 14px', fontSize: 13 }}>
          清空记录
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">💬</div>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>暂无聊天记录</p>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>绑定微信后，AI 会自动开始对话</p>
          </div>
        ) : (
          msgs.map((msg, i) => (
            <div key={msg.id} className="animate-fade-up" style={{ display: 'flex', justifyContent: msg.direction === 'out' ? 'flex-end' : 'flex-start', animationDelay: `${Math.min(i * 20, 200)}ms` }}>
              <div className={msg.direction === 'out' ? 'bubble-out' : 'bubble-in'} style={{ maxWidth: '75%' }}>
                <p style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                <p style={{ fontSize: 11, marginTop: 6, color: msg.direction === 'out' ? 'rgba(255,255,255,0.6)' : 'var(--color-text-secondary)' }}>
                  {fmtTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}

        {hasMore && msgs.length > 0 && (
          <button onClick={() => fetchMsgs()} className="cta-link" style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'var(--color-bg)', justifyContent: 'center', marginTop: 8, fontSize: 15, fontWeight: 500 }}>
            加载更多
          </button>
        )}
      </div>
    </div>
  )
}
