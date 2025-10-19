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

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/static'));
  
  // 特殊处理数据库文件
  app.get('/csr_database.db', (req, res) => {
    res.sendFile('dist/static/csr_database.db', { root: '.' });
  });
  
  // 所有非 API 路由都返回 index.html（排除 /api 与 /proxy 与 /health，允许可选的结尾或斜杠）
  // 排除规则： /^\/(api|proxy)(\/|$)|^\/health(\/|$)/
  app.get(/^(?!\/(api|proxy)(\/|$)|\/health(\/|$)).*/, (req, res) => {
    res.sendFile('dist/static/index.html', { root: '.' });
  });
}

// ============== PayPal 配置（可选，启用即生效） ==============
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new Error('paypal_not_configured');
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function createPayPalOrder(amount, currency, subject) {
  const accessToken = await getPayPalAccessToken();
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: currency, value: amount.toString() }, description: subject }],
      application_context: {
        return_url: process.env.PAYPAL_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay`,
        cancel_url: process.env.PAYPAL_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay`
      }
    },
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );
  return response.data;
}

async function capturePayPalPayment(orderId) {
  const accessToken = await getPayPalAccessToken();
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );
  return response.data;
}

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

    const length = typeof response.data === 'string' ? response.data.length : undefined;
    console.log('[proxy] fetch ok', { url, status: response.status, contentType: response.headers['content-type'], length });

    res.set('Content-Type', 'text/html');
    res.send(response.data);
    
  } catch (error) {
    const status = error.response?.status;
    console.error('[proxy] error', { url: req.query?.url, status, message: error.message });
    res.status(status || 500).json({ 
      error: 'Failed to fetch content',
      details: error.message 
    });
  }
});

// 已移除订单数据库，仅保留邀请码白名单

const VALID_CODES = new Set((process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean));

// 简易订单存储（内存）
const ORDERS = new Map(); // orderId -> { status, paypalOrderId }
function randomOrderId() {
  return 'ord_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// 创建支付或邀请码校验
app.post('/api/pay/create', async (req, res) => {
  try {
    const { inviteCode, method = 'paypal', amount = 5000, subject = 'ESG Report', currency = 'HKD' } = req.body || {};
    if (typeof inviteCode === 'string' && VALID_CODES.has(inviteCode.trim().toLowerCase())) {
      return res.json({ paid: true });
    }
    if (method === 'paypal') {
      try {
        const order = await createPayPalOrder(amount, currency, subject);
        const approvalUrl = order.links.find(l => l.rel === 'approve')?.href;
        const orderId = randomOrderId();
        ORDERS.set(orderId, { status: 'pending', paypalOrderId: order.id });
        return res.json({ paid: false, orderId, paypalOrderId: order.id, approvalUrl });
      } catch (e) {
        console.error('paypal create failed:', e?.response?.data || e.message);
        return res.status(500).json({ paid: false, error: 'paypal_create_failed' });
      }
    }
    return res.status(200).json({ paid: false, message: 'Invalid invite code' });
  } catch (e) {
    console.error('create pay error:', e.message);
    return res.status(500).json({ error: 'create_failed', message: e.message });
  }
});

// PayPal 支付完成后由前端触发验证
app.post('/api/pay/paypal/capture', async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'missing_orderId' });
    const rec = ORDERS.get(orderId);
    if (!rec) return res.status(404).json({ error: 'order_not_found' });
    const capture = await capturePayPalPayment(rec.paypalOrderId);
    if (capture?.status === 'COMPLETED') {
      rec.status = 'success';
      ORDERS.set(orderId, rec);
      return res.json({ success: true });
    }
    return res.status(400).json({ success: false, status: capture?.status || 'unknown' });
  } catch (e) {
    console.error('paypal capture failed:', e?.response?.data || e.message);
    return res.status(500).json({ error: 'capture_failed' });
  }
});

// 已移除第三方回调与订单查询接口

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    inviteCodesConfigured: VALID_CODES.size > 0
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: 'internal_server_error', 
    message: '服务器内部错误' 
  });
});