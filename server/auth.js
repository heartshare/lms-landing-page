// 认证中间件和 JWT 工具函数
const jwt = require('jsonwebtoken');

// 从环境变量获取密钥，或使用默认值
const JWT_SECRET = process.env.LMS_SECRET || 'lms-secret-2026';

/**
 * 生成 JWT token
 * @param {Object} user - 用户对象
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解码后的用户信息或 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 认证中间件
 * 验证请求头中的 token 并将用户信息附加到请求对象
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: '未提供认证令牌'
    });
  }

  const token = authHeader.substring(7); // 移除 "Bearer " 前缀
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: '无效或过期的令牌'
    });
  }

  req.user = user;
  next();
}

/**
 * 可选认证中间件
 * 如果提供了 token 则验证，否则继续处理
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (user) {
      req.user = user;
    }
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  optionalAuth,
  JWT_SECRET
};
