# PUPPET-WALNUT-GATEWAY

![PUPPET-WALNUT](https://github.com/wechaty/puppet-walnut/blob/main/docs/images/puppet-walnut.webp)

[![NPM Version](https://badge.fury.io/js/wechaty-puppet-walnut.svg)](https://badge.fury.io/js/wechaty-puppet-walnut)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-puppet-walnut/next.svg)](https://www.npmjs.com/package/wechaty-puppet-walnut?activeTab=versions)
[![NPM](https://github.com/wechaty/wechaty-puppet-walnut/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-puppet-walnut/actions?query=workflow%3ANPM)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://github.com/wechaty/wechaty)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## 前提环境

1. 申请 5G 开发者权限。

   👉 [5G消息开发者社区平台(注意申请的是网关)](https://www.5g-msg.com)

2. 配置系统环境变量。

   - `WECHATY_PUPPET_WALNUT_APPID`: Chatbot的AppId。
   - `WECHATY_PUPPET_WALNUT_APPKEY`：Chatbot的AppKey。
   - `WECHATY_PUPPET_WALNUT_SIPID`: Chatbot的sipId。
   - `WECHATY_PUPPET`：wechaty-puppet-walnut-gateway

3. 配置公网环境。

   > 如果是本地调试，则需要将在申请 5G 开发者时填入的公网地址，映射到本地才可以监听到`chatbot`接收到的消息

   这里推荐使用 [Frp](https://github.com/fatedier/frp)，来进行端口的映射。Walnut本身集成的 sever 端口默认为 **3000**，将公网地址映射到本地即可

## 安装本地调试环境

1. 下载安装调试客户端。

   > 需要一部非 IOS 系统的手机

   下载并且安装 👉 [终端测试消息APP](https://www.5g-msg.com/#/kaifataojian) 。

2. 打开 app ，将其设置为系统的默认信息应用。
3. 关闭wifi，确保使用手机流量上网。
4. 右上角 -> 设置 -> 常规 -> 融合通信登录。
5. 联系硬核桃社区申请账号密码。
6. 登录成功之后就可以收到我们 chatbot 发送的消息了🎉。

> 小白如何从0到1上手puppet-walnut 👉 <https://wechaty.js.org/2022/04/22/how-to-start-puppet-walnut/>

## 运行方法

### 安装依赖

~~~shell
npm install wechaty
npm install wechaty-puppet-walnut-gateway
~~~

### 编写代码

~~~typescript
import { WechatyBuilder } from 'wechaty'

WechatyBuilder.build()  // get a Wechaty instance
  .on('message',       message => console.log(`Message: ${message}`))
  .start()
~~~

> Learn more for building your first Wechaty bot at <https://github.com/wechaty/>, <https://github.com/wechaty/getting-started>

## 消息种类支持

| 消息类型 | 从属(根据接口返回) | api                    | 接收 | 发送 | 群聊 |
| -------- | ------------------ | ---------------------- | ---- | ---- | ---- |
| 文本     | `text`             | `message.text`         | ✅    | ✅    | ❌    |
| 图片     | `image`            | `message.toImage()`    | ✅    | ✅    | ❌    |
| 视频     | `video`            | `message.toFilebox()`  | ✅    | ✅   | ❌    |
| 音频     | `audio`            | `message.toFilebox()`  | ✅    | ✅   | ❌    |
| 位置     | `location`         | `message.toLocation()` | ✅   | ✅    | ❌    |
| 文件     | `other`            | `message.toFilebox()`  | ✅    | ✅    | ❌    |
| 联系人   | `other`            | `message.toContact()`  | ✅    | ❌    | ❌    |
| 富文本卡片   | `post`            | `message.toPost()`  | ❌   | ✅     | ❌    |

## Wechaty API 支持

### Contact

- #### [Properties](https://wechaty.js.org/docs/api/contact#properties)

  | Name | Type     | Description                                                  | Support | Details      |
  | ---- | -------- | ------------------------------------------------------------ | ------- | ------------ |
  | id   | `string` | Get Contact id. This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/wechaty/wechaty/wiki/Puppet#3-puppet-compatible-table) | ✅       | Phone number |

- #### [Instance Methods](https://wechaty.js.org/docs/api/contact#instance-methods)

  | Instance Methods                    | Return type                                                  | Support | Details               |
  | ----------------------------------- | ------------------------------------------------------------ | ------- | --------------------- |
  | say(text Or Contact Or File) | `Promise`                                                    | ✅       | ⚠Contact not Support |
  | name()                              | `String`                                                     | ✅       | Phone number          |
  | alias(newAlias)                     | `Promise`                                                    | ✅       |                     |
  | friend()                            | `Boolean or null`                                            | ✅       | True           |
  | type()                              | `ContactType.Unknown or ContactType.Personal or ContactType.Official` | ✅       | ContactType.Personal  |
  | gender()                            | `ContactGender.Unknown or ContactGender.Male or ContactGender.Female` | ✅       | ContactGender.Unknown |
  | province()                          | `String or null`                                             | ❌       |                       |
  | city()                              | `String or null`                                             | ❌       |                       |
  | avatar()                            | `Promise`                                                    | ✅       | Default avatar        |
  | sync()                              | `Promise`                                                    | ✅       |                     |
  | self()                              | `Boolean`                                                    | ✅       |                       |

  > Default avatar 👉 <https://raw.githubusercontent.com/wechaty/puppet-walnut/main/docs/images/avatar.webp>

- #### [Static Methods](https://wechaty.js.org/docs/api/contact#static-methods)

  | Static Methods            | Return Type                 | Support | Detail |
  | ------------------------- | --------------------------- | ------- | ------ |
  | find(query)               | `Promise <Contact \| null>` | ✅       |        |
  | findAll(Query Arguements) | `Promise <Contact []>`      | ✅       |        |

### Message

- #### [Instance Methods](https://wechaty.js.org/docs/api/message#instance-methods)

  | Instance methods             | Return type         | Support | Detail               |
  | ---------------------------- | ------------------- | ------- | -------------------- |
  | talker()                       | `Contact` or `null` | ✅       |                      |
  | to()                         | `Contact` or `null` | ✅       |                      |
  | room()                       | `Room` or `null`    | ✅       | null                 |
  | text()                       | `string`            | ✅       |                      |
  | say(text Or Contact Or File) | `Promise`           | ✅       | ⚠Contact not Support |
  | type()                       | `MessageType`       | ✅       | Message.Text         |
  | self()                       | `boolean`           | ✅       |                      |
  | mention()                    | `Promise`           | ❌       |                      |
  | mentionSelf()                | `Promise`           | ❌       |                      |
  | forward(to)                  | `Promise`           | ✅       |                      |
  | date()                       | `Date`              | ✅       |                      |
  | age()                        | `Number`            | ✅       |                      |
  | toFileBox()                  | `Promise`           | ✅       |                      |
  | toContact()                  | `Promise`           | ✅       |                      |
  | toUrlLink()                  | `Promise`           | ✅       |                      |

- #### [Static Method](https://wechaty.js.org/docs/api/message#static-method)

  | Static Methods | Return type | Support | Detail |
  | -------------- | ----------- | ------- | ------ |
  | find()         | `Promise`   | ✅       |        |
  | findAll()      | `Promise`   | ✅       |        |

## 使用示例

### 1. 可配置参数

- `sipId`、`appId`和`appKey`可以通过环境变量或者此处传入。
- `port`和`notifyUrlPrefix`可以指定 koa 服务监听的端口和路由前缀。

> 比如 bot 申请的回调地址为： <http://123.123.123.123:8080/sms/>
>
> 此时`port`设为 8080, `notifyUrlPrefix`为 '/sms'
>
> `port`默认为 3000, `notifyUrlPrefix` 默认为空

~~~ts
new PuppetWalnut({
  sipId: xxxxxxx,
  appId: xxxxxxx,
  appKey: xxxxxxx,
  port: 3001,
  notifyUrlPrefix: '/sms'
})
~~~

### 2. 创建实例

~~~ts
const bot = WechatyBuilder.build({
  puppet: new PuppetWalnut(),
})  // get a Wechaty instance
  .on('login', (user: any) => log.info(`User ${user} logged in`))
  .on('message', async (message: Message) => {
    log.info(`Message: ${message}`)
  })

await bot.start()

const contact = await bot.Contact.find({ id: 'xxxxxxxxxxx' })
~~~

### 3. 文本消息

~~~ts
await contact.say('This is a simple text message.')
~~~

![text-message](https://user-images.githubusercontent.com/60428924/163546259-67dfa5a1-521a-4d87-bfbf-af4e09dabf7e.jpg)

### 4. 图片消息

~~~ts
contact.say(FileBox.fromFile('C:\\Users\\Desktop\\1.png'))
~~~

![image-message](https://user-images.githubusercontent.com/60428924/163546352-1d573b86-65ee-474e-baf3-008ffe608a8d.jpg)

### 5. 富文本消息

~~~ts
const post = await bot.Post.builder()
  .add('This is a single rich card.')
  .add('This is the description of the rich card. It\'s the first field that will be truncated if it exceeds the maximum width or height of a card.')
  .add(FileBox.fromFile('C:\\Users\\Desktop\\1.png'))
  .type(PUPPET.types.Post.Unspecified)
  .build()

await contact.say(post)
~~~

![post-message](https://user-images.githubusercontent.com/60428924/163787857-fcde1562-c021-4e80-8a10-238e9615e3c7.jpg)

## Wechaty

[Wechaty](https://wechaty.js.org) 是一个开源聊天机器人框架SDK，具有高度封装、高可用的特性，支持NodeJs, Python, Go 和Java 等多语言版本。在过去的5年中，服务了数万名开发者，收获了 Github 的 9600 Star。同时配置了完整的DevOps体系并持续按照Apache 的方式管理技术社区。

## 项目名称

开发支持硬核桃5G网关 Wechaty 接入 Puppet 模块  

## 背景介绍

Wechaty 社区目前已经支持微信、Whatsapp、企业微信、飞书等常见流行即时通讯工具，并且能够通过多语言 SDK （比如 Python Wechaty） 进行调用。

5G Chatbot (RCS) 是近期中国电信运营商基于 5G 的消息战略落地平台，未来的 5G 手机将会内置 RCS 消息的处理能力。我们在本次 Summer 2021 的项目中，Wechaty 希望可以实现对RCS Chatbot 的支持。可以将 RCS 协议封装成为 `wechaty-puppet-walnut-gateway` 供 Wechaty 开发者方便接入 RCS 平台，使其成为 Wechaty 可以使用的社区生态模块。

## 项目技术栈

1. TypeScript programming language
2. Git
3. REST Api
4. 5G Chatbot / Rich Communication Service
5. 硬核桃社区 5G 网关 <https://www.5g-msg.com/#/xiaoxiwangguan>

## Links

- [支持5G消息的 puppet-walnut 接入介绍](https://wechaty.js.org/2021/11/07/how-to-develop-wechaty-puppet-module-supporting-5g-messages/)

## 相关链接

- [Wechaty](https://wechaty.js.org/v/zh/)
- [Koa](https://koa.bootcss.com/)
- [TypeScripts中文手册](https://www.tslang.cn/docs/handbook/basic-types.html)

## History

### main v1.0.1(Jul 8, 2022)

Initial version.

## COPYRIGHT & LICENSE

- Code & Docs © 2018 Leo_chen \<leo.gengchen@foxmail.com\>
- Code released under the Apache-2.0 License
- Docs released under Creative Commons
