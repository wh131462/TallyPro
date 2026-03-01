<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import WorkflowSection from './components/WorkflowSection.vue'
import ScenariosSection from './components/ScenariosSection.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <main>
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <ScenariosSection />
    </main>
    <FooterSection />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

/* ===== CSS Reset & Variables ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #FAF8F4;
  --bg-warm: #F5F0E8;
  --bg-deep: #EDE6DA;
  --bg-surface: #FFFFFF;
  --text-primary: #1E1E2A;
  --text-secondary: #3A3A4A;
  --text-muted: #6E6E80;
  --text-faint: #A0A0B0;
  --green-50: #ECFDF5;
  --green-100: #D1FAE5;
  --green-200: #BBF7D0;
  --green-400: #4ADE80;
  --green-500: #22C55E;
  --green-600: #16A34A;
  --green-700: #15803D;
  --green-800: #166534;
  --amber: #C8956C;
  --amber-light: #D4A574;
  --amber-deep: #B07D56;
  --amber-glow: rgba(200, 149, 108, 0.12);
  --sage: #6B9B7B;
  --sage-light: #E8F2EC;
  --coral: #D4845A;
  --sky: #5B8DB8;
  --font-display: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", system-ui, -apple-system, sans-serif;
  --font-body: "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --shadow-sm: 0 1px 3px rgba(30, 30, 42, 0.04), 0 1px 2px rgba(30, 30, 42, 0.02);
  --shadow-md: 0 4px 16px rgba(30, 30, 42, 0.06), 0 1px 3px rgba(30, 30, 42, 0.04);
  --shadow-lg: 0 12px 40px rgba(30, 30, 42, 0.08), 0 2px 8px rgba(30, 30, 42, 0.04);
  --shadow-xl: 0 24px 64px rgba(30, 30, 42, 0.1), 0 4px 16px rgba(30, 30, 42, 0.06);
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

/* ===== Scroll Reveal System ===== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Noise Texture Overlay */
.app::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ===== Section Layout ===== */
.section {
  padding: 100px 0;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-label {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green-600);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label::before {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  background: var(--green-500);
  border-radius: 1px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 17px;
  color: var(--text-muted);
  max-width: 560px;
  line-height: 1.7;
}

/* ===== Selection Style ===== */
::selection {
  background: var(--green-200);
  color: var(--green-800);
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-deep);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-faint);
}

@media (max-width: 768px) {
  .section {
    padding: 64px 0;
  }

  .container {
    padding: 0 20px;
  }
}
</style>
