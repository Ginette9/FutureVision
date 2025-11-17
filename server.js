import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// 启用CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// 图片代理（返回二进制，解决跨域与混合内容问题）
app.get('/proxy/image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(response.data));
  } catch (error) {
    const status = error.response?.status;
    console.error('[proxy-image] error', { url: req.query?.url, status, message: error.message });
    res.status(status || 500).json({ error: 'proxy_image_failed', message: error.message });
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

// ============== 简单报告存储 API ==============
// 支持通过环境变量覆盖存储路径（适配 Render 持久盘）
const ENV_INSIGHTS_PATH = process.env.INSIGHTS_PATH;
const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');
const DEFAULT_INSIGHTS_JSON = path.join(DEFAULT_DATA_DIR, 'insights.json');
const INSIGHTS_JSON = ENV_INSIGHTS_PATH || DEFAULT_INSIGHTS_JSON;
const DEFAULT_NEWS_JSON = path.join(DEFAULT_DATA_DIR, 'global-news.json');
const NEWS_JSON = process.env.NEWS_PATH || DEFAULT_NEWS_JSON;
const DEFAULT_MUST_READS_JSON = path.join(DEFAULT_DATA_DIR, 'must-reads.json');
const MUST_READS_JSON = process.env.MUST_READS_PATH || DEFAULT_MUST_READS_JSON;
const DEFAULT_COURSES_JSON = path.join(DEFAULT_DATA_DIR, 'courses-resources.json');
const COURSES_JSON = process.env.COURSES_PATH || DEFAULT_COURSES_JSON;
const DEFAULT_SUBSCRIPTIONS_JSON = path.join(DEFAULT_DATA_DIR, 'subscriptions.json');
const SUBSCRIPTIONS_JSON = process.env.SUBSCRIPTIONS_PATH || DEFAULT_SUBSCRIPTIONS_JSON;
const DEFAULT_CONTACTS_JSON = path.join(DEFAULT_DATA_DIR, 'contacts.json');
const CONTACTS_JSON = process.env.CONTACTS_PATH || DEFAULT_CONTACTS_JSON;

// 运行时上传目录（PDF/图片），支持持久盘配置
const ENV_UPLOADS_DIR = process.env.UPLOADS_DIR;
const DEFAULT_UPLOADS_DIR = path.join(DEFAULT_DATA_DIR, 'uploads');
const UPLOADS_DIR = ENV_UPLOADS_DIR || DEFAULT_UPLOADS_DIR;

function ensureDataFile() {
  try {
    const dir = path.dirname(INSIGHTS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(INSIGHTS_JSON)) {
      fs.writeFileSync(INSIGHTS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[insights] ensure data file failed:', e.message);
  }
}

function readInsights() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(INSIGHTS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch (e) {
    console.error('[insights] read failed:', e.message);
    return [];
  }
}

function writeInsights(arr) {
  try {
    ensureDataFile();
    fs.writeFileSync(INSIGHTS_JSON, JSON.stringify(arr ?? [], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[insights] write failed:', e.message);
    return false;
  }
}

function ensureNewsFile() {
  try {
    const dir = path.dirname(NEWS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(NEWS_JSON)) {
      fs.writeFileSync(NEWS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[news] ensure data file failed:', e.message);
  }
}

function readNews() {
  try {
    ensureNewsFile();
    const raw = fs.readFileSync(NEWS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch (e) {
    console.error('[news] read failed:', e.message);
    return [];
  }
}

function writeNews(arr) {
  try {
    ensureNewsFile();
    fs.writeFileSync(NEWS_JSON, JSON.stringify(arr ?? [], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[news] write failed:', e.message);
    return false;
  }
}

function ensureMustReadsFile() {
  try {
    const dir = path.dirname(MUST_READS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(MUST_READS_JSON)) {
      fs.writeFileSync(MUST_READS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[must-reads] ensure data file failed:', e.message);
  }
}

function readMustReads() {
  try {
    ensureMustReadsFile();
    const raw = fs.readFileSync(MUST_READS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch (e) {
    console.error('[must-reads] read failed:', e.message);
    return [];
  }
}

function writeMustReads(arr) {
  try {
    ensureMustReadsFile();
    fs.writeFileSync(MUST_READS_JSON, JSON.stringify(arr ?? [], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[must-reads] write failed:', e.message);
    return false;
  }
}

function ensureCoursesFile() {
  try {
    const dir = path.dirname(COURSES_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(COURSES_JSON)) {
      fs.writeFileSync(COURSES_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[courses] ensure data file failed:', e.message);
  }
}

function readCourses() {
  try {
    ensureCoursesFile();
    const raw = fs.readFileSync(COURSES_JSON, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch (e) {
    console.error('[courses] read failed:', e.message);
    return [];
  }
}

function writeCourses(arr) {
  try {
    ensureCoursesFile();
    fs.writeFileSync(COURSES_JSON, JSON.stringify(arr ?? [], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[courses] write failed:', e.message);
    return false;
  }
}

function ensureUploadsDir() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (e) {
    console.error('[uploads] ensure dir failed:', e.message);
  }
}
ensureUploadsDir();

function ensureSubscriptionsFile() {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(SUBSCRIPTIONS_JSON)) {
      fs.writeFileSync(SUBSCRIPTIONS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[subscriptions] ensure data file failed:', e.message);
  }
}
function readSubscriptions() {
  try {
    ensureSubscriptionsFile();
    const raw = fs.readFileSync(SUBSCRIPTIONS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('[subscriptions] read failed:', e.message);
    return [];
  }
}
function writeSubscriptions(arr) {
  try {
    ensureSubscriptionsFile();
    const list = Array.isArray(arr) ? arr : [];
    const seen = new Set();
    const uniq = [];
    for (const it of list) {
      const key = `${String(it?.email || '').toLowerCase()}__${String(it?.category || '')}`;
      if (key && !seen.has(key)) { seen.add(key); uniq.push(it); }
    }
    fs.writeFileSync(SUBSCRIPTIONS_JSON, JSON.stringify(uniq, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[subscriptions] write failed:', e.message);
    return false;
  }
}

function ensureContactsFile() {
  try {
    const dir = path.dirname(CONTACTS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(CONTACTS_JSON)) {
      fs.writeFileSync(CONTACTS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[contacts] ensure data file failed:', e.message);
  }
}
function readContacts() {
  try {
    ensureContactsFile();
    const raw = fs.readFileSync(CONTACTS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('[contacts] read failed:', e.message);
    return [];
  }
}
function writeContacts(arr) {
  try {
    ensureContactsFile();
    fs.writeFileSync(CONTACTS_JSON, JSON.stringify(arr ?? [], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[contacts] write failed:', e.message);
    return false;
  }
}

// 获取线上报告列表
app.get('/api/insights', (req, res) => {
  const data = readInsights();
  res.json({ items: data, count: data.length });
});

// 覆盖保存报告列表（由管理页触发）
app.post('/api/insights', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (ADMIN_TOKEN && token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'invalid_payload', message: 'items must be an array' });
  }
  const ok = writeInsights(items);
  if (!ok) return res.status(500).json({ error: 'write_failed' });
  return res.json({ success: true, count: items.length });
});

app.get('/api/news', (req, res) => {
  const data = readNews();
  res.json({ items: data, count: data.length });
});

app.post('/api/news', (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'invalid_payload', message: 'items must be an array' });
  }
  const ok = writeNews(items);
  if (!ok) return res.status(500).json({ error: 'write_failed' });
  return res.json({ success: true, count: items.length });
});

app.get('/api/subscriptions', (req, res) => {
  const items = readSubscriptions();
  res.json({ items, count: items.length });
});

app.post('/api/subscribe', (req, res) => {
  try {
    const { email, category } = req.body || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    const cat = String(category || 'general').trim();
    const items = readSubscriptions();
    const exists = items.some(x => String(x?.email).toLowerCase() === e.toLowerCase() && String(x?.category) === cat);
    if (!exists) items.push({ email: e, category: cat, ts: new Date().toISOString() });
    const ok = writeSubscriptions(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[subscribe] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/contacts', (req, res) => {
  const items = readContacts();
  res.json({ items, count: items.length });
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, company, position, phone, message } = req.body || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    const rec = {
      name: String(name || ''),
      email: e,
      company: String(company || ''),
      position: String(position || ''),
      phone: String(phone || ''),
      message: String(message || ''),
      ts: new Date().toISOString()
    };
    const items = readContacts();
    items.push(rec);
    const ok = writeContacts(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[contact] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/must-reads', (req, res) => {
  const data = readMustReads();
  res.json({ items: data, count: data.length });
});

app.post('/api/must-reads', (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'invalid_payload', message: 'items must be an array' });
  }
  const ok = writeMustReads(items);
  if (!ok) return res.status(500).json({ error: 'write_failed' });
  return res.json({ success: true, count: items.length });
});

app.get('/api/courses', (req, res) => {
  const data = readCourses();
  res.json({ items: data, count: data.length });
});

app.post('/api/courses', (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'invalid_payload', message: 'items must be an array' });
  }
  const ok = writeCourses(items);
  if (!ok) return res.status(500).json({ error: 'write_failed' });
  return res.json({ success: true, count: items.length });
});

// 静态服务上传的文件（PDF、图片等）
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/data', express.static(DEFAULT_DATA_DIR));

// 简易上传接口：接受 dataURL/base64 内容并保存到 uploads 目录
app.post('/api/uploads', (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (ADMIN_TOKEN && token !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const { filename, contentBase64, folder } = req.body || {};
    if (!filename || !contentBase64) {
      return res.status(400).json({ error: 'filename and contentBase64 are required' });
    }
    const safeName = path.basename(String(filename));
    const allowedFolders = new Set(['news-pics', 'reports', 'knowledge-pics']);
    const sub = allowedFolders.has(String(folder)) ? String(folder) : '';
    const dir = sub ? path.join(UPLOADS_DIR, sub) : UPLOADS_DIR;
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch {}
    const target = path.join(dir, safeName);
    const raw = String(contentBase64);
    const comma = raw.indexOf(',');
    const pure = comma >= 0 ? raw.slice(comma + 1) : raw;
    const buf = Buffer.from(pure, 'base64');
    fs.writeFileSync(target, buf);
    const url = sub ? `/uploads/${sub}/${safeName}` : `/uploads/${safeName}`;
    return res.json({ ok: true, url });
  } catch (e) {
    console.error('[uploads] save failed:', e.message);
    return res.status(500).json({ error: 'save_failed' });
  }
});

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
