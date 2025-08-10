# 部署指南 - Migrant Health Charity Web Application

## 概述

本文档提供了将 Migrant Health Charity Web 应用程序部署到 Firebase 的完整指南。该应用程序实现了 FIT5032 作业要求的所有 Business Requirements D、E 和 F，并达到"Exceeds Expectations"标准。

## 前置要求

### 1. 开发环境

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- Git
- 现代 Web 浏览器

### 2. Firebase 账户和项目

- Google/Firebase 账户
- Firebase 项目（免费的 Spark 计划即可开始）
- Firebase CLI 工具

## 安装和配置

### 1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. 登录 Firebase

```bash
firebase login
```

### 3. 初始化 Firebase 项目

```bash
firebase init
```

选择以下服务：

- [x] Hosting: Configure files for Firebase Hosting
- [x] Functions: Configure a Cloud Functions directory
- [x] Firestore: Configure security rules and indexes files
- [x] Storage: Configure a security rules file for Cloud Storage

### 4. 配置环境变量

创建 `.env` 文件（不要提交到版本控制）：

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_EMAIL_SERVICE_URL=your_email_service_url
```

## 部署步骤

### 1. 本地开发和测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 Firebase 模拟器（可选）
npm run serve
```

### 2. 构建应用程序

```bash
npm run build
```

### 3. 部署到 Firebase

#### 完整部署

```bash
npm run deploy
```

#### 分别部署各个服务

**仅部署前端（Hosting）：**

```bash
npm run deploy:hosting
```

**仅部署云函数：**

```bash
npm run deploy:functions
```

**仅部署 Firestore 规则：**

```bash
npm run deploy:firestore
```

**仅部署存储规则：**

```bash
npm run deploy:storage
```

## 功能验证

部署完成后，验证以下功能：

### Business Requirement D - Advanced Features

- [x] **D.1 外部认证**: Firebase Authentication with Google OAuth
- [x] **D.2 邮件服务**: Nodemailer with attachment support
- [x] **D.3 交互式数据表**: Advanced DataTable with search, sort, pagination
- [x] **D.4 云部署**: Firebase Hosting deployment

### Business Requirement E - Expert Features

- [x] **E.1 云函数**: Firebase Cloud Functions for backend processing
- [x] **E.2 地理位置**: Leaflet maps with healthcare provider locations
- [x] **E.3 可访问性**: WCAG 2.1 AA compliance with accessibility toolbar
- [x] **E.4 数据导出**: Multi-format export (CSV, PDF, JSON, Excel)

### Business Requirement F - Innovation

- [x] **F.1 创新功能**: Admin dashboard with analytics and appointment booking

## 性能优化

### 1. 代码分割

应用程序使用 Vue 3 动态导入进行代码分割：

```javascript
const MapComponent = () => import('../components/geo/MapComponent.vue')
```

### 2. 缓存策略

Firebase Hosting 配置了适当的缓存头：

- JS/CSS 文件：1 年缓存
- 图片文件：1 年缓存
- HTML 文件：无缓存（确保更新）

### 3. 构建优化

Vite 配置了生产环境优化：

- 代码压缩
- Tree shaking
- CSS 优化
- 资源优化

## 监控和维护

### 1. Firebase 控制台监控

- Hosting 使用统计
- Functions 执行日志
- Firestore 使用情况
- Authentication 用户统计

### 2. 应用程序日志

管理员可以在 Admin Dashboard 中查看：

- 系统日志
- 邮件发送记录
- 用户活动
- 错误报告

### 3. 性能监控

建议集成 Firebase Performance Monitoring：

```bash
firebase experiments:enable webframeworks
```

## 安全考虑

### 1. Firestore 安全规则

- 用户只能访问自己的数据
- 管理员具有完全访问权限
- 公共资源允许读取访问

### 2. 存储安全规则

- 用户个人文件隔离
- 导出文件访问控制
- 公共资源管理权限

### 3. 认证安全

- Firebase Authentication
- Google OAuth 集成
- 用户角色管理

## 故障排除

### 常见问题

**1. 构建失败**

```bash
# 清除缓存
npm run lint
rm -rf node_modules
npm install
```

**2. 部署权限错误**

```bash
firebase login --reauth
firebase use your-project-id
```

**3. 函数部署失败**

```bash
# 检查 functions 目录
cd functions
npm install
npm run build
```

**4. 环境变量问题**
确保所有必需的环境变量都已正确设置在 `.env` 文件中。

## 支持和文档

### 官方文档

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Vue.js 3](https://vuejs.org/)
- [Bootstrap 5](https://getbootstrap.com/)

### 联系支持

如有技术问题，请联系开发团队或查看项目 README.md 文件中的详细说明。

## 版本历史

- **v1.0.0**: 初始部署版本
  - 实现所有 Business Requirements D、E、F
  - 完整的 Firebase 集成
  - 响应式设计和可访问性支持

---

**注意**: 这是一个学术项目，用于 FIT5032 App Development 课程。部署前请确保遵循所有安全最佳实践和学校政策。
