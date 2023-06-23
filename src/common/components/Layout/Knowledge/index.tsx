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

function QuickComponent(props: IQuickProps) {
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

  }, [knowledgeIds])

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  }

  // @ts-ignore
  const handleCreateKnowledge = async (values) => {
    setSubmitLoading(true);
    queryKnowledgeCreate(values).then(() => {
      notice.success("创建成功");
      setShowCreateModal(false);
      setSubmitLoading(false);
    }).catch(() => {
      notice.error("创建失败");
      setSubmitLoading(false);
    })
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

    setSubmitLoading(true);
    setMessageList(prevMessageList => ({...prevMessageList, [userMessageId]: userMessage}));

    try {
      const res = await queryKnowledgeChat({ question, knowledgeIds });
      const message = res.content;
      setSubmitLoading(false);
      const botMessageId = uuidv4().replace(/-/g, '');
      const botMessage = {
        role: "bot",
        messageId: botMessageId,
        content: "",
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

export default QuickComponent;