import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import SocketService from '@/utils/socket_service'

// 引入字体样式
import './assets/font/iconfont.css'
// 引入全局的样式文件
import './assets/css/global.less'

// 对服务端进行WebSocket连接
SocketService.Instance.connect()

// 其他组件 this.$socket
Vue.prototype.$socket = SocketService.Instance

// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:3333/api/'

// 将axios挂载到Vue原型对象上
// 在别的组件中通过使用this.$http调用此对象，发起ajax请求
Vue.prototype.$http = axios

// 将全局echarts对象挂载到Vue原型对象上
// 在别的组件中使用this.$echarts调用此对象，
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
