import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'zh' | 'en'

type DictTree = { [key: string]: string | DictTree }

const localeStorageKey = 'her-locale'

const zh = {
  layout: {
    brandSub: '\u0041\u0049 \u684c\u9762\u4f34\u4fa3',
    home: '\u9996\u9875',
    characters: '\u89d2\u8272\u7ba1\u7406',
    chats: '\u804a\u5929\u8bb0\u5f55',
    aiSettings: '\u0041\u0049 \u8bbe\u7f6e',
    plans: '\u6210\u957f\u4e2d\u5fc3',
    settingsCenter: '\u8bbe\u7f6e\u4e2d\u5fc3',
    homeAria: '妳首页',
  },
  settings: {
    back: '\u8fd4\u56de',
    title: '\u8bbe\u7f6e',
    aiConfig: '\u0041\u0049 \u6a21\u578b\u914d\u7f6e',
    aiConfigHint: '\u4f60\u7684 API \u51ed\u8bc1\u4ec5\u4fdd\u5b58\u5728\u5f53\u524d\u8bbe\u5907\u672c\u5730\u3002',
    provider: '\u670d\u52a1\u5546',
    apiKeyHintReady: '\u65b0\u7684 Key \u5df2\u51c6\u5907\u597d\u4fdd\u5b58\u3002',
    apiKeyHintSaved: '\u5f53\u524d Key \u4ecd\u53ea\u4fdd\u5b58\u5728\u672c\u5730\u3002',
    model: '\u6a21\u578b',
    modelPlaceholder: '\u4f8b\u5982\uff1adeepseek-chat',
    baseUrl: '\u63a5\u53e3\u5730\u5740',
    baseUrlHint: '\u517c\u5bb9 OpenAI \u7684\u63a5\u53e3\u5730\u5740\u901a\u5e38\u9700\u8981\u5305\u542b /v1\u3002',
    save: '\u4fdd\u5b58\u8bbe\u7f6e',
    saved: '\u5df2\u4fdd\u5b58',
    petPanel: '\u5ba0\u7269\u9762\u677f',
    petPanelHint: '\u63a7\u5236\u9996\u9875\u548c\u4fa7\u8fb9\u680f\u662f\u5426\u663e\u793a\u5ba0\u7269\u9762\u677f\u3002',
    theme: '\u4e3b\u9898',
    language: '\u8bed\u8a00',
    languageHint: '\u5207\u6362\u754c\u9762\u7684\u663e\u793a\u8bed\u8a00\u3002',
    notes: '\u8bf4\u660e',
    note1: 'API Key \u4ec5\u4fdd\u5b58\u5728\u8fd9\u53f0\u8bbe\u5907\u4e0a\u3002',
    note2: '\u4f60\u9700\u8981\u81ea\u884c\u51c6\u5907\u670d\u52a1\u5546\u8d26\u6237\u548c\u989d\u5ea6\u3002',
    note3: '\u652f\u6301 OpenAI \u517c\u5bb9\u683c\u5f0f\u63a5\u53e3\u3002',
    note4: '\u5982\u679c\u4f60\u4f7f\u7528\u4e2d\u8f6c\u6216\u4ee3\u7406\u670d\u52a1\uff0c\u53ef\u9009\u62e9\u81ea\u5b9a\u4e49\u3002',
    getApiKeys: '\u83b7\u53d6 API Key',
    languageZh: '\u4e2d\u6587',
    languageEn: 'English',
  },
  dashboard: {
    welcomeWithPhone: '\u6b22\u8fce\u56de\u6765\uff0c{phone} \u540c\u5b66',
    welcomeWithName: '\u6b22\u8fce\u56de\u6765\uff0c{name}',
    welcomeFallback: '\u6b22\u8fce\u56de\u6765',
    createRole: '\u521b\u5efa\u65b0\u89d2\u8272',
    todayMessages: '\u4eca\u65e5\u5bf9\u8bdd',
    messagesUnit: '\u6761',
    emotionMemory: '\u5f53\u524d\u60c5\u7eea',
    affection: '\u4eb2\u5bc6\u5ea6',
    connectedRoles: '\u5df2\u8fde\u63a5\u89d2\u8272',
    connectedUnit: '\u4e2a',
    connectedDesc: '\u5728\u7ebf\u966a\u4f34\u4e2d',
    modelStatus: '\u6a21\u578b\u72b6\u6001',
    configured: '\u5df2\u914d\u7f6e',
    apiHealthy: 'API \u8fde\u63a5\u6b63\u5e38',
    metricDesc: '\u5f53\u524d\u6700\u91cd\u8981\u7684\u966a\u4f34\u6d3b\u8dc3\u5ea6',
    myRoles: '\u6211\u7684\u89d2\u8272',
    viewAll: '\u67e5\u770b\u5168\u90e8',
    online: '\u5728\u7ebf',
    offline: '\u79bb\u7ebf',
    customRole: '\u4f60\u7684\u4e13\u5c5e AI \u89d2\u8272\u3002',
    created: '\u521b\u5efa\u4e8e',
    noRoles: '\u8fd8\u6ca1\u6709\u521b\u5efa\u89d2\u8272\u3002',
    createFirstRole: '\u521b\u5efa\u7b2c\u4e00\u4e2a\u89d2\u8272',
    recentActivity: '\u6700\u8fd1\u52a8\u6001',
    viewMore: '\u67e5\u770b\u66f4\u591a',
    source: '\u6765\u6e90',
    content: '\u5185\u5bb9',
    time: '\u65f6\u95f4',
    count: '\u6570\u91cf',
    system: '\u7cfb\u7edf',
    roles: '\u89d2\u8272',
    systemRow1: '\u63a5\u5165\u771f\u5b9e\u6d88\u606f\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u6700\u8fd1\u5bf9\u8bdd\u3002',
    systemRow2: '\u8fd9\u91cc\u53ea\u4f1a\u5c55\u793a\u4f60\u5b9e\u9645\u521b\u5efa\u7684\u89d2\u8272\u3002',
    companionStatus: '\u966a\u4f34\u72b6\u6001',
    trust: '\u4fe1\u4efb',
    lonely: '\u5b64\u72ec',
    plan: '\u6210\u957f\u4e2d\u5fc3',
    free: '\u514d\u8d39\u7248',
    upgrade: '\u5347\u7ea7',
    usageToday: '\u4eca\u65e5\u4f7f\u7528',
    dailyQuota: '\u6bcf\u65e5 30 \u6761\u5bf9\u8bdd',
    basicModel: '\u57fa\u7840\u89d2\u8272\u6a21\u578b',
    speed: '\u6807\u51c6\u54cd\u5e94\u901f\u5ea6',
    quickActions: '\u5feb\u6377\u64cd\u4f5c',
    quickCreate: '\u521b\u5efa\u65b0\u89d2\u8272',
    quickCreateDesc: '\u6dfb\u52a0\u65b0\u7684 AI \u89d2\u8272',
    quickBind: '\u7ed1\u5b9a\u5fae\u4fe1',
    quickBindDesc: '\u8fde\u63a5\u89d2\u8272\u5230\u5fae\u4fe1',
    quickModel: '\u6a21\u578b\u8bbe\u7f6e',
    quickModelDesc: '\u914d\u7f6e AI \u670d\u52a1',
    quickUsage: '\u6210\u957f\u4e2d\u5fc3',
    quickUsageDesc: '\u67e5\u770b\u966a\u4f34\u6210\u957f\u548c\u5173\u7cfb\u8f68\u8ff9',
    systemStatus: '\u7cfb\u7edf\u72b6\u6001',
    backend: '\u540e\u7aef\u670d\u52a1',
    database: '\u6570\u636e\u5e93',
    wechat: '\u5fae\u4fe1\u8fde\u63a5',
    aiService: 'AI \u670d\u52a1',
    running: '\u8fd0\u884c\u4e2d',
    healthy: '\u6b63\u5e38',
    today: '\u4eca\u5929',
    thinking: '\u601d\u8003',
    happy: '\u5f00\u5fc3',
    sad: '\u60f3\u4f60',
    sleep: '\u4f11\u606f',
    excited: '\u5174\u594b',
    listeningAria: '\u5207\u6362\u5230\u503e\u542c\u72b6\u6001',
    loveAria: '\u5207\u6362\u5230\u4eb2\u8fd1\u72b6\u6001',
    more: '\u66f4\u591a',
  },
  characters: {
    title: '\u89d2\u8272\u7ba1\u7406',
    summary: '\u5171 {count} \u4e2a\u89d2\u8272\uff0c{connected} \u4e2a\u5df2\u8fde\u63a5',
    create: '\u521b\u5efa\u89d2\u8272',
    all: '\u5168\u90e8',
    online: '\u5728\u7ebf',
    offline: '\u79bb\u7ebf',
    empty: '\u8fd8\u6ca1\u6709\u89d2\u8272\u3002',
    emptyFiltered: '\u6ca1\u6709\u7b26\u5408\u6761\u4ef6\u7684\u89d2\u8272\u3002',
    emptyHint: '\u521b\u5efa\u4f60\u7684\u7b2c\u4e00\u4e2a AI \u89d2\u8272\u5f00\u59cb\u4f7f\u7528\u3002',
    emptyFilteredHint: '\u8bd5\u8bd5\u5207\u6362\u7b5b\u9009\u6761\u4ef6\u3002',
    createFirst: '\u521b\u5efa\u7b2c\u4e00\u4e2a\u89d2\u8272',
    connected: '\u5df2\u8fde\u63a5',
    notBound: '\u672a\u7ed1\u5b9a',
    noDesc: '\u6682\u65e0\u63cf\u8ff0',
    messages: '\u804a\u5929\u8bb0\u5f55',
    bindWechat: '\u7ed1\u5b9a\u5fae\u4fe1',
    deleteTitle: '\u5220\u9664\u89d2\u8272',
    deleteMessage: '\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u89d2\u8272\u5417\uff1f\u5220\u9664\u540e\u4e0d\u53ef\u6062\u590d\u3002',
    deleteConfirm: '\u786e\u8ba4\u5220\u9664',
    cancel: '\u53d6\u6d88',
    edit: '\u7f16\u8f91',
    del: '\u5220\u9664',
  },
  characterForm: {
    createTitle: '\u521b\u5efa\u89d2\u8272',
    editTitle: '\u7f16\u8f91\u89d2\u8272',
    avatar: '\u89d2\u8272\u5934\u50cf',
    noImage: '\u672a\u4e0a\u4f20',
    avatarHint: '\u4e0a\u4f20\u540e\u4f1a\u663e\u793a\u5728\u9996\u9875\u548c\u89d2\u8272\u5217\u8868\u91cc\u3002',
    name: '\u89d2\u8272\u540d\u79f0',
    namePlaceholder: '\u7ed9\u8fd9\u4e2a\u89d2\u8272\u8d77\u4e2a\u540d\u5b57',
    personality: '\u6027\u683c\u8bbe\u5b9a',
    personalityHint: '\u63cf\u8ff0\u8fd9\u4e2a\u89d2\u8272\u8be5\u5982\u4f55\u8bf4\u8bdd\u548c\u966a\u4f34\u4f60\u3002',
    personalityPlaceholder: '\u6e29\u67d4\u3001\u4f1a\u503e\u542c\u3001\u6709\u4e00\u70b9\u70b9\u4fcf\u76ae\u611f\u3002',
    greeting: '\u5f00\u573a\u767d',
    greetingHint: '\u4f60\u4eec\u7b2c\u4e00\u6b21\u89c1\u9762\u65f6\uff0c\u5b83\u4f1a\u8bf4\u7684\u8bdd\u3002',
    greetingPlaceholder: '\u4f60\u597d\u5440\uff0c\u6211\u5df2\u7ecf\u51c6\u5907\u597d\u966a\u4f60\u804a\u5929\u5566\u3002',
    cancel: '\u53d6\u6d88',
    save: '\u4fdd\u5b58\u4fee\u6539',
    create: '\u521b\u5efa\u89d2\u8272',
    saving: '\u4fdd\u5b58\u4e2d...',
    errLoad: '\u52a0\u8f7d\u89d2\u8272\u5931\u8d25',
    errImageType: '\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6\u4f5c\u4e3a\u5934\u50cf\u3002',
    errImageRead: '\u5934\u50cf\u8bfb\u53d6\u5931\u8d25\uff0c\u8bf7\u6362\u4e00\u5f20\u56fe\u518d\u8bd5\u3002',
    errName: '\u8bf7\u8f93\u5165\u89d2\u8272\u540d\u79f0\u3002',
    errSave: '\u4fdd\u5b58\u89d2\u8272\u5931\u8d25\u3002',
  },
  dialog: {
    notice: '\u63d0\u793a',
    confirmDelete: '\u786e\u8ba4\u5220\u9664',
    cancel: '\u53d6\u6d88',
  },
} as const

