import React, { useState } from "react";
import { Button } from "antd";
import {BarsOutlined, PlusOutlined} from '@ant-design/icons';
import {IProps} from '../index'

import "./index.scss";

function ChatHeader(props: IProps) {

  return (
    <div className="header-wrap">
      <div className="header-left">
        <Button type="text" icon={<BarsOutlined style={{color: "white", fontSize: 22}}/>} />
      </div>
      <div className="header-title">
        <span>{"New chat"}</span>
      </div>
      <div className="header-right">
        <Button type="text" icon={<PlusOutlined style={{color: "white", fontSize: 22}}/>} />
      </div>
    </div>
  );
}

export default ChatHeader;