import { defineStore } from 'pinia'
import axios from 'axios'

export const useEmailStore = defineStore('email', {
  state: () => ({
    loading: false,
    error: null,
    sentEmails: [],
  }),

  actions: {
    async sendEmail(emailData) {
      try {
        this.loading = true
        this.error = null

        // Using EmailJS for client-side email sending
        // You'll need to set up EmailJS account and get your service ID, template ID, and public key
        const templateParams = {
          to_email: emailData.to,
          from_name: emailData.fromName || 'Migrant Health Charity',
          subject: emailData.subject,
          message: emailData.message,
          reply_to: emailData.replyTo || 'noreply@migranthelp.org',
          attachment_url: emailData.attachmentUrl || '',
          attachment_name: emailData.attachmentName || '',
        }

        // This would typically use EmailJS or a backend service
        // For demo purposes, we'll simulate the email sending
        const response = await this.simulateEmailSending(templateParams)

        const emailRecord = {
          id: Date.now(),
          ...emailData,
          sentAt: new Date().toISOString(),
          status: 'sent',
        }

        this.sentEmails.push(emailRecord)
        localStorage.setItem('sentEmails', JSON.stringify(this.sentEmails))

        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async sendBulkEmail(recipients, emailData) {
      try {
        this.loading = true
        this.error = null

        const results = []

        for (const recipient of recipients) {
          try {
            const personalizedEmail = {
              ...emailData,
              to: recipient.email,
              message: this.personalizeMessage(emailData.message, recipient),
            }

            await this.sendEmail(personalizedEmail)
            results.push({ email: recipient.email, status: 'sent' })
          } catch (error) {
            results.push({ email: recipient.email, status: 'failed', error: error.message })
          }
        }

        return results
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    personalizeMessage(template, recipient) {
      return template
        .replace('{{firstName}}', recipient.firstName || '')
        .replace('{{lastName}}', recipient.lastName || '')
        .replace('{{fullName}}', `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim())
    },

    async simulateEmailSending(emailData) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate occasional failures for testing
      if (Math.random() < 0.1) {
        throw new Error('Email delivery failed')
      }

      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
    },

    initializeStore() {
      const stored = localStorage.getItem('sentEmails')
      if (stored) {
        this.sentEmails = JSON.parse(stored)
      }
    },
  },
})
