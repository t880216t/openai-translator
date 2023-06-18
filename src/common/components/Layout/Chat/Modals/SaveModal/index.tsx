import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { Theme } from "baseui-sd/theme";


interface ISaveModalProps {
  theme?: Theme
  showModal: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveHistory: (name: string, description: string) => void;
}

export default (props: ISaveModalProps) => {
  const [form] = Form.useForm<{ name: string; description: string }>();
  return (
    <ModalForm<{
      name: string;
      description: string;
    }>
      title="保存会话"
      open={props.showModal}
      form={form}
      autoFocusFirstInput
      modalProps={{
        closable: false,
        centered: true,
        destroyOnClose: true,
        onCancel: () => props.onOpenChange(false),
      }}
      onFinish={async (values) => {
        props.onSaveHistory(values.name, values.description || "");
        return true;
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="md"
          name="name"
          label="记录名称"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
        />

        <ProFormText
          width="md"
          name="description"
          label="描述信息"
          placeholder="请输入描述信息"
        />
      </ProForm.Group>
    </ModalForm>
  );
};