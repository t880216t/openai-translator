"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
const axios_1 = require("axios");

// 在内存中保存消息历史记录
const messages = [];

// 最后一次聊天的日期
let lastChat = new Date();

// 重置历史记录
function reset() {
  print("Resetting chat history");
  messages.length = 0;
  return null;
}

// 获取最后n条消息的内容，去除空格并用两个换行符分隔开来。
function getTranscript(n) {
  return messages.slice(-n).map((m) => m.content.trim()).join("\n\n");
}

// 主要聊天操作
const chat = async (input, options) => {

  const openai = axios_1.default.create({
    baseURL: options.apiBase,
    headers: { Authorization: `Bearer ${options.token}` },
  });

  // 如果上次聊天时间太久了，则重置历史记录
  if (options.resetMinutes.length > 0) {
    const resetInterval = parseInt(options.resetMinutes) *1000*60;
    if(new Date().getTime()-lastChat.getTime()>resetInterval){
      reset();
    }
  }

  // 将新消息添加到历史记录中
  messages.push({ role: "user", content: input.text });

  // 将整个消息历史发送给OpenAI
  const { data }= await openai.post("/v1/chat/completions",{
    model:"gpt-3.5-turbo",
    messages,
  });

  // 将响应添加到历史记录中
  messages.push(data.choices[0].message);
  lastChat = new Date();

  // 如果按住Shift键，则只复制响应。否则，粘贴最后一次输入和响应。
  if (popclip.modifiers.shift) {
    popclip.copyText(getTranscript(1));
  }
  else {
    popclip.pasteText(getTranscript(2));
  }

  return null;
};

// 导出操作
exports.actions = [{
  title: "自动生成",
  icon: "icon-input.svg",
  code: chat,
}, {
  title: "清理历史",
  icon: "icon-clear.svg",
  requirements:["option-showReset=1"],
  after:"show-status",
  code: reset,
}];