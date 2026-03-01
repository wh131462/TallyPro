<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PhoneMockup from './PhoneMockup.vue'

const heroReady = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

function onMouseMove(e: MouseEvent) {
  const x = (e.clientX / window.innerWidth - 0.5) * 2
  const y = (e.clientY / window.innerHeight - 0.5) * 2
  mouseX.value = x
  mouseY.value = y
}

onMounted(() => {
  requestAnimationFrame(() => {
    heroReady.value = true
  })
})

const stats = [
  { value: '27+', label: '功能页面' },
  { value: '10+', label: '数据模型' },
  { value: '100%', label: '操作留痕' },
]
</script>

<template>
  <section id="hero" class="hero" @mousemove="onMouseMove">
    <!-- Background decorations -->
    <div class="hero-bg">
      <div class="hero-gradient-1"></div>
      <div class="hero-gradient-2"></div>
      <div class="hero-gradient-3"></div>
      <div class="hero-grid"></div>
    </div>

    <div class="hero-container">
      <div class="hero-content" :class="{ ready: heroReady }">
        <div class="hero-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 5.5C13.5 9 8 13.5 8 13.5S2.5 9 2.5 5.5C2.5 2.5 5 1 8 1s5.5 1.5 5.5 4.5z" fill="#22C55E"/>
            <circle cx="8" cy="5.5" r="1.8" fill="#fff"/>
          </svg>
          <span>微信小程序</span>
        </div>

        <h1 class="hero-title">
          让计件工资<br/>管理更<span class="title-highlight">简单</span>
        </h1>

        <p class="hero-subtitle">
          计工宝是一款为制造企业打造的计件工资管理工具。员工扫码填报，系统自动结算，告别纸质记录与 Excel 的低效。
        </p>

        <div class="hero-actions">
          <a href="#features" class="btn-primary" @click.prevent="$el.closest('section')?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v16m0 0l-6-6m6 6l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            了解更多
          </a>
          <a href="#workflow" class="btn-secondary" @click.prevent="document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })">
            使用流程
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div
        class="hero-visual"
        :class="{ ready: heroReady }"
        :style="{
          transform: `perspective(1200px) rotateY(${mouseX * -2}deg) rotateX(${mouseY * 2}deg)`
        }"
      >
        <PhoneMockup />
        <!-- Floating decorative elements -->
        <div class="float-card float-card-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1l2.5 5.5L18 7.5l-4 4.5 1 6L10 15l-5 3 1-6-4-4.5 5.5-1L10 1z" fill="#C8956C"/>
          </svg>
          <span>智能结算</span>
        </div>
        <div class="float-card float-card-2">
          <span class="float-num">+128</span>
          <span class="float-label">今日计件</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 80px;
}

/* ===== Background ===== */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient-1 {
  position: absolute;
  width: 800px;
  height: 800px;
  top: -200px;
  right: -200px;
  background: radial-gradient(ellipse, rgba(74, 222, 128, 0.1) 0%, transparent 70%);
  animation: drift1 20s ease-in-out infinite;
}

.hero-gradient-2 {
  position: absolute;
  width: 600px;
  height: 600px;
  bottom: -100px;
  left: -100px;
  background: radial-gradient(ellipse, rgba(200, 149, 108, 0.08) 0%, transparent 70%);
  animation: drift2 25s ease-in-out infinite;
}

.hero-gradient-3 {
  position: absolute;
  width: 400px;
  height: 400px;
  top: 30%;
  left: 40%;
  background: radial-gradient(ellipse, rgba(107, 155, 123, 0.06) 0%, transparent 70%);
  animation: drift3 18s ease-in-out infinite;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(30, 30, 42, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 30, 42, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
}

@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 30px) scale(1.1); }
}

@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -40px) scale(1.05); }
}

@keyframes drift3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

/* ===== Layout ===== */
.hero-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

/* ===== Content ===== */
.hero-content {
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-content.ready {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 10px;
  background: var(--green-50);
  border: 1px solid var(--green-200);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: var(--green-700);
  margin-bottom: 28px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.title-highlight {
  position: relative;
  color: var(--green-600);
}

.title-highlight::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: -4px;
  right: -4px;
  height: 12px;
  background: rgba(74, 222, 128, 0.2);
  border-radius: 4px;
  z-index: -1;
}

.hero-subtitle {
  font-size: 17px;
  line-height: 1.8;
  color: var(--text-muted);
  max-width: 480px;
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--green-600), var(--green-800));
  padding: 14px 28px;
  border-radius: var(--radius-md);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(22, 101, 52, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(22, 101, 52, 0.35);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 14px 24px;
  border-radius: var(--radius-md);
  background: rgba(30, 30, 42, 0.04);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(30, 30, 42, 0.08);
  color: var(--text-primary);
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: var(--text-faint);
  font-weight: 500;
}

/* ===== Visual ===== */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transform: translateX(60px);
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s,
              transform 0.15s ease;
}

.hero-visual.ready {
  opacity: 1;
  transform: translateX(0);
}

/* Floating cards */
.float-card {
  position: absolute;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid rgba(30, 30, 42, 0.05);
  z-index: 10;
}

.float-card-1 {
  top: 15%;
  right: -10px;
  animation: floatCard1 6s ease-in-out infinite;
}

.float-card-2 {
  bottom: 20%;
  left: -10px;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  animation: floatCard2 7s ease-in-out infinite;
}

.float-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--green-600);
  letter-spacing: -0.02em;
}

.float-label {
  font-size: 12px;
  color: var(--text-faint);
  font-weight: 500;
}

@keyframes floatCard1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes floatCard2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 48px;
    padding-top: 40px;
  }

  .hero-content {
    order: 1;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    order: 2;
  }

  .float-card-1 {
    right: 5%;
  }

  .float-card-2 {
    left: 5%;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: auto;
    padding-top: 100px;
    padding-bottom: 60px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    gap: 24px;
  }

  .float-card {
    display: none;
  }
}
</style>
