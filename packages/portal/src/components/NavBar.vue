<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 20
}

function scrollTo(id: string) {
  mobileMenuOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const navLinks = [
  { label: '功能特性', id: 'features' },
  { label: '使用流程', id: 'workflow' },
  { label: '适用场景', id: 'scenarios' },
]
</script>

<template>
  <header class="navbar" :class="{ scrolled, 'menu-open': mobileMenuOpen }">
    <div class="navbar-inner">
      <a class="logo" href="#" @click.prevent="scrollTo('hero')">
        <svg class="logo-icon" viewBox="0 0 40 40" width="40" height="40">
          <defs>
            <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#4ADE80"/>
              <stop offset="100%" stop-color="#166534"/>
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#nav-logo-grad)"/>
          <g stroke="#fff" stroke-width="2.8" stroke-linecap="round" fill="none">
            <line x1="10" y1="15" x2="30" y2="15"/>
            <line x1="20" y1="15" x2="20" y2="30"/>
            <line x1="10" y1="30" x2="30" y2="30"/>
          </g>
          <circle cx="16" cy="9" r="1.5" fill="#fff"/>
          <circle cx="20" cy="7.8" r="1.6" fill="#fff"/>
          <circle cx="24" cy="9" r="1.5" fill="#fff"/>
        </svg>
        <span class="logo-text">计工宝</span>
      </a>

      <nav class="nav-links" :class="{ open: mobileMenuOpen }">
        <a
          v-for="link in navLinks"
          :key="link.id"
          class="nav-link"
          :href="`#${link.id}`"
          @click.prevent="scrollTo(link.id)"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="nav-actions">
        <a
          class="nav-cta"
          href="#hero"
          @click.prevent="scrollTo('hero')"
        >
          立即体验
        </a>
      </div>

      <button
        class="mobile-toggle"
        :class="{ active: mobileMenuOpen }"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="菜单"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 16px 0;
}

.navbar.scrolled {
  padding: 8px 0;
  background: rgba(250, 248, 244, 0.82);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-bottom: 1px solid rgba(30, 30, 42, 0.06);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(30, 30, 42, 0.04);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-cta {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--green-600), var(--green-800));
  padding: 10px 24px;
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(22, 101, 52, 0.3);
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.mobile-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translateY(5px);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translateY(-5px);
}

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 20px;
  }

  .nav-links {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(250, 248, 244, 0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: -1;
  }

  .nav-links.open {
    opacity: 1;
    visibility: visible;
  }

  .nav-links .nav-link {
    font-size: 20px;
    font-weight: 600;
    padding: 14px 24px;
  }

  .nav-actions {
    display: none;
  }

  .mobile-toggle {
    display: flex;
    z-index: 10;
  }
}
</style>
