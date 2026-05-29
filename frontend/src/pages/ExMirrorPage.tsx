import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createExMirrorCharacter } from '../api'

type SourceMode = 'paste' | 'skip'

export default function ExMirrorPage() {
  const navigate = useNavigate()
  const [alias, setAlias] = useState('')
  const [basicInfo, setBasicInfo] = useState('')
  const [personality, setPersonality] = useState('')
  const [chatText, setChatText] = useState('')
  const [sourceMode, setSourceMode] = useState<SourceMode>('paste')
  const [ack, setAck] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = alias.trim() && ack && !loading

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024 * 2) {
      setError('聊天记录文件请控制在 2MB 内，建议先截取最有代表性的部分。')
      return
    }
    const text = await file.text()
    setChatText(text)
    setSourceMode('paste')
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const result = await createExMirrorCharacter({
        alias: alias.trim(),
        basicInfo: basicInfo.trim(),
        personality: personality.trim(),
        chatText: sourceMode === 'paste' ? chatText.trim() : '',
      })
      navigate(`/companion/${result.id}`)
    } catch (err: any) {
      setError(err.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 880, margin: '0 auto', padding: '36px 20px 56px' }}>
      <button className="cta-ghost" type="button" onClick={() => navigate('/characters')} style={{ marginBottom: 18 }}>
        返回角色
      </button>

      <div style={{ marginBottom: 22 }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          关系镜像 / Ex Mirror
        </p>
        <h1 style={{ color: 'var(--color-text)', fontSize: 28, fontWeight: 760, letterSpacing: 0, margin: 0 }}>
          用聊天记录创建一个“记忆中的人”
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 720, marginTop: 10 }}>
          这个功能会把你提供的聊天记录、主观描述和关系背景整理成 Relationship Memory + Persona。它只用于本地回忆与情感整理，不会联系真实的人，也不会替代真实沟通。
        </p>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 246, 248, 0.95), rgba(245, 250, 255, 0.92))',
          border: '1px solid rgba(230, 214, 220, 0.9)',
          borderRadius: 18,
          padding: 18,
          marginBottom: 22,
          boxShadow: '0 18px 45px rgba(64, 44, 52, 0.08)',
        }}
      >
        <h2 style={{ fontSize: 15, color: '#382b32', margin: '0 0 10px', fontWeight: 700 }}>开启前请确认</h2>
        <div style={{ display: 'grid', gap: 8, color: '#6e5962', fontSize: 13, lineHeight: 1.55 }}>
          <span>1. 数据只用于创建这个角色画像，默认不主动联系任何真实账号。</span>
          <span>2. 生成角色会保留对方的棱角，不会无证据地突然表白、道歉或复合。</span>
          <span>3. 如果你觉得“不像 ta”，之后可以继续纠正，让 Persona 逐步贴近。</span>
          <span>4. 请只上传你有权使用的聊天记录或你自己的回忆内容。</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
        <section className="apple-card" style={{ padding: 20 }}>
          <label className="apple-label" htmlFor="ex-alias">代号 / 花名</label>
          <input
            id="ex-alias"
            className="apple-input"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            placeholder="例如：初恋、那个人、小雪"
            required
          />

          <label className="apple-label" htmlFor="ex-basic" style={{ marginTop: 18 }}>基础信息</label>
          <textarea
            id="ex-basic"
            className="apple-textarea"
            value={basicInfo}
            onChange={(event) => setBasicInfo(event.target.value)}
            placeholder="例如：在一起两年，分手半年，大学同学，现在在上海。"
            rows={3}
          />

          <label className="apple-label" htmlFor="ex-personality" style={{ marginTop: 18 }}>性格画像</label>
          <textarea
            id="ex-personality"
            className="apple-textarea"
            value={personality}
            onChange={(event) => setPersonality(event.target.value)}
            placeholder="例如：ENFP，话很多，嘴硬心软，吵架时会冷处理，但深夜容易 emo。"
            rows={4}
          />
        </section>

        <section className="apple-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, color: 'var(--color-text)', margin: 0 }}>原材料</h2>
              <p className="apple-hint" style={{ margin: '6px 0 0' }}>推荐粘贴最有代表性的聊天记录：日常、争吵、深夜、和好、分别。</p>
            </div>
            <div className="filter-chips" style={{ margin: 0 }}>
              <button type="button" className={`filter-chip ${sourceMode === 'paste' ? 'active' : ''}`} onClick={() => setSourceMode('paste')}>提供记录</button>
              <button type="button" className={`filter-chip ${sourceMode === 'skip' ? 'active' : ''}`} onClick={() => setSourceMode('skip')}>先跳过</button>
            </div>
          </div>

          {sourceMode === 'paste' && (
            <>
              <input type="file" accept=".txt,.md,.csv,.json" onChange={handleFile} style={{ marginBottom: 10 }} />
              <textarea
                className="apple-textarea"
                value={chatText}
                onChange={(event) => setChatText(event.target.value)}
                placeholder="可以直接粘贴聊天记录、备忘录、你记得的对话片段。"
                rows={10}
              />
            </>
          )}
        </section>

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
          <input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} style={{ marginTop: 3 }} />
          <span>我知道这是“记忆中的模拟角色”，只用于个人整理和对话测试，不用于骚扰、冒充或侵犯他人隐私。</span>
        </label>

        {error && <p style={{ color: 'var(--color-danger)', fontSize: 14, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="cta-outline" onClick={() => navigate('/characters')} style={{ flex: 1, height: 48 }}>
            取消
          </button>
          <button type="submit" className="cta-primary" disabled={!canSubmit} style={{ flex: 1, height: 48 }}>
            {loading ? '正在生成...' : '开启并生成角色'}
          </button>
        </div>
      </form>
    </div>
  )
}
