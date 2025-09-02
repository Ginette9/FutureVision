# 国际支付系统说明

## 概述
本项目已更新为支持国际通用支付方式，包括PayPal、信用卡和银行转账等。

## 支持的支付方式

### 1. PayPal
- 全球最流行的在线支付平台
- 支持多种货币（USD、EUR、GBP）
- 安全可靠，用户信任度高
- 支持信用卡、借记卡和银行账户

### 2. 信用卡支付
- 通过Stripe集成
- 支持Visa、MasterCard、American Express等
- 实时支付处理
- 支持3D Secure验证

### 3. 银行转账
- 传统银行转账方式
- 适合大额支付
- 处理时间较长（1-3个工作日）
- 手续费较低

## 支持的货币

| 货币代码 | 符号 | 汇率（相对于USD） |
|---------|------|------------------|
| USD     | $    | 1.00            |
| EUR     | €    | 0.85            |
| GBP     | £    | 0.73            |

## 技术实现

### 前端（React + TypeScript）
- 支付方式选择器
- 货币选择器
- 实时价格计算
- 响应式设计

### 后端（Node.js + Express）
- 支付订单创建API
- 订单状态查询API
- 支付网关集成
- 安全验证

## API端点

### 创建支付订单
```
POST /api/pay/create
Content-Type: application/json

{
  "method": "paypal|creditcard|banktransfer",
  "amount": 29,
  "subject": "ESG Report",
  "currency": "USD|EUR|GBP",
  "inviteCode": "optional"
}
```

### 查询订单状态
```
GET /api/pay/query?orderId={orderId}
```

## 安全特性

1. **邀请码系统**：支持临时邀请码，可绕过支付
2. **订单验证**：每个订单都有唯一ID
3. **状态轮询**：实时监控支付状态
4. **错误处理**：完善的错误处理机制

## 部署说明

1. 确保环境变量配置正确
2. 更新支付网关配置
3. 配置回调URL
4. 测试支付流程

## 注意事项

- 实际部署时需要配置真实的支付网关
- 建议使用HTTPS确保安全
- 需要处理支付失败的情况
- 考虑添加支付日志记录

## 未来扩展

- 支持更多支付方式（Apple Pay、Google Pay等）
- 添加订阅模式
- 支持更多货币
- 集成支付分析工具
