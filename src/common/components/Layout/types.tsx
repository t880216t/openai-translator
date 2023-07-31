import React from "react/index";
import { ISettings } from "../../types";

export interface IInnerProps {
  uuid?: string
  text?: string
  autoFocus?: boolean
  showSettings?: boolean
  defaultShowSettings?: boolean
  containerStyle?: React.CSSProperties
  editorRows?: number
  onSettingsSave?: (oldSettings: ISettings) => void
  onMessageResult?: (message: IMessage) => void
}

export interface ISource {
  source: string,
  content: string,
}

export interface IMessage {
  role?: string,
  messageId: string,
  content: string,
  sources?: ISource[],
  createAt?: number,
  finishReason?: string,
}

export interface IMessageDBProps{
  history_id: number | undefined
  message_id: string
  content: string
  role: string
  createdAt: number
  add_time: string
}

export interface IHistoryDBProps {
  idx: number
  name: string
  description?: string
  status: number
  updatedAt: string
  createdAt: string
}