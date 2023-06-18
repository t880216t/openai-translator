import React, { useEffect, useState } from "react";

import Message from './Message'
import { IMessage } from '../../types'

import "./index.scss"

export interface IMessagesProps {
  messageList: {[key: string]: IMessage}
  onDelete: (messageId: string) => void
  onSubmitting: boolean
}

function Messages(props: IMessagesProps) {
  return (
    <div className="message-wrap" id="messages">
      {props?.messageList && Object.keys(props.messageList).map((key) => {
        return (
          <Message
            onDelete={(messageId) => props.onDelete(messageId)}
            onSubmitting={props.onSubmitting}
            key={key}
            messageId={key}
            isMe={props.messageList[key].role=="user"}
            content={props.messageList[key].content}
          />
        )
      })}
    </div>
  );
}

export default Messages;