import PuppetWalnut from '../puppet-walnut.js'
import type { WalnutMessagePayload } from '../help/struct.js'
import { log } from '../config.js'
import { downloadFile } from '../help/request.js'
import Dayjs from 'dayjs'
import { fileTypeFromBuffer } from 'file-type'

function notifyAuthorization (ctx: any) {
  log.silly('notifyAuthorization', JSON.stringify(ctx.request))
  const echoStr : string = ctx.request.get('echoStr')
  ctx.set({
    appId: PuppetWalnut.appId,
    echoStr: echoStr,
  })
  ctx.response.body = {}
}

async function parseMessage (ctx: any) {
  log.info('parseMessage', JSON.stringify(ctx.request.body))
  const ignoreMessage = ['sharedData', 'action']
  if (ignoreMessage.includes(ctx.request.body.action)) {
    return
  }
  let messageItem = 'text'
  if (ctx.request.body.action === 'file') {
    const fileInfo = JSON.parse(ctx.request.body.messageData)
    const fileId = fileInfo.fileID
    const fileBuffer = await downloadFile(fileId)
    const mime = await fileTypeFromBuffer(fileBuffer)
    if (mime) {
      if (mime.ext === 'vcf') {
        messageItem = 'vcf'
      } else if (mime.mime.includes('image')) {
        messageItem = 'image'
      } else if (mime.mime.includes('audio')) {
        messageItem = 'audio'
      } else if (mime.mime.includes('video')) {
        messageItem = 'video'
      } else {
        messageItem = 'other'
      }
    }
  }
  if (ctx.request.body.action === 'text' && ctx.request.body.messageData.includes('geo:')) {
    messageItem = 'location'
  }
  const message: WalnutMessagePayload = {
    ...ctx.request.body,
    dateTime: Dayjs().format('YYYY-MM-DD HH:mm:ss'),
    destinationAddress: PuppetWalnut.chatbotId,
    messageItem,
  }
  await PuppetWalnut.cacheManager.setMessage(message.messageId, message)
  const phone = message.sender
  await PuppetWalnut.cacheManager.setContact(phone, {
    name: phone,
    phone: phone,
  })
  PuppetWalnut.instance.emit('message', { messageId: message.messageId })
  ctx.response.body = {
    errorCode: 0,
    errorMessage: '',
    messageId: message.messageId,
  }
}

/**
 * 消息状态: sent:消息已发 送; failed:消息发送失 败; delivered:消息已送 达; displayed:消息已阅 读; deliveredToNetwork: 已转短信发送; revokeOk: 消息撤回成功; revokeFail: 消息撤回失败
 * @param ctx
 */
function checkDelivery (ctx: any) {
  log.silly('checkDelivery', JSON.stringify(ctx.request.body))
  if (ctx.request.body.deliveryInfoList[0].status.includes('fail')) {
    log.warn('puppet-5g sever', 'message send error')
  }
  ctx.response.body = {
    errorCode: 0,
    errorMessage: '',
  }
}

export { notifyAuthorization, parseMessage, checkDelivery }
