#!/usr/bin/env python3
"""Generate courses.db SQLite database for the LMS landing page."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'courses.db')

courses = [
    {
        'id': 1,
        'title': 'Web 开发实战：从零到全栈',
        'subtitle': '学习 HTML、CSS、JavaScript 和 React，构建完整的全栈应用。',
        'category': 'frontend',
        'category_label': '前端',
        'price': 199,
        'original_price': 299,
        'rating': 4.9,
        'students': 2100,
        'duration': 12,
        'difficulty': 'beginner',
        'difficulty_label': '入门',
        'badge': '热门',
        'badge_color': 'blue',
        'has_discount': 1,
        'date_added': '2025-03-15',
        'image_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
        'tag_color': 'blue',
    },
    {
        'id': 2,
        'title': 'Python 数据科学与机器学习',
        'subtitle': '掌握 Python 数据分析、可视化和机器学习核心算法。',
        'category': 'data',
        'category_label': '数据',
        'price': 299,
        'original_price': 399,
        'rating': 4.8,
        'students': 1800,
        'duration': 18,
        'difficulty': 'intermediate',
        'difficulty_label': '中级',
        'badge': '新课',
        'badge_color': 'green',
        'has_discount': 0,
        'date_added': '2025-03-10',
        'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        'tag_color': 'green',
    },
    {
        'id': 3,
        'title': 'UI/UX 设计从入门到精通',
        'subtitle': '学习 Figma 工具和设计思维，打造出色的用户界面。',
        'category': 'design',
        'category_label': '设计',
        'price': 249,
        'original_price': None,
        'rating': 4.7,
        'students': 956,
        'duration': 10,
        'difficulty': 'beginner',
        'difficulty_label': '入门',
        'badge': None,
        'badge_color': None,
        'has_discount': 0,
        'date_added': '2025-03-05',
        'image_url': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
        'tag_color': 'purple',
    },
    {
        'id': 4,
        'title': '商业分析与决策能力提升',
        'subtitle': '学习数据驱动的商业分析方法，提升战略决策能力。',
        'category': 'business',
        'category_label': '商业',
        'price': 179,
        'original_price': 279,
        'rating': 4.9,
        'students': 1500,
        'duration': 8,
        'difficulty': 'intermediate',
        'difficulty_label': '中级',
        'badge': '畅销',
        'badge_color': 'amber',
        'has_discount': 1,
        'date_added': '2025-02-28',
        'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
        'tag_color': 'amber',
    },
    {
        'id': 5,
        'title': 'React 18 高级进阶实战',
        'subtitle': '深入理解 React 核心原理，掌握 Hooks、Context 和性能优化。',
        'category': 'frontend',
        'category_label': '前端',
        'price': 259,
        'original_price': None,
        'rating': 4.8,
        'students': 1200,
        'duration': 15,
        'difficulty': 'advanced',
        'difficulty_label': '高级',
        'badge': None,
        'badge_color': None,
        'has_discount': 0,
        'date_added': '2025-02-20',
        'image_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
        'tag_color': 'blue',
    },
    {
        'id': 6,
        'title': 'SQL 数据库从入门到精通',
        'subtitle': '掌握 MySQL、PostgreSQL 等关系型数据库的核心技能。',
        'category': 'data',
        'category_label': '数据',
        'price': 149,
        'original_price': None,
        'rating': 4.6,
        'students': 856,
        'duration': 6,
        'difficulty': 'beginner',
        'difficulty_label': '入门',
        'badge': None,
        'badge_color': None,
        'has_discount': 0,
        'date_added': '2025-02-15',
        'image_url': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=250&fit=crop',
        'tag_color': 'green',
    },
    {
        'id': 7,
        'title': 'Blender 3D 建模与渲染',
        'subtitle': '从零开始学习 3D 建模、材质和渲染技术。',
        'category': 'design',
        'category_label': '设计',
        'price': 299,
        'original_price': 399,
        'rating': 4.7,
        'students': 678,
        'duration': 20,
        'difficulty': 'intermediate',
        'difficulty_label': '中级',
        'badge': '限时',
        'badge_color': 'red',
        'has_discount': 1,
        'date_added': '2025-02-10',
        'image_url': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop',
        'tag_color': 'purple',
    },
    {
        'id': 8,
        'title': 'PMP 项目管理认证课程',
        'subtitle': '系统学习项目管理知识体系，助力 PMP 认证考试。',
        'category': 'business',
        'category_label': '商业',
        'price': 399,
        'original_price': None,
        'rating': 4.9,
        'students': 2300,
        'duration': 14,
        'difficulty': 'advanced',
        'difficulty_label': '高级',
        'badge': None,
        'badge_color': None,
        'has_discount': 0,
        'date_added': '2025-02-05',
        'image_url': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
        'tag_color': 'amber',
    },
]

recommended = [
    {
        'id': 101,
        'title': 'JavaScript 高级编程实战',
        'price': 349,
        'duration': 25,
        'badge': '推荐',
        'badge_color': 'blue',
        'image_url': 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=200&fit=crop',
    },
    {
        'id': 102,
        'title': '网络安全与渗透测试',
        'price': 499,
        'duration': 30,
        'badge': '热门',
        'badge_color': 'purple',
        'image_url': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
    },
    {
        'id': 103,
        'title': '数据分析可视化实战',
        'price': 279,
        'duration': 16,
        'badge': None,
        'badge_color': None,
        'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
    },
]

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute('DROP TABLE IF EXISTS courses')
c.execute('DROP TABLE IF EXISTS recommended_courses')

c.execute('''
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT,
    category_label TEXT,
    price REAL,
    original_price REAL,
    rating REAL,
    students INTEGER,
    duration INTEGER,
    difficulty TEXT,
    difficulty_label TEXT,
    badge TEXT,
    badge_color TEXT,
    has_discount INTEGER DEFAULT 0,
    date_added TEXT,
    image_url TEXT,
    tag_color TEXT
)
''')

c.execute('''
CREATE TABLE recommended_courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL,
    duration INTEGER,
    badge TEXT,
    badge_color TEXT,
    image_url TEXT
)
''')

for course in courses:
    c.execute('''INSERT INTO courses VALUES (
        :id, :title, :subtitle, :category, :category_label,
        :price, :original_price, :rating, :students, :duration,
        :difficulty, :difficulty_label, :badge, :badge_color,
        :has_discount, :date_added, :image_url, :tag_color
    )''', course)

for rec in recommended:
    c.execute('''INSERT INTO recommended_courses VALUES (
        :id, :title, :price, :duration, :badge, :badge_color, :image_url
    )''', rec)

conn.commit()
conn.close()
print(f'Created {DB_PATH}')
print(f'Size: {os.path.getsize(DB_PATH)} bytes')
