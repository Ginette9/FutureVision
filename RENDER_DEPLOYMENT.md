# Render 部署指南

## 项目概述
这是一个React + Express的全栈应用，包含ESG风险评估功能和支付系统。

## 部署方式选择

### 方式1：单服务部署（推荐）
将前后端部署到同一个Node.js服务中，通过Express提供静态文件服务。

### 方式2：分离部署
前端部署为静态站点，后端部署为Web服务。

## 部署步骤

### 1. 准备代码
确保你的代码已经推送到GitHub仓库。

### 2. 在Render上创建新服务

#### 选择 "Web Service"
- **Name**: `risk-analysis-app`
- **Environment**: `Node`
- **Region**: 选择离你最近的地区
- **Branch**: `main` 或你的主分支
- **Root Directory**: 留空（如果代码在根目录）

#### 构建配置
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**注意**: 我们使用npm而不是pnpm来避免部署时的包管理器冲突。

### 3. 环境变量配置
在Render控制台中设置以下环境变量：

```
NODE_ENV=production
PORT=10000
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
FRONTEND_URL=https://your-app-name.onrender.com
PAY_INVITE_CODES=FREE2025,TESTVIP,MSCFV
```

### 4. 自动部署
- 启用自动部署
- 每次推送到主分支时自动重新部署

## 部署后配置

### 1. 域名设置
- 在Render控制台中可以设置自定义域名
- 或者使用Render提供的 `.onrender.com` 域名

### 2. 健康检查
应用包含 `/health` 端点用于健康检查。

### 3. 支付配置
确保PayPal和Stripe的配置正确，特别是回调URL。

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本兼容性
   - 确保所有依赖都已安装

2. **静态文件404**
   - 检查构建输出目录
   - 确认Express静态文件中间件配置

3. **支付回调失败**
   - 检查环境变量配置
   - 确认回调URL设置正确

### 日志查看
在Render控制台的"Logs"标签页查看应用日志。

## 性能优化

1. **启用缓存**
   - 静态资源缓存
   - API响应缓存

2. **CDN配置**
   - 考虑使用Cloudflare等CDN服务

3. **数据库优化**
   - 如果后续添加数据库，考虑使用Render的PostgreSQL服务

## 监控和维护

1. **健康检查**
   - 定期检查 `/health` 端点
   - 设置监控告警

2. **日志分析**
   - 定期查看错误日志
   - 监控性能指标

3. **安全更新**
   - 定期更新依赖包
   - 监控安全漏洞
