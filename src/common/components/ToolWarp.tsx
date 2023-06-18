import { useEffect, useState } from "react";
import { Button, ConfigProvider, Switch, Tooltip } from "antd";
import React from 'react';
import { Translator } from "./Translator";
import ChatPage from "./ChatPage";
import Header  from "./Frame/Header";
import BaseComponent from "./Layout";

import { ITranslatorProps } from "./Translator"
import { useTheme } from "../hooks/useTheme";


function ToolWarp(props: ITranslatorProps) {
  const [actionModel, setActionModel] = useState(false);
  const { theme, themeType } = useTheme()

  useEffect(() => {
    // 从localstorage中获取actionModel
    const actionModel = localStorage.getItem("_actionModel");
    if (actionModel) {
      try{
        const actionModelObj = JSON.parse(actionModel);
        setActionModel(actionModelObj?.actionModel);
      }catch (e) {
        console.log(e)
      }
    }
  }, []);

  const handleActionModelChange = (value: boolean) => {
    setActionModel(value);
    localStorage.setItem("_actionModel", JSON.stringify({actionModel: value}));
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: theme.colors.contentSecondary,
          colorPrimary: theme.colors.contentPrimary,
        },
      }}
    >
      {/*<div style={{*/}
      {/*  height: "100%",*/}
      {/*  width: "100%",*/}
      {/*}}>*/}
      {/*  /!*<Header title="翻译" />*!/*/}
      {/*  {actionModel && <Translator {...props} />}*/}
      {/*  {!actionModel && <ChatPage {...props} />}*/}
      {/*  <Tooltip title={"切换使用模式"}>*/}
      {/*    <div style={{*/}
      {/*      position: "fixed",*/}
      {/*      right: 15,*/}
      {/*      top: 5,*/}
      {/*      zIndex: 9999999999*/}
      {/*    }}>*/}
      {/*      <Switch style={{border: '1px solid grey'}} checked={actionModel} onClick={handleActionModelChange} size="small" checkedChildren="提问" unCheckedChildren="聊天" defaultChecked />*/}
      {/*    </div>*/}
      {/*  </Tooltip>*/}
      {/*</div>*/}
      <BaseComponent {...props} />
    </ConfigProvider>
  );
}

export default ToolWarp;