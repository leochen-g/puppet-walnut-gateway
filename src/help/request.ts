import axios from 'axios'
import { Api } from './api.js'
import { log }  from 'wechaty-puppet'
import PuppetWalnut from '../puppet-walnut.js'
import type { FileBoxInterface } from 'file-box'
import FormData from 'form-data'
import type { FileItem } from './struct.js'
import dayjs from "dayjs";
import sha256 from 'crypto-js/sha256.js'

let headers = {
  'Content-Type': 'application/json',
  'auth': ''
}
function signature(appid:string, appkey:string, nonce:string) {
  const str = `${appid}${appkey}${nonce}`
  return sha256(str).toString();
}
function rndString(randomFlag: boolean, min:number, max:number) {
  let str = '',
    range = min;
  const arr = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
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
    console.log('get token', res.data.data)
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
  const data = new FormData()
  data.append('file', await file.toStream())
  return axios.request({
    data,
    headers: {
      accessToken: headers.auth,
      ...data.getHeaders(),
    },
    method: 'POST',
    url: PuppetWalnut.baseUrl + Api.uploadFile,
  }).then(res => {
    const fileInfo = res.data
    return {
      contentType: fileInfo.contentType,
      fileName: fileInfo.fileName,
      fileSize: fileInfo.fileSize,
      type: 'file',
      until: fileInfo.until,
      url: fileInfo.url,
      fileTid: fileInfo.fileTid
    }
  })
}

export async function downloadFile (fileId:string): Promise<Buffer> {
  return axios.request({
    data: {
      tid: fileId
    },
    headers: {
      accessToken: headers.auth,
      'Content-Type': 'application/json'
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
      accessToken: headers.auth,
      'Content-Type': 'application/json',
    },
    method: 'GET',
    url: PuppetWalnut.baseUrl + url,
  })
}

export function post (url: string, data = {}) {
  return axios.request({
    data,
    headers: {
      accessToken: headers.auth,
      'Content-Type': 'application/json',
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
