<template>
  <div>
    <h1>用户中心</h1>
    <span>{{ name }}</span>
    <div>
      <input type="file" @change="handleruploadFile">
    </div>
    <div>
      <el-button type="primary" @click="uploadFile">
        上传
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      file: null
    }
  },
  //   async mounted () {
  //     const res = await this.$http.get('/user/info')
  //     if (res.data) {
  //       this.name = res.data.name
  //     }
  //   },
  methods: {
    async uploadFile () {
      const form = new FormData()
      form.append('name', 'file')
      form.append('file', this.file)
      const res = await this.$http.post('/uploadfile', form)
      console.log(res)
    },
    handleruploadFile (e) {
      const [file] = e.target.files
      console.log(file)
      if (!file) { return }
      this.file = file
    }
  }
}
</script>
