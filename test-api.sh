#!/bin/bash

echo "🧪 测试支付API..."
echo "================================"

# 检查服务器是否运行
echo "🔍 检查服务器状态..."
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ 后端服务器未运行，请先启动服务器"
    exit 1
fi

echo "✅ 后端服务器运行正常"

# 测试1: 邀请码支付
echo ""
echo "🔄 测试1: 邀请码支付"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"paypal","amount":29,"subject":"ESG Report","inviteCode":"FREE2025","currency":"USD"}' | jq '.'

# 测试2: PayPal支付（无邀请码）
echo ""
echo "🔄 测试2: PayPal支付（无邀请码）"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"paypal","amount":29,"subject":"ESG Report","currency":"USD"}' | jq '.'

# 测试3: Stripe支付
echo ""
echo "🔄 测试3: Stripe支付"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"stripe","amount":29,"subject":"ESG Report","currency":"USD"}' | jq '.'

# 测试4: 银行转账
echo ""
echo "🔄 测试4: 银行转账"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"banktransfer","amount":29,"subject":"ESG Report","currency":"USD"}' | jq '.'

# 测试5: 无效支付方式
echo ""
echo "🔄 测试5: 无效支付方式"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"invalid","amount":29,"subject":"ESG Report","currency":"USD"}' | jq '.'

# 测试6: 无效金额
echo ""
echo "🔄 测试6: 无效金额"
curl -s -X POST http://localhost:3001/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"method":"paypal","amount":"invalid","subject":"ESG Report","currency":"USD"}' | jq '.'

echo ""
echo "🎯 API测试完成！"
echo "================================"
echo "💡 如果看到错误，请检查："
echo "   1. 服务器控制台日志"
echo "   2. .env文件配置"
echo "   3. 网络连接状态"
