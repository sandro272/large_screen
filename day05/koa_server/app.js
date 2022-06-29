// 创建对象
const Koa = require('koa') // 导入构造方法
const app = new Koa() //通过构造方法，创建实例对象

// app.use((ctx, next) => {
// 	console.log(ctx.request.url)    // http://localhost:3333/
//  	ctx.response.body = 'hello'
//  })

// app.listen(3333)

// 绑定第一层中间件
const responseDurationMiddleware = require('./middleware/koa_response_duration')
app.use(responseDurationMiddleware)

// 绑定第二层中间件
const responseHeaderMiddleware = require('./middleware/koa_response_header')
app.use(responseHeaderMiddleware)

// 绑定第三层中间件
const responseDataMiddleware = require('./middleware/koa_response_data')
app.use(responseDataMiddleware)

app.listen(3333)

// const WebSocket = require('ws')
// // 创建WebSocket服务端对象，绑定的端口号为3344
// const wss = new WebSocket.Server({
// 	port: 3344
// })
// // 对客户端的连接事件进行监听
// // client：代表的是客户端连接socket的对象
// wss.on('connection', client => {
// 	console.log('有客户端连接成功')
// 	// 对客户端的连接对象进行message事件的监听
// 	client.on('message', msg => {
// 		console.log('客户端发送数据给服务端了： ' + msg)
// 		// 由服务端向客户端发送数据
// 		client.send('hello, socket from backend')
// 	})
// })

const webSocketService = require('./service/web_socket_service')
// 开启服务端的监听，监听客户端的连接
// 当某一个客户端连接成功之后，就会对这个客户端进行message时间的监听
webSocketService.listen()

