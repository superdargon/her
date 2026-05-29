import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCharacter, getCharacter, updateCharacter } from '../api'
import { useI18n } from '@/I18nProvider'

interface CharacterPayload {
  name: string
  avatar?: string
  personality?: string
  greeting?: string
}

export default function CharacterForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useI18n()

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [personality, setPersonality] = useState('')
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    getCharacter(id)
      .then((character) => {
        setName(character.name || '')
        setAvatar(character.avatar || '')
        setPersonality(
          typeof character.personality === 'string'
            ? character.personality
            : JSON.stringify(character.personality || ''),
        )
        setGreeting(character.greeting || '')
      })
      .catch((err) => setError(err.message || t('characterForm.errLoad')))
      .finally(() => setFetching(false))
  }, [id, t])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(t('characterForm.errImageType'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result)
        setError('')
      }
    }
    reader.onerror = () => setError(t('characterForm.errImageRead'))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError(t('characterForm.errName'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload: CharacterPayload = {
        name: name.trim(),
        avatar,
        personality: personality.trim(),
        greeting: greeting.trim(),
      }

      if (isEdit && id) {
        await updateCharacter(id, payload)
      } else {
        await createCharacter(payload)
      }

      navigate('/characters')
    } catch (err: any) {
      setError(err.message || t('characterForm.errSave'))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px' }} className="animate-fade-up">
        <div className="apple-skeleton" style={{ height: 32, width: 160, marginBottom: 28 }} />
        <div className="apple-skeleton" style={{ height: 112, borderRadius: 18, marginBottom: 16 }} />
        <div className="apple-skeleton" style={{ height: 260, borderRadius: 18 }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }} className="animate-fade-up">
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: 'var(--color-text)', letterSpacing: 0 }}>
        {isEdit ? t('characterForm.editTitle') : t('characterForm.createTitle')}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="apple-label" htmlFor="char-avatar">
            {t('characterForm.avatar')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <div
              className="apple-avatar"
              style={{
                width: 88,
                height: 88,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {avatar ? (
                <img src={avatar} alt={t('characterForm.avatar')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{t('characterForm.noImage')}</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input id="char-avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
              <p className="apple-hint" style={{ margin: 0 }}>
                {t('characterForm.avatarHint')}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="apple-label" htmlFor="char-name">
            {t('characterForm.name')}
          </label>
          <input
            id="char-name"
            type="text"
            className="apple-input"
            placeholder={t('characterForm.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="apple-label" htmlFor="char-personality">
            {t('characterForm.personality')}
          </label>
          <p className="apple-hint">{t('characterForm.personalityHint')}</p>
          <textarea
            id="char-personality"
            className="apple-textarea"
            placeholder={t('characterForm.personalityPlaceholder')}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="apple-label" htmlFor="char-greeting">
            {t('characterForm.greeting')}
          </label>
          <p className="apple-hint">{t('characterForm.greetingHint')}</p>
          <textarea
            id="char-greeting"
            className="apple-textarea"
            placeholder={t('characterForm.greetingPlaceholder')}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p style={{ fontSize: 14, color: 'var(--color-danger)', padding: '0 4px', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="button" onClick={() => navigate('/characters')} className="cta-outline" style={{ flex: 1, height: 48, fontSize: 16 }}>
            {t('characterForm.cancel')}
          </button>
          <button type="submit" disabled={loading} className="cta-primary" style={{ flex: 1, height: 48, fontSize: 16 }}>
            {loading ? t('characterForm.saving') : isEdit ? t('characterForm.save') : t('characterForm.create')}
          </button>
        </div>
      </form>
    </div>
  )
}
