// 课时管理路由
const { db } = require('../db');
const { requireEditor } = require('../middleware/rbac');

/**
 * 获取课时详情
 * GET /api/lessons/:id
 */
function getLesson(req, res) {
  try {
    const { id } = req.params;

    const lesson = db.prepare(`
      SELECT l.*, ch.title as chapter_title, ch.course_id
      FROM lessons l
      LEFT JOIN chapters ch ON l.chapter_id = ch.id
      WHERE l.id = ?
    `).get(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: '课时不存在'
      });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('获取课时详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 添加课时
 * POST /api/chapters/:id/lessons
 */
function addLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, description, video_url, duration, order_index, is_free } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: '课时标题不能为空'
      });
    }

    // 检查章节是否存在
    const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: '章节不存在'
      });
    }

    // 获取下一个排序索引
    const maxOrder = db.prepare(
      'SELECT MAX(order_index) as max_order FROM lessons WHERE chapter_id = ?'
    ).get(id);

    const nextOrder = order_index || (maxOrder.max_order || 0) + 1;

    // 插入课时
    const result = db.prepare(`
      INSERT INTO lessons (chapter_id, title, description, video_url, duration, order_index, is_free)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      description || null,
      video_url || null,
      duration || null,
      nextOrder,
      is_free !== undefined ? (is_free ? 1 : 0) : 0
    );

    const newLesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newLesson
    });
  } catch (error) {
    console.error('添加课时错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 更新课时
 * PUT /api/lessons/:id
 */
function updateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, description, video_url, duration, order_index, is_free } = req.body;

    // 检查课时是否存在
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: '课时不存在'
      });
    }

    // 更新课时
    db.prepare(`
      UPDATE lessons
      SET title = ?, description = ?, video_url = ?, duration = ?, order_index = ?, is_free = ?
      WHERE id = ?
    `).run(
      title || lesson.title,
      description !== undefined ? description : lesson.description,
      video_url !== undefined ? video_url : lesson.video_url,
      duration !== undefined ? duration : lesson.duration,
      order_index !== undefined ? order_index : lesson.order_index,
      is_free !== undefined ? (is_free ? 1 : 0) : lesson.is_free,
      id
    );

    const updatedLesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updatedLesson
    });
  } catch (error) {
    console.error('更新课时错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除课时
 * DELETE /api/lessons/:id
 */
function deleteLesson(req, res) {
  try {
    const { id } = req.params;

    // 检查课时是否存在
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: '课时不存在'
      });
    }

    // 删除课时
    db.prepare('DELETE FROM lessons WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: '课时删除成功' }
    });
  } catch (error) {
    console.error('删除课时错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  addLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  requireEditor
};
