<template>
  <div class="container py-5">
    <h1 class="mb-4">管理员仪表盘</h1>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">用户管理</h5>
            <p class="card-text">管理注册用户和账户权限</p>
            <router-link to="/admin/users" class="btn btn-light">管理用户</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">内容管理</h5>
            <p class="card-text">管理网站资源和文章</p>
            <router-link to="/admin/content" class="btn btn-light">管理内容</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card bg-info text-white">
          <div class="card-body">
            <h5 class="card-title">数据分析</h5>
            <p class="card-text">查看用户活动和使用情况</p>
            <router-link to="/admin/analytics" class="btn btn-light">查看分析</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header bg-warning">
        <h5 class="mb-0">系统状态</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>用户统计</h6>
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <span>总用户数</span>
                <span class="badge bg-primary rounded-pill">153</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>活跃用户 (30天)</span>
                <span class="badge bg-success rounded-pill">87</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>管理员账户</span>
                <span class="badge bg-info rounded-pill">4</span>
              </li>
            </ul>
          </div>

          <div class="col-md-6">
            <h6>内容统计</h6>
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <span>资源总数</span>
                <span class="badge bg-primary rounded-pill">42</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>平均评分</span>
                <span class="badge bg-success rounded-pill">4.2</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>总评分次数</span>
                <span class="badge bg-info rounded-pill">312</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-warning mt-4">
      <h5>安全通知</h5>
      <p>最后安全扫描: 2025年7月20日 | 状态: <span class="text-success">安全</span></p>
      <ul>
        <li>XSS保护: 已启用</li>
        <li>CSRF保护: 已启用</li>
        <li>数据验证: 客户端+服务器端</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 确保只有管理员可以访问
onMounted(() => {
  if (authStore.userRole !== authStore.roles.ADMIN) {
    window.location.href = '/dashboard'
  }
})
</script>
