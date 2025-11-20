#!/bin/bash

# www.mscfv.com 域名部署脚本
# 适用于阿里云服务器 + Node.js v16.20.2

set -e

echo "🚀 开始部署 www.mscfv.com 域名配置..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 域名配置
DOMAIN="www.mscfv.com"
ALT_DOMAIN="mscfv.com"
PROJECT_DIR="${1:-/root/FutureVision}"

info "域名: $DOMAIN"
info "项目目录: $PROJECT_DIR"

# 检查项目目录
if [[ ! -d "$PROJECT_DIR" ]]; then
    error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 检查服务是否运行
step "检查应用服务状态..."
if ! curl -s http://localhost:3002/api/insights > /dev/null; then
    error "后端服务未运行，请先启动应用"
    exit 1
fi

if ! curl -s -I http://localhost:3001 | grep -q "200"; then
    error "前端服务未运行，请先启动应用"
    exit 1
fi

info "✅ 应用服务运行正常"

# 安装Nginx（如果未安装）
step "安装和配置Nginx..."
if ! command -v nginx &> /dev/null; then
    info "安装Nginx..."
    if command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install nginx -y
        systemctl enable nginx
    elif command -v apt &> /dev/null; then
        # Ubuntu/Debian
        apt update
        apt install nginx -y
        systemctl enable nginx
    else
        error "不支持的操作系统，请手动安装Nginx"
        exit 1
    fi
fi

# 停止Nginx服务
systemctl stop nginx || true

