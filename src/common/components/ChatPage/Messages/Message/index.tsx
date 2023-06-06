import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { CopyOutlined } from '@ant-design/icons'

import "./index.scss"
import { IMessage } from "../../../../types";
import ChatGPTLogo from '../../../../assets/images/ChatGPT_logo.svg';
import { Markdown } from '../../../Markdown'

function Message(props: IMessage) {
  const [content, setContent] = useState(props.text)

  useEffect(() => {
    setContent(props.text)
  }, [props.text])

  return (
    <div className={`message ${props?.isMe ? "me": "other"}`}>
      <div className={`logo ${props.isMe? "": ""}`}>
        {props?.isMe ? "我" : 
          ChatGPTLogo && <img src={ChatGPTLogo} alt="ChatGPT Logo" />
        }
      </div>
      <div className="content-wrap">
        <div className="content">
          <Markdown>{content}</Markdown>
        </div>
        <div className="action-wrap">
          {!props?.isMe && <Button type="text" icon={<CopyOutlined style={{color: '#d9d9e3'}} />} />}
        </div>
      </div>
    </div>
  );
}

export default Message;