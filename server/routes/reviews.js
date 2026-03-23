// 评论管理路由
const { db } = require('../db');
const { requireEditor, requireViewer } = require('../middleware/rbac');

/**
 * 获取所有评论
 * GET /api/reviews
 */
function getAllReviews(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = db.prepare(`
      SELECT r.*, u.username, c.title as course_title
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN courses c ON r.course_id = c.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取所有评论错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取课程评论列表
 * GET /api/courses/:id/reviews
 */
function getCourseReviews(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 检查课程是否存在
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 获取评论
    const reviews = db.prepare(`
      SELECT r.*, u.username
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE course_id = ?').get(id).count;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取单条评论
 * GET /api/reviews/:id
 */
function getReview(req, res) {
  try {
    const { id } = req.params;

    const review = db.prepare(`
      SELECT r.*, u.username, c.title as course_title
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.id = ?
    `).get(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('获取评论详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除评论
 * DELETE /api/reviews/:id
 */
function deleteReview(req, res) {
  try {
    const { id } = req.params;

    // 检查评论是否存在
    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 删除评论
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: '评论删除成功' }
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  getAllReviews,
  getCourseReviews,
  getReview,
  deleteReview,
  requireEditor,
  requireViewer
};
