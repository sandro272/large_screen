// 1. 创建koa对象
const Koa = require("koa")
const exam = new Koa()

// 2. 编写响应函数（中间件）
// ctx: 上下文,web容器,ctx.request ctx.response
// next: 下一个中间件,下一层中间件是否能够得到执行, 取决于next这个函数有没有被调用
exam.use((ctx, next) => {
	console.log(ctx.request.url)
	ctx.response.body = "hello world"
})


// 3. 绑定端口号 3000    使用node example.js启动服务器  浏览器中输入127.0.0.1:3000
exam.listen(3000)