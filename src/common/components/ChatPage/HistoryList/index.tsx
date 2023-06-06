import React, { useEffect, useState } from "react";
import { MessageOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Modal } from 'antd';

import './index.scss'

interface IHistoryProps {
  historyList: Record<string, DataItem>;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

type MenuItem = Required<MenuProps>['items'][number];

interface DataItem {
  title: string;
  createAt: number;
  icon: React.ReactNode;
  uuid: string;
}

interface FormattedDataItem {
  label: string;
  group: boolean;
  icon: React.ReactNode;
  children: { label: string; key: string }[];
}

function formatData(data: Record<string, DataItem>): FormattedDataItem[] {
  const groupedData: Record<string, { label: string; key: string, icon: React.ReactNode }[]> = {};

  // 以 createAt 为键，将数据按日期进行分组
  for (const key in data) {
    const { title, createAt, uuid } = data[key];
    const formattedDate = formatDate(createAt);
    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = [];
    }
    groupedData[formattedDate].push({ label: title, key: uuid, icon: <MessageOutlined /> });
  }

  // 将分组后的数据格式化为所需的结构
  const formattedData: FormattedDataItem[] = [];
  for (const date in groupedData) {
    const children = groupedData[date];
    formattedData.push({
      label: date,
      group: true,
      icon: null,
      children: children,
    });
  }

  // 按日期排序
  formattedData.sort((a, b) => b.label.localeCompare(a.label));

  return formattedData;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function HistoryList(props: IHistoryProps) {
  const [historyMenuData, setHistoryMenuData] = useState<MenuItem>(null)
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const formattedData = formatData(props.historyList);
    setHistoryMenuData(formattedData)
  }, [props.historyList])

  const onClick= (e) => {
    props.onSelect(e.key)
  };


  const handleDelete = (e, record) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
    setRecord(record)
  };

  return (
    <div className="history-list-wrap">
      <Menu
        theme="dark"
        mode="inline"
        inlineIndent={16}
        inlineCollapsed={false}
        // items={historyMenuData}
      >
        {historyMenuData && historyMenuData.map((item) => (
          <Menu.ItemGroup key={item.label} title={item.label}>
            {item.children.map((child) => (
              <Menu.Item key={child.key} icon={child.icon} onClick={onClick } >
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <span>{child.label}</span>
                  <DeleteOutlined onClick={(e) => handleDelete(e, child)} />
                </div>
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        ))}
      </Menu>
      <Modal
        title="删除会话"
        centered
        open={open}
        onOk={() => {
          props?.onDelete(record.key)
          setOpen(false)
          setRecord(null)
        }}
        onCancel={() => {
          setOpen(false)
          setRecord(null)
        }}
      >
        <p>{`确认删除会话：${record?.label}`}</p>
      </Modal>
    </div>
  );
}

export default HistoryList;