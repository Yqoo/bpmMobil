<template>
  <div class="advertisment">
    <swiper
      height="250px"
      auto
      :show-dots="false"
      @on-index-change="indexChange"
    >
      <swiper-item
        v-for="img in imgList"
        :key="img"
        class="swiper-img"
      >
        <img :src="require(`@/assets/images/${img}.png`)">
      </swiper-item>
    </swiper>
    <x-button
      class="xbtn"
      :mini="true"
      type="primary"
      link="/customform"
      @click.native="() => UPDATE_ADS_STATUS(false)"
    >Advertisement</x-button>
    
  </div>
</template>

<script>

import { mapMutations } from 'vuex'
import { Swiper, SwiperItem } from 'vux'

export default {
  name: 'Advertisement',
  components: {
    Swiper,
    SwiperItem
  },
  data() {
    return {
      imgList: ['gt', 'tl', 'sj', 'gz']
    }
  },
  methods: {
    ...mapMutations([
      'UPDATE_ADS_STATUS'
    ]),
    indexChange(index) {
      console.log(index)
    }
  }
  
}
</script>

<style lang="less" scoped>
  .xbtn {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
  .advertisment {
    .vux-slider {
      margin-top: 50%;
    }
  }
  .swiper-img img {
    height: 100%;
    width: 100%;
  }
</style>

