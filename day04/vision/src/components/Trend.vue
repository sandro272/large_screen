<template>
  <div class = "com-container">
    <div class = "title" :style = "comStyle">
      <!-- <span>我是标题</span> -->
      <!-- <span>下拉箭头</span> -->
      <span> {{ '▎' + showTitle }} </span>
      <!-- <span class = "iconfont title-arrow">&#xe6ed;</span> -->
      <span class = "iconfont title-arrow" :style = "comStyle" @click = "showChoice = !showChoice">&#xe6ed;</span>
      <div class = "select-con" v-show = "showChoice" :style = "marginStyle">
        <div class = "select-item" v-for = "item in selectTypes" :key = "item.key" @click = "handleSelect(item.key)"> {{ item.text }} </div>
        <!-- <div class = "select-item" v-for = "item in selectTypes" :key = "item.key"> {{ item.text }} </div> -->
        <!-- <div class = "select-item">标题二</div>
        <div class = "select-item">标题三</div> -->
      </div>
    </div>
    <div class = "com-chart" ref = "trend_ref"></div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 从服务器中获取的所有数据
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 默认在可选项显示的数据
      titleFontSize: 0 // 指明标题的字体大小
    }
  },

  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },

  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
  },

  computed: {
    selectTypes () {
      if (!this.allData) { // 如果数据不存在
        return []
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType
        })
      }
    },

    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },

    // 设置给标题的属性
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },

    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },

  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, 'chalk')
      const initOption = {

        grid: {
          top: '40%',
          left: '4%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        // 标题
        legend: {
          top: '140',
          icon: 'circle',
          left: 20
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },

    async getData () {
      // 对allData进行赋值
      const { data: res } = await this.$http.get('trend')
      // map代表地区销量趋势
      // seller代表商家销量趋势
      // commodity代表商品销量趋势
      this.allData = res
      console.log(this.allData) // object下是type,type下有key和text
      this.updateChart()
    },

    updateChart () {
      // 半透明的颜色值
      const colorArr01 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr02 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 打开浏览器观察书写
      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      // const valuesArr = this.allData.map.data
      const valuesArr = this.allData[this.choiceType].data
      // 图表数据, 一个图表中显示5条折线图,加入颜色渐变后，加入
      // const seriesArr = valuesArr.map((item) => {
      const seriesArr = valuesArr.map((item, index) => {
        return {
          // 折线图
          type: 'line',
          name: item.name,
          data: item.data,
          // stack值相同, 可以形成堆叠图效果
          // stack: 'map',
          stack: this.choiceType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0, // %0的颜色值
                color: colorArr01[index]
              },
              {
                offset: 1, // 100%的颜色值
                color: colorArr02[index]
              }
            ])
          }
        }
      })
      // 准备图例数据, 它需要和series下的每个对象的name属性保持一致
      const legendArr = valuesArr.map((item) => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChoice = false
    }

  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  color: white;
  .title-arrow {
    margin-left: 5px;
    cursor: pointer;
  };
  .select-con {
    background: gray
  }

}
</style>
