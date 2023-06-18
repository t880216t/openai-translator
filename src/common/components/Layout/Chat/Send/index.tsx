import React, { useEffect, useState } from "react";
import {SendOutlined} from '@ant-design/icons'
import { Button, Mentions } from 'antd';
import { Theme } from "baseui-sd/theme";

import './index.scss'

interface Item {
  key: string;
  value: string;
  label: string;
}

interface ISendProps{
  theme?: Theme;
  onSendMessage: (prompt: string) => void;
  onSubmitting: boolean;
  text?: string
}

function Send(props: ISendProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [helpPrompts, setHelpPrompts] = useState( [])
  const [matchedData, setMatchedData] = useState<Item[]>([]);

  useEffect(() => {
    setOriginalText(props.text)
  }, [props.text])

  useEffect(() => {
    fetch('http://42.192.93.252:9000/prompt/prompts_zh.json')
      .then(response => response.json())
      .then(data => {
        setHelpPrompts(data);
      })
      .catch(e => console.log("Oops, error", e))
  }, [])

  const onInputChange = (value: string) => {
    const regx = new RegExp("/image\\$\\s*([^\\s]+)");
    setOriginalText(value.replace(regx, "/image"));
  };

  const onPressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleUserPrompt((e.target as HTMLTextAreaElement).value);
    }
  };

  const onSearch = (search: string) => {
    const matchedItems = helpPrompts
      .filter((item: Item) => item?.key.toLowerCase().includes(search.toLowerCase()))
      .map((item: Item, index) => ({ label: item?.key, key: `${item?.key}_${index}`, value: item?.value }));
    setMatchedData(matchedItems);
  };

  const onSelect = (text: string, prefix: string) => {
    setOriginalText(text)
  };

  // 重构
  const handleUserPrompt = (prompt: string) => {
    if (prompt.trim() === "") {
      return;
    }
    setOriginalText("");
    props.onSendMessage(prompt);
  };

  return (
    <div className="input-wrap">
      <Mentions
        className="mentions"
        style={{
          border: 'none',
          boxShadow: 'none',
          background: props.theme?.colors.backgroundSecondary,
          color: props.theme?.colors.contentPrimary,
        }}
        onSearch={onSearch}
        onSelect={(record: any, prefix) => onSelect(record.value, prefix)}
        onChange={(value) => onInputChange(value)}
        placeholder="来说点什么吧...（Ctrl + Enter = 发送），输入 / 查看更多推荐"
        autoFocus
        autoSize={{maxRows: 4 }}
        value={originalText}
        prefix={"/"}
        options={matchedData}
        onPressEnter={onPressEnter}
      />
      <Button
        className="send"
        size="small"
        type={originalText?.trim() === "" ? "default" : "primary"}
        icon={<SendOutlined style={props.onSubmitting ? {color: props.theme?.colors.contentPrimary, fontWeight: "bold", fontSize: 16}: undefined} />}
        loading={props.onSubmitting}
        style={{
          background: originalText?.trim() === "" ? props.theme?.colors.backgroundSecondary: props.theme?.colors.backgroundInversePrimary,
          color: originalText?.trim() === "" ? props.theme?.colors.contentPrimary: props.theme?.colors.contentInversePrimary,
        }}
        onClick={async () => await handleUserPrompt(originalText || "")}
      />
    </div>
  );
}

export default Send;