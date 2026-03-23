#!/usr/bin/env python3
"""Generate courses.db SQLite database for the LMS landing page."""
import sqlite3, os, json

DB_PATH = os.path.join(os.path.dirname(__file__), 'courses.db')

# ─── Core course list ────────────────────────────────────────────────────────
courses = [
    {
        'id': 1, 'title': 'Web 开发实战：从零到全栈',
        'subtitle': '学习 HTML、CSS、JavaScript 和 React，构建完整的全栈应用。',
        'category': 'frontend', 'category_label': '前端',
        'price': 199, 'original_price': 299, 'rating': 4.9, 'students': 2100,
        'duration': 12, 'difficulty': 'beginner', 'difficulty_label': '入门',
        'badge': '热门', 'badge_color': 'blue', 'has_discount': 1,
        'date_added': '2025-03-15',
        'image_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
        'tag_color': 'blue',
    },
    {
        'id': 2, 'title': 'Python 数据科学与机器学习',
        'subtitle': '掌握 Python 数据分析、可视化和机器学习核心算法。',
        'category': 'data', 'category_label': '数据',
        'price': 299, 'original_price': 399, 'rating': 4.8, 'students': 1800,
        'duration': 18, 'difficulty': 'intermediate', 'difficulty_label': '中级',
        'badge': '新课', 'badge_color': 'green', 'has_discount': 0,
        'date_added': '2025-03-10',
        'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        'tag_color': 'green',
    },
    {
        'id': 3, 'title': 'UI/UX 设计从入门到精通',
        'subtitle': '学习 Figma 工具和设计思维，打造出色的用户界面。',
        'category': 'design', 'category_label': '设计',
        'price': 249, 'original_price': None, 'rating': 4.7, 'students': 956,
        'duration': 10, 'difficulty': 'beginner', 'difficulty_label': '入门',
        'badge': None, 'badge_color': None, 'has_discount': 0,
        'date_added': '2025-03-05',
        'image_url': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
        'tag_color': 'purple',
    },
    {
        'id': 4, 'title': '商业分析与决策能力提升',
        'subtitle': '学习数据驱动的商业分析方法，提升战略决策能力。',
        'category': 'business', 'category_label': '商业',
        'price': 179, 'original_price': 279, 'rating': 4.9, 'students': 1500,
        'duration': 8, 'difficulty': 'intermediate', 'difficulty_label': '中级',
        'badge': '畅销', 'badge_color': 'amber', 'has_discount': 1,
        'date_added': '2025-02-28',
        'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
        'tag_color': 'amber',
    },
    {
        'id': 5, 'title': 'React 18 高级进阶实战',
        'subtitle': '深入理解 React 核心原理，掌握 Hooks、Context 和性能优化。',
        'category': 'frontend', 'category_label': '前端',
        'price': 259, 'original_price': None, 'rating': 4.8, 'students': 1200,
        'duration': 15, 'difficulty': 'advanced', 'difficulty_label': '高级',
        'badge': None, 'badge_color': None, 'has_discount': 0,
        'date_added': '2025-02-20',
        'image_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
        'tag_color': 'blue',
    },
    {
        'id': 6, 'title': 'SQL 数据库从入门到精通',
        'subtitle': '掌握 MySQL、PostgreSQL 等关系型数据库的核心技能。',
        'category': 'data', 'category_label': '数据',
        'price': 149, 'original_price': None, 'rating': 4.6, 'students': 856,
        'duration': 6, 'difficulty': 'beginner', 'difficulty_label': '入门',
        'badge': None, 'badge_color': None, 'has_discount': 0,
        'date_added': '2025-02-15',
        'image_url': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=250&fit=crop',
        'tag_color': 'green',
    },
    {
        'id': 7, 'title': 'Blender 3D 建模与渲染',
        'subtitle': '从零开始学习 3D 建模、材质和渲染技术。',
        'category': 'design', 'category_label': '设计',
        'price': 299, 'original_price': 399, 'rating': 4.7, 'students': 678,
        'duration': 20, 'difficulty': 'intermediate', 'difficulty_label': '中级',
        'badge': '限时', 'badge_color': 'red', 'has_discount': 1,
        'date_added': '2025-02-10',
        'image_url': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop',
        'tag_color': 'purple',
    },
    {
        'id': 8, 'title': 'PMP 项目管理认证课程',
        'subtitle': '系统学习项目管理知识体系，助力 PMP 认证考试。',
        'category': 'business', 'category_label': '商业',
        'price': 399, 'original_price': None, 'rating': 4.9, 'students': 2300,
        'duration': 14, 'difficulty': 'advanced', 'difficulty_label': '高级',
        'badge': None, 'badge_color': None, 'has_discount': 0,
        'date_added': '2025-02-05',
        'image_url': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
        'tag_color': 'amber',
    },
]

