<template>
  <view class="records-page">
    <NavBar :title="pendingMode ? '待审核记录' : '记录审核'" />

    <!-- Pending Mode Header -->
    <view v-if="pendingMode" class="pending-mode-bar">
      <view class="pending-mode-info">
        <view class="pending-mode-dot"></view>
        <text class="pending-mode-text">共 {{ records.length }} 条待审核</text>
      </view>
      <view class="pending-mode-switch" @tap="exitPendingMode">
        <text class="pending-mode-switch-text">按日期查看</text>
      </view>
    </view>

    <!-- Date Navigation Bar -->
    <view v-if="!pendingMode" class="date-bar">
      <view class="date-arrow" @tap="changeDate(-1)">
        <image src="/static/icons/arrow-left.svg" class="date-arrow-icon" />
      </view>
      <view class="date-display" @tap="openDatePicker">
        <image src="/static/icons/calendar.svg" class="date-calendar-icon" />
        <text class="date-text">{{ displayDate }}</text>
        <text v-if="isDateToday" class="date-today-badge">今天</text>
      </view>
      <view class="date-arrow" @tap="changeDate(1)">
        <image src="/static/icons/arrow-right.svg" class="date-arrow-icon" />
      </view>
    </view>

    <!-- Filter Tabs -->
    <view v-if="!pendingMode" class="filter-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: currentTab === tab.key }"
        @tap="currentTab = tab.key"
      >
        <text class="filter-tab-text">{{ tab.label }}</text>
      </view>
      <view class="tab-summary">
        <text class="summary-text">{{ filteredRecords.length }} 条</text>
      </view>
    </view>

    <!-- Records List -->
    <view class="record-list">
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <image src="/static/icons/clipboard.svg" class="empty-icon" />
        <text class="empty-text">{{ pendingMode ? '暂无待审核记录' : '当日暂无记录' }}</text>
      </view>

      <view
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-card"
      >
        <view class="record-header">
          <view class="record-header-left">
            <view class="record-sku-badge">
              <text class="record-sku-text">{{ record.skuName }}</text>
            </view>
            <text v-if="record.workDate" class="record-date-text">{{ formatWorkDate(record.workDate) }}</text>
          </view>
          <view class="record-status" :class="record.status === 'pending' ? 'rs-pending' : 'rs-confirmed'">
            <text class="record-status-text">{{ record.status === 'pending' ? '待确认' : '已确认' }}</text>
          </view>
        </view>

        <view class="record-body">
          <view class="record-info-row">
            <text class="record-worker">{{ record.workerName }}</text>
            <text class="record-step">{{ record.stepName }}</text>
          </view>
          <view class="record-detail-row">
            <view class="record-detail">
              <text class="detail-label">单价</text>
              <text class="detail-value">¥{{ record.price.toFixed(2) }}</text>
            </view>
            <view class="record-detail">
              <text class="detail-label">数量</text>
              <text class="detail-value">{{ record.quantity }}</text>
            </view>
            <view class="record-amount">
              <text class="amount-value">¥{{ record.totalAmount.toFixed(2) }}</text>
            </view>
          </view>
        </view>

        <view v-if="record.status === 'pending'" class="record-actions">
          <button class="btn-modify" @tap="modifyRecord(record)">
            <text class="btn-modify-text">修改</text>
          </button>
          <button class="btn-confirm" @tap="confirmRecord(record)">
            <text class="btn-confirm-text">确认</text>
          </button>
        </view>
      </view>
    </view>

    <!-- Bottom spacer -->
    <view :class="pendingCount > 0 ? 'tab-bar-clearance-with-bar' : 'tab-bar-clearance'"></view>

    <!-- Batch Confirm Button — 固定在 TabBar 上方 -->
    <view v-if="pendingCount > 0" class="bottom-fixed">
      <view class="bottom-bar">
        <button class="btn-batch" @tap="batchConfirm">
          <image src="/static/icons/check.svg" class="btn-batch-icon" />
          <text class="btn-batch-text">批量确认全部待审核（{{ pendingCount }}条）</text>
        </button>
      </view>
      <view class="tab-bar-placeholder"></view>
    </view>

    <!-- Modify Modal -->
    <view v-if="showModifyModal" class="modal-mask" @tap="showModifyModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">修改记录</text>
        <view class="modal-info">
          <text class="modal-info-text">{{ modifyingRecord?.workerName }} - {{ modifyingRecord?.stepName }}</text>
        </view>
        <view class="modal-form">
          <view class="form-group">
            <text class="form-label">数量</text>
            <input
              class="form-input"
              v-model="modifyForm.quantity"
              type="number"
              placeholder="请输入数量"
            />
          </view>
        </view>
        <view class="modal-actions">
          <button class="btn-modal-cancel" @tap="showModifyModal = false">
            <text class="btn-cancel-text">取消</text>
          </button>
          <button class="btn-modal-confirm" @tap="confirmModify">
            <text class="btn-confirm-modal-text">确定修改</text>
          </button>
        </view>
      </view>
    </view>

    <TabBar role="admin" current="/pages/admin/records/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';
