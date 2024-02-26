import axios from 'axios'

const request = axios.create({
  baseURL: 'https://api.mozambiquehe.re',
  timeout: 50000,
  headers: {
    'Cache-Control': 'no-cache',
    'Authorization': 'xxxxxxxxx',
  },
})

// 成功
function resolve(res: any = {}) {
  const { data, config } = res
  const { code, text } = data || {}
  return data
}
// 失败
function reject(err) {
  console.warn('网络错误')
  return Promise.reject(err.res || err)
}

request.interceptors.response.use(resolve, reject)

export default request
