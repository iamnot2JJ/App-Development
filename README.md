# Migrant Health Charity Web Application

## 项目概述

这是一个为移民健康慈善机构开发的综合性 Web 应用程序，专为 FIT5032 **地图服务**: 查找附近的医疗服务提供者 **AI 健康助手**: 24/7 智能健康咨询和指导 **预约预订**: 在线预订医疗服务 **数据导出**: 导出个人数据记录 **可访问性**: 使用辅助功能工具该应用程序为移民社区提供健康资源访问、医疗服务定位、预约预订和多语言支持等功能。

#### D.1 外部认证服务

- **实现**: Firebase Authentication with Google OAuth
- **功能**:
  - Google 账户登录
  - 用户配置文件管理
  - 角色基础访问控制 (用户/管理员)
  - 安全会话管理

#### D.2 邮件服务

- **实现**: Nodemailer with Firebase Cloud Functions
- **功能**:
  - 邮件发送和接收
  - 附件支持 (PDF, 图片等)
  - 批量邮件发送
  - 邮件模板系统
  - 发送状态追踪

#### D.3 交互式数据表格

- **实现**: 自定义 Vue 组件
- **功能**:
  - 高级搜索和过滤
  - 多列排序
  - 分页控制
  - 列显示/隐藏
  - 数据导出到 CSV
  - 响应式设计

#### D.4 云部署

- **实现**: Firebase Hosting + Cloud Functions
- **功能**:
  - 自动化部署流程
  - CDN 内容分发
  - SSL/HTTPS 支持
  - 环境变量管理

#### E.1 云函数

- **实现**: Firebase Cloud Functions (Node.js)
- **功能**:
  - 自动邮件通知
  - 数据处理和分析
  - 系统健康检查
  - 定时任务执行
  - API 端点管理

#### E.2 地理位置服务

- **实现**: Leaflet Maps with OpenStreetMap
- **功能**:
  - 交互式地图显示
  - 医疗服务提供者定位
  - 路线规划和导航
  - 地理编码和搜索
  - 用户位置检测

#### E.3 可访问性

- **实现**: WCAG 2.1 AA 合规
- **功能**:
  - 可访问性工具栏
  - 屏幕阅读器支持
  - 键盘导航
  - 高对比度模式
  - 字体大小调整
  - 语义化 HTML 结构

#### E.4 数据导出

- **实现**: 多格式导出系统
- **功能**:
  - CSV 导出
  - PDF 生成 (jsPDF)
  - JSON 格式导出
  - Excel 文件支持
  - 导出历史记录
  - 定时导出功能

#### F.1 创新功能

**GenAI 聊天机器人**:

- 集成 Google Gemini 2.5 Pro API
- 24/7 智能健康咨询服务
- 多语言支持和语音交互
- 上下文感知对话管理
- 文化敏感性健康指导
- 会话导出和分析功能

**管理员仪表板**:

- 实时数据分析和可视化 (Chart.js)
- 用户管理系统
- 系统日志监控
- 批量邮件发送
- 快速操作面板

**预约预订系统**:

- 集成日历界面 (FullCalendar)
- 冲突检测和防止
- 提供者可用性管理
- 自动提醒通知
- 预约历史追踪

## 🛠 技术栈

### 前端技术

- **Vue.js 3** - 渐进式 JavaScript 框架 (Composition API)
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Bootstrap 5** - UI 框架
- **Chart.js** - 数据可视化
- **Leaflet** - 交互式地图
- **FullCalendar** - 日历组件
- **jsPDF** - PDF 生成
- **DOMPurify** - XSS 防护
- **Google Gemini AI** - 智能聊天机器人
- **Marked** - Markdown 渲染

### 后端服务

- **Firebase Authentication** - 用户认证
- **Firebase Firestore** - NoSQL 数据库
- **Firebase Cloud Functions** - 服务器端逻辑
- **Firebase Storage** - 文件存储
- **Firebase Hosting** - 静态网站托管

### 开发工具

- **Vite** - 构建工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 📁 项目结构

```
src/
├── components/
│   ├── accessibility/          # 可访问性组件
│   │   └── AccessibilityToolbar.vue
│   ├── ai/                     # AI聊天机器人
│   │   └── ChatBot.vue
│   ├── auth/                   # 认证组件
│   │   ├── AuthLayout.vue
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   ├── booking/                # 预约系统
│   │   └── AppointmentBooking.vue
│   ├── export/                 # 数据导出
│   │   └── ExportComponent.vue
│   ├── geo/                    # 地理位置服务
│   │   └── MapComponent.vue
│   ├── ratings/                # 评分系统
│   │   └── RatingWidget.vue
│   ├── security/               # 安全组件
│   │   └── SanitizedContent.vue
│   └── ui/                     # UI 组件
│       ├── Footer.vue
│       ├── NavBar.vue
│       └── InteractiveDataTable.vue
├── firebase/                   # Firebase 配置
│   └── config.js
├── router/                     # 路由配置
│   └── index.js
├── services/                   # 服务层
│   └── geminiService.js       # AI 服务
├── stores/                     # Pinia 状态管理
│   ├── auth.js
│   ├── email.js
│   ├── ratings.js
│   └── resources.js
├── views/                      # 页面组件
│   ├── admin/
│   │   └── AdminDashboard.vue
│   ├── public/
│   │   ├── AboutView.vue
│   │   ├── HomeView.vue
│   │   └── ResourcesView.vue
│   ├── AIChatPage.vue         # AI聊天页面
│   └── NotFound.vue
├── App.vue                     # 主应用组件
└── main.js                     # 应用入口点

functions/                      # Firebase Cloud Functions
├── index.js                    # 云函数定义
└── package.json               # 函数依赖

配置文件/
├── firebase.json               # Firebase 配置
├── firestore.rules            # Firestore 安全规则
├── storage.rules              # Storage 安全规则
├── .firebaserc                # Firebase 项目配置
└── DEPLOYMENT.md              # 部署指南
```

```

##  功能演示

### 用户功能

1. **账户管理**: Google OAuth 登录/注册
2. **资源浏览**: 查看健康资源和信息
3. **地图服务**: 查找附近的医疗服务提供者
4. **预约预订**: 在线预订医疗服务
5. **数据导出**: 导出个人数据记录
6. **可访问性**: 使用辅助功能工具

### 管理员功能

1. **仪表板**: 查看系统统计和分析
2. **用户管理**: 管理用户账户和权限
3. **内容管理**: 添加/编辑健康资源
4. **邮件系统**: 发送通知和公告
5. **系统监控**: 查看日志和系统状态
6. **数据分析**: 导出和分析系统数据

##  安全特性

- **输入验证**: 所有用户输入都经过验证和清理
- **XSS 防护**: 使用 DOMPurify 防止跨站脚本攻击
- **认证授权**: Firebase Auth 提供安全认证
- **数据访问控制**: Firestore 规则确保数据安全
- **HTTPS 加密**: 所有通信都经过加密

##  可访问性合规

本应用程序遵循 WCAG 2.1 AA 标准：

- **键盘导航**: 完全支持键盘操作
- **屏幕阅读器**: 支持 NVDA, JAWS, VoiceOver
- **颜色对比**: 满足 4.5:1 对比度要求
- **文本缩放**: 支持 200% 文本放大
- **语义化**: 使用适当的 HTML 语义元素
- **ARIA 标签**: 完整的 ARIA 属性支持


## 👥 作者

**学生信息**:

- 姓名: [Junjie Zhou]
- 学号: [35524316]
- 课程: FIT5032
```
