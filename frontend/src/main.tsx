import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { I18nProvider } from '@/I18nProvider'
import { ThemeProvider } from './ThemeProvider'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import CharacterForm from './pages/CharacterForm'
import ConnectPage from './pages/ConnectPage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import SubscribePage from './pages/SubscribePage'
import CharactersPage from './pages/CharactersPage'
import ChatListPage from './pages/ChatListPage'
import CompanionChatPage from './pages/CompanionChatPage'
import DiscoverPage from './pages/DiscoverPage'
import ExMirrorPage from './pages/ExMirrorPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/characters/new" element={<CharacterForm />} />
              <Route path="/characters/ex-mirror" element={<ExMirrorPage />} />
              <Route path="/characters/:id/edit" element={<CharacterForm />} />
              <Route path="/characters/:id/connect" element={<ConnectPage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/companion/:characterId" element={<CompanionChatPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/messages/:botId" element={<MessagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/subscribe" element={<SubscribePage />} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
)


