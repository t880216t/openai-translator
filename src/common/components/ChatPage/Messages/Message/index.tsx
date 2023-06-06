import React, { useEffect, useState } from "react";
import { Button, Avatar } from "antd";
import { CopyOutlined, UserOutlined } from '@ant-design/icons'
import { CopyButton } from '@mantine/core';

import "./index.scss"
import { IMessage } from "../../../../types";
import ChatGPTLogo from '../../../../assets/images/ChatGPT_logo.svg';
import { Markdown } from './markdown'

function Message(props: IMessage) {
  const [content, setContent] = useState(props.text)

  useEffect(() => {
    setContent(props.text)
  }, [props.text])

  return (
    <div className={`message ${props?.isMe ? "me": "other"}`}>
      <div className={`logo ${props.isMe? "": ""}`}>
        {props?.isMe ? <Avatar size={36} shape="square" icon={<UserOutlined />} /> :
          <Avatar size={36} shape="square" src={<img style={{height: "100%"}} src={ChatGPTLogo} alt="ChatGPT Logo" />} />
        }
      </div>
      <div className="content-wrap">
        <div className="content">
          <Markdown content={content} />
        </div>
        <div className="action-wrap">
          {!props?.isMe &&  (
            <CopyButton value={content}>
              {({ copy, copied }) => (
                <Button onClick={copy} type="text" icon={<CopyOutlined style={{color: '#b3b3ba'}} />} />
              )}
            </CopyButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;