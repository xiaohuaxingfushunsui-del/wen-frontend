import { useEffect, useState } from 'react'

function Settings({ api, onClose }) {
  const [settings, setSettings] = useState({
    system_prompt: '',
    temperature: 0.9,
    max_context_rounds: 20,
    compress_threshold: 8000,
    compress_keep_rounds: 6,
    max_reply_tokens: 1000,
  })

  useEffect(() => {
    fetch(`${api}/api/settings`)
      .then((response) => response.json())
      .then((data) => setSettings(data))
      .catch(console.error)
  }, [api])

  async function save() {
    await fetch(`${api}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">设置</div>

        <div className="form-group">
          <label className="form-label">系统提示词（问的人格）</label>
          <textarea
            className="form-textarea"
            value={settings.system_prompt}
            onChange={(event) => setSettings({ ...settings, system_prompt: event.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">温度（0-1，越高越随机）</label>
          <input
            className="form-input"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(event) => setSettings({ ...settings, temperature: parseFloat(event.target.value) })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">保留对话轮数</label>
          <input
            className="form-input"
            type="number"
            min="5"
            max="50"
            value={settings.max_context_rounds}
            onChange={(event) => setSettings({ ...settings, max_context_rounds: parseInt(event.target.value, 10) })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">最大回复 token 数</label>
          <input
            className="form-input"
            type="number"
            min="200"
            max="4000"
            value={settings.max_reply_tokens}
            onChange={(event) => setSettings({ ...settings, max_reply_tokens: parseInt(event.target.value, 10) })}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-save" onClick={save}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
