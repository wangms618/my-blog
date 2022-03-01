const CommentModel = require('../models/comment')
module.exports = {
  async create(ctx, next) {
    const {
      content
    } = ctx.request.body
    if (!content) {
      ctx.flash = {
        warning: '评论不能为空'
      }
      ctx.redirect('back')
      return
    }
    const comment = Object.assign(ctx.request.body, {
      from: ctx.session.user._id
    })
    await CommentModel.create(comment)
    ctx.falsh = {
      success: '留言成功'
    }
    ctx.redirect('back')
  },
  async delete(ctx, next) {
    const commentId = ctx.params.id
    if (commentId.length !== 24) {
      ctx.throw(404, '评论不存在')
    }
    const comment = await CommentModel.findById(commentId)
    if (!comment) {
      ctx.throw(404, '评论不存在')
      return
    }
    if (comment.from.toString() !== ctx.session.user._id.toString()) {
      ctx.flash = {
        warning: '没有权限'
      }
      ctx.redirect('back')
      return 
    }
    await CommentModel.findByIdAndRemove(commentId)
    ctx.flash = {
      success: '成功删除留言'
    }
    ctx.redirect('back')
  }

}
