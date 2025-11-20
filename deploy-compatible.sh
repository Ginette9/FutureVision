#!/bin/bash

# ESG风险分析平台部署脚本 - 适配Node.js v16.20.2
# 适用于阿里云服务器 Ubuntu/CentOS

set -e

echo "🚀 开始部署ESG风险分析平台..."
echo "📋 当前Node.js版本: $(node -v)"

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  建议不要使用root用户运行此脚本"
   exit 1
fi

# 安装NVM（Node Version Manager）
echo "📦 安装NVM（Node Version Manager）..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# 加载NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装并使用Node.js 18.x（推荐版本）
echo "🔧 安装Node.js 18.x..."
nvm install 18
nvm use 18
nvm alias default 18

echo "✅ Node.js版本已更新为: $(node -v)"

# 安装系统依赖
echo "📦 安装系统依赖..."
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y curl wget git nginx build-essential python3 python3-pip
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum update -y
    sudo yum install -y curl wget git nginx gcc-c++ make python3 python3-pip
else
    echo "❌ 不支持的操作系统"
    exit 1
fi

# 安装PM2
echo "🔧 安装PM2进程管理器..."
npm install -g pm2@latest

# 创建必要的目录
mkdir -p logs
mkdir -p dist/static

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ package.json文件不存在，请确保在项目根目录运行此脚本"
    exit 1
fi

# 安装项目依赖
echo "📋 安装项目依赖..."
npm install --production=false

# 构建前端（使用兼容模式）
echo "🏗️  构建前端应用..."
npm run build:client || {
    echo "⚠️  标准构建失败，尝试兼容模式..."
    # 如果标准构建失败，尝试直接构建
    npx vite build --outDir dist/static
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

# 启动应用
echo "🚀 启动应用..."
# 停止现有的PM2进程
pm2 stop esg-risk-analysis 2>/dev/null || true
pm2 delete esg-risk-analysis 2>/dev/null || true

# 使用Node.js直接启动（不依赖PM2配置）
pm2 start server.js --name esg-risk-analysis --env production --node-args="--max-old-space-size=4096" || {
    echo "⚠️  PM2启动失败，尝试直接启动..."
    NODE_ENV=production PORT=3001 node server.js &
    echo $! > server.pid
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
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常"
    exit 0
else
    echo "❌ 应用无响应"
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
echo "✅ 重启完成"
EOF
chmod +x restart.sh

echo ""
echo "✅ 部署完成！"
echo "📊 应用已启动，请访问: http://your-domain.com 或 http://服务器IP"
echo "🔍 查看日志: pm2 logs esg-risk-analysis"
echo "📈 查看状态: pm2 status"
echo "🔄 重启应用: ./restart.sh"
echo "🏥 健康检查: ./health-check.sh"
echo ""
echo "⚠️  重要提醒："
echo "   1. 请修改nginx.conf中的your-domain.com为你的实际域名"
echo "   2. 如果使用HTTPS，请配置SSL证书"
echo "   3. 确保服务器安全组开放80和443端口"
echo "   4. 生产环境请配置正确的环境变量"