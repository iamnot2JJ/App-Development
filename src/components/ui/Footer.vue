<template>
  <footer class="bg-dark text-light py-4 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>MigrantCare</h5>
          <p>Supporting migrant communities with essential health and wellness resources.</p>
        </div>
        <div class="col-md-4">
          <h5>Quick Links</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-light">Home</router-link></li>
            <li><router-link to="/resources" class="text-light">Resources</router-link></li>
            <li><router-link to="/about" class="text-light">About</router-link></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>Contact</h5>
          <p>
            Email: info@migrantcare.org<br />
            Phone: 1800 MIGRANT<br />
            Available 24/7
          </p>
        </div>
      </div>
      <hr />
      <div class="text-center">
        <p>&copy; 2025 MigrantCare. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent', // 改成 FooterComponent 避免与 HTML 元素冲突
}
</script>

<style scoped>
footer a {
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
