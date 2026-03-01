<script setup lang="ts">
const features = [
  {
    icon: 'wechat',
    title: '微信生态无缝集成',
    desc: '无需下载任何 App，微信扫码即可使用。依托微信生态，登录、通知一步到位。',
    color: '#22C55E',
    bg: '#ECFDF5',
  },
  {
    icon: 'calc',
    title: '智能工资结算',
    desc: '多工序组合计费，系统按单价自动核算。单价快照机制确保调价不影响已提交记录。',
    color: '#C8956C',
    bg: '#FDF6F0',
  },
  {
    icon: 'check',
    title: '完整审核流程',
    desc: '企业主逐条审核、修改、批量确认。记录状态全流程可视，从提交到结算清晰透明。',
    color: '#5B8DB8',
    bg: '#EBF2F8',
  },
  {
    icon: 'shield',
    title: '数据安全可追溯',
    desc: '所有关键操作留痕，修改记录前后数据完整保留。乐观锁机制防止并发冲突。',
    color: '#8B6B96',
    bg: '#F4EEF6',
  },
  {
    icon: 'building',
    title: '多企业灵活管理',
    desc: '一个账号管理多个车间或产品线。邀请码绑定、自动审批，团队协作更高效。',
    color: '#D4845A',
    bg: '#FFF0E8',
  },
  {
    icon: 'bell',
    title: '实时消息推送',
    desc: '新申请、待审核、结算完成等重要事项即时推送。基于微信订阅消息，不遗漏任何动态。',
    color: '#6B9B7B',
    bg: '#E8F2EC',
  },
]
</script>

<template>
  <section id="features" class="section features-section">
    <div class="container">
      <div class="features-header" v-reveal>
        <div class="section-label">Features</div>
        <h2 class="section-title">为计件场景精心打造</h2>
        <p class="section-desc">
          从员工填报到工资结算，每一个环节都经过深思熟虑。计工宝让复杂的计件管理变得井然有序。
        </p>
      </div>

      <div class="features-grid">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          v-reveal="0.08 * (i + 1)"
          class="feature-card"
        >
          <div class="feature-icon" :style="{ background: f.bg, color: f.color }">
            <!-- Wechat -->
            <svg v-if="f.icon === 'wechat'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8.5 11a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
              <path d="M21 12.5c0-1.4-.7-2.7-1.8-3.6C18 7.7 16.1 7 14 7c-4.1 0-7.5 2.9-7.5 6.5 0 1.2.4 2.3 1.1 3.2L7 19l2.5-1.3c.9.3 1.9.5 3 .5h.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M15 16a.8.8 0 100-1.6.8.8 0 000 1.6zm3 0a.8.8 0 100-1.6.8.8 0 000 1.6z" fill="currentColor"/>
              <path d="M21.5 17.5c0-2.2-2-4-4.5-4s-4.5 1.8-4.5 4 2 4 4.5 4c.6 0 1.2-.1 1.7-.3l1.8 1-.5-1.5c.6-.8 1-1.8 1-2.7z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <!-- Calculator -->
            <svg v-else-if="f.icon === 'calc'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="7" y="6" width="10" height="4" rx="1" fill="currentColor" opacity="0.2"/>
              <circle cx="8.5" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="15.5" cy="14" r="1" fill="currentColor"/>
              <circle cx="8.5" cy="17.5" r="1" fill="currentColor"/><circle cx="12" cy="17.5" r="1" fill="currentColor"/><circle cx="15.5" cy="17.5" r="1" fill="currentColor"/>
            </svg>
            <!-- Check -->
            <svg v-else-if="f.icon === 'check'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5h10a2 2 0 012 2v10a2 2 0 01-2 2H9" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- Shield -->
            <svg v-else-if="f.icon === 'shield'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 7v5c0 4.5 3.5 8.7 8 10 4.5-1.3 8-5.5 8-10V7l-8-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- Building -->
            <svg v-else-if="f.icon === 'building'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 21V7l7-4 7 4v14" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M9 10h2m-2 4h2m2-4h2m-2 4h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M10 21v-4h4v4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <!-- Bell -->
            <svg v-else-if="f.icon === 'bell'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="18" cy="4" r="2.5" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>

          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  background: var(--bg-primary);
}

.features-header {
  margin-bottom: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--bg-surface);
  border: 1px solid rgba(30, 30, 42, 0.05);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(30, 30, 42, 0.08);
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.feature-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.feature-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
}

@media (max-width: 960px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 580px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 24px;
  }
}
</style>
