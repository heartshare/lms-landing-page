// 用户管理路由（仅 admin）
const { db } = require('../db');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/rbac');

/**
 * 获取用户列表
 * GET /api/users
 */
function getUsers(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const users = db.prepare(
      `SELECT id, username, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 创建用户
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: '用户名、密码和角色不能为空'
      });
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: '无效的角色'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码至少需要 6 个字符'
      });
    }

    // 检查用户名是否已存在
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).get(username);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用户名已存在'
      });
    }

    // 创建用户
    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
    ).run(username, passwordHash, role);

    const newUser = db.prepare(
      'SELECT id, username, role, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 更新用户
 * PUT /api/users/:id
 */
function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: '角色不能为空'
      });
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: '无效的角色'
      });
    }

    // 检查用户是否存在
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 不能修改自己的角色
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: '不能修改自己的角色'
      });
    }

    // 更新角色
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

    const updatedUser = db.prepare(
      'SELECT id, username, role, created_at FROM users WHERE id = ?'
    ).get(id);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除用户
 * DELETE /api/users/:id
 */
function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // 检查用户是否存在
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: '不能删除自己'
      });
    }

    // 删除用户
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: '用户删除成功' }
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  requireAdmin
};
