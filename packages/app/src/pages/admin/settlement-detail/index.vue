<template>
  <view class="detail-page">
    <scroll-view scroll-y class="detail-scroll">
      <!-- Amount Highlight Box -->
      <view class="amount-box">
        <view class="ab-header">
          <view class="ab-worker">
            <view v-if="detail.worker_avatar" class="ab-avatar">
              <image :src="getImageUrl(detail.worker_avatar)" class="ab-avatar-img" mode="aspectFill" />
            </view>
            <view v-else class="ab-avatar">
              <image src="/static/icons/profile.svg" class="ab-avatar-icon" />
            </view>
            <view class="ab-info">
              <text class="ab-name">{{ detail.worker_name }}</text>
              <text class="ab-period">{{ detail.start_date }} ~ {{ detail.end_date }}</text>
            </view>
          </view>
          <view
            class="badge"
            :class="detail.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
          >
            {{ detail.status === 'confirmed' ? '已确认' : '草稿' }}
          </view>
        </view>
        <view class="ab-total">
          <text class="ab-total-label">结算总额</text>
          <text class="ab-total-value">¥{{ detail.total_amount }}</text>
        </view>
      </view>

      <!-- Product Sections -->
      <view v-for="(section, idx) in detail.sections" :key="idx" class="product-section">
        <view class="ps-header">
          <view class="ps-icon-wrap">
            <image src="/static/icons/package.svg" class="ps-icon" />
          </view>
          <text class="ps-name">{{ section.product_name }}</text>
          <text class="ps-subtotal">¥{{ section.subtotal }}</text>
        </view>

        <view class="ps-items">
          <view v-for="(item, i) in section.items" :key="i" class="ps-item">
            <text class="psi-step">{{ item.step_name }}</text>
            <text class="psi-calc">¥{{ item.price }} x {{ item.quantity }}</text>
            <text class="psi-amount">¥{{ item.amount }}</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="!loading && detail.sections.length === 0" class="empty-state">
        <image src="/static/icons/clipboard.svg" class="empty-icon" />
        <text class="empty-text">暂无结算明细</text>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Bottom Actions -->
    <view class="bottom-bar">
      <view class="bottom-bar-inner">
        <button
          v-if="detail.status === 'draft'"
          class="btn-confirm"
          :disabled="confirming"
          @tap="confirmSettlement"
        >
          {{ confirming ? '确认中...' : '确认结算' }}
        </button>
        <button class="btn-primary export-btn" :disabled="exporting" @tap="exportReport">
          <image src="/static/icons/export.svg" class="export-icon" />
          <text>{{ exporting ? '生成中...' : '导出报表' }}</text>
        </button>
      </view>
    </view>

    <!-- Hidden canvas for export -->
    <canvas
      canvas-id="settlementCanvas"
      :style="{ position: 'fixed', left: '-9999px', top: '0', width: canvasW + 'px', height: canvasH + 'px' }"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, getCurrentInstance } from 'vue';
import { api, getImageUrl } from '../../../utils/request';

const instance = getCurrentInstance();

interface SectionItem {
  step_name: string;
  price: string;
  quantity: number;
  amount: string;
}

interface ProductSection {
  product_name: string;
  subtotal: string;
  items: SectionItem[];
}

interface SettlementDetail {
  id: number;
  worker_name: string;
  worker_avatar: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: 'confirmed' | 'draft';
  sections: ProductSection[];
}

const loading = ref(true);
const exporting = ref(false);
const confirming = ref(false);
const settlementId = ref<number>(0);
const canvasW = ref(600);
const canvasH = ref(800);

const detail = ref<SettlementDetail>({
  id: 0,
  worker_name: '',
  worker_avatar: '',
  start_date: '',
  end_date: '',
  total_amount: '0.00',
  status: 'draft',
  sections: [],
});

function confirmSettlement() {
  uni.showModal({
    title: '确认结算',
    content: `确认该结算单（¥${detail.value.total_amount}）？确认后关联的工作记录将标记为已结算。`,
    success: async (res) => {
      if (!res.confirm) return;
      confirming.value = true;
      try {
        await api.put(`/settlements/${settlementId.value}/confirm`);
        detail.value.status = 'confirmed';
        uni.showToast({ title: '已确认', icon: 'success' });
      } catch (e) {
        console.error('确认结算失败', e);
      } finally {
        confirming.value = false;
      }
    },
  });
}

