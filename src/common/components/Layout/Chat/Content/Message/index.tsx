import React from "react";
import { Button, Avatar, Tooltip } from "antd";
import { CopyOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyButton } from '@mantine/core';
import { useTheme } from "../../../../../hooks/useTheme";

// @ts-ignore
import ChatGPTLogo from './ChatGPT_logo.svg';
import { Markdown } from './markdown'
import { IMessage } from '../../../types'

import "./index.scss"

interface IMessageProps extends IMessage {
  messageId: string
  isMe: boolean
  onSubmitting: boolean
  onDelete?: (messageId: string) => void
}

function Message(props: IMessageProps) {
  const { theme, themeType } = useTheme()

  const handleDelete = () => {
    props.onDelete?.(props.messageId)
  }

  return (
    <div
      className={`message ${props?.isMe ? "me": "other"}`}
      style={{
        color: theme.colors.contentSecondary,
        background: props?.isMe ? theme.colors.backgroundSecondary: theme.colors.backgroundPrimary
      }}
    >
      <div className={`logo ${props.isMe? "": ""}`}>
        {props?.isMe ? <Avatar size={28} shape="square"  style={{background: '#be2edd'}} icon={<UserOutlined />} /> :
          <Avatar size={28} shape="square" src={<img src={ChatGPTLogo} alt="ChatGPT Logo" />} />
        }
      </div>
      <div className="content-wrap">
        <div className="content">
          <Markdown submitState={props.onSubmitting} content={props.content || ''} />
        </div>
        <div className="action-wrap">
          <CopyButton value={props.content || ''}>
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