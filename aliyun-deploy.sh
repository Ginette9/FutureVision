#!/bin/bash

# ESG风险分析平台 - 阿里云服务器一键部署脚本
# 兼容 Node.js v16.20.2

set -e

echo "🚀 开始部署ESG风险分析平台到阿里云服务器..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   warn "当前以root用户运行，建议创建专用用户运行应用"
fi

# 检查Node.js版本
info "检查Node.js版本..."
NODE_VERSION=$(node -v 2>/dev/null || echo "未安装")
echo "📋 当前Node.js版本: $NODE_VERSION"

if [[ "$NODE_VERSION" == "未安装" ]]; then
    error "Node.js未安装，请先安装Node.js v16.20.2"
    exit 1
fi

# 检查必要的命令
info "检查必要的命令..."
for cmd in npm python3; do
    if ! command -v $cmd &> /dev/null; then
        error "$cmd 未安装，请先安装"
        exit 1
    fi
done

# 获取项目目录
PROJECT_DIR="${1:-$(pwd)}"
info "项目目录: $PROJECT_DIR"

# 检查项目文件
if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    error "在项目目录中未找到package.json文件"
    exit 1
fi

if [[ ! -f "$PROJECT_DIR/server.js" ]]; then
    error "在项目目录中未找到server.js文件"
    exit 1
fi

# 安装依赖
info "安装项目依赖..."
cd "$PROJECT_DIR"
npm install --legacy-peer-deps

# 构建项目
info "构建项目..."
npm run build

# 检查构建结果
if [[ ! -d "$PROJECT_DIR/dist" ]]; then
    error "构建失败，未找到dist目录"
    exit 1
fi

# 停止现有服务
info "停止现有服务..."
pkill -f "node server.js" || true
pkill -f "python3 -m http.server" || true

# 等待端口释放
sleep 2

# 启动后端服务器
info "启动后端服务器 (端口: 3002)..."
cd "$PROJECT_DIR"
PORT=3002 nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务器PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if ! curl -s http://localhost:3002/api/insights > /dev/null; then
    error "后端服务器启动失败，请检查backend.log"
    exit 1
fi
info "后端服务器启动成功"

# 启动前端服务器
info "启动前端服务器 (端口: 3001)..."
cd "$PROJECT_DIR/dist"
nohup python3 -m http.server 3001 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务器PID: $FRONTEND_PID"

# 等待前端启动
sleep 2

# 检查前端是否启动成功
if ! curl -s -I http://localhost:3001 | grep -q "200"; then
    error "前端服务器启动失败，请检查dist/frontend.log"
    exit 1
fi
info "前端服务器启动成功"

# 保存PID到文件
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

# 创建systemd服务（可选）
info "创建systemd服务..."
cat > /etc/systemd/system/futurevision.service << EOF
[Unit]
Description=FutureVision ESG Platform
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/bin/bash -c 'cd $PROJECT_DIR && PORT=3002 nohup node server.js > backend.log 2>&1 & echo \$! > backend.pid && cd dist && nohup python3 -m http.server 3001 > frontend.log 2>&1 & echo \$! > frontend.pid'
ExecStop=/bin/bash -c 'pkill -f "node server.js"; pkill -f "python3 -m http.server"'
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd并启用服务
systemctl daemon-reload
systemctl enable futurevision.service

# 检查防火墙
info "检查防火墙配置..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    info "防火墙端口已开放"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    ufw allow 3001/tcp 2>/dev/null || true
    ufw allow 3002/tcp 2>/dev/null || true
    info "防火墙端口已开放"
fi

# 显示状态信息
echo ""
echo "🎉 部署完成！"
echo "======================"
echo "📊 服务状态:"
echo "  ✅ 后端服务器: http://localhost:3002 (PID: $BACKEND_PID)"
echo "  ✅ 前端服务器: http://localhost:3001 (PID: $FRONTEND_PID)"
echo ""
echo "📁 日志文件:"
echo "  📝 后端日志: $PROJECT_DIR/backend.log"
echo "  📝 前端日志: $PROJECT_DIR/dist/frontend.log"
echo ""
echo "🎯 测试命令:"
echo "  🔍 测试后端: curl http://localhost:3002/api/insights"
echo "  🔍 测试前端: curl -I http://localhost:3001"
echo ""
echo "🛠️  管理命令:"
echo "  🔄 重启服务: systemctl restart futurevision"
echo "  📊 查看状态: systemctl status futurevision"
echo "  📋 查看日志: tail -f $PROJECT_DIR/backend.log"
echo ""
echo "⚠️  安全提醒:"
echo "  🔒 建议配置Nginx反向代理"
echo "  🔒 建议配置SSL证书"
echo "  🔒 建议创建专用用户运行应用"
echo ""

# 测试API
info "测试后端API..."
if curl -s http://localhost:3002/api/insights | head -1 | grep -q "items"; then
    info "✅ API测试通过"
else
    warn "⚠️  API测试未通过，请检查日志"
fi

# 测试前端
info "测试前端页面..."
if curl -s -I http://localhost:3001 | grep -q "200"; then
    info "✅ 前端测试通过"
else
    warn "⚠️  前端测试未通过，请检查日志"
fi

info "部署脚本执行完成！"