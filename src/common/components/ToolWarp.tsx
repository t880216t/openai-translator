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
      <BaseComponent {...props} />
    </ConfigProvider>
  );
}

export default ToolWarp;