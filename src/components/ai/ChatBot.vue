<template>
  <div class="chat-bot-container">
    <!-- Chat Toggle Button (Floating) -->
    <button
      v-if="!isOpen"
      @click="toggleChat"
      class="chat-toggle-btn btn btn-primary rounded-pill shadow-lg"
      type="button"
      :aria-label="'Open AI Health Assistant Chat'"
    >
      <i class="fas fa-robot me-2" aria-hidden="true"></i>
      <span class="d-none d-sm-inline">AI Assistant</span>
      <div class="pulse-dot" v-if="hasUnreadMessages"></div>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="chat-window shadow-lg"
      :class="{ minimized: isMinimized }"
      role="dialog"
      aria-labelledby="chat-title"
      aria-describedby="chat-description"
    >
      <!-- Chat Header -->
      <div
        class="chat-header bg-primary text-white p-3 d-flex align-items-center justify-content-between"
      >
        <div class="d-flex align-items-center">
          <div class="ai-avatar me-2">
            <i class="fas fa-robot"></i>
          </div>
          <div>
            <h5 id="chat-title" class="mb-0 fw-bold">AI Health Assistant</h5>
            <small id="chat-description" class="opacity-75">
              {{ isTyping ? 'Typing...' : 'Here to help with your health questions' }}
            </small>
          </div>
        </div>

        <div class="chat-controls d-flex align-items-center">
          <button
            @click="toggleMinimize"
            class="btn btn-sm btn-outline-light me-2"
            type="button"
            :aria-label="isMinimized ? 'Expand chat' : 'Minimize chat'"
          >
            <i :class="isMinimized ? 'fas fa-expand' : 'fas fa-minus'" aria-hidden="true"></i>
          </button>

          <button
            @click="toggleChat"
            class="btn btn-sm btn-outline-light"
            type="button"
            aria-label="Close chat"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- Chat Content -->
      <div class="chat-content" v-show="!isMinimized">
        <!-- Quick Response Buttons -->
        <div v-if="showQuickResponses" class="quick-responses p-3 border-bottom">
          <h6 class="mb-2 text-muted">Quick Help Topics:</h6>
          <div class="row g-2">
            <div v-for="response in quickResponses" :key="response.id" class="col-6 col-lg-4">
              <button
                @click="sendQuickResponse(response.prompt)"
                class="btn btn-outline-primary btn-sm w-100 text-start"
                type="button"
                :title="response.description"
              >
                <small>{{ response.title }}</small>
              </button>
            </div>
          </div>
          <div class="text-center mt-2">
            <button
              @click="showQuickResponses = false"
              class="btn btn-link btn-sm text-muted"
              type="button"
            >
              Hide quick topics
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div
          ref="messagesContainer"
          class="messages-container"
          :style="{ height: chatHeight + 'px' }"
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="welcome-message p-4 text-center">
            <div class="ai-avatar-large mb-3">
              <i class="fas fa-robot text-primary"></i>
            </div>
            <h6 class="text-primary mb-2">Welcome to AI Health Assistant!</h6>
            <p class="text-muted small mb-3">
              I'm here to help you with health information, navigate our services, and provide
              culturally sensitive support for migrant health needs.
            </p>
            <button
              @click="showQuickResponses = true"
              class="btn btn-primary btn-sm"
              type="button"
              v-if="!showQuickResponses"
            >
              <i class="fas fa-lightbulb me-1" aria-hidden="true"></i>
              Show Quick Topics
            </button>
          </div>

          <!-- Message List -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-wrapper"
            :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
          >
            <div class="message-content">
              <div class="message-avatar">
                <i :class="message.isUser ? 'fas fa-user' : 'fas fa-robot'" aria-hidden="true"></i>
              </div>

              <div class="message-bubble">
                <div class="message-text" v-html="formatMessage(message.text)"></div>

                <div class="message-meta">
                  <small class="text-muted">
                    {{ formatTime(message.timestamp) }}
                  </small>

                  <!-- Message Actions -->
                  <div v-if="!message.isUser" class="message-actions ms-2">
                    <button
                      @click="copyToClipboard(message.text)"
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      title="Copy message"
                    >
                      <i class="fas fa-copy" aria-hidden="true"></i>
                    </button>

                    <button
                      @click="provideFeedback(message, 'helpful')"
                      class="btn btn-sm btn-outline-success ms-1"
                      type="button"
                      title="This was helpful"
                      :class="{ active: message.feedback === 'helpful' }"
                    >
                      <i class="fas fa-thumbs-up" aria-hidden="true"></i>
                    </button>

                    <button
                      @click="provideFeedback(message, 'unhelpful')"
                      class="btn btn-sm btn-outline-danger ms-1"
                      type="button"
                      title="This was not helpful"
                      :class="{ active: message.feedback === 'unhelpful' }"
                    >
                      <i class="fas fa-thumbs-down" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message-wrapper ai-message">
            <div class="message-content">
              <div class="message-avatar">
                <i class="fas fa-robot" aria-hidden="true"></i>
              </div>
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message p-3 text-center">
            <div class="alert alert-warning mb-0">
              <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
              {{ error }}
              <button @click="clearError" class="btn btn-sm btn-outline-warning ms-2" type="button">
                Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area border-top p-3">
          <div class="input-group">
            <input
              ref="messageInput"
              v-model="currentMessage"
              @keypress.enter="sendMessage"
              @input="handleInput"
              class="form-control"
              placeholder="Ask me about health services, appointments, or general health questions..."
              :disabled="isTyping"
              maxlength="500"
              aria-label="Type your health question"
            />

            <button
              @click="sendMessage"
              class="btn btn-primary"
              type="button"
              :disabled="!currentMessage.trim() || isTyping"
              aria-label="Send message"
            >
              <i
                :class="isTyping ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"
                aria-hidden="true"
              ></i>
            </button>
          </div>

          <!-- Character Counter -->
          <div class="text-end mt-1">
            <small class="text-muted">{{ currentMessage.length }}/500</small>
          </div>

          <!-- Additional Controls -->
          <div class="chat-controls-bottom d-flex justify-content-between align-items-center mt-2">
            <div class="d-flex">
              <button
                @click="clearConversation"
                class="btn btn-sm btn-outline-secondary me-2"
                type="button"
                title="Clear conversation"
                :disabled="messages.length === 0"
              >
                <i class="fas fa-trash me-1" aria-hidden="true"></i>
                Clear
              </button>

              <button
                @click="showQuickResponses = !showQuickResponses"
                class="btn btn-sm btn-outline-primary"
                type="button"
                title="Toggle quick topics"
              >
                <i class="fas fa-lightbulb me-1" aria-hidden="true"></i>
                Topics
              </button>
            </div>

            <div class="voice-controls" v-if="supportsVoice">
              <button
                @click="toggleVoiceInput"
                class="btn btn-sm btn-outline-info"
                type="button"
                :class="{ active: isListening }"
                :title="isListening ? 'Stop listening' : 'Voice input'"
              >
                <i
                  :class="isListening ? 'fas fa-microphone-slash' : 'fas fa-microphone'"
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accessibility Announcements -->
    <div id="chat-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import geminiService from '../../services/geminiService.js'

