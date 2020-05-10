'use strict';
const BaseController = require('./base');
const md5 = require('md5');
const HashSalt = ':KKBhub';
const jwt = require('jsonwebtoken');

const createRule = {
  email: { type: 'email' },
  password: { type: 'string' },
  captcha: { type: 'string' },
  name: { type: 'string' },
};

const loginRule = {
  email: { type: 'email' },
  password: { type: 'string' },
  captcha: { type: 'string' },
};

class UserController extends BaseController {
  async login() {
    const { ctx, app } = this;
    try {
      ctx.validate(loginRule);
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors);
    }
    const { email, password, captcha, emailcaptcha } = ctx.request.body;

    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误');
    }

    if (emailcaptcha !== ctx.session.emailcode) {
      return this.error('邮箱验证码错误');
    }

    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt),
    });
    if (!user) {
      return this.error('密码或用户名错误');
    }

    const token = jwt.sign({
      _id: user.id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '1h',
    });

    this.success({
      token,
      name: user.name,
      email,
    });

  }

  async register() {
    const { ctx } = this;
    try {
      ctx.validate(createRule);
    } catch (e) {
    //   console.log(e);
      return this.error('参数校验失败', -1, e.errors);
    }

    const { email, password, captcha, name } = ctx.request.body;

    console.log(ctx.session.captcha);
    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {
      // 邮箱是否重复
      if (await this.checkEmail(email)) {
        this.error('邮箱重复了');
      } else {
        const ret = await ctx.model.User.create({
          email,
          name,
          password: md5(password + HashSalt),
        });
        if (ret.id) {
          this.message('注册成功');
        } else {
          this.error('注册失败');
        }
      }
    } else {
      return this.error('验证码错误');
    }


  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }

  async verify() {
    // 校验用户名是否存在
  }

  async info() {
    const { ctx } = this;
    const { email } = ctx.state;
    const user = await this.checkEmail(email);
    this.success(user);
  }
}

module.exports = UserController;
