// @ts-nocheck
import { LikeOutlined, MessageOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { ConfigProvider, FloatButton } from 'antd';
import request from 'umi-request';
import React, { useState } from 'react';
import { useTheme } from "../../../../hooks/useTheme";

const IconText = ({ icon, text }: { icon: any; text: string }) => (
  <span>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    {text}
  </span>
);

const dataSource = [
  {
    title: '语雀的天空',
  },
  {
    title: 'Ant Design',
  },
  {
    title: '蚂蚁金服体验科技',
  },
  {
    title: 'TechUI',
  },
];

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: any) => setSelectedRowKeys(keys),
  };
  const { theme, themeType } = useTheme()
  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInversePrimary : theme?.colors.contentPrimary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInverseSecondary : undefined,
        },
      }}
    >
      <ProList
        itemLayout="vertical"
        rowKey="id"
        dataSource={dataSource}
        showActions="hover"
        grid={{ gutter: 16, column: 1 }}
        rowSelection={rowSelection}
        pagination={{
          defaultPageSize: 8,
          showSizeChanger: true,
        }}
        onItem={(record: any) => {
          return {
            onMouseEnter: () => {
              console.log(record);
            },
            onClick: () => {
              console.log(record);
            },
          };
        }}
        metas={{
          title: {},
          actions: {
            render: () => [
              <IconText
                icon={StarOutlined}
                text="156"
                key="list-vertical-star-o"
              />,
              <IconText
                icon={LikeOutlined}
                text="156"
                key="list-vertical-like-o"
              />,
              <IconText
                icon={MessageOutlined}
                text="2"
                key="list-vertical-message"
              />,
            ],
          },
          content: {
            render: () => {
              return (
                <div>
                  段落示意：蚂蚁金服设计平台
                  design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。蚂蚁金服设计平台
                  design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态提供跨越设计与开发的体验解决方案。
                </div>
              );
            },
          },
        }}
      />
    </ConfigProvider>
  );
};