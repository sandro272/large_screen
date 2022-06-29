const path = require('path')
const fileUtils = require('../utils/file_utils')
const WebSocket = require('ws')

// 创建WebSocket服务端的对象，绑定端口号3344
const wss = new WebSocket.Server({
	port: 3344
})

// 创建listen函数，服务器开启监听
module.exports.listen = () => {
	wss.on('connection', client => {
	  console.log('客户端连接成功...')
	  client.on('message', async msg => {
		console.log('客户端发送数据给服务端...' + msg)
		let payload = JSON.parse(msg)
		const action = payload.action

		if (action === 'getData') {
			// payload.chartName可取trend、seller、map、rank、hot、stock
			// let filePath = '../data/' + payload.chartName + '.json'
			let filePath = `../data/${payload.chartName}.json`
			filePath = path.join(__dirname, filePath)

            // 需要在服务端获取到数据的基础上，增加data字段。 data所对应的值是某个json文件的内容
			const res = await fileUtils.getFileJsonData(filePath)
			payload.data = res
			client.send(JSON.stringify(payload))

		} else {
			// 原封不动的将所有接收到的数据转发给每一个处于连接状态的客服端   wss.clients代表所有客户端的连接
			wss.clients.forEach(client => {
				client.send(msg)
			})
		}

		// 由服务端向客户端发送数据
		// client.send('hello, socket from backend')
	  })
    })
}