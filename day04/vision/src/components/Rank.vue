<template>
  <div class = "com-container">
    <div class = "com-chart" ref = "rank_ref"> </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: [],
      startValue: 0, // 区域缩放的起点值
      endValue: 8, // 区域缩放的终点值
      timeId: null // 定时器的标识
    }
  },

  mounted () {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配
    this.screenAdapter()
  },

  // 销毁组件
  destroyed () {
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
  },

  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, 'chalk')

      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎ 地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '30%',
          left: '8%',
          right: '8%',
          bottom: '5%',
          containLabel: true
        },

        tooltip: {
          show: true
        },

        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }

      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },

    // 获取数据
    async getData () {
      // 不加await获取的数据是Promise类型
      const { data: res } = await this.$http.get('rank')
      // console.log(res)
      this.allData = res
      this.allData.sort((a, b) => {
        // return a.value - b.value // 从小到大排序
        return b.value - a.value // 从大到小
      })
      this.updateChart()
      this.startInterval()
    },

    // 更新图表
    updateChart () {
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      // 处理图表需要的数据
      // 所有省份所形成的数组
      const provinceName = this.allData.map((item) => {
        return item.name
      })
      const provinceData = this.allData.map((item) => {
        return item.value
      })
      const dataOption = {
        xAxis: {
          data: provinceName
        },
        series: [
          {
            data: provinceData,
            itemStyle: {
              color: arg => {
                // console.log(arg)
                // return 'blue'
                // return console.log(arg.data)
                let gradualColorChange = null
                if (arg.data > 300) {
                  gradualColorChange = colorArr[0]
                } else if (arg.data > 180) {
                  gradualColorChange = colorArr[1]
                } else {
                  gradualColorChange = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: gradualColorChange[0]
                  },
                  {
                    offset: 1,
                    color: gradualColorChange[1]
                  }
                ])
              }
            }
          }
        ],
        // 区域缩放
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        }
      }
      this.chartInstance.setOption(dataOption)
    },
    // 动态刷新,2秒刷新一次

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.seller_ref.offsetWidth) 3.6是经验值
      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const screenOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize * 1.2,
            itemStyle: {
              // 边角变成圆形 左右上下四个方向
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(screenOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    // 每隔2秒向左移动
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