# ─── Recommended courses ─────────────────────────────────────────────────────
recommended = [
    {'id': 101, 'title': 'JavaScript 高级编程实战', 'price': 349, 'duration': 25,
     'badge': '推荐', 'badge_color': 'blue',
     'image_url': 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=200&fit=crop'},
    {'id': 102, 'title': '网络安全与渗透测试', 'price': 499, 'duration': 30,
     'badge': '热门', 'badge_color': 'purple',
     'image_url': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop'},
    {'id': 103, 'title': '数据分析可视化实战', 'price': 279, 'duration': 16,
     'badge': None, 'badge_color': None,
     'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop'},
]

# ─── Course detail data ───────────────────────────────────────────────────────
# Keyed by course id
details = {
    1: {
        'description': '学习 HTML、CSS、JavaScript 和 React，从零开始构建完整的全栈应用。本课程涵盖前端开发的所有核心技能，助你成为一名优秀的全栈工程师。',
        'total_lessons': 186,
        'video_hours': 42,
        'articles': 20,
        'last_updated': '2026-03-01',
        'language': '中文',
        'video_url': 'https://www.youtube.com/embed/PkZNo7MFNFg',
        'instructor_name': '张明',
        'instructor_title': '高级前端工程师 · 10 年经验',
        'instructor_bio': '张明拥有 10 年前端开发经验，曾在多家知名科技公司担任技术主管。擅长 React、Vue 等现代前端框架，对全栈开发有深入研究。已累计培训超过 50,000 名学员，学员好评率高达 98%。',
        'instructor_courses': 15,
        'instructor_students': '50,000+',
        'instructor_rating': 4.9,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 HTML5 和 CSS3 核心技术', '熟练使用 JavaScript ES6+ 语法',
            '深入理解 React 框架及生态', '构建完整的全栈 Web 应用',
            '掌握 Node.js 后端开发基础', '学会使用 Git 进行版本控制',
        ]),
        'requirements': json.dumps(['基本的电脑操作能力', '无需编程基础，从零开始', '一台可以上网的电脑']),
        'rating_5': 85, 'rating_4': 10, 'rating_3': 3, 'rating_2': 1, 'rating_1': 1,
    },
    2: {
        'description': '本课程系统讲解 Python 数据分析与机器学习，从 NumPy、Pandas 到 Scikit-learn，帮助你掌握数据科学全流程。',
        'total_lessons': 156, 'video_hours': 36, 'articles': 15,
        'last_updated': '2026-02-15', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/Gv9_4yMHFhI',
        'instructor_name': '李华', 'instructor_title': '数据科学家 · 8 年经验',
        'instructor_bio': '李华是一位资深数据科学家，曾就职于多家互联网大厂的数据团队。拥有丰富的机器学习项目经验，擅长将复杂算法用简单易懂的方式讲解。',
        'instructor_courses': 8, 'instructor_students': '30,000+', 'instructor_rating': 4.8,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 Python 数据分析核心库', '熟练使用 Pandas 处理数据',
            '掌握数据可视化技术', '理解机器学习基本算法',
            '能独立完成数据分析项目',
        ]),
        'requirements': json.dumps(['了解基本 Python 语法', '高中数学基础', '对数据分析感兴趣']),
        'rating_5': 78, 'rating_4': 15, 'rating_3': 5, 'rating_2': 1, 'rating_1': 1,
    },
    3: {
        'description': '从零开始学习 UI/UX 设计，掌握 Figma 工具和设计思维，打造出色的用户界面和用户体验。',
        'total_lessons': 98, 'video_hours': 22, 'articles': 12,
        'last_updated': '2026-01-20', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/1Rs2ND1ryYc',
        'instructor_name': '王芳', 'instructor_title': 'UI/UX 设计师 · 7 年经验',
        'instructor_bio': '王芳是一位专业 UI/UX 设计师，曾为多家知名品牌设计数字产品。她的设计作品获得多项国际设计奖项，擅长将用户研究转化为出色的设计方案。',
        'instructor_courses': 5, 'instructor_students': '15,000+', 'instructor_rating': 4.7,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 Figma 设计工具', '理解用户体验设计原则',
            '学会进行用户研究', '设计完整的移动端 App',
            '建立个人设计作品集',
        ]),
        'requirements': json.dumps(['无需设计基础', '对设计有热情', '能使用电脑基本操作']),
        'rating_5': 72, 'rating_4': 18, 'rating_3': 7, 'rating_2': 2, 'rating_1': 1,
    },
    4: {
        'description': '系统学习数据驱动的商业分析方法，掌握 Excel、SQL 和 Power BI 等分析工具，提升战略决策能力。',
        'total_lessons': 82, 'video_hours': 18, 'articles': 10,
        'last_updated': '2026-02-01', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/RkPYbJcSbIA',
        'instructor_name': '陈刚', 'instructor_title': '商业分析师 · 12 年经验',
        'instructor_bio': '陈刚拥有 12 年商业分析经验，曾在多家世界 500 强企业担任高级分析师。擅长将复杂的商业数据转化为清晰的决策建议，培训学员超过 20,000 人。',
        'instructor_courses': 6, 'instructor_students': '20,000+', 'instructor_rating': 4.9,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握商业分析核心方法论', '熟练使用 Excel 数据分析',
            '学会 SQL 数据查询', '掌握 Power BI 可视化',
            '提升商业决策能力',
        ]),
        'requirements': json.dumps(['基本 Excel 使用经验', '对商业分析感兴趣', '无需编程基础']),
        'rating_5': 88, 'rating_4': 8, 'rating_3': 3, 'rating_2': 1, 'rating_1': 0,
    },
    5: {
        'description': '深入理解 React 18 核心原理，掌握 Hooks、Context、并发特性和性能优化，成为 React 高级开发者。',
        'total_lessons': 142, 'video_hours': 32, 'articles': 18,
        'last_updated': '2026-03-10', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/bMknfKXIFA8',
        'instructor_name': '刘强', 'instructor_title': 'React 核心贡献者 · 8 年经验',
        'instructor_bio': '刘强是 React 社区的活跃贡献者，曾在多家知名科技公司担任前端架构师。深入研究 React 内部原理，拥有丰富的大型前端项目经验。',
        'instructor_courses': 10, 'instructor_students': '25,000+', 'instructor_rating': 4.8,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '深入理解 React Fiber 架构', '掌握所有 React Hooks 用法',
            '熟练使用 Context 状态管理', '掌握 React 18 并发特性',
            '实现性能优化最佳实践',
        ]),
        'requirements': json.dumps(['熟悉 React 基础', '了解 JavaScript ES6+', '有一定项目经验']),
        'rating_5': 80, 'rating_4': 14, 'rating_3': 4, 'rating_2': 1, 'rating_1': 1,
    },
    6: {
        'description': '从基础到高级，系统掌握 MySQL、PostgreSQL 等关系型数据库的设计、查询优化和管理技能。',
        'total_lessons': 68, 'video_hours': 14, 'articles': 8,
        'last_updated': '2025-12-15', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/HXV3zeQKqGY',
        'instructor_name': '赵磊', 'instructor_title': '数据库工程师 · 9 年经验',
        'instructor_bio': '赵磊是一位资深数据库工程师，专注于关系型数据库设计与优化。曾参与多个大型互联网公司的数据库架构设计，对 MySQL 和 PostgreSQL 有深入研究。',
        'instructor_courses': 4, 'instructor_students': '12,000+', 'instructor_rating': 4.6,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 SQL 核心语法', '理解数据库设计原则',
            '学会查询优化技巧', '掌握事务和索引', '能独立管理数据库',
        ]),
        'requirements': json.dumps(['基本的计算机知识', '无需数据库经验', '对数据感兴趣']),
        'rating_5': 68, 'rating_4': 22, 'rating_3': 7, 'rating_2': 2, 'rating_1': 1,
    },
    7: {
        'description': '从零开始学习 Blender 3D 建模、材质、灯光和渲染，掌握专业级 3D 创作技能。',
        'total_lessons': 188, 'video_hours': 44, 'articles': 16,
        'last_updated': '2026-01-05', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/nIoXOplUvAw',
        'instructor_name': '孙艺', 'instructor_title': '3D 艺术家 · 11 年经验',
        'instructor_bio': '孙艺是一位专业 3D 艺术家，作品曾出现在多部电影和游戏中。拥有丰富的 Blender 教学经验，擅长将复杂的 3D 技术用简单易懂的方式传授给学员。',
        'instructor_courses': 7, 'instructor_students': '18,000+', 'instructor_rating': 4.7,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 Blender 界面和基本操作', '学会多边形建模技术',
            '掌握材质和纹理制作', '学会灯光和渲染设置',
            '完成专业级 3D 作品',
        ]),
        'requirements': json.dumps(['无需 3D 基础', '对 3D 创作感兴趣', '有一定的审美能力']),
        'rating_5': 74, 'rating_4': 17, 'rating_3': 6, 'rating_2': 2, 'rating_1': 1,
    },
    8: {
        'description': '系统学习 PMBOK 项目管理知识体系，结合实际案例，帮助你通过 PMP 认证考试，提升项目管理能力。',
        'total_lessons': 124, 'video_hours': 28, 'articles': 22,
        'last_updated': '2026-02-20', 'language': '中文',
        'video_url': 'https://www.youtube.com/embed/GqS8JZiQWqo',
        'instructor_name': '周建', 'instructor_title': 'PMP 认证讲师 · 15 年经验',
        'instructor_bio': '周建是一位资深 PMP 认证讲师，拥有 15 年项目管理实战经验。曾主导多个大型 IT 和建设项目，培训学员超过 40,000 人，PMP 考试通过率高达 95%。',
        'instructor_courses': 12, 'instructor_students': '40,000+', 'instructor_rating': 4.9,
        'gallery_images': json.dumps([
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        ]),
        'objectives': json.dumps([
            '掌握 PMBOK 五大过程组', '理解十大知识领域',
            '学会项目风险管理', '掌握敏捷项目管理方法',
            '通过 PMP 认证考试',
        ]),
        'requirements': json.dumps(['3 年以上工作经验', '对项目管理感兴趣', '有一定的英语阅读能力']),
        'rating_5': 90, 'rating_4': 7, 'rating_3': 2, 'rating_2': 1, 'rating_1': 0,
    },
}

