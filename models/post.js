const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 设计文章的表模型
const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    // 关联，外键
    ref: 'User',
    require: true
  },
  title: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true
  },
  pv: {
    type: Number,
    default: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})


PostSchema.pre('save', function (next) {
  if (this.isNew) {
    // 初次保存
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    // 监听文章是否初次保存
    this.meta.updateAt = Date.now()
  }
  next()
})

module.exports = mongoose.model('Post', PostSchema)
