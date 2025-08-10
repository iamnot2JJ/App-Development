# 🤖 Gemini AI Integration Guide

## 在您的网页中使用真实的 Google Gemini API

### 步骤 1: 确认环境配置

确保您的 `.env` 文件包含有效的 API 密钥：

```
VITE_GEMINI_API_KEY=AIzaSyACvZvQsO_P9i23t_lwnOK52i9NtBxIufg
```

### 步骤 2: 替换简化版本为完整版本

修改路由配置 `src/router/index.js`：

```javascript
// 将这行：
const AIChatPage = () => import('../views/AIChatPage-simple.vue')

// 改为：
const AIChatPage = () => import('../views/AIChatPage.vue')
```

### 步骤 3: 使用真实的 Gemini 服务

在 `src/views/AIChatPage-simple.vue` 中集成真实 API：

```javascript
// 在script部分添加导入
import geminiService from '../services/geminiService.js'

// 替换模拟响应的代码
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  const userMessage = {
    id: Date.now(),
    text: currentMessage.value,
    isUser: true,
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  const messageCopy = currentMessage.value
  currentMessage.value = ''
  isTyping.value = true

  scrollToBottom()

  try {
    // 使用真实的Gemini API
    const response = await geminiService.sendMessage(messageCopy, {
      userLocation: 'Australia',
      preferredLanguage: 'English',
      healthConcern: 'general',
    })

    const aiMessage = {
      id: Date.now() + 1,
      text: response.message,
      isUser: false,
      timestamp: new Date(),
    }

    messages.value.push(aiMessage)
    isTyping.value = false
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    const errorMessage = {
      id: Date.now() + 1,
      text: 'Sorry, AI service is temporarily unavailable. Please try again later.',
      isUser: false,
      timestamp: new Date(),
    }
    messages.value.push(errorMessage)
    isTyping.value = false
    scrollToBottom()
  }
}
```

### 步骤 4: 测试 API 连接

在浏览器开发者工具的控制台中测试：

```javascript
// 打开浏览器控制台 (F12)，输入以下代码测试：
import('../services/geminiService.js').then((service) => {
  service.default
    .sendMessage('Hello, can you help me with health information?')
    .then((response) => console.log('API Response:', response))
    .catch((error) => console.error('API Error:', error))
})
```

### 步骤 5: 高级功能集成

#### 添加语音识别功能：

```javascript
// 在组件中添加语音功能
const startListening = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      currentMessage.value = transcript
    }

    recognition.start()
  }
}
```

#### 添加文本转语音：

```javascript
const speakMessage = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}
```

### 步骤 6: 添加对话历史功能

```javascript
// 保存对话历史
const saveConversation = () => {
  const conversation = {
    id: Date.now(),
    timestamp: new Date(),
    messages: messages.value,
  }

  const savedConversations = JSON.parse(localStorage.getItem('aiConversations') || '[]')
  savedConversations.push(conversation)
  localStorage.setItem('aiConversations', JSON.stringify(savedConversations))
}

// 加载对话历史
const loadConversationHistory = () => {
  const saved = JSON.parse(localStorage.getItem('aiConversations') || '[]')
  return saved
}
```

### 步骤 7: 安全考虑

1. **API 密钥保护**: 在生产环境中使用 Cloud Functions 代理 API 调用
2. **输入验证**: 清理用户输入防止恶意内容
3. **速率限制**: 限制用户请求频率
4. **错误处理**: 优雅处理 API 错误和网络问题

### 故障排除

#### 常见问题：

1. **API 密钥错误**: 确认密钥正确且有效
2. **网络错误**: 检查网络连接和防火墙设置
3. **配额限制**: 确认 API 使用未超过限制
4. **CORS 错误**: 确保正确配置跨域请求

#### 调试方法：

```javascript
// 在浏览器控制台查看详细错误信息
console.log('Environment variables:', import.meta.env)
console.log('Gemini service status:', geminiService)
```

### 性能优化建议

1. **懒加载**: 延迟加载 AI 服务直到需要时
2. **缓存响应**: 缓存常见问题的回答
3. **流式响应**: 实现实时响应显示
4. **离线模式**: 提供离线时的基本功能

---

## 快速启用步骤：

1. 确认 `.env` 文件中有 API 密钥
2. 修改路由使用 `AIChatPage.vue`
3. 在浏览器中访问 `/ai-chat` 测试

**注意**: 确保您的 API 密钥是有效的，并且有足够的配额进行测试。
