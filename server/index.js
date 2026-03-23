// LMS Landing Page 管理后端服务器
// 纯 Node.js 实现，使用内置 http 模块

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 导入模块
const { db, initDatabase } = require('./db');
const { authMiddleware } = require('./auth');
const {
  requireAdmin,
  requireEditor,
  requireViewer
} = require('./middleware/rbac');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const chapterRoutes = require('./routes/chapters');
const lessonRoutes = require('./routes/lessons');
const reviewRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');

// 配置
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

/**
 * CORS 中间件
 */
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * 解析 JSON 请求体
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

/**
 * 路由匹配器
 */
function matchRoute(reqPath, pattern) {
  const patternParts = pattern.split('/');
  const pathParts = reqPath.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.substring(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

/**
 * 路由定义
 */
const routes = [
  // 认证路由
  { method: 'POST', path: '/api/auth/login', handler: authRoutes.login },
  { method: 'POST', path: '/api/auth/change-password', handler: authRoutes.changePassword, middleware: [authMiddleware] },
  { method: 'GET', path: '/api/auth/me', handler: authRoutes.getCurrentUser, middleware: [authMiddleware] },

  // 用户管理路由
  { method: 'GET', path: '/api/users', handler: userRoutes.getUsers, middleware: [authMiddleware, requireAdmin] },
  { method: 'POST', path: '/api/users', handler: userRoutes.createUser, middleware: [authMiddleware, requireAdmin] },
  { method: 'PUT', path: '/api/users/:id', handler: userRoutes.updateUser, middleware: [authMiddleware, requireAdmin] },
  { method: 'DELETE', path: '/api/users/:id', handler: userRoutes.deleteUser, middleware: [authMiddleware, requireAdmin] },

  // 课程路由
  { method: 'GET', path: '/api/courses', handler: courseRoutes.getCourses, middleware: [authMiddleware, requireViewer] },
  { method: 'GET', path: '/api/courses/:id', handler: courseRoutes.getCourse, middleware: [authMiddleware, requireViewer] },
  { method: 'POST', path: '/api/courses', handler: courseRoutes.createCourse, middleware: [authMiddleware, requireEditor] },
  { method: 'PUT', path: '/api/courses/:id', handler: courseRoutes.updateCourse, middleware: [authMiddleware, requireEditor] },
  { method: 'DELETE', path: '/api/courses/:id', handler: courseRoutes.deleteCourse, middleware: [authMiddleware, requireEditor] },

  // 章节路由
  { method: 'POST', path: '/api/courses/:id/chapters', handler: chapterRoutes.addChapter, middleware: [authMiddleware, requireEditor] },
  { method: 'GET', path: '/api/chapters/:id', handler: chapterRoutes.getChapter, middleware: [authMiddleware, requireViewer] },
  { method: 'PUT', path: '/api/chapters/:id', handler: chapterRoutes.updateChapter, middleware: [authMiddleware, requireEditor] },
  { method: 'DELETE', path: '/api/chapters/:id', handler: chapterRoutes.deleteChapter, middleware: [authMiddleware, requireEditor] },

  // 课时路由
  { method: 'POST', path: '/api/chapters/:id/lessons', handler: lessonRoutes.addLesson, middleware: [authMiddleware, requireEditor] },
  { method: 'GET', path: '/api/lessons/:id', handler: lessonRoutes.getLesson, middleware: [authMiddleware, requireViewer] },
  { method: 'PUT', path: '/api/lessons/:id', handler: lessonRoutes.updateLesson, middleware: [authMiddleware, requireEditor] },
  { method: 'DELETE', path: '/api/lessons/:id', handler: lessonRoutes.deleteLesson, middleware: [authMiddleware, requireEditor] },

  // 评论路由
  { method: 'GET', path: '/api/reviews', handler: reviewRoutes.getAllReviews, middleware: [authMiddleware, requireViewer] },
  { method: 'GET', path: '/api/courses/:id/reviews', handler: reviewRoutes.getCourseReviews, middleware: [authMiddleware, requireViewer] },
  { method: 'GET', path: '/api/reviews/:id', handler: reviewRoutes.getReview, middleware: [authMiddleware, requireViewer] },
  { method: 'DELETE', path: '/api/reviews/:id', handler: reviewRoutes.deleteReview, middleware: [authMiddleware, requireEditor] },

  // 统计路由
  { method: 'GET', path: '/api/stats/overview', handler: statsRoutes.getOverviewStats, middleware: [authMiddleware, requireViewer] },
  { method: 'GET', path: '/api/stats/recent-courses', handler: statsRoutes.getRecentCourses, middleware: [authMiddleware, requireViewer] },
  { method: 'GET', path: '/api/stats/course/:id', handler: statsRoutes.getCourseStats, middleware: [authMiddleware, requireViewer] },

  // 上传路由
  { method: 'POST', path: '/api/upload', handler: uploadRoutes.uploadImage, middleware: [authMiddleware, requireEditor] },
  { method: 'GET', path: '/api/uploads/:filename', handler: uploadRoutes.serveUpload },
  { method: 'DELETE', path: '/api/uploads/:filename', handler: uploadRoutes.deleteUpload, middleware: [authMiddleware, requireEditor] }
];

/**
 * 包装响应对象以支持 Express-like API
 */
function wrapResponse(res) {
  let statusCode = 200;
  let headersSet = false;

  return {
    _res: res,

    status(code) {
      statusCode = code;
      return this;
    },

    json(data) {
      if (!headersSet) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        headersSet = true;
      }
      res.end(JSON.stringify(data));
    },

    end(data) {
      if (!headersSet) {
        res.writeHead(statusCode);
        headersSet = true;
      }
      if (data) {
        res.end(data);
      } else {
        res.end();
      }
    },

    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },

    get headersSent() {
      return res.headersSent;
    },

    get statusCode() {
      return statusCode;
    },

    set statusCode(code) {
      statusCode = code;
    }
  };
}

