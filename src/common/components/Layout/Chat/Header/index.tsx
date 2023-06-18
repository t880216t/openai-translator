import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {HistoryOutlined, SaveOutlined, SyncOutlined} from '@ant-design/icons';
import { useCurrentThemeType } from "../../../../hooks/useCurrentThemeType";

interface IHeaderProps {
  onSaveHistory?: () => void
  theme?: useCurrentThemeType
}

import "./index.scss";

function ChatHeader(props: IHeaderProps) {
  const [collapsed, setCollapsed] = useState(props.collapsed);

  const onCollapse = () => {
    setCollapsed(!collapsed)
    props.onCollapse && props.onCollapse(!collapsed)
  }

  const onCreate = () => {
    props.onCreate && props.onCreate()
  }

  useEffect(() => {
    setCollapsed(props.collapsed)
  }, [props.collapsed])

  return (
    <div className="header-wrap">
      {/*<div className="header-left">*/}
      {/*  <Button onClick={() => onCollapse()} type="text" icon={<BarsOutlined style={{color: "white", fontSize: 22}}/>} />*/}
      {/*</div>*/}
      {/*<div className="header-title">*/}
      {/*  <span>{props.activitySessionTitle}</span>*/}
      {/*</div>*/}
      {/*<div className="header-right">*/}
      {/*  <Button onClick={() => onCreate()} type="text" icon={<PlusOutlined style={{color: "white", fontSize: 22}}/>} />*/}
      {/*</div>*/}
      <div className="title" style={{color: props?.theme.colors.contentPrimary}}>
        <span>New Chat</span>
      </div>
      <Space className="actions">
        <Tooltip title="查看历史会话">
          <Button onClick={() => onCollapse()} type="text" icon={<HistoryOutlined style={{fontSize: 18, color: props?.theme.colors.contentSecondary}}/>} />
        </Tooltip>
        <Tooltip title="保存当前会话">
          <Button onClick={() => props?.onSaveHistory()} type="text" icon={<SaveOutlined style={{fontSize: 18, color: props?.theme.colors.contentSecondary}}/>} />
        </Tooltip>
        <Tooltip title="重置当前会话">
          <Button onClick={() => onCollapse()} type="text" icon={<SyncOutlined style={{fontSize: 18, color: props?.theme.colors.contentSecondary}}/>} />
        </Tooltip>
      </Space>
    </div>
  );
}

export default ChatHeader;