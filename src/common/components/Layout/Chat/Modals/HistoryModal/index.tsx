import { SelectOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Card, Empty, message, Space, Tooltip } from "antd";

import "./index.scss"
import { Theme } from "baseui-sd/theme";

interface IHistoryModalProps {
  theme?: Theme
  historyList: any[];
  showModal: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteHistory: (historyId: number) => void;
  onLoadHistory: (historyId: number) => void;
}

function convertTimestampToString(timestamp: string) {
  const timestampNum = parseInt(timestamp);
  const date = new Date(timestampNum);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return timeString;
}

export default (props: IHistoryModalProps) => {
  return (
    <ModalForm
      title="历史会话"
      open={props.showModal}
      submitter={false}
      modalProps={{
        centered: true,
        destroyOnClose: true,
        onCancel: () => props.onOpenChange(false),
      }}
    >
      {props.historyList && props.historyList.length > 0 ? (
        <div style={{width: "100%", overflowX: "hidden"}}>
          <div className="history-list-wrap">
            {props?.historyList.map((item, index) => {
              // 13位时间戳字符串转换为时间字符串
              const timeString = convertTimestampToString(item.createdAt||"");
              return (
                <Card size="small"
                      style={{
                        marginBottom: 10,
                        color: props.theme?.colors.contentSecondary,
                        background: props.theme?.colors.backgroundSecondary,
                      }}>
                  <div className="history-card-create-time">
                    <span>{timeString}</span>
                  </div>
                  <div className="history-card" style={{display: "flex", flexDirection: "row"}}>
                    <div className="history-card-data">
                      <div className="history-card-title">
                        <span>{item.name}</span>
                      </div>
                      <div className="history-card-content">
                        <span>{item.description}</span>
                      </div>
                    </div>
                    <div className="history-card-actions">
                      <Space>
                        <Tooltip title={"加载会话"}>
                          <Button type="text" size="small" icon={<SelectOutlined />} onClick={() => props.onLoadHistory(item.id)} />
                        </Tooltip>
                        <Tooltip title={"删除会话"}>
                          <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => props.onDeleteHistory(item.id)} />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>

                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Empty />
      )}

    </ModalForm>
  );
}