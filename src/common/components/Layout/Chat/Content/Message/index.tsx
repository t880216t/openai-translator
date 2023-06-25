import React from "react";
import { Button, Avatar, Tooltip, Space } from "antd";
import { CopyOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyButton } from '@mantine/core';
import { useTheme } from "../../../../../hooks/useTheme";
import { getIcon } from "../../../../../assets/icon_utils";

// @ts-ignore
import ChatGPTLogo from './ChatGPT_logo.svg';
import { Markdown } from './markdown'
import { IMessage, ISource } from '../../../types'
import Cursor from "./Cursor"

import "./index.scss"
import { IKnowledge } from "../../../Knowledge";

interface IMessageProps extends IMessage {
  messageId: string
  isMe: boolean
  sources?: ISource[]
  onSubmitting: boolean
  needShowThinking?: boolean
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
          {props.needShowThinking ? <Cursor /> : <Markdown submitState={props.onSubmitting} content={props.content || ''} />}
        </div>
        <div className="action-wrap">
          <div className="sources">
            <Space>
              {props.sources?.map((item: ISource, index) => (
                <Tooltip
                  key={`${item.source}_${index}`}
                  title={
                    <pre className="pre-content">{item.content}</pre>
                  }
                >
                  <Button type="text" icon={<img src={getIcon(item.source)} style={{width: 20, height: 20}} />} />
                </Tooltip>
              ))}
            </Space>
          </div>
          <div className="action">
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
    </div>
  );
}

export default Message;