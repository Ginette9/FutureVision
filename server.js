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
  
  // 所有非 API 路由都返回 index.html（Express v5 用正则避免 path-to-regexp 错误）
  app.get(/^(?!\/(api|proxy)\/|\/health).*/, (req, res) => {
    res.sendFile('dist/static/index.html', { root: '.' });
  });
}

// 已移除第三方支付配置与逻辑，仅保留邀请码校验

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

// 已移除订单数据库，仅保留邀请码白名单

const VALID_CODES = new Set((process.env.PAY_INVITE_CODES || 'FREE2025,TESTVIP,MSCFV')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean));

// 仅校验邀请码
app.post('/api/pay/create', async (req, res) => {
  try {
    const { inviteCode } = req.body || {};
    if (typeof inviteCode === 'string' && VALID_CODES.has(inviteCode.trim().toLowerCase())) {
      return res.json({ paid: true });
    }
    return res.status(200).json({ paid: false, message: 'Invalid invite code' });
  } catch (e) {
    console.error('create pay error:', e.message);
    return res.status(500).json({ error: 'create_failed', message: e.message });
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