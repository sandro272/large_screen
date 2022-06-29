// 1.创建koa对象
const Koa = require("koa")
const app = new Koa()

// 2.编写响应函数(中间件)
// ctx:上下文,web容器,ctx.request ctx.response
// next: 下一个中间件,下一层中间件是否能够得到执行, 取决于next这个函数有没有被调用
app.use((ctx, next) => {
	console.log("第一层中间件.....01")
	ctx.response.body = "hello world"
	next()
	console.log("第一层中间件....02")
})

app.use(async (ctx, next) => {
	console.log("第二层中间件......01")
	const res = await next()
	console.log(res)
	console.log("第二层中间件.......02")
})

app.use((ctx, next) => {
	console.log("第三层中间件")
	return "I love you "


})

app.listen(3000)