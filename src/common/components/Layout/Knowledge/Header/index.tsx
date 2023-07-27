import React, { useEffect, useState } from "react";
import { Space, Radio, ConfigProvider, Button } from "antd";
import { CommentOutlined } from '@ant-design/icons';

import ChatDrawer from "../Modals/ChatDrawer"
import "./index.scss";
import { useTheme } from "../../../../hooks/useTheme";
import { IKnowledge } from "../index";
import { IMessage } from '../../types'
import { isDesktopApp } from "../../../../utils";

interface IHeaderProps {
  listType: string;
  onListTypeChange: (listType: string) => void;
  showDrawer: boolean
  submitLoading: boolean
  onStartKnowLedgeChat: () => void
  selectKnowledgeList: IKnowledge[]
  onCloseDrawer: () => void
  onStopSend: () => void
  onDelete: (id: string) => void
  onDownload: (id: string, fileName: string) => void
  onSendMessage: (prompt: string) => void
  messageList: {[key: string]: IMessage}
}

function Header(props: IHeaderProps) {
  const { theme, themeType } = useTheme()

  const handleShowDrawer = () => {
    props.onStartKnowLedgeChat()
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentPrimary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInversePrimary : theme?.colors.backgroundSecondary,
        },
      }}
    >
      <div style={{marginTop: isDesktopApp() ? 10 : "0px"}} className="header-wrap">
        <div className="title" style={{color: theme?.colors?.contentPrimary}}>
          <span>K-DB</span>
        </div>
        <div>
          <Radio.Group value={props.listType} onChange={(e) => props.onListTypeChange(e.target.value)} size="small" defaultValue="a" buttonStyle="solid">
            <Radio.Button value="1">我的库</Radio.Button>
            <Radio.Button value="2">公共库</Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <Space>
            <Button onClick={() => handleShowDrawer()} type="text" icon={<CommentOutlined style={{fontSize: 22, color: theme?.colors.contentPrimary}} />}/>
          </Space>
        </div>
        <ChatDrawer
          messageList={props.messageList}
          selectKnowledgeList={props.selectKnowledgeList}
          showDrawer={props.showDrawer}
          submitLoading={props.submitLoading}
          onCloseDrawer={props.onCloseDrawer}
          onSendMessage={props.onSendMessage}
          onStopSend={props.onStopSend}
          onDelete={props.onDelete}
          onDownload={props.onDownload}
        />
      </div>
    </ConfigProvider>
  );
}

export default Header;