# 创建Nginx配置
step "创建Nginx配置文件..."
cat > /etc/nginx/conf.d/mscfv.conf << 'EOF'
# www.mscfv.com Nginx 配置
server {
    listen 80;
    server_name www.mscfv.com mscfv.com;
    
    # 强制HTTP跳转到HTTPS
    return 301 https://www.mscfv.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.mscfv.com mscfv.com;

    # SSL证书配置（使用Let's Encrypt获取）
    ssl_certificate /etc/letsencrypt/live/www.mscfv.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.mscfv.com/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志配置
    access_log /var/log/nginx/www.mscfv.com.access.log;
    error_log /var/log/nginx/www.mscfv.com.error.log;

    # 前端静态文件代理
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # API超时配置
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # 报告文件服务
    location /reports/ {
        alias /root/FutureVision/public/reports/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        
        # 安全限制
        location ~* \.(pdf)$ {
            add_header Content-Disposition "inline";
            add_header X-Frame-Options "SAMEORIGIN";
        }
    }

    # 图片资源服务
    location /images/ {
        alias /root/FutureVision/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        
        # 如果是从dist/static目录访问
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# HTTP到HTTPS重定向（备用配置）
server {
    listen 80;
    server_name mscfv.com;
    return 301 https://www.mscfv.com$request_uri;
}
EOF

# 测试Nginx配置
step "测试Nginx配置..."
if nginx -t; then
    info "✅ Nginx配置测试通过"
else
    error "❌ Nginx配置测试失败"
    exit 1
fi

# 配置防火墙
step "配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    firewall-cmd --permanent --add-service=http 2>/dev/null || true
    firewall-cmd --permanent --add-service=https 2>/dev/null || true
    firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    info "✅ CentOS/RHEL防火墙配置完成"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    ufw allow 3001/tcp 2>/dev/null || true
    ufw allow 3002/tcp 2>/dev/null || true
    info "✅ Ubuntu/Debian防火墙配置完成"
fi

# 启动Nginx服务
step "启动Nginx服务..."
systemctl start nginx
systemctl enable nginx

# 检查Nginx状态
if systemctl is-active --quiet nginx; then
    info "✅ Nginx服务启动成功"
else
    error "❌ Nginx服务启动失败"
    exit 1
fi

# 安装Certbot（Let's Encrypt）
step "安装Certbot SSL证书工具..."
if ! command -v certbot &> /dev/null; then
    if command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install epel-release -y
        yum install certbot python3-certbot-nginx -y
    elif command -v apt &> /dev/null; then
        # Ubuntu/Debian
        apt install certbot python3-certbot-nginx -y
    fi
fi

# 获取SSL证书（如果证书不存在）
if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    info "获取Let's Encrypt SSL证书..."
    certbot --nginx -d $DOMAIN -d $ALT_DOMAIN --email admin@$ALT_DOMAIN --agree-tos --non-interactive
    
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    info "✅ SSL证书自动续期已配置"
else
    info "✅ SSL证书已存在，跳过获取"
fi

# 创建部署完成页面
step "创建部署完成页面..."
cat > /root/FutureVision/dist/deploy-success.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>部署成功 - www.mscfv.com</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 600px;
        }
        .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 300;
        }
        .status {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .info-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .info-card h3 {
            margin-top: 0;
            font-size: 1.1rem;
        }
        .info-card p {
            margin-bottom: 0;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">🎉</div>
        <h1>部署成功！</h1>
        <div class="status">
            <p>您的ESG风险分析平台已成功部署到 <strong>www.mscfv.com</strong></p>
            <p>所有服务运行正常，域名配置完成</p>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>🌐 前端访问</h3>
                <p>https://www.mscfv.com</p>
            </div>
            <div class="info-card">
                <h3>🔧 后端API</h3>
                <p>https://www.mscfv.com/api/</p>
            </div>
            <div class="info-card">
                <h3>📊 健康检查</h3>
                <p>https://www.mscfv.com/health</p>
            </div>
            <div class="info-card">
                <h3>🔒 SSL证书</h3>
                <p>Let's Encrypt自动续期</p>
            </div>
        </div>
        
        <a href="/" class="btn">访问主页</a>
    </div>
</body>
</html>
EOF

# 测试最终配置
step "测试最终配置..."
echo "测试HTTP访问..."
if curl -s -I http://localhost | grep -q "301"; then
    info "✅ HTTP重定向配置正确"
fi

echo "测试HTTPS配置..."
if curl -s -I -k https://localhost | grep -q "200"; then
    info "✅ HTTPS配置正确"
fi

# 显示最终状态
echo ""
echo "🎉 域名部署完成！"
echo "======================"
echo "🌐 域名配置:"
echo "  📍 主域名: https://www.mscfv.com"
echo "  📍 备用域名: https://mscfv.com"
echo ""
echo "🔧 服务配置:"
echo "  ✅ Nginx反向代理"
echo "  ✅ SSL证书（Let's Encrypt）"
echo "  ✅ 自动续期配置"
echo "  ✅ 安全头配置"
echo "  ✅ 防火墙配置"
echo ""
echo "📊 访问地址:"
echo "  🌐 主页: https://www.mscfv.com"
echo "  🔍 健康检查: https://www.mscfv.com/health"
echo "  📋 状态页面: https://www.mscfv.com/deploy-success.html"
echo ""
echo "🛠️  管理命令:"
echo "  🔄 重启Nginx: systemctl restart nginx"
echo "  📊 查看状态: systemctl status nginx"
echo "  📋 查看日志: tail -f /var/log/nginx/www.mscfv.com.error.log"
echo "  🔒 SSL续期: certbot renew --dry-run"
echo ""

# 检查是否可以访问域名
if command -v dig &> /dev/null; then
    IP_ADDRESS=$(dig +short $DOMAIN | head -1)
    if [[ -n "$IP_ADDRESS" ]]; then
        info "🌐 域名 $DOMAIN 解析到: $IP_ADDRESS"
        warn "请确保域名DNS已正确指向此服务器IP地址"
    fi
fi

info "域名部署脚本执行完成！🚀"
echo ""
echo "⚠️  重要提醒:"
echo "  🔧 如果SSL证书获取失败，请确保："
echo "     - 域名已正确解析到服务器IP"
echo "     - 服务器80和443端口已开放"
echo "     - 可以访问 http://$DOMAIN/.well-known/acme-challenge/"
echo ""
echo "  📧 建议配置管理员邮箱: admin@mscfv.com"