// Reactive state
const isOpen = ref(false)
const isMinimized = ref(false)
const isTyping = ref(false)
const isListening = ref(false)
const currentMessage = ref('')
const messages = ref([])
const error = ref('')
const showQuickResponses = ref(true)
const hasUnreadMessages = ref(false)
const quickResponses = ref([])

// Refs
const messagesContainer = ref(null)
const messageInput = ref(null)

// Voice recognition setup
const supportsVoice = ref(false)
let recognition = null

// Chat configuration
const chatHeight = ref(400)
const maxMessages = 50

// Initialize component
onMounted(async () => {
  // Check for voice support
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    supportsVoice.value = true
    setupVoiceRecognition()
  }

  // Load quick responses
  try {
    quickResponses.value = await geminiService.getHealthQuickResponses()
  } catch (err) {
    console.error('Failed to load quick responses:', err)
  }

  // Setup marked options for markdown rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: false, // We'll use DOMPurify instead
  })
})

// Computed properties
const formattedMessages = computed(() => {
  return messages.value.slice(-maxMessages)
})

// Methods
const toggleChat = () => {
  isOpen.value = !isOpen.value
  isMinimized.value = false

  if (isOpen.value) {
    hasUnreadMessages.value = false
    nextTick(() => {
      messageInput.value?.focus()
      scrollToBottom()
    })
  }
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value

  if (!isMinimized.value) {
    nextTick(() => {
      messageInput.value?.focus()
      scrollToBottom()
    })
  }
}

