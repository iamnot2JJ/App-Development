<template>
  <div id="app">
    <!-- Navigation -->
    <NavBar />

    <!-- Main Content -->
    <main id="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import NavBar from './components/ui/NavBar.vue'
import Footer from './components/ui/Footer.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    Footer,
  },
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}
</style>
