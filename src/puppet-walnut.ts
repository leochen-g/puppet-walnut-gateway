/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import * as PUPPET from 'wechaty-puppet'
import type { FileBoxInterface } from 'file-box'
import { FileBox } from 'file-box'
import { initServer } from './server/server.js'
import { config, log, VERSION } from './config.js'
import { initToken, updateToken, downloadFile } from './help/request.js'
import type { WalnutContactPayload, WalnutMessagePayload } from './help/struct.js'
import { MessageRawType } from './help/struct.js'
import { sendFileMessage, sendLocationMessage, sendMessage, sendPostMessage, sendTextMessage } from './help/message.js'
import { CacheManager } from './cache/cacheManager.js'

import { checkPhoneNumber } from './help/utils.js'
import { parse } from 'vcard4'

export type PuppetWalnutOptions = PUPPET.PuppetOptions & {
  sipId?: string,
  appId?: string,
  appKey?: string,
  port?: number,
  notifyUrlPrefix?: string
}

class PuppetWalnut extends PUPPET.Puppet {
  static port: number
  static sipId: string
  static appId: string
  static appKey: string
  static baseUrl: string
  static chatbotId: string
  static instance: PuppetWalnut
  static notifyUrlPrefix: string
  static cacheManager: CacheManager
  static override readonly VERSION = VERSION

  constructor (options?: PuppetWalnutOptions) {
    super(options)
    PuppetWalnut.instance = this
    PuppetWalnut.port = options?.port || config.port
    PuppetWalnut.sipId = options?.sipId || process.env['WECHATY_PUPPET_WALNUT_SIPID'] || ''
    PuppetWalnut.appId = options?.appId || process.env['WECHATY_PUPPET_WALNUT_APPID'] || ''
    PuppetWalnut.appKey = options?.appKey || process.env['WECHATY_PUPPET_WALNUT_APPKEY'] || ''
    PuppetWalnut.notifyUrlPrefix = options?.notifyUrlPrefix || ''
    if (!PuppetWalnut.sipId || !PuppetWalnut.appId || !PuppetWalnut.appKey) {
      throw new Error('Set your Environment variables')
    }
    PuppetWalnut.chatbotId = `sip:${PuppetWalnut.sipId}@botplatform.rcs.chinaunicom.cn`
    PuppetWalnut.baseUrl = `http://${config.serverRoot}/walnut/${config.apiVersion}`
    log.verbose('PuppetWalnut', 'constructor("%s")', JSON.stringify(options))
    PuppetWalnut.cacheManager = new CacheManager()
  }

  override async onStart (): Promise<void> {

    await initServer(PuppetWalnut.port, PuppetWalnut.notifyUrlPrefix + '/' +PuppetWalnut.chatbotId )

    await PuppetWalnut.cacheManager.init()

    await initToken()

    setInterval(updateToken, 2 * 60 * 60 * 1000)

    this.login(PuppetWalnut.chatbotId)

    return Promise.resolve(undefined)
  }

  override async onStop (): Promise<void> {
    log.verbose('PuppetWalnut', 'onStop()')
    if (this.isLoggedIn) {
      await this.logout()
    }
    await PuppetWalnut.cacheManager.stop()
    return Promise.resolve(undefined)
  }

