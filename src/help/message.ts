import { post, uploadFile } from './request.js'
import { Api } from './api.js'
import { v4 as uuidV4 } from 'uuid'
import { log } from '../config.js'
import type { FileBoxInterface } from 'file-box'
import type { MessageItem, SuggestionItem, UserSuggestionItem } from './struct.js'
import type * as PUPPET from 'wechaty-puppet'

function formatSuggestion (list?: UserSuggestionItem[] | undefined) {
  if (!list || !list.length) return []
  const res:SuggestionItem[] = []
  list.forEach((item:UserSuggestionItem) => {
    const obj: SuggestionItem = {
      actionParams: {},
      displayText: item.displayText,
      postbackData: '',
      type: item.type,
    }
    switch (item.type) {
      case 'reply':
        obj.postbackData = item.content || item.displayText
        break
      case 'urlAction':
        obj.actionParams = {
          application: 'webview',
          url: item.content,
          viewMode: 'full',
        }
        break
      case 'dialerAction':
        obj.actionParams = {
          phoneNumber: item.content,
        }
        break
      case 'mapAction':
        obj.actionParams = {
          label: item.label,
          latitude: item.content.replace('，', ',').split(',')[0],
          longitude: item.content.replace('，', ',').split(',')[1],
        }
        break
      default:
        break
    }
    res.push(obj)
  })
  return res
}

export function sendTextMessage (contactId: string, msg: string, suggestion?: UserSuggestionItem[]) {
  sendMessage(contactId, {
    messageType: 'text',
    suggestions: formatSuggestion(suggestion),
    text: msg,
  })
}

export function sendLocationMessage (contactId: string, locationPayload: PUPPET.payloads.Location, suggestion?: UserSuggestionItem[]) {
  log.info(JSON.stringify(locationPayload))
  sendMessage(contactId, {
    messageType: 'text',
    suggestions: formatSuggestion(suggestion),
    text: 'geo:50.7311865,7.0914591;crs=gcj02;u=10;rcs-l=Qingfeng%20Steamed%20Dumpling%20Shop %20%F0%9F%8D%9A',
  })
}

export async function sendFileMessage (contactId: string, file: FileBoxInterface, suggestion?: UserSuggestionItem[]) {
  const fileItem = await uploadFile(file)

  sendMessage(contactId, {
    fileId: fileItem.fileTid,
    messageType: 'file',
    suggestions: formatSuggestion(suggestion),
    thumbnailId: fileItem.thumbnailTid,
  })
}

export async function sendPostMessage (contactId: string, postPayload: PUPPET.payloads.Post, suggestion?: UserSuggestionItem[]) {
  const title = postPayload.sayableList[0] as PUPPET.payloads.Sayable
  const description = postPayload.sayableList[1] as PUPPET.payloads.Sayable
  const img = postPayload.sayableList[2] as PUPPET.payloads.Sayable
  if (title.type !== 'Text' || description.type !== 'Text' || img.type !== 'Attachment') {
    throw new Error('Wrong Post!!! please check your Post payload to make sure it right')
  }
  const fileItem = await uploadFile((<FileBoxInterface>img.payload.filebox))

  const msg = {
    media: [
      {
        contentDescription: description.payload.text,
        description: description.payload.text,
        height: 'MEDIUM_HEIGHT',
        mediaId: fileItem.fileTid,
        suggestions: formatSuggestion(suggestion),
        thumnailId: fileItem.thumbnailTid,
        title: title.payload.text,
      },
    ],
    messageType: 'card',
  }
  sendMessage(contactId, msg)
}

export function sendMessage (contactId: string, msg: MessageItem) {
  void post(Api.sendMessage, {
    clientCorrelator: uuidV4(), // 用户自定义数据，响应返回
    content: {
      ...msg,
    },
    contributionId: 'cb1188a3-37ec-1037-9054-2dc66e443752',
    conversationId: 'cb1188a3-37ec-1037-9054-2dc66e443752',
    destinationAddress: [contactId],
    messageType: msg.messageType,
    smsContent: 'puppet-walnut-gateway', // 消息回落时的消息 内容， smsSupported为 true时，本字段有 效且 不能为空。
    smsSupported: true, // 是否转短信 true为 转 false 不转 默认 false
    storeSupported: false, // 是否离线存储。 false:不存也不重 试，true:存，缺省 true

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
