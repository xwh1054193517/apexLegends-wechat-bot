import { log } from 'wechaty'
import type { Room, Wechaty } from 'wechaty'
import request from './../utils/request.ts'
import { mapCnName } from './../utils/enums.ts'

export async function queryPlayerByName(bot: Wechaty, platform?: string, name?: string, topic?: string) {
  let query: Record<string, string> = {}
  query = { platform: 'PC' }
  if (platform)
    query = { platform }
  if (name)
    query = Object.assign(query, { player: name })

  const roomQuery: Record<string, string> = {
    topic,
  }
  try {
    // const contact = await bot.Room.find(roomQuery)

    const res: any = await request.get(`/bridge?player=${query.player}&platform=${'PC'}`)
    const { global, realtime } = res
    const { rank } = global
    console.warn(realtime)
    const content = `玩家:${global.name}\nuid:${global.uid}\n平台:${global.platform}\n等级:${global.level}\n段位:${rank.rankName}${rank.rankDiv}\n分数:${rank.rankScore}\n当前状态:${realtime.currentState}\n当前选择英雄:${realtime.currentState !== 'offline' ? realtime.selectedLegend : '-'}`
    // contact.saycontent)
    console.warn(content)
    // log.error(contact)
  }
  catch (error) {
    log.error('发送联系人信息错误')
  }
}
export async function queryPlayerByNameInRoom(room: Room, name: string) {
  try {
    // const contact = await bot.Room.find(roomQuery)

    const res: any = await request.get(`/bridge?player=${name}&platform=${'PC'}`)
    const { global, realtime } = res
    const { rank } = global
    const content = `玩家:${global.name}\nuid:${global.uid}\n平台:${global.platform}\n等级:${global.level}\n段位:${rank.rankName}${rank.rankDiv}\n分数:${rank.rankScore}\n当前状态:${realtime.currentState}\n当前选择英雄:${realtime.currentState !== 'offline' ? realtime.selectedLegend : '-'}`
    room.say(content)
    // contact.saycontent)
    // log.error(contact)
  }
  catch (error) {
    log.error('发送联系人信息错误')
  }
}
export async function queryPlayerByUID(bot: Wechaty, content: string, topic: string) {
  const query: Record<string, string> = {
    topic,
  }
  try {
    const room = await bot.Room.find(query)

    if (room)
      room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}

export async function MapRotation(bot: Wechaty, topic: string) {
  const query: Record<string, string> = {
    topic,
  }
  try {
    const room = await bot.Room.find(query)
    const res: any = await request.get('/maprotation?version=2')
    const { battle_royale, ranked } = res
    const { current: currentBr, next: nextBr } = battle_royale
    const { current: currentRk, next: nextRk } = ranked
    const content = `当前匹配地图:${mapCnName[currentBr.map]}\n即将轮换地图:${mapCnName[nextBr.map]}\n\n当前排位地图:${mapCnName[currentRk.map]}\n明日排位地图:${mapCnName[nextRk.map]}`
    if (room)
      room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}
export async function MapRotationInRoom(room: Room) {
  try {
    const res: any = await request.get('/maprotation?version=2')
    const { battle_royale, ranked } = res
    const { current: currentBr, next: nextBr } = battle_royale
    const { current: currentRk, next: nextRk } = ranked
    const content = `当前匹配地图:${mapCnName[currentBr.map]}\n即将轮换地图:${mapCnName[nextBr.map]}\n\n当前排位地图:${mapCnName[currentRk.map]}\n明日排位地图:${mapCnName[nextRk.map]}`
    if (room)
      room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}

export async function ServerStatus(bot: Wechaty, topic: string) {
  const query: Record<string, string> = {
    topic,
  }
  try {
    // const room = await bot.Room.find(query)
    const res: any = await request.get('/servers')
    console.warn(res)
    // if (room)
    //   room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}

export async function NameToUID(bot: Wechaty, name?: string, topic?: string) {
  const query: Record<string, string> = {
    topic,
  }
  try {
    const room = await bot.Room.find(query)
    const res: any = await request.get(`/nametouid?player=${name}&platform=${'PC'}`)
    console.warn(res)

    // if (room)
    //   room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}

export async function NameToUIDOrigin(bot: Wechaty, name: string, topic: string) {
  const query: Record<string, string> = {
    topic,
  }
  try {
    // const room = await bot.Room.find(query)
    const res: any = await request.get(`/origin?player=${name}&platform=${'PC'}`)
    console.warn(res)

    // if (room)
    //   room.say(content)
  }
  catch (error) {
    log.error('发送群信息错误')
  }
}
