export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const time = new Date(message.created_at).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`message-row ${isUser ? 'user' : ''}`}>
      <div className={`avatar ${isUser ? 'user-av' : 'ai'}`}>
        {isUser ? '惠' : '问'}
      </div>
      <div className="bubble-wrap">
        {!isUser && <span className="sender-name">问</span>}
        {isUser && <span className="sender-name">惠惠</span>}
        <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
          {message.content}
        </div>
        <div className="msg-time">{time}</div>
      </div>
    </div>
  )
}
