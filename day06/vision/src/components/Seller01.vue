<!--商家销量统计的横向柱状图 -->
<template>
  <div class = "com-container">
    <div class = "com-chart" ref = "seller_ref"> </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: [],
      // 当前显示的页数
      currentPage: 1,
      // 一共多少页
      totalPage: 0,
      // 定时器的标识
      timeID: null
    }
  },

  mounted () {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    this.initChart()
    this.getData()
  },

  // 销毁组件
  destroyed () {
    // 定时器的取消
    clearInterval(this.timeID)
  },

  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, 'chalk')

      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeID)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInerval()
      })
    },

    // 获取数据
    async getData () {
      // http://127.0.0.1:8899/api/seller
      const { data: res } = await this.$http.get('seller')
      console.log(res)
      this.allData = res
      // 对数据进行排序，使用回调函数进行从小到大或者从大到小进行排序
      this.allData.sort((a, b) => {
        // a.value - b.value 从小到大排序
        return a.value - b.value
      })
      // 每5个元素显示一页,分页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : (this.allData.length / 5) + 1
      this.updateChart()
      // 启动定时器进行刷新
      this.startInerval()
    },

    // 更新图表
    updateChart () {
      const start = (this.currentPage - 1) * 5 //0
      const end = this.currentPage * 5 //5
      const showData = this.allData.slice(start, end)
      const sellerName = showData.map((item) => {
        return item.name
      })

      const sellerValue = showData.map((item) => {
        return item.value
      })

      const option = {
        title: {
          text: '商家销售统计',
          textStyle: {
            fontSize: 38
          },
          left: 20,
          top: 18
        },
        grid: {//坐标轴位置
          top: '23%',
          left: '10%',
          right: '10%',
          bottom: '12%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              width: 66,
              color: '#2D3443'
            }
          }
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: sellerName
        },
        series: [
          {
            type: 'bar',
            data: sellerValue,
            barWidth: 55,
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 顺时针，左上 ，右上，左下，右下
              barBorderRadius: [0, 25, 25, 0],
              // 指明颜色渐变的方向，此示例是从左往右
              // 指明不同百分比之下颜色的值
              // color: new this.$echarts.graphic.LinearGradient(x1, y1, x2, y2)
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 百分之0状态之下的颜色值
                {
                  offset: 0,
                  color: '#5052EE'
                },
                // 百分之100状态之下的颜色值
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }

      this.chartInstance.setOption(option)
    },
    // 动态刷新,2秒刷新一次
    startInerval () {
      if (this.timeID) {
        clearInterval(this.timeID)
      }
      this.timeID = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
