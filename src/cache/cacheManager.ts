import os from 'os'
// @ts-ignore
import LRU from 'lru-cache'
import path from 'path'
import fs from 'fs-extra'
import { FlashStore } from 'flash-store'
import PuppetWalnut from '../puppet-walnut.js'
import type { WalnutContactPayload, WalnutMessagePayload } from '../help/struct'
import { log } from '../config.js'

const PRE = 'CacheManager'

class CacheManager {

  /**
   * ************************************************************************
   *                Instance Methods
   * ************************************************************************
   */

  protected cacheMessageRawPayload?: LRU<string, WalnutMessagePayload>
  protected cacheContactRawPayload?: FlashStore<string, WalnutContactPayload>

  /**
   * ************************************************************************
   *                Static Methods
   * ************************************************************************
   */

  async init () {
    log.verbose(PRE, 'init()')
    if (this.cacheMessageRawPayload) {
      throw new Error('PayloadStore should be stop() before start() again.')
    }
    const baseDir = path.join(
      os.homedir(),
      path.sep,
      '.wechaty',
      path.sep,
      'puppet-walnut-cache',
      path.sep,
      PuppetWalnut.sipId,
      path.sep,
    )
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }
    this.cacheContactRawPayload = new FlashStore(path.join(baseDir, 'contactRawPayload'))

    const lruOptions: LRU.Options<string, WalnutMessagePayload> = {
      // @ts-ignore
      dispose (key: string, val: any) {
        log.silly('PayloadStore', `constructor() lruOptions.dispose(${key}, ${JSON.stringify(val)})`)
      },
      max    : 1000,
      maxAge : 1000 * 60 * 60,
    }
    this.cacheMessageRawPayload = new LRU<string, WalnutMessagePayload>(lruOptions)
  }

  async stop () {
    log.verbose('PayloadStore', 'stop()')

    if (this.cacheMessageRawPayload) {
      this.cacheMessageRawPayload = undefined
    }
    if (this.cacheContactRawPayload) {
      await this.cacheContactRawPayload.close()
      this.cacheContactRawPayload = undefined
    }
  }

  /**
   * -------------------------------
   * Message Section
   * --------------------------------
   */

  public async getMessage (messageId: string): Promise<WalnutMessagePayload | undefined> {
    if (!this.cacheMessageRawPayload) {
      throw new Error(`${PRE} getMessage() has no cache.`)
    }
    log.verbose(PRE, `getMessage(${messageId})`)
    return this.cacheMessageRawPayload.get(messageId)
  }

  public async setMessage (messageId: string, payload: WalnutMessagePayload): Promise<void> {
    if (!this.cacheMessageRawPayload || !messageId) {
      throw new Error(`${PRE} setMessage() has no cache.`)
    }
    log.verbose(PRE, `setMessage(${messageId}): ${JSON.stringify(payload)}`)
    await this.cacheMessageRawPayload.set(messageId, payload)
  }

  /**
   * -------------------------------
   * Contact Section
   * --------------------------------
   */
  public async getContact (contactId: string): Promise<WalnutContactPayload | undefined> {
    if (!this.cacheContactRawPayload) {
      throw new Error(`${PRE} getContact() has no cache.`)
    }
    log.verbose(PRE, `getContact(${contactId})`)
    if (!await this.cacheContactRawPayload.has(contactId)) {
      const payload = { name: contactId, phone: contactId }
      await this.cacheContactRawPayload.set(contactId, payload)
      return payload
    }
    return await this.cacheContactRawPayload.get(contactId)
  }

  public async getContactList (selfId: string): Promise<string[]> {
    if (!this.cacheContactRawPayload) {
      throw new Error(`${PRE} getContactList(${selfId}) has no cache.`)
    }
    const result: string[] = []
    for await (const contactId of this.cacheContactRawPayload.keys()) {
      if (contactId !== selfId) {
        result.push(contactId)
      }
    }
    return result
  }

  public async setContact (contactId: string, payload: WalnutContactPayload): Promise<void> {
    if (!this.cacheContactRawPayload || !contactId) {
      throw new Error(`${PRE} setContact() has no cache.`)
    }
    log.verbose(PRE, `setContact(${contactId}): ${JSON.stringify(payload)}`)
    await this.cacheContactRawPayload.set(contactId, payload)
  }

  public async setContactAlias (contactId: string, alias: string): Promise<void> {
    if (!this.cacheContactRawPayload || !contactId) {
      throw new Error(`${PRE} setContact() has no cache.`)
    }
    log.verbose(PRE, `setContactAlias(${contactId}): ${alias}`)
    const payload = await this.cacheContactRawPayload.get(contactId)
    payload!.name = alias
    await this.cacheContactRawPayload.set(contactId, payload!)
  }

}
export { CacheManager }
