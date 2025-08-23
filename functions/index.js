const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  functions.config().gemini?.api_key || process.env.GEMINI_API_KEY
)

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
})

// Cloud Function: Send notification email when new resource is added
exports.sendResourceNotification = functions.firestore
  .document('resources/{resourceId}')
  .onCreate(async (snap, context) => {
    try {
      const resourceData = snap.data()

      // Get all users to send notification
      const usersSnapshot = await db.collection('users').get()
      const users = usersSnapshot.docs.map((doc) => doc.data())

      // Send email to all users
      const emailPromises = users.map((user) => {
        const mailOptions = {
          from: 'noreply@migranthelp.org',
          to: user.email,
          subject: 'New Resource Available - Migrant Health Charity',
          html: `
            <h2>New Resource Added</h2>
            <p>Hello ${user.firstName},</p>
            <p>A new resource has been added to our platform:</p>
            <h3>${resourceData.title}</h3>
            <p><strong>Category:</strong> ${resourceData.category}</p>
            <p><strong>Description:</strong> ${resourceData.description}</p>
            <p>Visit our platform to learn more about this resource.</p>
            <p>Best regards,<br>Migrant Health Charity Team</p>
          `,
        }

        return transporter.sendMail(mailOptions)
      })

      await Promise.all(emailPromises)
      console.log('Resource notification emails sent successfully')
    } catch (error) {
      console.error('Error sending resource notification:', error)
    }
  })

// Cloud Function: Process and analyze user ratings
exports.processRatingAnalytics = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snap, context) => {
    try {
      const ratingData = snap.data()
      const resourceId = ratingData.resourceId

      // Get all ratings for this resource
      const ratingsSnapshot = await db
        .collection('ratings')
        .where('resourceId', '==', resourceId)
        .get()

      const ratings = ratingsSnapshot.docs.map((doc) => doc.data())

      // Calculate analytics
      const totalRatings = ratings.length
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      const ratingDistribution = {
        1: ratings.filter((r) => r.rating === 1).length,
        2: ratings.filter((r) => r.rating === 2).length,
        3: ratings.filter((r) => r.rating === 3).length,
        4: ratings.filter((r) => r.rating === 4).length,
        5: ratings.filter((r) => r.rating === 5).length,
      }

      // Update resource with analytics
      await db.collection('resources').doc(resourceId).update({
        averageRating: averageRating,
        totalRatings: totalRatings,
        ratingDistribution: ratingDistribution,
        lastRatingUpdate: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Store analytics in separate collection
      await db.collection('analytics').doc(`${resourceId}_ratings`).set(
        {
          resourceId: resourceId,
          averageRating: averageRating,
          totalRatings: totalRatings,
          ratingDistribution: ratingDistribution,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      console.log('Rating analytics processed successfully')
    } catch (error) {
      console.error('Error processing rating analytics:', error)
    }
  })

// Cloud Function: Daily system health check
exports.dailyHealthCheck = functions.pubsub
  .schedule('0 9 * * *') // Run daily at 9 AM
  .timeZone('Australia/Melbourne')
  .onRun(async (context) => {
    try {
      const healthReport = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metrics: {},
      }

      // Check users count
      const usersSnapshot = await db.collection('users').get()
      healthReport.metrics.totalUsers = usersSnapshot.size

      // Check resources count
      const resourcesSnapshot = await db.collection('resources').get()
      healthReport.metrics.totalResources = resourcesSnapshot.size

      // Check ratings count
      const ratingsSnapshot = await db.collection('ratings').get()
      healthReport.metrics.totalRatings = ratingsSnapshot.size

      // Check for inactive users (no login in 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const inactiveUsersSnapshot = await db
        .collection('users')
        .where('lastLogin', '<', thirtyDaysAgo)
        .get()
      healthReport.metrics.inactiveUsers = inactiveUsersSnapshot.size

      // Save health report
      await db.collection('systemHealth').add(healthReport)

      // Send alert if there are issues
      if (healthReport.metrics.inactiveUsers > 50) {
        const mailOptions = {
          from: 'system@migranthelp.org',
          to: 'admin@migranthelp.org',
          subject: 'System Health Alert - High Inactive Users',
          text: `Alert: ${healthReport.metrics.inactiveUsers} users have been inactive for more than 30 days.`,
        }

        await transporter.sendMail(mailOptions)
      }

      console.log('Daily health check completed')
    } catch (error) {
      console.error('Error in daily health check:', error)
    }
  })

// Cloud Function: Backup data to Cloud Storage
exports.backupData = functions.https.onCall(async (data, context) => {
  try {
    // Verify admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can backup data')
    }

    const timestamp = new Date().toISOString()
    const backupData = {
      timestamp: timestamp,
      collections: {},
    }

    // Backup users
    const usersSnapshot = await db.collection('users').get()
    backupData.collections.users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    // Backup resources
    const resourcesSnapshot = await db.collection('resources').get()
    backupData.collections.resources = resourcesSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    // Backup ratings
    const ratingsSnapshot = await db.collection('ratings').get()
    backupData.collections.ratings = ratingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }))

    // Store backup in Firestore
    await db.collection('backups').add(backupData)

    return {
      success: true,
      message: 'Data backup completed successfully',
      timestamp: timestamp,
      recordCount: {
        users: backupData.collections.users.length,
        resources: backupData.collections.resources.length,
        ratings: backupData.collections.ratings.length,
      },
    }
  } catch (error) {
    console.error('Error backing up data:', error)
    throw new functions.https.HttpsError('internal', 'Backup failed')
  }
})

