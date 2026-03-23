// RBAC 权限检查中间件

/**
 * 角色权限定义
 */
const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

/**
 * 权限规则
 */
const PERMISSIONS = {
  // 课程管理
  courseRead: ['admin', 'editor', 'viewer'],
  courseCreate: ['admin', 'editor'],
  courseUpdate: ['admin', 'editor'],
  courseDelete: ['admin', 'editor'],

  // 章节管理
  chapterRead: ['admin', 'editor', 'viewer'],
  chapterCreate: ['admin', 'editor'],
  chapterUpdate: ['admin', 'editor'],
  chapterDelete: ['admin', 'editor'],

  // 课时管理
  lessonRead: ['admin', 'editor', 'viewer'],
  lessonCreate: ['admin', 'editor'],
  lessonUpdate: ['admin', 'editor'],
  lessonDelete: ['admin', 'editor'],

  // 评论管理
  reviewRead: ['admin', 'editor', 'viewer'],
  reviewDelete: ['admin', 'editor'],

  // 用户管理（仅 admin）
  userRead: ['admin'],
  userCreate: ['admin'],
  userUpdate: ['admin'],
  userDelete: ['admin'],

  // 统计查看
  statsRead: ['admin', 'editor', 'viewer'],

  // 文件上传
  uploadFile: ['admin', 'editor']
};

/**
 * 检查用户角色是否在允许的角色列表中
 * @param {string} userRole - 用户角色
 * @param {string[]} allowedRoles - 允许的角色列表
 * @returns {boolean}
 */
function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}

/**
 * 生成权限检查中间件
 * @param {string[]} allowedRoles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
function checkPermission(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未认证'
      });
    }

    if (!hasRole(req.user.role, allowedRoles)) {
      return res.status(403).json({
        success: false,
        error: '权限不足'
      });
    }

    next();
  };
}

/**
 * 快捷权限检查中间件
 */
const requireAdmin = checkPermission([ROLES.ADMIN]);
const requireEditor = checkPermission([ROLES.ADMIN, ROLES.EDITOR]);
const requireViewer = checkPermission([ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]);

module.exports = {
  ROLES,
  PERMISSIONS,
  hasRole,
  checkPermission,
  requireAdmin,
  requireEditor,
  requireViewer
};
