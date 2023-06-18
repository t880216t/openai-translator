import React, { useEffect, useState } from "react";
import { Tabs, Button } from 'antd';
import type { TabsProps } from 'antd';
import { SettingOutlined } from '@ant-design/icons'
import { useTheme } from "../../hooks/useTheme";

import Chat from "./Chat"

import "./index.scss"
import { IInnerProps } from './types';

interface IBaseProps extends IInnerProps{
}

function BaseComponent(props: IBaseProps) {
  const [activeKey, setActiveKey] = useState("chat");
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

  const handleActionModelChange = (value: boolean) => {
    setActiveKey(value);
    localStorage.setItem("_actionModel", JSON.stringify({actionModel: value}));
  };

  const items: TabsProps['items'] = [
    {
      key: 'chat',
      label: '对话模式',
    },
    {
      key: 'quick',
      label: `快捷问答`,
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
              <Button type="text" icon={<SettingOutlined />} />
            ),
          }}
        />
      </div>
    </div>
  );
}

export default BaseComponent;