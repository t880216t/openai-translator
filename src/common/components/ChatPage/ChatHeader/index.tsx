import React, { useEffect, useState } from "react";
import { Button } from "antd";
import {BarsOutlined, PlusOutlined} from '@ant-design/icons';

interface IHeaderProps {
  activitySessionTitle?: string
  DEFAULT_TITLE?: string
  collapsed: boolean
  onCollapse?: (collapsed: boolean) => void
  onCreate?: () => void
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
      <div className="header-left">
        <Button onClick={() => onCollapse()} type="text" icon={<BarsOutlined style={{color: "white", fontSize: 22}}/>} />
      </div>
      <div className="header-title">
        <span>{props.activitySessionTitle}</span>
      </div>
      <div className="header-right">
        <Button onClick={() => onCreate()} type="text" icon={<PlusOutlined style={{color: "white", fontSize: 22}}/>} />
      </div>
    </div>
  );
}

export default ChatHeader;