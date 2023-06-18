import React, { useEffect, useState } from "react";
import { Tabs, Button } from 'antd';
import type { TabsProps } from 'antd';
import { SettingOutlined } from '@ant-design/icons'

import { useTheme } from "../../hooks/useTheme";
import * as utils from '../../utils'
import { Settings } from '../Settings'

import Chat from "./Chat"
import Quick from "./Quick"

import "./index.scss"
import { IInnerProps } from './types';
import { Client as Styletron } from "styletron-engine-atomic";

interface IBaseProps extends IInnerProps{
  engine: Styletron
}

function BaseComponent(props: IBaseProps) {
  const [activeKey, setActiveKey] = useState("chat");
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

  const handleActionModelChange = (value: string) => {
    setActiveKey(value);
    localStorage.setItem("_actionModel", JSON.stringify({actionModel: value}));
  };

  const items: TabsProps['items'] = [
    {
      key: 'quick',
      label: `快捷功能`,
    },
    {
      key: 'chat',
      label: '对话模式',
    },
    {
      key: 'knowledge',
      label: `知识库`,
    },
  ];

  return (
    <div className="container">
      <div className="content">
        {activeKey === "chat" && <Chat theme={theme} {...props} />}
        {activeKey === "quick" && <Quick theme={theme} {...props} engine={props.engine} />}
      </div>
      <div className="footer" style={{background: theme.colors.backgroundSecondary}}>
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
      {showSetting && (
        <Settings
          engine={props.engine}
          onSave={(oldSettings) => {
            setShowSetting(false)
            props.onSettingsSave?.(oldSettings)
          }}
        />
      )}
    </div>
  );
}

export default BaseComponent;