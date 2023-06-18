import React from "react/index";
import { IMessage, ISettings } from "../../types";

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

export interface IMessage {
  role?: string,
  messageId: string,
  content: string,
  createAt: number,
}