  /**
   *
   * Contact
   *
   */
  override contactSelfName (_name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactSelfQRCode (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override contactSelfSignature (_signature: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactAlias(contactId: string): Promise<string>
  override contactAlias(contactId: string, alias: string | null): Promise<void>

  override async contactAlias (contactId: string, alias?: string | null): Promise<void | string> {
    log.verbose('PuppetWalnut', 'contactAlias(%s, %s)', contactId, alias)
    if (typeof alias === 'undefined') {
      return 'mock alias'
    }
    if (alias !== null) {
      await PuppetWalnut.cacheManager.setContactAlias(contactId, alias)
    }
  }

  override async contactPhone(contactId: string): Promise<string[]>
  override async contactPhone(contactId: string, phoneList: string[]): Promise<void>

  override async contactPhone (contactId: string, phoneList?: string[]): Promise<string[] | void> {
    log.verbose('PuppetWalnut', 'contactPhone(%s, %s)', contactId, phoneList)
    if (typeof phoneList === 'undefined') {
      return []
    }
  }

  override async contactCorporationRemark (contactId: string, corporationRemark: string) {
    log.verbose('PuppetWalnut', 'contactCorporationRemark(%s, %s)', contactId, corporationRemark)
  }

  override async contactDescription (contactId: string, description: string) {
    log.verbose('PuppetWalnut', 'contactDescription(%s, %s)', contactId, description)
  }

  override async contactList (): Promise<string[]> {
    log.verbose('PuppetWalnut', 'contactList()')
    return await PuppetWalnut.cacheManager.getContactList(PuppetWalnut.chatbotId)
  }

  override async contactAvatar(contactId: string): Promise<FileBoxInterface>
  override async contactAvatar(contactId: string, file: FileBoxInterface): Promise<void>

  override async contactAvatar (contactId: string, file?: FileBoxInterface): Promise<void | FileBoxInterface> {
    log.verbose('PuppetWalnut', 'contactAvatar(%s)', contactId)
    if (file) {
      return
    }
    return FileBox.fromUrl(config.avatarUrl)
  }

  override async contactRawPayloadParser (rawPayload: WalnutContactPayload): Promise<PUPPET.payloads.Contact> {
    return {
      alias: rawPayload.name,
      avatar: config.avatarUrl,
      friend: true,
      gender: PUPPET.types.ContactGender.Unknown,
      id: rawPayload.phone,
      name: rawPayload.phone,
      phone: [rawPayload.phone],
      type: PUPPET.types.Contact.Individual,
    }
  }

  override async contactRawPayload (contactId: string): Promise<WalnutContactPayload | undefined> {
    log.verbose('PuppetWalnut', 'contactRawPayload(%s)', contactId)
    checkPhoneNumber(contactId)
    return PuppetWalnut.cacheManager.getContact(contactId)
  }

  /**
   *
   * Message
   *
   */
  override async messageRawPayloadParser (rawPayload: WalnutMessagePayload): Promise<PUPPET.payloads.Message> {
    log.verbose('PuppetWalnut', 'messageRawPayloadParser(%s)', rawPayload.messageId)
    const res = {
      id: rawPayload.messageId,
      listenerId: rawPayload.destinationAddress,
      talkerId: rawPayload.sender,
      text: rawPayload.messageData,
      timestamp: Date.parse(rawPayload.dateTime),
      type: PUPPET.types.Message.Text,
    }
    switch (rawPayload.messageItem) {
      case MessageRawType.text:
        break
      case MessageRawType.image:
        res.type = PUPPET.types.Message.Image
        res.text = 'image'
        break
      case MessageRawType.video:
        res.type = PUPPET.types.Message.Video
        res.text = 'video'
        break
      case MessageRawType.audio:
        res.type = PUPPET.types.Message.Audio
        res.text = 'audio'
        break
      case MessageRawType.location:
        res.type = PUPPET.types.Message.Location
        res.text = 'location'
        break
      case MessageRawType.contact:
        res.type = PUPPET.types.Message.Contact
        res.text = 'contact'
        break
      case MessageRawType.other:
        res.type = PUPPET.types.Message.Attachment
        res.text = 'file'
        break
    }
    return res
  }

  override async messageRawPayload (messageId: string): Promise<WalnutMessagePayload | undefined> {
    log.verbose('PuppetWalnut', 'messageRawPayload(%s)', messageId)
    return PuppetWalnut.cacheManager.getMessage(messageId)
  }

  override async messageImage (messageId: string, imageType: PUPPET.types.Image) : Promise<FileBoxInterface> {
    log.verbose('PuppetWalnut', 'messageImage(%s, %s)', messageId, imageType)
    const messagePayload = await this.messageRawPayload(messageId)
    const fileId = messagePayload && JSON.parse(messagePayload.messageData)
    const fileStream = await downloadFile(fileId)
    if (!fileId || !fileStream) {
      throw new Error('Wrong message structs!')
    }
    if (imageType === PUPPET.types.Image.Thumbnail) {
      return FileBox.fromBuffer(fileStream)
    }
    return FileBox.fromBuffer(fileStream)
  }

  override async messageFile (messageId: string) : Promise<FileBoxInterface> {
    log.verbose('PuppetWalnut', 'messageFile(%s)', messageId)
    const messagePayload = await this.messageRawPayload(messageId)
    const fileId = messagePayload && JSON.parse(messagePayload.messageData)
    const fileStream = await downloadFile(fileId)
    if (!fileId || !fileStream) {
      throw new Error('Wrong message structs!')
    }
    if (messagePayload?.messageItem === MessageRawType.video) {
      return FileBox.fromBuffer(fileStream)
    }
    return FileBox.fromBuffer(fileStream)
  }

  override async messageContact (messageId: string) : Promise<string> {
    log.verbose('PuppetWalnut', 'messageContact(%s)', messageId)
    const messagePayload = await this.messageRawPayload(messageId)
    const fileId = messagePayload && JSON.parse(messagePayload.messageData)
    const fileStream = await downloadFile(fileId)
    if (!fileId || !fileStream) {
      throw new Error('Wrong message structs!')
    }
    const contact = await FileBox.fromBuffer(fileStream).toBuffer()
    const cards = parse(contact.toString())
    // @ts-ignore
    return cards.TEL.value
  }

  override async messageSendText (conversationId: string, msg: string): Promise<void> {
    log.verbose('PuppetWalnut', 'messageSendText(%s, %s)', conversationId, msg)
    sendTextMessage(conversationId, msg)
  }

  override async messageSendLocation (conversationId: string, locationPayload: PUPPET.payloads.Location): Promise<void> {
    log.verbose('PuppetWalnut', 'messageSendLocation(%s, %s)', conversationId, locationPayload)
    sendLocationMessage(conversationId, locationPayload)
  }

  override async messageSendFile (conversationId: string, file: FileBoxInterface): Promise<void> {
    log.verbose('PuppetWalnut', 'messageSendFile(%s, %s)', conversationId, file)
    await sendFileMessage(conversationId, file)
  }

  override async messageForward (conversationId: string, messageId: string): Promise<void> {
    log.verbose('PuppetWalnut', 'messageForward(%s, %s)', conversationId, messageId)
    const message = await PuppetWalnut.cacheManager.getMessage(messageId)
    if (message && message.messageList[0]) {
      sendMessage(conversationId, message.messageList[0])
    } else {
      throw new Error('Message is Empty!')
    }
  }

  /**
   *
   * Post
   *
   */

  override async messageSendPost (conversationId: string, postPayload: PUPPET.payloads.Post): Promise<void> {
    log.verbose('PuppetWalnut', 'messageSendPost(%s, %s)', conversationId, postPayload)
    await sendPostMessage(conversationId, postPayload)
  }

  override async postRawPayload (postId: string): Promise<any> {
    log.verbose('PuppetWalnut', 'postRawPayload(%s)', postId)
    return { postId } as any
  }

  override async postRawPayloadParser (rawPayload: any): Promise<PUPPET.payloads.Post> {
    log.verbose('PuppetWalnut', 'postRawPayloadParser(%s)', rawPayload.id)
    return rawPayload
  }

  override async postSearch (
    filter      : PUPPET.filters.Post,
    pagination? : PUPPET.filters.PaginationRequest,
  ): Promise<PUPPET.filters.PaginationResponse<string[]>> {
    log.verbose('PuppetWalnut', 'postSearch(%s, %s)',
      JSON.stringify(filter),
      JSON.stringify(pagination),
    )
    return {
      nextPageToken: undefined,
      response: [],
    }
  }

}

export default PuppetWalnut