const en = {
  layout: {
    brandSub: 'AI Companion',
    home: 'Home',
    characters: 'Characters',
    chats: 'Chats',
    aiSettings: 'AI Settings',
    plans: 'Growth Center',
    settingsCenter: 'Settings',
    homeAria: 'Her Home',
  },
  settings: {
    back: 'Back',
    title: 'Settings',
    aiConfig: 'AI Model Config',
    aiConfigHint: 'Your API credentials are stored locally on this device.',
    provider: 'Provider',
    apiKeyHintReady: 'A new key is ready to save.',
    apiKeyHintSaved: 'The current key remains stored locally.',
    model: 'Model',
    modelPlaceholder: 'For example: deepseek-chat',
    baseUrl: 'Base URL',
    baseUrlHint: 'OpenAI-compatible endpoints usually include /v1.',
    save: 'Save Settings',
    saved: 'Saved',
    petPanel: 'Pet Panel',
    petPanelHint: 'Show or hide the mascot panel in the dashboard and sidebar.',
    theme: 'Theme',
    language: 'Language',
    languageHint: 'Choose the interface language.',
    notes: 'Notes',
    note1: 'API keys stay on this device.',
    note2: 'You need your own provider account and quota.',
    note3: 'OpenAI-compatible APIs are supported.',
    note4: 'Use Custom if you rely on a proxy or relay endpoint.',
    getApiKeys: 'Get API Keys',
    languageZh: '\u4e2d\u6587',
    languageEn: 'English',
  },
  dashboard: {
    welcomeWithPhone: 'Welcome Back, {phone}',
    welcomeWithName: 'Welcome Back, {name}',
    welcomeFallback: 'Welcome Back',
    createRole: 'Create Role',
    todayMessages: 'Today Messages',
    messagesUnit: 'msgs',
    emotionMemory: 'Emotion',
    affection: 'Affection',
    connectedRoles: 'Connected Roles',
    connectedUnit: 'live',
    connectedDesc: 'Roles currently connected and active',
    modelStatus: 'Model Status',
    configured: 'Configured',
    apiHealthy: 'API connection looks healthy',
    metricDesc: 'Primary activity metric for today.',
    myRoles: 'My Roles',
    viewAll: 'View All',
    online: 'Online',
    offline: 'Offline',
    customRole: 'Your custom AI role.',
    created: 'Created',
    noRoles: 'No roles yet.',
    createFirstRole: 'Create Your First Role',
    recentActivity: 'Recent Activity',
    viewMore: 'View More',
    source: 'Source',
    content: 'Content',
    time: 'Time',
    count: 'Count',
    system: 'System',
    roles: 'Roles',
    systemRow1: 'Recent real conversations will appear here once your roles start chatting.',
    systemRow2: 'Only the roles you actually create will show on this page.',
    companionStatus: 'Companion Status',
    trust: 'Trust',
    lonely: 'Lonely',
    plan: 'Growth Center',
    free: 'Free',
    upgrade: 'Upgrade',
    usageToday: 'Today',
    dailyQuota: '30 messages per day',
    basicModel: 'Basic role model',
    speed: 'Standard response speed',
    quickActions: 'Quick Actions',
    quickCreate: 'Create Role',
    quickCreateDesc: 'Add a new AI role',
    quickBind: 'Bind WeChat',
    quickBindDesc: 'Connect a role to WeChat',
    quickModel: 'Model Settings',
    quickModelDesc: 'Configure AI service',
    quickUsage: 'Growth Center',
    quickUsageDesc: 'View companion growth and relationship trail',
    systemStatus: 'System Status',
    backend: 'Backend',
    database: 'Database',
    wechat: 'WeChat Link',
    aiService: 'AI Service',
    running: 'Running',
    healthy: 'Healthy',
    today: 'Today',
    thinking: 'Thinking',
    happy: 'Happy',
    sad: 'Sad',
    sleep: 'Sleep',
    excited: 'Excited',
    listeningAria: 'Switch to listening mode',
    loveAria: 'Switch to love mode',
    more: 'More',
  },
  characters: {
    title: 'Characters',
    summary: '{count} total, {connected} connected',
    create: 'Create Character',
    all: 'All',
    online: 'Online',
    offline: 'Offline',
    empty: 'No characters yet.',
    emptyFiltered: 'No matching characters.',
    emptyHint: 'Create your first AI role to get started.',
    emptyFilteredHint: 'Try a different filter.',
    createFirst: 'Create First Character',
    connected: 'Connected',
    notBound: 'Not Bound',
    noDesc: 'No description yet.',
    messages: 'Messages',
    bindWechat: 'Bind WeChat',
    deleteTitle: 'Delete Character',
    deleteMessage: 'Are you sure you want to delete this character? This action cannot be undone.',
    deleteConfirm: 'Delete',
    cancel: 'Cancel',
    edit: 'Edit',
    del: 'Delete',
  },
  characterForm: {
    createTitle: 'Create Character',
    editTitle: 'Edit Character',
    avatar: 'Avatar',
    noImage: 'No image',
    avatarHint: 'The uploaded avatar will appear in the dashboard and character list.',
    name: 'Name',
    namePlaceholder: 'Give this character a name',
    personality: 'Personality',
    personalityHint: 'Describe how this character should speak and behave.',
    personalityPlaceholder: 'Warm, gentle, playful, and good at listening.',
    greeting: 'Greeting',
    greetingHint: 'The first line this character says when you meet.',
    greetingPlaceholder: 'Hi, I am here to keep you company.',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create Character',
    saving: 'Saving...',
    errLoad: 'Failed to load character',
    errImageType: 'Please choose an image file for the avatar.',
    errImageRead: 'Failed to read avatar image.',
    errName: 'Please enter a character name.',
    errSave: 'Failed to save character.',
  },
  dialog: {
    notice: 'Notice',
    confirmDelete: 'Confirm Delete',
    cancel: 'Cancel',
  },
} as const

const dictionary = { zh, en } as const

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(localeStorageKey)
    return saved === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

function resolve(locale: Locale, key: string): string {
  const parts = key.split('.')
  let current: string | DictTree = dictionary[locale] as unknown as DictTree

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return key
    }
    current = (current as DictTree)[part] as string | DictTree
  }

  return typeof current === 'string' ? current : key
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? `{${token}}`))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getSavedLocale)

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    try {
      localStorage.setItem(localeStorageKey, nextLocale)
    } catch {}
  }

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, vars) => interpolate(resolve(locale, key), vars),
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
