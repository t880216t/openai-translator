import React, { useEffect, useState } from "react";
import { Tabs, Button } from 'antd';
import type { TabsProps } from 'antd';
import { SettingOutlined } from '@ant-design/icons'

import { useTheme } from "../../hooks/useTheme";
import { Settings } from '../Settings'

import Chat from "./Chat"
import Quick from "./Quick"
import Knowledge from "./Knowledge";
import Speech from "./Meeting/Speech";

import "./index.scss"
import { IInnerProps } from './types';
import { Client as Styletron } from "styletron-engine-atomic";

interface IBaseProps extends IInnerProps{
  engine: Styletron
}

function  BaseComponent(props: IBaseProps) {
  const [activeKey, setActiveKey] = useState("quick");
  const [showSetting, setShowSetting] = useState(false);
  const { theme } = useTheme()

  useEffect(() => {
    // 从localstorage中获取actionModel
    const actionModel = localStorage.getItem("_actionModel");
    if (actionModel) {
      try{
        const actionModelObj = JSON.parse(actionModel);
        if (actionModelObj?.actionModel){
          setActiveKey(actionModelObj?.actionModel);
        }
      }catch (e) {
        console.log(e)
      }
    }
  }, []);

  useEffect(() => {
    if (props.text && activeKey == "knowledge"){
      setActiveKey("quick");
    }
  }, [props.text]);

  const handleActionModelChange = (value: string) => {
    setActiveKey(value);
    localStorage.setItem("_actionModel", JSON.stringify({actionModel: value}));
  };

  const items: TabsProps['items'] = [
    {
      key: 'quick',
      label: `快捷功能`
    },
    {
      key: "chat",
      label: "对话模式"
    },
    {
      key: "knowledge",
      label: `知识库`
    },
    {
      key: "meeting",
      // disabled: true,
      label: `会议记录员`
    }
  ];

  return (
    <div className="container">
      <div className="content">
        <Chat isShow={activeKey == "chat"} theme={theme} {...props} />
        <Quick isShow={activeKey == "quick"} theme={theme} {...props} engine={props.engine} />
        <Knowledge showSetting={showSetting} isShow={activeKey == "knowledge"} theme={theme} {...props}
                   engine={props.engine} />
        <Speech isShow={activeKey == "meeting"} theme={theme} {...props} engine={props.engine} />
      </div>
      {showSetting && (
        <Settings
          engine={props.engine}
          onSave={(oldSettings) => {
            setShowSetting(false)
            props.onSettingsSave?.(oldSettings)
          }}
        />
      )}
      <div className="footer" style={{background: theme.colors.backgroundSecondary, display: showSetting? "none": undefined}}>
        <Tabs
          size="small"
          onChange={handleActionModelChange}
          tabPosition="bottom"
          items={items}
          activeKey={activeKey}
          tabBarExtraContent={{
            right: (
              <Button onClick={() => setShowSetting(true)} type="text" icon={<SettingOutlined />} />
            ),
          }}
        />
      </div>
    </div>
  );
}

export default BaseComponent;