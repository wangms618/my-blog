const router = require('koa-router')()

async function isLoginUser(ctx, next) {
  if (!ctx.session.user) {
    ctx.flash = {
      warning: '未登录，请先登录'
    }
    return ctx.redirect('/signin')
  }
  await next()
}

async function isAdmin(ctx, next) {
  if (!ctx.session.user) {
    ctx.flash = {
      warning: '未登录，请先登录'
    }
    return ctx.redirect('/signin')
  }
  if (!ctx.session.user.isAdmin) {
    ctx.flash = {
      warning: '没有权限'
    }
    return ctx.redirect('back')
  }
  await next()
}

module.exports = (app) => {
  router.get('/signup', require('./user').signup)
  router.post('/signup', require('./user').signup)
  router.get('/signin', require('./user').signin)
  router.post('/signin', require('./user').signin)
  router.get('/signout', require('./user').signout)
  router.get('/posts/new', isAdmin, isLoginUser, require('./posts').create)
  // 文章
  router.get('/', require('./posts').index)
  router.get('/posts', require('./posts').index)
  router.post('/posts/new', isLoginUser, require('./posts').create)
  router.get('/posts/:id', require('./posts').show)
  router.get('/posts/:id/edit', require('./posts').edit)
  router.post('/posts/:id/edit', require('./posts').edit)
  router.get('/posts/:id/delete',require('./posts').delete)

  // 评论
  router.post('/comments/new', isLoginUser, require('./comments').create)
  router.get('/comments/:id/delete', isLoginUser, require('./comments').delete)
  // 分类
  router.get('/category', isAdmin, require('./category').list)
  router.get('/category/new', isAdmin, require('./category').newCategory)
  router.post('/category/new', isAdmin, require('./category').addCategory)
  router.get('/category/:id/delete', isAdmin, require('./category').delete)
  router.get('/category/:id/change', isAdmin, require('./category').change)
  router.post('/category/:id/change', isAdmin, require('./category').changeEnd)
  app.use(router.routes())
    .use(router.allowedMethods())
  app.use(async (ctx, next) => {
    await ctx.render('404', {
      title: 'page not find'
    })
  })
}
