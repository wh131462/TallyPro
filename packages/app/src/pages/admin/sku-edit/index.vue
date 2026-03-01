<template>
  <view class="sku-edit-page">
    <scroll-view scroll-y class="edit-scroll">
      <!-- Product Info Form -->
      <view class="form-section">
        <text class="section-title">产品信息</text>
        <view class="form-card">
          <!-- Product Image -->
          <view class="form-group">
            <text class="form-label">产品图片</text>
            <view class="image-picker" @tap="pickSkuImage">
              <image
                v-if="skuForm.image_url"
                :src="getImageUrl(skuForm.image_url)"
                class="picked-image"
                mode="aspectFill"
              />
              <view v-else class="image-placeholder">
                <image src="/static/icons/camera.svg" class="placeholder-icon" />
                <text class="placeholder-text">拍照/选图</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">产品名称</text>
            <input
              class="form-input"
              v-model="skuForm.name"
              placeholder="请输入产品名称"
              :maxlength="30"
            />
          </view>
          <view class="form-group">
            <text class="form-label">产品描述</text>
            <textarea
              class="form-input form-textarea"
              v-model="skuForm.description"
              placeholder="请输入产品描述（选填）"
              :maxlength="200"
            />
          </view>
          <button class="btn-save-info" @tap="saveSkuInfo">保存信息</button>
        </view>
      </view>

      <!-- Steps List -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">工序列表</text>
          <text class="step-count">共 {{ steps.length }} 道工序</text>
        </view>

        <view v-if="steps.length === 0" class="empty-steps">
          <text class="empty-text">暂无工序，点击下方按钮添加</text>
        </view>

        <view
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-card"
        >
          <view v-if="step.image_url" class="step-img-wrap">
            <image :src="getImageUrl(step.image_url)" class="step-img" mode="aspectFill" />
          </view>
          <view v-else class="step-number" :style="{ background: stepColors[index % stepColors.length].bg }">
            <text class="step-number-text" :style="{ color: stepColors[index % stepColors.length].text }">
              {{ index + 1 }}
            </text>
          </view>
          <view class="step-content">
            <text class="step-name">{{ step.name }}</text>
            <view class="step-price-row">
              <text class="step-price-label">单价</text>
              <text class="step-price">¥{{ step.price.toFixed(2) }}</text>
            </view>
          </view>
          <view class="step-edit" @tap="editStep(step)">
            <text class="step-edit-text">编辑</text>
          </view>
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Add Step Button -->
    <view class="bottom-bar safe-bottom">
      <button class="btn-add" @tap="addStep">
        <image src="/static/icons/plus.svg" class="btn-add-icon" />
        <text class="btn-add-text">添加工序</text>
      </button>
    </view>

    <!-- Edit Step Modal -->
    <view v-if="showEditModal" class="modal-mask" @tap="showEditModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ editingStep ? '编辑工序' : '添加工序' }}</text>
        <view class="modal-form">
          <!-- Step Image -->
          <view class="form-group">
            <text class="form-label">工序图片（选填）</text>
            <view class="image-picker image-picker-sm" @tap="pickStepImage">
              <image
                v-if="stepForm.image_url"
                :src="getImageUrl(stepForm.image_url)"
                class="picked-image"
                mode="aspectFill"
              />
              <view v-else class="image-placeholder">
                <image src="/static/icons/camera.svg" class="placeholder-icon placeholder-icon-sm" />
                <text class="placeholder-text placeholder-text-sm">拍照/选图</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">工序名称</text>
            <input
              class="form-input"
              v-model="stepForm.name"
              placeholder="如：裁剪、缝纫、质检"
              :maxlength="20"
            />
          </view>
          <view class="form-group">
            <text class="form-label">单价（元/件）</text>
            <input
              class="form-input"
              v-model="stepForm.price"
              type="digit"
              placeholder="请输入单价"
            />
          </view>
        </view>
        <view class="modal-actions">
          <button class="btn-modal-cancel" @tap="showEditModal = false">
            <text class="btn-cancel-text">取消</text>
          </button>
          <button class="btn-modal-confirm" @tap="confirmStepEdit">
            <text class="btn-confirm-text">确定</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, chooseAndUploadImage, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface Step {
  id: number;
  name: string;
  price: number;
  image_url: string;
  sort_order: number;
}

const workshop = getCurrentWorkshop();
const skuId = ref<number>(0);
const skuForm = ref({ name: '', description: '', image_url: '' });
const steps = ref<Step[]>([]);

const showEditModal = ref(false);
const editingStep = ref<Step | null>(null);
const stepForm = ref({ name: '', price: '', image_url: '' });

const stepColors = [
  { bg: '#FFF0E8', text: '#D4845A' },
  { bg: '#EBF2F8', text: '#5B8DB8' },
  { bg: '#E8F2EC', text: '#6B9B7B' },
  { bg: '#F4EEF6', text: '#8B6B96' },
  { bg: '#FDEEEE', text: '#C75B5B' },
  { bg: 'rgba(200,149,108,0.12)', text: '#C8956C' },
];

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  skuId.value = Number(options.skuId) || 0;
  const skuName = options.skuName ? decodeURIComponent(options.skuName) : '';
  if (skuName) {
    skuForm.value.name = skuName;
  }

  if (skuId.value) {
    loadSkuDetail();
    loadSteps();
  }
});

