<template>
  <div class="main-content-box">
    <view-box 
      ref="viewBox"
      :body-padding-top="isShowHeader ? '46px' : '0'"
      body-padding-bottom="55px"
    >
      <x-header
        v-show="isShowHeader"
        :left-options="leftOptions"
        slot="header"
        style="width:100%;position:absolute;left:0;top:0;z-index:100;"
      ></x-header>
      <transition
        @after-enter="$vux.bus && $vux.bus.$emit('vux:after-view-enter')"
        :name="viewTransition" 
      >
        <router-view class="router-view"></router-view>
      </transition>
      <tabbar v-show="isShowBottom">
        <tabbar-item>
          <span slot="label">Wechat</span>
        </tabbar-item>
        <tabbar-item show-dot>
          <span slot="label">Message</span>
        </tabbar-item>
        <tabbar-item selected>
          <span slot="label">Explore</span>
        </tabbar-item>
        <tabbar-item badge="2">
          <span slot="label">News</span>
        </tabbar-item>
      </tabbar>
    </view-box>
  </div>
</template>

<script>
import { ViewBox } from 'vux'
import { mapState } from 'vuex'

export default {
  name: "Layout",
  components: {
    ViewBox
  },
  data() {
    return {
      isShowHeader: true,
      isShowBottom: true
    }
  },
  computed: {
    ...mapState({
      isShowADS: state => state.isShowADS,
      route: state => state.route,
      path: state => state.route.path
    }),
    viewTransition () {
      return 'vux-pop-forward'
    },
    leftOptions () {
      return {
        showBack: this.route.path !== '/advertisement',
        backText: ''
      }
    }
  },
  watch: {
    isShowADS: {
      immediate: true,
      handler(bool) {
        this.isShowHeader = !bool
        this.isShowBottom = !bool
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .main-content-box {
    height: 100%;
  }
</style>