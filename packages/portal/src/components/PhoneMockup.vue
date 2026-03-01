<template>
  <div class="phone-frame">
    <div class="phone-bezel">
      <!-- Notch -->
      <div class="phone-notch">
        <div class="notch-camera"></div>
      </div>

      <!-- Screen -->
      <div class="phone-screen">
        <!-- Status Bar -->
        <div class="status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <svg width="16" height="12" viewBox="0 0 16 12"><rect x="0" y="6" width="3" height="6" rx="0.5" fill="#1E1E2A"/><rect x="4.5" y="4" width="3" height="8" rx="0.5" fill="#1E1E2A"/><rect x="9" y="2" width="3" height="10" rx="0.5" fill="#1E1E2A"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#1E1E2A"/></svg>
            <svg width="22" height="12" viewBox="0 0 22 12"><rect x="0" y="0" width="18" height="12" rx="2" stroke="#1E1E2A" stroke-width="1.2" fill="none"/><rect x="18.5" y="3.5" width="2" height="5" rx="0.8" fill="#1E1E2A"/><rect x="1.5" y="1.5" width="14" height="9" rx="1" fill="#16A34A"/></svg>
          </div>
        </div>

        <!-- App Header -->
        <div class="app-header">
          <div class="app-greeting">
            <div class="greeting-text">早上好，小王</div>
            <div class="greeting-sub">今天是周三 · 万顺制衣厂</div>
          </div>
          <div class="app-avatar">王</div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card stat-today">
            <div class="stat-card-label">今日计件</div>
            <div class="stat-card-value">56<span class="stat-unit">件</span></div>
            <div class="stat-card-change positive">↑ 12</div>
          </div>
          <div class="stat-card stat-week">
            <div class="stat-card-label">本周预估</div>
            <div class="stat-card-value">¥1,280</div>
            <div class="stat-card-change positive">↑ ¥320</div>
          </div>
        </div>

        <!-- Work List -->
        <div class="work-section">
          <div class="work-title">
            <span>今日工序</span>
            <span class="work-count">3 项</span>
          </div>
          <div class="work-list">
            <div class="work-item">
              <div class="work-dot done"></div>
              <div class="work-info">
                <div class="work-name">缝纫-A工序</div>
                <div class="work-price">¥2.5/件</div>
              </div>
              <div class="work-qty done">32件</div>
            </div>
            <div class="work-item">
              <div class="work-dot done"></div>
              <div class="work-info">
                <div class="work-name">裁剪-B工序</div>
                <div class="work-price">¥1.8/件</div>
              </div>
              <div class="work-qty done">24件</div>
            </div>
            <div class="work-item">
              <div class="work-dot pending"></div>
              <div class="work-info">
                <div class="work-name">包装-C工序</div>
                <div class="work-price">¥1.2/件</div>
              </div>
              <div class="work-qty pending-text">待填</div>
            </div>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="tab-bar">
          <div class="tab-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 7h14v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#A0A0B0" stroke-width="1.5"/><path d="M7 7V5a3 3 0 016 0v2" stroke="#A0A0B0" stroke-width="1.5"/></svg>
            <span>记录</span>
          </div>
          <div class="tab-item active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-7 7 7" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round"/><path d="M5 9v7a1 1 0 001 1h8a1 1 0 001-1V9" stroke="#16A34A" stroke-width="1.8"/></svg>
            <span>首页</span>
          </div>
          <div class="tab-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="#A0A0B0" stroke-width="1.5"/><path d="M3 18c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#A0A0B0" stroke-width="1.5"/></svg>
            <span>我的</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Phone Shadow -->
    <div class="phone-shadow"></div>
  </div>
</template>

<style scoped>
.phone-frame {
  position: relative;
  width: 280px;
  animation: phoneFloat 8s ease-in-out infinite;
}

@keyframes phoneFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.phone-bezel {
  position: relative;
  background: #1a1a1e;
  border-radius: 40px;
  padding: 12px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 20px rgba(0, 0, 0, 0.1);
}

.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 28px;
  background: #1a1a1e;
  border-radius: 0 0 18px 18px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notch-camera {
  width: 10px;
  height: 10px;
  background: #2a2a30;
  border-radius: 50%;
  border: 1.5px solid #3a3a40;
}

.phone-screen {
  background: #FAF8F4;
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1E1E2A;
}

.status-time {
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* App Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 16px;
}

.greeting-text {
  font-size: 17px;
  font-weight: 700;
  color: #1E1E2A;
  margin-bottom: 2px;
}

.greeting-sub {
  font-size: 11px;
  color: #A0A0B0;
}

.app-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16A34A, #166534);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 10px;
  padding: 0 20px 14px;
}

.stat-card {
  flex: 1;
  border-radius: 14px;
  padding: 14px;
}

.stat-today {
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  border: 1px solid rgba(22, 163, 74, 0.1);
}

.stat-week {
  background: linear-gradient(135deg, #FDF6F0, #FDECD4);
  border: 1px solid rgba(200, 149, 108, 0.1);
}

.stat-card-label {
  font-size: 10px;
  color: #6E6E80;
  font-weight: 500;
  margin-bottom: 6px;
}

.stat-card-value {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: #1E1E2A;
  letter-spacing: -0.02em;
}

.stat-unit {
  font-size: 12px;
  font-weight: 600;
  margin-left: 2px;
}

.stat-card-change {
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
}

.stat-card-change.positive {
  color: #16A34A;
}

/* Work Section */
.work-section {
  flex: 1;
  padding: 0 20px;
}

.work-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #1E1E2A;
  margin-bottom: 10px;
}

.work-count {
  font-size: 11px;
  font-weight: 500;
  color: #A0A0B0;
}

.work-list {
  background: #FFFFFF;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(30, 30, 42, 0.05);
}

.work-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.work-item + .work-item {
  border-top: 1px solid rgba(30, 30, 42, 0.04);
}

.work-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.work-dot.done {
  background: #16A34A;
}

.work-dot.pending {
  background: #E5E5EA;
}

.work-info {
  flex: 1;
  min-width: 0;
}

.work-name {
  font-size: 13px;
  font-weight: 600;
  color: #1E1E2A;
}

.work-price {
  font-size: 10px;
  color: #A0A0B0;
  margin-top: 1px;
}

.work-qty {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: #16A34A;
}

.work-qty.pending-text {
  color: #A0A0B0;
  font-size: 12px;
  font-weight: 500;
}

/* Tab Bar */
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  margin-top: auto;
  border-top: 1px solid rgba(30, 30, 42, 0.06);
  background: rgba(255, 255, 255, 0.8);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #A0A0B0;
  font-weight: 500;
}

.tab-item.active {
  color: #16A34A;
}

/* Shadow */
.phone-shadow {
  position: absolute;
  bottom: -20px;
  left: 20%;
  right: 20%;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
  filter: blur(8px);
}
</style>
