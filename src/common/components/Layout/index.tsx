import React, { useState } from 'react';
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
  const { theme, themeType } = useTheme()

  const onChange = (key: string) => {
    setActiveKey(key)
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
          onChange={onChange}
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