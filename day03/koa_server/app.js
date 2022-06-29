// 服务器的入口文件
// 创建KOA的实例对象
const Koa = require("koa")
const app = new Koa()

// 绑定中间件
// 绑定第一层中间件
const responDurationMiddleware = require('./middleware/koa_response_duration')
app.use(responDurationMiddleware)

// 绑定第二层中间件
const responHeaderMiddleware = require('./middleware/koa_response_header')
app.use(responHeaderMiddleware)


// 绑定第三层中间件
const responDateMiddleware = require('./middleware/koa_response_data')
app.use(responDateMiddleware)


// 3.绑定端口号 
app.listen(8888)