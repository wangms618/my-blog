


const Koa = require('koa')
const path = require('path')
// 引入router文件夹的index
const router = require('./routes/index')
const views = require('koa-views') // 处理模板引擎
const serve = require('koa-static') // 处理静态资源，比如图片
const mongoose = require('mongoose')
const CONFIG = require('./config/config')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const flash = require('./middlewares/flash')

// mongoose.set('useCreateIndex', true) ;

mongoose.connect(CONFIG.mongodb) // 连接上mongodb


const app = new Koa()
app.use(flash())


// 使用模板引擎
app.use(views(path.join(__dirname, 'views'), {
  map: {
    html: 'nunjucks'
  }
}))
// 引入静态资源
app.use(serve(
  path.join(__dirname, 'public')
))
// 操作session会话
app.keys = ['somethings']
app.use(session({
  key: CONFIG.session.key,
  maxAge:CONFIG.session.maxAge
},app))

app.use(bodyParser())

app.use(async (ctx, next) => {
  ctx.state.ctx = ctx
  await next()
})

// 将koa实例传入routes文件夹的index.js文件中
router(app)

app.listen(3000, () => {
  console.log('服务在3000已启动');
})
