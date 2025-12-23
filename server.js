import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import fileUpload from 'express-fileupload';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3001);
// 使用ADMIN_PASSWORD环境变量作为默认的ADMIN_TOKEN，保持与前端一致
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || 'admin123456';
const BLOCKED_EMAILS = new Set(['xuchenyi@mscfv.com']);
function isBlockedEmail(e) {
  return BLOCKED_EMAILS.has(String(e || '').toLowerCase());
}
const CACHE = new Map();
function ck(name, params) { return name + '|' + JSON.stringify(params || {}); }
function cget(k) { const v = CACHE.get(k); if (!v) return null; if (v.exp && v.exp < Date.now()) { CACHE.delete(k); return null; } return v.data; }
function cset(k, data, ttlMs) { CACHE.set(k, { data, exp: Date.now() + (ttlMs || 3600000) }); }

// ====== 邀请码相关配置扩展 ======
// 邀请码使用记录
const INVITE_CODE_USAGE = [];

// 分析记录文件路径
const ANALYTICS_FILE_PATH = path.join(process.cwd(), 'analytics.json');

// 确保分析记录文件存在
function ensureAnalyticsFile() {
  if (!fs.existsSync(ANALYTICS_FILE_PATH)) {
    fs.writeFileSync(ANALYTICS_FILE_PATH, JSON.stringify([], null, 2));
  }
}

// 保存分析记录
function saveAnalyticsRecord(record) {
  try {
    ensureAnalyticsFile();
    const existingData = JSON.parse(fs.readFileSync(ANALYTICS_FILE_PATH, 'utf8'));
    existingData.push({
      ...record,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(ANALYTICS_FILE_PATH, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error('保存分析记录失败:', error);
  }
}

async function prepareDbFiles() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const targetDir = isProd ? path.join(process.cwd(), 'dist/static') : path.join(process.cwd(), 'public');
    try { if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true }); } catch {}
    const tasks = [
      { env: 'DB_URL_EN', name: 'csr_database.db' },
      { env: 'DB_URL_CN', name: 'csr_database_CN.db' },
      { env: 'DB_URL_HK', name: 'csr_database_HK.db' }
    ];
    for (const t of tasks) {
      const p = path.join(targetDir, t.name);
      if (fs.existsSync(p)) continue;
      const url = process.env[t.env];
      if (!url) continue;
      try {
        const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
        fs.writeFileSync(p, Buffer.from(resp.data));
        console.log(`[db] downloaded ${t.name} from ${url}`);
      } catch (e) {
        console.error(`[db] download failed ${t.name}:`, e.message);
      }
    }
  } catch (e) {
    console.error('[db] prepare failed:', e.message);
  }
}

// 启用CORS
app.use(cors());
// 配置文件上传中间件
app.use(fileUpload());
app.use(express.json({ limit: '50mb' }));

// 静态文件服务
app.use('/images', express.static('public/images'));
app.use(express.static('public'));

