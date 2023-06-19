import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {HistoryOutlined, SaveOutlined, SyncOutlined} from '@ant-design/icons';
import { Theme } from 'baseui-sd/theme'

interface IHeaderProps {
  theme?: Theme;
}

import "./index.scss";

function QuickHeader(props: IHeaderProps) {
  return (
    <div className="header-wrap">
      <div className="title" style={{color: props.theme?.colors?.contentPrimary}}>
        <span>Quick Functions</span>
      </div>
      {/*<Space className="actions">*/}
      {/*  <Tooltip title="查看历史会话">*/}
      {/*    <Button onClick={() => props?.onShowHistory?.()} type="text" icon={<HistoryOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />*/}
      {/*  </Tooltip>*/}
      {/*  <Tooltip title="保存当前会话">*/}
      {/*    <Button onClick={() => props?.onShowSave?.()} type="text" icon={<SaveOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />*/}
      {/*  </Tooltip>*/}
      {/*  <Tooltip title="重置当前会话">*/}
      {/*    <Button onClick={() => props?.onClearMessage?.()} type="text" icon={<SyncOutlined style={{fontSize: 18, color: props.theme?.colors.contentSecondary}}/>} />*/}
      {/*  </Tooltip>*/}
      {/*</Space>*/}
    </div>
  );
}

export default QuickHeader;