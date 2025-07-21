<template>
  <div class="rating-widget">
    <h4 class="mb-3">用户评分</h4>

    <div v-if="userRating" class="alert alert-info">
      您已评分: <strong>{{ userRating }}/5</strong>
    </div>

    <div class="d-flex align-items-center mb-3">
      <div class="stars me-3">
        <span
          v-for="star in 5"
          :key="star"
          class="star"
          :class="{ active: star <= currentHover || star <= (userRating || averageRating) }"
          @mouseover="currentHover = star"
          @mouseleave="currentHover = 0"
          @click="rate(star)"
        >
          ★
        </span>
      </div>

      <div>
        <span class="badge bg-primary rounded-pill">
          {{ averageRating.toFixed(1) }} ({{ totalRatings }} 次评分)
        </span>
      </div>
    </div>

    <div class="distribution mt-4">
      <div v-for="(count, index) in ratingDistribution" :key="index" class="dist-item mb-2">
        <div class="d-flex align-items-center">
          <span class="me-2">{{ 5 - index }}星:</span>
          <div class="progress flex-grow-1">
            <div
              class="progress-bar"
              :class="`bg-${getProgressColor(count)}`"
              :style="{ width: `${(count / totalRatings) * 100 || 0}%` }"
            ></div>
          </div>
          <span class="ms-2 small">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { saveToStorage, getFromStorage } from '@/utils/storage'

const props = defineProps({
  resourceId: {
    type: String,
    required: true,
  },
})

const authStore = useAuthStore()
const currentHover = ref(0)
const ratingsData = ref({})

// 初始化评分数据
const initRatings = () => {
  const allRatings = getFromStorage('ratings') || {}

  if (!allRatings[props.resourceId]) {
    allRatings[props.resourceId] = {
      total: 0,
      count: 0,
      distribution: [0, 0, 0, 0, 0],
      userRatings: {},
    }
  }

  ratingsData.value = allRatings[props.resourceId]
}

// 计算属性
const averageRating = computed(() => {
  return ratingsData.value.count > 0 ? ratingsData.value.total / ratingsData.value.count : 0
})

const totalRatings = computed(() => ratingsData.value.count || 0)
const ratingDistribution = computed(() => [...(ratingsData.value.distribution || [])].reverse())
const userRating = computed(() => {
  if (!authStore.isAuthenticated) return null
  return ratingsData.value.userRatings?.[authStore.user.email] || null
})

// 方法
const getProgressColor = (count) => {
  const percentage = (count / totalRatings.value) * 100 || 0
  if (percentage > 70) return 'success'
  if (percentage > 40) return 'warning'
  return 'danger'
}

const rate = (rating) => {
  if (!authStore.isAuthenticated) {
    alert('请先登录再进行评分')
    return
  }

  const userId = authStore.user.email

  // 如果用户已评分，先移除旧评分
  if (userRating.value) {
    ratingsData.value.total -= userRating.value
    ratingsData.value.distribution[5 - userRating.value] -= 1
  } else {
    ratingsData.value.count += 1
  }

  // 添加新评分
  ratingsData.value.total += rating
  ratingsData.value.distribution[5 - rating] += 1
  ratingsData.value.userRatings[userId] = rating

  // 保存到localStorage
  const allRatings = getFromStorage('ratings') || {}
  allRatings[props.resourceId] = ratingsData.value
  saveToStorage('ratings', allRatings)
}

// 初始化
onMounted(initRatings)
</script>

<style scoped>
.star {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: gold;
}

.star:hover {
  color: #ffd700;
}
</style>
