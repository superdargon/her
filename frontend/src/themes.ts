export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    primaryHover: string
    primarySubtle: string
    bg: string
    surface: string
    surfaceHover: string
    text: string
    textSecondary: string
    border: string
    success: string
    successSubtle: string
    warning: string
    warningSubtle: string
    danger: string
    dangerHover: string
    dangerSubtle: string
    link: string
    shadow: string
    navBg: string
    navBorder: string
    skeleton: string
    bubbleOut: string
    bubbleIn: string
  }
  radii: {
    card: string
    btn: string
    input: string
    avatar: string
  }
  fonts: {
    family: string
  }
}

export const themes: Theme[] = [
  {
    id: 'cute',
    name: '樱花粉',
    colors: {
      primary: '#ffb8c7',
      primaryHover: '#ff70a6',
      primarySubtle: '#ffb8c71a',
      bg: '#fff7fb',
      surface: '#ffffff',
      surfaceHover: '#fff1f7',
      text: '#3c2f42',
      textSecondary: '#8b7b91',
      border: '#ffd6e7',
      success: '#34d399',
      successSubtle: '#34d3991a',
      warning: '#fbbf24',
      warningSubtle: '#fbbf241a',
      danger: '#fb7185',
      dangerHover: '#f87185',
      dangerSubtle: '#fb71851a',
      link: '#ff70a6',
      shadow: '0 10px 30px rgba(255,107,154,0.08)',
      navBg: 'rgba(255,255,255,0.82)',
      navBorder: 'rgba(255,214,231,0.5)',
      skeleton: '#ffd6e7',
      bubbleOut: '#ffb8c7',
      bubbleIn: '#fff7fb',
    },
    radii: {
      card: '18px',
      btn: '18px',
      input: '16px',
      avatar: '14px',
    },
    fonts: {
      family: '"Noto Sans SC", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
]

export const defaultThemeId = 'cute'
