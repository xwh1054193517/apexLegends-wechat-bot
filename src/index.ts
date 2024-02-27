import express from 'express'
import { WechatyBuilder } from 'wechaty'
import { onLogin } from './listeners/onLogin.ts'
import { onLogout } from './listeners/onLogout.ts'
import { onMessage } from './listeners/onMessage.ts'
import { onReady } from './listeners/onReady.ts'
import { sendContactMsg, sendRoomMsg } from './services/sendMessage.ts'

import ApexBot from './utils/apexBot.ts'

const app = express()
const apbot = new ApexBot()
const bot = WechatyBuilder.build({
  name: 'test-bot',
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true,
  },
})

bot
  // .on('scan', onScan)
  .on('login', onLogin)
  .on('ready', onReady)
  .on('logout', onLogout)
  .on('message', onMessage)

// bot
//   .start()
//   .then(() => log.info('开始运行...'))
//   .catch(e => log.error('StarterBot', e))

app.get('/0', async (req, res) => {
  if (req.query.name || req.query.alias) {
    if (req.query.content) {
      const content = req.query.content?.toString()
      const name = req.query.name?.toString()
      const alias = req.query.alias?.toString()
      await sendContactMsg(bot, content, alias, name)
      res.send('联系人消息成功')
    }
    else {
      res.send('缺少发送内容')
    }
  }
  else {
    res.send('缺少用户名/备注')
  }
})

app.get('/1', async (req, res) => {
  if (req.query.name) {
    if (req.query.content) {
      const content = req.query.content?.toString()
      const name = req.query.name?.toString()
      await sendRoomMsg(bot, content, name)
      res.send('群消息发送成功')
    }
    else {
      res.send('缺少发送内容')
    }
  }
  else {
    res.send('缺少群名')
  }
})

app.get('/player', async (req, res) => {
  if (req.query.name) {
    const name = req.query.name?.toString()
    await apbot.queryPlayerByName(name)
    res.send('通过名称查询玩家成功')
  }
  else {
    res.send('缺少玩家名称内容')
  }
})
app.get('/playerByUid', async (req, res) => {
  if (req.query.uid) {
    const uid = req.query.uid?.toString()
    await apbot.queryPlayerByUID(uid)
    res.send('通过UID查询玩家成功')
  }
  else {
    res.send('缺少玩家uid')
  }
})

app.get('/map', async (req, res) => {
  await apbot.queryMap()
  res.send('查询Apex轮换地图成功')
})

app.get('/ServerStatus', async (req, res) => {
  await apbot.queryServerStatus()
  res.send('查询Apex服务器成功')
})
app.get('/nameToUid', async (req, res) => {
  const player = req.query.player?.toString()
  await apbot.queryUidByName(player)
  res.send('查询玩家UID成功')
})

app.get('/store', async (req, res) => {
  await apbot.queryStore()
  res.send('查询Apex商店成功')
})
app.get('/predator', async (req, res) => {
  await apbot.queryPredator()
  res.send('查询Apex猎杀底分成功')
})

app.listen(3000)
