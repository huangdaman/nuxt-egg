<template>
  <div>
    <h1>用户中心</h1>
    <span>{{ name }}</span>
    <div id="drag" ref="drag">
      <input type="file" @change="handleruploadFile">
    </div>
    <div>
      <el-progress :text-inside="true" :stroke-width="26" :percentage="uploadProgress" />
    </div>
    <div>
      <el-button type="primary" @click="uploadFile">
        上传
      </el-button>
    </div>
    <div>
      <el-progress :text-inside="true" :stroke-width="26" :percentage="hashProgress" />
    </div>
  </div>
</template>

<script>
const SparkMD5 = require('spark-md5')
const CHUNK_SIZE = 1024 * 1024
export default {
  data () {
    return {
      name: '',
      file: null,
      uploadProgress: 0,
      hashProgress: 0
    }
  },
  mounted () {
    this.bindEvents()
    // const res = await this.$http.get('/user/info')
    // if (res.data) {
    //   this.name = res.data.name
    // }
  },
  methods: {
    bindEvents () {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', (e) => {
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('dragleave', (e) => {
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
      drag.addEventListener('drop', (e) => {
        e.preventDefault()
        console.log(e)
        const fileList = e.dataTransfer.files
        drag.style.borderColor = '#eee'
        this.file = fileList[0]
      })
    },
    blobToSting (blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function () {
          const ret = reader.result
            .split('')
            .map(v => v.charCodeAt())
            .map(v => v.toString(16).toUpperCase())
            .join(' ')
          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif (file) {
      // GIF89a 和 GIF87a
      // 前面6个16进制 '47 49 46 38 39 61'   '47 49 46 38 37 61'
      const ret = await this.blobToSting(file.slice(0, 6))
      console.log(ret)
      const isGif = ret === '47 49 46 38 39 61' || ret === '47 49 46 38 37 61'
      return isGif
    },
    async isPng (file) {
      const ret = await this.blobToSting(file.slice(0, 8))
      const ispng = ret === '89 50 4E 47 0D 0A 1A 0A'
      return ispng
    },
    async isJpg (file) {
      const len = file.size
      const start = await this.blobToSting(file.slice(0, 2))
      const tail = await this.blobToSting(file.slice(-2, len))
      const isJpg = start === 'FF D8' && tail === 'FF D9'
      return isJpg
    },
    async isImage (file) {
      // 通过文件流来判定
      // 先判定是不是gif
      return (
        (await this.isGif(file)) ||
        (await this.isJpg(this.file)) ||
        (await this.isPng(this.file))
      )
    },
    createFileChunk (file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < this.file.size) {
        chunks.push({
          index: cur,
          file: this.file.slice(cur, cur + size)
        })
        cur += size
      }
      return chunks
    },
    calculateHashWorker (chunks) {
      return new Promise((resolve) => {
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({ chunks })
        this.worker.onmessage = (e) => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    calculateHashIdle (chunks) {
      return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer()
        let count = 0

        const appendToSpark = (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (e) => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }

        const myNonEssentialWork = async (deadline) => {
          while (deadline.timeRemaining() > 0 && count < chunks.length) {
            await appendToSpark(chunks[count].file)
            count++
            if (count === chunks.length) {
              this.hashProgress = 100
              resolve(spark.end())
            } else {
              this.hashProgress = Number(
                ((100 * count) / chunks.length).toFixed(2)
              )
            }
          }
          if (count < chunks.length) {
            requestIdleCallback(myNonEssentialWork)
          }
        }

        window.requestIdleCallback(myNonEssentialWork)
      })
    },
    async uploadFile () {
      // if (!(await this.isImage(this.file))) {
      //   this.$message({
      //     type: 'error',
      //     message: '不是一张图片'
      //   })
      //   return
      // }
      const chunks = this.createFileChunk(this.file)
      // const hash = await this.calculateHashWorker(chunks)
      const hash = await this.calculateHashIdle(chunks)
      console.log('文件的hash', hash)

      this.chunks = chunks.map((chunk, index) => {
        const name = hash + '-' + index
        return {
          hash,
          name,
          index,
          chunk: chunk.file
        }
      })
      await this.uploadChunks(this.chunks)
    },
    async uploadChunks (chunks) {
      const requests = chunks.map((chunk, index) => {
        const form = new FormData()
        form.append('hash', chunk.hash)
        form.append('name', chunk.name)
        form.append('chunk', chunk.chunk)
        return form
      }).map((form, index) => {
        this.$http.post('/uploadfile', form, {
          onUploadProgress: (progess) => {
            this.chunks[index].progress = Number((progess.loaded / progess.total * 100).toFixed(2))
          }
        })
      })
      await Promise.all(requests)
    },
    async sendRequest() {
      
    },
    handleruploadFile (e) {
      const [file] = e.target.files
      if (!file) {
        return
      }
      this.file = file
    }
  }
}
</script>

<style lang="stylus">
#drag {
  height: 100px;
  line-height: 100px;
  border: 2px dashed #ee;
  text-align: center;
  vertical-align: middle;

  &:hover {
    border-color: red;
  }
}
</style>
