<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="about-hero bg-primary text-white py-5">
      <div class="container py-5">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">About MindCare</h1>
            <p class="lead">
              We're on a mission to make mental health support accessible to everyone.
            </p>
          </div>
          <div class="col-lg-6 text-center">
            <div class="position-relative d-inline-block">
              <div
                class="rounded-circle bg-light opacity-25 position-absolute top-0 start-0"
                style="width: 200px; height: 200px"
              ></div>
              <div
                class="rounded-circle bg-light opacity-25 position-absolute bottom-0 end-0"
                style="width: 150px; height: 150px"
              ></div>
              <img
                src="@/assets/about-hero.png"
                alt="MindCare Team"
                class="img-fluid rounded-3 position-relative"
                style="max-height: 300px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-5">
      <div class="container py-5">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <h2 class="fw-bold mb-4">Our Mission</h2>
            <p class="lead text-muted mb-4">
              MindCare was founded in 2023 with a simple but powerful goal: to provide accessible
              mental health resources to individuals facing challenges, regardless of their
              background or financial situation.
            </p>

            <div class="d-flex mb-4">
              <div class="me-4">
                <div
                  class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style="width: 60px; height: 60px"
                >
                  <i class="bi bi-heart-fill fs-4"></i>
                </div>
                <h5>Compassion</h5>
              </div>
              <div class="me-4">
                <div
                  class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style="width: 60px; height: 60px"
                >
                  <i class="bi bi-people-fill fs-4"></i>
                </div>
                <h5>Community</h5>
              </div>
              <div>
                <div
                  class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style="width: 60px; height: 60px"
                >
                  <i class="bi bi-lightbulb-fill fs-4"></i>
                </div>
                <h5>Innovation</h5>
              </div>
            </div>

            <p>
              We believe that mental health support should be free, accessible, and destigmatized.
              Our platform brings together resources, professionals, and community support in one
              place.
            </p>
          </div>

          <div class="col-lg-6">
            <div class="card border-0 shadow">
              <div class="card-body p-4">
                <h3 class="fw-bold mb-4">Our Impact</h3>
                <div class="row mb-4">
                  <div class="col-6 mb-3">
                    <div class="display-5 fw-bold text-primary">15,000+</div>
                    <div class="text-muted">Users Supported</div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="display-5 fw-bold text-primary">250+</div>
                    <div class="text-muted">Resources Available</div>
                  </div>
                  <div class="col-6">
                    <div class="display-5 fw-bold text-primary">98%</div>
                    <div class="text-muted">User Satisfaction</div>
                  </div>
                  <div class="col-6">
                    <div class="display-5 fw-bold text-primary">45</div>
                    <div class="text-muted">Professional Partners</div>
                  </div>
                </div>
                <div class="progress mb-3" style="height: 10px">
                  <div class="progress-bar bg-success" style="width: 85%"></div>
                </div>
                <p class="text-muted mb-0">
                  85% of users report improved coping skills after using our resources for 3 months
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="bg-light py-5">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Our Leadership Team</h2>
          <p class="lead text-muted">
            Passionate professionals dedicated to mental health advocacy
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <div v-for="member in team" :key="member.id" class="col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <div
                  class="mx-auto mb-3 bg-secondary rounded-circle"
                  style="width: 120px; height: 120px"
                ></div>
                <h5 class="mb-1">{{ member.name }}</h5>
                <p class="text-muted small mb-2">{{ member.position }}</p>
                <p class="small text-muted mb-3">{{ member.bio }}</p>
                <div class="d-flex justify-content-center gap-2">
                  <a :href="member.linkedin" class="text-primary"><i class="bi bi-linkedin"></i></a>
                  <a :href="`mailto:${member.email}`" class="text-primary"
                    ><i class="bi bi-envelope"></i
                  ></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="py-5">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Our Partners</h2>
          <p class="lead text-muted">Collaborating with leading organizations in mental health</p>
        </div>

        <div class="row g-4 align-items-center justify-content-center">
          <div v-for="partner in partners" :key="partner.id" class="col-6 col-md-3 col-lg-2">
            <div
              class="bg-white p-3 rounded shadow-sm d-flex align-items-center justify-content-center"
              style="height: 100px"
            >
              <span class="fw-bold text-primary">{{ partner.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const team = ref([
  {
    id: 1,
    name: 'Dr. Jane Smith',
    position: 'Founder & CEO',
    bio: 'Clinical psychologist with 15+ years experience',
    linkedin: '#',
    email: 'jane@mindcare.org',
  },
  {
    id: 2,
    name: 'Michael Johnson',
    position: 'Technical Director',
    bio: 'Tech entrepreneur focused on health solutions',
    linkedin: '#',
    email: 'michael@mindcare.org',
  },
  {
    id: 3,
    name: 'Sarah Williams',
    position: 'Community Manager',
    bio: 'Mental health advocate and community builder',
    linkedin: '#',
    email: 'sarah@mindcare.org',
  },
  {
    id: 4,
    name: 'David Chen',
    position: 'Partnership Director',
    bio: 'Former NGO leader with extensive network',
    linkedin: '#',
    email: 'david@mindcare.org',
  },
])

const partners = ref([
  { id: 1, name: 'MindHealth' },
  { id: 2, name: 'WellBeing AU' },
  { id: 3, name: 'Headspace' },
  { id: 4, name: 'Beyond Blue' },
  { id: 5, name: 'Lifeline' },
  { id: 6, name: 'Black Dog' },
])
</script>

<style scoped>
.about-hero {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
}

.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
