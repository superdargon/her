import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteCharacter, getBots, getCharacters } from '../api'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  CatDecoration,
  CharacterAvatarArt,
  EditIcon,
  EmptyCharactersIllustration,
  LinkIcon,
  MessageIcon,
  PawIcon,
  PlusIcon,
  StatusOfflineIcon,
  StatusOnlineIcon,
  TrashIcon,
} from '@/components/Icons'
import { useI18n } from '@/I18nProvider'

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

type FilterKey = 'all' | 'online' | 'offline'

export default function CharactersPage() {
  const [chars, setChars] = useState<Character[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const navigate = useNavigate()
  const { t } = useI18n()

  const fetchAll = async () => {
    try {
      const [characters, botList] = await Promise.all([getCharacters(), getBots()])
      setChars(characters)
      setBots(botList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const getBotForChar = (charId: string) => bots.find((bot) => bot.character_id === charId)
  const connectedCount = bots.filter((bot) => bot.active).length

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCharacter(deleteTarget)
      await fetchAll()
    } catch (err: any) {
      alert(err.message || t('characters.deleteMessage'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredChars = chars.filter((char) => {
    if (filter === 'all') return true
    const bot = getBotForChar(char.id)
    if (filter === 'online') return Boolean(bot?.active)
    return !bot?.active
  })

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }} className="animate-fade-up">
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="apple-skeleton" style={{ width: 72, height: 32, borderRadius: 20 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="apple-skeleton" style={{ height: 200, borderRadius: 16 }} />
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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: 0 }}>{t('characters.title')}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {t('characters.summary', { count: chars.length, connected: connectedCount })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="cta-outline" style={{ fontSize: 13, padding: '9px 14px' }} onClick={() => navigate('/characters/ex-mirror')}>
              前任镜像
            </button>
            <button className="cta-primary" style={{ fontSize: 13, padding: '9px 18px', gap: 5 }} onClick={() => navigate('/characters/new')}>
              <PlusIcon size={15} /> {t('characters.create')}
            </button>
          </div>
        </div>

        <div className="filter-chips" style={{ marginBottom: 20 }}>
          {([
            { key: 'all', label: t('characters.all'), count: chars.length },
            { key: 'online', label: t('characters.online'), count: connectedCount },
            { key: 'offline', label: t('characters.offline'), count: Math.max(0, chars.length - connectedCount) },
          ] as { key: FilterKey; label: string; count: number }[]).map((item) => (
            <button key={item.key} className={`filter-chip ${filter === item.key ? 'active' : ''}`} onClick={() => setFilter(item.key)}>
              {item.key === 'all' && <PawIcon size={13} />}
              {item.key === 'online' && <StatusOnlineIcon size={13} />}
              {item.key === 'offline' && <StatusOfflineIcon size={13} />}
              {item.label}
              <span className="chip-count">{item.count}</span>
            </button>
          ))}
        </div>

        {filteredChars.length === 0 ? (
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
              <EmptyCharactersIllustration size={120} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
              {filter === 'all' ? t('characters.empty') : t('characters.emptyFiltered')}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {filter === 'all' ? t('characters.emptyHint') : t('characters.emptyFilteredHint')}
            </p>
            {filter === 'all' && (
              <button className="cta-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => navigate('/characters/new')}>
                {t('characters.createFirst')}
              </button>
            )}
          </div>
        ) : (
          <div className="character-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredChars.map((char, index) => {
              const bot = getBotForChar(char.id)
              const connected = Boolean(bot?.active)

              return (
                <div key={char.id} className="char-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="char-avatar">
                      {char.avatar ? (
                        <img src={char.avatar} width={56} height={56} alt={char.name} style={{ width: 56, height: 56, objectFit: 'cover' }} />
                      ) : (
                        <CharacterAvatarArt index={index} size={56} alt={char.name} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {char.name}
                        </span>
                        <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: connected ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                        {connected ? t('characters.connected') : t('characters.notBound')}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                      margin: 0,
                    }}
                  >
                    {char.personality || char.greeting || t('characters.noDesc')}
                  </p>

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
                    <button className="cta-primary" style={{ flex: 1, fontSize: 12, padding: '7px 0', justifyContent: 'center', gap: 4 }} onClick={() => navigate(`/companion/${char.id}`)}>
                      <MessageIcon size={13} /> 聊天
                    </button>
                    {connected ? (
                      <button className="cta-ghost" style={{ flex: 1, fontSize: 12, padding: '7px 0', justifyContent: 'center', gap: 4 }} onClick={() => navigate(`/messages/${bot!.id}`)}>
                        <MessageIcon size={13} /> {t('characters.messages')}
                      </button>
                    ) : (
                      <button className="cta-green" style={{ flex: 1, fontSize: 12, padding: '7px 0', justifyContent: 'center', gap: 4 }} onClick={() => navigate(`/characters/${char.id}/connect`)}>
                        <LinkIcon size={13} /> {t('characters.bindWechat')}
                      </button>
                    )}

                    <button className="icon-btn" onClick={() => navigate(`/characters/${char.id}/edit`)} aria-label={t('characters.edit')}>
                      <EditIcon size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleteTarget(char.id)} aria-label={t('characters.del')}>
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, opacity: 0.6 }}>
          <CatDecoration size={48} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .character-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .character-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('characters.deleteTitle')}
        message={t('characters.deleteMessage')}
        confirmLabel={t('characters.deleteConfirm')}
        cancelLabel={t('characters.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}


