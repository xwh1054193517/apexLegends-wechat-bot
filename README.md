# 基于wechaty基础上增加apex legends查询功能

- 命令行运行微信聊天
- 基于[Wechaty](http://github.com/wechaty/wechaty)开源项目开发。

## 环境要求
```bash
# configure
1. node version 18+
2. pnpm version 7.x
```

### pnpm 安装
```bash
npm install -g pnpm
```

## 🚀 Development
```bash
# install dependencies
pnpm i

# start the service
pnpm dev

# 
```

## 🌟 Send Message
window使用如下：
```bash
# 发送好友消息

# 根据好友昵称发送消息
curl http://127.0.0.1:3000/0?name=好友名称'&'content=测试消息
# 根据好友备注发送消息，需要设置好友备注名
curl http://127.0.0.1:3000/0?alias=好友备注'&'content=测试消息

# 发送群消息
curl http://127.0.0.1:3000/1?name=群名称'&'content=测试消息
```

macos使用如下：
```bash
# 发送好友消息

# 根据好友昵称发送消息
curl 'http://127.0.0.1:3000/0?name=好友名称&content=测试消息'
# 根据好友备注发送消息，需要设置好友备注名
curl 'http://127.0.0.1:3000/0?alias=好友备注&content=测试消息'

# 发送群消息
curl 'http://127.0.0.1:3000/1?name=群名称&content=测试消息'
```



