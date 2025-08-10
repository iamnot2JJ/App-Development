// Safe Gemini Service - prevents app crashes from AI errors
class SafeGeminiService {
  constructor() {
    this.isInitialized = false
    this.errorMessage = null
    this.conversationHistory = []

    try {
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (this.apiKey) {
        console.log('Gemini API key found, service ready')
        this.isInitialized = true
      } else {
        console.warn('Gemini API key not found')
        this.errorMessage = 'API key not configured'
      }
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error)
      this.errorMessage = error.message
    }
  }

  async sendMessage(message, context = {}) {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'AI服务暂时不可用。' + (this.errorMessage || '请稍后再试。'),
        timestamp: new Date(),
        error: this.errorMessage,
      }
    }

    // Simulate AI response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          '感谢您的问题。我是AI健康助手，很高兴为您提供帮助。',
          '我理解您的关注。作为健康助手，我建议您咨询专业医生获得准确的医疗建议。',
          '这是一个很好的健康问题。我可以为您提供一般性的健康信息。',
          '根据您的问题，我建议您查看我们的健康资源页面或联系医疗专业人士。',
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        resolve({
          success: true,
          message: randomResponse,
          timestamp: new Date(),
          metadata: { simulation: true },
        })
      }, 1000)
    })
  }

  async getHealthQuickResponses() {
    return [
      {
        id: 1,
        title: 'Find Healthcare Providers',
        description: 'Locate doctors, clinics, and hospitals in your area',
        prompt:
          'I need help finding healthcare providers near me. Can you guide me through the process?',
      },
      {
        id: 2,
        title: 'Book an Appointment',
        description: 'Learn how to schedule medical appointments',
        prompt: 'How can I book a medical appointment through this platform?',
      },
      {
        id: 3,
        title: 'Emergency Information',
        description: 'Get emergency contacts and procedures',
        prompt:
          'What should I do in a medical emergency? Can you provide emergency contact information?',
      },
      {
        id: 4,
        title: 'Health Insurance Help',
        description: 'Understanding health insurance options',
        prompt: 'I need help understanding health insurance options for migrants. Can you explain?',
      },
    ]
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearConversationHistory() {
    this.conversationHistory = []
  }
}

// Create and export a singleton instance
export const geminiService = new SafeGeminiService()
export default geminiService
