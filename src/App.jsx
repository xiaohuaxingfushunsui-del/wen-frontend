import { useEffect, useState, useCallback } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [model, setModel] = useState(() => {
    try { return localStorage.getItem('model') || 'deepseek' }
    catch { return 'deepseek' }
  })

  // 加载会话列表
  useEffect(() => { fetchSessions() }, [])

  // 切换会话时加载消息
  useEffect(() => {
    if (currentSession) fetchMessages(currentSession.id)
  }, [currentSession])

  async function fetchSessions() {
    try {
      const res = await fetch(`${API}/api/sessions`)
      const data = await res.json()
      setSessions(data)
      if (data.length > 0 && !currentSession) setCurrentSession(data[0])
    } catch (e) { console.error(e) }
  }

  async function fetchMessages(sessionId) {
    try {
      const res = await fetch(`${API}/api/messages/${sessionId}`)
      const data = await res.json()
      setMessages(data)
    } catch (e) { console.error(e) }
  }

  async function createSession() {
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '新对话' }),
      })
      const data = await res.json()
      setSessions(prev => [data, ...prev])
      setCurrentSession(data)
      setMessages([])
      setSidebarOpen(false)
    } catch (e) { console.error(e) }
  }

  async function deleteSession(id) {
    try {
      await fetch(`${API}/api/sessions/${id}`, { method: 'DELETE' })
      const remaining = sessions.filter(s => s.id !== id)
      setSessions(remaining)
      if (currentSession?.id === id) {
        setCurrentSession(remaining[0] || null)
        setMessages([])
      }
    } catch (e) { console.error(e) }
  }

  async function sendMessage(text) {
    if (!text.trim() || loading || !currentSession) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSession.id, message: text, model }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
      }])

      // 第一条消息后自动命名
      if (messages.length === 0) {
        const name = text.slice(0, 20) + (text.length > 20 ? '…' : '')
        await fetch(`${API}/api/sessions/${currentSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        fetchSessions()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function switchModel(m) {
    setModel(m)
    try { localStorage.setItem('model', m) } catch {}
  }

  function selectSession(s) {
    setCurrentSession(s)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      {/* 手机遮罩 */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 手机菜单按钮 */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="菜单"
      >
        ☰
      </button>

      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelect={selectSession}
        onCreate={createSession}
        onDelete={deleteSession}
        onSettings={() => { setShowSettings(true); setSidebarOpen(false) }}
        sidebarOpen={sidebarOpen}
      />

      <main className="main-panel">
        {/* 顶栏 */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-dot" />
            <span className="topbar-title">
              {currentSession?.name || '问 · 惠惠'}
            </span>
          </div>
          <div className="model-switch">
            <button
              className={`model-option ${model === 'deepseek' ? 'active' : ''}`}
              onClick={() => switchModel('deepseek')}
            >
              DS
            </button>
            <button
              className={`model-option ${model === 'claude' ? 'active' : ''}`}
              onClick={() => switchModel('claude')}
            >
              Claude
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <ChatArea
            session={currentSession}
            messages={messages}
            loading={loading}
            onSend={sendMessage}
          />
          {showSettings && (
            <Settings
              api={API}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
