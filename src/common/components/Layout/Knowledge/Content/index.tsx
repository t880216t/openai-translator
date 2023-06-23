// @ts-nocheck
import { ClearOutlined, MessageOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Button, ConfigProvider, Popconfirm } from "antd";
import React, { useState } from 'react';

import { IKnowledgeContent, IKnowledge } from "../index"
import { useTheme } from "../../../../hooks/useTheme";

const IconText = ({ icon, text }: { icon: any; text: string }) => (
  <span>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    {text}
  </span>
);

interface IContentProps {
  knowledgeContent?: IKnowledgeContent;
  onPageChange: (page: number) => void;
  onKnowledgeIdsChange: (knowledgeIds: string[]) => void;
  onStartKnowLedgeChat: (knowledgeIds?: string[]) => void;
  onDeleteKnowledge: (id: string) => void;
}

export default (props: IContentProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: any) => {
      setSelectedRowKeys(keys)
      props.onKnowledgeIdsChange(keys)
    },
  };
  const { theme, themeType } = useTheme()

  const handleChatWithOne = (record: IKnowledge) => {
    setSelectedRowKeys([record.knowledge_id])
    props.onStartKnowLedgeChat([record.knowledge_id])
  }
  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInversePrimary : theme?.colors.contentInverseTertiary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInverseSecondary : undefined,
        },
      }}
    >
      <ProList
        itemLayout="vertical"
        rowKey="knowledge_id"
        dataSource={props?.knowledgeContent?.knowledge_list}
        showActions="hover"
        grid={{ gutter: 16, column: 1 }}
        rowSelection={rowSelection}
        pagination={{
          total: props?.knowledgeContent?.total,
          defaultPageSize: 10,
          showSizeChanger: true,
          onChange: (page) => {
            props.onPageChange(page);
          },
        }}
        metas={{
          title: {},
          actions: {
            render: (_, record) => [
              <Button type="text" onClick={() => handleChatWithOne(record)} size="small" icon={<MessageOutlined style={{fontSize: 18}} />} />,
              <>{record.knowledge_type === 1 && (
                <Popconfirm title="删除知识" description="您确认要删除该知识库吗？" onConfirm={() => props?.onDeleteKnowledge(record.knowledge_id)}>
                  <Button type="text" size="small" icon={<ClearOutlined style={{fontSize: 18}} />} />
                </Popconfirm>
              )}</>,
            ],
          },
          content: {
            render: (_, record) => <span>{record.description}</span>,
          },
        }}
      />
    </ConfigProvider>
  );
};