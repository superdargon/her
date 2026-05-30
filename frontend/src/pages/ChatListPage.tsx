import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearMessages, clearLocalMessages, deleteBot, getBots, getCharacters, getLocalMessages } from '../api'
import {
  CharacterAvatarArt,
  ChevronRightIcon,
  EmptyChatIllustration,
  LinkIcon,
  PawIcon,
  SleepingCatDecoration,
  StatusOfflineIcon,
  StatusOnlineIcon,
} from '@/components/Icons'

interface Character {
  id: string
  name: string
  avatar?: string
  created_at?: number
}

interface Bot {
  id: string
  character_id: string
  status: string
  active: boolean
  created_at: number
}

interface LocalChatSummary {
  character: Character
  latestContent: string
  latestAt: number
  count: number
}

type FilterKey = 'all' | 'online' | 'offline'

function fmtTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (isToday) return time
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${time}`
}

export default function ChatListPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [localChats, setLocalChats] = useState<LocalChatSummary[]>([])
  const [charMap, setCharMap] = useState<Record<string, Character>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const navigate = useNavigate()

  const loadChats = async () => {
    const [botRows, characters] = await Promise.all([getBots(), getCharacters()])
    setBots(botRows)

    const map: Record<string, Character> = {}
    for (const character of characters) map[character.id] = character
    setCharMap(map)

    const summaries = await Promise.all(
      characters.map(async (character: Character) => {
        const rows = await getLocalMessages(character.id).catch(() => [])
        const latest = rows[rows.length - 1]
        return {
          character,
          latestContent: latest?.content || '',
          latestAt: Number(latest?.created_at || character.created_at || 0),
          count: rows.length,
        }
      }),
    )
    setLocalChats(summaries.filter((item) => item.count > 0).sort((a, b) => b.latestAt - a.latestAt))
  }

  useEffect(() => {
    loadChats()
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const activeBots = bots.filter((bot) => bot.active)
  const inactiveBots = bots.filter((bot) => !bot.active)
  const totalChats = localChats.length + bots.length
  const visibleLocalChats = filter === 'offline' ? [] : localChats
  const visibleBots = bots.filter((bot) => {
    if (filter === 'all') return true
    if (filter === 'online') return bot.active
    return !bot.active
  })

  const handleClearLocal = async (event: MouseEvent, characterId: string) => {
    event.stopPropagation()
    if (!confirm('确定清空这段软件内聊天记录吗？')) return
    await clearLocalMessages(characterId)
    setLocalChats((prev) => prev.filter((item) => item.character.id !== characterId))
  }

  const handleClear = async (event: MouseEvent, botId: string) => {
    event.stopPropagation()
    if (!confirm('确定清空这个微信聊天记录吗？会话入口会保留。')) return
    await clearMessages(botId)
  }

  const handleDelete = async (event: MouseEvent, botId: string) => {
    event.stopPropagation()
    if (!confirm('确定删除这个微信会话吗？删除后会停止监听，并移除这条记录。')) return
    await deleteBot(botId)
    setBots((prev) => prev.filter((bot) => bot.id !== botId))
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }} className="animate-fade-up">
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="apple-skeleton" style={{ width: 72, height: 32, borderRadius: 20 }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="apple-skeleton" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>聊天记录</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {totalChats === 0 ? '暂无对话' : `共 ${totalChats} 个对话，${localChats.length} 个软件内聊天，${activeBots.length} 个微信在线`}
            </p>
          </div>
        </div>

        <div className="filter-chips" style={{ marginBottom: 20 }}>
          {([
            { key: 'all', label: '全部', count: totalChats },
            { key: 'online', label: '软件内/在线', count: localChats.length + activeBots.length },
            { key: 'offline', label: '离线', count: inactiveBots.length },
          ] as { key: FilterKey; label: string; count: number }[]).map((item) => (
            <button
              key={item.key}
              className={`filter-chip ${filter === item.key ? 'active' : ''}`}
              onClick={() => setFilter(item.key)}
            >
              {item.key === 'all' && <PawIcon size={13} />}
              {item.key === 'online' && <StatusOnlineIcon size={13} />}
              {item.key === 'offline' && <StatusOfflineIcon size={13} />}
              {item.label}
              <span className="chip-count">{item.count}</span>
            </button>
          ))}
        </div>

        {visibleLocalChats.length === 0 && visibleBots.length === 0 ? (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              padding: '48px 24px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <EmptyChatIllustration size={120} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
              {filter === 'all' ? '暂无聊天记录' : '没有匹配的对话'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {filter === 'all' ? '和角色聊过天后，这里会显示软件内聊天；绑定微信后也会显示微信记录。' : '试试切换筛选条件'}
            </p>
            {filter === 'all' && (
              <button className="cta-primary" style={{ fontSize: 13, padding: '8px 16px', gap: 4 }} onClick={() => navigate('/characters')}>
                <LinkIcon size={14} /> 去创建角色
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}
          >
            {visibleLocalChats.map((item, index) => (
              <div key={`local-${item.character.id}`} className="chat-item" onClick={() => navigate(`/companion/${item.character.id}`)}>
                <div className="chat-avatar">
                  {item.character.avatar ? (
                    <img
                      src={item.character.avatar}
                      width={48}
                      height={48}
                      alt={item.character.name}
                      style={{ width: 48, height: 48, objectFit: 'cover' }}
                    />
                  ) : (
                    <CharacterAvatarArt index={index} size={48} alt={item.character.name || ''} />
                  )}
                  <span className="online-ring" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.character.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0, marginLeft: 8 }}>
                      {item.latestAt ? fmtTime(item.latestAt) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.latestContent || '软件内聊天'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="cta-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={(event) => handleClearLocal(event, item.character.id)}>
                        清空
                      </button>
                      <ChevronRightIcon size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {visibleBots.map((bot, index) => {
              const character = charMap[bot.character_id]
              return (
                <div key={bot.id} className="chat-item" onClick={() => navigate(`/messages/${bot.id}`)}>
                  <div className="chat-avatar">
                    {character?.avatar ? (
                      <img
                        src={character.avatar}
                        width={48}
                        height={48}
                        alt={character.name}
                        style={{ width: 48, height: 48, objectFit: 'cover' }}
                      />
                    ) : (
                      <CharacterAvatarArt index={index + visibleLocalChats.length} size={48} alt={character?.name || ''} />
                    )}
                    {bot.active && <span className="online-ring" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {character?.name || '未知角色'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flexShrink: 0, marginLeft: 8 }}>
                        {bot.created_at ? fmtTime(bot.created_at) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 13, color: bot.active ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {bot.active ? '微信监听中' : '已离线'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="cta-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={(event) => handleClear(event, bot.id)}>
                          清空
                        </button>
                        <button className="cta-ghost" style={{ fontSize: 12, padding: '6px 10px', color: 'var(--color-danger)' }} onClick={(event) => handleDelete(event, bot.id)}>
                          删除
                        </button>
                        <ChevronRightIcon size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, opacity: 0.6 }}>
          <SleepingCatDecoration size={48} />
        </div>
      </div>
    </div>
  )
}
