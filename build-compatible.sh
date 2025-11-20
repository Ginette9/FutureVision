#!/bin/bash

# ESG风险分析平台 - Node.js v16.20.2 兼容构建脚本
# 解决pnpm版本兼容性问题

set -e

echo "🔧 开始Node.js v16.20.2兼容构建..."

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

# 清理之前的构建
info "清理之前的构建..."
rm -rf dist
rm -rf build

# 检查是否使用pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    info "当前pnpm版本: $PNPM_VERSION"
    
    # 检查pnpm版本是否兼容Node.js v16.20.2
    if [[ "$PNPM_VERSION" > "8.0.0" ]]; then
        warn "当前pnpm版本过高，需要降级到兼容v16.20.2的版本"
        npm uninstall -g pnpm
        npm install -g pnpm@7.33.6  # 兼容Node.js v16的最后一个版本
    fi
fi

# 安装依赖（使用npm作为后备）
info "安装依赖..."
if command -v pnpm &> /dev/null && [[ "$(pnpm -v)" < "8.0.0" ]]; then
    info "使用pnpm安装依赖..."
    pnpm install --no-frozen-lockfile
else
    info "使用npm安装依赖..."
    npm install --legacy-peer-deps
fi

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

# 6. 检查数据库文件
if [[ -f "dist/static/csr_database.db" ]]; then
    info "✅ 数据库文件已复制"
else
    warn "⚠️  数据库文件未找到，可能需要手动复制"
fi

# 7. 显示构建结果
info "构建完成！文件结构:"
ls -la dist/
ls -la dist/static/ | head -10

# 8. 测试构建结果
info "测试构建结果..."
if [[ -f "dist/static/index.html" ]]; then
    info "✅ index.html 存在"
else
    error "❌ index.html 不存在"
    exit 1
fi

# 9. 可选：创建简单的HTTP服务器测试
info "构建文件大小统计:"
du -sh dist/

info "✅ Node.js v16.20.2 兼容构建完成！"
echo ""
echo "🎯 构建结果:"
echo "  📁 构建目录: $PROJECT_DIR/dist"
echo "  🌐 入口文件: dist/static/index.html"
echo "  💾 数据库: dist/static/csr_database.db"
echo ""
echo "🚀 下一步: 运行部署脚本 aliyun-deploy.sh"