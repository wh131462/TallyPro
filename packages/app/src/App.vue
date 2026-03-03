<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  // 小程序自动更新检测
  const updateManager = uni.getUpdateManager();
  updateManager.onCheckForUpdate((res) => {
    if (res.hasUpdate) {
      console.log("检测到新版本");
    }
  });
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: "更新提示",
      content: "新版本已准备好，是否重启应用？",
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });
  updateManager.onUpdateFailed(() => {
    uni.showModal({
      title: "更新提示",
      content: "新版本下载失败，请删除小程序后重新搜索打开",
      showCancel: false,
    });
  });
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
@use './static/styles/theme.scss' as *;

page {
  background-color: $cream;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  color: $ink;
  font-size: 28rpx;
  line-height: 1.5;
}

.container {
  padding: 0 28rpx;
}

/* Common utility classes */
.card {
  background: $surface;
  margin: 20rpx 28rpx;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-sm;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  margin: 36rpx 28rpx 16rpx;
  letter-spacing: 2rpx;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 88rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(135deg, $amber 0%, $amber-deep 100%);
  color: #fff;
  border: none;
  letter-spacing: 1rpx;
  white-space: nowrap;

  &::after {
    display: none;
  }
}

.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 88rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  background: $surface;
  color: $amber;
  border: 3rpx solid $amber-light;
  letter-spacing: 1rpx;
  white-space: nowrap;

  &::after {
    display: none;
  }
}

.btn-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 88rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(135deg, $sage 0%, #5A8A6A 100%);
  color: #fff;
  border: none;

  &::after {
    display: none;
  }
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 88rpx;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: 600;
  background: $surface;
  color: $danger;
  border: 3rpx solid $danger;

  &::after {
    display: none;
  }
}

.btn-sm {
  padding: 14rpx 28rpx;
  height: auto;
  font-size: 24rpx;
  width: auto;
  border-radius: 16rpx;
}

/* Badge styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 20rpx;
  border-radius: 40rpx;
  font-size: 22rpx;
  font-weight: 600;
}
.badge-pending { background: #FFF0E8; color: $coral; }
.badge-confirmed { background: #E8F2EC; color: $sage; }
.badge-modified { background: #EBF2F8; color: $sky; }
.badge-settled { background: #F4EEF6; color: $plum; }
.badge-rejected { background: #FDEEEE; color: $danger; }

/* Form styles */
.form-group {
  margin-bottom: 36rpx;
}
.form-label {
  font-size: 26rpx;
  color: $ink-soft;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}
.form-input {
  width: 100%;
  height: 88rpx;
  border: 3rpx solid $cream-deep;
  border-radius: $radius-sm;
  padding: 0 28rpx;
  font-size: 28rpx;
  background: $cream;
  color: $ink;
  box-sizing: border-box;
}

/* List item styles */
.list-item {
  background: $surface;
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid $cream;
}
.list-item:last-child { border-bottom: none; }

/* Icon container */
.icon-box {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 24rpx;
}
.icon-box image {
  width: 44rpx;
  height: 44rpx;
}

/* Safe area for custom tab bar */
.safe-bottom {
  padding-bottom: calc(160rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

/* TabBar 高度占位 —— 用于仅有 TabBar 的页面底部 */
.tab-bar-clearance {
  height: calc(160rpx + constant(safe-area-inset-bottom));
  height: calc(160rpx + env(safe-area-inset-bottom));
}

/* TabBar 高度占位 + 底部操作栏 —— 用于有底部按钮 + TabBar 的页面 */
.tab-bar-clearance-with-bar {
  height: calc(300rpx + constant(safe-area-inset-bottom));
  height: calc(300rpx + env(safe-area-inset-bottom));
}
</style>
