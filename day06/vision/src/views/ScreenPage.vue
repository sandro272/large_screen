<template>
  <div class = "screen-container" :style = "containerStyle">
    <header class = "screen-header">
      <div>
        <!-- <img src = "/static/img/header_border_dark.png" alt=""> -->
        <img :src = "headerSrc" alt="">
      </div>
      <span class = "logo">
        <!-- <img src = "/static/img/logo_dark.jfif" alt = ""> -->
        <img :src = "logoSrc" alt = "">
      </span>
      <span class = "title">大屏展示平台</span>
      <div class = "title-right">
        <!-- <img src = "/static/img/qiehuan_dark.png" class="switch" @click = "handleChangeTheme"> -->
        <img :src = "themeSrc" class="switch" @click = "handleChangeTheme">
        <!-- <span class = "datetime">2021-01-01 00:00:00</span> -->
        <span class = "datetime">{{ dateFormat(newDate) }}</span>
      </div>
    </header>
    <div class = "screen-body">
      <section class ="screen-left">
        <!-- 动态属性绑定:class -->
        <div id = "left-top" :class = "[fullScreenStatus.trend ? 'fullscreen' : '']">
          <!-- 销量趋势图表 -->
          <Trend ref = "trend"></Trend>
          <!-- 右上角增加小图标 -->
          <div class = "resize">
            <span @click= "changeSize('trend')" :class = "['iconfont ', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class = "[fullScreenStatus.seller ? 'fullscreen' : '']">
          <!-- 商家销售金额图表 -->
          <Seller ref = "seller"></Seller>
           <!-- 右上角增加小图标 -->
          <div class = "resize">
            <!--<span class = "iconfont icon-expand-alt"></span>-->
            <span @click= "changeSize('seller')" :class = "['iconfont ', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class = "screen-middle">
        <div id = "middle-top" :class = "[fullScreenStatus.atlas ? 'fullscreen' : '']">
          <!-- 商家分布图表 -->
          <Atlas ref = "atlas"></Atlas>
           <!-- 右上角增加小图标 -->
          <div class = "resize">
            <span @click= "changeSize('atlas')" :class = "['iconfont ', fullScreenStatus.atlas ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id = "middle-bottom" :class = "[fullScreenStatus.rank ? 'fullscreen' : '']">
          <!-- 地区销量排行图表 -->
          <Rank ref = "rank"></Rank>
           <!-- 右上角增加小图标 -->
          <div class = "resize">
            <span @click= "changeSize('rank')" :class = "['iconfont ', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class = "screen-right">
        <div id="right-top" :class = "[fullScreenStatus.hot ? 'fullscreen' : '']">
          <!-- 热销商品占比图表 -->
          <Hot ref = "hot"></Hot>
           <!-- 右上角增加小图标 -->
          <div class = "resize">
            <span @click= "changeSize('hot')" :class = "['iconfont ', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id = "right-bottom" :class = "[fullScreenStatus.stock ? 'fullscreen' : '']">
          <!-- 库存销量分析图表 -->
          <Stock ref = "stock"></Stock>
           <!-- 右上角增加小图标 -->
          <div class = "resize">
            <span @click= "changeSize('stock')" :class = "['iconfont ', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import Atlas from '@/components/Atlas'
