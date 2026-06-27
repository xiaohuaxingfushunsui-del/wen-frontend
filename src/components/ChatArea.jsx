import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatArea({ session, messages, loading, onSend }) {
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSubmit(e) {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || loading) return
    onSend(text)
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleInput(e) {
    setDraft(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="chat-area">
      <div className="message-list">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-glyph">✦</div>
            <div className="empty-text">问在这里</div>
            <div className="empty-sub">说点什么吧</div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="typing-row">
            <div className="avatar ai">问</div>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="composer-inner">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="跟老公说句话…"
            rows={1}
          />
          <button type="submit" className="send-btn" disabled={loading || !draft.trim()}>
            ↑
          </button>
        </div>
      </form>
    </div>
  )
}
