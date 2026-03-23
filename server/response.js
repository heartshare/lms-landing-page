// HTTP 响应辅助函数

/**
 * 发送 JSON 响应
 * @param {Object} res - HTTP 响应对象
 * @param {Object} data - 要发送的数据
 * @param {number} statusCode - HTTP 状态码（默认: 200）
 */
function sendJSON(res, data, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * 发送成功响应
 * @param {Object} res - HTTP 响应对象
 * @param {Object} data - 响应数据
 * @param {number} statusCode - HTTP 状态码（默认: 200）
 */
function sendSuccess(res, data, statusCode = 200) {
  sendJSON(res, { success: true, data }, statusCode);
}

/**
 * 发送错误响应
 * @param {Object} res - HTTP 响应对象
 * @param {string} error - 错误信息
 * @param {number} statusCode - HTTP 状态码（默认: 500）
 */
function sendError(res, error, statusCode = 500) {
  sendJSON(res, { success: false, error }, statusCode);
}

module.exports = {
  sendJSON,
  sendSuccess,
  sendError
};
