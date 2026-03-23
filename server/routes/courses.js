// 课程 CRUD 路由
const { db } = require('../db');
const { requireEditor, requireViewer } = require('../middleware/rbac');

/**
 * 获取课程列表
 * GET /api/courses
 */
function getCourses(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = ''
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, cd.*
      FROM courses c
      LEFT JOIN course_details cd ON c.id = cd.course_id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (category) {
      query += ` AND cd.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY c.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const courses = db.prepare(query).all(...params);

    const total = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取课程详情（含章节和课时）
 * GET /api/courses/:id
 */
function getCourse(req, res) {
  try {
    const { id } = req.params;

    // 获取课程基本信息
    const course = db.prepare(`
      SELECT c.*, cd.*
      FROM courses c
      LEFT JOIN course_details cd ON c.id = cd.course_id
      WHERE c.id = ?
    `).get(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 获取章节和课时
    const chapters = db.prepare(`
      SELECT
        ch.id as chapter_id,
        ch.title as chapter_title,
        ch.chapter_order,
        l.id as lesson_id,
        l.title as lesson_title,
        l.duration as lesson_duration,
        l.lesson_order,
        l.is_free
      FROM chapters ch
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      WHERE ch.course_id = ?
      ORDER BY ch.chapter_order, l.lesson_order
    `).all(id);

    // 整理章节结构
    const chaptersMap = {};

    chapters.forEach(row => {
      if (!chaptersMap[row.chapter_id]) {
        chaptersMap[row.chapter_id] = {
          id: row.chapter_id,
          title: row.chapter_title,
          chapter_order: row.chapter_order,
          lessons: []
        };
      }

      if (row.lesson_id) {
        chaptersMap[row.chapter_id].lessons.push({
          id: row.lesson_id,
          title: row.lesson_title,
          duration: row.lesson_duration,
          lesson_order: row.lesson_order,
          is_free: row.is_free
        });
      }
    });

    const chaptersArray = Object.values(chaptersMap);

    // 获取评论
    const reviews = db.prepare(`
      SELECT *
      FROM reviews
      WHERE course_id = ?
      ORDER BY review_date DESC
      LIMIT 10
    `).all(id);

    res.json({
      success: true,
      data: {
        ...course,
        chapters: chaptersArray,
        reviews
      }
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 创建课程
 * POST /api/courses
 */
function createCourse(req, res) {
  try {
    const {
      title,
      description,
      instructor,
      price,
      original_price,
      level,
      duration_hours,
      language,
      thumbnail_url,
      video_url,
      category,
      topics,
      requirements,
      what_you_learn,
      target_audience
    } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        error: '标题、描述和价格不能为空'
      });
    }

    // 开始事务
    const insertCourse = db.prepare(`
      INSERT INTO courses (title, description, instructor, price, original_price, level, duration_hours, language, thumbnail_url, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertCourse.run(
      title,
      description,
      instructor || null,
      price,
      original_price || null,
      level || null,
      duration_hours || null,
      language || '中文',
      thumbnail_url || null,
      video_url || null
    );

    const courseId = result.lastInsertRowid;

    // 插入课程详情
    const insertDetails = db.prepare(`
      INSERT INTO course_details (course_id, category, topics, requirements, what_you_learn, target_audience)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertDetails.run(
      courseId,
      category || null,
      JSON.stringify(topics || []),
      JSON.stringify(requirements || []),
      JSON.stringify(what_you_learn || []),
      target_audience || null
    );

    const newCourse = db.prepare(`
      SELECT c.*, cd.*
      FROM courses c
      LEFT JOIN course_details cd ON c.id = cd.course_id
      WHERE c.id = ?
    `).get(courseId);

    res.status(201).json({
      success: true,
      data: newCourse
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 更新课程
 * PUT /api/courses/:id
 */
function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructor,
      price,
      original_price,
      level,
      duration_hours,
      language,
      thumbnail_url,
      video_url,
      category,
      topics,
      requirements,
      what_you_learn,
      target_audience
    } = req.body;

    // 检查课程是否存在
    const existingCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 更新课程基本信息
    const updateCourse = db.prepare(`
      UPDATE courses
      SET title = ?, description = ?, instructor = ?, price = ?, original_price = ?,
          level = ?, duration_hours = ?, language = ?, thumbnail_url = ?, video_url = ?
      WHERE id = ?
    `);

    updateCourse.run(
      title,
      description,
      instructor,
      price,
      original_price,
      level,
      duration_hours,
      language,
      thumbnail_url,
      video_url,
      id
    );

    // 更新课程详情
    const updateDetails = db.prepare(`
      UPDATE course_details
      SET category = ?, topics = ?, requirements = ?, what_you_learn = ?, target_audience = ?
      WHERE course_id = ?
    `);

    updateDetails.run(
      category,
      JSON.stringify(topics || []),
      JSON.stringify(requirements || []),
      JSON.stringify(what_you_learn || []),
      target_audience,
      id
    );

    const updatedCourse = db.prepare(`
      SELECT c.*, cd.*
      FROM courses c
      LEFT JOIN course_details cd ON c.id = cd.course_id
      WHERE c.id = ?
    `).get(id);

    res.json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除课程
 * DELETE /api/courses/:id
 */
function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    // 检查课程是否存在
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 删除课程（由于设置了外键约束，会级联删除相关数据）
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);

    res.json({
      success: true,
      data: { message: '课程删除成功' }
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  requireEditor,
  requireViewer
};
