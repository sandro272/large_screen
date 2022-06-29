<template>
  <div class = "com-container">
    <div class = "com-chart" ref = "hot_ref"> </div>
    <!--向左向右的箭头 -->
    <span class = "iconfont arrow-left" @click = "toLeft" :style = "comStyle"> &#xe6eb; </span>
    <span class = "iconfont arrow-right" @click = "toRight" :style = "comStyle"> &#xe6ee; </span>
    <span class = "cat-name" :style = "comStyle"> {{ catName }} </span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: null,
      // 当前所展示出的一级分类数据
      firstTypeIndex: 0,
      titleFontSize: 0
    }
  },

  created () {
    this.$socket.registerCallBack('hotData', this.getData)
  },

  mounted () {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hotproduct',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配
    this.screenAdapter()
  },

  computed: {
    catName () {
      // 如果数据不存在，返回空
      if (!this.allData) {
        return ''
      }
      return this.allData[this.firstTypeIndex].name
    },
    // 绑定箭头等需要的属性
    comStyle () {
      return {
        fontSize: this.titleFontSize / 1.2 + 'px'
      }
    }
  },

  // 销毁组件
  destroyed () {
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('hotData')
  },

  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, 'chalk')

      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎ 热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '14%',
          icon: 'circle' // 图例图标的显示
        },
        tooltip: {
          show: true,
          // formatter: 'haha'
          // formatter: () => {
          //   return 'hehe'
          // }
          formatter: (arg) => {
            console.log(arg) // 显示的是二级分类类别
            // return 'hehe'
            // 第三及类别
            const thirdCategory = arg.data.children
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let resStr = ''
            thirdCategory.forEach(item => {
              // 使用模板字符串拼接(简化字符串的拼接)：用反引号表示模板，模板中的内容可以有格式，通过${}方式填充数据。
              // 语法：`字符串内容${变量}字符串内容`。``为波浪线那个键的符号
              // resStr += `三级分类的名称：三级分类的百分比`
              resStr += `${item.name}: ${parseInt(item.value / total * 100) + '%'}<br/>`
            })
            return resStr
          }
        },
        series: [
          {
            type: 'pie',
            label: { // 隐藏标题文字
              show: false
            },
            emphasis: { // 高亮状态下的显示
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }

      this.chartInstance.setOption(initOption)
    },

    // 获取数据
    getData (res) {
      // const { data: res } = await this.$http.get('hotproduct')
      // console.log(res) // data由女装(裙装(套装裙、A字裙、复古连衣裙)、女士上衣、外套等六个组成)、手机数码、美妆护肤三个组成
      this.allData = res
      console.log(this.allData)
      this.updateChart()
    },

    // 更新图表
    updateChart () {
      const legendData = this.allData[this.firstTypeIndex].children.map((item) => {
        //  console.log(item)
        // console.log(item.children)
        return item.name
      })
      const seriesData = this.allData[this.firstTypeIndex].children.map((item) => {
        // console.log(item.name) // 二级分类:裙装、女士上衣、外套、裤装
        return {
          name: item.name,
          value: item.value,
          // 新增加children的原因是为了在tooltip中的formatter的回调函数中,来拿到这个二级分类下的三级分类数据
          // haha: 'xiaoming'
          children: item.children
        }
      })
      const dataOption = {
        series: [
          {
            data: seriesData
          }
        ],
        legend: {
          data: legendData
        }
      }
      this.chartInstance.setOption(dataOption)
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.hot_ref.offsetWidth) 3.6是经验值
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的配置项
      const screenOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize / 1.1,
          itemHeight: this.titleFontSize / 1.1,
          itemGap: this.titleFontSize / 1.2,
          textStyle: {
            fontSize: this.titleFontSize / 1.4
          }
        },
        series: [
          {
            radius: this.titleFontSize * 3.5, // 控制圆环大小
            // 控制饼图中心的位置 [x,y]
            center: ['50%', '50%']
          }
        ]
      }
      this.chartInstance.setOption(screenOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    toLeft () {
      this.firstTypeIndex--
      if (this.firstTypeIndex < 0) {
        this.firstTypeIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight () {
      this.firstTypeIndex++
      if (this.firstTypeIndex > this.allData.length - 1) {
        this.firstTypeIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang="less" scoped>
.arrow-left {
  position: absolute;
  left: 10%;
  top: 50%;
  /* transform: translateY(-50%);偏移量 */
  cursor: pointer;
  color: white;
}

.arrow-right {
  position: absolute;
  right: 10%;
  top: 50%;
  /* transform: translateY(-50%); Y轴的偏移量*/
  cursor: pointer;
  color: white;
}
/*小图标*/
.cat-name {
  position: absolute;
  left: 48%;
  bottom: 40px;
  color: white;
}
</style>