# ─── Chapters per course ──────────────────────────────────────────────────────
chapters_data = {
    1: [
        {'order': 1, 'title': 'HTML 与 CSS 基础', 'lessons': 22, 'duration': '4 小时 30 分',
         'lessons_list': [
             {'order': 1, 'title': '课程介绍与学习路径', 'duration': '12:35', 'is_free': 1},
             {'order': 2, 'title': 'HTML 文档结构', 'duration': '18:20', 'is_free': 1},
             {'order': 3, 'title': 'CSS 选择器与盒模型', 'duration': '22:15', 'is_free': 0},
             {'order': 4, 'title': 'Flexbox 布局', 'duration': '25:40', 'is_free': 0},
             {'order': 5, 'title': 'Grid 布局', 'duration': '20:10', 'is_free': 0},
         ]},
        {'order': 2, 'title': 'JavaScript 核心', 'lessons': 28, 'duration': '6 小时 15 分',
         'lessons_list': [
             {'order': 1, 'title': 'JS 变量与数据类型', 'duration': '15:30', 'is_free': 0},
             {'order': 2, 'title': '函数与作用域', 'duration': '22:45', 'is_free': 0},
             {'order': 3, 'title': 'ES6+ 新特性', 'duration': '28:20', 'is_free': 0},
             {'order': 4, 'title': '异步编程与 Promise', 'duration': '32:10', 'is_free': 0},
         ]},
        {'order': 3, 'title': 'React 入门', 'lessons': 32, 'duration': '7 小时 20 分',
         'lessons_list': [
             {'order': 1, 'title': 'React 核心概念', 'duration': '20:15', 'is_free': 0},
             {'order': 2, 'title': '组件与 Props', 'duration': '25:30', 'is_free': 0},
             {'order': 3, 'title': 'State 与生命周期', 'duration': '28:45', 'is_free': 0},
             {'order': 4, 'title': 'Hooks 详解', 'duration': '35:20', 'is_free': 0},
         ]},
        {'order': 4, 'title': '全栈项目实战', 'lessons': 40, 'duration': '9 小时',
         'lessons_list': [
             {'order': 1, 'title': '项目架构设计', 'duration': '18:00', 'is_free': 0},
             {'order': 2, 'title': '后端 API 开发', 'duration': '42:30', 'is_free': 0},
             {'order': 3, 'title': '前后端联调', 'duration': '38:15', 'is_free': 0},
             {'order': 4, 'title': '部署上线', 'duration': '25:00', 'is_free': 0},
         ]},
    ],
    2: [
        {'order': 1, 'title': 'Python 基础回顾', 'lessons': 18, 'duration': '3 小时',
         'lessons_list': [
             {'order': 1, 'title': 'Python 环境搭建', 'duration': '10:20', 'is_free': 1},
             {'order': 2, 'title': '数据类型与结构', 'duration': '20:15', 'is_free': 1},
             {'order': 3, 'title': '函数与模块', 'duration': '18:30', 'is_free': 0},
         ]},
        {'order': 2, 'title': 'NumPy 与 Pandas', 'lessons': 35, 'duration': '7 小时',
         'lessons_list': [
             {'order': 1, 'title': 'NumPy 数组操作', 'duration': '25:40', 'is_free': 0},
             {'order': 2, 'title': 'Pandas DataFrame', 'duration': '30:15', 'is_free': 0},
             {'order': 3, 'title': '数据清洗技术', 'duration': '28:20', 'is_free': 0},
         ]},
        {'order': 3, 'title': '数据可视化', 'lessons': 28, 'duration': '5 小时',
         'lessons_list': [
             {'order': 1, 'title': 'Matplotlib 基础', 'duration': '22:10', 'is_free': 0},
             {'order': 2, 'title': 'Seaborn 高级图表', 'duration': '26:30', 'is_free': 0},
         ]},
        {'order': 4, 'title': '机器学习算法', 'lessons': 45, 'duration': '9 小时',
         'lessons_list': [
             {'order': 1, 'title': '线性回归', 'duration': '32:15', 'is_free': 0},
             {'order': 2, 'title': '决策树与随机森林', 'duration': '38:20', 'is_free': 0},
             {'order': 3, 'title': '神经网络入门', 'duration': '45:00', 'is_free': 0},
         ]},
    ],
}
# Use course 1 chapters as fallback for courses without specific chapters
for cid in [3, 4, 5, 6, 7, 8]:
    chapters_data[cid] = [
        {'order': 1, 'title': '基础入门', 'lessons': 20, 'duration': '4 小时',
         'lessons_list': [
             {'order': 1, 'title': '课程介绍', 'duration': '10:00', 'is_free': 1},
             {'order': 2, 'title': '核心概念', 'duration': '20:00', 'is_free': 1},
             {'order': 3, 'title': '实践练习', 'duration': '25:00', 'is_free': 0},
         ]},
        {'order': 2, 'title': '进阶技能', 'lessons': 25, 'duration': '5 小时',
         'lessons_list': [
             {'order': 1, 'title': '高级特性', 'duration': '30:00', 'is_free': 0},
             {'order': 2, 'title': '项目实战', 'duration': '40:00', 'is_free': 0},
         ]},
        {'order': 3, 'title': '项目实战', 'lessons': 30, 'duration': '6 小时',
         'lessons_list': [
             {'order': 1, 'title': '综合项目', 'duration': '45:00', 'is_free': 0},
             {'order': 2, 'title': '优化与部署', 'duration': '35:00', 'is_free': 0},
         ]},
    ]