import { formatDate, getToday, addDays } from '../../../utils/date';
import NavBar from '../../../components/NavBar.vue';
import TabBar from '../../../components/TabBar.vue';

interface Record {
  id: number;
  skuName: string;
  workerName: string;
  stepName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed';
  workDate: string;
}

const workshop = getCurrentWorkshop();
const currentDate = ref(getToday());
const currentTab = ref('all');
const records = ref<Record[]>([]);
const pendingMode = ref(false);

const showModifyModal = ref(false);
const modifyingRecord = ref<Record | null>(null);
const modifyForm = ref({ quantity: '' });

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
];

const displayDate = computed(() => {
  const d = new Date(currentDate.value);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[d.getDay()];
  return `${month}月${day}日 周${weekDay}`;
});

const isDateToday = computed(() => currentDate.value === getToday());

const filteredRecords = computed(() => {
  if (pendingMode.value) return records.value;
  if (currentTab.value === 'all') return records.value;
  return records.value.filter(r => r.status === currentTab.value);
});

const pendingCount = computed(() =>
  records.value.filter(r => r.status === 'pending').length,
);

function formatWorkDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = getToday();
  if (dateStr === today) return '今天';
  const yesterday = addDays(today, -1);
  if (dateStr === yesterday) return '昨天';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function exitPendingMode() {
  pendingMode.value = false;
  currentDate.value = getToday();
  currentTab.value = 'all';
  loadRecords();
}

function changeDate(offset: number) {
  currentDate.value = addDays(currentDate.value, offset);
  loadRecords();
}

function openDatePicker() {
  uni.showModal({
    title: '选择日期',
    placeholderText: currentDate.value,
    editable: true,
    success: (res) => {
      if (res.confirm && res.content) {
        const dateStr = res.content.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          currentDate.value = dateStr;
          loadRecords();
        }
      }
    },
  });
}

function modifyRecord(record: Record) {
  modifyingRecord.value = record;
  modifyForm.value.quantity = String(record.quantity);
  showModifyModal.value = true;
}

async function confirmModify() {
  if (!modifyingRecord.value || !workshop) return;
  const quantity = Number(modifyForm.value.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    uni.showToast({ title: '请输入正确的数量', icon: 'none' });
    return;
  }
  try {
    await api.put(`/records/${modifyingRecord.value.id}/modify`, {
      confirmed_quantity: quantity,
      modify_reason: '管理员修改数量',
    } as any);
    uni.showToast({ title: '修改成功', icon: 'success' });
    showModifyModal.value = false;
    loadRecords();
  } catch (e) {
    console.error(e);
  }
}

async function confirmRecord(record: Record) {
  if (!workshop) return;
  try {
    await api.put(`/records/${record.id}/confirm`, {} as any);
    uni.showToast({ title: '已确认', icon: 'success' });
    loadRecords();
  } catch (e) {
    console.error(e);
  }
}