async function exportReport() {
  const d = detail.value;
  if (!d.sections.length) {
    uni.showToast({ title: '暂无结算明细', icon: 'none' });
    return;
  }
  if (exporting.value) return;
  exporting.value = true;
  uni.showLoading({ title: '生成中...' });

  try {
    // --- Calculate canvas height ---
    const W = 600;
    const PAD = 40;
    const HEADER_H = 120;
    const INFO_H = 130;
    const DIVIDER_GAP = 24;
    const SECTION_HEADER_H = 44;
    const ITEM_H = 36;
    const SECTION_GAP = 16;
    const TOTAL_H = 100;
    const FOOTER_H = 50;

    let sectionsH = 0;
    for (const s of d.sections) {
      sectionsH += SECTION_HEADER_H + s.items.length * ITEM_H + SECTION_GAP;
    }

    const H = HEADER_H + INFO_H + DIVIDER_GAP + sectionsH + DIVIDER_GAP + TOTAL_H + FOOTER_H + PAD;
    canvasW.value = W;
    canvasH.value = H;

    await nextTick();
    await new Promise((r) => setTimeout(r, 150));

    const ctx = uni.createCanvasContext('settlementCanvas', instance?.proxy);

    // --- Background ---
    ctx.setFillStyle('#FAF8F4');
    ctx.fillRect(0, 0, W, H);

    // --- Dark header ---
    ctx.setFillStyle('#1E1E2A');
    ctx.fillRect(0, 0, W, HEADER_H);

    ctx.setTextAlign('center');
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(28);
    ctx.fillText('结 算 单', W / 2, 55);
    ctx.setFontSize(12);
    ctx.setFillStyle('rgba(255,255,255,0.4)');
    ctx.fillText('SETTLEMENT REPORT', W / 2, 82);

    // Amber accent line
    ctx.setFillStyle('#C8956C');
    ctx.fillRect(W / 2 - 30, 96, 60, 3);

    let y = HEADER_H + 24;

    // --- Info section ---
    const infoX = PAD;
    const valX = PAD + 56;

    ctx.setTextAlign('left');
    ctx.setFontSize(13);
    ctx.setFillStyle('#A0A0B0');
    ctx.fillText('员工', infoX, y);
    ctx.setFillStyle('#1E1E2A');
    ctx.setFontSize(14);
    ctx.fillText(d.worker_name, valX, y);

    y += 34;
    ctx.setFontSize(13);
    ctx.setFillStyle('#A0A0B0');
    ctx.fillText('周期', infoX, y);
    ctx.setFillStyle('#1E1E2A');
    ctx.setFontSize(14);
    ctx.fillText(`${d.start_date} ~ ${d.end_date}`, valX, y);

    y += 34;
    ctx.setFontSize(13);
    ctx.setFillStyle('#A0A0B0');
    ctx.fillText('状态', infoX, y);
    const statusText = d.status === 'confirmed' ? '已确认' : '草稿';
    const statusColor = d.status === 'confirmed' ? '#6B9B7B' : '#C8956C';
    ctx.setFillStyle(statusColor);
    ctx.setFontSize(14);
    ctx.fillText(statusText, valX, y);

    y += 38;

    // --- Divider ---
    ctx.setStrokeStyle('#EDE6DA');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();
    y += DIVIDER_GAP;

    // --- Product sections ---
    for (const section of d.sections) {
      // Section header with amber bar
      ctx.setFillStyle('#C8956C');
      ctx.fillRect(PAD, y + 2, 4, 18);

      ctx.setTextAlign('left');
      ctx.setFillStyle('#1E1E2A');
      ctx.setFontSize(15);
      ctx.fillText(section.product_name, PAD + 14, y + 16);

      ctx.setTextAlign('right');
      ctx.setFillStyle('#C8956C');
      ctx.setFontSize(15);
      ctx.fillText(`¥${section.subtotal}`, W - PAD, y + 16);

      y += SECTION_HEADER_H;

      // Items
      for (const item of section.items) {
        ctx.setTextAlign('left');
        ctx.setFillStyle('#6E6E80');
        ctx.setFontSize(12);
        ctx.fillText(item.step_name, PAD + 14, y + 14);

        ctx.setFillStyle('#A0A0B0');
        ctx.setFontSize(12);
        ctx.fillText(`¥${item.price} × ${item.quantity}`, PAD + 200, y + 14);

        ctx.setTextAlign('right');
        ctx.setFillStyle('#3A3A4A');
        ctx.setFontSize(13);
        ctx.fillText(`¥${item.amount}`, W - PAD, y + 14);

        y += ITEM_H;
      }

      y += SECTION_GAP;
    }

    // --- Divider ---
    ctx.setStrokeStyle('#EDE6DA');
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();
    y += DIVIDER_GAP;

    // --- Total ---
    ctx.setTextAlign('center');
    ctx.setFillStyle('#A0A0B0');
    ctx.setFontSize(13);
    ctx.fillText('结算总额', W / 2, y + 12);

    ctx.setFillStyle('#C8956C');
    ctx.setFontSize(36);
    ctx.fillText(`¥${d.total_amount}`, W / 2, y + 56);

    y += TOTAL_H;

    // --- Footer ---
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    ctx.setFillStyle('#A0A0B0');
    ctx.setFontSize(11);
    ctx.fillText(`${dateStr}  ·  计工宝`, W / 2, H - 20);

    // --- Draw & save ---
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvasId: 'settlementCanvas',
            destWidth: W * 2,
            destHeight: H * 2,
            success: (res) => {
              uni.hideLoading();
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  uni.showToast({ title: '已保存到相册', icon: 'success' });
                },
                fail: (err) => {
                  if (
                    err.errMsg?.includes('auth deny') ||
                    err.errMsg?.includes('authorize')
                  ) {
                    uni.showModal({
                      title: '提示',
                      content: '需要您授权保存图片到相册',
                      success: (r) => {
                        if (r.confirm) uni.openSetting({});
                      },
                    });
                  } else {
                    uni.showToast({ title: '保存失败', icon: 'none' });
                  }
                },
              });
            },
            fail: () => {
              uni.hideLoading();
              uni.showToast({ title: '生成图片失败', icon: 'none' });
            },
          },
          instance?.proxy,
        );
      }, 300);
    });
  } catch (e) {
    uni.hideLoading();
    console.error('导出失败', e);
    uni.showToast({ title: '导出失败', icon: 'none' });
  } finally {
    exporting.value = false;
  }
}

