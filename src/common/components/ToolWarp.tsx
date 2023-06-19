import { Button, ConfigProvider, Switch, Tooltip } from "antd";
import React, { useEffect, useState } from "react";

import BaseComponent from "./Layout";
import Start from "./Start"

import { useTheme } from "../hooks/useTheme";
import { ISettings } from "../types";
import { Client as Styletron } from "styletron-engine-atomic";
import * as utils from "../utils";
import { useSettings } from "../hooks/useSettings";

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
  const { theme, themeType } = useTheme()
  const [systemSettings, setSystemSettings] = useState<ISettings>()
  const skipLogin = true

  useEffect(async () => {
    const settings = await utils.getSettings()
    if (settings){
      if (!settings.userToken && skipLogin){
        const uuid = utils.generateUUID();
        const new_settings = { ...settings, userToken: uuid }
        await utils.setSettings(new_settings)
        setSystemSettings(new_settings)
      }
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: theme.colors.contentSecondary,
          colorPrimary: theme.colors.contentPrimary,
          colorBgBase: theme.colors.backgroundTertiary
        },
      }}
    >
      {systemSettings && systemSettings.userToken ? (
        <BaseComponent {...props} />
      ): skipLogin ?(
        <BaseComponent {...props} />
      ): (
        <Start />
      )}
    </ConfigProvider>
  );
}

export default ToolWarp;