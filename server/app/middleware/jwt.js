// 解析token的中间件，也可以用egg-jwt,自己封装更适合了解原理
'use strict';
const jwt = require('jsonwebtoken');
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    if (!ctx.request.header.authiruzation) {
      ctx.body = {
        code: -666,
        message: '用户没有登录',
      };
      return;
    }

    const token = ctx.request.header.authiruzation.replace('Bearer ', '');
    try {
      const res = await jwt.verify(token, app.config.jwt.secret);
      console.log('res', res);
      ctx.state.email = res.email;
      ctx.state.userId = res._id;
      await next();
    } catch (error) {
      console.log(error);
      if (error.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登录过期了',
        };
      } else {
        ctx.body = {
          code: -1,
          message: '用户信息出错',
        };
      }
    }
  };
};
