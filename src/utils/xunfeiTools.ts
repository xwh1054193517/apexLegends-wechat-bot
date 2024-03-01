import CryptoJs from 'crypto-js'
import { Base64 } from 'js-base64'
import Websocket from 'ws'
import { requestObj } from '../configs/index.ts'

export function getWebsocketUrl() {
  return new Promise<string>((resolve, reject) => {
    let url = 'wss://spark-api.xf-yun.com/v3.5/chat'
    const host = 'spark-api.xf-yun.com'
    const apiKeyName = 'api_key'
    // let date = new Date().toGMTString();
    const date = new Date().toUTCString()
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`
    const signatureSha = CryptoJs.HmacSHA256(signatureOrigin, requestObj.APISecret)
    const signature = CryptoJs.enc.Base64.stringify(signatureSha)

    const authorizationOrigin = `${apiKeyName}="${requestObj.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`

    const authorization = Base64.encode(authorizationOrigin)

    // 将空格编码
    url = `${url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`

    resolve(url)
  })
}

export async function sendAiMsg(questionText: string) {
  let result: string = ''
  // 获取请求地址
  const myUrl = await getWebsocketUrl()
  // 获取输入框中的内容
  // 每次发送问题 都是一个新的websocket请求
  return new Promise((resolve, reject) => {
    const socket = new Websocket(myUrl)
    // 监听websocket的各阶段事件 并做相应处理
    socket.addEventListener('open', (event) => {
      console.warn('链接打开')
      // 发送消息
      const params = {
        header: {
          app_id: requestObj.APPID,
          uid: requestObj.Uid,
        },
        parameter: {
          chat: {
            domain: 'generalv3.5',
            temperature: 0.5,
            max_tokens: 1024,
          },
        },
        payload: {
          message: {
          // 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
          // 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
            text: [
            // ....... 省略的历史对话
              { role: 'user', content: questionText }, // # 最新的一条问题，如无需上下文，可只传最新一条问题
            ],
          },
        },
      }
      socket.send(JSON.stringify(params))
    })
    socket.addEventListener('message', (event) => {
      console.warn('收到信息')
      const data = JSON.parse(event.data)
      if (!data.payload) {
        socket.close()
        return
      }
      result += data.payload.choices.text[0].content
      if (data.header.code !== 0) {
        console.warn('出错了', data.header.code, ':', data.header.message)
        // 出错了"手动关闭连接"
        socket.close()
      }
      if (data.header.code === 0) {
      // 对话已经完成
        // console.warn('对话已完成')
        if (data.payload.choices.text && data.header.status === 2) {
          setTimeout(() => {
          // "对话完成，手动关闭连接"
            socket.close()
          }, 500)
        }
      }
    })
    socket.addEventListener('close', (event) => {
    // 对话完成后socket会关闭，将聊天记录换行处理
      console.warn('连接关闭')
      resolve(result)
    })
    socket.addEventListener('error', (event) => {
      console.warn('连接发送错误！！', event)
    })
  })
}
