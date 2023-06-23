import React, { useEffect, useState } from "react";

import Message from './Message'
import { IMessage } from '../../types'

import "./index.scss"
import { Empty } from "antd";
// @ts-ignore
import NoData from "../no_data.svg";
import { v4 as uuidv4 } from "uuid";

export interface IMessagesProps {
  messageList: {[key: string]: IMessage}
  onDelete: (messageId: string) => void
  onSubmitting: boolean
  needShowThinking: boolean
}

function Messages(props: IMessagesProps) {

  const renderLoadingMessage = () => {
    const key = uuidv4().replace(/-/g, '')
    return (
      <Message
        onDelete={(messageId) => props.onDelete(messageId)}
        onSubmitting={false}
        key={key}
        messageId={key}
        isMe={false}
        needShowThinking={props.needShowThinking}
        content={"正在努力为您解答中..."}
      />
    )
  }
  return (
    <div className="message-wrap" id="messages">
      {Object.keys(props?.messageList).length === 0 && (
        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Empty image={NoData} description="开始会话吧" />
        </div>
      ) }
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
      {props.onSubmitting && props.needShowThinking && renderLoadingMessage()}
    </div>
  );
}

export default Messages;