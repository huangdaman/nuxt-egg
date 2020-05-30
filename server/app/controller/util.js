'use strict';

const captcha = require('svg-captcha');
const baseController = require('./base');
const fse = require('fs-extra');
const path = require('path');

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
    const { name, hash } = ctx.request.body;
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath);
    }
    await fse.move(file.filepath, `${chunkPath}/${name}`);
    this.message('切片上传成功');
  }
  async mergefile() {
    const { ext, size, hash } = this.ctx.request.body;
    const filepath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    await this.ctx.service.tools.mergeFile(filepath, hash, size);
    this.success({
      url: filepath,
      message: '上传成功',
    });
  }
}

module.exports = UtilController;