/**
 * 请求处理器
 */
async function handleRequest(req, res) {
  // 设置 CORS 头
  setCORSHeaders(res);

  // 处理 OPTIONS 请求（预检）
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // 解析 URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // 查找匹配的路由
  let matchedRoute = null;
  let routeParams = null;

  for (const route of routes) {
    if (route.method !== req.method) continue;

    const params = matchRoute(pathname, route.path);
    if (params !== null) {
      matchedRoute = route;
      routeParams = params;
      break;
    }
  }

  // 包装响应对象
  const resWrapped = wrapResponse(res);

  // 如果没有匹配的路由
  if (!matchedRoute) {
    resWrapped.status(404).json({
      success: false,
      error: '路由未找到'
    });
    return;
  }

  try {
    // 将参数和查询字符串附加到请求对象
    req.params = routeParams;
    req.query = parsedUrl.query;

    // 解析请求体（仅对于 POST/PUT/DELETE）
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      req.body = await parseBody(req);
    }

    // 执行中间件
    if (matchedRoute.middleware) {
      for (const middleware of matchedRoute.middleware) {
        await new Promise((resolve, reject) => {
          middleware(req, resWrapped, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }

    // 执行路由处理器
    await matchedRoute.handler(req, resWrapped);

  } catch (error) {
    console.error('请求处理错误:', error);

    // 如果响应尚未发送，发送错误响应
    if (!resWrapped.headersSent) {
      resWrapped.status(500).json({
        success: false,
        error: '服务器内部错误'
      });
    }
  }
}

/**
 * 创建并启动服务器
 */
function startServer() {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`🚀 LMS 管理后端服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API 文档: http://localhost:${PORT}/api/docs`);
    console.log(`🔑 默认管理员: admin / admin2026`);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('正在关闭服务器...');
    server.close(() => {
      db.close();
      console.log('服务器已关闭');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
      db.close();
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    // 初始化数据库
    console.log('正在初始化数据库...');
    initDatabase();

    // 启动服务器
    startServer();
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动应用
if (require.main === module) {
  main();
}

module.exports = { app: http.createServer(handleRequest) };
