#!/bin/bash

# ESG风险分析平台快速部署脚本 - Node.js v16.20.2兼容版
# 适用于阿里云服务器

set -e

echo "🚀 开始部署ESG风险分析平台..."
echo "📋 当前Node.js版本: $(node -v)"

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js版本过低，需要v16或更高版本"
    exit 1
fi

echo "✅ Node.js版本兼容"

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  建议不要使用root用户运行此脚本"
   exit 1
fi

# 安装系统依赖
echo "📦 安装系统依赖..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y curl wget git nginx build-essential
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum update -y
    sudo yum install -y curl wget git nginx gcc-c++ make
else
    echo "❌ 不支持的操作系统"
    exit 1
fi

# 安装PM2（兼容版本）
echo "🔧 安装PM2进程管理器..."
npm install -g pm2@5.3.0

# 创建必要的目录
mkdir -p logs
mkdir -p dist/static

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ package.json文件不存在，请确保在项目根目录运行此脚本"
    exit 1
fi

# 安装项目依赖（兼容模式）
echo "📋 安装项目依赖..."
# 使用npm而不是pnpm，因为pnpm可能在旧版本Node.js上不稳定
npm install --legacy-peer-deps

# 构建前端（v16兼容模式）
echo "🏗️  构建前端应用..."
npm run build:client || {
    echo "⚠️  标准构建失败，尝试v16兼容模式..."
    # 设置Node.js选项以兼容旧版本
    export NODE_OPTIONS="--max-old-space-size=2048"
    npx vite build --outDir dist/static --mode production
}

# 复制必要的文件到dist目录
echo "📁 复制静态文件..."
if [ -f "public/csr_database.db" ]; then
    cp public/csr_database.db dist/static/
fi

# 复制package.json到dist目录
cp package.json dist/

# 创建构建标记文件
touch dist/build.flag

# 配置Nginx
echo "⚙️  配置Nginx..."
if [ -f "nginx.conf" ]; then
    # 获取服务器IP地址
    SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
    
    # 替换nginx.conf中的域名
    sed -i "s/your-domain.com/$SERVER_IP/g" nginx.conf
    
    sudo cp nginx.conf /etc/nginx/sites-available/esg-risk-analysis 2>/dev/null || {
        echo "⚠️  无法复制Nginx配置文件，请手动配置"
    }
    
    # 尝试创建符号链接
    sudo ln -sf /etc/nginx/sites-available/esg-risk-analysis /etc/nginx/sites-enabled/ 2>/dev/null || {
        echo "⚠️  无法创建Nginx配置链接，请手动创建"
    }
    
    # 测试Nginx配置
    sudo nginx -t || {
        echo "⚠️  Nginx配置测试失败，请检查配置文件"
    }
    
    # 重启Nginx
    sudo systemctl restart nginx || sudo service nginx restart || {
        echo "⚠️  无法重启Nginx，请手动重启"
    }
    
    sudo systemctl enable nginx || {
        echo "⚠️  无法设置Nginx开机启动"
    }
fi

# 创建环境变量文件
cat > .env.production <<EOF
# 生产环境配置
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost

# 使用测试环境的支付配置（生产环境请替换为真实配置）
PAYPAL_CLIENT_ID=ATa7aOyOq563ZXbeAEue2Sz3sl39hWEtt-OpOVY7gux7yn8aqxCgG-s0WEzECL0GMPg7OwJkjZfKgk73
PAYPAL_CLIENT_SECRET=EKTCT8AM2szr9Nn4Zu9bVVu9wwawBSUVve42MwXnl1VtMTTlOIpJlm707E4kAqexw5pGMu-YZ3ydCwwu
PAYPAL_MODE=sandbox

# Stripe测试配置
STRIPE_SECRET_KEY=sk_test_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_test_key

# 邀请码配置
PAY_INVITE_CODES=FREE2025,TESTVIP,MSCFV
EOF

# 启动应用
echo "🚀 启动应用..."
# 停止现有的PM2进程
pm2 stop esg-risk-analysis 2>/dev/null || true
pm2 delete esg-risk-analysis 2>/dev/null || true

# 使用生产环境配置启动
NODE_ENV=production pm2 start server.js --name esg-risk-analysis --env production --node-args="--max-old-space-size=2048" || {
    echo "⚠️  PM2启动失败，尝试直接启动..."
    NODE_ENV=production PORT=3001 node server.js &
    echo $! > server.pid
    echo "✅ 应用已直接启动，PID: $(cat server.pid)"
}

# 保存PM2配置
pm2 save || true
pm2 startup || true

# 创建系统服务（备用方案）
echo "🔧 创建系统服务..."
sudo tee /etc/systemd/system/esg-risk-analysis.service > /dev/null <<EOF
[Unit]
Description=ESG Risk Analysis Platform
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=NODE_OPTIONS=--max-old-space-size=2048

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable esg-risk-analysis

# 设置防火墙（如果启用）
if command -v ufw &> /dev/null; then
    echo "🔥 配置防火墙..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 3001/tcp
fi

# 创建健康检查脚本
cat > health-check.sh <<'EOF'
#!/bin/bash
# 健康检查脚本
echo "🏥 检查应用健康状态..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常"
    exit 0
else
    echo "❌ 应用无响应"
    echo "📋 查看日志:"
    pm2 logs esg-risk-analysis --lines 10 || echo "无法获取PM2日志"
    exit 1
fi
EOF
chmod +x health-check.sh

# 创建重启脚本
cat > restart.sh <<'EOF'
#!/bin/bash
# 重启脚本
echo "🔄 重启应用..."
pm2 restart esg-risk-analysis || sudo systemctl restart esg-risk-analysis
echo "⏳ 等待3秒让应用启动..."
sleep 3
./health-check.sh
EOF
chmod +x restart.sh

# 创建停止脚本
cat > stop.sh <<'EOF'
#!/bin/bash
# 停止脚本
echo "🛑 停止应用..."
pm2 stop esg-risk-analysis || sudo systemctl stop esg-risk-analysis
if [ -f "server.pid" ]; then
    kill $(cat server.pid) 2>/dev/null || true
    rm -f server.pid
fi
echo "✅ 应用已停止"
EOF
chmod +x stop.sh

echo ""
echo "✅ 部署完成！"
echo "📊 应用已启动，请访问: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo "localhost")"
echo "🔍 查看日志: pm2 logs esg-risk-analysis"
echo "📈 查看状态: pm2 status"
echo "🔄 重启应用: ./restart.sh"
echo "🛑 停止应用: ./stop.sh"
echo "🏥 健康检查: ./health-check.sh"
echo ""
echo "⚠️  重要提醒："
echo "   1. 确保服务器安全组开放80端口"
echo "   2. 生产环境请配置真实的支付API密钥"
echo "   3. 建议配置HTTPS证书"
echo "   4. 定期备份数据文件"
echo "   5. 监控服务器资源使用情况"