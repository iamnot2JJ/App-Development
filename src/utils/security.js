// 防止XSS攻击的内容清理
export const sanitizeHTML = (str) => {
  return str.replace(/[&<>"'`=\/]/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    }[match]
  })
}

// 客户端输入验证
export const validateInput = (input, type) => {
  const rules = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    text: /^[\w\s.,!?()'-]{1,200}$/,
    rating: /^[1-5]$/,
  }

  if (!rules[type]) return true
  return rules[type].test(input)
}

// 安全内容渲染组件
export const SanitizedContent = {
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  render() {
    return this.$createElement('div', {
      domProps: {
        innerHTML: sanitizeHTML(this.content),
      },
    })
  },
}