// Cloud Function: Send bulk emails with attachment support
exports.sendBulkEmail = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { recipients, subject, message, fromName, attachment } = data

    if (!recipients || !subject || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields')
    }

    const emailPromises = recipients.map((recipient) => {
      const personalizedMessage = message
        .replace('{{firstName}}', recipient.firstName || '')
        .replace('{{lastName}}', recipient.lastName || '')
        .replace('{{fullName}}', `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim())

      const mailOptions = {
        from: `${fromName || 'Migrant Health Charity'} <noreply@migranthelp.org>`,
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Migrant Health Charity</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              ${personalizedMessage.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0;">
            <p style="color: #6c757d; font-size: 0.9rem;">
              This email was sent by Migrant Health Charity.<br>
              If you no longer wish to receive these emails,
              <a href="#unsubscribe" style="color: #007bff;">click here to unsubscribe</a>.
            </p>
          </div>
        `,
      }

      // Add attachment if provided
      if (attachment && attachment.content && attachment.filename) {
        mailOptions.attachments = [
          {
            filename: attachment.filename,
            content: attachment.content,
            encoding: attachment.encoding || 'base64',
            contentType: attachment.contentType || 'application/octet-stream',
          },
        ]
      }

      return transporter.sendMail(mailOptions)
    })

    const results = await Promise.allSettled(emailPromises)

    const successful = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.filter((result) => result.status === 'rejected').length

    // Log email activity
    await db.collection('emailLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      subject: subject,
      recipientCount: recipients.length,
      successful: successful,
      failed: failed,
      sentBy: context.auth.uid,
      hasAttachment: !!attachment,
    })

    return {
      success: true,
      message: `Bulk email completed. ${successful} sent, ${failed} failed.`,
      successful: successful,
      failed: failed,
    }
  } catch (error) {
    console.error('Error sending bulk email:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send bulk email')
  }
})

// Cloud Function: Send single email with attachment
exports.sendEmailWithAttachment = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { to, subject, message, fromName, attachments } = data

    if (!to || !subject || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields')
    }

    const mailOptions = {
      from: `${fromName || 'Migrant Health Charity'} <noreply@migranthelp.org>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Migrant Health Charity</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #6c757d; font-size: 0.9rem;">
            Best regards,<br>
            Migrant Health Charity Team
          </p>
        </div>
      `,
    }

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: attachment.encoding || 'base64',
        contentType: attachment.contentType || 'application/octet-stream',
      }))
    }

    const result = await transporter.sendMail(mailOptions)

    // Log email activity
    await db.collection('emailLogs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      to: to,
      subject: subject,
      sentBy: context.auth.uid,
      hasAttachment: !!(attachments && attachments.length > 0),
      attachmentCount: attachments ? attachments.length : 0,
      messageId: result.messageId,
    })

    return {
      success: true,
      message: 'Email sent successfully with attachments',
      messageId: result.messageId,
      attachmentCount: attachments ? attachments.length : 0,
    }
  } catch (error) {
    console.error('Error sending email with attachment:', error)
    throw new functions.https.HttpsError('internal', 'Failed to send email with attachment')
  }
})

// Cloud Function: Generate analytics report
exports.generateAnalyticsReport = functions.https.onCall(async (data, context) => {
  try {
    // Verify admin authentication
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can generate reports')
    }

    const { startDate, endDate, reportType } = data
    const start = new Date(startDate)
    const end = new Date(endDate)

    const report = {
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      period: { start: start, end: end },
      type: reportType,
      data: {},
    }

    switch (reportType) {
      case 'user_activity':
        // User registration trends
        const usersSnapshot = await db
          .collection('users')
          .where('registeredAt', '>=', start)
          .where('registeredAt', '<=', end)
          .get()

        report.data.newUsers = usersSnapshot.size
        report.data.usersByDay = {}

        usersSnapshot.forEach((doc) => {
          const date = doc.data().registeredAt.toDate().toDateString()
          report.data.usersByDay[date] = (report.data.usersByDay[date] || 0) + 1
        })
        break

      case 'resource_performance':
        // Resource ratings and views
        const ratingsSnapshot = await db
          .collection('ratings')
          .where('createdAt', '>=', start)
          .where('createdAt', '<=', end)
          .get()

        const resourceRatings = {}
        ratingsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (!resourceRatings[data.resourceId]) {
            resourceRatings[data.resourceId] = {
              ratings: [],
              count: 0,
            }
          }
          resourceRatings[data.resourceId].ratings.push(data.rating)
          resourceRatings[data.resourceId].count++
        })

        report.data.resourcePerformance = Object.keys(resourceRatings).map((resourceId) => ({
          resourceId: resourceId,
          averageRating:
            resourceRatings[resourceId].ratings.reduce((sum, r) => sum + r, 0) /
            resourceRatings[resourceId].count,
          totalRatings: resourceRatings[resourceId].count,
        }))
        break

      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid report type')
    }

    // Save report
    const reportDoc = await db.collection('reports').add(report)

    return {
      success: true,
      reportId: reportDoc.id,
      data: report.data,
    }
  } catch (error) {
    console.error('Error generating analytics report:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate report')
  }
})

