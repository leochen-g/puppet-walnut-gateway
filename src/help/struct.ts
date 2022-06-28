export interface FileItem {
  contentType: string,
  fileName: string,
  fileSize: string,
  type: string,
  until: string,
  url: string,
  fileTid: string,
  thumbnailTid?: string | ''
}

export interface MessageItem {
  messageType: string,
  text?: string,
  suggestions?: SuggestionItem[],
  media?: [],
  thumbnailId?: string,
  fileId?: string
}

export interface SuggestionItem {
  type: string,
  displayText: string,
  postbackData: string,
  actionParams: {}
}

export enum MessageRawType {
  image = 'image',
  text = 'text',
  location = 'location',
  audio = 'audio',
  video = 'video',
  contact = 'vcf',
  other = 'other'
}
export enum ActionRawType {
  shareData = 'shareData',
  action = 'action',
  reply = 'reply',
  text = 'text',
  file = 'file'
}

export interface WalnutMessagePayload {
  // refer to: https://github.com/fabian4/puppet-walnut/blob/main/docs/%E6%8E%A5%E5%8F%A3%E8%A7%84%E8%8C%83.md#30
  contributionId: string,
  conversationId: string,
  dateTime: string,
  destinationAddress: string,
  messageFileSize: number,
  messageId: string,
  messageItem: MessageRawType,
  messageList: MessageItem[],
  senderAddress: string,
  sender: string,
  messageData: string,
  action: ActionRawType
}

export interface WalnutContactPayload {
  name: string
  phone: string
}
