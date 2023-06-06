import React, { useEffect, useState } from "react";
import {SendOutlined} from '@ant-design/icons'
import { Input, Button, Mentions } from 'antd';
import {IProps} from '../index'
import {chat} from '../../../chat'

import './index.scss'
import { IMessage } from "../../../types";

interface RMessage {
  messageId: string
  content: string
  isFullText: boolean
  uuid: string
}

const { TextArea } = Input;

function Send(props: IProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [result, setResult] = useState<IMessage | null>(null);
  const [userPrompts, setUserPrompts] = useState<string[]>(props.assistantPrompts || [])

  useEffect(() => {
    console.log("assistantPrompts props update", props.assistantPrompts);
    setUserPrompts(props.assistantPrompts || [])
  }, [props.assistantPrompts])

  useEffect(() => {
    setOriginalText(props.text)
  }, [props.text])

  useEffect(() => {
    if (result?.messageId && result?.text) {
      props.onMessageResult?.(result);
    }
  }, [result]);

  const onInputChange = (value: string) => {
    const regx = new RegExp("/image\\$\\s*([^\\s]+)");
    setOriginalText(value.replace(regx, "/image"));
  };

  const onMessagePrinting = (message: RMessage) => {
    setResult((record) => {
      const oldText = record?.text || ''
      if (message.isFullText) {
          return {messageId: message.messageId, text: message.content, isMe: false, uuid: props.uuid}
      }
      return  {messageId: message.messageId, text: oldText + message.content, isMe: false, uuid: props.uuid}
    })
  }

  const onMessageResult = (messageId: string ,text: string | undefined) => {
    if (text){
      setResult({messageId: messageId, text: text, isMe: false, uuid: props.uuid})
    }
  }

  const submit = async (text: string) => {
    let message = text.trim();
    if (!message) return;
    props.onMessageResult && props.onMessageResult({messageId: new Date().getTime().toString(),text: text, isMe: true, uuid: props.uuid, createAt: new Date().getTime()})
    setResult(null)
    setOriginalText("")

    const controller = new AbortController()
    const { signal } = controller
    console.log("userPrompts", userPrompts);
    await chat({
      text: text,
      assistantPrompts: userPrompts,
      onStatusCode: (statusCode: any) => {
        console.log(statusCode);
      },
      signal,
      onMessage: (message: { role: any; }) => {
        if (message.role) {
            return
        }
        onMessagePrinting(message)
      },
      onFinish: (reason: any) => {
          console.log(reason)
          onMessageResult(result?.messageId, result?.text)
      },
      onError: (error: any) => {
          console.log(error)
      },
    })
  };

  const onPressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      submit((e.target as HTMLTextAreaElement).value);
    }
  };

  return (
    <div className="input-wrap">
      <div className="input-container">
        <TextArea
          className="input"
          allowClear
          autoFocus
          value={originalText}
          onChange={(e) => onInputChange(e.target.value)}
          bordered={false}
          onPressEnter={onPressEnter}
          placeholder="来说点什么吧...（Ctrl + Enter = 发送）"
          autoSize={{ minRows: 1, maxRows: 2 }}
        />
      </div>
      <Button
        className="send"
        type="text"
        icon={<SendOutlined />}
      />
    </div>
  );
}

export default Send;