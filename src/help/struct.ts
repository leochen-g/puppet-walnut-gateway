export interface FileItem {
  url?: string,
  fileTid: string,
  thumbnailTid?: string | ''
}

export interface SuggestionItem {
  type: string,
  displayText: string,
  postbackData: string,
  actionParams?: {}
}

export interface MediaItem {
  mediaId: string,
  thumnailId: string | undefined,
  height: string,
  contentDescription: string| undefined,
  title: string| undefined,
  description: string| undefined,
  suggestions?: SuggestionItem[],
}

export interface MessageItem {
  messageType: string,
  text?: string,
  suggestions?: SuggestionItem[],
  media?: MediaItem[],
  thumbnailId?: string,
  fileId?: string
}

export interface UserSuggestionItem {
  type: string,
  displayText: string,
  content: string,
  label?: string
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
  action: ActionRawType
  conversationId: string,
  contributionId: string,
  dateTime: string,
  destinationAddress: string,
  messageId: string,
  messageItem: MessageRawType,
  messageData: string,
  sender: string,
}

export interface WalnutContactPayload {
  name: string
  phone: string
}
