import React from "react";
import { Button, Space, Tooltip, Popconfirm, ConfigProvider } from "antd";
import {HistoryOutlined, SaveOutlined, SyncOutlined, FileExcelOutlined} from '@ant-design/icons';
import { Theme } from 'baseui-sd/theme'

interface IHeaderProps {
  onClearMessage?: () => void
  onShowSave?: () => void
  onShowHistory?: () => void
  theme?: Theme;
  title?: string
}

import "./index.scss";
import { useTheme } from "../../../../hooks/useTheme";

function ChatHeader(props: IHeaderProps) {
  const { theme, themeType } = useTheme()
  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInversePrimary : theme?.colors.contentPrimary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInverseSecondary : theme?.colors.backgroundSecondary,
        },
      }}
    >
      <div className="header-wrap">
        <div className="title" style={{color: props.theme?.colors?.contentPrimary}}>
          <span>{props.title || "New Session"}</span>
        </div>
        <Space className="actions">
          <Tooltip title="查看历史会话">
            <Button onClick={() => props?.onShowHistory?.()} type="text" icon={<HistoryOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />
          </Tooltip>
          <Tooltip title="保存当前会话">
            <Button onClick={() => props?.onShowSave?.()} type="text" icon={<SaveOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />
          </Tooltip>
          <Tooltip title="清除当前会话">
            <Popconfirm
              placement="bottomRight"
              title={`确认清理当前会话吗？`}
              description={`清理后，当前会话将被清空，无法恢复。`}
              onConfirm={() => props?.onClearMessage?.()}
              okText="确认"
              cancelText="取消"
            >
              <Button type="text" icon={<FileExcelOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />
            </Popconfirm>
          </Tooltip>
        </Space>
      </div>
    </ConfigProvider>
  );
}

export default ChatHeader;