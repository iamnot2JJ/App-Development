<template>
  <div v-html="sanitizedContent"></div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'SanitizedContent',
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sanitizedContent = computed(() => {
      // Basic XSS prevention - remove script tags and event handlers
      let sanitized = props.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')

      return sanitized
    })

    return {
      sanitizedContent,
    }
  },
}
</script>
