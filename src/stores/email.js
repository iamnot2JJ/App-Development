import { defineStore } from 'pinia'
import { getFunctions, httpsCallable } from 'firebase/functions'

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

        let response
        if (emailData.attachment) {
          // Send email with attachment using Cloud Function
          response = await this.sendEmailWithAttachment(emailData)
        } else {
          // Send regular email using existing bulk email function
          const functions = getFunctions()
          const sendBulkEmailFunction = httpsCallable(functions, 'sendBulkEmail')

          response = await sendBulkEmailFunction({
            recipients: [
              {
                email: emailData.to,
                firstName: emailData.firstName || '',
                lastName: emailData.lastName || '',
              },
            ],
            subject: emailData.subject,
            message: emailData.message,
            fromName: emailData.fromName || 'Migrant Health Charity',
          })
        }

        const emailRecord = {
          id: Date.now(),
          ...emailData,
          sentAt: new Date().toISOString(),
          status: 'sent',
          hasAttachment: !!emailData.attachment,
          attachmentName: emailData.attachment?.name || null,
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

    async sendEmailWithAttachment(emailData) {
      try {
        const functions = getFunctions()
        const sendEmailWithAttachmentFunction = httpsCallable(functions, 'sendEmailWithAttachment')

        // Convert file to base64
        const attachmentData = await this.fileToBase64(emailData.attachment)

        const response = await sendEmailWithAttachmentFunction({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          fromName: emailData.fromName || 'Migrant Health Charity',
          attachment: {
            filename: emailData.attachment.name,
            content: attachmentData.content,
            contentType: emailData.attachment.type,
          },
        })

        return response
      } catch (error) {
        console.error('Error sending email with attachment:', error)
        throw error
      }
    },

    async sendBulkEmail(recipients, emailData) {
      try {
        this.loading = true
        this.error = null

        if (emailData.attachment) {
          // For bulk emails with attachments, send individually
          const results = []
          for (const recipient of recipients) {
            try {
              const personalizedEmail = {
                ...emailData,
                to: recipient.email,
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                message: this.personalizeMessage(emailData.message, recipient),
              }

              await this.sendEmailWithAttachment(personalizedEmail)
              results.push({ email: recipient.email, status: 'sent' })
            } catch (error) {
              results.push({ email: recipient.email, status: 'failed', error: error.message })
            }
          }
          return results
        } else {
          // Use Cloud Function for bulk emails without attachments
          const functions = getFunctions()
          const sendBulkEmailFunction = httpsCallable(functions, 'sendBulkEmail')

          const response = await sendBulkEmailFunction({
            recipients: recipients.map((r) => ({
              email: r.email,
              firstName: r.firstName || '',
              lastName: r.lastName || '',
            })),
            subject: emailData.subject,
            message: emailData.message,
            fromName: emailData.fromName || 'Migrant Health Charity',
          })

          // Record all sent emails
          recipients.forEach((recipient) => {
            const emailRecord = {
              id: Date.now() + Math.random(),
              to: recipient.email,
              subject: emailData.subject,
              message: this.personalizeMessage(emailData.message, recipient),
              fromName: emailData.fromName,
              sentAt: new Date().toISOString(),
              status: 'sent',
              hasAttachment: false,
            }
            this.sentEmails.push(emailRecord)
          })

          localStorage.setItem('sentEmails', JSON.stringify(this.sentEmails))
          return response
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const base64String = reader.result.split(',')[1] // Remove data:type;base64, prefix
          resolve({
            content: base64String,
            size: file.size,
          })
        }
        reader.onerror = (error) => reject(error)
      })
    },

    personalizeMessage(template, recipient) {
      return template
        .replace('{{firstName}}', recipient.firstName || '')
        .replace('{{lastName}}', recipient.lastName || '')
        .replace('{{fullName}}', `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim())
    },

    initializeStore() {
      const stored = localStorage.getItem('sentEmails')
      if (stored) {
        this.sentEmails = JSON.parse(stored)
      }
    },
  },
})
