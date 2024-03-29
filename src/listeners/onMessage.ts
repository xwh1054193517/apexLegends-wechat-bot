import { log } from 'wechaty'
import type { Message, Room } from 'wechaty'
import ApexBot from '../utils/apexBot.ts'
import { sendAiMsg } from '../utils/xunfeiTools.ts'

const startTime = new Date()
const apbot = new ApexBot()
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

async function getMessagePayload(msg: Message, room?: Room) {
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
      room
        ? dispatchRoomEmoticonMsg(msg, room)
        : dispatchFriendEmoticonMsg(msg)
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
      room
        ? dispatchRoomMiniProgramMsg(msg, room)
        : dispatchFriendMiniProgramMsg(msg)
      break
    }
    case bot.Message.Type.Recalled: {
      const recalledMessage = await msg.toRecalled()
      console.warn(`Message: ${recalledMessage} has been recalled.`)
      break
    }
    default:
      log.info('接收到莫名其妙的消息')
      break
  }
}

async function downloadMedia(msg: Message) {
  console.warn(msg)
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
  await dealRoomApexBot(msg, room)
}

async function dealRoomApexBot(msg: Message, room: Room) {
  const content = msg.text().trim()
  const contact = msg.talker()
  const isAt = await msg.mentionSelf()
  
  if (isAt) {
    console.warn('进来判断了，艾特的只有一个且是机器人')
    const type = content.includes('查询地图')
      ? 1
      : content.includes('查询猎杀底分')
        ? 2
        : content.includes('查询玩家id')
          ? 3
          : content.includes('查询玩家uid')
            ? 4
            : content.includes('查询玩家')
              ? 5
              : content.includes('查询') || content.includes('帮助')
                ? 6
                : content.split(' ')[0] === '聊天' ? 7 : 8
    let reply = ''
    switch (type) {
      case 1:
        reply = await apbot.queryMap()
        break
      case 2:
        reply = await apbot.queryPredator()
        break
      case 3:
        const player = content.split(' ')[1] || ''
        reply = await apbot.queryUidByName(player)
        break
      case 4:
        const uid = content.split(' ')[1] || ''
        reply = await apbot.queryPlayerByUID(uid)
        break
      case 5:
        const name = content.split(' ')[1] || ''
        reply = await apbot.queryPlayerByName(name)
        break
      case 6:
        reply
          = '机器人帮助指南:使用前需要@机器人\n指令菜单：帮助\n\nApex查询功能1.0\n1.查询地图\n2.查询猎杀低分\n3.查询玩家id 玩家名称\n4.查询玩家uid 玩家uid\n5查询玩家 玩家名称\n\n 本机器人已接入讯飞认知模型\n 聊天 聊天内容'
        break
      case 7:
        const spaceIdx = content.indexOf(' ')
        if (spaceIdx === -1) {
          reply = '输入格式不对 请输入帮助查看指令'
        }
        else {
          const askContent = content.slice(spaceIdx)
          reply = await sendAiMsg(askContent) as any
        }

        break
      default:
        break
    }
    if (!reply)
      return
    await room.say(`\n${reply}`, contact)
  }
}

async function dealPersonApexBot(msg: Message) {
  const content = msg.text().trim()
  const contact = msg.talker()
  let reply = ''
  const type = content.includes('查询地图')
    ? 1
    : content.includes('查询猎杀底分')
      ? 2
      : content.includes('查询玩家id')
        ? 3
        : content.includes('查询玩家uid')
          ? 4
          : content.includes('查询玩家')
            ? 5
            : content.includes('查询') || content.includes('帮助')
              ? 6
              : 7
  switch (type) {
    case 1:
      reply = await apbot.queryMap()
      break
    case 2:
      reply = await apbot.queryPredator()
      break
    case 3:
      const player = content.split(' ')[1] || ''
      reply = await apbot.queryUidByName(player)
      break
    case 4:
      const uid = content.split(' ')[1] || ''
      reply = await apbot.queryPlayerByUID(uid)
      break
    case 5:
      const name = content.split(' ')[1] || ''
      reply = await apbot.queryPlayerByName(name)
      break
    case 6:
      reply
        = '查询功能1.0\n1.查询地图\n2.查询猎杀低分\n3.查询玩家id 玩家名称\n4.查询玩家uid 玩家uid\n5查询玩家 玩家名称\n6.帮助'
      break
    default:
      break
  }
  if (!reply)
    return
  await contact.say(reply)
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
  await dealPersonApexBot(msg)
}

async function dispatchRoomAudioMsg(msg: Message, room: Room) {
  const topic = await room.topic()
  const contact = msg.talker()
  const alias = await contact.alias()

  const name = alias ? `${contact.name()}(${alias})` : contact.name()
  log.info(`群【${topic}】【${name}】 发送了文件`)
}

async function dispatchFriendAudioMsg(msg: Message) {
  console.warn(msg)
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
