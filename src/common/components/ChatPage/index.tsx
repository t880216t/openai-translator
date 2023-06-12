import React, { useEffect, useState, useCallback } from "react";
import { Layout, Button, Empty, message as notice } from "antd";
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
  assistantPrompts?: string[]
  lastAssistantPrompt?: string
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

function getItemAsync(key: string) {
  return new Promise((resolve, reject) => {
    try {
      const value = localStorage.getItem(key);
      resolve(value);
    } catch (error) {
      reject(error);
    }
  });
}

function ChatPage(props: IProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [messageList, setMessageList] = useState<{[key: string]: IMessage}>({})
  const [collapsed, setCollapsed] = useState(true);
  const [activitySessionId, setActivitySessionId] = useState(uuidv4().replace(/-/g, ''));
  const [activitySessionTitle, setActivitySessionTitle] = useState(DEFAULT_TITLE);
  const [historyList, setHistoryList] = useState<IHistoryList>({})
  const [outPutText, setOutPutText] = useState("")
  const [assistantPrompts, setAssistantPrompts] = useState<string[]>([]);
  const [lastAssistantPrompt, setLastAssistantPrompt] = useState<string>("");

  useEffect(() => {
    setOriginalText(props.text)
  }, [props.text])

  useEffect(() => {
    if (Object.keys(historyList).length > 0) {
      localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(historyList))
    }
  }, [historyList])

  useEffect(() => {
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
      scrollToBottom();
    }
  }, [messageList])

  useEffect(() => {
    const historyStorage = localStorage.getItem(HISTORY_LIST_KEY)
    if (historyStorage) {
      setHistoryList(JSON.parse(historyStorage))
    }
  }, [])

  useEffect(() => {
    if (outPutText) {
      scrollToBottom();
    }
  }, [outPutText]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const container = document.querySelector('#messages') as HTMLElement;
      container?.scrollTo({ top: 999999, behavior: 'smooth' });
      container?.parentElement?.scrollTo({ top: 999999, behavior: 'smooth' });
    }, 1000);
  }

  const onMessageResult = (message: IMessage) => {
    if (!message.messageId) return
    setMessageList((messageList) => {
      if (messageList[message.messageId]) {
        return {...messageList, [message.messageId]: message}
      }
      if (message.uuid === activitySessionId){
        return {...messageList, [message.messageId]: message}
      }
    })
    if (message && message.isMe && message.text) {
      // @ts-ignore
      setAssistantPrompts((prevAssistantPrompts) => {
        // 只要prevAssistantPrompts的倒数后2条数据，将字符串长度超过100的截取前100个字符，并加上省略号
        let updatedPrompts: string[] = prevAssistantPrompts.slice(-3).map((prompt) => {
          if (prompt.length > 100) {
            return `${prompt.substring(0, 100)}...`;
          }
          return prompt;
        });
        updatedPrompts = [...updatedPrompts, message.text||''];
        return updatedPrompts;
      })
    }
    if (message && !message.isMe && message.text) {
      setLastAssistantPrompt(message.text||'');
    }
    if (message?.uuid !== undefined && !historyList.hasOwnProperty(message.uuid) && message.isMe) {
      setHistoryList((prevHistoryList) => ({
        ...(message.uuid
          ? {
            [String(message.uuid)]: {
              title: `${message.text?.trim().substring(0, 5)}...`,
              createAt: Number(message.createAt),
              uuid: message.uuid,
            },
          }
          : {}),
        ...prevHistoryList,
      }));

    }else {
      setOutPutText(message?.text || '');
    }
  }

  const onCollapse = (collapsed: boolean) => {
    if (Object.keys(historyList).length > 0) {
      setCollapsed(collapsed);
    }else{
      if (!collapsed) {
        notice.warning("还没有历史消息哦，开始会话吧。")
      }else {
        setCollapsed(collapsed);
      }
    }
  }

  const onCreate = () => {
    const uuid = uuidv4().replace(/-/g, '')
    setActivitySessionId(uuid)
    setActivitySessionTitle(DEFAULT_TITLE)
    clearState()
  }

  const onSelectHistory = async (uuid: string) => {
    const prevMessageList = await getItemAsync(MESSAGE_LIST_KEY)
    if (prevMessageList) {
      // @ts-ignore
      const messageList = JSON.parse(prevMessageList)[uuid]
      if (messageList) {
        setMessageList(messageList)
        setActivitySessionId(uuid)
        setActivitySessionTitle(historyList[uuid].title)
        setCollapsed(true)
        setLastAssistantPrompt("");
        const questions = Object.values(messageList);
        // @ts-ignore
        questions.forEach((message: IMessage) => {
          if (message && message.isMe && message.text) {
            // @ts-ignore
            setAssistantPrompts((prevAssistantPrompts) => {
              // 将prevAssistantPrompts中字符串长度超过100的截取前100个字符，并加上省略号
              let updatedPrompts: string[] = prevAssistantPrompts.slice(-3).map((prompt) => {
                if (prompt.length > 100) {
                  return `${prompt.substring(0, 100)}...`;
                }
                return prompt;
              });
              return [...updatedPrompts, message.text||''];
            });
          }
        });
      }
    }
  }

  const clearState = () => {
    setMessageList({})
    setCollapsed(true)
    setLastAssistantPrompt("");
    setAssistantPrompts([]);
  }

  const onDelete = (uuid: string) => {
    const prevMessageList = localStorage.getItem(MESSAGE_LIST_KEY)
    if (prevMessageList) {
      setLastAssistantPrompt("");
      const messageList = JSON.parse(prevMessageList)
      if (messageList[uuid]) {
        delete messageList[uuid]
        if (uuid === activitySessionId) {
          setMessageList({})
          setActivitySessionId(uuidv4().replace(/-/g, ''))
          setActivitySessionTitle(DEFAULT_TITLE)
        }
        localStorage.setItem(MESSAGE_LIST_KEY, JSON.stringify(messageList))
        setHistoryList((prevHistoryList) => {
          delete prevHistoryList[uuid]
          if (Object.keys(prevHistoryList).length === 0) {
            setCollapsed(!collapsed)
            localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(prevHistoryList))
          }
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
        theme={'dark'}
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
          <Send lastAssistantPrompt={lastAssistantPrompt} assistantPrompts={assistantPrompts} uuid={activitySessionId} engine={props?.engine} text={originalText} onMessageResult={onMessageResult} />
        </Footer>
      </Layout>
    </Layout>
  );
}

export default ChatPage;