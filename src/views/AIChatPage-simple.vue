<template>
  <div class="ai-chat-page">
    <!-- Page Header -->
    <div class="page-header bg-primary text-white py-4">
      <div class="container">
        <h1 class="display-6 fw-bold mb-2">
          <i class="fas fa-robot me-3" aria-hidden="true"></i>
          AI Health Assistant
        </h1>
        <p class="lead mb-0">Your 24/7 health guidance companion powered by advanced AI</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container my-4">
      <div class="row">
        <!-- Chat Interface -->
        <div class="col-lg-8">
          <div class="chat-container card shadow">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <span class="text-success">●</span> AI Assistant Online
              </h5>
            </div>

            <!-- Messages Area -->
            <div class="card-body" style="height: 400px; overflow-y: auto" ref="messagesContainer">
              <div v-if="messages.length === 0" class="text-center text-muted py-5">
                <i class="fas fa-robot fa-3x mb-3"></i>
                <h5>Welcome to AI Health Assistant</h5>
                <p>Type a message below to start your conversation</p>
              </div>

              <div v-for="message in messages" :key="message.id" class="message mb-3">
                <div class="d-flex" :class="{ 'justify-content-end': message.isUser }">
                  <div
                    class="message-bubble"
                    :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
                  >
                    <div class="message-content">{{ message.text }}</div>
                    <small class="message-time text-muted">{{
                      formatTime(message.timestamp)
                    }}</small>
                  </div>
                </div>
              </div>

              <div v-if="isTyping" class="typing-indicator">
                <div class="d-flex">
                  <div class="ai-message">
                    <div class="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="card-footer">
              <div class="input-group">
                <input
                  v-model="currentMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  class="form-control"
                  placeholder="Type your health question here..."
                  :disabled="isTyping"
                />
                <button
                  @click="sendMessage"
                  class="btn btn-primary"
                  :disabled="!currentMessage.trim() || isTyping"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="card shadow">
            <div class="card-header">
              <h6 class="card-title mb-0">Quick Starters</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button
                  v-for="starter in quickStarters"
                  :key="starter.id"
                  @click="useQuickStarter(starter.message)"
                  class="btn btn-outline-primary btn-sm text-start"
                >
                  <i :class="starter.icon" class="me-2"></i>
                  {{ starter.title }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, nextTick } from 'vue'

export default {
  name: 'AIChatPage',
  setup() {
    const messages = ref([])
    const currentMessage = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)

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
        message: "I'm looking for mental health support resources. What options are available?",
      },
    ])

    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

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
        // Simulate AI response
        setTimeout(() => {
          const responses = [
            'Thank you for your question. I am your AI Health Assistant, happy to help you. Based on your needs, I recommend contacting local medical institutions for professional advice.',
            'I understand your concern. As a health assistant, I suggest consulting with professional doctors for accurate medical advice. You can also browse our health resources page for more information.',
            'This is a great health question. I can provide general health information, but please remember that any serious health issues should be discussed with medical professionals.',
            'Based on your question, I recommend checking our health resources page or contacting medical professionals. If this is an emergency, please call 000 immediately.',
            "I'm here to provide health guidance and support. For specific medical concerns, please consult with qualified healthcare providers in your area.",
            'Your health and wellbeing are important. I can offer general information, but professional medical consultation is always recommended for health issues.',
          ]

          const randomResponse = responses[Math.floor(Math.random() * responses.length)]

          const aiMessage = {
            id: Date.now() + 1,
            text: randomResponse,
            isUser: false,
            timestamp: new Date(),
          }

          messages.value.push(aiMessage)
          isTyping.value = false
          scrollToBottom()
        }, 1500)
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

    const useQuickStarter = (message) => {
      currentMessage.value = message
      sendMessage()
    }

    return {
      messages,
      currentMessage,
      isTyping,
      messagesContainer,
      quickStarters,
      formatTime,
      sendMessage,
      useQuickStarter,
    }
  },
}
</script>

<style scoped>
.ai-chat-page {
  min-height: 80vh;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  margin: 4px 0;
}

.user-message {
  background-color: #007bff;
  color: white;
  margin-left: auto;
}

.ai-message {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.message-content {
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.typing-indicator {
  margin: 10px 0;
}

.typing-dots {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 18px;
  border: 1px solid #e9ecef;
  max-width: fit-content;
}

.typing-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6c757d;
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.card-header {
  border-bottom: 1px solid #e9ecef;
}

.btn-outline-primary:hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}
</style>
