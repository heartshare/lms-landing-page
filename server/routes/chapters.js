// 章节管理路由
const { db } = require('../db');
const { requireEditor } = require('../middleware/rbac');

/**
 * 获取章节详情
 * GET /api/chapters/:id
 */
function getChapter(req, res) {
  try {
    const { id } = req.params;

    const chapter = db.prepare(`
      SELECT ch.*, c.title as course_title
      FROM chapters ch
      LEFT JOIN courses c ON ch.course_id = c.id
      WHERE ch.id = ?
    `).get(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: '章节不存在'
      });
    }

    // 获取该章节的课时
    const lessons = db.prepare(`
      SELECT * FROM lessons
      WHERE chapter_id = ?
      ORDER BY order_index
    `).all(id);

    res.json({
      success: true,
      data: {
        ...chapter,
        lessons
      }
    });
  } catch (error) {
    console.error('获取章节详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 添加章节
 * POST /api/courses/:id/chapters
 */
function addChapter(req, res) {
  try {
    const { id } = req.params;
    const { title, description, order_index } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: '章节标题不能为空'
      });
    }

    // 检查课程是否存在
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 获取下一个排序索引
    const maxOrder = db.prepare(
      'SELECT MAX(order_index) as max_order FROM chapters WHERE course_id = ?'
    ).get(id);

    const nextOrder = order_index || (maxOrder.max_order || 0) + 1;

    // 插入章节
    const result = db.prepare(`
      INSERT INTO chapters (course_id, title, description, order_index)
      VALUES (?, ?, ?, ?)
    `).run(id, title, description || null, nextOrder);

    const newChapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newChapter
    });
  } catch (error) {
    console.error('添加章节错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 更新章节
 * PUT /api/chapters/:id
 */
function updateChapter(req, res) {
  try {
    const { id } = req.params;
    const { title, description, order_index } = req.body;

    // 检查章节是否存在
    const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: '章节不存在'
      });
    }

    // 更新章节
    db.prepare(`
      UPDATE chapters
      SET title = ?, description = ?, order_index = ?
      WHERE id = ?
    `).run(
      title || chapter.title,
      description !== undefined ? description : chapter.description,
      order_index !== undefined ? order_index : chapter.order_index,
      id
    );

    const updatedChapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updatedChapter
    });
  } catch (error) {
    console.error('更新章节错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除章节
 * DELETE /api/chapters/:id
 */
function deleteChapter(req, res) {
  try {
    const { id } = req.params;

    // 检查章节是否存在
    const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: '章节不存在'
      });
    }

    // 删除章节（由于外键约束，会级联删除相关课时）
    db.prepare('DELETE FROM chapters WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: '章节删除成功' }
    });
  } catch (error) {
    console.error('删除章节错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  addChapter,
  updateChapter,
  deleteChapter,
  getChapter,
  requireEditor
};
