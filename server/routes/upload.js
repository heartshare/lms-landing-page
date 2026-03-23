// 文件上传路由
const fs = require('fs');
const path = require('path');
const { requireEditor } = require('../middleware/rbac');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * 上传图片
 * POST /api/upload
 */
function uploadImage(req, res) {
  try {
    const boundary = req.headers['content-type']?.split('boundary=')[1];

    if (!boundary) {
      return res.status(400).json({
        success: false,
        error: '无效的请求格式'
      });
    }

    // 解析 multipart/form-data
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parts = buffer.toString('binary').split(`--${boundary}`);

      let fileData = null;
      let fileName = '';
      let contentType = '';

      // 解析文件部分
      for (const part of parts) {
        if (!part.includes('Content-Disposition')) continue;

        const nameMatch = part.match(/name="([^"]+)"/);
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);

        if (filenameMatch && contentTypeMatch) {
          fileName = filenameMatch[1];
          contentType = contentTypeMatch[1];
          const dataStart = part.indexOf('\r\n\r\n') + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          fileData = Buffer.from(part.substring(dataStart, dataEnd), 'binary');
          break;
        }
      }

      if (!fileData) {
        return res.status(400).json({
          success: false,
          error: '未找到文件'
        });
      }

      // 验证文件类型（只允许图片）
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (!allowedTypes.includes(contentType)) {
        return res.status(400).json({
          success: false,
          error: '只支持图片格式 (JPEG, PNG, GIF, WebP)'
        });
      }

      // 验证文件大小（最大 5MB）
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileData.length > maxSize) {
        return res.status(400).json({
          success: false,
          error: '文件大小不能超过 5MB'
        });
      }

      // 生成唯一文件名
      const ext = path.extname(fileName);
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      // 保存文件
      fs.writeFileSync(filePath, fileData);

      // 返回文件 URL
      const fileUrl = `/uploads/${uniqueName}`;

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename: uniqueName,
          size: fileData.length,
          contentType
        }
      });
    });
  } catch (error) {
    console.error('上传图片错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 获取上传的文件
 * GET /api/uploads/:filename
 */
function serveUpload(req, res) {
  try {
    const { filename } = req.params;

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: '无效的文件名'
      });
    }

    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    // 获取文件扩展名以设置正确的 Content-Type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // 发送文件
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('服务文件错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

/**
 * 删除上传的文件
 * DELETE /api/uploads/:filename
 */
function deleteUpload(req, res) {
  try {
    const { filename } = req.params;

    // 安全检查
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: '无效的文件名'
      });
    }

    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: { message: '文件删除成功' }
    });
  } catch (error) {
    console.error('删除文件错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
}

module.exports = {
  uploadImage,
  serveUpload,
  deleteUpload,
  requireEditor
};
