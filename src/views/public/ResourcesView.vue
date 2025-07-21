<template>
  <div class="container py-5">
    <div class="row">
      <div class="col-md-8">
        <h1 class="mb-4">心理健康资源</h1>

        <div class="card mb-4" v-for="resource in resources" :key="resource.id">
          <div class="card-body">
            <h3 class="card-title">{{ resource.title }}</h3>
            <SanitizedContent :content="resource.content" class="card-text mb-3" />

            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">发布于: {{ formatDate(resource.date) }}</small>
              <span class="badge bg-info">{{ resource.category }}</span>
            </div>
          </div>

          <div class="card-footer">
            <RatingWidget :resource-id="resource.id" />
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="sticky-top" style="top: 20px">
          <div class="card mb-4">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">热门资源</h5>
            </div>
            <div class="list-group list-group-flush">
              <a
                v-for="top in topResources"
                :key="top.id"
                href="#"
                class="list-group-item list-group-item-action"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">{{ top.title }}</h6>
                  <span class="badge bg-primary rounded-pill">{{ top.rating.toFixed(1) }}</span>
                </div>
              </a>
            </div>
          </div>

          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">资源分类</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="category in categories"
                  :key="category"
                  class="badge bg-secondary rounded-pill px-3 py-2"
                >
                  {{ category }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RatingWidget from '@/components/ratings/RatingWidget.vue'
import SanitizedContent from '@/components/security/SanitizedContent.vue'
import { getFromStorage } from '@/utils/storage'

// 模拟资源数据
const resources = ref([
  {
    id: 'res-001',
    title: '应对焦虑的5个实用技巧',
    content: '焦虑是常见的心理健康问题，以下是帮助您管理焦虑的有效方法...',
    date: new Date(2025, 5, 15),
    category: '焦虑管理',
  },
  {
    id: 'res-002',
    title: '抑郁症自我评估指南',
    content: '了解抑郁症的症状和表现，通过自我评估了解自己的状态...',
    date: new Date(2025, 4, 22),
    category: '抑郁症',
  },
  {
    id: 'res-003',
    title: '正念冥想入门',
    content: '学习正念冥想的基本技巧，帮助您减轻压力，提高专注力...',
    date: new Date(2025, 6, 1),
    category: '冥想练习',
  },
])

// 从localStorage获取评分数据
const getRatings = () => {
  return getFromStorage('ratings') || {}
}

// 计算热门资源
const topResources = computed(() => {
  const ratings = getRatings()
  return resources.value
    .map((resource) => {
      const ratingData = ratings[resource.id] || { total: 0, count: 0 }
      const rating = ratingData.count > 0 ? ratingData.total / ratingData.count : 0
      return { ...resource, rating }
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
})

// 获取所有分类
const categories = computed(() => {
  return [...new Set(resources.value.map((r) => r.category))]
})

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
