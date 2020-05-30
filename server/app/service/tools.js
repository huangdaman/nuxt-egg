'use strict';
const { Service } = require('egg');
const nodemailer = require('nodemailer');
const fse = require('fs-extra');
const path = require('path');

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
  async mergeFile(filePath, hash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, hash); // 切片的文件夹
    console.log(chunkDir);
    let chunks = await fse.readdir(chunkDir);
    console.log(111);
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    chunks = chunks.map(cp => path.resolve(chunkDir, cp));
    await this.mergeChunks(chunks, filePath, size);
  }
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fse.createReadStream(filePath);
      readStream.on('end', () => {
        fse.unlinkSync(filePath);
        resolve();
      });
      readStream.pipe(writeStream);
    });

    await Promise.all(
      files.map((file, index) => {
        return pipStream(file, fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }));
      })
    );
  }
}

module.exports = ToolService;
