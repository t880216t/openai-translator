import { Button, ConfigProvider, Switch, Tooltip } from "antd";
import React from 'react';

import BaseComponent from "./Layout";

import { useTheme } from "../hooks/useTheme";
import { ISettings } from "../types";
import { Client as Styletron } from "styletron-engine-atomic";

export interface IInnerTranslatorProps {
  uuid?: string
  text: string
  autoFocus?: boolean
  showSettings?: boolean
  defaultShowSettings?: boolean
  containerStyle?: React.CSSProperties
  editorRows?: number
  onSettingsSave?: (oldSettings: ISettings) => void
}

export interface IToolWarpProps extends IInnerTranslatorProps {
  engine: Styletron
}

function ToolWarp(props: IToolWarpProps) {
  const { theme } = useTheme()

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