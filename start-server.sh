#!/bin/bash
# LMS 管理后端启动脚本

echo "🚀 启动 LMS 管理后端服务器..."
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 初始化数据库
echo "🗄️  初始化数据库..."
npm run init-db

# 启动服务器
echo ""
echo "✅ 启动完成！"
echo "📡 服务器地址: http://localhost:3001"
echo "🔑 默认管理员: admin / admin2026"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm start
