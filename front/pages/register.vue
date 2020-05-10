<template>
  <div class="register-form">
    <el-form ref="registerForm" :rules="rules" :model="form" label-width="80px">
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="邮箱" />
      </el-form-item>
      <el-form-item prop="captcha" label="验证码">
        <el-col :span="18">
          <el-input v-model="form.captcha" col="8" placeholder="验证码" />
        </el-col>
        <el-col :span="4">
          <el-image :src="form.captchaSrc" alt @click="updateCaptcha" />
        </el-col>
      </el-form-item>
      <el-form-item prop="name" label="昵称">
        <el-input v-model="form.name" placeholder="昵称" />
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>

      <el-form-item prop="repassword" label="确认密码">
        <el-input v-model="form.repassword" type="password" placeholder="确认密码" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click.prevent="submit">
          注册
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
      form: {
        name: '小满',
        email: '724996116@qq.com',
        password: '0',
        repassword: '0',
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
        captcha: [{ required: true, message: '请输入验证码' }],
        name: [{ required: true, message: '请输入昵称' }],
        password: [{ required: true, message: '请输入密码' }],
        repassword: [{ required: true, message: '请再次输入密码' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.password) {
                callback(new Error('再次密码不一致'))
              }
              callback()
            }
          }]
      }
    }
  },
  methods: {
    updateCaptcha () {
      this.form.captchaSrc = '/captcha?_t=' + new Date().getTime()
    },
    submit () {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          // 校验成功
          console.log('校验成功')
          const obj = {
            email: this.form.email,
            name: this.form.name,
            password: md5(this.form.password),
            captcha: this.form.captcha
          }
          const data = await this.$http.post('/user/register', obj)

          if (data.code === 0) {
            this.$alert('注册成功', '成功', {
              confirmButtonText: '去登录',
              callback: () => {
                this.$router.push('/login')
              }
            })
          } else {
            this.$message({
              type: 'error',
              message: data.message
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
.register-form {
  width: 800px;
  margin: 50px auto;
}
</style>
