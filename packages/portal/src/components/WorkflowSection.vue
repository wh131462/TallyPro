<script setup lang="ts">
const steps = [
  {
    num: '01',
    title: '创建企业',
    desc: '注册账号后创建您的企业，设置产品（SKU）和对应的工序，配置每道工序的计件单价。',
    icon: 'create',
  },
  {
    num: '02',
    title: '邀请员工',
    desc: '生成带有效期的邀请码或二维码，员工微信扫码即可加入。支持自动绑定或审批确认。',
    icon: 'invite',
  },
  {
    num: '03',
    title: '开始记工',
    desc: '员工每天打开小程序填报工作量，企业主实时审核确认。月末一键结算，工资明细清晰可查。',
    icon: 'work',
  },
]
</script>

<template>
  <section id="workflow" class="section workflow-section">
    <div class="container">
      <div class="workflow-header" v-reveal>
        <div class="section-label">How It Works</div>
        <h2 class="section-title">三步开启数字化管理</h2>
        <p class="section-desc">
          无需复杂配置，几分钟内即可完成企业初始化，让团队快速上手。
        </p>
      </div>

      <div class="steps-container">
        <div class="steps-line" aria-hidden="true"></div>

        <div
          v-for="(step, i) in steps"
          :key="step.num"
          v-reveal="0.15 * (i + 1)"
          class="step-card"
        >
          <div class="step-number-wrap">
            <div class="step-number">{{ step.num }}</div>
          </div>

          <div class="step-content">
            <div class="step-icon">
              <!-- Create -->
              <svg v-if="step.icon === 'create'" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 12h8m-8 4h8m-8 4h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="24" cy="24" r="6" fill="var(--green-100)" stroke="var(--green-600)" stroke-width="1.5"/>
                <path d="M24 21.5v5m-2.5-2.5h5" stroke="var(--green-600)" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <!-- Invite -->
              <svg v-else-if="step.icon === 'invite'" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="12" cy="10" r="4.5" stroke="currentColor" stroke-width="1.8"/>
                <path d="M4 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <circle cx="24" cy="12" r="6" fill="var(--green-100)" stroke="var(--green-600)" stroke-width="1.5"/>
                <path d="M22 12h4m-2-2v4" stroke="var(--green-600)" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <!-- Work -->
              <svg v-else-if="step.icon === 'work'" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/>
                <path d="M4 12h24" stroke="currentColor" stroke-width="1.8"/>
                <path d="M10 18l3 3 6-7" stroke="var(--green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.workflow-section {
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-warm) 100%);
}

.workflow-header {
  margin-bottom: 72px;
}

.steps-container {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.steps-line {
  position: absolute;
  top: 32px;
  left: calc(16.67% + 16px);
  right: calc(16.67% + 16px);
  height: 2px;
  background: linear-gradient(90deg, var(--green-200), var(--green-400), var(--green-200));
  border-radius: 1px;
}

.step-card {
  text-align: center;
  position: relative;
}

.step-number-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--green-200);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;
}

.step-card:hover .step-number-wrap {
  border-color: var(--green-400);
  box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.1);
}

.step-number {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--green-600);
  letter-spacing: -0.02em;
}

.step-content {
  background: var(--bg-surface);
  border: 1px solid rgba(30, 30, 42, 0.05);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.step-card:hover .step-content {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.step-icon {
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.step-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.step-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .steps-container {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 420px;
    margin: 0 auto;
  }

  .steps-line {
    display: none;
  }

  .step-card {
    display: flex;
    align-items: flex-start;
    text-align: left;
    gap: 20px;
  }

  .step-number-wrap {
    margin: 0;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
  }

  .step-number {
    font-size: 17px;
  }

  .step-content {
    padding: 24px;
  }

  .step-icon {
    justify-content: flex-start;
  }
}
</style>
