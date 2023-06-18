import React, { useEffect, useState } from "react";
import { Layout, Button, Empty, message as notice } from "antd";
import { v4 as uuidv4 } from 'uuid'
import { historyService } from '../../../services/history'

import { useCurrentThemeType } from "../../../hooks/useCurrentThemeType";
import {chat} from '../../../chat'

import Send from './Send'
import _Header from './Header'
import _Content from './Content'
import "./index.scss"

const { Header, Footer, Content } = Layout;

interface IChatProps {
  theme?: useCurrentThemeType
}

function ChatHomeComponent(props: IChatProps) {
  const [messageList, setMessageList] = useState<{[key: string]: any}>({})
  const [activityHistoryId, setActivityHistoryId] = useState(uuidv4().replace(/-/g, ''));
  const [abortController] = useState(new AbortController());
  const [onSubmitting, setOnSubmitting] = useState(false);

  useEffect(() => {
    // console.log("activityHistoryId", activityHistoryId);
  }, [activityHistoryId])

  useEffect(() => {
    // console.log("messageList", messageList);
  }, [messageList])

  const handleSaveHistory = () => {
    historyService.create({name: "test"})
    notice.success('保存成功')
  }

  // 消息列表事件
  const handleDeleteMessage = (messageId: string) => {
    const newMessageList = {...messageList}
    delete newMessageList[messageId]
    setMessageList(newMessageList)
  }

  // 发送消息
  const handleSendMessage = async (prompt: string) => {
    // 添加一条发送人是自己的message
    setMessageList({
      ...messageList,
      [uuidv4().replace(/-/g, '')]:{
        role: 'user',
        content: prompt,
        createAt: new Date().getTime()
      }
    })
    await sendMessage(prompt)
  }

  const onResponseMessage = (message: any) => {
    // 添加一条发送人是机器人的message，根据messageId合并流式接口返回的多条消息
    setMessageList((messageList) => {
      if (messageList[message.messageId]) {
        const oldMessage = messageList[message.messageId]
        // 如果是流式接口返回的消息，合并到原来消息的content中
        return {...messageList, [message.messageId]: {...oldMessage, content: oldMessage.content + message.content}}
      }
      return {...messageList, [message.messageId]: message}
    })
  }

  const sendMessage = async (prompt: string) => {
    setOnSubmitting(true)
    await chat({
      text: prompt,
      assistantPrompts: [],
      lastPrompt: "",
      onStatusCode: (statusCode: any) => {
        console.log(statusCode);
      },
      signal: abortController.signal,
      onMessage: (message: { role: any }) => {
        if (message.role) {
          return
        }
        onResponseMessage(message);
      },
      onFinish: (reason: any) => {
        console.log("reason", reason);
        setOnSubmitting(false)
      },
      onError: (error: any) => {
        console.log(error);
        setOnSubmitting(false)
      },
    })
  }

  return (
    <Layout className="pageContainer">
      <Header style={{paddingInline: 10, background: props?.theme.colors.backgroundPrimary }}>
        <_Header theme={props?.theme} onSaveHistory={handleSaveHistory} />
      </Header>
      <Content style={{background: props?.theme.colors.backgroundTertiary}}>
        {Object.keys(messageList).length === 0 ? (
          <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Empty image={null} description="开始会话吧" />
          </div>
        ) : <_Content onSubmitting={onSubmitting} messageList={messageList} onDelete={handleDeleteMessage} />}
      </Content>
      <Footer style={{padding: "10px 20px 0 20px", background: props?.theme.colors.backgroundSecondary}}>
        <Send
          theme={props?.theme}
          onSendMessage={(prompt: string) => handleSendMessage(prompt)}
          onSubmitting={onSubmitting}
        />
      </Footer>
    </Layout>
  );
}

export default ChatHomeComponent;