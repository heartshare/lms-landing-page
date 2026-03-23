// 数据库连接和初始化模块
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'courses.db');

// 创建数据库连接
const db = new Database(dbPath, { verbose: console.log });

// 初始化数据库表
function initDatabase() {
  console.log('正在初始化数据库...');

  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'viewer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 检查是否已存在 admin 用户
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

  if (!existingAdmin) {
    // 创建默认管理员账户: admin / admin2026
    const passwordHash = bcrypt.hashSync('admin2026', 10);
    db.prepare(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
    ).run('admin', passwordHash, 'admin');
    console.log('已创建默认管理员账户: admin / admin2026');
  } else {
    console.log('管理员账户已存在，跳过创建');
  }

  // 验证现有表
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('当前数据库表:', tables.map(t => t.name).join(', '));

  console.log('数据库初始化完成！');
}

// 导出数据库实例和初始化函数
module.exports = { db, initDatabase };

// 如果直接运行此文件，执行初始化
if (require.main === module) {
  initDatabase();
}
