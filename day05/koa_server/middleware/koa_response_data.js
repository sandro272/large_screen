// 处理业务逻辑的中间件,读取某个json文件的数据
const path = require('path')
const fileUtils = require('../utils/file_utils')

module.exports = async (ctx, next) => {
	// 获取URL请求路径 根据url  http://127.0.0.1:3333/api/seller 
	const url = ctx.request.url    // /api/seller    转变成    ../data/seller.json
	// console.log(url)             // 端口之后的那段路径  
	let filePath = url.replace('/api', '')          //   /seller
	filePath = '../data' + filePath + '.json'       // ../data/seller.json
	filePath = path.join(__dirname, filePath)      // 动态获取绝对路径 
	try {
		const res = await fileUtils.getFileJsonData(filePath)
		ctx.response.body = res

	} catch (error) {
		const errorMsg = {
			message: '读取文件内容失败, 文件资源不存在',
            status: 404
		}
		// JSON的常规用途是同web服务器进行数据交换。在向web服务器发送数据时，数据必须是字符串。通过 JSON.stringify() 把 JavaScript 对象转换为字符串。
		ctx.response.body = JSON.stringify(errorMsg)
	}
    console.log(filePath)    // http://localhost:3333/api/hahah
	await next()

}