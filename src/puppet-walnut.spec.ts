#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/* eslint-disable sort-keys */
import { test } from 'tstest'

import PuppetWalnut from './puppet-walnut.js'
import * as PUPPET from 'wechaty-puppet'
import type { WalnutMessagePayload } from './help/struct.js'

/**
 *   zrn-fight - https://github.com/zrn-fight
 *
 *   2021.10.14
 *
 *   This test can pass CI.
 *   The job running on runner Hosted Agent will exceede the maximum execution time of 360 minutes.
 *
 *   issue:https://github.com/wechaty/wechaty-puppet-walnut/issues/9
 *
 */

test.skip('PuppetWalnut perfect restart testing', async t => {
  const puppet = new PuppetWalnut()
  for (let n = 0; n < 3; n++) {
    await puppet.start()
    await puppet.stop()
    t.pass('perfect restart succeed at #' + n)
  }
})

const puppet = new PuppetWalnut({
  sipId: '20210401',
  appId: '28871d8c83954bc78424ffcbff80285c',
  appKey: '3b9cc5506af2466aa82eee4c04f86471',
})

test('message parser for text message', async t => {
  const walnutMessagePayload = {
    action: 'text',
    dateTime: '2022-07-01 12:35:45',
    messageId: 'AC6A9C00-78C8-4BCC-9845-0F3BDCBE45EE',
    messageData: 'hello world',
    destinationAddress: 'sip:106500@botplatform.rcs.domain.cn',
    conversationId: '11659C10-78C8-4BCC-9845-0F3BDCBE466E',
    contributionId: '7C6A9C00-78C8-6BCC-9845-0F3BDCBE45AE',
    sender: '17928222350',
    messageItem: 'text',
  }
  const messagePayload = await puppet.messageRawPayloadParser(walnutMessagePayload as WalnutMessagePayload)
  t.ok(
    messagePayload.listenerId === 'sip:106500@botplatform.rcs.domain.cn'
    && messagePayload.roomId === undefined
    && messagePayload.talkerId === '17928222350'
    && messagePayload.text === 'hello world'
    && messagePayload.type === PUPPET.types.Message.Text,
  )
})

test('message parser for image message', async t => {
  const walnutMessagePayload = {
    action: 'file',
    dateTime: '2022-07-01 12:35:45',
    messageId: 'AC6A9C00-78C8-4BCC-9845-0F3BDCBE45EE',
    messageData: 'hello world',
    destinationAddress: 'sip:106500@botplatform.rcs.domain.cn',
    conversationId: '11659C10-78C8-4BCC-9845-0F3BDCBE466E',
    contributionId: '7C6A9C00-78C8-6BCC-9845-0F3BDCBE45AE',
    sender: '17928222350',
    messageItem: 'image',
  }
  const messagePayload = await puppet.messageRawPayloadParser(walnutMessagePayload as WalnutMessagePayload)
  t.ok(
    messagePayload.listenerId === 'sip:106500@botplatform.rcs.domain.cn'
    && messagePayload.roomId === undefined
    && messagePayload.talkerId === '17928222350'
    && messagePayload.text === 'image'
    && messagePayload.type === PUPPET.types.Message.Image,
  )
})

test('message parser for file message', async t => {
  const walnutMessagePayload = {
    action: 'file',
    dateTime: '2022-07-01 12:35:45',
    messageId: 'AC6A9C00-78C8-4BCC-9845-0F3BDCBE45EE',
    messageData: 'hello world',
    destinationAddress: 'sip:106500@botplatform.rcs.domain.cn',
    conversationId: '11659C10-78C8-4BCC-9845-0F3BDCBE466E',
    contributionId: '7C6A9C00-78C8-6BCC-9845-0F3BDCBE45AE',
    sender: '17928222350',
    messageItem: 'other',
  }
  const messagePayload = await puppet.messageRawPayloadParser(walnutMessagePayload as WalnutMessagePayload)
  t.ok(
    messagePayload.listenerId === 'sip:106500@botplatform.rcs.domain.cn'
    && messagePayload.roomId === undefined
    && messagePayload.talkerId === '17928222350'
    && messagePayload.text === 'file'
    && messagePayload.type === PUPPET.types.Message.Attachment,
  )
})
