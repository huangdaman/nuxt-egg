'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 定义好模型，然后在model中定义collection
  const UserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: false, default: 'user/png' },
  }, { timestamps: true });

  return mongoose.model('Users', UserSchema);
};
