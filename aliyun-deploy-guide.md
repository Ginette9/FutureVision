# 阿里云服务器部署指南

## 🚀 快速部署步骤

### 1. 连接到您的阿里云服务器
```bash
ssh root@您的服务器IP地址
```

### 2. 安装Node.js v16.20.2（如果尚未安装）
```bash
# 检查当前Node.js版本
node -v

# 如果版本不是v16.20.2，使用NVM安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16.20.2
nvm use 16.20.2
```

### 3. 克隆或上传项目代码
```bash
# 方法1: 使用git克隆（如果项目有git仓库）
git clone 您的项目仓库地址 FutureVision
cd FutureVision

# 方法2: 上传本地文件（使用scp）
# 在本地终端执行：
scp -r /Users/ginettexu/Downloads/ESG_Oversea_Risk/RiskAnalysis root@您的服务器IP地址:/root/FutureVision
```

### 4. 安装依赖并构建
```bash
cd /root/FutureVision
npm install --legacy-peer-deps
npm run build
```

### 5. 启动服务
```bash
# 启动后端服务器
PORT=3002 node server.js &

# 启动前端静态文件服务器
cd dist && python3 -m http.server 3001 &
```

### 6. 配置Nginx反向代理（推荐）
```bash
# 安装Nginx
yum install nginx -y  # CentOS/RHEL
apt install nginx -y  # Ubuntu/Debian

# 创建Nginx配置
cat > /etc/nginx/conf.d/futurevision.conf << 'EOF'
server {
    listen 80;
    server_name 您的域名或IP地址;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 报告文件
    location /reports/ {
        alias /root/FutureVision/public/reports/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 图片资源
    location /images/ {
        alias /root/FutureVision/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 测试并重启Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 7. 使用PM2进行进程管理（推荐）
```bash
# 安装PM2
npm install -g pm2

# 创建PM2配置
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'futurevision-backend',
      script: 'server.js',
      cwd: '/root/FutureVision',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      log_file: '/var/log/futurevision-backend.log',
      error_file: '/var/log/futurevision-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 5
    },
    {
      name: 'futurevision-frontend',
      script: 'python3',
      args: '-m http.server 3001',
      cwd: '/root/FutureVision/dist',
      env: {
        NODE_ENV: 'production'
      },
      log_file: '/var/log/futurevision-frontend.log',
      error_file: '/var/log/futurevision-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '200M',
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 5
    }
  ]
};
EOF

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📋 部署验证

### 检查服务状态
```bash
# 检查端口监听
netstat -tulnp | grep -E ':(3001|3002|80)'

# 测试API
curl http://localhost:3002/api/insights

# 测试前端
curl -I http://localhost:3001

# 检查Nginx配置
nginx -t
```

### 检查日志
```bash
# PM2日志
pm2 logs

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔧 常见问题解决

### 1. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3001
lsof -i :3002

# 杀死进程
kill -9 进程ID
```

### 2. 防火墙配置
```bash
# 开放端口（根据您的系统）
# CentOS/RHEL
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

# Ubuntu/Debian
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. 权限问题
```bash
# 确保文件权限正确
chmod -R 755 /root/FutureVision
chown -R root:root /root/FutureVision
```

## 🌐 域名和SSL配置

### 配置域名
1. 在阿里云控制台添加A记录指向您的服务器IP
2. 修改Nginx配置中的server_name为您的域名

### 配置SSL证书（使用Let's Encrypt）
```bash
# 安装certbot
yum install certbot python3-certbot-nginx -y  # CentOS/RHEL
apt install certbot python3-certbot-nginx -y  # Ubuntu/Debian

# 获取证书
certbot --nginx -d 您的域名

# 自动续期
certbot renew --dry-run
```

## 📊 监控和维护

### 设置监控
```bash
# 安装Node.js监控工具
npm install -g clinic
clinic doctor -- node server.js
```

### 定期维护
```bash
# 更新应用
cd /root/FutureVision
git pull origin main  # 如果使用git
npm install --legacy-peer-deps
npm run build
pm2 restart all

# 清理日志
pm2 flush
```

## 🚨 安全建议

1. **不要使用root用户运行应用**（创建专用用户）
2. **配置防火墙规则**
3. **定期更新系统和依赖**
4. **使用强密码和SSH密钥**
5. **配置SSL证书**
6. **定期备份数据**

## 📞 技术支持

如果遇到问题，请检查：
1. 服务器资源使用情况：`top` 或 `htop`
2. 应用日志：`pm2 logs`
3. Nginx日志：`/var/log/nginx/`
4. 系统日志：`journalctl -xe`

---

**部署完成！** 🎉

您的ESG风险分析平台现在应该在阿里云服务器上成功运行了！

- 前端访问：http://您的域名或IP地址
- 后端API：http://您的域名或IP地址/api/
- 管理工具：PM2 (`pm2 status`, `pm2 logs`)