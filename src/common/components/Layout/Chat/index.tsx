import React, { useEffect, useState } from "react";
import { Layout, Button, Empty, message as notice } from "antd";
import { v4 as uuidv4 } from 'uuid'
import { historyService } from '../../../services/history'

import { useCurrentThemeType } from "../../../hooks/useCurrentThemeType";

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
  const [activitySessionId, setActivitySessionId] = useState(uuidv4().replace(/-/g, ''));

  useEffect(() => {
    const messageList = localStorage.getItem(activitySessionId);
    if (messageList) {
      setMessageList(JSON.parse(messageList))
    }
  }, [activitySessionId])

  const handleSaveHistory = () => {
    historyService.create({name: "test"})
    notice.success('保存成功')
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
        ) : <_Content messageList={messageList} />}
      </Content>
      <Footer style={{padding: "10px 20px 0 20px", background: props?.theme.colors.backgroundSecondary}}>
        <Send theme={props?.theme} />
      </Footer>
    </Layout>
  );
}

export default ChatHomeComponent;