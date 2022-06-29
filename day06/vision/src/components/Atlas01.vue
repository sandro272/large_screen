<template>
  <div class = "com-container" @dblclick = 'revertMap'>
    <div class = "com-chart" ref = "atlas_ref"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
  data () {
    return {
      chartInstance: null,
      // 服务器返回的数据
      allData: null,
      // 所获取的省份的地图矢量数据
      mapData: {}
    }
  },

  created () {
    this.$socket.registerCallBack('atlasData', this.getData)
  },

  mounted () {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    // created 在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图
    // mounted在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'atlasData',
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    // 在页面加载完成的时候, 主动进行屏幕的适配
    this.screenAdapter()
  },

  // 销毁组件
  destroyed () {
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('atlasData')
  },

  methods: {
    // 初始化echartInstance对象
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.atlas_ref, 'chalk')

      // 获取中国的矢量图
      // http://localhost:4444/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于KOA2的后台, 所以咱们不能使用this.$http.get
      const res = await axios.get('http://localhost:4444/static/map/china.json')
      // console.log(res.data)
      this.$echarts.registerMap('china_map', res.data)
      const initOption = {
        title: {
          text: '商家分布',
          left: 25,
          top: 30
        },
        geo: {
          type: 'map',
          map: 'china_map',
          top: '5%',
          bottom: '%5',
          itemStyle: {
            // 地图颜色
            areaColor: '#2E72BF',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical' // 将黄金、白金、砖石由横向变为纵向
        }
      }
      this.chartInstance.setOption(initOption)

      // 点击效果
      // this.chartInstance.on('click', (arg) => {
      this.chartInstance.on('click', async arg => {
        // console.log('点击我！')
        // console.log(arg)
        // arg.name 得到所点击的省份, 这个省份他是中文
        // console.log(arg.name)
        const provinceInfo = getProvinceMapInfo(arg.name)
        console.log(provinceInfo)
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const result = await axios.get('http://localhost:4444/' + provinceInfo.path)
          // console.log(result)
          // console.log(result.data)
          this.mapData[provinceInfo.key] = result.data
          console.log(this.mapData)
          this.$echarts.registerMap(provinceInfo.key, result.data)
        }
        const changeClickOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeClickOption)
      })
    },

    // 获取数据
    getData (ret) {
      // const { data: ret } = await this.$http.get('map')
      this.allData = ret
      console.log(ret)
      this.updateChart()
    },

    // 更新图表
    updateChart () {
      // 处理图表需要的数据
      // 图例标题数据
      const legendArr = this.allData.map((item) => {
        return item.name
      })
      const seriesArr = this.allData.map((item) => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        return {
          type: 'effectScatter',
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo',
          rippleEffect: {
            scale: 10,
            brushType: 'stroke'
          }
        }
      })
      const dataOption = {
        series: seriesArr,
        legend: {
          data: legendArr
        }
      }
      this.chartInstance.setOption(dataOption)
    },

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter () {
      const titleFontSize = this.$refs.atlas_ref.offsetWidth / 100 * 3.6
      const screenOption = {
        title: {
          titleStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemStyle: {
            fontSize: titleFontSize / 2
          },
          itemGap: titleFontSize / 2
        }
      }
      this.chartInstance.setOption(screenOption)
      this.chartInstance.resize()
    },

    // 双击回到中国地图
    revertMap () {
      const revertOption = {
        geo: {
          map: 'china_map'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
