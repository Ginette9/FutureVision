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
  
  // 所有非API路由都返回index.html（支持React Router）
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/proxy') && req.path !== '/health') {
      res.sendFile('dist/static/index.html', { root: '.' });
    }
  });
}

// PayPal配置
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' 或 'live'
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Stripe配置
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// 获取PayPal访问令牌
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal access token error:', error.message);
    throw error;
  }
}

// 创建PayPal订单
async function createPayPalOrder(amount, currency, subject) {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: subject
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/success`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/cancel`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('PayPal create order error:', error.message);
    throw error;
  }
}

// 捕获PayPal支付
async function capturePayPalPayment(orderId) {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    throw error;
  }
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

// ======= 订单数据库 =======
const ORDERS = new Map(); // orderId -> { status: 'pending'|'success'|'failed', method, amount, subject, paypalOrderId }

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
    console.log('收到支付请求:', req.body);
    const { method, amount = 29, subject = 'ESG Report', inviteCode, currency = 'USD' } = req.body || {};
    
    // 验证支付方式
    if (!method || !['paypal', 'stripe', 'banktransfer'].includes(method)) {
      return res.status(400).json({ 
        error: 'invalid_method', 
        message: '不支持的支付方式，请选择：paypal, stripe, 或 banktransfer' 
      });
    }
    
    // 验证金额
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'invalid_amount', 
        message: '金额必须是大于0的数字' 
      });
    }
    
    // 验证货币
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      return res.status(400).json({ 
        error: 'invalid_currency', 
        message: '不支持的货币，请选择：USD, EUR, 或 GBP' 
      });
    }
    
    // 邀请码直通
    if (typeof inviteCode === 'string' && VALID_CODES.has(inviteCode.trim().toLowerCase())) {
      return res.json({ paid: true, method, amount, subject });
    }

    const orderId = randomOrderId();
    ORDERS.set(orderId, { 
      status: 'pending', 
      method, 
      amount, 
      subject, 
      currency,
      createdAt: Date.now() 
    });

    let paymentData = {};

    if (method === 'paypal') {
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        return res.status(500).json({ error: 'PayPal not configured' });
      }
      
      try {
        const paypalOrder = await createPayPalOrder(amount, currency, subject);
        ORDERS.get(orderId).paypalOrderId = paypalOrder.id;
        
        paymentData = {
          paypalOrderId: paypalOrder.id,
          approvalUrl: paypalOrder.links.find(link => link.rel === 'approve')?.href,
          payUrl: paypalOrder.links.find(link => link.rel === 'approve')?.href
        };
      } catch (error) {
        console.error('PayPal order creation failed:', error.message);
        return res.status(500).json({ error: 'PayPal order creation failed' });
      }
    } else if (method === 'stripe') {
      if (!STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe not configured' });
      }
      
      // Stripe支付意图创建
      try {
        const stripeResponse = await axios.post(
          'https://api.stripe.com/v1/payment_intents',
          {
            amount: Math.round(amount * 100), // Stripe使用分为单位
            currency: currency.toLowerCase(),
            description: subject,
            metadata: { orderId }
          },
          {
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        paymentData = {
          stripeClientSecret: stripeResponse.data.client_secret,
          stripePublishableKey: STRIPE_PUBLISHABLE_KEY
        };
      } catch (error) {
        console.error('Stripe payment intent creation failed:', error.message);
        return res.status(500).json({ error: 'Stripe payment intent creation failed' });
      }
    } else if (method === 'banktransfer') {
      // 银行转账信息
      paymentData = {
        bankInfo: {
          bankName: 'International Bank',
          accountName: 'Future Vision Ltd',
          accountNumber: '1234567890',
          swiftCode: 'INTLUS33',
          routingNumber: '021000021'
        }
      };
    }

    return res.json({
      paid: false,
      orderId,
      method,
      amount,
      subject,
      currency,
      ...paymentData
    });
  } catch (e) {
    console.error('create pay error:', e.message);
    return res.status(500).json({ error: 'create_failed', message: e.message });
  }
});

// PayPal支付成功回调
app.post('/api/pay/paypal/capture', async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    
    if (!paypalOrderId || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const order = ORDERS.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 捕获PayPal支付
    const captureResult = await capturePayPalPayment(paypalOrderId);
    
    if (captureResult.status === 'COMPLETED') {
      order.status = 'success';
      order.paypalCaptureId = captureResult.purchase_units[0].payments.captures[0].id;
      ORDERS.set(orderId, order);
      
      return res.json({ 
        success: true, 
        status: 'success',
        captureId: order.paypalCaptureId
      });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    return res.status(500).json({ error: 'Capture failed' });
  }
});

// Stripe支付成功回调
app.post('/api/pay/stripe/webhook', async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const order = ORDERS.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 验证Stripe支付状态
    const stripeResponse = await axios.get(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
        }
      }
    );

    if (stripeResponse.data.status === 'succeeded') {
      order.status = 'success';
      order.stripePaymentIntentId = paymentIntentId;
      ORDERS.set(orderId, order);
      
      return res.json({ success: true, status: 'success' });
    } else {
      return res.status(400).json({ error: 'Payment not succeeded' });
    }
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    paypal: !!PAYPAL_CLIENT_ID,
    stripe: !!STRIPE_SECRET_KEY
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`PayPal mode: ${PAYPAL_MODE}`);
  console.log(`PayPal configured: ${!!PAYPAL_CLIENT_ID}`);
  console.log(`Stripe configured: ${!!STRIPE_SECRET_KEY}`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: 'internal_server_error', 
    message: '服务器内部错误' 
  });
}); 