import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

// ===== 基础中间件 =====
app.use(cors());
app.use(express.json());

// ===== 业务接口（代理 & 支付示例）=====
app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    const response = await axios.get(String(url), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      timeout: 10000,
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch content',
      details: error.message,
    });
  }
});

// ======= 简易内存“订单数据库” =======
const ORDERS = new Map(); // orderId -> { status: 'pending'|'success'|'failed', method, amount, subject }

function randomOrderId() {
  return 'ord_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const VALID_CODES = new Set(
  (process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

// 创建支付订单（模拟）
app.post('/api/pay/create', async (req, res) => {
  try {
    const { method, amount = 29, subject = 'ESG Report', inviteCode } = req.body || {};
    if (!['alipay', 'wechat', 'card'].includes(method)) {
      return res.status(400).json({ error: 'Unsupported method' });
    }

    // 邀请码直通（免付）
    if (typeof inviteCode === 'string' && VALID_CODES.has(inviteCode.trim().toLowerCase())) {
      return res.json({ paid: true, method, amount, subject });
    }

    const orderId = randomOrderId();
    ORDERS.set(orderId, { status: 'pending', method, amount, subject, createdAt: Date.now() });

    // 模拟第三方：不同方式返回不同跳转/二维码地址
    let payUrl = `https://example.com/pay/${method}/${orderId}`;
    let codeUrl = `wepay://${orderId}`;
    if (method === 'alipay') {
      payUrl = `https://openapi.alipay.com/gateway.do?out_trade_no=${orderId}`;
      codeUrl = `alipayqr://${orderId}`;
    } else if (method === 'wechat') {
      payUrl = `https://pay.wechat.com/?order=${orderId}`;
      codeUrl = `weixin://wxpay/bizpayurl?pr=${orderId}`;
    }

    // 模拟异步回调：3-8 秒内自动成功
    setTimeout(() => {
      const record = ORDERS.get(orderId);
      if (record && record.status === 'pending') {
        record.status = 'success';
        ORDERS.set(orderId, record);
      }
    }, 3000 + Math.floor(Math.random() * 5000));

    return res.json({
      paid: false,
      orderId,
      method,
      amount,
      subject,
      payUrl,
      codeUrl, // 可用于生成二维码
    });
  } catch (e) {
    console.error('create pay error:', e.message);
    return res.status(500).json({ error: 'create_failed', message: e.message });
  }
});

// 查询订单状态（模拟）
app.get('/api/pay/query', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'missing_orderId' });
    }
    const record = ORDERS.get(orderId);
    if (!record) {
      return res.status(404).json({ error: 'order_not_found' });
    }
    return res.json({ orderId, status: record.status });
  } catch (e) {
    console.error('query pay error:', e.message);
    return res.status(500).json({ error: 'query_failed', message: e.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== 静态托管（用于线上部署）=====
// 你的 Vite 构建命令输出到 dist/static
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist', 'static');

app.use(express.static(distDir));

// SPA 回退（避免覆盖 API/代理/健康检查）
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/proxy') ||
    req.path.startsWith('/health')
  ) {
    return next();
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

// ===== 启动 =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
