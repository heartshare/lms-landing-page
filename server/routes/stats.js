// 统计数据路由
const { db } = require('../db');
const { requireViewer } = require('../middleware/rbac');

/**
 * 获取总览统计
 * GET /api/stats/overview
 */
function getOverviewStats(req, res) {
  try {
    // 课程总数
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;

    // 平均评分（假设有评分为 1-5）
    const avgRating = db.prepare(`
      SELECT AVG(rating) as avg_rating
      FROM reviews
    `).get().avg_rating || 0;

    // 评论总数
    const totalReviews = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;

    // 章节总数
    const totalChapters = db.prepare('SELECT COUNT(*) as count FROM chapters').get().count;

    // 课时总数
    const totalLessons = db.prepare('SELECT COUNT(*) as count FROM lessons').get().count;

    // 免费课时数
    const freeLessons = db.prepare('SELECT COUNT(*) as count FROM lessons WHERE is_free = 1').get().count;

    // 课程总价值（所有课程价格之和）
    const totalValue = db.prepare(`
      SELECT SUM(price) as total
      FROM courses
    `).get().total || 0;

    // 各难度级别课程数量
    const coursesByLevel = db.prepare(`
      SELECT
        difficulty,
        COUNT(*) as count
      FROM courses
      WHERE difficulty IS NOT NULL
      GROUP BY difficulty
    `).all();

    // 最近7天添加的课程
    const recentCourses = db.prepare(`
      SELECT id, title, price, date_added
      FROM courses
      WHERE date_added IS NOT NULL
      ORDER BY date_added DESC
      LIMIT 5
    `).all();

    // 各分类课程数量
    const coursesByCategory = db.prepare(`
      SELECT
        category,
        COUNT(*) as count
      FROM courses
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `).all();

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          avgRating: parseFloat(avgRating.toFixed(2)),
          totalReviews,
          totalChapters,
          totalLessons,
          freeLessons,
          totalValue: parseFloat(totalValue.toFixed(2))
        },
        coursesByLevel,
        recentCourses,
        coursesByCategory
      }
    });
  } catch (error) {
    console.error('获取总览统计错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取最近添加的课程
 * GET /api/stats/recent-courses
 */
function getRecentCourses(req, res) {
  try {
    const { limit = 10 } = req.query;

    const courses = db.prepare(`
      SELECT
        c.id,
        c.title,
        c.price,
        c.difficulty,
        c.image_url,
        c.date_added,
        c.category,
        COUNT(ch.id) as chapter_count,
        COUNT(l.id) as lesson_count
      FROM courses c
      LEFT JOIN chapters ch ON c.id = ch.course_id
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      GROUP BY c.id
      ORDER BY c.date_added DESC
      LIMIT ?
    `).all(limit);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('获取最近课程错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取课程详细统计
 * GET /api/stats/course/:id
 */
function getCourseStats(req, res) {
  try {
    const { id } = req.params;

    // 检查课程是否存在
    const course = db.prepare('SELECT id, title FROM courses WHERE id = ?').get(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 章节数
    const chapterCount = db.prepare(
      'SELECT COUNT(*) as count FROM chapters WHERE course_id = ?'
    ).get(id).count;

    // 课时数
    const lessonCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM chapters ch
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      WHERE ch.course_id = ?
    `).get(id).count;

    // 总时长
    const totalDuration = db.prepare(`
      SELECT SUM(l.duration) as total
      FROM chapters ch
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      WHERE ch.course_id = ?
    `).get(id).total || 0;

    // 免费课时数
    const freeLessonCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM chapters ch
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      WHERE ch.course_id = ? AND l.is_free = 1
    `).get(id).count;

    // 评论数和平均评分
    const reviewStats = db.prepare(`
      SELECT
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM reviews
      WHERE course_id = ?
    `).get(id);

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title
        },
        chapterCount,
        lessonCount,
        totalDuration: parseFloat(totalDuration.toFixed(2)),
        freeLessonCount,
        reviewCount: reviewStats.count,
        avgRating: reviewStats.avg_rating ? parseFloat(reviewStats.avg_rating.toFixed(2)) : 0
      }
    });
  } catch (error) {
    console.error('获取课程统计错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  getOverviewStats,
  getRecentCourses,
  getCourseStats,
  requireViewer
};
