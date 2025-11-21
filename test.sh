#!/bin/bash

LOCAL_FILE="./dist/static/*"
REMOTE_DIR="/home/html/futureVision_en"

echo "开始部署..."

# 上传文件
scp -r $LOCAL_FILE root@123.56.247.231:$REMOTE_DIR

echo "部署完成"