const sendMessage = async () => {
  const message = currentMessage.value.trim()
  if (!message || isTyping.value) return

  // Add user message
  addMessage(message, true)
  currentMessage.value = ''
  isTyping.value = true
  error.value = ''

  try {
    // Prepare context
    const context = {
      userLocation: getUserLocation(),
      preferredLanguage: getPreferredLanguage(),
      timestamp: new Date(),
    }

    // Send to Gemini
    const response = await geminiService.sendMessage(message, context)

    if (response.success) {
      addMessage(response.message, false)
      announceToScreenReader(`AI responded: ${response.message.substring(0, 100)}...`)
    } else {
      error.value = response.message || 'Failed to get response from AI assistant'
      announceToScreenReader('Error: Failed to get AI response')
    }
  } catch (err) {
    console.error('Chat error:', err)
    error.value = 'Sorry, I encountered an error. Please try again.'
    announceToScreenReader('Error occurred while sending message')
  } finally {
    isTyping.value = false
    nextTick(() => {
      scrollToBottom()
      messageInput.value?.focus()
    })
  }
}

const sendQuickResponse = (prompt) => {
  currentMessage.value = prompt
  showQuickResponses.value = false
  nextTick(() => {
    sendMessage()
  })
}

const addMessage = (text, isUser = false) => {
  const message = {
    id: Date.now() + Math.random(),
    text,
    isUser,
    timestamp: new Date(),
    feedback: null,
  }

  messages.value.push(message)

  // Limit message history
  if (messages.value.length > maxMessages) {
    messages.value = messages.value.slice(-maxMessages)
  }

  // Show notification if chat is closed
  if (!isOpen.value && !isUser) {
    hasUnreadMessages.value = true
  }

  nextTick(() => {
    scrollToBottom()
  })
}

const formatMessage = (text) => {
  try {
    // Convert markdown to HTML
    let html = marked(text)

    // Sanitize HTML to prevent XSS
    html = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'ul',
        'ol',
        'li',
        'code',
        'pre',
        'blockquote',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
      ALLOWED_ATTR: [],
    })

    return html
  } catch (error) {
    console.error('Error formatting message:', error)
    return DOMPurify.sanitize(text)
  }
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('default', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const clearConversation = () => {
  if (confirm('Are you sure you want to clear the conversation?')) {
    messages.value = []
    geminiService.clearConversationHistory()
    showQuickResponses.value = true
    announceToScreenReader('Conversation cleared')
  }
}

const clearError = () => {
  error.value = ''
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    announceToScreenReader('Message copied to clipboard')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const provideFeedback = (message, feedback) => {
  message.feedback = message.feedback === feedback ? null : feedback
  announceToScreenReader(`Feedback provided: ${feedback}`)
}

const handleInput = () => {
  // Clear error when user starts typing
  if (error.value) {
    error.value = ''
  }
}

// Voice recognition methods
const setupVoiceRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = getPreferredLanguage() || 'en-US'

  recognition.onstart = () => {
    isListening.value = true
    announceToScreenReader('Voice input started')
  }

  recognition.onend = () => {
    isListening.value = false
    announceToScreenReader('Voice input ended')
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    currentMessage.value = transcript
    messageInput.value?.focus()
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
    announceToScreenReader('Voice input error')
  }
}

const toggleVoiceInput = () => {
  if (!recognition) return

  if (isListening.value) {
    recognition.stop()
  } else {
    recognition.start()
  }
}

// Utility functions
const getUserLocation = () => {
  // This would integrate with geolocation service if available
  return null
}

const getPreferredLanguage = () => {
  return navigator.language || 'en-US'
}

const announceToScreenReader = (message) => {
  const announcer = document.getElementById('chat-announcements')
  if (announcer) {
    announcer.textContent = message
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }
}

// Cleanup
onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
})

