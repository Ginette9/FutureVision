#!/bin/bash

# ESG风险分析平台 - Node.js v16.20.2 兼容部署脚本（支持域名配置）
# 域名: www.mscfv.com

set -e

# 配置变量
DOMAIN="www.mscfv.com"
PROJECT_DIR="${1:-$(pwd)}"
BACKEND_PORT="3002"
FRONTEND_PORT="3001"

echo "🚀 开始部署ESG风险分析平台到域名: $DOMAIN"

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

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
   warn "建议使用root用户运行此脚本以配置Nginx"
   read -p "是否继续? (y/n): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
   fi
fi

# 检查Node.js版本
NODE_VERSION=$(node -v)
echo "📋 当前Node.js版本: $NODE_VERSION"

if [[ "$NODE_VERSION" != "v16.20.2" ]]; then
    warn "当前Node.js版本不是v16.20.2，可能存在兼容性问题"
fi

cd "$PROJECT_DIR"
info "项目目录: $PROJECT_DIR"

# 检查项目文件
if [[ ! -f "package.json" ]]; then
    error "未找到package.json文件"
    exit 1
fi

if [[ ! -f "server.js" ]]; then
    error "未找到server.js文件"
    exit 1
fi

# 停止现有服务
step "停止现有服务..."
pkill -f "node server.js" || true
pkill -f "python3 -m http.server" || true
sleep 2

# 清理之前的构建
step "清理之前的构建..."
rm -rf dist
rm -rf build

# 安装依赖
step "安装依赖..."
npm install --legacy-peer-deps

# 构建项目
step "构建前端应用..."
mkdir -p dist/static
npx vite build --outDir dist/static

# 复制必要文件
step "复制必要文件..."
cp package.json dist/
cp public/csr_database.db dist/static/ 2>/dev/null || warn "csr_database.db 未找到，跳过"
touch dist/build.flag

# 检查构建结果
if [[ -f "dist/static/index.html" ]]; then
    info "✅ 前端构建成功"
else
    error "❌ 前端构建失败"
    exit 1
fi

# 配置Nginx
step "配置Nginx反向代理..."

# 安装Nginx（如果未安装）
if ! command -v nginx &> /dev/null; then
    info "安装Nginx..."
    if command -v yum &> /dev/null; then
        yum install nginx -y
    elif command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install nginx -y
    else
        error "不支持的包管理器"
        exit 1
    fi
fi

