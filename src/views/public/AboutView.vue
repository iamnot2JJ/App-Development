<template>
  <div class="about-view">
    <!-- Hero Section -->
    <section class="hero-section bg-white py-5 border-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-4 fw-bold text-primary mb-4">About MigrantCare</h1>
            <p class="lead text-secondary mb-4">
              Empowering migrant communities through accessible health resources, support services,
              and community connections across Australia.
            </p>
          </div>
          <div class="col-md-6">
            <div class="stats-card bg-white p-4 rounded shadow">
              <h3 class="text-primary mb-3">Our Impact</h3>
              <div class="row text-center">
                <div class="col-6 mb-3">
                  <h2 class="text-primary mb-0">{{ stats.yearsActive }}</h2>
                  <small class="text-secondary">Years Active</small>
                </div>
                <div class="col-6 mb-3">
                  <h2 class="text-primary mb-0">{{ stats.communitiesServed }}</h2>
                  <small class="text-secondary">Communities Served</small>
                </div>
                <div class="col-6">
                  <h2 class="text-primary mb-0">{{ stats.volunteersActive }}</h2>
                  <small class="text-secondary">Active Volunteers</small>
                </div>
                <div class="col-6">
                  <h2 class="text-primary mb-0">{{ stats.resourcesProvided }}</h2>
                  <small class="text-secondary">Resources Available</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="display-6 fw-bold mb-4">Our Mission</h2>
            <p class="lead mb-4">
              MigrantCare is dedicated to breaking down barriers and creating pathways to essential
              health and wellness services for migrant communities across Australia.
            </p>
            <p class="text-secondary">
              We believe that everyone deserves access to quality healthcare, mental health support,
              and legal assistance, regardless of their background or immigration status. Through
              technology, community partnerships, and culturally sensitive approaches, we're
              building bridges to better health outcomes for all.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-6 fw-bold">Our Values</h2>
          <p class="lead text-secondary">The principles that guide our work</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-for="value in values" :key="value.id">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="value-icon mb-3">
                  <i :class="value.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ value.title }}</h5>
                <p class="card-text text-secondary">{{ value.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-6 fw-bold">Meet Our Team</h2>
          <p class="lead text-secondary">Dedicated professionals working for community wellness</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-for="member in teamMembers" :key="member.id">
            <div class="card border-0 shadow-sm team-card">
              <div class="card-body text-center p-4">
                <div class="team-avatar mb-3">
                  <div class="avatar-circle">
                    {{ member.initials }}
                  </div>
                </div>
                <h5 class="card-title">{{ member.name }}</h5>
                <p class="text-primary mb-2">{{ member.role }}</p>
                <p class="card-text text-secondary small">{{ member.bio }}</p>
                <div class="social-links">
                  <a href="#" class="text-secondary me-2"><i class="fab fa-linkedin"></i></a>
                  <a href="#" class="text-secondary me-2"><i class="fab fa-twitter"></i></a>
                  <a href="#" class="text-secondary"><i class="fas fa-envelope"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-5 bg-white border-top">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-6 fw-bold">What We Offer</h2>
          <p class="lead text-secondary">Comprehensive support services for migrant communities</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-3" v-for="service in services" :key="service.id">
            <div class="service-item text-center p-4">
              <div class="service-icon mb-3">
                <i :class="service.icon" class="display-5 text-primary"></i>
              </div>
              <h5>{{ service.title }}</h5>
              <p class="text-secondary small">{{ service.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-5 bg-white border-top">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="display-6 fw-bold mb-4 text-primary">Get In Touch</h2>
            <p class="lead mb-4 text-secondary">
              Ready to access our services or have questions? We're here to help.
            </p>

            <div class="row g-4 mb-4">
              <div class="col-md-4">
                <div class="contact-item">
                  <i class="fas fa-phone display-6 mb-3"></i>
                  <h5>Call Us</h5>
                  <p>1800 MIGRANT<br />(24/7 Support)</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="contact-item">
                  <i class="fas fa-envelope display-6 mb-3"></i>
                  <h5>Email Us</h5>
                  <p>info@migrantcare.org<br />support@migrantcare.org</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="contact-item">
                  <i class="fas fa-map-marker-alt display-6 mb-3"></i>
                  <h5>Visit Us</h5>
                  <p>Multiple locations<br />across Australia</p>
                </div>
              </div>
            </div>

            <router-link to="/resources" class="btn btn-light btn-lg me-3">
              Explore Resources
            </router-link>
            <router-link
              to="/auth"
              class="btn btn-outline-light btn-lg"
              v-if="!authStore.isAuthenticated"
            >
              Join Community
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useResourcesStore } from '../../stores/resources.js'

export default {
  name: 'AboutView',
  setup() {
    const authStore = useAuthStore()
    const resourcesStore = useResourcesStore()

    const stats = computed(() => ({
      yearsActive: 8,
      communitiesServed: 150,
      volunteersActive: 45,
      resourcesProvided: resourcesStore.resources.length,
    }))

    const values = [
      {
        id: 1,
        title: 'Accessibility',
        description:
          'Making health services accessible to all, breaking down language and cultural barriers.',
        icon: 'fas fa-universal-access',
      },
      {
        id: 2,
        title: 'Cultural Sensitivity',
        description:
          'Respecting diverse backgrounds and providing culturally appropriate care and support.',
        icon: 'fas fa-hands-helping',
      },
      {
        id: 3,
        title: 'Community Focus',
        description:
          'Building strong communities through collaboration, support, and shared resources.',
        icon: 'fas fa-users',
      },
      {
        id: 4,
        title: 'Quality Care',
        description:
          'Ensuring high-quality services that meet the unique needs of migrant families.',
        icon: 'fas fa-star',
      },
      {
        id: 5,
        title: 'Innovation',
        description: 'Leveraging technology and innovative approaches to improve service delivery.',
        icon: 'fas fa-lightbulb',
      },
      {
        id: 6,
        title: 'Empowerment',
        description:
          'Empowering individuals and communities to take control of their health and wellbeing.',
        icon: 'fas fa-fist-raised',
      },
    ]

    const teamMembers = [
      {
        id: 1,
        name: 'Dr. Sarah Chen',
        role: 'Executive Director',
        bio: 'Leading community health initiatives for over 15 years, specializing in migrant health services.',
        initials: 'SC',
      },
      {
        id: 2,
        name: 'Ahmed Hassan',
        role: 'Community Outreach Manager',
        bio: 'Passionate about building bridges between healthcare providers and migrant communities.',
        initials: 'AH',
      },
      {
        id: 3,
        name: 'Maria Rodriguez',
        role: 'Mental Health Coordinator',
        bio: 'Licensed counselor with expertise in culturally sensitive mental health support.',
        initials: 'MR',
      },
    ]

    const services = [
      {
        id: 1,
        title: 'Healthcare Navigation',
        description: 'Guidance through the Australian healthcare system',
        icon: 'fas fa-compass',
      },
      {
        id: 2,
        title: 'Mental Health Support',
        description: 'Culturally appropriate counseling and therapy',
        icon: 'fas fa-brain',
      },
      {
        id: 3,
        title: 'Legal Assistance',
        description: 'Rights awareness and legal aid connections',
        icon: 'fas fa-balance-scale',
      },
      {
        id: 4,
        title: 'Language Services',
        description: 'Translation and interpretation support',
        icon: 'fas fa-language',
      },
      {
        id: 5,
        title: 'Community Programs',
        description: 'Health education and wellness workshops',
        icon: 'fas fa-chalkboard-teacher',
      },
      {
        id: 6,
        title: 'Emergency Support',
        description: '24/7 crisis intervention and assistance',
        icon: 'fas fa-ambulance',
      },
      {
        id: 7,
        title: 'Youth Services',
        description: 'Programs designed for migrant youth and families',
        icon: 'fas fa-child',
      },
      {
        id: 8,
        title: 'Employment Support',
        description: 'Job search assistance and workplace rights',
        icon: 'fas fa-briefcase',
      },
    ]

    onMounted(() => {
      authStore.initializeStore()
      resourcesStore.initializeStore()
    })

    return {
      authStore,
      stats,
      values,
      teamMembers,
      services,
    }
  },
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3f73 100%);
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.stats-card {
  backdrop-filter: blur(10px);
}

.team-card {
  transition: transform 0.2s;
}

.team-card:hover {
  transform: translateY(-5px);
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2c5aa0, #1e3f73);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto;
}

.value-icon,
.service-icon {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-item {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.service-item:hover {
  transform: translateY(-3px);
}

.contact-item i {
  opacity: 0.8;
}

.social-links a {
  text-decoration: none;
  transition: color 0.2s;
}

.social-links a:hover {
  color: #2c5aa0 !important;
}

/* Enhanced text readability */
.card-title {
  color: #2c3e50 !important;
  font-weight: 600;
}

.card-text {
  color: #495057 !important;
  line-height: 1.6;
}

.display-6 {
  color: #2c3e50 !important;
}

.lead {
  color: #6c757d !important;
  font-weight: 500;
}

.text-secondary {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .hero-section {
    text-align: center;
    min-height: 50vh;
  }

  .stats-card {
    margin-top: 2rem;
  }

  .display-4 {
    font-size: 2.5rem;
  }
}
</style>
