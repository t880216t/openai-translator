import React, { useState, useEffect } from "react";
import { Layout, Button, Empty, message as notice, FloatButton, message } from "antd";
import { Theme } from "baseui-sd/theme";
import { Client as Styletron } from "styletron-engine-atomic";
import {
  queryKnowledgeList,
  queryKnowledgeCreate,
  queryKnowledgeShare,
  queryKnowledgeRemove,
  queryKnowledgeFileDownload,
} from "../../../knowledge";

import _Header from "./Header";
import _Content from "./Content";
import CreateModal from "./Modals/CreateModal";

import "./index.scss";
import { PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { downloadDir } from "@tauri-apps/api/path";
import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";
import { chat } from "../../../chat";
import { IMessage } from "../types";

const { Header, Content } = Layout;

interface IQuickProps {
  showSetting: boolean;
  isShow: boolean;
  text?: string;
  theme?: Theme;
  engine?: Styletron;
}

export interface IKnowledge {
  create_time: string
  data_type: number
  description: string
  file_name: string
  knowledge_id: string
  knowledge_type: number
  link: string
  title: string
}

export interface IKnowledgeContent {
  knowledge_list: IKnowledge[],
  total: number
}

export interface IKnowledgeResponse {
  code: number;
  content: IKnowledgeContent;
  msg: string
}

function knowledgeComponent(props: IQuickProps) {
  const [knowledgeContent, setKnowledgeContent] = useState<IKnowledgeContent>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [listType, setListType] = useState("1");
  const [knowledgeIds, setKnowledgeIds] = useState<string[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [abortController, setAbortController] = useState();
  const [selectKnowledgeList, setSelectKnowledgeList] = useState<IKnowledge[]>([]);
  const [messageList, setMessageList] = useState<{ [key: string]: any }>({});
  const [userPrompts, setUserPrompts] = useState<string[]>([]);
  const [lastAssistPrompt, setLastAssistPrompt] = useState<string | null>(null);
  const [needShowThinking, setNeedShowThinking] = useState(false);

  // @ts-ignore
  useEffect(async () => {
    const res: IKnowledgeResponse = await queryKnowledgeList({ listType });
    if (res.code == 0) {
      setKnowledgeContent(res.content);
    }
  }, []);

  useEffect(() => {
    if (knowledgeContent && knowledgeContent.knowledge_list && knowledgeIds.length > 0) {
      const selectKnowledgeList = knowledgeContent.knowledge_list.filter((item) => {
        return knowledgeIds.includes(item.knowledge_id);
      });
      setSelectKnowledgeList(selectKnowledgeList);
    } else {
      setSelectKnowledgeList([]);
    }
    setMessageList({});
  }, [knowledgeIds])

  useEffect(() => {
    if (Object.keys(messageList).length > 0) {
      const userPrompts = Object.keys(messageList).filter((key) => {
        return messageList[key].role === "user" && messageList[key].content;
      }).map((key) => {
        return messageList[key].content;
      });
      // 获取messageList最后一条bot消息的content
      const lastAssistMessage = Object.keys(messageList).filter((key) => {
        return messageList[key].role !== "user" && messageList[key].content;
      }).map((key) => {
        return messageList[key].content;
      }).pop();
      if (lastAssistMessage) {
        setUserPrompts(userPrompts);
        setLastAssistPrompt(lastAssistMessage);
      }
    }
  }, [messageList]);

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  // @ts-ignore
  const handleCreateKnowledge = async (values) => {
    setSubmitLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      queryKnowledgeCreate({
        fileName: values?.file.name,
        fileData: dataUrl,
        knowledgeType: values?.knowledgeType,
        dataType: values?.dataType,
        description: values?.description,
        link: values?.link,
        name: values?.name,
      }).then(() => {
        notice.success("创建成功");
        setShowCreateModal(false);
        setSubmitLoading(false);
        queryKnowledgeList({listType}).then((res) => {
          if (res.code == 0) {
            setKnowledgeContent(res.content);
          }
        })
      }).catch(() => {
        notice.error("创建失败");
        setSubmitLoading(false);
      })
    };
    reader.readAsDataURL(values.file);
  }

  const handlePageChange = async (page: number) => {
    const res: IKnowledgeResponse = await queryKnowledgeList({listType, pageNum: page});
    if (res.code == 0) {
      setKnowledgeContent(res.content);
    }
  }

  const handleKnowledgeIdsChange = (ids: string[]) => {
    setKnowledgeIds(ids);
  }

  const handleListTypeChange = async (type: string) => {
    setListType(type);
    const res: IKnowledgeResponse = await queryKnowledgeList({listType: type});
    if (res.code == 0) {
      setKnowledgeContent(res.content);
    }
  }

  const handleStartKnowLedgeChat = (custom_knowledgeIds?: string[]) => {
    if (custom_knowledgeIds) {
      setKnowledgeIds(custom_knowledgeIds);
    }
    setShowDrawer(true)
  }

  const handleShareKnowledge = (knowledgeId: string) => {
    queryKnowledgeShare({knowledgeId}).then((res) => {
      if (res.code == 0) {
        notice.success("分享成功");
      } else {
        notice.error("分享失败");
      }
    })
  }

  const handleSendMessage = async (question: string) => {
    const userMessageId = uuidv4().replace(/-/g, "");
    const userMessage = {
      role: "user",
      messageId: userMessageId,
      content: question,
      createAt: new Date().getTime()
    };
    setMessageList(prevMessageList => ({ ...prevMessageList, [userMessageId]: userMessage }));
    await sendMessage(question);
  };

  const onResponseMessage = (message: IMessage) => {
    // 添加一条发送人是机器人的message，根据messageId合并流式接口返回的多条消息
    setMessageList((messageList) => {
      if (messageList[message.messageId]) {
        const oldMessage = messageList[message.messageId];
        // 如果是流式接口返回的消息，合并到原来消息的content中
        return { ...messageList, [message.messageId]: { ...oldMessage, content: oldMessage.content + message.content } };
      }
      return { ...messageList, [message.messageId]: message };
    });
  };

  const sendMessage = async (prompt: string) => {
    setSubmitLoading(true);
    setNeedShowThinking(true);
    // 如果控制器存在,说明有上个请求,就它取消并设置为空
    let controller = new AbortController();
    // @ts-ignore
    setAbortController(controller);
    await chat({
      text: prompt,
      assistantPrompts: userPrompts,
      lastPrompt: lastAssistPrompt,
      // @ts-ignore
      signal: controller.signal,
      onMessage: (message: { role: string, finishReason: string }) => {
        if (message.role) return;
        setNeedShowThinking(false);
        if (message?.finishReason === "stop") {
          setSubmitLoading(false);
        }
        // @ts-ignore
        onResponseMessage(message);
      },
      onFinish: (reason: string | undefined) => {
        console.log("reason", reason);
        setSubmitLoading(false);
      },
      onError: (error: any) => {
        console.log(error);
        notice.error("请求失败，请检查网络及配置！");
        setSubmitLoading(false);
        setNeedShowThinking(false);
      }
    }, "/v1/knowledge/stream_question");
  };

  const handleDeleteMessage = (messageId: string) => {
    const newMessageList = { ...messageList };
    delete newMessageList[messageId];
    setMessageList(newMessageList);
  };

  const handleDownloadFile = (knowledgeId: string, fileName: string) => {
    queryKnowledgeFileDownload({ knowledgeId }).then(async (res) => {
      try {
        const download_dir = await downloadDir();
        const save_name = `${new Date().getTime().toString()}_${fileName}`
        await writeBinaryFile(save_name, res, { dir: BaseDirectory.Download });
        message.success(`文件已保存至：${download_dir}${save_name}` )
      } catch (error) {
        console.error('Failed to save :', error);
        message.error('保存失败')
      }
    })
  }

  const handleDeleteKnowledge = (knowledgeId: string) => {
    queryKnowledgeRemove({knowledgeId}).then((res) => {
      if (res.code == 0) {
        notice.success("删除成功");
        queryKnowledgeList({listType}).then((res) => {
          if (res.code == 0) {
            setKnowledgeContent(res.content);
          }
        })
      }
    })
  }

  const handleStopSend = () => {
    if (abortController) {
      // @ts-ignore
      abortController?.abort();
      setSubmitLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setMessageList([]);
    setLastAssistPrompt("");
    setUserPrompts([]);
  };


  return (
    <>
      <Layout style={{ height: props.isShow ? "100%" : "0px" }} className="pageContainer">
        <Header style={{ paddingInline: 10, background: props.theme?.colors.backgroundPrimary }}>
          <_Header
            messageList={messageList}
            listType={listType}
            selectKnowledgeList={selectKnowledgeList}
            onListTypeChange={handleListTypeChange}
            onStartKnowLedgeChat={handleStartKnowLedgeChat}
            showDrawer={showDrawer}
            submitLoading={submitLoading}
            needShowThinking={needShowThinking}
            onCloseDrawer={() => handleCloseDrawer()}
            onDelete={handleDeleteMessage}
            onStopSend={handleStopSend}
            onDownload={handleDownloadFile}
            onSendMessage={handleSendMessage}
          />
        </Header>
        <Content style={{background: props.theme?.colors.backgroundSecondary, overflowY: 'auto'}}>
          <_Content
            listType={listType}
            knowledgeContent={knowledgeContent}
            onPageChange={handlePageChange}
            onKnowledgeIdsChange={handleKnowledgeIdsChange}
            onStartKnowLedgeChat={handleStartKnowLedgeChat}
            onShareKnowLedge={handleShareKnowledge}
            onDeleteKnowledge={handleDeleteKnowledge}
          />
        </Content>
      </Layout>
      {(props.isShow && !props.showSetting )&& (
        <FloatButton
          tooltip="新建知识库"
          type="primary"
          onClick={() => handleShowCreateModal()}
          icon={<PlusOutlined style={{
            color: props.theme?.colors.contentInversePrimary,
          }} />}
          style={{
            bottom: "15%",
            background: props.theme?.colors.backgroundSecondary
          }}
        />
      )}
      <CreateModal
        submitLoading={submitLoading}
        showModal={showCreateModal}
        onOpenChange={(open) => setShowCreateModal(open)}
        onCreateKnowledge={handleCreateKnowledge}
      />
    </>
  );
}

export default knowledgeComponent;