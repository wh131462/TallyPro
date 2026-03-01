<script setup lang="ts">
const scenarios = [
  {
    title: '制造工厂',
    desc: '多工序流水线生产，按件计费，自动统计各环节产量与工资。',
    icon: 'factory',
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
  },
  {
    title: '服装加工',
    desc: '裁剪、缝纫、熨烫等多道工序灵活配置，单价管理清晰明了。',
    icon: 'garment',
    gradient: 'linear-gradient(135deg, #FDF6F0, #FDECD4)',
  },
  {
    title: '电子组装',
    desc: '精密工序计件管理，支持不同产品线独立核算，数据精确可靠。',
    icon: 'electronics',
    gradient: 'linear-gradient(135deg, #EBF2F8, #DBEAFE)',
  },
  {
    title: '物流配送',
    desc: '按单计费、按件分拣，配送员自主填报，管理者实时掌控进度。',
    icon: 'logistics',
    gradient: 'linear-gradient(135deg, #F4EEF6, #EDE5F0)',
  },
]
</script>

<template>
  <section id="scenarios" class="section scenarios-section">
    <div class="container">
      <div class="scenarios-header" v-reveal>
        <div class="section-label">Use Cases</div>
        <h2 class="section-title">适用于多种计件场景</h2>
        <p class="section-desc">
          无论您的企业属于哪个行业，只要涉及计件计量，计工宝都能让管理更轻松。
        </p>
      </div>

      <div class="scenarios-grid">
        <div
          v-for="(s, i) in scenarios"
          :key="s.title"
          v-reveal="0.1 * (i + 1)"
          class="scenario-card"
        >
          <div class="scenario-visual" :style="{ background: s.gradient }">
            <!-- Factory -->
            <svg v-if="s.icon === 'factory'" class="scenario-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="38" width="24" height="30" rx="2" fill="#15803D" opacity="0.15"/>
              <rect x="10" y="38" width="24" height="30" rx="2" stroke="#15803D" stroke-width="1.8"/>
              <rect x="38" y="28" width="32" height="40" rx="2" fill="#16A34A" opacity="0.1"/>
              <rect x="38" y="28" width="32" height="40" rx="2" stroke="#15803D" stroke-width="1.8"/>
              <path d="M34 68V44l-10-6v30" stroke="#15803D" stroke-width="1.8" stroke-linejoin="round"/>
              <rect x="16" y="46" width="6" height="6" rx="1" fill="#22C55E" opacity="0.35"/>
              <rect x="16" y="56" width="6" height="6" rx="1" fill="#22C55E" opacity="0.35"/>
              <rect x="26" y="56" width="6" height="12" rx="1" fill="#22C55E" opacity="0.25" stroke="#15803D" stroke-width="1.2"/>
              <rect x="44" y="36" width="7" height="7" rx="1.5" fill="#22C55E" opacity="0.35"/>
              <rect x="56" y="36" width="7" height="7" rx="1.5" fill="#22C55E" opacity="0.35"/>
              <rect x="44" y="48" width="7" height="7" rx="1.5" fill="#22C55E" opacity="0.35"/>
              <rect x="56" y="48" width="7" height="7" rx="1.5" fill="#22C55E" opacity="0.35"/>
              <rect x="49" y="58" width="10" height="10" rx="1.5" fill="#22C55E" opacity="0.2" stroke="#15803D" stroke-width="1.2"/>
              <rect x="17" y="12" width="8" height="26" rx="1.5" fill="#15803D" opacity="0.12" stroke="#15803D" stroke-width="1.5"/>
              <path d="M21 12c0-2 0-4 0-4" stroke="#15803D" stroke-width="1.8" stroke-linecap="round"/>
              <ellipse cx="21" cy="7" rx="4" ry="2.5" fill="#15803D" opacity="0.1" stroke="#15803D" stroke-width="1.2"/>
              <circle cx="62" cy="18" r="8" fill="#22C55E" opacity="0.1" stroke="#15803D" stroke-width="1.5"/>
              <circle cx="62" cy="18" r="3" fill="#22C55E" opacity="0.3"/>
              <path d="M62 12v-2M68 18h2M62 24v2M56 18h-2" stroke="#15803D" stroke-width="1.2" stroke-linecap="round"/>
            </svg>

            <!-- Garment -->
            <svg v-else-if="s.icon === 'garment'" class="scenario-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M28 16L40 12l12 4 8 10-6 4-6-4v38H32V26l-6 4-6-4 8-10z" fill="#C8956C" opacity="0.1" stroke="#B07D56" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M36 12c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="#B07D56" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="40" y1="20" x2="40" y2="36" stroke="#C8956C" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="0 4"/>
              <circle cx="40" cy="40" r="1.5" fill="#C8956C"/>
              <circle cx="40" cy="48" r="1.5" fill="#C8956C"/>
              <circle cx="40" cy="56" r="1.5" fill="#C8956C"/>
              <path d="M12 48c4-2 6-1 8 2s4 6 8 6" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
              <path d="M56 40l6 3-3 6-6-3z" fill="#C8956C" opacity="0.15" stroke="#B07D56" stroke-width="1.3"/>
              <circle cx="63" cy="44" r="6" fill="none" stroke="#D4A574" stroke-width="1.3" stroke-dasharray="2 2.5" opacity="0.4"/>
              <path d="M66 52l-2-1.5" stroke="#B07D56" stroke-width="2" stroke-linecap="round"/>
              <path d="M67 53l4 8" stroke="#B07D56" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M65 54l4 8" stroke="#B07D56" stroke-width="1.5" stroke-linecap="round"/>
            </svg>

            <!-- Electronics -->
            <svg v-else-if="s.icon === 'electronics'" class="scenario-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="18" width="44" height="44" rx="4" fill="#5B8DB8" opacity="0.08" stroke="#5B8DB8" stroke-width="1.8"/>
              <rect x="28" y="28" width="24" height="24" rx="3" fill="#5B8DB8" opacity="0.12" stroke="#5B8DB8" stroke-width="1.8"/>
              <rect x="34" y="34" width="12" height="12" rx="2" fill="#5B8DB8" opacity="0.2" stroke="#5B8DB8" stroke-width="1.5"/>
              <circle cx="40" cy="40" r="3" fill="#5B8DB8" opacity="0.35"/>
              <line x1="18" y1="30" x2="10" y2="30" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="38" x2="10" y2="38" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="46" x2="10" y2="46" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="54" x2="12" y2="54" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="62" y1="30" x2="70" y2="30" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="62" y1="38" x2="70" y2="38" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="62" y1="46" x2="70" y2="46" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="62" y1="54" x2="68" y2="54" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="30" y1="18" x2="30" y2="10" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="38" y1="18" x2="38" y2="10" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="46" y1="18" x2="46" y2="10" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="54" y1="18" x2="54" y2="12" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="30" y1="62" x2="30" y2="70" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="38" y1="62" x2="38" y2="70" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="46" y1="62" x2="46" y2="70" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="54" y1="62" x2="54" y2="68" stroke="#5B8DB8" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M28 36h-4v8h4" stroke="#5B8DB8" stroke-width="1.2" stroke-linejoin="round" opacity="0.5"/>
              <path d="M52 36h4v8h-4" stroke="#5B8DB8" stroke-width="1.2" stroke-linejoin="round" opacity="0.5"/>
              <circle cx="10" cy="30" r="1.5" fill="#5B8DB8" opacity="0.4"/>
              <circle cx="70" cy="38" r="1.5" fill="#5B8DB8" opacity="0.4"/>
              <circle cx="38" cy="10" r="1.5" fill="#5B8DB8" opacity="0.4"/>
              <circle cx="46" cy="70" r="1.5" fill="#5B8DB8" opacity="0.4"/>
            </svg>

            <!-- Logistics -->
            <svg v-else-if="s.icon === 'logistics'" class="scenario-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="28" width="40" height="28" rx="3" fill="#8B6B96" opacity="0.1" stroke="#8B6B96" stroke-width="1.8"/>
              <path d="M46 36h14l10 12v8a3 3 0 01-3 3H46V36z" fill="#8B6B96" opacity="0.08" stroke="#8B6B96" stroke-width="1.8" stroke-linejoin="round"/>
              <line x1="46" y1="36" x2="46" y2="59" stroke="#8B6B96" stroke-width="1.5"/>
              <rect x="50" y="40" width="10" height="8" rx="1.5" fill="#8B6B96" opacity="0.15" stroke="#8B6B96" stroke-width="1.3"/>
              <circle cx="22" cy="59" r="7" fill="#F4EEF6" stroke="#8B6B96" stroke-width="1.8"/>
              <circle cx="22" cy="59" r="3" fill="#8B6B96" opacity="0.3"/>
              <circle cx="60" cy="59" r="7" fill="#F4EEF6" stroke="#8B6B96" stroke-width="1.8"/>
              <circle cx="60" cy="59" r="3" fill="#8B6B96" opacity="0.3"/>
              <rect x="12" y="34" width="14" height="3" rx="1" fill="#8B6B96" opacity="0.15"/>
              <rect x="12" y="40" width="20" height="3" rx="1" fill="#8B6B96" opacity="0.12"/>
              <rect x="12" y="46" width="16" height="3" rx="1" fill="#8B6B96" opacity="0.1"/>
              <path d="M32 22l4-4m-4 4l-4-4m4 4v-10" stroke="#8B6B96" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
              <path d="M20 22l3-3m-3 3l-3-3m3 3v-7" stroke="#8B6B96" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
            </svg>
          </div>
          <div class="scenario-body">
            <h3 class="scenario-title">{{ s.title }}</h3>
            <p class="scenario-desc">{{ s.desc }}</p>
          </div>
        </div>
      </div>

      <!-- CTA Banner -->
      <div class="cta-banner" v-reveal="0.3">
        <div class="cta-bg">
          <div class="cta-gradient-1"></div>
          <div class="cta-gradient-2"></div>
        </div>
        <div class="cta-content">
          <h3 class="cta-title">立即体验计工宝</h3>
          <p class="cta-desc">打开微信，搜索小程序即可使用，无需下载安装</p>
          <div class="cta-steps">
            <!-- Step 1 -->
            <div class="cta-step">
              <div class="cta-step-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6.5 14.5c2.8-1.6 5.2-1.2 7 1.2 1.8 2.4 3.6 5.2 7 5.2" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M21 14c0 5-3 9-7 9s-7-4-7-9 3-9 7-9 7 4 7 9z" stroke="white" stroke-width="1.6"/>
                  <circle cx="10.5" cy="11" r="1.2" fill="white"/>
                  <circle cx="15" cy="11" r="1.2" fill="white"/>
                </svg>
              </div>
              <div class="cta-step-num">1</div>
              <div class="cta-step-text">打开微信</div>
            </div>
            <!-- Arrow -->
            <div class="cta-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <!-- Step 2 -->
            <div class="cta-step">
              <div class="cta-step-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="12" cy="12" r="7" stroke="white" stroke-width="1.8"/>
                  <path d="M17 17l5 5" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <path d="M9 12h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="cta-step-num">2</div>
              <div class="cta-step-text">搜索小程序</div>
            </div>
            <!-- Arrow -->
            <div class="cta-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <!-- Step 3 -->
            <div class="cta-step">
              <div class="cta-step-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="5" y="4" width="18" height="20" rx="2.5" stroke="white" stroke-width="1.6"/>
                  <path d="M10 12h8m-8 3.5h5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="14" cy="8" r="1.5" fill="white" opacity="0.6"/>
                </svg>
              </div>
              <div class="cta-step-num">3</div>
              <div class="cta-step-text">输入「计工宝」</div>
            </div>
          </div>
          <!-- Search bar mockup -->
          <div class="cta-search-mock">
            <svg class="cta-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.5)" stroke-width="1.4"/>
              <path d="M11 11l3 3" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span class="cta-search-text">计工宝</span>
            <span class="cta-search-cursor"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scenarios-section {
  background: var(--bg-warm);
}

