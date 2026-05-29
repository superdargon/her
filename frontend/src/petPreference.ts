const petPreferenceKey = 'her-enabled'

export function getPetEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const saved = localStorage.getItem(petPreferenceKey)
    if (saved === null) {
      localStorage.setItem(petPreferenceKey, 'false')
      return false
    }
    return saved === 'true'
  } catch {
    return false
  }
}

export function setPetEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(petPreferenceKey, String(enabled))
  } catch {}
}
