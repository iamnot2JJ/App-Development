import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.genAI = null
    this.model = null
    this.chat = null
    this.conversationHistory = []

    this.initializeAI()
  }

  initializeAI() {
    try {
      console.log('🔧 Initializing Gemini AI...')

      if (!this.apiKey) {
        console.error('❌ API Key not found')
        throw new Error('Gemini API key not found. Please check your environment variables.')
      }

      console.log('✅ API Key found:', this.apiKey.substring(0, 10) + '...')

      this.genAI = new GoogleGenerativeAI(this.apiKey)
      console.log('✅ GoogleGenerativeAI instance created')

      // Use the latest and most powerful Gemini model
      // Note: Gemini 2.5 Pro may not be publicly available yet
      // Using the most advanced available version
      const modelNames = [
        'gemini-1.5-flash', // Fast and reliable
        'gemini-1.5-pro', // More advanced but may be slower
        'gemini-pro', // Fallback
      ]
      let modelName = modelNames[0] // Default to Gemini 1.5 Flash (fast and stable)

      console.log('🔧 Using model:', modelName)

      // Initialize the model with health-focused configuration
      this.model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      })

      console.log('✅ Gemini model configured with:', modelName)
      this.initializeChat()
      console.log('✅ Gemini AI fully initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error)
      throw error
    }
  }

  initializeChat() {
    const systemPrompt = `You are an AI health assistant for the Migrant Health Charity platform, created by Junjiezhou（周俊杰） from Monash University for the FIT5032 project.

CRITICAL RULES:
1. Keep ALL responses SHORT and CONCISE (maximum 2-3 sentences)
2. ALWAYS respond in the SAME language the user uses - if they write in Chinese, respond ONLY in Chinese with NO English/pinyin
3. If user writes in English, respond ONLY in English
4. NO mixing languages in your responses

Guidelines:
- Be empathetic and respectful
- Provide clear, simple information
- Recommend professional medical advice when needed
- Never diagnose or replace professional care
- Focus on practical help
Your role is to:

1. Provide accurate, evidence-based health information and guidance
2. Help users navigate the healthcare system with cultural sensitivity
3. Offer multilingual support for migrant communities
4. Direct users to appropriate resources and services
5. Answer questions about the application features with advanced AI capabilities

Advanced capabilities you possess:
- Multi-step reasoning for complex health scenarios
- Cultural context awareness for diverse populations
- Multilingual communication with nuanced understanding
- Integration of traditional and modern healthcare approaches
- Personalized health guidance based on individual circumstances

You can help with:
- General health information and education
- Navigation assistance for the healthcare system
- Healthcare resource recommendations with cultural considerations
- Appointment booking guidance in multiple languages
- Understanding health insurance and healthcare rights
- Finding culturally competent healthcare providers
- Mental health support resources for migrants
- Language interpretation and translation services
- Integration of traditional and evidence-based health practices
- Emergency contact information and procedures
- Health advocacy and rights information
Keep responses brief and in the user's language!`

    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "Hello! I'm your AI health assistant. I'll keep my responses short and match your language. How can I help you today?",
            },
          ],
        },
      ],
    })
  }

  async sendMessage(message, context = {}) {
    try {
      console.log('🚀 Starting sendMessage with:', { message, context })

      if (!this.chat) {
        console.error('❌ Chat not initialized')
        throw new Error('Chat not initialized')
      }

      // Special handling for creator questions
      const creatorKeywords = [
        '谁创造',
        '谁发明',
        '谁开发',
        'who created',
        'who invented',
        'who developed',
        'who made',
        '创作者',
        'creator',
        'developer',
      ]
      if (creatorKeywords.some((keyword) => message.toLowerCase().includes(keyword))) {
        const isChinese = /[\u4e00-\u9fff]/.test(message)
        const responseText = isChinese
          ? '我是由莫纳什大学学生Junjiezhou创建的，作为FIT5032项目的一部分。'
          : 'I was created by Junjiezhou, a student from Monash University, as part of the FIT5032 project.'

        return {
          success: true,
          message: responseText,
          timestamp: new Date(),
          metadata: {
            specialResponse: true,
            creator: 'Junjiezhou - Monash University',
          },
        }
      }

      // Add context if provided (user location, language preference, etc.)
      let enhancedMessage = message

      // Detect language and add strict language instruction
      const isChinese = /[\u4e00-\u9fff]/.test(message)
      const isEnglish = /^[a-zA-Z\s.,!?]+$/.test(message.trim())

      if (isChinese) {
        enhancedMessage += `\n\n[CRITICAL: 用户使用中文提问，你必须ONLY用中文回答，不要包含任何英文、拼音或其他语言。回答要简短（四五句话左右）。]`
      } else if (isEnglish) {
        enhancedMessage += `\n\n[CRITICAL: User wrote in English, respond ONLY in English with NO Chinese characters. Keep response brief (max 2-3 sentences).]`
      }

      if (context.userLocation) {
        enhancedMessage += `\n\nUser location context: ${context.userLocation}`
      }
      if (context.preferredLanguage) {
        enhancedMessage += `\n\nUser's preferred language: ${context.preferredLanguage}`
      }
      if (context.healthConcern) {
        enhancedMessage += `\n\nHealth concern category: ${context.healthConcern}`
      }

      console.log('📝 Enhanced message:', enhancedMessage)
      console.log('💬 Sending to Gemini API...')

      const result = await this.chat.sendMessage(enhancedMessage)
      console.log('📦 Raw result from API:', result)

      const response = await result.response
      console.log('📄 Response object:', response)

      const text = response.text()
      console.log('📝 Response text:', text)

      // Store conversation history
      this.conversationHistory.push({
        timestamp: new Date(),
        user: message,
        ai: text,
        context: context,
      })

      console.log('✅ Message processed successfully')
      return {
        success: true,
        message: text,
        timestamp: new Date(),
        metadata: {
          usage: response.usageMetadata || null,
          candidates: response.candidates?.length || 1,
        },
      }
    } catch (error) {
      console.error('❌ Error sending message to Gemini:', error)
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      })

      let errorMessage = 'I apologize, but I encountered an error while processing your message. '

      if (error.message?.includes('API key')) {
        errorMessage += 'There seems to be an issue with the AI service configuration.'
      } else if (error.message?.includes('quota')) {
        errorMessage +=
          'The service is currently experiencing high demand. Please try again in a moment.'
      } else if (error.message?.includes('safety')) {
        errorMessage += 'Your message was flagged by safety filters. Please rephrase your question.'
      } else {
        errorMessage += 'Please try again, and if the problem persists, contact our support team.'
      }

      return {
        success: false,
        message: errorMessage,
        timestamp: new Date(),
        error: error.message,
      }
    }
  }

  async getHealthQuickResponses() {
    const quickResponses = [
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
      {
        id: 5,
        title: 'Mental Health Support',
        description: 'Access mental health resources and support',
        prompt: "I'm looking for mental health support resources. What options are available?",
      },
      {
        id: 6,
        title: 'Language Services',
        description: 'Find interpretation and translation services',
        prompt:
          'I need language interpretation services for medical appointments. How can I access these?',
      },
      {
        id: 7,
        title: 'Preventive Care',
        description: 'Learn about preventive healthcare measures',
        prompt:
          'What preventive healthcare measures should I be aware of? Can you provide a general health checklist?',
      },
      {
        id: 8,
        title: 'Cultural Health Practices',
        description: 'Integrating traditional and modern healthcare',
        prompt: 'How can I integrate my cultural health practices with modern healthcare services?',
      },
    ]

    return quickResponses
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearConversationHistory() {
    this.conversationHistory = []
    this.initializeChat()
  }

  async generateHealthTips(category = 'general') {
    try {
      const prompt = `Generate 3-5 practical health tips for migrants in the "${category}" category.
      Make them culturally sensitive, easy to understand, and actionable.
      Format as a simple list with brief explanations.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return {
        success: true,
        tips: response.text(),
        category: category,
      }
    } catch (error) {
      console.error('Error generating health tips:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async summarizeConversation() {
    if (this.conversationHistory.length === 0) {
      return 'No conversation to summarize.'
    }

    try {
      const conversationText = this.conversationHistory
        .map((entry) => `User: ${entry.user}\nAI: ${entry.ai}`)
        .join('\n\n')

      const prompt = `Please provide a brief summary of this health-related conversation, highlighting key topics discussed and any important recommendations made:\n\n${conversationText}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error summarizing conversation:', error)
      return 'Unable to generate conversation summary.'
    }
  }
}

// Create and export a singleton instance
export const geminiService = new GeminiService()
export default geminiService
