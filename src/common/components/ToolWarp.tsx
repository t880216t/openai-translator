import { useState } from "react";
import { Button, ConfigProvider, Switch } from "antd";
import React from 'react';
import { Translator } from "./Translator";
import ChatPage from "./ChatPage";
import { Tooltip } from "./Tooltip";


function ToolWarp(props: any) {
  const [actionModel, setActionModel] = useState(true);

  const handleActionModelChange = (value) => {
    setActionModel(value);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2d3436',
        },
      }}
    >
      <div style={{
        position: "absolute",
        height: "100%",
        width: "100%"
      }}>
        {actionModel && <Translator {...props} />}
        {!actionModel && <ChatPage {...props} />}
        <Tooltip content={"切换使用模式"} placement='left'>
          <div style={{
            position: "fixed",
            right: 15,
            top: 5,
            zIndex: 9999999999
          }}>
            <Switch style={{border: '1px solid grey'}} value={actionModel} onClick={handleActionModelChange} size="small" checkedChildren="提问" unCheckedChildren="聊天" defaultChecked />
          </div>
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}

export default ToolWarp;