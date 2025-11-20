#!/bin/bash
# deploy-with-domain.sh
# 将你的项目构建并通过 nginx + certbot (Let's Encrypt) 使用域名 www.mscfv.com 提供服务
# 用法: sudo ./deploy-with-domain.sh [项目目录] [域名]
# 示例: sudo ./deploy-with-domain.sh /opt/futureVision/FutureVision www.mscfv.com

set -euo pipefail
IFS=$'\n\t'

# ---------------------------
# 用户可修改的变量
# ---------------------------
PROJECT_DIR="${1:-/opt/futureVision/FutureVision}"
DOMAIN="${2:-www.mscfv.com}"
BACKEND_PORT="${BACKEND_PORT:-3002}"
NGINX_SITE_ROOT="/var/www/msc"
NGINX_CONF="/etc/nginx/conf.d/msc_${DOMAIN}.conf"
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

# 1. 构建前端（与你现有流程相同）
info "清理旧构建..."
rm -rf dist build || true
mkdir -p dist/static

info "安装依赖并构建前端（npm）..."
# 如果你要用 pnpm，请改成 pnpm install && pnpm build
npm install --legacy-peer-deps
npx vite build --outDir dist/static

# 复制必要文件
info "复制 package.json 等到 dist..."
cp -f package.json dist/ 2>/dev/null || true
cp -f public/csr_database.db dist/static/ 2>/dev/null || warn "public/csr_database.db 未找到，跳过"

# 2. 启动后端（或重启）
info "停止已有后端进程（如果有）..."
pkill -f "node server.js" || true
sleep 1

info "以后台进程方式启动后端 (PORT=$BACKEND_PORT)..."
PORT=$BACKEND_PORT nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_DIR/backend.pid"
info "后端 PID: $BACKEND_PID"

# 等待短暂时间并检查后端健康接口
sleep 3
if ! curl -s "http://127.0.0.1:${BACKEND_PORT}/api/insights" >/dev/null 2>&1; then
  warn "后端健康接口返回异常，请检查 $PROJECT_DIR/backend.log"
else
  info "后端启动并响应健康检测。"
fi

# 3. 准备 nginx 静态目录并复制前端构建产物
info "准备 nginx 静态目录: $NGINX_SITE_ROOT"
mkdir -p "$NGINX_SITE_ROOT"
rsync -a --delete "$PROJECT_DIR/dist/static/" "$NGINX_SITE_ROOT/"

# 4. 安装 nginx（若未安装）
if ! command -v nginx >/dev/null 2>&1; then
  info "安装 nginx..."
  yum install -y epel-release || true
  yum install -y nginx
fi

# 5. 检查 80/443 是否被占用
if ss -tulpn | egrep -q ':80\b'; then
  warn "检测到端口 80 已被占用，证书申请或 nginx 启动可能失败。占用程序:"
  ss -tulpn | egrep ':80\b'
fi
if ss -tulpn | egrep -q ':443\b'; then
  warn "检测到端口 443 已被占用，证书申请或 nginx 启动可能失败。占用程序:"
  ss -tulpn | egrep ':443\b'
fi

# 6. 写 nginx 配置文件（HTTP -> 后端 API 路由 + 静态文件）
info "写入 nginx 配置: $NGINX_CONF"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${NGINX_SITE_ROOT};
    index index.html;

    ssl_certificate      /home/cert/mscfv.com.pem;
    ssl_certificate_key  /home/cert/mscfv.com.key;

    # 静态资源
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理到后端 (保持路径)
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 可选：把 websockets 或其他端点代理
    location /socket.io/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    # 访问日志与错误日志（路径可自定义）
    access_log /var/log/nginx/msc_${DOMAIN}_access.log;
    error_log /var/log/nginx/msc_${DOMAIN}_error.log;
}
EOF

# 7. 启动或重载 nginx
info "启动/重载 nginx..."
systemctl enable nginx || true
systemctl restart nginx

# 8. 检查 DNS 是否解析到本机 IP，若未解析提前提示
MY_IP=$(curl -s http://ipinfo.io/ip || curl -s http://ifconfig.me || echo "unknown")
RESOLVED_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' || true)
info "本机公网 IP: $MY_IP"
info "$DOMAIN 解析到: $RESOLVED_IP"
if [[ -z "$RESOLVED_IP" ]] || [[ "$RESOLVED_IP" == "" ]]; then
  warn "警告: DNS 未解析到任何 IP。请在你的 DNS 控制面板将 $DOMAIN 的 A 记录指向本机 IP ($MY_IP)。证书申请需要域名可解析。"
fi

# 9. 安装 certbot（若服务器可访问外网）并申请证书
if command -v certbot >/dev/null 2>&1; then
  info "certbot 已安装，尝试申请/更新证书..."
else
  info "安装 certbot..."
  yum install -y epel-release || true
  yum install -y certbot python2-certbot-nginx || yum install -y certbot python3-certbot-nginx || true
fi

# 申请证书（如果可用）
if command -v certbot >/dev/null 2>&1 && [[ -n "$RESOLVED_IP" ]]; then
  info "尝试使用 certbot 为 $DOMAIN 申请/更新 TLS 证书..."
  # --non-interactive 需要邮箱并同意服务条款
  certbot --nginx -d "${DOMAIN}" --agree-tos --email "${EMAIL_FOR_LETSENCRYPT}" --redirect --non-interactive || {
    warn "certbot 申请证书失败（可能是 DNS/网络/80 端口问题）。跳过自动证书。"
  }
else
  warn "跳过 certbot：certbot 未安装或域名未解析到本机 IP。"
fi

# 10. 防火墙开放 80/443（CentOS7）
if command -v firewall-cmd >/dev/null 2>&1; then
  info "开放 80/443 端口（firewalld）..."
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --permanent --add-service=https || true
  firewall-cmd --reload || true
fi

# 11. 完成与状态检查
info "部署完成，检查服务状态..."
systemctl status nginx --no-pager -l || true

info "访问测试信息："
info "  前端 (HTTP) : http://${DOMAIN}/"
info "  后端 API    : http://${DOMAIN}/api/ (由 nginx 代理到 localhost:${BACKEND_PORT})"
if command -v certbot >/dev/null 2>&1; then
  info "  若证书成功：HTTPS 可用 https://${DOMAIN}/"
else
  warn "证书未安装 / 未成功，HTTPS 可能不可用。若需要，请确保 DNS 正确并端口 80/443 可达，然后手动运行 certbot。"
fi

echo ""
info "日志文件："
info "  nginx access: /var/log/nginx/msc_${DOMAIN}_access.log"
info "  nginx error : /var/log/nginx/msc_${DOMAIN}_error.log"
info "  backend log  : $PROJECT_DIR/backend.log"
info "  frontend dir : $NGINX_SITE_ROOT (静态文件)"

info "如果你需要把服务设置为 systemd 服务以便开机启动，请告诉我，我可以为你生成 systemd unit 文件。"

exit 0
