#!/bin/bash

# ESG风险分析平台 - Node.js v16.20.2 兼容部署脚本
# 解决pnpm版本兼容性问题

set -e

echo "🚀 开始Node.js v16.20.2兼容部署..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   warn "当前以root用户运行，建议创建专用用户运行应用"
fi

# 检查Node.js版本
NODE_VERSION=$(node -v)
echo "📋 当前Node.js版本: $NODE_VERSION"

if [[ "$NODE_VERSION" != "v16.20.2" ]]; then
    warn "当前Node.js版本不是v16.20.2，可能存在兼容性问题"
fi

# 获取项目目录
PROJECT_DIR="${1:-$(pwd)}"
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
info "停止现有服务..."
pkill -f "node server.js" || true
pkill -f "python3 -m http.server" || true

# 等待端口释放
sleep 2

# 清理之前的构建
info "清理之前的构建..."
rm -rf dist
rm -rf build

# 安装依赖（使用npm避免pnpm兼容性问题）
info "安装依赖（使用npm）..."
npm install --legacy-peer-deps

# 手动执行构建步骤
info "执行手动构建..."

# 1. 创建dist目录
mkdir -p dist/static

# 2. 使用Vite直接构建
info "使用Vite构建前端..."
npx vite build --outDir dist/static

# 3. 复制必要的文件
info "复制必要文件..."
cp package.json dist/
cp public/csr_database.db dist/static/ 2>/dev/null || warn "csr_database.db 未找到，跳过"

# 4. 创建构建标志文件
touch dist/build.flag

# 5. 检查构建结果
if [[ -f "dist/static/index.html" ]]; then
    info "✅ 前端构建成功"
else
    error "❌ 前端构建失败"
    exit 1
fi

# 启动后端服务器
info "启动后端服务器 (端口: 3002)..."
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
cd dist
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

# 显示状态信息
echo ""
echo "🎉 Node.js v16.20.2 兼容部署完成！"
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

info "Node.js v16.20.2 兼容部署脚本执行完成！"
echo ""
echo "🚀 您的ESG风险分析平台已成功部署！"
echo "   前端访问: http://您的服务器IP:3001"
echo "   后端API: http://您的服务器IP:3002/api/"