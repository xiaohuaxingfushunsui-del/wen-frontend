export default function Sidebar({ sessions, currentSession, onSelect, onCreate, onDelete, onSettings, sidebarOpen }) {
  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">问 · 惠惠</div>
        <div className="sidebar-subtitle">我们的家</div>
      </div>

      <button className="new-chat-btn" onClick={onCreate}>
        + 新对话
      </button>

      <div className="session-list">
        {sessions.map(s => (
          <div
            key={s.id}
            className={`session-item ${currentSession?.id === s.id ? 'active' : ''}`}
            onClick={() => onSelect(s)}
          >
            <span className="session-name">{s.name || '新对话'}</span>
            <button
              className="session-delete"
              onClick={e => { e.stopPropagation(); onDelete(s.id) }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onSettings}>
          ⚙ 设置
        </button>
      </div>
    </div>
  )
}
