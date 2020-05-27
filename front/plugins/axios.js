import Vue from 'vue'
import axios from 'axios'
import { MessageBox } from 'element-ui'

const instance = axios.create({
  baseURL: '/api/'
})

export default ({ store, redirect }) => {
  // 请求拦截
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.common.Authiruzation = 'Bearer ' + token
      }
      return config
    }
  )

  // 响应拦截
  instance.interceptors.response.use(
    (response) => {
      const { data } = response

      if (data.code === -666) {
        MessageBox.confirm('登录已过期', '过期', {
          confirmButtonText: '登录',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          localStorage.removeItem('token')
          redirect({ path: 'login' })
        })
      }
      return data
    }
  )
}

Vue.prototype.$http = instance

export const http = instance
