import axios from 'axios'
import { Api } from './api.js'
import { log }  from 'wechaty-puppet'
import PuppetWalnut from '../puppet-walnut.js'
import type { FileBoxInterface } from 'file-box'
import type { FileItem } from './struct.js'
import dayjs from 'dayjs'
import sha256 from 'crypto-js/sha256.js'
import request from 'request'

const headers = {
  'Content-Type': 'application/json',
  auth: '',
}
function signature (appid:string, appkey:string, nonce:string) {
  const str = `${appid}${appkey}${nonce}`
  return sha256(str).toString()
}
function rndString (randomFlag: boolean, min:number, max:number) {
  let str = ''
  let range = min
  const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min
  }
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}

export async function initToken () {
  const nonce = `${dayjs().format('YYYYMMDDHHmmss')}${rndString(true, 8, 8)}`
  const sig = signature(PuppetWalnut.appId, PuppetWalnut.appKey, nonce)
  await axios.request({
    data: {
      appId: PuppetWalnut.appId,
      nonce: nonce,
      signature: sig,
    },
    headers: headers,
    method: 'POST',
    url: PuppetWalnut.baseUrl + Api.accessToken,
  }).then(res => {
    log.verbose('get token', res.data.data)
    headers.auth = res.data.data.token
    log.info('update-token', `${res.data.data.token}`)
    return null
  })
}

export function updateToken () {
  const nonce = `${dayjs().format('YYYYMMDDHHmmss')}${rndString(true, 8, 8)}`
  const sig = signature(PuppetWalnut.appId, PuppetWalnut.appKey, nonce)
  void axios.request({
    data: {
      appId: PuppetWalnut.appId,
      nonce: nonce,
      signature: sig,
    },
    headers: headers,
    method: 'POST',
    url: PuppetWalnut.baseUrl + Api.accessToken,
  }).then(res => {
    // @ts-ignore
    headers.auth = res.data.data.token
    // @ts-ignore
    log.info('update-token', `${res.data.data.token}`)
    return null
  })
}

export async function uploadFile (file: FileBoxInterface): Promise<FileItem> {
  const stream = await file.toStream()
  const options = {
    formData: {
      file: {
        options: {
          contentType: null,
          filename: file.name,
        },
        value: stream,
      },
      thumbnail: {
        options: {
          contentType: null,
          filename: file.name,
        },
        value: stream,
      },
    },
    headers: {
      accessToken: headers.auth,
    },
    method: 'POST',
    url: PuppetWalnut.baseUrl + Api.uploadFile,
  }
  return new Promise((resolve, reject) => {
    request(options, function (error:any, response:any) {
      if (error) {
        reject(error)
      }
      log.info('update-file', `${response.body}`)
      const fileInfo = JSON.parse(response.body)?.data || {}
      resolve({
        fileTid: fileInfo?.fileTid,
        thumbnailTid: fileInfo?.thumbnailTid,
      })
    })
  })
}

export async function downloadFile (fileId:string): Promise<Buffer> {
  return axios.request({
    data: {
      tid: fileId,
    },
    headers: {
      'Content-Type': 'application/json',
      accessToken: headers.auth,
    },
    method: 'POST',
    responseType: 'arraybuffer',
    url: PuppetWalnut.baseUrl + Api.downloadFile,
  }).then(res => {
    return res.data
  })
}

export function get (url: string, data = {}) {
  return axios.request({
    data,
    headers: {
      'Content-Type': 'application/json',
      accessToken: headers.auth,
    },
    method: 'GET',
    url: PuppetWalnut.baseUrl + url,
  })
}

export function post (url: string, data = {}) {
  return axios.request({
    data,
    headers: {
      'Content-Type': 'application/json',
      accessToken: headers.auth,
    },
    method: 'POST',
    url: PuppetWalnut.baseUrl + url,
  })
}

axios.interceptors.request.use(
  function (config) {
    // log.silly('PuppetWalnut-Axios',
    //   `Params: ${util.inspect(config.data, false, 4, true)}, Url: ${config.url}`)
    return config
  },
)

axios.interceptors.response.use(
  function (response) {
    log.silly('PuppetWalnut-Axios',
      `Response: ${JSON.stringify(response.data)}`)
    // if (response.data.errorCode !== 0) {
    //   log.error('PuppetWalnut-Axios', JSON.stringify(response.data))
    // }
    return response
  }, function (error) {
    log.info(error)
    return Promise.reject(error)
  },
)