async function batchConfirm() {
  if (!workshop) return;
  uni.showModal({
    title: '批量确认',
    content: `确定要确认全部 ${pendingCount.value} 条待审核记录吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const pendingIds = records.value
            .filter(r => r.status === 'pending')
            .map(r => r.id);
          await api.post('/records/batch-confirm', {
            record_ids: pendingIds,
          } as any);
          uni.showToast({ title: '批量确认成功', icon: 'success' });
          loadRecords();
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}

async function loadRecords() {
  if (!workshop) return;
  try {
    let url = `/records?workshop_id=${workshop.id}`;
    if (pendingMode.value) {
      url += `&status=pending&page_size=100`;
    } else {
      url += `&work_date=${currentDate.value}`;
    }
    const res = await api.get<any>(url);
    const list = res.data?.list || res.data || [];
    records.value = (Array.isArray(list) ? list : []).map((r: any) => {
      const step = r.step || {};
      const sku = step.sku || {};
      const worker = r.worker || {};
      return {
        id: r.id,
        skuName: sku.name || r.sku_name || '未知产品',
        workerName: worker.nickname || r.worker_name || '未知员工',
        stepName: step.name || r.step_name || '未知工序',
        price: Number(r.unit_price || step.unit_price) || 0,
        quantity: r.confirmed_quantity ?? r.quantity ?? 0,
        totalAmount: (r.confirmed_quantity ?? r.quantity ?? 0) * Number(r.unit_price || step.unit_price || 0),
        status: r.status === 'confirmed' || r.status === 'modified' ? 'confirmed' : 'pending',
        workDate: r.work_date || '',
      };
    });
  } catch (e) {
    console.error('加载记录失败', e);
  }
}

onMounted(() => {
  // Check URL params for pending mode
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  if (options.status === 'pending') {
    pendingMode.value = true;
  }
  loadRecords();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.records-page {
  min-height: 100vh;
  background: $cream;
}

/* Pending Mode Bar */
.pending-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx;
  background: $amber-surface;
}

.pending-mode-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pending-mode-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: $amber-deep;
}

.pending-mode-text {
  font-size: 26rpx;
  font-weight: 600;
  color: $amber-deep;
}

.pending-mode-switch {
  padding: 8rpx 20rpx;
  background: $surface;
  border-radius: $radius-xl;
}

.pending-mode-switch-text {
  font-size: 24rpx;
  font-weight: 500;
  color: $ink-muted;
}

/* Date Bar */
.date-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx;
  background: $surface;
}

.date-arrow {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $cream;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-arrow-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.5;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 24rpx;
  background: $cream;
  border-radius: $radius-xl;
}

.date-calendar-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.4;
}

.date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}

.date-today-badge {
  font-size: 20rpx;
  font-weight: 600;
  color: $amber;
  background: $amber-surface;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

/* Filter Tabs */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 28rpx;
  background: $surface;
  border-bottom: 1rpx solid $cream-deep;
}

.filter-tab {
  padding: 12rpx 24rpx;
  border-radius: $radius-xl;
  background: $cream;
  transition: all 0.2s;
}

.filter-tab.active {
  background: $ink;
}

.filter-tab.active .filter-tab-text {
  color: #fff;
}

.filter-tab-text {
  font-size: 26rpx;
  font-weight: 500;
  color: $ink-muted;
}

.tab-summary {
  margin-left: auto;
}

.summary-text {
  font-size: 24rpx;
  color: $ink-faint;
}

/* Record List */
.record-list {
  padding: 16rpx 28rpx;
}

.record-card {
  background: $surface;
  border-radius: $radius-md;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.record-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-sku-badge {
  background: $cream;
  padding: 6rpx 16rpx;
  border-radius: $radius-sm;
}

.record-sku-text {
  font-size: 22rpx;
  font-weight: 600;
  color: $ink-soft;
}

.record-date-text {
  font-size: 22rpx;
  color: $ink-faint;
}

.record-status {
  padding: 4rpx 14rpx;
  border-radius: $radius-sm;
}

.rs-pending {
  background: $amber-surface;
}

.rs-pending .record-status-text {
  color: $amber-deep;
}

.rs-confirmed {
  background: $sage-light;
}

.rs-confirmed .record-status-text {
  color: $sage;
}

.record-status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.record-body {
  margin-bottom: 8rpx;
}

.record-info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.record-worker {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.record-step {
  font-size: 26rpx;
  color: $ink-faint;
  background: $cream;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

.record-detail-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.record-detail {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.detail-label {
  font-size: 24rpx;
  color: $ink-faint;
}

.detail-value {
  font-size: 24rpx;
  color: $ink-muted;
  font-weight: 500;
}

.record-amount {
  margin-left: auto;
}

.amount-value {
  font-size: 32rpx;
  font-weight: 700;
  color: $amber-deep;
}

.record-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $cream;
}

.btn-modify,
.btn-confirm {
  flex: 1;
  height: 72rpx;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-modify::after,
.btn-confirm::after {
  display: none;
}

.btn-modify {
  background: $cream;
}

.btn-modify-text {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
}

.btn-confirm {
  background: $sage-light;
}

.btn-confirm-text {
  font-size: 26rpx;
  font-weight: 600;
  color: $sage;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.2;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $ink-faint;
}

/* Bottom Bar */
.bottom-bar {
  padding: 20rpx 28rpx;
  background: $surface;
  box-shadow: 0 -4rpx 16rpx rgba(30, 30, 42, 0.06);
}

.btn-batch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 92rpx;
  background: $sage;
  border-radius: $radius-lg;
  border: none;
}

.btn-batch::after {
  display: none;
}

.btn-batch-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.btn-batch-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
}

/* Modify Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 42, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: $surface;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 16rpx;
  text-align: center;
}

.modal-info {
  text-align: center;
  margin-bottom: 32rpx;
}

.modal-info-text {
  font-size: 26rpx;
  color: $ink-faint;
}

.modal-form {
  margin-bottom: 32rpx;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $ink-muted;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $cream;
  border-radius: $radius-sm;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $ink;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn-modal-cancel,
.btn-modal-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-modal-cancel::after,
.btn-modal-confirm::after {
  display: none;
}

.btn-modal-cancel {
  background: $cream;
}

.btn-cancel-text {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink-muted;
}

.btn-modal-confirm {
  background: $ink;
}

.btn-confirm-modal-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
</style>
