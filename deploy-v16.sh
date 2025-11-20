#!/bin/bash
# deploy-v16-fixed.sh
# 基于成功配置修改的部署脚本，避免与现有配置冲突

set -euo pipefail
IFS=$'\n\t'

# ---------------------------
# 用户可修改的变量 - 使用不同的配置避免冲突
# ---------------------------
PROJECT_DIR="${1:-/opt/futureVision/FutureVision}"
DOMAIN="${2:-www.mscfv.com}"
BACKEND_PORT="${BACKEND_PORT:-3002}"
# 使用不同的静态文件目录和配置文件名
NGINX_SITE_ROOT="/var/www/futurevision"  # 改为不同的目录
NGINX_CONF="/etc/nginx/conf.d/futurevision_${DOMAIN}.conf"  # 改为不同的配置文件名
EMAIL_FOR_LETSENCRYPT="${EMAIL_FOR_LETSENCRYPT:-admin@${DOMAIN}}"
# ---------------------------

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

info(){ echo -e "${GREEN}[INFO]${NC} $*"; }
warn(){ echo -e "${YELLOW}[WARN]${NC} $*"; }
err(){ echo -e "${RED}[ERROR]${NC} $*"; }

# 检查 root
if [[ $(id -u) -ne 0 ]]; then
  err "请以 root 用户运行脚本 (sudo)。"
  exit 1
fi

info "项目目录: $PROJECT_DIR"
info "域名: $DOMAIN"
info "后端端口: $BACKEND_PORT"
info "nginx 静态根: $NGINX_SITE_ROOT"

# 检查项目存在性
if [[ ! -d "$PROJECT_DIR" ]]; then
  err "项目目录不存在: $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

# 1. 停止并清理现有冲突服务
info "停止现有冲突服务..."
pkill -f "node server.js" || true
sudo pkill -f "python3 -m http.server" || true
sleep 2

# 清理之前的构建
info "清理旧构建..."
rm -rf dist build || true
mkdir -p dist/static

# 2. 构建前端
info "安装依赖并构建前端..."
npm install --legacy-peer-deps
npx vite build --outDir dist/static

# 复制必要文件
info "复制必要文件..."
cp -f package.json dist/ 2>/dev/null || true
cp -f public/csr_database.db dist/static/ 2>/dev/null || warn "public/csr_database.db 未找到，跳过"
touch dist/build.flag

# 3. 启动后端
info "以后台进程方式启动后端 (PORT=$BACKEND_PORT)..."
PORT=$BACKEND_PORT nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_DIR/backend.pid"
info "后端 PID: $BACKEND_PID"

# 等待并检查后端健康
sleep 5
if curl -s "http://127.0.0.1:${BACKEND_PORT}/api/insights" >/dev/null 2>&1; then
  info "✅ 后端启动成功并响应健康检测"
else
  warn "⚠️ 后端健康接口返回异常，请检查 $PROJECT_DIR/backend.log"
fi

# 4. 准备 nginx 静态目录并复制前端构建产物
info "准备 nginx 静态目录: $NGINX_SITE_ROOT"
mkdir -p "$NGINX_SITE_ROOT"
rsync -a --delete "$PROJECT_DIR/dist/static/" "$NGINX_SITE_ROOT/"

# 5. 安装 nginx（若未安装）
if ! command -v nginx >/dev/null 2>&1; then
  info "安装 nginx..."
  yum install -y epel-release || true
  yum install -y nginx
fi

# 6. 检查并停止冲突的Nginx配置
info "检查现有Nginx配置..."
if [[ -f "/etc/nginx/conf.d/mscfv.conf" ]]; then
  warn "发现冲突配置 mscfv.conf，将其备份..."
  sudo mv /etc/nginx/conf.d/mscfv.conf /etc/nginx/conf.d/mscfv.conf.backup
fi

# 7. 写 nginx 配置文件（使用与成功配置相同的结构）
info "写入 nginx 配置: $NGINX_CONF"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${NGINX_SITE_ROOT};
    index index.html;

    # 静态资源
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 访问日志与错误日志
    access_log /var/log/nginx/futurevision_${DOMAIN}_access.log;
    error_log /var/log/nginx/futurevision_${DOMAIN}_error.log;
}

