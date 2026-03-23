# LMS Landing Page 管理后端

纯 Node.js 实现的 LMS 管理后端，基于 SQLite 数据库。

## 技术栈

- **运行时**: Node.js (纯 JavaScript，无框架依赖)
- **HTTP 服务器**: 内置 http 模块
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码哈希**: bcrypt (bcryptjs)

## 安装

```bash
npm install
```

## 初始化数据库

```bash
npm run init-db
```

这将：
- 在现有的 `courses.db` 中创建 `users` 表
- 创建默认管理员账户：`admin / admin2026`

## 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3001` 运行。

## 环境变量

- `PORT`: 服务器端口（默认: 3001）
- `LMS_SECRET`: JWT 密钥（默认: lms-secret-2026）
- `CORS_ORIGIN`: CORS 允许的源（默认: *）

## API 文档

### 认证 API

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin2026"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2026-03-23 10:00:00"
    }
  }
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### 修改密码
```
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "admin2026",
  "newPassword": "newpassword"
}
```

### 用户管理 API (仅 admin)

#### 获取用户列表
```
GET /api/users?page=1&limit=20
Authorization: Bearer {token}
```

#### 创建用户
```
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "editor1",
  "password": "password123",
  "role": "editor"
}
```

#### 更新用户角色
```
PUT /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "editor"
}
```

#### 删除用户
```
DELETE /api/users/:id
Authorization: Bearer {token}
```

### 课程 API

#### 获取课程列表
```
GET /api/courses?page=1&limit=20&search=python&category=编程
Authorization: Bearer {token}
```

#### 获取课程详情
```
GET /api/courses/:id
Authorization: Bearer {token}
```

#### 创建课程
```
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Python 编程入门",
  "description": "从零开始学习 Python",
  "instructor": "张老师",
  "price": 199,
  "original_price": 299,
  "level": "初级",
  "duration_hours": 20,
  "language": "中文",
  "thumbnail_url": "/uploads/course-thumb.jpg",
  "video_url": "https://example.com/intro.mp4",
  "category": "编程开发",
  "topics": ["变量", "函数", "类"],
  "requirements": ["无需基础"],
  "what_you_learn": ["Python 基础", "面向对象"],
  "target_audience": "编程初学者"
}
```

#### 更新课程
```
PUT /api/courses/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Python 高级编程",
  "price": 299
}
```

#### 删除课程
```
DELETE /api/courses/:id
Authorization: Bearer {token}
```

### 章节 API

#### 添加章节
```
POST /api/courses/:id/chapters
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "第一章：基础知识",
  "description": "学习 Python 基础概念",
  "order_index": 1
}
```

#### 更新章节
```
PUT /api/chapters/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "第一章：Python 入门"
}
```

#### 删除章节
```
DELETE /api/chapters/:id
Authorization: Bearer {token}
```

### 课时 API

#### 添加课时
```
POST /api/chapters/:id/lessons
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "1.1 变量与数据类型",
  "description": "学习 Python 变量",
  "video_url": "https://example.com/lesson1.mp4",
  "duration": 15,
  "order_index": 1,
  "is_free": true
}
```

#### 更新课时
```
PUT /api/lessons/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "1.1 Python 变量详解"
}
```

#### 删除课时
```
DELETE /api/lessons/:id
Authorization: Bearer {token}
```

### 评论 API

#### 获取所有评论
```
GET /api/reviews?page=1&limit=20&course_id=1
Authorization: Bearer {token}
```

#### 获取课程评论
```
GET /api/courses/:id/reviews?page=1&limit=20
Authorization: Bearer {token}
```

#### 删除评论
```
DELETE /api/reviews/:id
Authorization: Bearer {token}
```

### 统计 API

#### 获取总览统计
```
GET /api/stats/overview
Authorization: Bearer {token}
```

响应：
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 50,
      "avgRating": 4.5,
      "totalReviews": 200,
      "totalChapters": 150,
      "totalLessons": 500,
      "freeLessons": 100,
      "totalValue": 9950
    },
    "coursesByLevel": [
      { "level": "初级", "count": 20 },
      { "level": "中级", "count": 20 },
      { "level": "高级", "count": 10 }
    ],
    "recentCourses": [...],
    "coursesByCategory": [...]
  }
}
```

#### 获取最近课程
```
GET /api/stats/recent-courses?limit=10
Authorization: Bearer {token}
```

#### 获取课程统计
```
GET /api/stats/course/:id
Authorization: Bearer {token}
```

### 文件上传 API

#### 上传图片
```
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
```

响应：
```json
{
  "success": true,
  "data": {
    "url": "/uploads/1711234567890-abc123.jpg",
    "filename": "1711234567890-abc123.jpg",
    "size": 102400,
    "contentType": "image/jpeg"
  }
}
```

#### 获取上传的文件
```
GET /api/uploads/:filename
```

#### 删除文件
```
DELETE /api/uploads/:filename
Authorization: Bearer {token}
```

## RBAC 权限说明

### 角色

- **admin**: 管理员，拥有所有权限
- **editor**: 编辑，可以管理课程、章节、课时和评论
- **viewer**: 查看者，只读权限

### 权限矩阵

| 操作 | admin | editor | viewer |
|------|-------|--------|--------|
| 用户管理 | ✅ | ❌ | ❌ |
| 课程 CRUD | ✅ | ✅ | ✅ (只读) |
| 章节 CRUD | ✅ | ✅ | ✅ (只读) |
| 课时 CRUD | ✅ | ✅ | ✅ (只读) |
| 评论管理 | ✅ | ✅ | ✅ (只读) |
| 统计查看 | ✅ | ✅ | ✅ |
| 文件上传 | ✅ | ✅ | ❌ |

## 部署

### Railway

1. 推送代码到 GitHub
2. 在 Railway 创建新项目
3. 选择 "Deploy from GitHub repo"
4. 设置环境变量（可选）
5. 部署完成

### Render

1. 推送代码到 GitHub
2. 在 Render 创建新的 Web Service
3. 连接 GitHub 仓库
4. 设置构建命令：`npm install`
5. 设置启动命令：`npm start`
6. 部署完成

### 本地运行

```bash
npm install
npm run init-db
npm start
```

## 注意事项

- 上传的文件存储在 `server/uploads/` 目录
- 支持的图片格式：JPEG, PNG, GIF, WebP
- 最大文件大小：5MB
- JWT token 有效期：24 小时
- 默认端口：3001

## 数据库表结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名，唯一 |
| password_hash | TEXT | 密码哈希 |
| role | TEXT | 角色：admin/editor/viewer |
| created_at | DATETIME | 创建时间 |

## 开发

### 添加新的路由

1. 在 `server/routes/` 创建新的路由文件
2. 导出路由处理器函数
3. 在 `server/index.js` 的 `routes` 数组中添加路由配置

### 添加新的中间件

1. 在 `server/middleware/` 创建中间件文件
2. 导出中间件函数
3. 在路由配置中使用中间件
