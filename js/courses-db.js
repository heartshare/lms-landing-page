/**
 * courses-db.js
 * Loads courses.db (SQLite) via sql.js (WebAssembly) and exposes
 * async query helpers used by courses.html and index.html.
 *
 * sql.js CDN: https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js
 */

(function (global) {
  'use strict';

  let _db = null;
  let _initPromise = null;

  /**
   * Initialize sql.js and load courses.db.
   * Returns a Promise that resolves when the DB is ready.
   */
  function init() {
    if (_initPromise) return _initPromise;

    _initPromise = new Promise((resolve, reject) => {
      if (typeof initSqlJs === 'undefined') {
        reject(new Error('sql.js not loaded. Include sql-wasm.js before courses-db.js'));
        return;
      }

      initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      }).then(SQL => {
        fetch('courses.db')
          .then(r => {
            if (!r.ok) throw new Error('Failed to fetch courses.db: ' + r.status);
            return r.arrayBuffer();
          })
          .then(buf => {
            _db = new SQL.Database(new Uint8Array(buf));
            resolve(_db);
          })
          .catch(reject);
      }).catch(reject);
    });

    return _initPromise;
  }

  /**
   * Run a SELECT query and return rows as plain objects.
   */
  function query(sql, params) {
    if (!_db) throw new Error('DB not initialized. Call CoursesDB.init() first.');
    const stmt = _db.prepare(sql);
    if (params) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  /** Get all courses (optionally filtered). */
  function getAllCourses() {
    return query('SELECT * FROM courses ORDER BY id');
  }

  /** Get a single course by id. */
  function getCourseById(id) {
    const rows = query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /** Get recommended courses. */
  function getRecommended() {
    return query('SELECT * FROM recommended_courses ORDER BY id');
  }

  // Export
  global.CoursesDB = { init, query, getAllCourses, getCourseById, getRecommended };
})(window);
