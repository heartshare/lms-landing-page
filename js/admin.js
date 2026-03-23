/**
 * admin.js - 靈學管理後台
 * 管理後台核心 JavaScript，包含 API 調用、面板切換、表單處理等邏輯
 */

// ============================================
// 配置常量
// ============================================
const API_BASE = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 10;

// ============================================
// JWT Token 管理
// ============================================
function getToken() {
  return localStorage.getItem('lms_token');
}

function setToken(token) {
  localStorage.setItem('lms_token', token);
}

function clearToken() {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_user');
}

function getUser() {
  const userStr = localStorage.getItem('lms_user');
  return userStr ? JSON.parse(userStr) : null;
}

// ============================================
// 通用 API 請求封裝
// ============================================
async function api(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });

    // 401 未授權，跳轉登錄頁
    if (res.status === 401) {
      clearToken();
      window.location.href = 'admin-login.html';
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
}

// ============================================
// 顯示/隱藏加載狀態
// ============================================
function showLoading() {
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================
// 顯示通知消息
// ============================================
function showToast(message, type = 'success') {
  // 創建 toast 元素
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';

  toast.className = `fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in-up`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-5 h-5"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);
  lucide.createIcons();

  // 3 秒後自動消失
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// 模態框管理
// ============================================
function showModal(html) {
  const container = document.getElementById('modalContainer');
  container.innerHTML = html;
  lucide.createIcons();

  // 點擊背景關閉
  const modal = container.querySelector('.modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
  }

  // ESC 關閉
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      hideModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function hideModal() {
  const container = document.getElementById('modalContainer');
  container.innerHTML = '';
}

// 確認對話框
function showConfirm(message, onConfirm) {
  const html = `
    <div class="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
            <i data-lucide="alert-triangle" class="w-6 h-6 text-yellow-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-text dark:text-gray-100">確認操作</h3>
        </div>
        <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
        <div class="flex justify-end space-x-3">
          <button onclick="hideModal()" class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            取消
          </button>
          <button onclick="window.confirmCallback()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            確認
          </button>
        </div>
      </div>
    </div>
  `;

  window.confirmCallback = () => {
    hideModal();
    onConfirm();
  };

  showModal(html);
}

// ============================================
// 面板切換
// ============================================
let currentPanel = 'dashboard';

function switchPanel(panelName) {
  // 隱藏所有面板
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // 顯示目標面板
  const targetPanel = document.getElementById(`${panelName}Panel`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
    currentPanel = panelName;

    // 更新導航高亮
    document.querySelectorAll('.nav-item').forEach(item => {
      const isActive = item.dataset.panel === panelName;
      if (isActive) {
        item.classList.remove('text-primary-200', 'hover:bg-primary-800', 'hover:text-white');
        item.classList.add('bg-primary-700', 'text-white');
      } else {
        item.classList.remove('bg-primary-700', 'text-white');
        item.classList.add('text-primary-200', 'hover:bg-primary-800', 'hover:text-white');
      }
    });

    // 加載面板數據
    loadPanelData(panelName);
  }
}

// ============================================
// 加載面板數據
// ============================================
async function loadPanelData(panelName) {
  showLoading();

  try {
    switch (panelName) {
      case 'dashboard':
        await loadDashboardData();
        break;
      case 'courses':
        await loadCoursesData();
        break;
      case 'users':
        await loadUsersData();
        break;
      case 'settings':
        // 設置面板不需要加載額外數據
        break;
    }
  } catch (error) {
    console.error('加載數據失敗:', error);
    showToast('加載數據失敗', 'error');
  } finally {
    hideLoading();
  }
}

// ============================================
// 儀表板數據
// ============================================
async function loadDashboardData() {
  const stats = await api('/stats/dashboard');
  if (stats) {
    document.getElementById('totalCourses').textContent = stats.totalCourses || 0;
    document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
    document.getElementById('avgRating').textContent = stats.avgRating || '0.0';
    document.getElementById('totalRevenue').textContent = `¥${(stats.totalRevenue || 0).toLocaleString()}`;
  }

  // 最近課程
  const courses = await api('/courses?limit=5');
  if (courses && courses.data) {
    renderRecentCoursesTable(courses.data);
  }
}

function renderRecentCoursesTable(courses) {
  const tbody = document.getElementById('recentCoursesTable');
  if (!courses || courses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          暫無數據
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = courses.map(course => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center space-x-3">
          <img src="${course.image || 'https://via.placeholder.com/48'}" alt="${course.title}" class="w-12 h-12 rounded-lg object-cover">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">${course.title}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${course.subtitle || ''}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
          ${course.category || '未分類'}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ¥${(course.price || 0).toLocaleString()}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ${course.studentCount || 0}
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-1">
          <i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-current"></i>
          <span class="text-sm text-gray-700 dark:text-gray-300">${course.rating || '0.0'}</span>
        </div>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

// ============================================
// 課程管理數據
// ============================================
let coursesPage = 1;
let coursesSort = { field: 'id', order: 'desc' };

async function loadCoursesData() {
  const search = document.getElementById('courseSearch')?.value || '';
  const category = document.getElementById('courseCategoryFilter')?.value || '';
  const difficulty = document.getElementById('courseDifficultyFilter')?.value || '';

  const params = new URLSearchParams({
    page: coursesPage,
    limit: ITEMS_PER_PAGE,
    sort: coursesSort.field,
    order: coursesSort.order,
  });
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);

  const response = await api(`/courses?${params.toString()}`);
  if (response) {
    renderCoursesTable(response.data || []);
    renderCoursesPagination(response.pagination || {});
  }
}

function renderCoursesTable(courses) {
  const tbody = document.getElementById('coursesTableBody');
  if (!courses || courses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          暫無數據
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = courses.map(course => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td class="px-6 py-4">
        <img src="${course.image || 'https://via.placeholder.com/64'}" alt="${course.title}" class="w-16 h-12 rounded-lg object-cover">
      </td>
      <td class="px-6 py-4">
        <p class="font-medium text-gray-900 dark:text-gray-100">${course.title}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">${course.subtitle || ''}</p>
      </td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
          ${course.category || '未分類'}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ${course.originalPrice ? `<span class="line-through text-gray-400 mr-2">¥${course.originalPrice.toLocaleString()}</span>` : ''}
        ¥${(course.price || 0).toLocaleString()}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ${course.studentCount || 0}
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-1">
          <i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-current"></i>
          <span class="text-sm text-gray-700 dark:text-gray-300">${course.rating || '0.0'}</span>
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-2">
          <button onclick="editCourse(${course.id})" class="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" title="編輯">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>
          <button onclick="viewChapters(${course.id})" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="查看章節">
            <i data-lucide="list" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteCourse(${course.id})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="刪除">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

function renderCoursesPagination(pagination) {
  const { page, totalPages, total } = pagination;
  coursesPage = page;

  document.getElementById('coursesPageInfo').textContent = `${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, total)}`;
  document.getElementById('coursesTotal').textContent = total;

  document.getElementById('coursesPrevPage').disabled = page <= 1;
  document.getElementById('coursesNextPage').disabled = page >= totalPages;

  // 生成頁碼
  const paginationEl = document.getElementById('coursesPagination');
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) {
      html += `<button class="px-3 py-1 rounded bg-primary-600 text-white text-sm">${i}</button>`;
    } else {
      html += `<button onclick="goToCoursesPage(${i})" class="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">${i}</button>`;
    }
  }
  paginationEl.innerHTML = html;
}

function goToCoursesPage(page) {
  coursesPage = page;
  loadCoursesData();
}

// ============================================
// 課程編輯模態框
// ============================================
function editCourse(courseId) {
  showToast('加載課程數據中...', 'info');
  api(`/courses/${courseId}`).then(course => {
    if (course) {
      showCourseModal(course);
    }
  });
}

function showCourseModal(course = null) {
  const isEdit = course !== null;
  const html = `
    <div class="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-xl font-semibold text-text dark:text-gray-100">${isEdit ? '編輯課程' : '新建課程'}</h3>
        </div>
        <form id="courseForm" class="p-6 space-y-6">
          <input type="hidden" name="id" value="${course?.id || ''}">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">課程標題 *</label>
              <input type="text" name="title" value="${course?.title || ''}" required
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">副標題</label>
              <input type="text" name="subtitle" value="${course?.subtitle || ''}"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">分類</label>
              <select name="category"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
                <option value="">選擇分類</option>
                <option value="programming" ${course?.category === 'programming' ? 'selected' : ''}>編程開發</option>
                <option value="design" ${course?.category === 'design' ? 'selected' : ''}>設計創意</option>
                <option value="business" ${course?.category === 'business' ? 'selected' : ''}>商業管理</option>
                <option value="marketing" ${course?.category === 'marketing' ? 'selected' : ''}>市場營銷</option>
                <option value="data" ${course?.category === 'data' ? 'selected' : ''}>數據科學</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">難度</label>
              <select name="difficulty"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
                <option value="">選擇難度</option>
                <option value="beginner" ${course?.difficulty === 'beginner' ? 'selected' : ''}>初級</option>
                <option value="intermediate" ${course?.difficulty === 'intermediate' ? 'selected' : ''}>中級</option>
                <option value="advanced" ${course?.difficulty === 'advanced' ? 'selected' : ''}>高級</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">價格 *</label>
              <input type="number" name="price" value="${course?.price || ''}" required min="0" step="0.01"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">原價</label>
              <input type="number" name="originalPrice" value="${course?.originalPrice || ''}" min="0" step="0.01"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">時長（小時）</label>
              <input type="number" name="duration" value="${course?.duration || ''}" min="0"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">評分</label>
              <input type="number" name="rating" value="${course?.rating || ''}" min="0" max="5" step="0.1"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">課程描述</label>
              <textarea name="description" rows="4"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">${course?.description || ''}</textarea>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-text dark:text-primary-300 mb-2">封面圖片 URL</label>
              <input type="url" name="image" value="${course?.image || ''}"
                class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100">
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onclick="hideModal()" class="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              取消
            </button>
            <button type="submit" class="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
              ${isEdit ? '保存' : '創建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(html);

  // 表單提交
  document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (data.id) {
        await api(`/courses/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        showToast('課程更新成功');
      } else {
        delete data.id;
        await api('/courses', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        showToast('課程創建成功');
      }
      hideModal();
      loadCoursesData();
    } catch (error) {
      console.error('保存課程失敗:', error);
      showToast('保存失敗', 'error');
    }
  });
}

// ============================================
// 刪除課程
// ============================================
function deleteCourse(courseId) {
  showConfirm('確定要刪除這個課程嗎？此操作不可恢復。', async () => {
    try {
      await api(`/courses/${courseId}`, { method: 'DELETE' });
      showToast('課程刪除成功');
      loadCoursesData();
    } catch (error) {
      console.error('刪除課程失敗:', error);
      showToast('刪除失敗', 'error');
    }
  });
}

// ============================================
// 查看章節
// ============================================
function viewChapters(courseId) {
  api(`/courses/${courseId}/chapters`).then(chapters => {
    if (chapters) {
      showChaptersModal(courseId, chapters);
    }
  });
}

function showChaptersModal(courseId, chapters) {
  const html = `
    <div class="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-text dark:text-gray-100">課程章節</h3>
          <button onclick="hideModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <i data-lucide="x" class="w-5 h-5 text-gray-500"></i>
          </button>
        </div>
        <div class="p-6">
          ${!chapters || chapters.length === 0 ? `
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i data-lucide="folder-open" class="w-12 h-12 mx-auto mb-4 text-gray-400"></i>
              <p>暫無章節</p>
              <button onclick="addChapter(${courseId})" class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                添加章節
              </button>
            </div>
          ` : `
            <div class="space-y-4">
              ${chapters.map((chapter, index) => `
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div class="p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between cursor-pointer" onclick="toggleChapter(${chapter.id})">
                    <div class="flex items-center space-x-3">
                      <span class="text-sm font-medium text-primary-600">第 ${index + 1} 章</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">${chapter.title}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button onclick="event.stopPropagation(); editChapter(${courseId}, ${chapter.id})" class="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                      </button>
                      <button onclick="event.stopPropagation(); deleteChapter(${courseId}, ${chapter.id})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                      <i data-lucide="chevron-down" class="w-5 h-5 text-gray-400 chapter-chevron" id="chevron-${chapter.id}"></i>
                    </div>
                  </div>
                  <div class="chapter-lessons hidden p-4 bg-white dark:bg-gray-900" id="lessons-${chapter.id}">
                    ${!chapter.lessons || chapter.lessons.length === 0 ? `
                      <p class="text-gray-500 dark:text-gray-400 mb-4">暫無課時</p>
                      <button onclick="addLesson(${courseId}, ${chapter.id})" class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        添加課時
                      </button>
                    ` : `
                      <div class="space-y-2 mb-4">
                        ${chapter.lessons.map((lesson, lIndex) => `
                          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div class="flex items-center space-x-3">
                              <i data-lucide="play-circle" class="w-4 h-4 text-gray-400"></i>
                              <span class="text-sm text-gray-900 dark:text-gray-100">課時 ${lIndex + 1}: ${lesson.title}</span>
                            </div>
                            <div class="flex items-center space-x-1">
                              <button onclick="editLesson(${courseId}, ${chapter.id}, ${lesson.id})" class="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors">
                                <i data-lucide="edit-2" class="w-3 h-3"></i>
                              </button>
                              <button onclick="deleteLesson(${courseId}, ${chapter.id}, ${lesson.id})" class="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                <i data-lucide="trash-2" class="w-3 h-3"></i>
                              </button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                      <button onclick="addLesson(${courseId}, ${chapter.id})" class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        添加課時
                      </button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
            <button onclick="addChapter(${courseId})" class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              添加章節
            </button>
          `}
        </div>
      </div>
    </div>
  `;
  showModal(html);
}

function toggleChapter(chapterId) {
  const lessonsEl = document.getElementById(`lessons-${chapterId}`);
  const chevronEl = document.getElementById(`chevron-${chapterId}`);
  lessonsEl.classList.toggle('hidden');
  chevronEl.style.transform = lessonsEl.classList.contains('hidden') ? '' : 'rotate(180deg)';
}

// ============================================
// 用戶管理數據
// ============================================
let usersPage = 1;

async function loadUsersData() {
  const response = await api(`/users?page=${usersPage}&limit=${ITEMS_PER_PAGE}`);
  if (response) {
    renderUsersTable(response.data || []);
    renderUsersPagination(response.pagination || {});
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          暫無數據
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <i data-lucide="user" class="w-5 h-5 text-primary-600"></i>
          </div>
          <span class="font-medium text-gray-900 dark:text-gray-100">${user.username}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ${user.email || '-'}
      </td>
      <td class="px-6 py-4">
        <select onchange="updateUserRole(${user.id}, this.value)" class="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-gray-100">
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理員</option>
          <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>編輯</option>
          <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>查看者</option>
        </select>
      </td>
      <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
      </td>
      <td class="px-6 py-4">
        <button onclick="deleteUser(${user.id})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="刪除">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

function renderUsersPagination(pagination) {
  const { page, totalPages, total } = pagination;
  usersPage = page;

  document.getElementById('usersPageInfo').textContent = `${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, total)}`;
  document.getElementById('usersTotal').textContent = total;

  document.getElementById('usersPrevPage').disabled = page <= 1;
  document.getElementById('usersNextPage').disabled = page >= totalPages;

  const paginationEl = document.getElementById('usersPagination');
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) {
      html += `<button class="px-3 py-1 rounded bg-primary-600 text-white text-sm">${i}</button>`;
    } else {
      html += `<button onclick="goToUsersPage(${i})" class="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">${i}</button>`;
    }
  }
  paginationEl.innerHTML = html;
}

function goToUsersPage(page) {
  usersPage = page;
  loadUsersData();
}

async function updateUserRole(userId, role) {
  try {
    await api(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    showToast('角色更新成功');
  } catch (error) {
    console.error('更新角色失敗:', error);
    showToast('更新失敗', 'error');
  }
}

async function deleteUser(userId) {
  showConfirm('確定要刪除這個用戶嗎？此操作不可恢復。', async () => {
    try {
      await api(`/users/${userId}`, { method: 'DELETE' });
      showToast('用戶刪除成功');
      loadUsersData();
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      showToast('刪除失敗', 'error');
    }
  });
}

// ============================================
// 系統設置
// ============================================
document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 驗證
  if (newPassword !== confirmPassword) {
    showToast('兩次輸入的密碼不一致', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('密碼長度至少為 6 位', 'error');
    return;
  }

  try {
    await api('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    showToast('密碼修改成功');
    e.target.reset();
  } catch (error) {
    console.error('修改密碼失敗:', error);
    showToast('修改失敗', 'error');
  }
});

// ============================================
// 退出登錄
// ============================================
function logout() {
  showConfirm('確定要退出登錄嗎？', () => {
    clearToken();
    window.location.href = 'admin-login.html';
  });
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // 檢查登錄狀態
  const token = getToken();
  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  const user = getUser();
  if (user) {
    document.getElementById('sidebarUsername').textContent = user.username;
    document.getElementById('sidebarRole').textContent = user.role === 'admin' ? '管理員' : user.role === 'editor' ? '編輯' : '查看者';
  }

  // 導航點擊事件
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const panel = item.dataset.panel;
      if (panel) {
        switchPanel(panel);
        // 移動端：關閉側邊欄
        if (window.innerWidth < 1024) {
          toggleSidebar();
        }
      }
    });
  });

  // 退出登錄按鈕
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('dropdownLogoutBtn').addEventListener('click', logout);

  // 用戶下拉菜單
  document.getElementById('userMenuBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown').classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    document.getElementById('userDropdown').classList.add('hidden');
  });

  // 移動端側邊欄
  document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);

  // 新建課程按鈕
  document.getElementById('newCourseBtn')?.addEventListener('click', () => showCourseModal());

  // 課程搜索和篩選
  document.getElementById('courseSearch')?.addEventListener('input', debounce(() => {
    coursesPage = 1;
    loadCoursesData();
  }, 300));
  document.getElementById('courseCategoryFilter')?.addEventListener('change', () => {
    coursesPage = 1;
    loadCoursesData();
  });
  document.getElementById('courseDifficultyFilter')?.addEventListener('change', () => {
    coursesPage = 1;
    loadCoursesData();
  });

  // 課程表格排序
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (coursesSort.field === field) {
        coursesSort.order = coursesSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        coursesSort.field = field;
        coursesSort.order = 'asc';
      }
      loadCoursesData();
    });
  });

  // 分頁按鈕
  document.getElementById('coursesPrevPage')?.addEventListener('click', () => {
    if (coursesPage > 1) {
      coursesPage--;
      loadCoursesData();
    }
  });
  document.getElementById('coursesNextPage')?.addEventListener('click', () => {
    coursesPage++;
    loadCoursesData();
  });

  document.getElementById('usersPrevPage')?.addEventListener('click', () => {
    if (usersPage > 1) {
      usersPage--;
      loadUsersData();
    }
  });
  document.getElementById('usersNextPage')?.addEventListener('click', () => {
    usersPage++;
    loadUsersData();
  });

  // 加載初始面板
  loadPanelData(currentPanel);

  // 初始化 Lucide Icons
  lucide.createIcons();
});

// ============================================
// 工具函數
// ============================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 章節和課時相關函數（佔位符，實際實現需要根據 API 結構調整）
function addChapter(courseId) {
  showToast('添加章節功能開發中', 'info');
}

function editChapter(courseId, chapterId) {
  showToast('編輯章節功能開發中', 'info');
}

function deleteChapter(courseId, chapterId) {
  showConfirm('確定要刪除這個章節嗎？', async () => {
    try {
      await api(`/courses/${courseId}/chapters/${chapterId}`, { method: 'DELETE' });
      showToast('章節刪除成功');
      viewChapters(courseId);
    } catch (error) {
      console.error('刪除章節失敗:', error);
      showToast('刪除失敗', 'error');
    }
  });
}

function addLesson(courseId, chapterId) {
  showToast('添加課時功能開發中', 'info');
}

function editLesson(courseId, chapterId, lessonId) {
  showToast('編輯課時功能開發中', 'info');
}

function deleteLesson(courseId, chapterId, lessonId) {
  showConfirm('確定要刪除這個課時嗎？', async () => {
    try {
      await api(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, { method: 'DELETE' });
      showToast('課時刪除成功');
      viewChapters(courseId);
    } catch (error) {
      console.error('刪除課時失敗:', error);
      showToast('刪除失敗', 'error');
    }
  });
}
