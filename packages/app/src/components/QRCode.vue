<template>
  <view class="qr-wrapper">
    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: pxSize + 'px', height: pxSize + 'px' }"
      class="qr-canvas"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
// @ts-ignore
import qrGenerator from 'qrcode-generator';

const props = withDefaults(
  defineProps<{
    value: string;
    size?: number; // rpx
    fgColor?: string;
    bgColor?: string;
  }>(),
  {
    size: 300,
    fgColor: '#1E1E2A',
    bgColor: '#FFFFFF',
  }
);

const emit = defineEmits<{
  ready: [];
}>();

const canvasId = 'qr_' + Math.random().toString(36).slice(2, 8);
const instance = getCurrentInstance();

const pxSize = computed(() => uni.upx2px(props.size));

function draw() {
  if (!props.value) return;

  const qr = qrGenerator(0, 'M');
  qr.addData(props.value);
  qr.make();

  const size = pxSize.value;
  const moduleCount = qr.getModuleCount();
  const margin = Math.floor(size * 0.06);
  const cellSize = (size - margin * 2) / moduleCount;

  const ctx = uni.createCanvasContext(canvasId, instance?.proxy);

  // Background
  ctx.setFillStyle(props.bgColor);
  ctx.fillRect(0, 0, size, size);

  // QR modules
  ctx.setFillStyle(props.fgColor);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          margin + col * cellSize,
          margin + row * cellSize,
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }

  ctx.draw(false, () => emit('ready'));
}

/**
 * Export canvas to temporary image file path
 */
function toTempFilePath(): Promise<string> {
  return new Promise((resolve, reject) => {
    const size = pxSize.value;
    uni.canvasToTempFilePath(
      {
        canvasId,
        x: 0,
        y: 0,
        width: size,
        height: size,
        destWidth: size * 3,
        destHeight: size * 3,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => reject(err),
      },
      instance?.proxy
    );
  });
}

onMounted(() => {
  nextTick(() => setTimeout(draw, 300));
});

watch(
  () => props.value,
  () => nextTick(() => setTimeout(draw, 100))
);

defineExpose({ draw, toTempFilePath, canvasId });
</script>

<style scoped>
.qr-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  display: block;
}
</style>