async function loadSkuDetail() {
  if (!skuId.value) return;
  try {
    const res = await api.get<any>(`/skus/${skuId.value}`);
    skuForm.value.name = res.data?.name || '';
    skuForm.value.description = res.data?.description || '';
    skuForm.value.image_url = res.data?.image_url || '';
  } catch (e) {
    console.error('加载产品详情失败', e);
  }
}

async function loadSteps() {
  if (!skuId.value) return;
  try {
    const res = await api.get<any>(`/skus/${skuId.value}/steps`);
    const list = res.data || [];
    steps.value = (Array.isArray(list) ? list : []).map((s: any) => ({
      id: s.id,
      name: s.name || '未命名',
      price: Number(s.unit_price || s.price) || 0,
      image_url: s.image_url || '',
      sort_order: s.sort_order || 0,
    }));
  } catch (e) {
    console.error('加载工序列表失败', e);
  }
}

async function pickSkuImage() {
  try {
    const url = await chooseAndUploadImage();
    skuForm.value.image_url = url;
  } catch {
    // cancelled or failed
  }
}

async function pickStepImage() {
  try {
    const url = await chooseAndUploadImage();
    stepForm.value.image_url = url;
  } catch {
    // cancelled or failed
  }
}

async function saveSkuInfo() {
  if (!skuId.value) return;
  if (!skuForm.value.name.trim()) {
    uni.showToast({ title: '请输入产品名称', icon: 'none' });
    return;
  }
  try {
    await api.put(`/skus/${skuId.value}`, {
      name: skuForm.value.name,
      description: skuForm.value.description,
      image_url: skuForm.value.image_url,
    } as any);
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

function addStep() {
  editingStep.value = null;
  stepForm.value = { name: '', price: '', image_url: '' };
  showEditModal.value = true;
}

function editStep(step: Step) {
  editingStep.value = step;
  stepForm.value = { name: step.name, price: String(step.price), image_url: step.image_url };
  showEditModal.value = true;
}

async function confirmStepEdit() {
  const name = stepForm.value.name.trim();
  const price = Number(stepForm.value.price);
  if (!name) {
    uni.showToast({ title: '请输入工序名称', icon: 'none' });
    return;
  }
  if (isNaN(price) || price < 0) {
    uni.showToast({ title: '请输入正确的单价', icon: 'none' });
    return;
  }

  try {
    if (editingStep.value) {
      await api.put(`/steps/${editingStep.value.id}`, {
        name,
        unit_price: price,
        image_url: stepForm.value.image_url,
      } as any);
      uni.showToast({ title: '修改成功', icon: 'success' });
    } else {
      await api.post(`/skus/${skuId.value}/steps`, {
        name,
        unit_price: price,
        image_url: stepForm.value.image_url,
        sort_order: steps.value.length + 1,
      } as any);
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    showEditModal.value = false;
    loadSteps();
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.sku-edit-page {
  min-height: 100vh;
  background: $cream;
  display: flex;
  flex-direction: column;
}

.edit-scroll {
  flex: 1;
}

.form-section {
  padding: 0 28rpx;
  margin-bottom: 8rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  padding: 28rpx 0 16rpx;
  letter-spacing: 1rpx;
}

.step-count {
  font-size: 24rpx;
  color: $ink-faint;
  padding-top: 28rpx;
}

.form-card {
  background: $surface;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
  box-shadow: $shadow-sm;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-group:last-of-type {
  margin-bottom: 24rpx;
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

.form-textarea {
  height: 144rpx;
  padding: 20rpx 24rpx;
  line-height: 1.6;
}

/* Image Picker */
.image-picker {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background: $cream;
  border: 2rpx dashed rgba(0,0,0,0.12);
}

.image-picker-sm {
  width: 160rpx;
  height: 160rpx;
}

.picked-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.placeholder-icon {
  width: 48rpx;
  height: 48rpx;
  opacity: 0.3;
}

.placeholder-icon-sm {
  width: 40rpx;
  height: 40rpx;
}

.placeholder-text {
  font-size: 22rpx;
  color: $ink-faint;
}

.placeholder-text-sm {
  font-size: 20rpx;
}

.btn-save-info {
  width: 100%;
  height: 76rpx;
  background: $amber-surface;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  color: $amber-deep;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-save-info::after {
  display: none;
}

.empty-steps {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: $ink-faint;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: $surface;
  border-radius: $radius-md;
  margin-bottom: 12rpx;
  box-shadow: $shadow-sm;
}

.step-number {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-number-text {
  font-size: 30rpx;
  font-weight: 700;
}

.step-img-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  flex-shrink: 0;
}

.step-img {
  width: 100%;
  height: 100%;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
  margin-bottom: 6rpx;
}

.step-price-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.step-price-label {
  font-size: 24rpx;
  color: $ink-faint;
}

.step-price {
  font-size: 26rpx;
  color: $amber-deep;
  font-weight: 600;
}

.step-edit {
  padding: 12rpx 20rpx;
  flex-shrink: 0;
}

.step-edit-text {
  font-size: 26rpx;
  color: $sky;
  font-weight: 500;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  background: $surface;
  box-shadow: 0 -4rpx 16rpx rgba(30, 30, 42, 0.06);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 92rpx;
  background: $ink;
  border-radius: $radius-lg;
  border: none;
}

.btn-add::after {
  display: none;
}

.btn-add-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.btn-add-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
}

/* Edit Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 42, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
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
  margin-bottom: 32rpx;
  text-align: center;
}

.modal-form {
  margin-bottom: 32rpx;
}

.modal-form .form-group {
  margin-bottom: 20rpx;
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

.btn-confirm-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
</style>
