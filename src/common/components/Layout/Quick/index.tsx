import React, { useState } from "react";
import { Layout, Button, Empty, message as notice } from "antd";
import { Theme } from "baseui-sd/theme";
import { Client as Styletron } from "styletron-engine-atomic";

import _Header from "./Header"
import { Translator } from "./Translator"

import "./index.scss"

interface IQuickProps {
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
      <Layout className="pageContainer">
        <Header style={{paddingInline: 10, background: props.theme?.colors.backgroundPrimary }}>
          <_Header />
        </Header>
        <Content style={{background: props.theme?.colors.backgroundSecondary}}>
          <Translator text={props.text || ""} engine={props.engine} autoFocus />
        </Content>
      </Layout>
    </>
  );
}

export default QuickComponent;