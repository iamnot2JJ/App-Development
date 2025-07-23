<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
    <!-- 使用新的组件名 -->
  </div>
</template>

<script>
import NavBar from './components/ui/NavBar.vue'
import AppFooter from './components/ui/Footer.vue' // 导入时重命名

export default {
  name: 'App',
  components: {
    NavBar,
    AppFooter, // 注册新名称
  },
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.btn-primary {
  background-color: #2c5aa0;
  border-color: #2c5aa0;
}

.btn-primary:hover {
  background-color: #1e3f73;
  border-color: #1e3f73;
}
</style>
