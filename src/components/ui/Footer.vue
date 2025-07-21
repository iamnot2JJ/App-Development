<template>
  <footer class="bg-dark text-white pt-5 pb-4">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-4">
          <h5 class="mb-3">MindCare Support</h5>
          <p class="text-muted">
            Providing mental health resources and support for those in need since 2023.
          </p>
          <div class="social-icons mt-3">
            <a href="#" class="text-white me-3"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-white me-3"><i class="bi bi-twitter"></i></a>
            <a href="#" class="text-white me-3"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-white"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>

        <div class="col-md-2 mb-4">
          <h5 class="mb-3">Quick Links</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="text-decoration-none text-muted">Home</router-link>
            </li>
            <li class="mb-2">
              <router-link to="/resources" class="text-decoration-none text-muted"
                >Resources</router-link
              >
            </li>
            <li class="mb-2">
              <router-link to="/about" class="text-decoration-none text-muted"
                >About Us</router-link
              >
            </li>
            <li class="mb-2">
              <router-link to="/contact" class="text-decoration-none text-muted"
                >Contact</router-link
              >
            </li>
          </ul>
        </div>

        <div class="col-md-3 mb-4">
          <h5 class="mb-3">Resources</h5>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="#" class="text-decoration-none text-muted">Blog</a></li>
            <li class="mb-2">
              <a href="#" class="text-decoration-none text-muted">Help Center</a>
            </li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-muted">Community</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-muted">Events</a></li>
          </ul>
        </div>

        <div class="col-md-3 mb-4">
          <h5 class="mb-3">Contact Us</h5>
          <ul class="list-unstyled text-muted">
            <li class="mb-2"><i class="bi bi-geo-alt me-2"></i> 123 Health St, Sydney</li>
            <li class="mb-2"><i class="bi bi-telephone me-2"></i> (02) 1234 5678</li>
            <li class="mb-2"><i class="bi bi-envelope me-2"></i> support@mindcare.org</li>
            <li class="mb-2"><i class="bi bi-clock me-2"></i> Mon-Fri: 9AM - 5PM</li>
          </ul>
        </div>
      </div>

      <hr class="bg-secondary" />

      <div class="row mt-3">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0 text-muted">&copy; 2025 MindCare. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <ul class="list-inline mb-0">
            <li class="list-inline-item">
              <a href="#" class="text-decoration-none text-muted">Privacy Policy</a>
            </li>
            <li class="list-inline-item">
              <a href="#" class="text-decoration-none text-muted">Terms of Use</a>
            </li>
            <li class="list-inline-item">
              <a href="#" class="text-decoration-none text-muted">Sitemap</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer a {
  transition: color 0.3s;
}

footer a:hover {
  color: #fff !important;
}

.social-icons i {
  font-size: 1.5rem;
  transition: opacity 0.3s;
}

.social-icons a:hover i {
  opacity: 0.8;
}
</style>