// 生产环境特殊处理
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/static'));
  
  // 特殊处理数据库文件
  app.get('/csr_database.db', (req, res) => {
    res.sendFile('dist/static/csr_database.db', { root: '.' });
  });
  app.get('/csr_database_CN.db', (req, res) => {
    res.sendFile('dist/static/csr_database_CN.db', { root: '.' });
  });
  app.get('/csr_database_HK.db', (req, res) => {
    res.sendFile('dist/static/csr_database_HK.db', { root: '.' });
  });
  
  // 所有非 API 路由都返回 index.html（排除 /api 与 /proxy 与 /health 与 /assets，允许可选的结尾或斜杠）
  // 排除规则： /^\/(api|proxy|assets)(\/|$)|^\/health(\/|$)/
  app.get(/^(?!\/(api|proxy|assets)(\/|$)|\/health(\/|$)).*/, (req, res) => {
    res.sendFile('dist/static/index.html', { root: '.' });
  });
} else {
  // 开发环境静态文件服务
  app.use('/images', express.static('public/images'));
  app.use(express.static('public'));
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

// PDF 代理（加速跨域 PDF 加载并启用缓存）
app.get('/proxy/pdf', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });
    const response = await axios.get(String(url), {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/pdf,*/*;q=0.8',
      },
      timeout: 20000
    });
    res.set('Content-Type', response.headers['content-type'] || 'application/pdf');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(response.data));
  } catch (e) {
    const status = e.response?.status;
    console.error('[proxy-pdf] error', { url: req.query?.url, status, message: e.message });
    res.status(status || 500).json({ error: 'proxy_pdf_failed', message: e.message });
  }
});

// 已移除订单数据库，仅保留邀请码白名单
// 邀请码初始化将在DEFAULT_DATA_DIR定义后进行

// 简易订单存储（内存）
const ORDERS = new Map(); // orderId -> { status, paypalOrderId }
function randomOrderId() {
  return 'ord_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// 验证邀请码是否有效
function validateInviteCode(code) {
  if (!code || typeof code !== 'string') return false;
  
  const normalizedCode = code.trim().toLowerCase();
  const codeObj = VALID_CODES.find(c => c.code === normalizedCode);
  
  if (!codeObj) return false;
  
  // 检查是否已过期或已用完
  const now = new Date();
  
  if (codeObj.type === 'count') {
    // 按次数管理
    return codeObj.currentUses < codeObj.maxUses;
  } else if (codeObj.type === 'time') {
    // 按时间管理
    const startDate = new Date(codeObj.startDate);
    const endDate = new Date(codeObj.endDate);
    return now >= startDate && now <= endDate;
  }
  
  return false;
}

// 使用邀请码（更新使用次数）
function useInviteCode(code) {
  if (!code || typeof code !== 'string') return false;
  
  const normalizedCode = code.trim().toLowerCase();
  const codeIndex = VALID_CODES.findIndex(c => c.code === normalizedCode);
  
  if (codeIndex === -1) return false;
  
  const codeObj = VALID_CODES[codeIndex];
  
  if (codeObj.type === 'count') {
    // 按次数管理，增加使用次数
    codeObj.currentUses++;
    // 保存更新
    saveInviteCodes(VALID_CODES);
    return true;
  } else if (codeObj.type === 'time') {
    // 按时间管理，无需更新使用次数
    return true;
  }
  
  return false;
}

// 创建支付或邀请码校验
app.post('/api/pay/create', async (req, res) => {
  try {
    const { inviteCode, method = 'paypal', amount = 5000, subject = 'ESG Report', currency = 'HKD' } = req.body || {};
    if (typeof inviteCode === 'string' && validateInviteCode(inviteCode)) {
      useInviteCode(inviteCode);
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

// 邀请码文件路径
const DEFAULT_INVITE_CODES_JSON = path.join(DEFAULT_DATA_DIR, 'invite-codes.json');
const INVITE_CODES_JSON = process.env.INVITE_CODES_PATH || DEFAULT_INVITE_CODES_JSON;

// 确保邀请码文件存在
function ensureInviteCodesFile() {
  if (!fs.existsSync(DEFAULT_DATA_DIR)) {
    fs.mkdirSync(DEFAULT_DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(INVITE_CODES_JSON)) {
    const defaultCodes = process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV';
    const codesArray = defaultCodes.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const structuredCodes = codesArray.map(code => ({
      code,
      type: 'count',
      maxUses: 1,
      currentUses: 0,
      createdAt: new Date().toISOString()
    }));
    fs.writeFileSync(INVITE_CODES_JSON, JSON.stringify(structuredCodes, null, 2));
  }
}

// 保存邀请码到文件
function saveInviteCodes(codes) {
  try {
    ensureInviteCodesFile();
    fs.writeFileSync(INVITE_CODES_JSON, JSON.stringify(codes, null, 2));
    return true;
  } catch (error) {
    console.error('保存邀请码失败:', error);
    return false;
  }
}

// 初始化邀请码集合（从持久化文件中读取）
ensureInviteCodesFile();
let VALID_CODES = [];
try {
  const inviteCodesJson = fs.readFileSync(INVITE_CODES_JSON, 'utf8');
  const inviteCodesArray = JSON.parse(inviteCodesJson);
  
  // 检查是否是旧格式（简单字符串数组）
  if (inviteCodesArray.length > 0 && typeof inviteCodesArray[0] === 'string') {
    // 转换为新格式
    VALID_CODES = inviteCodesArray.map(code => ({
      code: code.trim().toLowerCase(),
      type: 'count',
      maxUses: 1,
      currentUses: 0,
      createdAt: new Date().toISOString()
    }));
    // 保存新格式
    saveInviteCodes(VALID_CODES);
  } else {
    // 已经是新格式
    VALID_CODES = inviteCodesArray;
  }
} catch (error) {
  console.error('读取邀请码文件失败:', error);
  // 如果读取失败，使用环境变量中的默认值
  const defaultCodes = process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV';
  VALID_CODES = defaultCodes.split(',').map(s => ({
    code: s.trim().toLowerCase(),
    type: 'count',
    maxUses: 1,
    currentUses: 0,
    createdAt: new Date().toISOString()
  }));
  // 保存默认值到文件
  saveInviteCodes(VALID_CODES);
}

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
const DEFAULT_LEADS_JSON = path.join(DEFAULT_DATA_DIR, 'esg-form-leads.json');
const LEADS_JSON = process.env.LEADS_PATH || DEFAULT_LEADS_JSON;
const DEFAULT_VISITORS_JSON = path.join(DEFAULT_DATA_DIR, 'visitors.json');
const VISITORS_JSON = process.env.VISITORS_PATH || DEFAULT_VISITORS_JSON;

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

function ensureLeadsFile() {
  try {
    const dir = path.dirname(LEADS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LEADS_JSON)) {
      fs.writeFileSync(LEADS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[leads] ensure data file failed:', e.message);
  }
}
function readLeads() {
  try {
    ensureLeadsFile();
    const raw = fs.readFileSync(LEADS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('[leads] read failed:', e.message);
    return [];
  }
}
function writeLeads(arr) {
  try {
    ensureLeadsFile();
    const list = Array.isArray(arr) ? arr : [];
    const seen = new Set();
    const uniq = [];
    for (const it of list) {
      const key = `${String(it?.email || '').toLowerCase()}__${String(it?.industryId || '')}__${String(it?.countryId || '')}`;
      if (key && !seen.has(key)) { seen.add(key); uniq.push(it); }
    }
    fs.writeFileSync(LEADS_JSON, JSON.stringify(uniq, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[leads] write failed:', e.message);
    return false;
  }
}

function ensureVisitorsFile() {
  try {
    const dir = path.dirname(VISITORS_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(VISITORS_JSON)) {
      fs.writeFileSync(VISITORS_JSON, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('[visitors] ensure data file failed:', e.message);
  }
}
function readVisitors() {
  try {
    ensureVisitorsFile();
    const raw = fs.readFileSync(VISITORS_JSON, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('[visitors] read failed:', e.message);
    return [];
  }
}
function writeVisitors(arr) {
  try {
    ensureVisitorsFile();
    const list = Array.isArray(arr) ? arr : [];
    fs.writeFileSync(VISITORS_JSON, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[visitors] write failed:', e.message);
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
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
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

app.get('/api/subscribe', (req, res) => {
  try {
    const { email, category } = req.query || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
    }
    const cat = String(category || 'general').trim();
    const items = readSubscriptions();
    const exists = items.some(x => String(x?.email).toLowerCase() === e.toLowerCase() && String(x?.category) === cat);
    if (!exists) items.push({ email: e, category: cat, ts: new Date().toISOString() });
    const ok = writeSubscriptions(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[subscribe:get] failed:', e.message);
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
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
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

app.get('/api/contact', (req, res) => {
  try {
    const { name, email, company, position, phone, message } = req.query || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
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
    console.error('[contact:get] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/esg-forms', (req, res) => {
  const items = readLeads();
  res.json({ items, count: items.length });
});

app.post('/api/esg-form', (req, res) => {
  try {
    const { name, email, position, organization, phone, industry, country, industryId, industryName, countryId, countryName, inviteCode } = req.body || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
    }
    const rec = {
      name: String(name || ''),
      email: e,
      position: String(position || ''),
      organization: String(organization || ''),
      phone: String(phone || ''),
      industryId: String(industry?.id || industryId || ''),
      industryName: String(industry?.name || industryName || ''),
      countryId: String(country?.id || countryId || ''),
      countryName: String(country?.name || countryName || ''),
      inviteCode: String(inviteCode || ''),
      ts: new Date().toISOString()
    };
    const items = readLeads();
    items.push(rec);
    const ok = writeLeads(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[esg-form] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/esg-form', (req, res) => {
  try {
    const { name, email, position, organization, phone, industryId, industryName, countryId, countryName, inviteCode } = req.query || {};
    const e = String(email || '').trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    if (isBlockedEmail(e)) {
      return res.json({ success: true, ignored: true });
    }
    const rec = {
      name: String(name || ''),
      email: e,
      position: String(position || ''),
      organization: String(organization || ''),
      phone: String(phone || ''),
      industryId: String(industryId || ''),
      industryName: String(industryName || ''),
      countryId: String(countryId || ''),
      countryName: String(countryName || ''),
      inviteCode: String(inviteCode || ''),
      ts: new Date().toISOString()
    };
    const items = readLeads();
    items.push(rec);
    const ok = writeLeads(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[esg-form:get] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.post('/api/visit', (req, res) => {
  try {
    const ip = String(req.headers['x-forwarded-for'] || req.ip || '');
    const ua = String(req.headers['user-agent'] || '');
    const { path: p, referrer, lang } = req.body || {};
    const rec = { path: String(p || ''), referrer: String(referrer || ''), lang: String(lang || ''), ua, ip, ts: new Date().toISOString() };
    const items = readVisitors();
    items.push(rec);
    const ok = writeVisitors(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[visit] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/visit', (req, res) => {
  try {
    const ip = String(req.headers['x-forwarded-for'] || req.ip || '');
    const ua = String(req.headers['user-agent'] || '');
    const { path: p, referrer, lang } = req.query || {};
    const rec = { path: String(p || ''), referrer: String(referrer || ''), lang: String(lang || ''), ua, ip, ts: new Date().toISOString() };
    const items = readVisitors();
    items.push(rec);
    const ok = writeVisitors(items);
    if (!ok) return res.status(500).json({ error: 'write_failed' });
    return res.json({ success: true });
  } catch (e) {
    console.error('[visit:get] failed:', e.message);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/visitors', (req, res) => {
  const items = readVisitors();
  res.json({ items, count: items.length });
});

app.get('/api/visitors/summary', (req, res) => {
  try {
    const { from, to } = req.query || {};
    const items = readVisitors();
    let filtered = items;
    if (from || to) {
      filtered = items.filter(x => {
        const t = new Date(String(x.ts || '')).getTime();
        if (!isFinite(t)) return false;
        const f = from ? new Date(String(from)).getTime() : -Infinity;
        const tt = to ? new Date(String(to)).getTime() : Infinity;
        return t >= f && t <= tt;
      });
    }
    const byPath = new Map();
    for (const it of filtered) {
      const k = String(it.path || '');
      byPath.set(k, (byPath.get(k) || 0) + 1);
    }
    const summary = Array.from(byPath.entries()).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count);
    res.json({ items: summary, total: filtered.length });
  } catch (e) {
    console.error('[visitors/summary] failed:', e.message);
    res.status(500).json({ error: 'internal_error' });
  }
});

// 按 IP 汇总访客
app.get('/api/visitors/summary-by-ip', (req, res) => {
  try {
    const { from, to } = req.query || {};
    const items = readVisitors();
    let filtered = items;
    if (from || to) {
      filtered = items.filter(x => {
        const t = new Date(String(x.ts || '')).getTime();
        if (!isFinite(t)) return false;
        const f = from ? new Date(String(from)).getTime() : -Infinity;
        const tt = to ? new Date(String(to)).getTime() : Infinity;
        return t >= f && t <= tt;
      });
    }
    const byIp = new Map();
    for (const it of filtered) {
      const ip = String(it.ip || '');
      if (!byIp.has(ip)) {
        byIp.set(ip, { count: 0, paths: new Map(), lastTs: '' });
      }
      const rec = byIp.get(ip);
      rec.count += 1;
      const p = String(it.path || '');
      rec.paths.set(p, (rec.paths.get(p) || 0) + 1);
      const tsStr = String(it.ts || '');
      if (!rec.lastTs || (new Date(tsStr).getTime() > new Date(rec.lastTs).getTime())) {
        rec.lastTs = tsStr;
      }
    }
    const itemsOut = Array.from(byIp.entries()).map(([ip, info]) => ({
      ip,
      count: info.count,
      lastTs: info.lastTs,
      paths: Array.from(info.paths.entries()).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count)
    })).sort((a, b) => b.count - a.count);
    res.json({ items: itemsOut, totalIps: itemsOut.length, totalVisits: filtered.length });
  } catch (e) {
    console.error('[visitors/summary-by-ip] failed:', e.message);
    res.status(500).json({ error: 'internal_error' });
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

// ============== 数据库查询 API（服务端执行 SQL.js） ==============
const SQL_WASM_PATH = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
let SQLLib = null;
async function getSQL() {
  if (SQLLib) return SQLLib;
  SQLLib = await initSqlJs({ locateFile: () => SQL_WASM_PATH });
  return SQLLib;
}

function findDbFile(names) {
  const dirs = [
    path.join(process.cwd(), 'dist/static/assets'),
    path.join(process.cwd(), 'dist/static'),
    path.join(process.cwd(), 'public')
  ];
  for (const dir of dirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const n of names) {
        const re = n.includes('*') ? new RegExp('^' + n.replace(/[.]/g, '\\.').replace('*', '.*') + '$') : null;
        const match = re ? files.find(f => re.test(f)) : (files.includes(n) ? n : null);
        if (match) return path.join(dir, match);
      }
    } catch {}
  }
  return null;
}

const DB_PATHS = {
  en: () => findDbFile(['csr_database.db', 'csr_database-*.db', 'csr_database*.db']),
  cn: () => findDbFile(['csr_database_CN*.db', 'csr_database_CN.db']),
  hk: () => findDbFile(['csr_database_HK*.db', 'csr_database_HK.db'])
};

let dbEnglish = null;
let dbLocalized = { 'en-US': null, 'zh-CN': null, 'zh-HK': null };

async function getEnglishDb() {
  if (dbEnglish) return dbEnglish;
  const SQL = await getSQL();
  const p = DB_PATHS.en();
  if (!p) throw new Error('english_db_not_found');
  console.log('[db] english file:', p);
  const uint8 = new Uint8Array(fs.readFileSync(p));
  dbEnglish = new SQL.Database(uint8);
  return dbEnglish;
}

async function getLocalizedDb(lang) {
  const key = (lang === 'zh-CN' || lang === 'zh-HK') ? lang : 'en-US';
  if (dbLocalized[key]) return dbLocalized[key];
  const SQL = await getSQL();
  let p = key === 'zh-CN' ? DB_PATHS.cn() : (key === 'zh-HK' ? DB_PATHS.hk() : DB_PATHS.en());
  if (!p) p = DB_PATHS.en();
  if (!p) throw new Error('localized_db_not_found');
  console.log('[db] localized file:', key, p);
  const uint8 = new Uint8Array(fs.readFileSync(p));
  dbLocalized[key] = new SQL.Database(uint8);
  return dbLocalized[key];
}

function splitIds(raw) {
  if (!raw) return [];
  return String(raw).split(',').map(s => s.trim()).filter(Boolean);
}

app.get('/api/db/risk-ids', async (req, res) => {
  try {
    const { countryName, industryName } = req.query;
    const k = ck('risk-ids', { countryName, industryName });
    const cached = cget(k);
    if (cached) return res.json({ ids: cached });
    const db = await getEnglishDb();
    const stmt = db.prepare(`SELECT risk_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`);
    stmt.bind([String(countryName || ''), String(industryName || '')]);
    let ids = [];
    if (stmt.step()) {
      ids = splitIds(stmt.getAsObject().risk_ids || '');
    }
    stmt.free();
    cset(k, ids);
    res.json({ ids });
  } catch (e) {
    console.error('[db] risk-ids failed:', e.message);
    res.status(500).json({ error: 'risk_ids_failed' });
  }
});

app.get('/api/db/advice-ids', async (req, res) => {
  try {
    const { countryName, industryName } = req.query;
    const k = ck('advice-ids', { countryName, industryName });
    const cached = cget(k);
    if (cached) return res.json({ ids: cached });
    const db = await getEnglishDb();
    const stmt = db.prepare(`SELECT advice_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`);
    stmt.bind([String(countryName || ''), String(industryName || '')]);
    let ids = [];
    if (stmt.step()) {
      ids = splitIds(stmt.getAsObject().advice_ids || '');
    }
    stmt.free();
    cset(k, ids);
    res.json({ ids });
  } catch (e) {
    console.error('[db] advice-ids failed:', e.message);
    res.status(500).json({ error: 'advice_ids_failed' });
  }
});

app.get('/api/db/organization-ids', async (req, res) => {
  try {
    const { countryName, industryName } = req.query;
    const k = ck('organization-ids', { countryName, industryName });
    const cached = cget(k);
    if (cached) return res.json({ ids: cached });
    const db = await getEnglishDb();
    const stmt = db.prepare(`SELECT organization_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`);
    stmt.bind([String(countryName || ''), String(industryName || '')]);
    let ids = [];
    if (stmt.step()) {
      ids = splitIds(stmt.getAsObject().organization_ids || '');
    }
    stmt.free();
    cset(k, ids);
    res.json({ ids });
  } catch (e) {
    console.error('[db] organization-ids failed:', e.message);
    res.status(500).json({ error: 'organization_ids_failed' });
  }
});

app.get('/api/db/initiative-ids', async (req, res) => {
  try {
    const { countryName, industryName } = req.query;
    const k = ck('initiative-ids', { countryName, industryName });
    const cached = cget(k);
    if (cached) return res.json({ ids: cached });
    const db = await getEnglishDb();
    const stmt = db.prepare(`SELECT initiative_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`);
    stmt.bind([String(countryName || ''), String(industryName || '')]);
    let ids = [];
    if (stmt.step()) {
      ids = splitIds(stmt.getAsObject().initiative_ids || '');
    }
    stmt.free();
    cset(k, ids);
    res.json({ ids });
  } catch (e) {
    console.error('[db] initiative-ids failed:', e.message);
    res.status(500).json({ error: 'initiative_ids_failed' });
  }
});

app.get('/api/db/consideration-ids', async (req, res) => {
  try {
    const { countryName, industryName } = req.query;
    const db = await getEnglishDb();
    const stmt = db.prepare(`SELECT consideration_ids FROM applicability_grouped WHERE country_name = ? AND industry_name = ?`);
    stmt.bind([String(countryName || ''), String(industryName || '')]);
    let ids = [];
    if (stmt.step()) {
      ids = splitIds(stmt.getAsObject().consideration_ids || '');
    }
    stmt.free();
    res.json({ ids });
  } catch (e) {
    console.error('[db] consideration-ids failed:', e.message);
    res.status(500).json({ error: 'consideration_ids_failed' });
  }
});

app.get('/api/db/risks', async (req, res) => {
  try {
    const { ids, lang } = req.query;
    const k = ck('risks', { ids, lang });
    const cached = cget(k);
    if (cached) return res.json({ items: cached });
    const db = await getLocalizedDb(String(lang || 'en-US'));
    const arr = splitIds(ids || '');
    if (arr.length === 0) return res.json({ items: [] });
    const placeholders = arr.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT r.id, r.issue_id, r.sub_issue_id, r.content, r.classification, r.source, r.content_html,
             i.issue_name, s.sub_issue_name
      FROM risks r
      LEFT JOIN issues i ON r.issue_id = i.id
      LEFT JOIN sub_issues s ON r.sub_issue_id = s.id
      WHERE r.id IN (${placeholders})
    `);
    stmt.bind(arr);
    const items = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      items.push(row);
    }
    stmt.free();
    cset(k, items);
    res.json({ items });
  } catch (e) {
    console.error('[db] risks failed:', e.message);
    res.status(500).json({ error: 'risks_failed' });
  }
});

app.get('/api/db/advice', async (req, res) => {
  try {
    const { ids, lang } = req.query;
    const k = ck('advice', { ids, lang });
    const cached = cget(k);
    if (cached) return res.json({ items: cached });
    const db = await getLocalizedDb(String(lang || 'en-US'));
    const arr = splitIds(ids || '');
    if (arr.length === 0) return res.json({ items: [] });
    const placeholders = arr.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT a.id, a.issue_id, a.sub_issue_id, a.content, a.classification, a.source, a.content_html,
             i.issue_name, s.sub_issue_name
      FROM advice a
      LEFT JOIN issues i ON a.issue_id = i.id
      LEFT JOIN sub_issues s ON a.sub_issue_id = s.id
      WHERE a.id IN (${placeholders})
    `);
    stmt.bind(arr);
    const items = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      items.push(row);
    }
    stmt.free();
    cset(k, items);
    res.json({ items });
  } catch (e) {
    console.error('[db] advice failed:', e.message);
    res.status(500).json({ error: 'advice_failed' });
  }
});

app.get('/api/db/organizations', async (req, res) => {
  try {
    const { ids, lang } = req.query;
    const k = ck('organizations', { ids, lang });
    const cached = cget(k);
    if (cached) return res.json({ items: cached });
    const db = await getLocalizedDb(String(lang || 'en-US'));
    const arr = splitIds(ids || '');
    if (arr.length === 0) return res.json({ items: [] });
    const placeholders = arr.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT id, name, intro, logo, link, classification, intro_html FROM organizations WHERE id IN (${placeholders})`);
    stmt.bind(arr);
    const items = [];
    while (stmt.step()) items.push(stmt.getAsObject());
    stmt.free();
    cset(k, items);
    res.json({ items });
  } catch (e) {
    console.error('[db] organizations failed:', e.message);
    res.status(500).json({ error: 'organizations_failed' });
  }
});

app.get('/api/db/initiatives', async (req, res) => {
  try {
    const { ids, lang } = req.query;
    const k = ck('initiatives', { ids, lang });
    const cached = cget(k);
    if (cached) return res.json({ items: cached });
    const db = await getLocalizedDb(String(lang || 'en-US'));
    const arr = splitIds(ids || '');
    if (arr.length === 0) return res.json({ items: [] });
    const placeholders = arr.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT id, name, intro, logo, link, classification, intro_html FROM initiatives WHERE id IN (${placeholders})`);
    stmt.bind(arr);
    const items = [];
    while (stmt.step()) items.push(stmt.getAsObject());
    stmt.free();
    cset(k, items);
    res.json({ items });
  } catch (e) {
    console.error('[db] initiatives failed:', e.message);
    res.status(500).json({ error: 'initiatives_failed' });
  }
});

app.get('/api/db/considerations', async (req, res) => {
  try {
    const { ids, lang } = req.query;
    const k = ck('considerations', { ids, lang });
    const cached = cget(k);
    if (cached) return res.json({ items: cached });
    const db = await getLocalizedDb(String(lang || 'en-US'));
    const arr = splitIds(ids || '');
    if (arr.length === 0) return res.json({ items: [] });
    const placeholders = arr.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT id, content, classification, content_html FROM considerations WHERE id IN (${placeholders})`);
    stmt.bind(arr);
    const items = [];
    while (stmt.step()) items.push(stmt.getAsObject());
    stmt.free();
    cset(k, items);
    res.json({ items });
  } catch (e) {
    console.error('[db] considerations failed:', e.message);
    res.status(500).json({ error: 'considerations_failed' });
  }
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), inviteCodesConfigured: VALID_CODES.length > 0 });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), inviteCodesConfigured: VALID_CODES.length > 0 });
});

// ====== 邀请码验证 API ======
app.post('/api/verify-invite-code', async (req, res) => {
  try {
    const { code, ip, isRouteGuard = false } = req.body;
    if (!code || !ip) {
      return res.status(400).json({ error: 'invite_code_missing', message: '邀请码和IP地址不能为空' });
    }
    
    let isValid = false;
    const normalizedCode = code.trim().toLowerCase();
    const codeObj = VALID_CODES.find(c => c.code === normalizedCode);
    
    if (codeObj) {
      if (codeObj.type === 'count') {
        // 按次数管理
        if (isRouteGuard) {
          // RouteGuard验证：只要邀请码存在且曾经被使用过就允许访问
          isValid = codeObj.currentUses > 0;
        } else {
          // 普通验证：检查是否还有剩余使用次数
          isValid = codeObj.currentUses < codeObj.maxUses;
          if (isValid) {
            // 更新使用次数
            codeObj.currentUses++;
            saveInviteCodes(VALID_CODES);
          }
        }
      } else if (codeObj.type === 'time') {
        // 按时间管理
        const now = new Date();
        const startDate = new Date(codeObj.startDate);
        const endDate = new Date(codeObj.endDate);
        isValid = now >= startDate && now <= endDate;
      }
    }
    
    const usageRecord = { code: normalizedCode, ip, isValid, isRouteGuard, timestamp: new Date().toISOString() };
    INVITE_CODE_USAGE.push(usageRecord);
    res.json({ valid: isValid });
  } catch (error) {
    console.error('验证邀请码失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// ====== 邀请码管理 API（需要管理员权限） ======
// 获取所有邀请码
app.get('/api/admin/invite-codes', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    res.json({ codes: VALID_CODES });
  } catch (error) {
    console.error('获取邀请码列表失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// 生成随机邀请码
function generateRandomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.toLowerCase();
}

// 添加或批量生成邀请码
app.post('/api/admin/invite-codes', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    
    const { 
      type = 'count', 
      code, 
      maxUses = 1, 
      startDate, 
      endDate, 
      batchSize = 1 
    } = req.body;
    
    const newCodes = [];
    
    if (code && batchSize === 1) {
      // 手动输入单个邀请码
      const normalizedCode = code.trim().toLowerCase();
      
      // 检查是否已存在
      if (VALID_CODES.some(c => c.code === normalizedCode)) {
        return res.status(400).json({ error: 'code_exists', message: '邀请码已存在' });
      }
      
      let codeObj;
      
      if (type === 'count') {
        // 按次数管理
        codeObj = {
          code: normalizedCode,
          type: 'count',
          maxUses,
          currentUses: 0,
          createdAt: new Date().toISOString()
        };
      } else if (type === 'time') {
        // 按时间管理
        if (!startDate || !endDate) {
          return res.status(400).json({ error: 'missing_dates', message: '时间类型邀请码需要指定开始和结束时间' });
        }
        
        codeObj = {
          code: normalizedCode,
          type: 'time',
          startDate,
          endDate,
          createdAt: new Date().toISOString()
        };
      } else {
        return res.status(400).json({ error: 'invalid_type', message: '邀请码类型无效' });
      }
      
      VALID_CODES.push(codeObj);
      newCodes.push(codeObj);
    } else {
      // 批量生成邀请码
      for (let i = 0; i < batchSize; i++) {
        let generatedCode;
        
        // 确保生成的邀请码唯一
        do {
          generatedCode = generateRandomCode();
        } while (VALID_CODES.some(c => c.code === generatedCode));
        
        let codeObj;
        
        if (type === 'count') {
          // 按次数管理
          codeObj = {
            code: generatedCode,
            type: 'count',
            maxUses,
            currentUses: 0,
            createdAt: new Date().toISOString()
          };
        } else if (type === 'time') {
          // 按时间管理
          if (!startDate || !endDate) {
            return res.status(400).json({ error: 'missing_dates', message: '时间类型邀请码需要指定开始和结束时间' });
          }
          
          codeObj = {
            code: generatedCode,
            type: 'time',
            startDate,
            endDate,
            createdAt: new Date().toISOString()
          };
        } else {
          return res.status(400).json({ error: 'invalid_type', message: '邀请码类型无效' });
        }
        
        VALID_CODES.push(codeObj);
        newCodes.push(codeObj);
      }
    }
    
    // 保存到文件
    const saved = saveInviteCodes(VALID_CODES);
    
    res.json({ 
      success: saved, 
      codes: newCodes, 
      message: batchSize > 1 ? `成功生成${batchSize}个邀请码` : '邀请码添加成功' 
    });
  } catch (error) {
    console.error('添加邀请码失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// 删除邀请码
app.delete('/api/admin/invite-codes/:code', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ error: 'invalid_code', message: '邀请码不能为空' });
    }
    
    const normalizedCode = code.toLowerCase();
    const codeIndex = VALID_CODES.findIndex(c => c.code === normalizedCode);
    
    if (codeIndex !== -1) {
      // 删除邀请码
      VALID_CODES.splice(codeIndex, 1);
      // 保存到文件
      const saved = saveInviteCodes(VALID_CODES);
      res.json({ success: saved, message: '邀请码删除成功' });
    } else {
      res.status(404).json({ error: 'code_not_found', message: '邀请码不存在' });
    }
  } catch (error) {
    console.error('删除邀请码失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// 解析本地化时间格式（支持中文"上午"/"下午"）
function parseLocalizedDate(dateStr) {
  if (typeof dateStr !== 'string') return null;
  
  let normalizedStr = dateStr;
  
  // 处理下午时间
  if (normalizedStr.includes('下午')) {
    normalizedStr = normalizedStr.replace('下午', '');
    // 将12小时制转换为24小时制
    const parts = normalizedStr.split(' ');
    if (parts.length >= 2) {
      const timeParts = parts[1].split(':');
      if (timeParts.length >= 2) {
        let hour = parseInt(timeParts[0]);
        if (hour < 12) {
          hour += 12;
          timeParts[0] = hour.toString();
          parts[1] = timeParts.join(':');
          normalizedStr = parts.join(' ');
        }
      }
    }
  } 
  // 处理上午时间
  else if (normalizedStr.includes('上午')) {
    normalizedStr = normalizedStr.replace('上午', '');
    // 处理上午12点的特殊情况
    const parts = normalizedStr.split(' ');
    if (parts.length >= 2 && parts[1].startsWith('12:')) {
      parts[1] = parts[1].replace('12:', '00:');
      normalizedStr = parts.join(' ');
    }
  }
  
  // 尝试解析标准化后的字符串
  const date = new Date(normalizedStr);
  return isNaN(date.getTime()) ? null : date;
}

// 批量导入邀请码
app.post('/api/admin/invite-codes/import', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    
    // 检查是否有上传的文件
    if (!req.files || !req.files.inviteCodesFile) {
      return res.status(400).json({ error: 'no_file', message: '请上传邀请码文件' });
    }
    
    const uploadedFile = req.files.inviteCodesFile;
    
    // 读取文件内容
    let fileContent;
    if (uploadedFile.mimetype === 'text/csv' || uploadedFile.name.endsWith('.csv')) {
      // 读取CSV文件
      fileContent = uploadedFile.data.toString('utf8');
      
      // 解析CSV内容
      // 使用更可靠的CSV解析方法，处理包含逗号的引号字段
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      // 解析CSV行的辅助函数
      function parseCSVLine(line) {
        const columns = [];
        let current = '';
        let inQuotes = false;
        let escaped = false;
        
        for (let char of line) {
          if (escaped) {
            current += char;
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        
        columns.push(current);
        return columns.map(col => col.replace(/^"|"$/g, '').trim());
      }
      
      // 跳过标题行
      const headerLine = lines[0];
      const headerMap = {};
      const headers = parseCSVLine(headerLine);
      headers.forEach((header, index) => {
        // 清理标题（移除引号和空白）
        const cleanedHeader = header;
        headerMap[cleanedHeader] = index;
      });
      
      // 解析数据行
      const importedCodes = [];
      const errors = [];
      let successCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const columns = parseCSVLine(line);
        
        try {
          // 从CSV列中提取数据
          const code = columns[headerMap['邀请码']]?.toLowerCase();
          const rawType = columns[headerMap['类型']];
          const name = columns[headerMap['名称']];
          const description = columns[headerMap['描述']];
          const statusStr = columns[headerMap['状态']];
          const maxUsesStr = columns[headerMap['最大使用次数']];
          const currentUsesStr = columns[headerMap['已使用次数']];
          const startDateStr = columns[headerMap['开始时间']];
          const endDateStr = columns[headerMap['结束时间']];
          
          // 更严格的类型判断逻辑
          let type = 'count'; // 默认类型为count，更安全
          console.log(`Line ${i+1} - Before type check: rawType='${rawType}'`); // 添加更多调试信息
          if (rawType) {
            const trimmedType = rawType.trim().toLowerCase();
            console.log(`Line ${i+1} - Trimmed type: '${trimmedType}'`); // 调试信息
            if (trimmedType === 'count' || trimmedType.includes('次数')) {
              type = 'count';
            } else if (trimmedType === 'time' || trimmedType.includes('时间')) {
              type = 'time';
            }
          }
          
          console.log(`Line ${i+1}: code=${code}, rawType=${rawType}, type=${type}`); // 调试信息
          
          // 验证必填字段
          if (!code) {
            errors.push({ line: i + 1, message: '邀请码不能为空' });
            continue;
          }
          
          // 检查是否已存在
          if (VALID_CODES.some(c => c.code === code)) {
            errors.push({ line: i + 1, message: `邀请码 ${code} 已存在` });
            continue;
          }
          
          const newCode = {
            code,
            type,
            name: name || '',
            description: description || '',
            active: statusStr === '激活',
            createdAt: new Date().toISOString()
          };
          
          // 根据类型添加相应字段
          if (type === 'count') {
            newCode.maxUses = parseInt(maxUsesStr) || 1;
            newCode.currentUses = parseInt(currentUsesStr) || 0;
          } else if (type === 'time') {
            // 解析开始时间和结束时间（支持本地化时间格式）
            const startDate = parseLocalizedDate(startDateStr);
            const endDate = parseLocalizedDate(endDateStr);
            
            if (!startDate || !endDate) {
              errors.push({ line: i + 1, message: '时间格式不正确' });
              continue;
            }
            
            newCode.startDate = startDate.toISOString();
            newCode.endDate = endDate.toISOString();
            newCode.currentUses = 0;
          }
          
          // 添加到导入列表
          importedCodes.push(newCode);
          successCount++;
          
        } catch (e) {
          errors.push({ line: i + 1, message: `解析错误: ${e.message}` });
        }
      }
      
      // 如果有成功导入的邀请码，保存到文件
      if (importedCodes.length > 0) {
        VALID_CODES.push(...importedCodes);
        const saved = saveInviteCodes(VALID_CODES);
        
        if (!saved) {
          res.status(500).json({ 
            error: 'save_failed', 
            message: '保存邀请码失败',
            successCount, 
            totalCount: importedCodes.length + errors.length,
            errors
          });
          return;
        }
      }
      
      res.json({ 
        success: true, 
        successCount, 
        totalCount: importedCodes.length + errors.length,
        errors 
      });
      
    } else {
      res.status(400).json({ error: 'invalid_file_type', message: '只支持CSV格式的文件' });
    }
    
  } catch (error) {
    console.error('批量导入邀请码失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// ====== 分析记录 API（需要管理员权限） ======
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    
    ensureAnalyticsFile();
    const analyticsData = JSON.parse(fs.readFileSync(ANALYTICS_FILE_PATH, 'utf8'));
    
    res.json({ analytics: analyticsData });
  } catch (error) {
    console.error('获取分析记录失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

// 添加分析记录
app.post('/api/admin/analytics', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (token !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'unauthorized', message: '未经授权的访问' });
    }
    
    const record = req.body;
    
    if (!record.action) {
      return res.status(400).json({ error: 'invalid_record', message: '分析记录必须包含action字段' });
    }
    
    saveAnalyticsRecord(record);
    
    res.json({ success: true, message: '分析记录添加成功' });
  } catch (error) {
    console.error('添加分析记录失败:', error);
    res.status(500).json({ error: 'internal_server_error', message: '服务器内部错误' });
  }
});

await prepareDbFiles();
async function preloadAllDbs() {
  try {
    await getEnglishDb();
    await getLocalizedDb('en-US');
    await getLocalizedDb('zh-CN');
    await getLocalizedDb('zh-HK');
  } catch (e) {
    console.error('[db] preload failed:', e.message);
  }
}
await preloadAllDbs();
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
