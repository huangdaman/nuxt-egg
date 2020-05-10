<template>
  <div class="login-form">
    <el-form ref="loginForm" class="login-form" :rules="rules" :model="form" label-width="80px">
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" prefix-icon="el-icon-mobile" placeholder="邮箱" />
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input
          v-model="form.password"
          prefix-icon="el-icon-lock"
          type="password"
          placeholder="密码"
        />
      </el-form-item>

      <el-form-item prop="captcha" label="验证码">
        <el-col :span="18">
          <el-input v-model="form.captcha" col="8" placeholder="验证码" />
        </el-col>
        <el-col :span="2" />
        <el-col :span="4">
          <img col="1" :src="form.captchaSrc" alt @click="updateCaptcha">
        </el-col>
      </el-form-item>

      <el-form-item prop="emailcaptcha" label="邮箱验证码">
        <el-col :span="18">
          <el-input v-model="form.emailcaptcha" col="8" placeholder="邮箱验证码" />
        </el-col>
        <el-col :span="2" />
        <el-col :span="4">
          <el-button type="primary" :disabled="buttonCount > 0" @click="sendEmailCode">
            {{ sentText }}
          </el-button>
        </el-col>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="login">
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
const md5 = require('md5')
export default {
  layout: 'login',
  data () {
    return {
      buttonCount: 0,
      form: {
        name: 'name',
        email: '724996116@qq.com',
        password: '0',
        captcha: '',
        emailcaptcha: '',
        captchaSrc: '/api/captcha?_t=' + new Date().getTime()
      },
      rules: {
        email: [
          {
            required: true,
            message: '请输入邮箱'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱格式'
          }
        ],
        emailcaptcha: [{ required: true, message: '请输入邮箱验证码' }],
        captcha: [{ required: true, message: '请输入验证码' }],
        password: [{ required: true, message: '请输入密码' }]
      }
    }
  },
  computed: {
    sentText () {
      if (this.buttonCount > 0) {
        return `${this.buttonCount}s后发送`
      }
      return '发送验证码'
    }
  },
  methods: {
    updateCaptcha () {
      this.form.captchaSrc = '/captcha?_t=' + new Date().getTime()
    },
    async sendEmailCode () {
      await this.$http.get('/sendcode?email=' + this.form.email)
      this.buttonCount = 10
      const timer = setInterval(() => {
        this.buttonCount--
        if (this.buttonCount === 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    login () {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          // 校验成功
          const obj = {
            email: this.form.email,
            emailcaptcha: this.form.emailcaptcha,
            password: md5(this.form.password),
            captcha: this.form.captcha
          }
          const res = await this.$http.post('/user/login', obj)
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '登录成功'
            })
            localStorage.setItem('token', res.data.token)
            setTimeout(() => {
              this.$router.push('/')
            }, 3000)
          } else {
            this.$message({
              type: 'error',
              message: res.message
            })
          }
        } else {
          console.log('校验失败')
        }
      })
    }
  }
}
</script>

<style lang="stylus">
.login-form {
  width: 800px;
  margin: 50px auto;
}
</style>
