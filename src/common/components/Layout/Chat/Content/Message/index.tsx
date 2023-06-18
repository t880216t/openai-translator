import React, { useEffect, useRef, useState } from "react";
import { Button, Avatar, Tooltip } from "antd";
import { CopyOutlined, UserOutlined, NotificationOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyButton } from '@mantine/core';

import "./index.scss"
import { IMessage } from "../../../../types";
// @ts-ignore
import ChatGPTLogo from './ChatGPT_logo.svg';
import { Markdown } from './markdown'

interface IMessageProps extends IMessage {
  onDelete?: (messageId: string) => void
}

function Message(props: IMessageProps) {
  const [content, setContent] = useState(props.text)

  useEffect(() => {
    setContent(props.text)
  }, [props.text])

  const handleDelete = () => {
    props.onDelete?.(props.messageId)
  }

  return (
    <div className={`message ${props?.isMe ? "me": "other"}`}>
      <div className={`logo ${props.isMe? "": ""}`}>
        {props?.isMe ? <Avatar size={36} shape="square"  style={{background: '#be2edd'}} icon={<UserOutlined />} /> :
          <Avatar size={36} shape="square" src={<img src={ChatGPTLogo} alt="ChatGPT Logo" />} />
        }
      </div>
      <div className="content-wrap">
        <div className="content">
          <Markdown submitState={props.submitState} content={content || ''} />
        </div>
        <div className="action-wrap">
          <CopyButton value={content || ''}>
            {({ copy }) => (
              <Tooltip title="复制">
                <Button onClick={copy} type="text" icon={<CopyOutlined style={{color: '#b3b3ba'}} />} />
              </Tooltip>
            )}
          </CopyButton>
          <div>
            <Tooltip title="删除">
              <Button onClick={handleDelete} type="text" icon={<DeleteOutlined style={{color: '#b3b3ba'}} />} />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;