onMounted(async () => {
  // Read page params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  settlementId.value = Number(options.id) || 0;

  if (!settlementId.value) {
    loading.value = false;
    return;
  }

  try {
    const res = await api.get<any>(`/settlements/${settlementId.value}`);
    if (res.data) {
      const d = res.data;
      const worker = d.worker || {};
      const items = d.items || [];

      // Group items by SKU
      const sectionMap = new Map<string, ProductSection>();
      for (const item of items) {
        const skuName = item.sku_name || '未知产品';
        let section = sectionMap.get(skuName);
        if (!section) {
          section = { product_name: skuName, subtotal: '0.00', items: [] };
          sectionMap.set(skuName, section);
        }
        const amount = Number(item.amount) || (Number(item.unit_price) * (item.quantity || 0));
        section.items.push({
          step_name: item.step_name || '未知工序',
          price: String(Number(item.unit_price || 0).toFixed(2)),
          quantity: item.quantity || 0,
          amount: String(amount.toFixed(2)),
        });
      }

      // Calculate subtotals
      for (const section of sectionMap.values()) {
        const subtotal = section.items.reduce((sum, i) => sum + parseFloat(i.amount), 0);
        section.subtotal = subtotal.toFixed(2);
      }

      detail.value = {
        id: d.id,
        worker_name: worker.nickname || '未知员工',
        worker_avatar: worker.avatar_url || '',
        start_date: d.period_start || '',
        end_date: d.period_end || '',
        total_amount: d.total_amount || '0.00',
        status: d.status === 'confirmed' ? 'confirmed' : 'draft',
        sections: Array.from(sectionMap.values()),
      };
    }
  } catch (e) {
    console.error('加载结算详情失败', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.detail-page {
  min-height: 100vh;
  background: $cream;
  position: relative;
}

.detail-scroll {
  height: 100vh;
}

// Amount Highlight Box
.amount-box {
  margin: 20rpx 28rpx;
  background: $surface;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-md;
}

.ab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.ab-worker {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.ab-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ab-avatar-img {
  width: 80rpx;
  height: 80rpx;
}

.ab-avatar-icon {
  width: 40rpx;
  height: 40rpx;
}

.ab-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $ink;
}

.ab-period {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 6rpx;
  letter-spacing: 1rpx;
}

.ab-total {
  background: $amber-surface;
  border-radius: $radius-sm;
  padding: 28rpx 32rpx;
  text-align: center;
}

.ab-total-label {
  display: block;
  font-size: 24rpx;
  color: $ink-muted;
  letter-spacing: 2rpx;
}

.ab-total-value {
  display: block;
  font-size: 56rpx;
  font-weight: 900;
  color: $amber;
  margin-top: 8rpx;
  letter-spacing: 2rpx;
}

// Product Sections
.product-section {
  margin: 20rpx 28rpx;
  background: $surface;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.ps-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $cream;
}

.ps-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ps-icon {
  width: 28rpx;
  height: 28rpx;
}

.ps-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
}

.ps-subtotal {
  font-size: 28rpx;
  font-weight: 700;
  color: $amber;
}

.ps-items {
  padding: 8rpx 0;
}

.ps-item {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
}

.psi-step {
  flex: 1;
  font-size: 26rpx;
  color: $ink-soft;
}

.psi-calc {
  font-size: 24rpx;
  color: $ink-faint;
  margin-right: 24rpx;
}

.psi-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  min-width: 120rpx;
  text-align: right;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.2;
  margin-bottom: 28rpx;
}

.empty-text {
  font-size: 30rpx;
  color: $ink-muted;
  font-weight: 600;
}

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, $cream 60%, transparent);
}

.bottom-bar-inner {
  display: flex;
  gap: 16rpx;
}

.btn-confirm {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  background: $sage;
  color: #fff;
  border: none;
  white-space: nowrap;

  &::after {
    display: none;
  }
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.export-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}
</style>
