// @ts-nocheck
import React, { useEffect } from "react";
import { Button, Drawer, Space, Divider, Tooltip } from "antd";
import { CloseOutlined } from '@ant-design/icons'

import ChatContent from "../../../Chat/Content";
import ChatSend from "../../../Chat/Send";
import {IKnowledge} from "../../index"
import { useTheme } from "../../../../../hooks/useTheme";
import { getIcon } from "../../../../../assets/icon_utils";

import { IMessage } from '../../../types'


interface IDrawerProps {
  selectKnowledgeList: IKnowledge[];
  showDrawer: boolean;
  submitLoading: boolean;
  needShowThinking: boolean;
  onCloseDrawer: () => void;
  onStopSend: () => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, fileName: string) => void;
  onSendMessage: (prompt: string) => void;
  messageList: { [key: string]: IMessage };
}

function BasicComponent(props: IDrawerProps) {
  const { theme, themeType } = useTheme()

  const handleSendMessage = async (prompt: string) => {
    await props.onSendMessage(prompt);
  }

  useEffect(() => {
    console.log(props?.selectKnowledgeList);
  },[props?.selectKnowledgeList]);

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
                  <Button key={item.knowledge_id} onClick={() => item.data_type === 1  && props.onDownload(item.knowledge_id, item.file_name)} type="text" icon={<img src={item.data_type == 2? getIcon("link") :getIcon(item.file_name)} style={{width: 20, height: 20}} />} />
                </Tooltip>
              ))}
            </Space>
          </div>
          <div style={{flex: 3,display: "flex", justifyContent: "flex-end"}}>
            <Button onClick={() => props?.onCloseDrawer()} type="text" icon={<CloseOutlined />} />
          </div>
        </div>
        <Divider style={{ margin: 0, background: theme.colors.backgroundTertiary }} />
        <ChatContent needShowThinking={props.needShowThinking} messageList={props.messageList}
                     onSubmitting={props.submitLoading} onDelete={props.onDelete} />
        <div style={{ padding: "10px 5px" }}>
          <ChatSend
            text={props?.text || ""}
            onSendMessage={async (prompt: string) => await handleSendMessage(prompt)}
            onStopSend={props.onStopSend}
            onSubmitting={props.submitLoading}
          />
        </div>
      </div>
    </Drawer>
  );
}

export default BasicComponent;