# 重定向非www到www（如果需要）
server {
    listen 80;
    server_name mscfv.com;
    return 301 http://${DOMAIN}\$request_uri;
}
EOF

# 8. 测试并重启 nginx
info "测试Nginx配置..."
if sudo nginx -t; then
  info "✅ Nginx配置测试通过"
else
  err "❌ Nginx配置测试失败"
  exit 1
fi

info "启动/重载 nginx..."
systemctl enable nginx || true
systemctl restart nginx

# 9. 检查服务状态
info "检查服务状态..."
sleep 3

if systemctl is-active nginx >/dev/null 2>&1; then
  info "✅ Nginx服务运行正常"
else
  err "❌ Nginx服务启动失败"
  exit 1
fi

# 10. 配置SSL证书（使用与成功配置相同的证书路径）
info "检查SSL证书配置..."
if [[ -f "/home/cert/mscfv.com.pem" && -f "/home/cert/mscfv.com.key" ]]; then
  info "发现现有SSL证书，配置HTTPS..."
  
  # 创建HTTPS配置
  cat >> "$NGINX_CONF" <<EOF

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate      /home/cert/mscfv.com.pem;
    ssl_certificate_key  /home/cert/mscfv.com.key;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    root ${NGINX_SITE_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ${DOMAIN} mscfv.com;
    return 301 https://${DOMAIN}\$request_uri;
}
EOF
  
  # 重新加载Nginx配置
  sudo nginx -t && sudo nginx -s reload
  info "✅ HTTPS配置完成"
else
  warn "未找到SSL证书文件，跳过HTTPS配置"
  info "如需HTTPS，请确保证书文件存在: /home/cert/mscfv.com.pem 和 /home/cert/mscfv.com.key"
fi

# 11. 防火墙配置
if command -v firewall-cmd >/dev/null 2>&1; then
  info "配置防火墙..."
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --permanent --add-service=https || true
  firewall-cmd --reload || true
  info "✅ 防火墙配置完成"
fi

# 12. 最终验证
info "进行最终验证..."
sleep 2

echo "测试HTTP访问:"
if curl -s -I "http://${DOMAIN}" | head -1 | grep -q "200"; then
  info "✅ HTTP访问正常"
else
  warn "⚠️ HTTP访问异常"
fi

echo "测试API访问:"
if curl -s "http://127.0.0.1:${BACKEND_PORT}/api/insights" >/dev/null; then
  info "✅ API访问正常"
else
  warn "⚠️ API访问异常"
fi

if [[ -f "/home/cert/mscfv.com.pem" ]]; then
  echo "测试HTTPS访问:"
  if curl -s -k -I "https://${DOMAIN}" | head -1 | grep -q "200"; then
    info "✅ HTTPS访问正常"
  else
    warn "⚠️ HTTPS访问异常"
  fi
fi

# 13. 显示部署结果
echo ""
echo "🎉 ESG风险分析平台部署完成！"
echo "========================"
echo "🌐 访问地址:"
echo "  HTTP:  http://${DOMAIN}"
if [[ -f "/home/cert/mscfv.com.pem" ]]; then
  echo "  HTTPS: https://${DOMAIN} (推荐)"
fi
echo ""
echo "📊 服务信息:"
echo "  📁 项目目录: $PROJECT_DIR"
echo "  📁 静态文件: $NGINX_SITE_ROOT"
echo "  🔧 Nginx配置: $NGINX_CONF"
echo "  🔌 后端端口: $BACKEND_PORT"
echo ""
echo "🔧 管理命令:"
echo "  📊 查看状态: systemctl status nginx"
echo "  🔄 重启Nginx: systemctl restart nginx"
echo "  📝 查看日志: tail -f $PROJECT_DIR/backend.log"
echo ""
echo "⚠️  重要提醒:"
echo "  1. 确保域名 ${DOMAIN} 已解析到服务器IP"
echo "  2. 如使用HTTPS，请确保证书文件有效"
echo "  3. 定期检查服务状态和日志"
echo "========================"

exit 0