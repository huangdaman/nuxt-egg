'use strict';

const captcha = require('svg-captcha');
const baseController = require('./base');
const fse = require('fs-extra');

class UtilController extends baseController {
  async captcha() {
    const code = captcha.create({
      size: 4,
    });
    const {
      ctx,
    } = this;
    // 存在session中，以便对前端传回的字符进行校验
    ctx.session.captcha = code.text;

    ctx.response.type = 'image/svg+xml';
    ctx.body = code.data;
  }
  async sendcode() {
    const { ctx } = this;
    const email = ctx.query.email;
    const code = Math.random().toString().slice(2, 6);
    console.log(`邮箱${email} 验证码：${code}`);

    ctx.session.emailcode = code;

    const subject = '开课吧验证码';
    const text = '';
    const html = `<h2>小开社区</h2><a href="https://www.baidu.com"><span>${code}</span></a>`;
    const hasSend = await this.service.tools.sendEmail(email, subject, text, html);
    if (hasSend) {
      this.success('发送成功');
    } else {
      this.success('发送失败');
    }
  }
  async uploadfile() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { name } = ctx.request.body;
    console.log(file, name);
    await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename);
    this.success({
      url: `/public/${file.filename}`,
    });
  }
}

module.exports = UtilController;
