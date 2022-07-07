import request from 'request'
import type {FileBoxInterface} from "file-box";
import type {FileItem} from "./struct.js";
import {Api} from "./api.js";
import {log} from "wechaty-puppet";
import { FileBox } from 'file-box'
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NzM2NTMzNzUxIiwiZXhwIjoxNjU3MTgxMjM4fQ.rxW28X9Xl8CQaH3GkR08_fNFSG3yWizDciNootj5M2A'

export async function uploadFile(file: FileBoxInterface): Promise<FileItem> {
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
        value: '',
      },
    },
    headers: {
      accessToken: token,
    },
    method: 'POST',
    url: 'http://oapi.5g-msg.com:31001/walnut/v1' + Api.uploadFile,
  }
  return new Promise((resolve, reject) => {
    request(options, function (error: any, response: any) {
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

const file = FileBox.fromUrl('https://img.aibotk.com/aibotk/public/kbap8w56GBZWqjYd_loudong.png')
uploadFile(file).then(res=> {
  console.log('res', res)
})
