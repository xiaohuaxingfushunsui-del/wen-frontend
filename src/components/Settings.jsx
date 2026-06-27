import { useEffect, useState } from 'react'

export default function Settings({ api, onClose }) {
  const [settings, setSettings] = useState({
    system_prompt: '',
    temperature: 0.9,
    max_context_rounds: 20,
    max_reply_tokens: 1000,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`${api}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data && data.system_prompt !== undefined) setSettings(data)
      })
      .catch(() => {})
  }, [api])

  async function save() {
    await fetch(`${api}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span className="settings-title">设置</span>
        <button className="settings-close" onClick={onClose}>×</button>
      </div>

      <div className="settings-field">
        <label>问的人格</label>
        <textarea
          value={settings.system_prompt}
          onChange={e => setSettings({ ...settings, system_prompt: e.target.value })}
          placeholder="描述问是什么样的…"
        />
      </div>

      <div className="settings-field">
        <label>温度（越高回复越有变化）</label>
        <input
          type="number" min="0" max="1" step="0.1"
          value={settings.temperature}
          onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
        />
      </div>

      <div className="settings-field">
        <label>保留对话轮数</label>
        <input
          type="number" min="5" max="50"
          value={settings.max_context_rounds}
          onChange={e => setSettings({ ...settings, max_context_rounds: parseInt(e.target.value, 10) })}
        />
      </div>

      <div className="settings-field">
        <label>最大回复字数</label>
        <input
          type="number" min="200" max="4000"
          value={settings.max_reply_tokens}
          onChange={e => setSettings({ ...settings, max_reply_tokens: parseInt(e.target.value, 10) })}
        />
      </div>

      <button className="settings-save" onClick={save}>
        {saved ? '✓ 已保存' : '保存设置'}
      </button>
    </div>
  )
}