.scenarios-header {
  margin-bottom: 64px;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 80px;
}

.scenario-card {
  background: var(--bg-surface);
  border: 1px solid rgba(30, 30, 42, 0.05);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.scenario-visual {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scenario-svg {
  width: 72px;
  height: 72px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.scenario-card:hover .scenario-svg {
  transform: scale(1.08);
}

.scenario-body {
  padding: 24px;
}

.scenario-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.scenario-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
}

/* CTA Banner */
.cta-banner {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  padding: 60px 48px;
  text-align: center;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #166534, #15803D, #16A34A);
}

.cta-gradient-1 {
  position: absolute;
  width: 400px;
  height: 400px;
  top: -100px;
  right: -50px;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 60%);
}

.cta-gradient-2 {
  position: absolute;
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -30px;
  background: radial-gradient(circle, rgba(200, 149, 108, 0.15) 0%, transparent 60%);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.cta-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 36px;
}

.cta-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.cta-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.cta-step-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cta-step:hover .cta-step-icon {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.cta-step-num {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  color: var(--green-700);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.cta-step-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.cta-arrow {
  margin-bottom: 20px;
  opacity: 0.6;
}

.cta-search-mock {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 100px;
}

.cta-search-icon {
  flex-shrink: 0;
}

.cta-search-text {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.04em;
}

.cta-search-cursor {
  width: 2px;
  height: 18px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1px;
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 960px) {
  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 580px) {
  .scenarios-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 48px;
  }

  .scenario-visual {
    height: 100px;
  }

  .scenario-svg {
    width: 56px;
    height: 56px;
  }

  .cta-banner {
    padding: 40px 24px;
    border-radius: var(--radius-lg);
  }

  .cta-steps {
    gap: 6px;
  }

  .cta-step-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .cta-step-icon svg {
    width: 22px;
    height: 22px;
  }

  .cta-step-text {
    font-size: 11px;
  }

  .cta-arrow svg {
    width: 18px;
    height: 18px;
  }
}
</style>
