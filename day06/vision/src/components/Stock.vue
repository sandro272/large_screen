<template>
  <div class = "com-container">
    <div class = "com-chart" ref = "stock_ref"> </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: [],
      // 显示当前数据的页面
      currentPage: 0,
      // 定时器
      timeId: 0
    }
  },

  mounted () {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配 此处将其放在个更新数据部分
    // this.screenAdapter()
  },

  created () {
    // 在组件创建完成之后，进行回调函数的注册 此处this.getData不能加()，加了等于调用函数
    this.$socket.registerCallBack('stockData', this.getData)
  },

  // 销毁组件
  destroyed () {
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
    this.$socket.unRegisterCallBack('stockData')
  },

  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)

      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎ 库存和销量分析',
          left: 20,
          top: 20
        }
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
    getData (res) {
      // const { data: res } = await this.$http.get('stock')
      console.log(res)
      this.allData = res
      this.updateChart()
      this.startInterval()
    },

    // 更新图表
    updateChart () {
      // 圆环中心坐标
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      // 1.const定义的变量不可以修改,而且必须初始化。
      // 2.var定义的变量可以修改,如果不初始化会输出undefined,不会报错。
      // 3.let是块级作用域,函数内部使用let定义后,对函数外部无影响。
      const start = this.currentPage * 5
      const end = (this.currentPage + 1) * 5
      // 处理图表需要的数据，每页展示出五个圆环
      // const showData = this.allData.slice(0, 5)
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          // radius: [115, 100],  // 增加兼容性
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
          labelLine: {
            show: false // 隐藏指示线
          },
          // 将下面的haha设置在圆环中心
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              // name: 'haha',
              name: item.name + '\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: 'gray'
              }
            }
          ]
        }
      })

      const dataOption = {
        series: seriesArr
      }

      this.chartInstance.setOption(dataOption)
      this.screenAdapter()
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.seller_ref.offsetWidth) 3.6是经验值
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2
      const outerRadius = innerRadius * 1.5
      // 和分辨率大小相关的配置项
      const screenOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.5 // 控制圆环内的字体大小
            }
          },
          {
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.5
            }
          },
          {
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.5
            }
          },
          {
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.5
            }
          },
          {
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.5
            }
          }
        ]
      }
      this.chartInstance.setOption(screenOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      // setInterval(() => {}, 4000)
      this.timeId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > 1) {
          this.currentPage = 0
        }
        // 更改完成currentPage之后需要更新界面
        this.updateChart()
      },
      4000)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
