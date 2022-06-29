<!--针对于 /sellerpage 这条路径而显示出来的在这个组件中, 通过子组件注册的方式, 要显示出Seller.vue这个组件 -->
<!-- views是页面级组件，components是小组件，小组件可被引用在views中，一般views组件不被复用【containers是容器级组件（根据项目大小决定是否使用） -->
<template>
  <div class = "com-page">
    <seller></seller>
  </div>
</template>

<script>
import Seller from '@/components/Seller'
// @/：表示 src目录下            ./：表示当前目录下
export default {
  data () {
    return {}
  },
  methods: {},
  components: {
    seller: Seller
  }
}
</script>

<style lang="less" scoped>
</style>
