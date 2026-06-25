import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Settings from './components/Settings'

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function App() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [model, setModel] = useState(() => {
    if (typeof window === 'undefined') return 'claude'
    return window.localStorage.getItem('model') || 'claude'
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id)
    }
  }, [currentSession])

  async function fetchSessions() {
    try {
      const res = await fetch(`${API}/api/sessions`)
      const data = await res.json()
      setSessions(data)
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchMessages(sessionId) {
    try {
      const res = await fetch(`${API}/api/messages/${sessionId}`)
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function createSession() {
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '新对话' }),
      })
      const data = await res.json()
      setSessions((prev) => [data, ...prev])
      setCurrentSession(data)
      setMessages([])
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteSession(id) {
    try {
      await fetch(`${API}/api/sessions/${id}`, { method: 'DELETE' })
      const newSessions = sessions.filter((session) => session.id !== id)
      setSessions(newSessions)
      if (currentSession?.id === id) {
        setCurrentSession(newSessions[0] || null)
        setMessages([])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || loading || !currentSession) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSession.id,
          message: text,
          model,
        }),
      })
      const data = await res.json()
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])

      if (messages.length === 0) {
        const name = text.slice(0, 20) + (text.length > 20 ? '...' : '')
        await fetch(`${API}/api/sessions/${currentSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        fetchSessions()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function switchModel(nextModel) {
    setModel(nextModel)
    window.localStorage.setItem('model', nextModel)
  }

  return (
    <div className="app-shell">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelect={setCurrentSession}
        onCreate={createSession}
        onDelete={deleteSession}
        onSettings={() => setShowSettings(true)}
      />

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1>{currentSession?.name || 'Conversation'}</h1>
          </div>
          <button type="button" className="secondary-btn" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </header>

        <div className="content-grid">
          <ChatArea
            session={currentSession}
            messages={messages}
            loading={loading}
            model={model}
            onSend={sendMessage}
            onModelChange={switchModel}
          />
          {showSettings && <Settings api={API} onClose={() => setShowSettings(false)} />}
        </div>
      </main>
    </div>
  )
}