# 创建Nginx配置文件
NGINX_CONF="/etc/nginx/conf.d/mscfv.conf"
cat > /tmp/mscfv.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # 前端静态文件服务
    location / {
        root $PROJECT_DIR/dist/static;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # API代理到后端Node.js服务
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # 静态资源缓存优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root $PROJECT_DIR/dist/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 安全设置：禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# 重定向www到非www（如果需要）
server {
    listen 80;
    server_name mscfv.com;
    return 301 http://$DOMAIN\$request_uri;
}
EOF

# 移动配置文件到Nginx目录
sudo mv /tmp/mscfv.conf $NGINX_CONF
sudo chmod 644 $NGINX_CONF

# 测试Nginx配置
step "测试Nginx配置..."
if sudo nginx -t; then
    info "✅ Nginx配置测试通过"
else
    error "❌ Nginx配置测试失败"
    exit 1
fi

# 启动后端服务
step "启动后端服务..."
cd "$PROJECT_DIR"
PORT=$BACKEND_PORT nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
info "后端服务PID: $BACKEND_PID"

# 等待后端启动
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:$BACKEND_PORT/api/insights > /dev/null; then
    info "✅ 后端服务启动成功"
else
    error "❌ 后端服务启动失败，请检查backend.log"
    exit 1
fi

# 重启Nginx
step "重启Nginx服务..."
if sudo systemctl restart nginx; then
    info "✅ Nginx重启成功"
else
    # 如果systemctl失败，尝试直接重启
    sudo pkill nginx || true
    sleep 2
    sudo nginx
    info "✅ Nginx启动成功"
fi

# 启用Nginx开机自启
sudo systemctl enable nginx 2>/dev/null || true

# 配置防火墙
step "配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    info "✅ 防火墙配置完成"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw reload
    info "✅ 防火墙配置完成"
fi

# 创建管理脚本
step "创建管理脚本..."

# 重启脚本
cat > restart-app.sh << 'EOF'
#!/bin/bash
DOMAIN="www.mscfv.com"
PROJECT_DIR="$(cd "$(dirname "$0")"; pwd)"
BACKEND_PORT="3002"

echo "🔄 重启ESG风险分析平台..."

# 停止后端服务
pkill -f "node server.js" || true
sleep 2

# 启动后端服务
cd "$PROJECT_DIR"
PORT=$BACKEND_PORT nohup node server.js > backend.log 2>&1 &
echo $! > backend.pid

# 重启Nginx
sudo systemctl restart nginx 2>/dev/null || sudo nginx -s reload

echo "✅ 重启完成"
echo "🌐 访问地址: http://$DOMAIN"
EOF

# 停止脚本
cat > stop-app.sh << 'EOF'
#!/bin/bash
echo "🛑 停止ESG风险分析平台..."
pkill -f "node server.js" || true
rm -f backend.pid
echo "✅ 已停止"
EOF

# 状态检查脚本
cat > status-app.sh << 'EOF'
#!/bin/bash
DOMAIN="www.mscfv.com"
PROJECT_DIR="$(cd "$(dirname "$0")"; pwd)"

echo "📊 ESG风险分析平台状态检查"

# 检查后端服务
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ 后端服务: 运行中"
else
    echo "❌ 后端服务: 未运行"
fi

# 检查Nginx
if pgrep nginx > /dev/null; then
    echo "✅ Nginx服务: 运行中"
else
    echo "❌ Nginx服务: 未运行"
fi

# 测试API
if curl -s http://localhost:3002/api/insights > /dev/null; then
    echo "✅ API接口: 正常"
else
    echo "❌ API接口: 异常"
fi

echo ""
echo "🌐 访问地址: http://$DOMAIN"
echo "📝 后端日志: $PROJECT_DIR/backend.log"
EOF

chmod +x restart-app.sh stop-app.sh status-app.sh

# 显示部署结果
echo ""
echo "🎉 ESG风险分析平台部署完成！"
echo "========================"
echo "🌐 访问地址: http://$DOMAIN"
echo ""
echo "📊 服务状态:"
echo "  ✅ 后端服务: http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
echo "  ✅ Nginx代理: 已配置到 $DOMAIN"
echo ""
echo "🔧 管理命令:"
echo "  📊 查看状态: ./status-app.sh"
echo "  🔄 重启应用: ./restart-app.sh"
echo "  🛑 停止应用: ./stop-app.sh"
echo "  📝 查看日志: tail -f backend.log"
echo ""
echo "⚙️  配置信息:"
echo "  📁 项目目录: $PROJECT_DIR"
echo "  🌐 域名: $DOMAIN"
echo "  🔧 Nginx配置: $NGINX_CONF"
echo ""
echo "⚠️  重要提醒:"
echo "  1. 确保域名 $DOMAIN 已解析到服务器IP"
echo "  2. 如需HTTPS，请配置SSL证书"
echo "  3. 定期检查日志文件"
echo "  4. 建议设置监控和备份"
echo "========================"

# 最终测试
step "进行最终测试..."
if curl -s -I http://localhost > /dev/null; then
    info "✅ Nginx服务测试通过"
else
    warn "⚠️  Nginx服务测试异常"
fi

if curl -s http://localhost:$BACKEND_PORT/api/insights > /dev/null; then
    info "✅ 后端API测试通过"
else
    warn "⚠️  后端API测试异常"
fi

echo ""
info "部署脚本执行完成！"
echo "🚀 请访问: http://$DOMAIN"