export default function Sidebar({ sessions, currentSession, onSelect, onCreate, onDelete, onSettings }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">问 · 惠惠</div>
        <div className="sidebar-subtitle">我们的家</div>
      </div>

      <button type="button" className="new-chat-btn" onClick={onCreate}>
        + 新对话
      </button>

      <div className="session-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
            onClick={() => onSelect(session)}
          >
            <span className="session-name">{session.name || '新对话'}</span>
            <button
              type="button"
              className="session-delete"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(session.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button type="button" className="settings-btn" onClick={onSettings}>
          ⚙ 设置
        </button>
      </div>
    </div>
  )
}
