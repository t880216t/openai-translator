import React, { useState, useEffect } from "react";
import { Layout, Button, Empty, message as notice, FloatButton } from "antd";
import { Theme } from "baseui-sd/theme";
import { Client as Styletron } from "styletron-engine-atomic";
import { queryKnowledgeList, queryKnowledgeCreate, queryKnowledgeChat, queryKnowledgeRemove } from "../../../knowledge";

import _Header from "./Header"
import _Content from "./Content"
import CreateModal from "./Modals/CreateModal"

import "./index.scss"
import { PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

const { Header, Content } = Layout;

interface IQuickProps {
  showSetting: boolean
  isShow: boolean
  text?: string
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
  const [selectKnowledgeList, setSelectKnowledgeList] = useState<IKnowledge[]>([]);
  const [messageList, setMessageList] = useState<{[key: string]: any}>({});

  // @ts-ignore
  useEffect(async () => {
    const res: IKnowledgeResponse = await queryKnowledgeList({listType});
    if (res.code == 0) {
      setKnowledgeContent(res.content);
    }
  }, []);

  useEffect(()=>{
    if (knowledgeContent && knowledgeContent.knowledge_list && knowledgeIds.length > 0) {
      const selectKnowledgeList = knowledgeContent.knowledge_list.filter((item) => {
        return knowledgeIds.includes(item.knowledge_id)
      })
      setSelectKnowledgeList(selectKnowledgeList)
    }else {
      setSelectKnowledgeList([])
    }
    setMessageList({})
  }, [knowledgeIds])

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  }

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

  const handleSendMessage = async (question: string) => {
    const userMessageId = uuidv4().replace(/-/g, '');
    const userMessage = {
      role: "user",
      messageId: userMessageId,
      content: question,
      createAt: new Date().getTime(),
    };

    // 格式化历史消息，将role为user的消息格式化Human: + content，将role为bot的消息格式化为Assistant: + content，拼接叠加为一个完整的chatHistory字段：
    let chatHistory = "";
    Object.keys(messageList).forEach((key) => {
      const item = messageList[key];
      if (item.role === "user") {
        chatHistory += `Human: ${item.content}\n`;
      } else {
        chatHistory += `Assistant: ${item.content}\n`;
      }
    });

    setSubmitLoading(true);
    setMessageList(prevMessageList => ({...prevMessageList, [userMessageId]: userMessage}));

    try {
      const res = await queryKnowledgeChat({ question, knowledgeIds, chatHistory });
      const message = res.content;
      const sources = res.sources;
      setSubmitLoading(false);
      const botMessageId = uuidv4().replace(/-/g, '');
      const botMessage = {
        role: "bot",
        messageId: botMessageId,
        content: "",
        sources: sources,
        createAt: new Date().getTime(),
      };

      setMessageList(prevMessageList => ({...prevMessageList, [botMessageId]: botMessage}));

      // 逐个字地输出文本
      for (let i = 0; i < message.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 延迟100毫秒
        setMessageList(prevMessageList => ({
          ...prevMessageList,
          [botMessageId]: {...botMessage, content: message.slice(0, i + 1)}
        }));
      }
    } catch (error) {
      notice.error("发送失败");
      setSubmitLoading(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const newMessageList = {...messageList};
    delete newMessageList[messageId];
    setMessageList(newMessageList);
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


  return (
    <>
      <Layout style={{height: props.isShow ? "100%": "0px"}} className="pageContainer">
        <Header style={{paddingInline: 10, background: props.theme?.colors.backgroundPrimary }}>
          <_Header
            messageList={messageList}
            listType={listType}
            selectKnowledgeList={selectKnowledgeList}
            onListTypeChange={handleListTypeChange}
            onStartKnowLedgeChat={handleStartKnowLedgeChat}
            showDrawer={showDrawer}
            submitLoading={submitLoading}
            onCloseDrawer={() => setShowDrawer(false)}
            onDelete={handleDeleteMessage}
            onSendMessage={handleSendMessage}
          />
        </Header>
        <Content style={{background: props.theme?.colors.backgroundSecondary, overflowY: 'auto'}}>
          <_Content
            knowledgeContent={knowledgeContent}
            onPageChange={handlePageChange}
            onKnowledgeIdsChange={handleKnowledgeIdsChange}
            onStartKnowLedgeChat={handleStartKnowLedgeChat}
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