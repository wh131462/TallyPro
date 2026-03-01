<script setup lang="ts">
const techStack = [
  { name: 'Vue 3', color: '#42b883' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'uni-app', color: '#2b9939' },
  { name: 'Express', color: '#333' },
  { name: 'MySQL', color: '#4479a1' },
  { name: 'Docker', color: '#2496ed' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <!-- Tech stack -->
      <div class="footer-tech" v-reveal>
        <span class="footer-tech-label">技术栈</span>
        <div class="tech-badges">
          <span
            v-for="t in techStack"
            :key="t.name"
            class="tech-badge"
          >
            <span class="tech-dot" :style="{ background: t.color }"></span>
            {{ t.name }}
          </span>
        </div>
      </div>

      <div class="footer-divider"></div>

      <!-- Bottom -->
      <div class="footer-bottom" v-reveal="0.1">
        <div class="footer-brand">
          <svg class="footer-logo" viewBox="0 0 32 32" width="28" height="28">
            <defs>
              <linearGradient id="footer-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#4ADE80"/>
                <stop offset="100%" stop-color="#166534"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="url(#footer-grad)"/>
            <g stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none">
              <line x1="8" y1="12" x2="24" y2="12"/>
              <line x1="16" y1="12" x2="16" y2="24"/>
              <line x1="8" y1="24" x2="24" y2="24"/>
            </g>
          </svg>
          <div>
            <div class="footer-brand-name">计工宝 TallyPro</div>
            <div class="footer-brand-desc">让计件工资管理更简单</div>
          </div>
        </div>

        <div class="footer-links">
          <a href="https://github.com/wh131462/TallyPro" target="_blank" rel="noopener noreferrer" class="footer-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        <div class="footer-copyright">
          &copy; {{ year }} TallyPro. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--bg-primary);
  border-top: 1px solid rgba(30, 30, 42, 0.06);
  padding: 48px 0 32px;
}

.footer-tech {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-tech-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-faint);
  flex-shrink: 0;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-surface);
  border: 1px solid rgba(30, 30, 42, 0.06);
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.25s ease;
}

.tech-badge:hover {
  border-color: rgba(30, 30, 42, 0.12);
  box-shadow: var(--shadow-sm);
}

.tech-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.footer-divider {
  height: 1px;
  background: rgba(30, 30, 42, 0.06);
  margin: 32px 0;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-brand-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.footer-brand-desc {
  font-size: 12px;
  color: var(--text-faint);
  margin-top: 1px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.footer-link:hover {
  color: var(--text-primary);
  background: rgba(30, 30, 42, 0.04);
}

.footer-copyright {
  font-size: 12px;
  color: var(--text-faint);
}

@media (max-width: 580px) {
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer-tech {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