# ─── Reviews per course ───────────────────────────────────────────────────────
reviews_data = {
    1: [
        {'name': '王同学', 'avatar_color': 'blue', 'date': '2026-03-15', 'rating': 5,
         'content': '这门课程内容非常全面，从基础到进阶都有详细讲解。讲师讲解清晰，实例丰富，学完后成功转行做了前端开发！强烈推荐！'},
        {'name': '李同学', 'avatar_color': 'green', 'date': '2026-03-10', 'rating': 5,
         'content': 'React 部分讲解得特别好，hooks 的概念深入浅出。项目实战环节让我对全栈开发有了更清晰的认识。物超所值！'},
        {'name': '陈同学', 'avatar_color': 'purple', 'date': '2026-03-05', 'rating': 5,
         'content': '作为零基础学员，这门课程让我从完全不懂到能独立开发项目。讲师的节奏把控得很好，每个知识点都讲得透彻。'},
        {'name': '刘同学', 'avatar_color': 'amber', 'date': '2026-02-28', 'rating': 4,
         'content': '课程内容更新很及时，涵盖了最新的技术趋势。Node.js 和后端开发部分填补了我的知识空白。'},
    ],
    2: [
        {'name': '张同学', 'avatar_color': 'blue', 'date': '2026-03-12', 'rating': 5,
         'content': '非常系统的数据科学课程！从 NumPy 到机器学习，每个部分都讲得很透彻，项目实战也很有价值。'},
        {'name': '王同学', 'avatar_color': 'green', 'date': '2026-03-08', 'rating': 5,
         'content': 'Pandas 数据处理部分讲得特别好，解决了我工作中很多实际问题。机器学习算法的讲解也很清晰。'},
        {'name': '李同学', 'avatar_color': 'purple', 'date': '2026-02-25', 'rating': 4,
         'content': '课程内容丰富，讲师经验丰富。可视化部分特别实用，让数据分析结果一目了然。'},
    ],
}
# Fallback reviews for other courses
default_reviews = [
    {'name': '学员甲', 'avatar_color': 'blue', 'date': '2026-03-10', 'rating': 5,
     'content': '课程内容非常实用，讲师讲解清晰，强烈推荐给有需要的同学！'},
    {'name': '学员乙', 'avatar_color': 'green', 'date': '2026-03-05', 'rating': 5,
     'content': '学完之后对这个领域有了全新的认识，项目实战部分特别有帮助。'},
    {'name': '学员丙', 'avatar_color': 'amber', 'date': '2026-02-28', 'rating': 4,
     'content': '内容扎实，讲师耐心，课程物超所值。'},
]
for cid in [3, 4, 5, 6, 7, 8]:
    reviews_data[cid] = default_reviews

