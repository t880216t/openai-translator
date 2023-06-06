import React, { useEffect, useState } from "react";
import { Layout, Button, Empty, ConfigProvider } from "antd";
import { Client as Styletron } from "styletron-engine-atomic";
import { v4 as uuidv4 } from 'uuid'
import {PlusOutlined} from '@ant-design/icons';

import { useTheme } from '../../hooks/useTheme'
import Messages  from './Messages'
import ChatHeader  from './ChatHeader'
import Send  from './Send'
import HistoryList  from './HistoryList'
import './index.scss';
import { ISettings, IMessage } from "../../types";

const { Header, Footer, Sider, Content } = Layout;

export interface IInnerProps {
  uuid?: string
  text?: string
  autoFocus?: boolean
  showSettings?: boolean
  defaultShowSettings?: boolean
  containerStyle?: React.CSSProperties
  editorRows?: number
  onSettingsSave?: (oldSettings: ISettings) => void
  onMessageResult?: (message: IMessage) => void
}

export interface IProps extends IInnerProps {
  engine: Styletron
}

export interface IHistoryList {
  [uuid: string]: {
    title: string
    createAt: number
    uuid: string
  }
}


const DEFAULT_TITLE = "New Chat";
const HISTORY_LIST_KEY = "_history_list";
const MESSAGE_LIST_KEY = "_message_list";

function ChatPage(props: IProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [messageList, setMessageList] = useState<{[key: string]: IMessage}>({})
  const [collapsed, setCollapsed] = useState(true);
  const [activitySessionId, setActivitySessionId] = useState(uuidv4().replace(/-/g, ''));
  const [activitySessionTitle, setActivitySessionTitle] = useState(DEFAULT_TITLE);
  const [historyList, setHistoryList] = useState<IHistoryList>({})

  const { themeType } = useTheme()

  useEffect(() => {
    setOriginalText(props.text)
  }, [props.text])

  useEffect(() => {
    if (Object.keys(historyList).length > 0) {
      localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(historyList))
    }
  }, [historyList])

  useEffect(() => {
    console.log("messageList", messageList);
    console.log("activitySessionId", activitySessionId);
    if (Object.keys(messageList).length > 0) {
      const prevMessageList = localStorage.getItem(MESSAGE_LIST_KEY)
      if (prevMessageList) {
        localStorage.setItem(MESSAGE_LIST_KEY, JSON.stringify({
          ...JSON.parse(prevMessageList),
          [activitySessionId]: messageList
        }))
      }else {
        localStorage.setItem(MESSAGE_LIST_KEY, JSON.stringify({
          [activitySessionId]: messageList
        }))
      }
    }
  }, [messageList])

  useEffect(() => {
    const historyStorage = localStorage.getItem(HISTORY_LIST_KEY)
    if (historyStorage) {
      setHistoryList(JSON.parse(historyStorage))
    }
  }, [])

  const onMessageResult = (message: IMessage) => {
    if (!message.messageId) return
    setMessageList((messageList) => {
      if (messageList[message.messageId]) {
        return {...messageList, [message.messageId]: message}
      }
      return {...messageList, [message.messageId]: message}
    })
    if (!historyList.hasOwnProperty(message?.uuid) && message?.isMe) {
      setHistoryList((prevHistoryList) => ({
        [message.uuid]: {
          title: `${message.text?.trim().substring(0, 5)}...`,
          createAt: message.createAt,
          uuid: message.uuid,
        },
        ...prevHistoryList,
      }));
    }
  }

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
  }

  const onCreate = () => {
    const uuid = uuidv4().replace(/-/g, '')
    setActivitySessionId(uuid)
    setActivitySessionTitle(DEFAULT_TITLE)
    setMessageList({})
    setCollapsed(true)
  }

  const onSelectHistory = (uuid: string) => {
    const prevMessageList = localStorage.getItem(MESSAGE_LIST_KEY)
    if (prevMessageList) {
      const messageList = JSON.parse(prevMessageList)[uuid]
      if (messageList) {
        setMessageList(messageList)
        setActivitySessionId(uuid)
        setActivitySessionTitle(historyList[uuid].title)
        setCollapsed(true)
      }
    }
  }

  const onDelete = (uuid: string) => {
    const prevMessageList = localStorage.getItem(MESSAGE_LIST_KEY)
    if (prevMessageList) {
      const messageList = JSON.parse(prevMessageList)
      if (messageList[uuid]) {
        delete messageList[uuid]
        localStorage.setItem(MESSAGE_LIST_KEY, JSON.stringify(messageList))
        setHistoryList((prevHistoryList) => {
          delete prevHistoryList[uuid]
          return {...prevHistoryList}
        })
      }
    }

  }

  return (
    <Layout className="chat-warp">
      <Sider
        collapsible
        collapsedWidth={0}
        collapsed={collapsed}
        breakpoint="md"
        theme={themeType || 'dark'}
        trigger={null}
      >
        <div className="add-new-chart">
          {/*<ConfigProvider*/}
          {/*  theme={{ token: { colorText: 'white' } }}*/}
          {/*>*/}
          {/*  <Button className="button" type="text" icon={<PlusOutlined />} block>*/}
          {/*    {DEFAULT_TITLE}*/}
          {/*  </Button>*/}
          {/*</ConfigProvider>*/}
        </div>
        <HistoryList historyList={historyList} onSelect={onSelectHistory} onDelete={onDelete} />
      </Sider>
      <Layout>
        <Header style={{paddingInline: 10}}>
          <ChatHeader activitySessionTitle={activitySessionTitle} collapsed={collapsed} onCollapse={onCollapse} onCreate={onCreate} />
        </Header>
        <Content>
          {(Object.keys(messageList).length !== 0 ) ? (
            <Messages messageList={messageList} />
          ): (
            <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Empty  description={"开始你的对话吧"} />
            </div>
          )}
        </Content>
        <Footer style={{padding: "10px 20px", background: '#ffffff'}}>
          <Send uuid={activitySessionId} engine={props?.engine} text={originalText} onMessageResult={onMessageResult} />
        </Footer>
      </Layout>
    </Layout>
  );
}

export default ChatPage;