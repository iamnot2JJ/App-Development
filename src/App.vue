<template>
  <div id="app">
    <!-- Accessibility Toolbar -->
    <AccessibilityToolbar />

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
import AccessibilityToolbar from './components/accessibility/AccessibilityToolbar.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    Footer,
    AccessibilityToolbar,
  },
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
