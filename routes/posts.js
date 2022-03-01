const CategoryModel = require('../models/category')
const PostModel = require('../models/post')
const CommentModel = require('../models/comment')
const marked = require('marked')

module.exports = {

  async index(ctx, next) {
    const pageSize = 5
    const currentPage = parseInt(ctx.query.page) || 1
    const cname = ctx.query.c
    let cid;
    if (cname) { // 返回对应的分类文章
      const category = await CategoryModel.findOne({
        name: cname
      })
      // console.log(category)
      if (!category) {
        ctx.throw(404, '该分类不存在')
      }
      cid = category._id
    }
    const query = cid ? {
      category: cid
    } : {}
    const allPostsCount = await PostModel.find(query).count()
    const pageCount = Math.ceil(allPostsCount / pageSize)
    const pageStart = currentPage - 2 > 0 ? currentPage - 2 : 1
    const pageEnd = pageStart + 4 >= pageCount ? pageCount : pageStart + 4
    const posts = await PostModel.find(query).sort({
      _id: -1
    }).skip((currentPage - 1) * pageSize).limit(pageSize)
    const baseUrl = cname ? `${ctx.path}?c=${cname}&page=` : `${ctx.path}?page=`
    await ctx.render('index', {
      title: 'JS',
      posts,
      pageSize,
      currentPage,
      allPostsCount,
      pageCount,
      pageStart,
      pageEnd,
      baseUrl
    })
  },

  async create(ctx, next) {
    if (ctx.method === 'GET') {
      const categories = await CategoryModel.find({})
      await ctx.render('create', {
        title: '新建文章',
        categories
      })
      return
    } else { // 发布文章
      const {
        title,
        content
      } = ctx.request.body
      let errMsg = ''
      if (title === '') {
        errMsg = '标题不能为空'
      } else if (content === '') {
        errMsg = '内容不能为空'
      }
      if (errMsg) {
        ctx.flash = {
          warning: errMsg
        }
        ctx.redirect('back')
        return
      } else { // 写入数据库
        const post = Object.assign(ctx.request.body, {
          author: ctx.session.user._id
        })
        const res = await PostModel.create(post)
        ctx.flash = {
          success: '文章发布成功'
        }
        ctx.redirect(`/posts/${res._id}`)
      }
    }
  },

  async show(ctx, next) {
    const postId = ctx.params.id
    if (postId.length !== 24) {
      ctx.throw(404, '该文章不存在或已被删除')
    }
    // 查找文章数据且将关联的表数据一并取到
    const post = await PostModel.findById(postId).populate([{
        path: 'author',
        select: 'name'
      },
      {
        path: 'category',
        select: ['title', 'name']
      },
    ])
    if (!post) {
      ctx.throw(404, '该文章不存在或已被删除')
    } else {
      const comments = await CommentModel.find({
        postId
      }).populate({
        path: 'from',
        select: 'name'
      })
      // 渲染文章详情模板
      let content = marked(post.content)
      comments.forEach(comment => {
        comment.content = marked(comment.content)
      })
      await ctx.render('post', {
        title: post.title,
        content,
        post,
        comments
      })
    }

  },
  async edit(ctx, next) {
    const postId = ctx.params.id
    const categories = await CategoryModel.find({})
    if (ctx.method === 'GET') {
      if (postId.length !== 24) {
        ctx.throw(404, '此文章不存在或已被删除')
      }
      const post = await PostModel.findById(postId)
      if (!post) {
        ctx.throw(404, '文章不存在或已被删除')
      }
      // if (post.author.toString() !== ctx.session.user_id.toString()) {
      //   ctx.throw(401,'没有权限')
      // }
      await ctx.render('edit', {
        title: '更新文章',
        post,
        categories
      })
    } else {
      const {
        title,
        content,
        category
      } = ctx.request.body
      let errMsg = ''
      if (title === '') {
        errMsg = '标题不能为空'
      } else if (content === '') {
        errMsg = '内容不能为空'
      }
      if (errMsg) {
        ctx.flash = {
          warning: errMsg
        }
        ctx.redirect('back')
        return
      }
      await PostModel.findByIdAndUpdate(postId, {
        title,
        content,
        category
      })
      ctx.flash = {
        success: '文章更新成功'
      }
      ctx.redirect(`/posts/${postId}`)
    }
  },
  async delete(ctx, next) {
    const postId = ctx.params.id
    if (postId.length !== 24) {
      ctx.throw(404, '文章不存在')
    }
    const post = await PostModel.findById(postId)
    // console.log(category)
    if (!post) {
      ctx.throw(404, '文章不存在')
      return
    }
    if (post.author.toString() !== ctx.session.user._id.toString()) {
      ctx.flash = { warning: '没有权限' }
      return
    }
    await PostModel.findByIdAndRemove(postId)
    ctx.flash = {
      success: '成功删除文章'
    }
    ctx.redirect('/')
  }

}
