import React, { useEffect, useState } from "react";
import {SendOutlined} from '@ant-design/icons'
import { Input, Button, Mentions, ConfigProvider } from 'antd';
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
  const [helpPrompts, setHelpPrompts] = useState( [])
  const [matchedData, setMatchedData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/t880216t/chatgpt-prompt-for-tester/main/prompts_zh.json')
      .then(response => response.json())
      .then(data => {
        setHelpPrompts(data);
      })
      .catch(e => console.log("Oops, error", e))
  }, [])

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
    setSubmitLoading(true)

    const controller = new AbortController()
    const { signal } = controller
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
        onMessageResult(result?.messageId, result?.text)
        setSubmitLoading(false)
      },
      onError: (error: any) => {
        setSubmitLoading(false)
      },
    })
  };

  const onPressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      submit((e.target as HTMLTextAreaElement).value);
    }
  };

  const onSearch = (search: string) => {
    const matchedItems = helpPrompts
      .filter(item => item.key.toLowerCase().includes(search.toLowerCase()))
      .map((item, index) => ({ label: item.key, key: `${item.key}_${index}`, value: item.value }));
    setMatchedData(matchedItems);
  };

  const onSelect = (text: string, prefix: string) => {
    setOriginalText(text)
  };

  return (
    <div className="input-wrap">
      <Mentions
        className="mentions"
        style={{ border: 'none' }}
        onSearch={onSearch}
        onSelect={(record: any, prefix) => onSelect(record.value, prefix)}
        onChange={(value) => onInputChange(value)}
        placeholder="来说点什么吧...（Ctrl + Enter = 发送），输入 / 查看更多推荐"
        autoFocus
        autoSize
        value={originalText}
        prefix={"/"}
        options={matchedData}
        onPressEnter={onPressEnter}
      />
      <Button
        className="send"
        type="text"
        icon={<SendOutlined />}
        loading={submitLoading}
        onClick={async () => await submit(originalText)}
      />
    </div>
  );
}

export default Send;