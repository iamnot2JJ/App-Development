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
      if (!this.apiKey) {
        throw new Error('Gemini API key not found. Please check your environment variables.')
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey)

      // Initialize the model with health-focused configuration
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
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

      this.initializeChat()
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error)
      throw error
    }
  }

  initializeChat() {
    const systemPrompt = `You are a helpful AI assistant for the Migrant Health Charity web application. Your role is to:

1. Provide accurate health information and guidance
2. Help users navigate the healthcare system
3. Offer culturally sensitive support for migrant communities
4. Direct users to appropriate resources and services
5. Answer questions about the application features

Key guidelines:
- Always be empathetic and respectful
- Provide clear, easy-to-understand information
- Consider language barriers and cultural differences
- Recommend professional medical advice when appropriate
- Never provide specific medical diagnoses
- Focus on preventive care and health education
- Be aware of mental health considerations
- Promote inclusive healthcare access

You can help with:
- General health information
- Navigation assistance for the app
- Healthcare resource recommendations
- Appointment booking guidance
- Understanding health insurance
- Finding local healthcare providers
- Mental health support resources
- Language interpretation services
- Cultural health practices
- Emergency contact information

Always maintain a professional, caring, and helpful tone.`

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
              text: "Hello! I'm your AI health assistant for the Migrant Health Charity platform. I'm here to help you with health information, navigate our services, and provide culturally sensitive support. How can I assist you today?",
            },
          ],
        },
      ],
    })
  }

  async sendMessage(message, context = {}) {
    try {
      if (!this.chat) {
        throw new Error('Chat not initialized')
      }

      // Add context if provided (user location, language preference, etc.)
      let enhancedMessage = message
      if (context.userLocation) {
        enhancedMessage += `\n\nUser location context: ${context.userLocation}`
      }
      if (context.preferredLanguage) {
        enhancedMessage += `\n\nUser's preferred language: ${context.preferredLanguage}`
      }
      if (context.healthConcern) {
        enhancedMessage += `\n\nHealth concern category: ${context.healthConcern}`
      }

      const result = await this.chat.sendMessage(enhancedMessage)
      const response = await result.response
      const text = response.text()

      // Store conversation history
      this.conversationHistory.push({
        timestamp: new Date(),
        user: message,
        ai: text,
        context: context,
      })

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
      console.error('Error sending message to Gemini:', error)

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
