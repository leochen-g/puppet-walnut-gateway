import { post, uploadFile } from './request.js'
import { Api } from './api.js'
import { v4 as uuidV4 } from 'uuid'
import { contentEncoding, log } from '../config.js'
import type { FileBoxInterface } from 'file-box'
import type { MessageItem } from './struct.js'
import type * as PUPPET from 'wechaty-puppet'
export function sendTextMessage (contactId: string, msg: string) {
  sendMessage(contactId, {
    messageType: 'text',
    text: msg,
  })
}

export function sendLocationMessage (contactId: string, locationPayload: PUPPET.payloads.Location) {
  log.info(JSON.stringify(locationPayload))
  sendMessage(contactId, {
    messageType: 'text',
    text: 'geo:50.7311865,7.0914591;crs=gcj02;u=10;rcs-l=Qingfeng%20Steamed%20Dumpling%20Shop %20%F0%9F%8D%9A',
  })
}

export async function sendFileMessage (contactId: string, file: FileBoxInterface) {
  const fileItem = await uploadFile(file)

  sendMessage(contactId, {
    messageType: 'file',
    fileId: fileItem.fileTid,
    thumbnailId: fileItem.thumbnailTid
  })
}

export async function sendPostMessage (contactId: string, postPayload: PUPPET.payloads.Post) {
  const title = postPayload.sayableList[0] as PUPPET.payloads.Sayable
  const description = postPayload.sayableList[1] as PUPPET.payloads.Sayable
  const img = postPayload.sayableList[2] as PUPPET.payloads.Sayable
  if (title.type !== 'Text' || description.type !== 'Text' || img.type !== 'Attachment') {
    throw new Error('Wrong Post!!! please check your Post payload to make sure it right')
  }
  const fileItem = await uploadFile((<FileBoxInterface>img.payload.filebox))

  const msg = {
    messageType: 'card',
    contentEncoding: contentEncoding.utf8,
    contentText: {
      message: {
        generalPurposeCard: {
          content: {
            description: description.payload.text,
            media: {
              height: 'MEDIUM_HEIGHT',
              mediaContentType: fileItem.contentType,
              mediaFileSize: fileItem.fileSize,
              mediaUrl: fileItem.url,
            },
            title: title.payload.text,
          },
          layout: {
            cardOrientation: 'HORIZONTAL',
            descriptionFontStyle: ['calibri'],
            imageAlignment: 'LEFT',
            titleFontStyle: ['underline', 'bold'],
          },
        },
      },
    },
    contentType: 'application/vnd.gsma.botmessage.v1.0+json',
  }

  sendMessage(contactId, msg)
}

export function sendMessage (contactId: string, msg: MessageItem) {
  void post(Api.sendMessage, {
    contributionId: 'cb1188a3-37ec-1037-9054-2dc66e443752',
    conversationId: 'cb1188a3-37ec-1037-9054-2dc66e443752',
    destinationAddress: [contactId],
    messageType: msg.messageType,
    smsSupported: true, // 是否转短信 true为 转 false 不转 默认 false
    storeSupported: false, // 是否离线存储。 false:不存也不重 试，true:存，缺省 true
    smsContent: "puppet-walnut-gateway", // 消息回落时的消息 内容， smsSupported为 true时，本字段有 效且 不能为空。
    clientCorrelator: uuidV4(), // 用户自定义数据，响应返回
    content: {
      ...msg
    }
  })
}

export function revoke () {
  void post(Api.revokeMessage, {
    destinationAddress: ['tel:+8613911833788'],
    messageId: 'VqHUSH8qbWFQDlqAGns',
    status: 'RevokeRequested',
  }).then(res => {
    log.info(res.data)
    return null
  },
  )
}
