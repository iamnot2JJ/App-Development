<template>
  <div class="ai-chat-page">
    <!-- Page Header -->
    <div class="page-header bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3">
              <i class="fas fa-robot me-3" aria-hidden="true"></i>
              AI Health Assistant
            </h1>
            <p class="lead mb-0">
              Get instant, personalized health guidance powered by advanced AI technology. Available
              24/7 to help you navigate healthcare services and answer your health questions.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <div class="ai-stats">
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Available</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10+</div>
                <div class="stat-label">Languages</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">100%</div>
                <div class="stat-label">Confidential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container my-5">
      <div class="row">
        <!-- Chat Interface -->
        <div class="col-lg-8">
          <div class="chat-interface-container">
            <!-- Full-Screen Chat -->
            <div class="full-screen-chat card shadow">
              <div class="card-header bg-light d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="ai-status-indicator me-3">
                    <div class="status-dot online"></div>
                    <span class="fw-bold">AI Assistant Online</span>
                  </div>
                </div>

                <div class="chat-actions">
                  <button
                    @click="exportConversation"
                    class="btn btn-sm btn-outline-primary me-2"
                    type="button"
                    title="Export conversation"
                    :disabled="messages.length === 0"
                  >
                    <i class="fas fa-download me-1" aria-hidden="true"></i>
                    Export
                  </button>

                  <button
                    @click="clearConversation"
                    class="btn btn-sm btn-outline-danger"
                    type="button"
                    title="Clear conversation"
                    :disabled="messages.length === 0"
                  >
                    <i class="fas fa-trash me-1" aria-hidden="true"></i>
                    Clear
                  </button>
                </div>
              </div>

              <div class="card-body p-0">
                <!-- Chat Messages Area -->
                <div
                  ref="messagesContainer"
                  class="messages-area"
                  role="log"
                  aria-live="polite"
                  aria-label="Chat conversation"
                >
                  <!-- Welcome Screen -->
                  <div v-if="messages.length === 0" class="welcome-screen p-5 text-center">
                    <div class="welcome-animation mb-4">
                      <div class="ai-avatar-large">
                        <i class="fas fa-robot text-primary"></i>
                      </div>
                      <div class="pulse-rings">
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring"></div>
                      </div>
                    </div>

                    <h3 class="text-primary mb-3">Welcome to AI Health Assistant</h3>
                    <p class="text-muted mb-4">
                      I'm here to provide health information, help you navigate healthcare services,
                      and offer culturally sensitive support for migrant health needs.
                    </p>

                    <!-- Quick Start Buttons -->
                    <div class="quick-start-grid">
                      <button
                        v-for="starter in quickStarters"
                        :key="starter.id"
                        @click="sendQuickMessage(starter.message)"
                        class="quick-start-btn btn btn-outline-primary"
                        type="button"
                      >
                        <i :class="starter.icon" aria-hidden="true"></i>
                        <span>{{ starter.title }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Message History -->
                  <div v-else class="messages-history">
                    <div
                      v-for="(message, index) in messages"
                      :key="index"
                      class="message-item"
                      :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
                    >
                      <div class="message-content">
                        <div class="message-avatar">
                          <i
                            :class="message.isUser ? 'fas fa-user' : 'fas fa-robot'"
                            aria-hidden="true"
                          ></i>
                        </div>

                        <div class="message-bubble">
                          <div class="message-text" v-html="formatMessage(message.text)"></div>

                          <div class="message-meta">
                            <small class="text-muted">
                              {{ formatTime(message.timestamp) }}
                            </small>

                            <div v-if="!message.isUser" class="message-actions">
                              <button
                                @click="copyMessage(message.text)"
                                class="btn btn-sm btn-outline-secondary"
                                type="button"
                                title="Copy message"
                              >
                                <i class="fas fa-copy" aria-hidden="true"></i>
                              </button>

                              <button
                                @click="speakMessage(message.text)"
                                class="btn btn-sm btn-outline-info ms-1"
                                type="button"
                                title="Read aloud"
                                v-if="supportsSpeech"
                              >
                                <i class="fas fa-volume-up" aria-hidden="true"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div v-if="isTyping" class="message-item ai-message">
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
                  </div>
                </div>

                <!-- Input Area -->
                <div class="input-area border-top">
                  <div class="input-container p-3">
                    <!-- Context Tags -->
                    <div v-if="selectedContext.length > 0" class="context-tags mb-2">
                      <span
                        v-for="tag in selectedContext"
                        :key="tag"
                        class="badge bg-light text-dark me-1"
                      >
                        {{ tag }}
                        <button
                          @click="removeContext(tag)"
                          class="btn-close btn-close-sm ms-1"
                          type="button"
                          aria-label="Remove context"
                        ></button>
                      </span>
                    </div>

                    <!-- Main Input -->
                    <div class="input-group">
                      <button
                        @click="showContextMenu = !showContextMenu"
                        class="btn btn-outline-secondary"
                        type="button"
                        title="Add context"
                      >
                        <i class="fas fa-tags" aria-hidden="true"></i>
                      </button>

                      <textarea
                        ref="messageInput"
                        v-model="currentMessage"
                        @keydown="handleKeyDown"
                        @input="handleInput"
                        class="form-control"
                        placeholder="Ask me about health services, symptoms, appointments, or any health-related questions..."
                        rows="1"
                        :disabled="isTyping"
                        maxlength="1000"
                        style="resize: none"
                        aria-label="Type your health question"
                      ></textarea>

                      <button
                        v-if="supportsVoice"
                        @click="toggleVoiceInput"
                        class="btn btn-outline-info"
                        type="button"
                        :class="{ active: isListening }"
                        :title="isListening ? 'Stop voice input' : 'Start voice input'"
                      >
                        <i
                          :class="isListening ? 'fas fa-microphone-slash' : 'fas fa-microphone'"
                          aria-hidden="true"
                        ></i>
                      </button>

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

                    <!-- Character Counter and Quick Actions -->
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <div class="quick-actions">
                        <button
                          @click="addEmergencyContext"
                          class="btn btn-sm btn-outline-danger me-1"
                          type="button"
                          title="Emergency assistance"
                        >
                          <i class="fas fa-exclamation-triangle me-1" aria-hidden="true"></i>
                          Emergency
                        </button>

                        <button
                          @click="addLanguageContext"
                          class="btn btn-sm btn-outline-info me-1"
                          type="button"
                          title="Language assistance"
                        >
                          <i class="fas fa-language me-1" aria-hidden="true"></i>
                          Language Help
                        </button>
                      </div>

                      <small class="text-muted">{{ currentMessage.length }}/1000</small>
                    </div>

                    <!-- Context Menu -->
                    <div
                      v-if="showContextMenu"
                      class="context-menu mt-2 p-2 border rounded bg-light"
                    >
                      <h6 class="mb-2">Add Context:</h6>
                      <div class="context-options">
                        <button
                          v-for="context in availableContexts"
                          :key="context"
                          @click="addContext(context)"
                          class="btn btn-sm btn-outline-secondary me-1 mb-1"
                          type="button"
                        >
                          {{ context }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- AI Features -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-magic me-2" aria-hidden="true"></i>
                AI Capabilities
              </h5>
            </div>
            <div class="card-body">
              <div class="feature-list">
                <div class="feature-item">
                  <i class="fas fa-stethoscope text-primary" aria-hidden="true"></i>
                  <div>
                    <strong>Health Information</strong>
                    <small class="text-muted d-block"
                      >Get accurate, up-to-date health guidance</small
                    >
                  </div>
                </div>

                <div class="feature-item">
                  <i class="fas fa-map-marker-alt text-success" aria-hidden="true"></i>
                  <div>
                    <strong>Service Navigation</strong>
                    <small class="text-muted d-block">Find healthcare providers and services</small>
                  </div>
                </div>

                <div class="feature-item">
                  <i class="fas fa-globe text-info" aria-hidden="true"></i>
                  <div>
                    <strong>Cultural Sensitivity</strong>
                    <small class="text-muted d-block">Culturally aware health support</small>
                  </div>
                </div>

                <div class="feature-item">
                  <i class="fas fa-clock text-warning" aria-hidden="true"></i>
                  <div>
                    <strong>24/7 Availability</strong>
                    <small class="text-muted d-block">Round-the-clock assistance</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-external-link-alt me-2" aria-hidden="true"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/map" class="btn btn-outline-primary">
                  <i class="fas fa-map me-2" aria-hidden="true"></i>
                  Find Healthcare Providers
                </router-link>

                <router-link to="/appointments" class="btn btn-outline-success">
                  <i class="fas fa-calendar me-2" aria-hidden="true"></i>
                  Book Appointment
                </router-link>

                <router-link to="/resources" class="btn btn-outline-info">
                  <i class="fas fa-book me-2" aria-hidden="true"></i>
                  Health Resources
                </router-link>
              </div>
            </div>
          </div>

          <!-- Safety Notice -->
          <div class="card border-warning">
            <div class="card-header bg-warning bg-opacity-10">
              <h6 class="mb-0 text-warning">
                <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
                Important Notice
              </h6>
            </div>
            <div class="card-body">
              <p class="small mb-2">
                This AI assistant provides general health information and guidance. It is not a
                substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p class="small mb-0">
                <strong
                  >In case of emergency, call your local emergency services immediately.</strong
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import geminiService from '../services/geminiService.js'

// Reactive state
const messages = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const isListening = ref(false)
const showContextMenu = ref(false)
const selectedContext = ref([])

// Refs
const messagesContainer = ref(null)
const messageInput = ref(null)

// Voice and speech capabilities
const supportsVoice = ref(false)
const supportsSpeech = ref(false)
let recognition = null
let speechSynthesis = null

// Quick starter messages
const quickStarters = ref([
  {
    id: 1,
    title: 'Find Doctor',
    icon: 'fas fa-user-md',
    message: 'I need help finding a doctor near me. Can you guide me through the process?',
  },
  {
    id: 2,
    title: 'Emergency Info',
    icon: 'fas fa-ambulance',
    message:
      'What should I do in a medical emergency? Please provide emergency contact information.',
  },
  {
    id: 3,
    title: 'Health Insurance',
    icon: 'fas fa-shield-alt',
    message: 'I need help understanding health insurance options. Can you explain the basics?',
  },
  {
    id: 4,
    title: 'Mental Health',
    icon: 'fas fa-brain',
    message:
      "I'm looking for mental health support resources. What options are available for migrants?",
  },
])

// Context options
const availableContexts = ref([
  'Emergency',
  'Mental Health',
  'Chronic Condition',
  'Pregnancy',
  'Child Health',
  'Elderly Care',
  'Language Barrier',
  'Insurance Help',
  'Preventive Care',
  'Cultural Practices',
])

// Initialize component
onMounted(async () => {
  // Check browser capabilities
  supportsVoice.value = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  supportsSpeech.value = 'speechSynthesis' in window

  if (supportsVoice.value) {
    setupVoiceRecognition()
  }

  if (supportsSpeech.value) {
    speechSynthesis = window.speechSynthesis
  }

  // Setup marked for markdown rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  // Focus input
  nextTick(() => {
    messageInput.value?.focus()
  })
})

// Methods
const sendMessage = async () => {
  const message = currentMessage.value.trim()
  if (!message || isTyping.value) return

  // Add user message
  addMessage(message, true)
  currentMessage.value = ''
  isTyping.value = true

  try {
    // Prepare context
    const context = {
      selectedContext: selectedContext.value,
      userLocation: await getUserLocation(),
      preferredLanguage: navigator.language || 'en-US',
      timestamp: new Date(),
    }

    // Send to Gemini
    const response = await geminiService.sendMessage(message, context)

    if (response.success) {
      addMessage(response.message, false)
    } else {
      addMessage(
        response.message || 'Sorry, I encountered an error. Please try again.',
        false,
        true
      )
    }
  } catch (error) {
    console.error('Chat error:', error)
    addMessage(
      'I apologize, but I encountered an error. Please try again in a moment.',
      false,
      true
    )
  } finally {
    isTyping.value = false
    nextTick(() => {
      scrollToBottom()
      messageInput.value?.focus()
    })
  }
}

const sendQuickMessage = (message) => {
  currentMessage.value = message
  nextTick(() => {
    sendMessage()
  })
}

const addMessage = (text, isUser = false, isError = false) => {
  messages.value.push({
    id: Date.now() + Math.random(),
    text,
    isUser,
    isError,
    timestamp: new Date(),
  })

  nextTick(() => {
    scrollToBottom()
  })
}

const formatMessage = (text) => {
  try {
    let html = marked(text)
    return DOMPurify.sanitize(html, {
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
  } catch (error) {
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
    selectedContext.value = []
    geminiService.clearConversationHistory()
  }
}

const exportConversation = () => {
  const conversationText = messages.value
    .map(
      (msg) => `${msg.isUser ? 'You' : 'AI Assistant'} (${formatTime(msg.timestamp)}): ${msg.text}`
    )
    .join('\n\n')

  const blob = new Blob([conversationText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-health-chat-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const copyMessage = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add toast notification here
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const speakMessage = (text) => {
  if (!supportsSpeech.value) return

  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.8
  utterance.pitch = 1
  speechSynthesis.speak(utterance)
}

// Context management
const addContext = (context) => {
  if (!selectedContext.value.includes(context)) {
    selectedContext.value.push(context)
  }
  showContextMenu.value = false
}

const removeContext = (context) => {
  selectedContext.value = selectedContext.value.filter((c) => c !== context)
}

const addEmergencyContext = () => {
  addContext('Emergency')
  currentMessage.value =
    'This is an emergency situation. Please provide immediate guidance and emergency contact information.'
}

const addLanguageContext = () => {
  addContext('Language Barrier')
  currentMessage.value =
    'I need help with language interpretation services for medical appointments. What options are available?'
}

// Input handling
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // Auto-resize textarea
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

// Voice recognition
const setupVoiceRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = navigator.language || 'en-US'

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    currentMessage.value = transcript
    nextTick(() => {
      handleInput()
      messageInput.value?.focus()
    })
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isListening.value = false
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
const getUserLocation = async () => {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => resolve(null),
        { timeout: 5000 }
      )
    } else {
      resolve(null)
    }
  })
}

// Auto-scroll on new messages
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
.ai-chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 56px; /* Account for fixed navbar */
}

.page-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  backdrop-filter: blur(10px);
}

.ai-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.chat-interface-container {
  margin-bottom: 2rem;
}

.full-screen-chat {
  height: 70vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.ai-status-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot.online {
  background: #28a745;
  animation: pulse 2s infinite;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  max-height: calc(70vh - 140px);
}

.welcome-screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-animation {
  position: relative;
  margin-bottom: 2rem;
}

.ai-avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007bff, #6f42c1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  position: relative;
  z-index: 2;
}

.pulse-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pulse-ring {
  position: absolute;
  border: 2px solid rgba(0, 123, 255, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.pulse-ring:nth-child(1) {
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
}

.pulse-ring:nth-child(2) {
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  animation-delay: 0.5s;
}

.pulse-ring:nth-child(3) {
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  animation-delay: 1s;
}

.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 600px;
}

.quick-start-btn {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.quick-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.quick-start-btn i {
  font-size: 1.5rem;
}

.messages-history {
  padding: 1.5rem;
}

.message-item {
  margin-bottom: 1.5rem;
  display: flex;
}

.message-item.user-message {
  justify-content: flex-end;
}

.message-item.ai-message {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-start;
  max-width: 80%;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.75rem;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.message-bubble {
  background: #f8f9fa;
  border-radius: 1.125rem;
  padding: 1rem 1.25rem;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.ai-message .message-bubble {
  background: white;
  border: 1px solid #e9ecef;
}

.message-text :deep(p) {
  margin-bottom: 0.5rem;
}

.message-text :deep(p):last-child {
  margin-bottom: 0;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
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
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
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

.input-area {
  background: white;
}

.input-container textarea {
  border: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
}

.input-container textarea:focus {
  box-shadow: none;
  border-color: #007bff;
}

.context-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.context-menu {
  animation: slideDown 0.2s ease;
}

.context-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.feature-item i {
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .ai-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .full-screen-chat {
    height: 60vh;
    min-height: 400px;
  }

  .quick-start-grid {
    grid-template-columns: 1fr;
  }

  .message-content {
    max-width: 95%;
  }

  .feature-list {
    gap: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .page-header {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  }

  .full-screen-chat {
    background: #2d3748;
    border-color: #4a5568;
  }

  .ai-message .message-bubble {
    background: #4a5568;
    color: #e2e8f0;
    border-color: #718096;
  }

  .input-area {
    background: #2d3748;
    border-color: #4a5568;
  }

  .input-container textarea {
    background: #4a5568;
    color: #e2e8f0;
    border-color: #718096;
  }

  .context-menu {
    background: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .pulse-ring,
  .status-dot,
  .typing-indicator span,
  .quick-start-btn:hover {
    animation: none;
  }

  .quick-start-btn:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .page-header,
  .input-area,
  .chat-actions,
  .quick-actions {
    display: none;
  }

  .full-screen-chat {
    height: auto;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>