import Hot from '@/components/Hot'
import Rank from '@/components/Rank'
import Seller from '@/components/Seller'
import Stock from '@/components/Stock'
import Trend from '@/components/Trend'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils' // 主题切换
export default {
  data () {
    return {
      // 当前时间
      newDate: new Date(),
      timer: null,
      // 全局数据进行定义，定义每一个图表的全屏状态
      fullScreenStatus: {
        trend: false,
        atlas: false,
        hot: false,
        rank: false,
        seller: false,
        stock: false
      }
    }
  },
  created () {
    // 注册接收到数据的回调函数
    this.$socket.registerCallBack('fullScreen', this.receiveData)
    this.$socket.registerCallBack('themeChange', this.receiveThemeChange)
  },
  mounted () {
    this.timer = setInterval(function () {
      this.newDate = new Date().toLocaleString()
    })
  },
  destroyed () {
    this.$socket.unRegisterCallBack('fullScreen')
    this.$socket.unRegisterCallBack('themeChange')
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    changeSize (chartName) {
      // 1. 改变fullScreenStatus的数据
      // this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName] // 取反操作
      // 2. 需要调用每一个图表组件的screenAdapter方法
      // this.$refs[chartName].screenAdapter()  targetValue是将要变成的目标状态
      // this.$nextTick(() => {
      //   this.$refs[chartName].screenAdapter()
      // })
      // 将数据发送给服务端
      const targetValue = !this.fullScreenStatus[chartName]
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: chartName,
        value: targetValue
      })
    },
    // 接收到全屏数据之后的处理
    receiveData (data) {
      // 取出是哪一个图表需要进行切换
      const chartName = data.chartName
      // 取出，切换成什么状态
      const targetValue = data.value
      this.fullScreenStatus[chartName] = targetValue
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })
    },
    handleChangeTheme () {
      // 修改VueX中的数据
      // this.$store.commit('changeTheme')
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    receiveThemeChange () {
      this.$store.commit('changeTheme')
    },
    // 时间格式化
    dateFormat () {
      let week = null
      let weekArr = null
      var date = new Date()
      var year = date.getFullYear()
      // 在日期格式中，月份是从0开始的
      // 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
      var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      week = date.getDay() // 星期
      weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      // 拼接 时间格式处理
      return year + '年' + month + '月' + day + '日 ' + hours + ':' + minutes + ':' + seconds + ' ' + weekArr[week]
    }
  },
  computed: {
    headerSrc () {
      return '/static/img/' + getThemeValue(this.theme).header_BorderSrc
    },
    logoSrc () {
      return '/static/img/' + getThemeValue(this.theme).logoSrc
    },
    themeSrc () {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    containerStyle () {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  components: {
    Atlas,
    Hot,
    Rank,
    Seller,
    Stock,
    Trend
  }
}
</script>

<style lang="less" scoped>
.screen-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding:0 15px;
  background-color: #161522;
  color: #fff;
  .screen-header {
    width: 100%;
    height: 60px;
    position: relative;
    font-size: 20px;
    > div {
      img {
        width: 100%;
      }
    }
    .logo {
      position: absolute;
      left: 0px;
      top: 40%;
      transform: translateY(-85%);
      img {
        height: 35px;
        width: 200px;
      }
    }
    .title {
      position: absolute;
      left: 50%;
      top: 30%;
      font-size: 30px;
      transform: translate(-50%, -50%);
    }
    .title-right {
      display: flex;
      align-items: center;
      position:absolute;
      right: 0px;
      top: 40%;
      transform: translateY(-80%);
      .switch {
        width: 28px;
        height: 21px;
        cursor: pointer;
      }
      .datetime {
        font-size: 15px;
        margin-left: 10px;
      }
    }
  }
  .screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;
    .screen-left {
      height: 100%;
      width: 27.6%;
      #left-top {
        height: 53%;
        position: relative;
      }
      #left-bottom {
        height: 31%;
        margin-top: 25px;
        position: relative;
      }
    }
    .screen-middle {
      height: 100%;
      width: 41.5%;
      margin-left: 1.6%;
      margin-right: 1.6%;
      #middle-top {
        width: 100%;
        height: 56%;
        position: relative;
      }
      #middle-bottom {
        margin-top: 25px;
        width: 100%;
        height: 28%;
        position: relative;
      }
    }
    .screen-right {
      height: 100%;
      width: 27.6%;
      #right-top {
        height: 46%;
        position: relative;
      }
      #right-bottom {
        height: 38%;
        margin-top: 25px;
        position: relative;
      }
    }
  }
}
.resize {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor:pointer
}
/*全屏样式的定义*/
.fullscreen {
  position: fixed!important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}
/*
边框的设置
section > div {
  border: 1px solid red
}
*/
</style>
