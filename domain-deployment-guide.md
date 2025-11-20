# www.mscfv.com 域名部署完整指南

## 🎯 部署概述
您的ESG风险分析平台将部署到域名 `www.mscfv.com`，包含以下功能：
- ✅ HTTPS安全访问（Let's Encrypt SSL证书）
- ✅ Nginx反向代理
- ✅ 自动SSL证书续期
- ✅ 安全头配置
- ✅ 防火墙配置
- ✅ 静态资源缓存

## 🚀 快速部署步骤

### 步骤1：确保应用服务正常运行
在阿里云服务器上执行：
```bash
# 检查后端服务
curl http://localhost:3002/api/insights

# 检查前端服务
curl -I http://localhost:3001
```

### 步骤2：执行域名部署脚本
```bash
cd /root/FutureVision
bash deploy-domain.sh
```

### 步骤3：验证部署结果
```bash
# 检查Nginx状态
systemctl status nginx

# 检查SSL证书
certbot certificates

# 测试域名访问
curl -I https://www.mscfv.com
```

## 📋 详细配置说明

### 🔧 Nginx配置详解

配置文件位置：`/etc/nginx/conf.d/mscfv.conf`

**主要配置项：**
- **HTTP重定向**: 所有HTTP请求自动跳转到HTTPS
- **SSL配置**: 使用TLS 1.2/1.3，强加密算法
- **安全头**: HSTS、X-Frame-Options、X-Content-Type-Options等
- **代理设置**: 正确转发到Node.js应用端口
- **缓存策略**: 静态资源长期缓存，API数据短期缓存

### 🔒 SSL证书配置

**Let's Encrypt自动获取：**
```bash
certbot --nginx -d www.mscfv.com -d mscfv.com --email admin@mscfv.com --agree-tos --non-interactive
```

**自动续期配置：**
```bash
# 添加到crontab，每60天自动续期
0 2 * * * certbot renew --quiet && systemctl reload nginx
```

### 🛡️ 安全头配置

已配置的安全头：
- `Strict-Transport-Security`: 强制HTTPS
- `X-Frame-Options`: 防止点击劫持
- `X-Content-Type-Options`: 防止MIME类型嗅探
- `X-XSS-Protection`: XSS保护
- `Referrer-Policy`: 引用策略控制

### 🔥 防火墙配置

**CentOS/RHEL (firewalld):**
```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

**Ubuntu/Debian (UFW):**
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 🌐 域名DNS配置

在阿里云域名控制台配置DNS记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A记录 | @ | 您的服务器IP | 600 |
| A记录 | www | 您的服务器IP | 600 |

## 📊 监控和维护

### 日志文件位置
```bash
# Nginx访问日志
tail -f /var/log/nginx/www.mscfv.com.access.log

# Nginx错误日志
tail -f /var/log/nginx/www.mscfv.com.error.log

# 应用日志
tail -f /root/FutureVision/backend.log
tail -f /root/FutureVision/dist/frontend.log
```

### 健康检查
```bash
# 检查应用健康状态
curl https://www.mscfv.com/health

# 检查API状态
curl https://www.mscfv.com/api/insights
```

### 性能监控
```bash
# 检查Nginx状态
systemctl status nginx

# 检查SSL证书状态
certbot certificates

# 检查服务器资源
htop
df -h
```

## 🔧 常见问题解决

### 1. SSL证书获取失败
```bash
# 检查域名解析
dig www.mscfv.com

# 检查端口开放
netstat -tulnp | grep -E ':(80|443)'

# 手动获取证书（调试模式）
certbot --nginx -d www.mscfv.com -d mscfv.com --staging
```

### 2. Nginx配置错误
```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 3. 应用无法访问
```bash
# 检查应用服务
systemctl status futurevision

# 检查端口监听
netstat -tulnp | grep -E ':(3001|3002)'

# 重启应用服务
systemctl restart futurevision
```

### 4. 域名解析问题
```bash
# 检查DNS解析
dig www.mscfv.com +trace

# 检查本地DNS缓存
systemd-resolve --flush-caches

# 测试不同地区解析
nslookup www.mscfv.com 8.8.8.8
```

## 🚀 高级配置

### CDN配置（可选）
在阿里云CDN控制台：
1. 添加域名 `www.mscfv.com`
2. 源站设置为您的服务器IP
3. 配置缓存规则
4. 启用HTTPS

### 备份策略
```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/futurevision_${DATE}.tar.gz /root/FutureVision
# 删除7天前的备份
find /backup -name "futurevision_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup.sh
# 添加到crontab，每天凌晨2点备份
0 2 * * * /root/backup.sh
```

### 监控告警
```bash
# 安装监控工具
yum install monit -y  # 或 apt install monit

# 配置监控文件
cat > /etc/monit.d/futurevision << 'EOF'
check process futurevision-backend with pidfile /root/FutureVision/backend.pid
    start program = "/bin/systemctl start futurevision"
    stop program = "/bin/systemctl stop futurevision"
    if failed host localhost port 3002 protocol http
        and request "/api/insights"
        then restart
    if 5 restarts within 5 cycles then timeout

check process futurevision-nginx with pidfile /var/run/nginx.pid
    start program = "/bin/systemctl start nginx"
    stop program = "/bin/systemctl stop nginx"
    if failed host localhost port 80 protocol http
        then restart
    if 3 restarts within 5 cycles then timeout
EOF

systemctl enable monit
systemctl start monit
```

## 📞 技术支持

如果遇到问题，请按以下顺序检查：

1. **域名解析**: `dig www.mscfv.com`
2. **服务状态**: `systemctl status nginx futurevision`
3. **端口监听**: `netstat -tulnp | grep -E ':(80|443|3001|3002)'`
4. **日志文件**: 检查Nginx和应用日志
5. **SSL证书**: `certbot certificates`

## 🎉 部署完成！

部署成功后，您可以通过以下地址访问：

- **主站**: https://www.mscfv.com
- **健康检查**: https://www.mscfv.com/health
- **API测试**: https://www.mscfv.com/api/insights

恭喜！您的ESG风险分析平台已成功部署到域名 www.mscfv.com，具备完整的HTTPS安全保护和性能优化。