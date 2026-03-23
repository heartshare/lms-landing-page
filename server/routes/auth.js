// 认证相关路由
const { db } = require('../db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../auth');
const { sendSuccess, sendError } = require('../response');

/**
 * 用户登录
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, '用户名和密码不能为空', 400);
    }

    // 查询用户
    const user = db.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).get(username);

    if (!user) {
      return sendError(res, '用户名或密码错误', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return sendError(res, '用户名或密码错误', 401);
    }

    // 生成 JWT token
    const token = generateToken(user);

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    sendError(res, '服务器错误', 500);
  }
}

/**
 * 修改密码
 * POST /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, '旧密码和新密码不能为空', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, '新密码至少需要 6 个字符', 400);
    }

    // 获取用户信息
    const user = db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return sendError(res, '用户不存在', 404);
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValidPassword) {
      return sendError(res, '旧密码错误', 401);
    }

    // 更新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    db.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).run(newPasswordHash, req.user.id);

    sendSuccess(res, { message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    sendError(res, '服务器错误', 500);
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
function getCurrentUser(req, res) {
  try {
    const user = db.prepare(
      'SELECT id, username, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return sendError(res, '用户不存在', 404);
    }

    sendSuccess(res, user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    sendError(res, '服务器错误', 500);
  }
}

// 导出路由函数
module.exports = {
  login,
  changePassword,
  getCurrentUser
};
