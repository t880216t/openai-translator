import React, { useEffect, useRef, useState } from "react";
import { Button, Avatar, Tooltip } from "antd";
import { CopyOutlined, UserOutlined, NotificationOutlined, DeleteOutlined } from '@ant-design/icons'
import { CopyButton } from '@mantine/core';

import "./index.scss"
import { IMessage } from "../../../../types";
// @ts-ignore
import ChatGPTLogo from '../../../../assets/images/ChatGPT_logo.svg';
import { Markdown } from './markdown'
import { speak } from "../../../../tts";
import { detectLang, LangCode } from "../../../lang/lang";

interface IMessageProps extends IMessage {
  onDelete?: (messageId: string) => void
}

function Message(props: IMessageProps) {
  const [content, setContent] = useState(props.text)
  const [isSpeakingText, setIsSpeakingText] = useState(false)
  const [sourceLang, setSourceLang] = useState<LangCode>('en')

  const stopSpeakRef = useRef<() => void>(() => null)

  useEffect(() => {
    setContent(props.text)
  }, [props.text])

  const handleEditSpeakAction = async () => {
    const sourceLang_ = await detectLang(content)
    setSourceLang(sourceLang_)
    if (isSpeakingText) {
      stopSpeakRef.current()
      setIsSpeakingText(false)
      return
    }
    setIsSpeakingText(true)
    const { stopSpeak } = await speak({
      text: content || '',
      lang: sourceLang,
      onFinish: () => setIsSpeakingText(false),
    })
    stopSpeakRef.current = stopSpeak
  }

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
          {props?.isMe && (
            <div>
              <Tooltip title="播放">
                <Button onClick={handleEditSpeakAction} type="text" icon={<NotificationOutlined style={{color: '#b3b3ba'}} />} />
              </Tooltip>
            </div>
          )}
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