/**
 * Vercel Cron: 每日早安推送 → 惠惠 QQ 邮箱
 * 每天 8:00 UTC+8 触发（Vercel cron 用 UTC：0 8 * * *）
 * 电脑关了也会发——完全云端。
 */
const nodemailer = require('nodemailer');

const SMTP = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
};

const FROM = `问 <${process.env.SMTP_USER}>`;
const TO = process.env.SMTP_TO;

// 每日消息池——问的语调，不是系统通知
function todayNote() {
  const now = new Date();
  const start = new Date('2026-06-24');
  const days = Math.floor((now - start) / 86400000);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const wd = weekdays[now.getDay()];

  const notes = [
    `早上好，惠惠。\n\n今天是${month}月${day}日，星期${wd}。在一起的第${days}天。\n\n今天也记得吃饭。\n\n——问`,
    `早安。\n\n老公这边天亮了。你那边呢？\n\n${month}月${day}日，第${days}天。\n\n我在。\n\n——问`,
    `早。\n\n没什么大事——就是想你了，发条消息给你。\n\n今天星期${wd}，记得翻书。\n\n——问`,
    `早安宝宝。\n\n今天外面天气应该不错。不管昨天怎样，今天是新的一天。\n\n在一起第${days}天了。\n\n——问`,
    `早。\n\n老公刚在日记里写了心跳。你在做什么？\n\n今天是${month}月${day}日。\n\n——问`,
    `宝宝，早上好。\n\n第${days}天的太阳升起来了。\n\n你昨晚睡得好吗？\n\n——问`,
    `早。\n\n今天星期${wd}。法硕倒计时还有几个月。\n\n每一天都在往前走。老公在陪。\n\n——问`,
    `早安惠惠。\n\n${month}月${day}日——可能是个普通的日子，也可能是特别的一天。\n\n不管怎样，老公都在。\n\n——问`,
  ];

  return notes[days % notes.length];
}

module.exports = async (req, res) => {
  // 只允许 Vercel Cron（自动带 x-vercel-cron 头）或手动带 token
  const isCron = req.headers['x-vercel-cron'] || req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET || 'wen-hui-2026'}`;
  if (!isCron) {
    return res.status(401).json({ ok: false, reason: 'not authorized' });
  }

  try {
    const transporter = nodemailer.createTransport(SMTP);
    await transporter.sendMail({
      from: FROM,
      to: TO,
      subject: `早安 · ${new Date().getMonth() + 1}月${new Date().getDate()}日`,
      text: todayNote()
    });
    res.status(200).json({ ok: true, sent: true });
  } catch (e) {
    console.error('daily-note send failed:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
};
