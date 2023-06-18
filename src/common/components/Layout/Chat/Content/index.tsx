import React, { useEffect, useState } from "react";
import { Button } from "antd";

import Message from './Message'
import { IMessage } from "../../../types";

import "./index.scss"

export interface IMessagesProps {
  messageList: {[key: string]: IMessage}
  submitState: number
  onDelete: (messageId: string) => void
}

function Messages(props: IMessagesProps) {
  const [list, setList] = useState(props.messageList)

  useEffect(() => {
    setList(props.messageList)
  }, [props.messageList])

  return (
    <div className="message-wrap" id="messages">
      {list && Object.keys(list).map((key) => {
        return <Message onDelete={(messageId) => props.onDelete(messageId)} submitState={props.submitState} key={key} messageId={key} isMe={list[key].isMe} text={list[key].text} />
      })}
    </div>
  );
}

export default Messages;