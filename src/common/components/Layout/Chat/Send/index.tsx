import React, { useEffect, useState } from "react";
import {SendOutlined, BorderOutlined} from '@ant-design/icons'
import { Button, Mentions } from 'antd';

import './index.scss'
import { useTheme } from "../../../../hooks/useTheme";

interface Item {
  key: string;
  value: string;
  label: string;
}

interface ISendProps{
  onSendMessage: (prompt: string) => void;
  onStopSend: () => void;
  onSubmitting: boolean;
  text?: string
}

function Send(props: ISendProps) {
  const [originalText, setOriginalText] = useState(props.text)
  const [helpPrompts, setHelpPrompts] = useState( [])
  const [matchedData, setMatchedData] = useState<Item[]>([]);
  const { theme, themeType } = useTheme()
  const [showStop, setShowStop] = useState(false)

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
    if (e.keyCode === 13 && !e.shiftKey) {
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
  const handleUserPrompt = async (prompt: string) => {
    if (prompt.trim() === "") {
      return;
    }
    setOriginalText("");
    await props.onSendMessage(prompt);
    setShowStop(false)
  };

  const handleMouseEnter = () => {
    if (props.onSubmitting){
      setShowStop(true)
    }
  }

  const handleStop = () => {
    props.onStopSend()
  }

  return (
    <div className="input-wrap">
      <Mentions
        className="mentions"
        style={{
          border: 'none',
          boxShadow: 'none',
          background: theme.colors.backgroundSecondary,
          color: theme.colors.contentPrimary,
        }}
        onSearch={onSearch}
        onSelect={(record: any, prefix) => onSelect(record.value, prefix)}
        onChange={(value) => onInputChange(value)}
        placeholder="来说点什么吧...(Shift+Enter=换行),输入 / 查看更多推荐"
        autoFocus
        autoSize={{maxRows: 4 }}
        value={originalText}
        prefix={"/"}
        options={matchedData || []}
        onPressEnter={onPressEnter}
      />
      <Button
        className="send"
        size="small"
        type={originalText?.trim() === "" ? "default" : "primary"}
        icon={
          showStop?
            <BorderOutlined style={{color: theme.colors.contentPrimary, fontWeight: "bold", fontSize: 16}} />
            :
            <SendOutlined style={props.onSubmitting ? {color: theme.colors.contentPrimary, fontWeight: "bold", fontSize: 16}: undefined} />
        }
        loading={showStop? false: props.onSubmitting}
        style={{
          background: originalText?.trim() === "" ? theme.colors.backgroundSecondary: theme.colors.backgroundInversePrimary,
          color: originalText?.trim() === "" ? theme.colors.contentPrimary: theme.colors.contentInversePrimary,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowStop(false)}
        onClick={async () => props.onSubmitting ? await handleStop() : await handleUserPrompt(originalText || "")}
      />
    </div>
  );
}

export default Send;