// Watch for message changes to auto-scroll
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true }
)
</script>

<style scoped>
.chat-bot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}

.chat-toggle-btn {
  position: relative;
  border: none;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
}

.pulse-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: #dc3545;
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.chat-window {
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 600px;
  max-height: calc(100vh - 40px);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #dee2e6;
}

.chat-window.minimized {
  height: auto;
}

.chat-header {
  flex-shrink: 0;
  border-radius: 1rem 1rem 0 0;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.ai-avatar-large {
  width: 60px;
  height: 60px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.quick-responses {
  flex-shrink: 0;
  background: #f8f9fa;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scroll-behavior: smooth;
}

.welcome-message {
  text-align: center;
  opacity: 0.8;
}

.message-wrapper {
  margin-bottom: 1rem;
}

.message-wrapper.user-message {
  display: flex;
  justify-content: flex-end;
}

.message-wrapper.ai-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-start;
  max-width: 85%;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 8px;
  font-size: 0.9rem;
}

.user-message .message-avatar {
  background: #007bff;
  color: white;
}

.ai-message .message-avatar {
  background: #6c757d;
  color: white;
}

.message-bubble {
  background: #f8f9fa;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  position: relative;
  word-wrap: break-word;
}

.user-message .message-bubble {
  background: #007bff;
  color: white;
}

.ai-message .message-bubble {
  background: #e9ecef;
  color: #212529;
}

.message-text {
  line-height: 1.4;
}

.message-text :deep(p) {
  margin-bottom: 0.5rem;
}

.message-text :deep(p):last-child {
  margin-bottom: 0;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
}

.message-actions .btn {
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

.chat-input-area {
  flex-shrink: 0;
  background: white;
}

.input-group .form-control {
  border-radius: 1.5rem 0 0 1.5rem;
  border-right: none;
}

.input-group .btn {
  border-radius: 0 1.5rem 1.5rem 0;
  border-left: none;
}

.chat-controls-bottom {
  flex-wrap: wrap;
}

.voice-controls .btn.active {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.error-message {
  flex-shrink: 0;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-bot-container {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .chat-window {
    width: 100%;
    height: 70vh;
    bottom: 80px;
    position: fixed;
  }

  .chat-toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .quick-responses .col-6 {
    margin-bottom: 0.5rem;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .chat-window {
    border: 2px solid #000;
  }

  .message-bubble {
    border: 1px solid #666;
  }

  .user-message .message-bubble {
    border-color: #fff;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .chat-toggle-btn,
  .pulse-dot,
  .typing-indicator span {
    animation: none;
  }

  .chat-toggle-btn:hover {
    transform: none;
  }

  .messages-container {
    scroll-behavior: auto;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .chat-window {
    background: #2d3748;
    border-color: #4a5568;
  }

  .quick-responses {
    background: #1a202c;
  }

  .ai-message .message-bubble {
    background: #4a5568;
    color: #e2e8f0;
  }

  .message-text :deep(code) {
    background: rgba(255, 255, 255, 0.1);
  }

  .chat-input-area {
    background: #2d3748;
    border-color: #4a5568;
  }

  .form-control {
    background: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }

  .form-control:focus {
    background: #4a5568;
    border-color: #63b3ed;
    color: #e2e8f0;
  }
}

/* Print Styles */
@media print {
  .chat-bot-container {
    display: none;
  }
}
</style>
