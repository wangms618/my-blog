const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = new Schema({
  name: {
    type: String,
    require: true,
    unique: true
  },
  title: {
    type: String,
    require: true,
  },
  desc: {
    type: String,
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    }
  }
})
// 通过 mongoose.model 往 mongodb数据库里面映射出一张User表
module.exports = mongoose.model('Category',CategorySchema)
