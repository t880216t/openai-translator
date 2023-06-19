import React, { useState } from "react";
import { Layout, Button, Empty, message as notice, FloatButton } from "antd";
import { Theme } from "baseui-sd/theme";
import { Client as Styletron } from "styletron-engine-atomic";

import _Header from "./Header"
import _Content from "./Content"

import "./index.scss"
import { PlusOutlined } from "@ant-design/icons";

interface IQuickProps {
  showSetting: boolean
  isShow: boolean
  text?: string
  theme?: Theme;
  engine?: Styletron;
}

const { Header, Footer, Content } = Layout;

function QuickComponent(props: IQuickProps) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <>
      <Layout style={{height: props.isShow ? "100%": "0px"}} className="pageContainer">
        <Header style={{paddingInline: 10, background: props.theme?.colors.backgroundPrimary }}>
          <_Header />
        </Header>
        <Content style={{background: props.theme?.colors.backgroundSecondary, overflowY: 'auto'}}>
          <_Content />
        </Content>
      </Layout>
      {(props.isShow && !props.showSetting )&& (
        <FloatButton
          tooltip="新建知识库"
          type="primary"
          onClick={() => console.log('click')}
          icon={<PlusOutlined />}
          style={{ bottom: "15%" }}
        />
      )}
    </>
  );
}

export default QuickComponent;