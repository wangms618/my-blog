const CategoryModel = require('../models/category')
module.exports = {
  async list(ctx, next) {
    const categories = await CategoryModel.find({})
    await ctx.render('category', {
      title: '新建分类',
      categories
    })
  },
  async newCategory(ctx, next) {
    await ctx.render('create_category')
  },
  async addCategory(ctx, next) {
    console.log(ctx.request.body)
    const {
      name,
      title,
      desc
    } = ctx.request.body
    let errMsg = ''
    if (title === '') {
      errMsg = '分类标题不能为空'
    } else if (name === '') {
      errMsg = '分类名不能为空'
    } else if (desc === '') {
      errMsg = '描述不能为空'
    }
    const existed = await CategoryModel.findOne({
      name
    })
    if (existed) {
      ctx.flash = {
        warning: '分类已存在'
      }
      ctx.redirect('back')
      return
    }
    if (errMsg) {
      ctx.flash = {
        warning: errMsg
      }
      ctx.redirect('back')
      return
    } else { // 写入数据库
      const res = await CategoryModel.create(ctx.request.body)
      ctx.flash = {
        success: '分类已添加'
      }
      ctx.redirect('/category')
    }
  },
  async delete(ctx, next) {
    // console.log(ctx.params.id)
    const categoryId = ctx.params.id
    if (categoryId.length !== 24) {
      ctx.throw(404, '分类不存在')
    }
    const category = await CategoryModel.findById(categoryId)
    // console.log(category)
    if (!category) {
      ctx.throw(404, '分类不存在')
      return
    }
    await CategoryModel.findByIdAndRemove(categoryId)
    ctx.flash = {
      success: '成功删除分类'
    }
    ctx.redirect('back')
  },
  async change(ctx, next) {
    const categorys = await CategoryModel.findById(ctx.params.id)
    // console.log(categorys)
    await ctx.render('change_category', {
      name: categorys.name,
      title: categorys.title,
      desc: categorys.desc,
      id: categorys._id
    })
  },
  async changeEnd(ctx, next) {
    console.log(ctx.request.body, ctx.params.id)
    const {
      name,
      title,
      desc
    } = ctx.request.body
    let result = await CategoryModel.findByIdAndUpdate(ctx.params.id, {
      name,
      title,
      desc
    })
    ctx.flash = {
      success: '文章更新成功'
    }
    ctx.redirect('/category')
    // id已经拿到，数据也已经拿到，接下来就是修改mongodb数据库
  }
}
