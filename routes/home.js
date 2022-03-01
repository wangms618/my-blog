// router/home.js
module.exports = {
  async index(ctx, next) {
    // render会自动到views下面去找对应叫index的html
    await ctx.render('index', {
      title: '我的博客',
      desc:'欢迎来到老鱼的博客'
    })
  }
}