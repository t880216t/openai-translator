import React, { useEffect, useState } from "react";
import { Button, Drawer, Space, Divider, Tooltip } from "antd";
import { CloseOutlined } from '@ant-design/icons'

import ChatContent from "../../../Chat/Content";
import ChatSend from "../../../Chat/Send";
import {IKnowledge} from "../../index"
import CodeIcon from './file_icon/code.svg'
import ImageIcon from './file_icon/img.svg'
import LinkIcon from './file_icon/link.svg'
import TxtIcon from './file_icon/txt.svg'
import PDFIcon from './file_icon/pdf.svg'
import PPTIcon from './file_icon/ppt.svg'
import UnknowIcon from './file_icon/unkonw.svg'
import WordIcon from './file_icon/word.svg'
import { useTheme } from "../../../../../hooks/useTheme";

import { IMessage } from '../../../types'


interface IDrawerProps {
  selectKnowledgeList: IKnowledge[];
  showDrawer: boolean;
  submitLoading: boolean;
  onCloseDrawer: () => void;
  onSendMessage: (prompt: string) => void;
  messageList: {[key: string]: IMessage}
}

function BasicComponent(props: IDrawerProps) {
  const [onSubmitting, setOnSubmitting] = useState(false);
  const { theme, themeType } = useTheme()

  const handleSendMessage = (prompt: string) => {
    props.onSendMessage(prompt);
  }

  useEffect(() => {
    console.log(props?.selectKnowledgeList);
  },[props?.selectKnowledgeList]);

  const getIcon = (fileName: string) => {
    const suffix = fileName.split('.').pop();
    switch (suffix) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return ImageIcon;
      case 'pdf':
        return PDFIcon;
      case 'ppt':
      case 'pptx':
        return PPTIcon;
      case 'doc':
      case 'docx':
        return WordIcon;
      case 'txt':
        return TxtIcon;
      case 'js':
      case 'ts':
      case 'java':
      case 'c':
      case 'cpp':
      case 'py':
      case 'go':
        return CodeIcon;
      default:
        return UnknowIcon;
    }
  }

  return (
    <Drawer
      placement="bottom"
      destroyOnClose={true}
      height="92vh"
      closable={false}
      open={props?.showDrawer}
      bodyStyle={{padding: "0px", background: theme.colors.backgroundSecondary, overflowX: "hidden"}}
    >
      <div style={{height: '100%', display: "flex", flexDirection: "column",}}>
        <div style={{width: '100%', display: "flex", justifyContent: "space-between", padding: "5px"}}>
          <div style={{flex: 7, overflowX: "auto", display: "flex", alignItems: "flex-start", flexDirection: "column", justifyContent: "flex-start" }}>
            {props.selectKnowledgeList?.length === 0 && (
              <span style={{fontSize: 12, color: theme.colors.contentSecondary, marginLeft: 5}}>基于我的私有库进行问答：</span>
            )}
            {props.selectKnowledgeList?.length > 0 && (
              <span style={{fontSize: 12, color: theme.colors.contentSecondary, marginLeft: 5}}>基于以下知识库进行问答：</span>
            )}
            <Space>
              {props.selectKnowledgeList?.map((item: IKnowledge) => (
                <Tooltip title={item.title}>
                  <Button key={item.knowledge_id} type="text" icon={<img src={item.data_type == 2? LinkIcon :getIcon(item.file_name)} style={{width: 20, height: 20}} />} />
                </Tooltip>
              ))}
            </Space>
          </div>
          <div style={{flex: 3,display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => props?.onCloseDrawer()} type="text" icon={<CloseOutlined />} />
          </div>
        </div>
        <Divider style={{margin: 0, background: theme.colors.backgroundTertiary}} />
        <ChatContent needShowThinking={true} messageList={props.messageList} onSubmitting={props.submitLoading}/>
        <div  style={{padding: "10px 5px"}}>
          <ChatSend
            text={props?.text || ''}
            onSendMessage={(prompt: string) => handleSendMessage(prompt)}
            onSubmitting={props.submitLoading}
          />
        </div>
      </div>
    </Drawer>
  );
}

export default BasicComponent;