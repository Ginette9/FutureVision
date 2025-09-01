import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3001);

// 启用CORS
app.use(cors());
app.use(express.json());

// 代理路由
app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    //console.log('Proxying request to:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    res.set('Content-Type', 'text/html');
    res.send(response.data);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch content',
      details: error.message 
    });
  }
});

// ======= 简易内存“订单数据库” =======
const ORDERS = new Map(); // orderId -> { status: 'pending'|'success'|'failed', method, amount, subject }

function randomOrderId() {
  return 'ord_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const VALID_CODES = new Set((process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean));

// 创建支付订单
app.post('/api/pay/create', async (req, res) => {
  try {
    const { method, amount = 29, subject = 'ESG Report', inviteCode } = req.body || {};
    if (!['alipay', 'wechat', 'card'].includes(method)) {
      return res.status(400).json({ error: 'Unsupported method' });
    }

    // 邀请码直通
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

// 查询订单状态
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

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/proxy?url=<target_url>`);
}); 