import React, { useEffect, useState } from "react";
import { Layout, Button, Empty } from "antd";

import { useTheme } from '../../hooks/useTheme'
import Messages  from './Messages'
import ChatHeader  from './ChatHeader'
import Send  from './Send'

const { Header, Footer, Sider, Content } = Layout;

import './index.scss';
import { ISettings, IMessage } from "../../types";
import { Client as Styletron } from "styletron-engine-atomic";

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

function ChatPage(props: IProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [messageList, setMessageList] = useState<{[key: string]: IMessage}>({})
  const [collapsed, setCollapsed] = useState(true);

  const { themeType } = useTheme()

  useEffect(() => {
    setOriginalText(props.text)
  }, [props.text])

  const onMessageResult = (message: IMessage) => {
    if (!message.messageId) return
    setMessageList((messageList) => {
      if (messageList[message.messageId]) {
        return {...messageList, [message.messageId]: message}
      }
      return {...messageList, [message.messageId]: message}
    })
  }

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
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
        Sider
      </Sider>
      <Layout>
        <Header style={{paddingInline: 10}}>
          <ChatHeader collapsed={collapsed} onCollapse={onCollapse} />
        </Header>
        <Content>
          {(Object.keys(messageList).length !== 0 ) ? <Messages messageList={messageList} /> : (
            <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Empty  description={"开始你的对话吧"} />
            </div>
          )}
        </Content>
        <Footer style={{padding: "10px 20px", background: '#ffffff'}}>
          <Send engine={props?.engine} text={originalText} onMessageResult={onMessageResult} />
        </Footer>
      </Layout>
    </Layout>
  );
}

export default ChatPage;