# ─── Build DB ────────────────────────────────────────────────────────────────
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

for tbl in ['lessons', 'chapters', 'reviews', 'course_details', 'courses', 'recommended_courses']:
    c.execute(f'DROP TABLE IF EXISTS {tbl}')

c.execute('''CREATE TABLE courses (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT,
    category TEXT, category_label TEXT, price REAL, original_price REAL,
    rating REAL, students INTEGER, duration INTEGER,
    difficulty TEXT, difficulty_label TEXT, badge TEXT, badge_color TEXT,
    has_discount INTEGER DEFAULT 0, date_added TEXT, image_url TEXT, tag_color TEXT
)''')

c.execute('''CREATE TABLE recommended_courses (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, price REAL,
    duration INTEGER, badge TEXT, badge_color TEXT, image_url TEXT
)''')

c.execute('''CREATE TABLE course_details (
    course_id INTEGER PRIMARY KEY,
    description TEXT, total_lessons INTEGER, video_hours INTEGER,
    articles INTEGER, last_updated TEXT, language TEXT, video_url TEXT,
    instructor_name TEXT, instructor_title TEXT, instructor_bio TEXT,
    instructor_courses INTEGER, instructor_students TEXT, instructor_rating REAL,
    gallery_images TEXT, objectives TEXT, requirements TEXT,
    rating_5 INTEGER, rating_4 INTEGER, rating_3 INTEGER, rating_2 INTEGER, rating_1 INTEGER,
    FOREIGN KEY(course_id) REFERENCES courses(id)
)''')

