import React, { useEffect, useState } from "react";
import { Space, Radio, ConfigProvider, Button } from "antd";
import { MessageOutlined } from '@ant-design/icons';
import { Theme } from 'baseui-sd/theme'
import "./index.scss";
import { useTheme } from "../../../../hooks/useTheme";

interface IHeaderProps {
  theme?: Theme;
}

function QuickHeader(props: IHeaderProps) {
  const { theme, themeType } = useTheme()
  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentPrimary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInversePrimary : theme?.colors.backgroundSecondary,
        },
      }}
    >
      <div className="header-wrap">
        <div className="title" style={{color: props.theme?.colors?.contentPrimary}}>
          <span>K-DB</span>
        </div>
        <div>
          <Radio.Group size="small" defaultValue="a" buttonStyle="solid">
            <Radio.Button value="a">我的库</Radio.Button>
            <Radio.Button value="b">公共库</Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <Space>
            <Button type="text" icon={<MessageOutlined style={{color: theme?.colors.contentPrimary}} />}/>
          </Space>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default QuickHeader;