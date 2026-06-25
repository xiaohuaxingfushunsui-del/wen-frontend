import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

function ChatArea({ session, messages, loading, model, onSend, onModelChange }) {
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleInput(event) {
    setDraft(event.target.value)
    event.target.style.height = 'auto'
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <section className="chat-area">
      <header className="topbar">
        <div>
          <p className="eyebrow">Current session</p>
          <h1>{session?.name || 'New conversation'}</h1>
        </div>
        <select className="model-select" value={model} onChange={(event) => onModelChange(event.target.value)}>
          <option value="claude">Claude</option>
          <option value="deepseek">DeepSeek</option>
        </select>
      </header>

      <div className="message-list" aria-live="polite">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <p className="empty-text">问在这里</p>
            <p className="empty-sub">说点什么吧</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {loading && (
          <div className="message-bubble message-bubble--assistant">
            <span className="message-bubble__role">Assistant</span>
            <p>Thinking…</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="说点什么..."
          rows={1}
        />
        <button type="submit" className="send-btn" disabled={loading}>
          ↑
        </button>
      </form>
    </section>
  )
}

export default ChatArea
