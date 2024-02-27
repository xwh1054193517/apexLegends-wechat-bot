import { log } from 'wechaty'
import type { Message, Room } from 'wechaty'
import { MapRotationInRoom, getPredatorRoom, queryPlayerByNameInRoom } from './../services/goApexStatus.ts'

const startTime = new Date()
export async function onMessage(msg: Message) {
  // 屏蔽接收历史消息
  if (msg.date() < startTime)
    return

  const room = msg.room()
  if (room) {
    // 群白名单，只接受白名单内的群消息
    // if (!robotConfig.whiteRoomList.includes(topic))
    //   return

    // 群消息
    getMessagePayload(msg, room)
  }
  else {
    const bot = msg.wechaty
    const contact = msg.talker()
    if (contact.type() === bot.Contact.Type.Official || contact.id === 'weixin')
      return

    // 私聊信息
    getMessagePayload(msg)
  }
}

function getMessagePayload(msg: Message, room?: Room) {
  const bot = msg.wechaty
  switch (msg.type()) {
    case bot.Message.Type.Text: {
      room ? dispatchRoomTextMsg(msg, room) : dispatchFriendTextMsg(msg)
      break
    }
    case bot.Message.Type.Attachment:
    case bot.Message.Type.Audio: {
      room ? dispatchRoomAudioMsg(msg, room) : dispatchFriendAudioMsg(msg)
      break
    }
    case bot.Message.Type.Video: {
      room ? dispatchRoomVideoMsg(msg, room) : dispatchFriendVideoMsg(msg)
      break
    }
    case bot.Message.Type.Emoticon: {
      room ? dispatchRoomEmoticonMsg(msg, room) : dispatchFriendEmoticonMsg(msg)
      break
    }
    case bot.Message.Type.Image: {
      room ? dispatchRoomImageMsg(msg, room) : dispatchFriendImageMsg(msg)
      break
    }
    case bot.Message.Type.Url: {
      room ? dispatchRoomUrlMsg(msg, room) : dispatchFriendUrlMsg(msg)
      break
    }
    case bot.Message.Type.MiniProgram: {
      room ? dispatchRoomMiniProgramMsg(msg, room) : dispatchFriendMiniProgramMsg(msg)
      break
    }
    default:
      log.info('接收到莫名其妙的消息')
      break
  }
}

async function downloadMedia(msg: Message) {
  // const date = new Date()
  // const year = date.getFullYear()
  // const month = String(date.getMonth() + 1).padStart(2, '0')
  // const day = String(date.getDate()).padStart(2, '0')
  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = path.dirname(__filename)
  // // 获取当前文件所在目录的绝对路径
  // const currentPath = path.resolve(__dirname, '..')
  // const saveFolder = path.join(currentPath, 'files', `${year}-${month}-${day}`)
  // if (!fs.existsSync(saveFolder))
  //   fs.mkdirSync(saveFolder, { recursive: true })

  // const msgFile = await msg.toFileBox()
  // const filename = msgFile.name
  // const savePath = path.join(saveFolder, filename)
  // await msgFile.toFile(savePath)
  // console.log(`File saved to ${savePath}`)
}

/**
 * 群文本消息
 * @param msg
 * @param room
 */
async function dispatchRoomTextMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const content = msg.text().trim()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】：${content}`)
  if (content.includes('查询玩家')) {
    const name = content.split(' ')[1]
    await queryPlayerByNameInRoom(room, name)
  }
  if (content.includes('查询地图'))
    await MapRotationInRoom(room)
  if (content.includes('查询猎杀底分'))
    await getPredatorRoom(room)
}

/**
 * 好友文本消息
 * @param msg
 */
async function dispatchFriendTextMsg(msg: Message) {
  const content = msg.text().trim()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】：${content}`)
}

async function dispatchRoomAudioMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了文件`)
}

async function dispatchFriendAudioMsg(msg: Message) {
  // const contact = msg.talker()
  // const alias = await contact.alias()

  // const name = alias ? `${contact.name()}(${alias})` : contact.name()
  // const msgFile = await msg.toFileBox()
  // const filename = msgFile.name
  // await msgFile.toFile(filename)
  // const mp3Stream = createReadStream(filename)
  // const wavStream = new PassThrough()

  // Ffmpeg(mp3Stream)
  //   .fromFormat('mp3')
  //   .toFormat('wav')
  //   .pipe(wavStream as any)
  //   .on('error', (err: Error /* , stdout, stderr */) => {
  //     log.error(`Cannot process video: ${err.message}`)
  //   })

  // 将二进制流写入文件
  // const filePath = `${filename.split('.')[0]}.wav`
  // const fileWriteStream = createWriteStream(filePath)

  // wavStream.pipe(fileWriteStream)

  // fileWriteStream.on('finish', async () => {
  //   const __filename = fileURLToPath(import.meta.url)
  //   const __dirname = path.dirname(__filename)
  //   // 获取当前文件所在目录的绝对路径
  //   const currentPath = path.resolve(__dirname,'..')
  //   // 返回上两级文件夹的路径
  //   const oldPath = path.join(currentPath, `../../${filename}`)
  //   const newPath = path.join(currentPath, `../../${filePath}`)
  //   const text = await asr(newPath)
  //   log.info(`好友【${name}】 发送了语音：${text}`)
  //   unlink(newPath, () => { })
  //   unlink(oldPath, () => { })
  // })
}

async function dispatchRoomVideoMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  downloadMedia(msg)
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了视频文件`)
}

async function dispatchFriendVideoMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()
  downloadMedia(msg)
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了视频文件`)
}

async function dispatchRoomEmoticonMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  downloadMedia(msg)
  log.info(`群【${topic}】【${name}】 发送了表情符号`)
}

async function dispatchFriendEmoticonMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()
  downloadMedia(msg)
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了表情符号`)
}

async function dispatchRoomImageMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  downloadMedia(msg)
  log.info(`群【${topic}】【${name}】 发送了图片`)
}

async function dispatchFriendImageMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()
  downloadMedia(msg)
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了图片`)
}

async function dispatchRoomUrlMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了链接`)
}

async function dispatchFriendUrlMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了链接`)
}

async function dispatchRoomMiniProgramMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()
  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了小程序`)
}

async function dispatchFriendMiniProgramMsg(msg: Message) {
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`好友【${name}】 发送了小程序`)
}
