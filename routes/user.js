const UserModel = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports = {
  //   注册
  async signup(ctx, next) {
    if (ctx.method === 'GET') {
      await ctx.render('signup', {
        title: '用户注册'
      })
      return
    }
    console.log('进入post');
    //生成加密规则
    const salt = bcrypt.genSaltSync(10); //加密十次
    let {
      name,
      email,
      password,
      repassword
    } = await ctx.request.body //把前端传给后端的数据都拿到
    // 输入用户名，如果用户名存在，或者
    name = name.replace(/\s+/g, "")
    password = password.replace(/\s+/g, "")
    email = email.replace(/\s+/g, "")
    repassword = repassword.replace(/\s+/g, "")
    const userSearch = await UserModel.findOne({name})
    const emailSearch = await UserModel.findOne({email})
    if (name && email && password && repassword) {
      if (userSearch !== null) {
        ctx.flash = {
          warning: '此用户名已使用!!!'
        }
        ctx.redirect('back')
        return
      } else if (password !== repassword) {
        ctx.flash = {
          warning: '重复密码有误!!!'
        }
        ctx.redirect('back')
        return
      } else if (emailSearch !== null) {
        ctx.flash = {
          warning: '此邮箱已注册过!!!'
        }
        ctx.redirect('back')
        return
      } else {
        password = await bcrypt.hash(password, salt) //通过hash方法对password重复加密十次
        const user = {
          name,
          email,
          password,
        }
        //存储到数据库
        await UserModel.create(user) //将数据填充到 model/user.js里面
        // ctx.body = result
        ctx.falsh = {
          warning:'注册成功，请登录'
        }
        ctx.redirect('/signin')
      }
    } else {
      ctx.flash = {
        warning: '请全部填写!!!'
      }
      ctx.redirect('back')
      return
    }

  },
  // 登录
  async signin(ctx, next) {
    if (ctx.method === 'GET') {
      await ctx.render('signin', {
        title: '登录'
      })
      return
    } else {
      const {
        name,
        password
      } = ctx.request.body
      const user = await UserModel.findOne({
        name
      })
      if (user && await bcrypt.compare(password, user.password)) {
        // 登录成功，在session里存储当前用户信息，供页面使用
        ctx.session.user = {
          _id: user._id,
          name: user.name,
          isAdmin: user.isAdmin,
          email: user.email
        }
        ctx.flash = {
          success: '登录成功'
        }
        ctx.redirect('/')
      } else {
        ctx.flash = {
          warning: '账户或密码错误'
        }
        ctx.redirect('back')
      }
    }
  },
  // 退出登录回到首页
  signout(ctx, next) {
    ctx.session.user = null
    ctx.flash = {
      warning: '退出登录'
    }
    // 重定向
    ctx.redirect('/')
  }
}
