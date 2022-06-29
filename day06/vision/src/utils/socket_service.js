// 对外导出一个类
export default class SocketService {
    /*
    单例模式
    */
    static instance = null
    static get Instance () { // Instance函数前面使用get后，在调动它时不需要带()
      if (!this.instance) {
        this.instance = new SocketService()
      }
      return this.instance
    }

    // 和服务端连接的socket对象
    ws = null

    // 存储回调函数
    callBackMapping = {}

    // 标识是否连接成功
    connected = false

    // 记录尝试发送的次数
    sendRetryCount = 0

    // 重连的次数
    connectRetryCount = 0

    // 定义连接服务器的方法
    connect () {
      // 连接服务器
      if (!window.WebSocket) {
        return console.log('浏览器不支持WebSocket')
      }
      this.ws = new WebSocket('ws://localhost:3344')

      // 连接成功的事件
      this.ws.onopen = () => {
        console.log('连接服务器成功')
        this.connected = true
        // 重置重新连接的次数
        this.connectRetryCount = 0
      }

      // 得到从服务端发送过来的数据
      this.ws.onmessage = msg => {
        console.log('从服务端获取到数据')
        // 真正从服务端发送过来的原始数据是在msg的data字段中
        // console.log(msg.data)
        const receiveData = JSON.parse(msg.data) // 在接收服务器数据时一般是字符串。使用JSON.parse()方法将数据转换为JavaScript对象
        const socketType = receiveData.socketType

        // 判断回调函数是否存在
        if (this.callBackMapping[socketType]) {
          const action = receiveData.action
          if (action === 'getData') {
            const realData = JSON.parse(receiveData.data)
            this.callBackMapping[socketType].call(this, realData) // this指SocketService
          } else if (action === 'fullScreen') {
            this.callBackMapping[socketType].call(this, receiveData)
          } else if (action === 'themeChange') {
            this.callBackMapping[socketType].call(this, receiveData)
          }
        }
      }

      // 1.直接连接服务器失败; 2.连接成功以后，服务器关闭情况 断开重连机制
      this.ws.onclose = () => {
        console.log('连接服务器失败或中断')
        this.connected = false
        this.connectRetryCount++
        setTimeout(() => {
          this.connect()
        }, this.connectRetryCount * 200)
      }
    }

    // 回调函数的注册
    registerCallBack (socketType, callBack) {
      this.callBackMapping[socketType] = callBack
    }

    // 取消某一个回调函数
    unRegisterCallBack (socketType) {
      this.callBackMapping[socketType] = null
    }

    // 发送数据的方法
    send (data) {
      // 判断是否连接成功 重发数据机制
      if (this.connected) {
        this.sendRetryCount = 0
        this.ws.send(JSON.stringify(data)) // data可能是对象，需要转变成字符串形式
      } else {
        this.sendRetryCount++
        // 每隔200毫秒试探连接发送
        setTimeout(() => {
          this.send(data)
        }, this.sendRetryCount * 200)
      }
    }
}
