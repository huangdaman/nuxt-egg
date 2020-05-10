'use strict';
const { Service } = require('egg');
const nodemailer = require('nodemailer');

const userEmail = 'huangdm1192@163.com';
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'zelin0724',
  },
});

class ToolService extends Service {
  async sendEmail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      subject,
      text,
      html,
    };
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }

  }
}

module.exports = ToolService;