/**
 * AI Chat Proxy - Secure proxy for Gemini API calls
 */
exports.aiChatProxy = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to use AI chat.'
      )
    }

    const { message, conversationHistory, userContext } = data

    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required and must be a string.'
      )
    }

    // Rate limiting check
    const userId = context.auth.uid
    const rateLimitRef = admin.firestore().collection('rate_limits').doc(userId)

    const rateLimitDoc = await rateLimitRef.get()
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    if (rateLimitDoc.exists) {
      const data = rateLimitDoc.data()
      if (data.requests >= 50 && now - data.timestamp < oneHour) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Rate limit exceeded. Please try again later.'
        )
      }
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
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

    // Prepare conversation context
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

User Context: ${JSON.stringify(userContext || {})}

Always maintain a professional, caring, and helpful tone.`

    // Build conversation history for context
    const history = [
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
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg) => {
        history.push({
          role: msg.isUser ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })
      })
    }

    // Start chat with history
    const chat = model.startChat({ history })

    // Send message
    const result = await chat.sendMessage(message)
    const response = await result.response
    const responseText = response.text()

    // Update rate limiting
    await rateLimitRef.set(
      {
        requests: rateLimitDoc.exists ? rateLimitDoc.data().requests + 1 : 1,
        timestamp: now,
      },
      { merge: true }
    )

    // Log conversation for monitoring
    await admin
      .firestore()
      .collection('ai_chat_logs')
      .add({
        userId,
        userMessage: message,
        aiResponse: responseText,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userContext: userContext || {},
        usage: response.usageMetadata || null,
      })

    return {
      success: true,
      message: responseText,
      timestamp: now,
      usage: response.usageMetadata || null,
    }
  } catch (error) {
    console.error('AI Chat Proxy Error:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    // Log error for monitoring
    await admin
      .firestore()
      .collection('system_logs')
      .add({
        type: 'ai_chat_error',
        error: error.message,
        userId: context.auth?.uid || 'anonymous',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while processing your request. Please try again.'
    )
  }
})

/**
 * Generate Health Tips using AI
 */
exports.generateHealthTips = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.')
    }

    const { category = 'general', userProfile = {} } = data

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    })

    const prompt = `Generate 5 practical health tips for migrants in the "${category}" category.
    Consider this user profile: ${JSON.stringify(userProfile)}

    Make the tips:
    - Culturally sensitive and inclusive
    - Easy to understand and actionable
    - Relevant to migrant health challenges
    - Evidence-based and safe

    Format as a JSON array with objects containing 'title' and 'description' fields.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse as JSON, fallback to text
    let tips
    try {
      tips = JSON.parse(text)
    } catch {
      tips = [
        {
          title: 'Health Tips',
          description: text,
        },
      ]
    }

    return {
      success: true,
      tips,
      category,
    }
  } catch (error) {
    console.error('Generate Health Tips Error:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate health tips.')
  }
})

/**
 * Analyze Chat Patterns for Insights
 */
exports.analyzeChatPatterns = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const logsSnapshot = await admin
        .firestore()
        .collection('ai_chat_logs')
        .where('timestamp', '>=', yesterday)
        .get()

      const patterns = {
        totalChats: logsSnapshot.size,
        commonTopics: {},
        userEngagement: {},
        avgResponseLength: 0,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }

      let totalResponseLength = 0

      logsSnapshot.forEach((doc) => {
        const data = doc.data()

        // Analyze response length
        totalResponseLength += data.aiResponse?.length || 0

        // Count user engagement
        if (!patterns.userEngagement[data.userId]) {
          patterns.userEngagement[data.userId] = 0
        }
        patterns.userEngagement[data.userId]++

        // Extract topics (simplified keyword analysis)
        const keywords = [
          'health',
          'doctor',
          'appointment',
          'insurance',
          'mental',
          'emergency',
          'medication',
        ]
        keywords.forEach((keyword) => {
          if (data.userMessage?.toLowerCase().includes(keyword)) {
            patterns.commonTopics[keyword] = (patterns.commonTopics[keyword] || 0) + 1
          }
        })
      })

      patterns.avgResponseLength =
        logsSnapshot.size > 0 ? Math.round(totalResponseLength / logsSnapshot.size) : 0

      // Store analytics
      await admin.firestore().collection('ai_analytics').add(patterns)

      console.log('Chat pattern analysis completed:', patterns)
    } catch (error) {
      console.error('Chat pattern analysis error:', error)
    }
  })
