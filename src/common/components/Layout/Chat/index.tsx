import React, { useEffect, useState } from "react";
import { Layout, Button, Empty, message as notice } from "antd";
import { v4 as uuidv4 } from 'uuid'
import { Theme } from 'baseui-sd/theme'

import { historyService } from '../../../services/history'
import { messageService } from '../../../services/message'
import { useCurrentThemeType } from "../../../hooks/useCurrentThemeType";
import { IMessage, IMessageDBProps, IHistoryDBProps } from "../types"
import {chat} from '../../../chat'

import Send from './Send'
import _Header from './Header'
import _Content from './Content'
import SaveModal from './Modals/SaveModal'
import HistoryModal from './Modals/HistoryModal'
import "./index.scss"

const { Header, Footer, Content } = Layout;

interface IChatProps {
  text?: string
  theme?: Theme;
}

function ChatHomeComponent(props: IChatProps) {
  const [messageList, setMessageList] = useState<{[key: string]: any}>({})
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');
  const [activityHistoryId, setActivityHistoryId] = useState<number|null>(null);
  const [abortController] = useState(new AbortController());
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);


  useEffect(() => {
    // console.log("activityHistoryId", activityHistoryId);
  }, [activityHistoryId])

  useEffect(() => {
    // console.log("messageList", messageList);
  }, [messageList])

  // 列表头部事件
  const handleClearMessage = () => {
    setMessageList({})
    setActivityHistoryId(null)
    setCurrentSessionTitle("")
    notice.success('当前会话历史已经清空')
  }

  const handleShowHistoryList = async () => {
    setShowHistoryModal(true)
    const historyList = await historyService.list()
    setHistoryList(historyList)
  }

  const handleSaveHistory = async (name: string, description: string) => {
    if (!name) {
      notice.error('请输入会话名称')
      return
    }
    if (!Object.keys(messageList).length) {
      notice.error('当前会话没有消息')
      return
    }
    const history = await historyService.create({name, description})
    const messages = Object.keys(messageList).map((key) => {
      const message = messageList[key]
      return {
        history_id: history.id,
        message_id: message.messageId || uuidv4().replace(/-/g, ''),
        role: message.role || 'bot',
        content: message.content,
        createAt: message.createAt
      }
    })
    // @ts-ignore
    await messageService.bulkPut(messages)
    notice.success('保存成功')
    setShowSaveModal(false)
  }

  const handleDeleteHistory = async (historyId: number) => {
    await historyService.delete(historyId)
    await messageService.deleteByHistoryId(historyId)
    const historyList = await historyService.list()
    setHistoryList(historyList)
    notice.success('删除成功')
  }

  const handleUpdateHistory = async () => {
    // 先删除所有老的消息，在插入新的消息
    if (!activityHistoryId) return
    await messageService.deleteByHistoryId(activityHistoryId)
    const messages = Object.keys(messageList).map((key) => {
      const message = messageList[key]
      return {
        history_id: activityHistoryId,
        message_id: message.messageId || uuidv4().replace(/-/g, ''),
        role: message.role || 'bot',
        content: message.content,
        createAt: message.createAt
      }
    })
    // @ts-ignore
    await messageService.bulkPut(messages)
    notice.success('更新成功')
  }

  const handleLoadHistory = async (historyId: number) => {
    if (!historyId) return
    const history: IHistoryDBProps | undefined = await historyService.get(historyId)
    if (!history) return
    const messages = await messageService.listByHistoryId(historyId)
    // @ts-ignore
    const messageList = messages.reduce((acc, cur) => {
      return {...acc, [cur.message_id]: cur}
    } ,{})
    setMessageList(messageList)
    setCurrentSessionTitle(history.name)
    setShowHistoryModal(false)
    setActivityHistoryId(historyId)
  }

  // 消息列表事件
  const handleDeleteMessage = (messageId: string) => {
    const newMessageList = {...messageList}
    delete newMessageList[messageId]
    setMessageList(newMessageList)
  }

  // 发送消息
  const handleSendMessage = async (prompt: string) => {
    const addTime = new Date().getTime().toString().slice(0, 10)
    // string 转成 int
    const createAt = parseInt(addTime)
    prompt = prompt.trim()
    // 添加一条发送人是自己的message
    setMessageList({
      ...messageList,
      [uuidv4().replace(/-/g, '')]:{
        role: 'user',
        content: prompt,
        createAt
      }
    })
    await sendMessage(prompt)
  }

  const onResponseMessage = (message: IMessage) => {
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
      signal: abortController.signal,
      onMessage: (message: { role: string }) => {
        if (message.role) return
        // @ts-ignore
        onResponseMessage(message);
      },
      onFinish: (reason: string | undefined) => {
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
    <>
      <Layout className="pageContainer">
        <Header style={{paddingInline: 10, background: props.theme?.colors.backgroundPrimary }}>
          <_Header
            title={currentSessionTitle}
            theme={props?.theme}
            onShowHistory={handleShowHistoryList}
            onShowSave={() => activityHistoryId ? handleUpdateHistory():setShowSaveModal(true)}
            onClearMessage={handleClearMessage}
          />
        </Header>
        <Content style={{background: props.theme?.colors.backgroundTertiary}}>
          {Object.keys(messageList).length === 0 ? (
            <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <Empty image={null} description="开始会话吧" />
            </div>
          ) : <_Content onSubmitting={onSubmitting} messageList={messageList} onDelete={handleDeleteMessage} />}
        </Content>
        <Footer style={{padding: "10px 20px 0 20px", background: props.theme?.colors.backgroundSecondary}}>
          <Send
            text={props?.text || ''}
            theme={props?.theme}
            onSendMessage={(prompt: string) => handleSendMessage(prompt)}
            onSubmitting={onSubmitting}
          />
        </Footer>
      </Layout>
      <SaveModal
        theme={props?.theme}
        showModal={showSaveModal}
        onOpenChange={(open) => setShowSaveModal(open)}
        onSaveHistory={handleSaveHistory}
      />
      <HistoryModal
        theme={props?.theme}
        historyList={historyList}
        showModal={showHistoryModal}
        onOpenChange={(open) => setShowHistoryModal(open)}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
      />
    </>
  );
};

export default ChatHomeComponent;