<template>
  <view class="agreement-page">
    <NavBar title="用户协议" :showBack="true" />
      <view class="agreement-content">
        <text class="update-date">更新日期：2026年2月1日</text>

        <text class="article-text">欢迎您使用「计工宝」（以下简称"本应用"）。本应用由 EternalHeart（以下简称"我们"）开发和运营。请您在使用本应用前仔细阅读本用户协议（以下简称"本协议"）。当您注册、登录或使用本应用时，即表示您已阅读、理解并同意接受本协议的全部内容。</text>

        <text class="article-title">一、服务说明</text>
        <text class="article-text">1.1 本应用是一款面向小型制造业企业的计件工资管理工具，提供工序管理、每日记工、工资结算等功能服务。</text>
        <text class="article-text">1.2 我们有权根据业务发展需要，在不另行通知的情况下，对本应用的服务内容进行变更、暂停或终止。</text>
        <text class="article-text">1.3 本应用的部分功能可能需要网络连接，由此产生的流量费用由您的网络运营商收取，与我们无关。</text>

        <text class="article-title">二、账号注册与管理</text>
        <text class="article-text">2.1 您在注册账号时应提供真实、准确、完整的信息，并在信息发生变更时及时更新。</text>
        <text class="article-text">2.2 您的账号和密码由您自行保管，因账号和密码泄露所导致的一切损失由您自行承担。</text>
        <text class="article-text">2.3 我们有权对您提供的注册信息进行审核，如发现信息不实，有权限制或终止您的账号使用。</text>
        <text class="article-text">2.4 您不得将账号转让、出售或出借给第三方使用。</text>

        <text class="article-title">三、用户行为规范</text>
        <text class="article-text">3.1 您承诺在使用本应用时遵守国家法律法规及相关政策，不得利用本应用从事任何违法违规活动。</text>
        <text class="article-text">3.2 您不得利用本应用发布、传播任何违法、有害、威胁、侮辱、诽谤、淫秽或其他不当内容。</text>
        <text class="article-text">3.3 您不得对本应用进行反向工程、反编译、反汇编或以其他方式试图获取本应用的源代码。</text>
        <text class="article-text">3.4 您不得利用技术手段干扰本应用的正常运行，或对本应用的系统和数据进行非法入侵。</text>

        <text class="article-title">四、数据与隐私</text>
        <text class="article-text">4.1 我们重视对您个人信息的保护，具体内容请参见《隐私政策》。</text>
        <text class="article-text">4.2 您在使用本应用过程中产生的数据（包括但不限于工作记录、工资数据等），由企业主和相关员工共同拥有使用权。</text>
        <text class="article-text">4.3 企业主对其企业内的数据管理承担主体责任，包括确保数据的准确性和合法性。</text>

        <text class="article-title">五、知识产权</text>
        <text class="article-text">5.1 本应用的所有内容，包括但不限于文字、图片、界面设计、版面框架、数据、程序代码等，均受中华人民共和国知识产权法律法规的保护。</text>
        <text class="article-text">5.2 未经我们书面许可，您不得以任何形式使���、复制、修改、传播、分发本应用的任何内容。</text>

        <text class="article-title">六、免责声明</text>
        <text class="article-text">6.1 本应用按"现状"提供服务，我们不对服务的及时性、安全性、准确性作出任何明示或暗示的保证。</text>
        <text class="article-text">6.2 因不可抗力、系统维护升级、第三方服务故障等原因导致的服务中断或数据丢失，我们不承担责任。</text>
        <text class="article-text">6.3 您使用本应用所产生的雇佣关系、工资纠纷等问题，由相关当事方自行协商解决，与我们无关。</text>
        <text class="article-text">6.4 本应用中的工资计算结果仅供参考，最终结算金额以企业主与员工双方确认为准。</text>

        <text class="article-title">七、协议修改与终止</text>
        <text class="article-text">7.1 我们有权根据需要修改本协议内容，修改后的协议将在本应用内公布，自公布之日起生效。</text>
        <text class="article-text">7.2 如您不同意修改后的协议，您有权停止使用本应用并注销账号。继续使用本应用则视为您接受修改后的协议。</text>
        <text class="article-text">7.3 您有权随时停止使用本应用，但之前产生的权利义务不受影响。</text>

        <text class="article-title">八、争议解决</text>
        <text class="article-text">8.1 本协议的订立、执行和解释均适用中华人民共和国法律。</text>
        <text class="article-text">8.2 因本协议引起的或与本协议有关的任何争议，双方应首先协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。</text>

        <text class="article-title">九、其他</text>
        <text class="article-text">9.1 本协议构成您与我们之间关于使用本应用的完整协议，取代之前的所有口头或书面协议。</text>
        <text class="article-text">9.2 本协议中任何条款被认定为无效或不可执行的，不影响其他条款的效力。</text>
        <text class="article-text">9.3 如您对本协议有任何疑问，请通过应用内的意见反馈功能与我们联系。</text>

        <view style="height: 60rpx;"></view>
      </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '../../components/NavBar.vue';
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.agreement-page {
  min-height: 100vh;
  background: $cream;
}

.agreement-content {
  padding: 24rpx 36rpx;
}

.update-date {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-bottom: 32rpx;
}

.article-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $ink;
  margin-top: 40rpx;
  margin-bottom: 16rpx;
}

.article-text {
  display: block;
  font-size: 26rpx;
  color: $ink-muted;
  line-height: 1.8;
  margin-bottom: 12rpx;
}
</style>