c.execute('''CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER, chapter_order INTEGER, title TEXT,
    lessons_count INTEGER, duration TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id)
)''')

c.execute('''CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER, lesson_order INTEGER, title TEXT,
    duration TEXT, is_free INTEGER DEFAULT 0,
    FOREIGN KEY(chapter_id) REFERENCES chapters(id)
)''')

c.execute('''CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER, reviewer_name TEXT, avatar_color TEXT,
    review_date TEXT, rating INTEGER, content TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id)
)''')

for course in courses:
    c.execute('''INSERT INTO courses VALUES (
        :id,:title,:subtitle,:category,:category_label,:price,:original_price,
        :rating,:students,:duration,:difficulty,:difficulty_label,:badge,:badge_color,
        :has_discount,:date_added,:image_url,:tag_color)''', course)

for rec in recommended:
    c.execute('INSERT INTO recommended_courses VALUES (:id,:title,:price,:duration,:badge,:badge_color,:image_url)', rec)

for cid, d in details.items():
    c.execute('''INSERT INTO course_details VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
        cid, d['description'], d['total_lessons'], d['video_hours'],
        d['articles'], d['last_updated'], d['language'], d['video_url'],
        d['instructor_name'], d['instructor_title'], d['instructor_bio'],
        d['instructor_courses'], d['instructor_students'], d['instructor_rating'],
        d['gallery_images'], d['objectives'], d['requirements'],
        d['rating_5'], d['rating_4'], d['rating_3'], d['rating_2'], d['rating_1'],
    ))

for cid, chapters in chapters_data.items():
    for ch in chapters:
        c.execute('INSERT INTO chapters (course_id,chapter_order,title,lessons_count,duration) VALUES (?,?,?,?,?)',
                  (cid, ch['order'], ch['title'], ch['lessons'], ch['duration']))
        ch_id = c.lastrowid
        for ls in ch.get('lessons_list', []):
            c.execute('INSERT INTO lessons (chapter_id,lesson_order,title,duration,is_free) VALUES (?,?,?,?,?)',
                      (ch_id, ls['order'], ls['title'], ls['duration'], ls['is_free']))

for cid, revs in reviews_data.items():
    for r in revs:
        c.execute('INSERT INTO reviews (course_id,reviewer_name,avatar_color,review_date,rating,content) VALUES (?,?,?,?,?,?)',
                  (cid, r['name'], r['avatar_color'], r['date'], r['rating'], r['content']))

conn.commit()
conn.close()
print(f'Created {DB_PATH}')
print(f'Size: {os.path.getsize(DB_PATH):,} bytes')
