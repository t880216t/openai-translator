// @ts-nocheck
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormRadio,
  ProFormUploadButton,
  ProFormDependency,
} from '@ant-design/pro-components';
import { ConfigProvider, Form, message } from 'antd';
import { useTheme } from "../../../../../hooks/useTheme";


interface ICreateModalProps {
  submitLoading: boolean;
  showModal: boolean;
  onCreateKnowledge: (params: any) => void;
  onOpenChange: (showModal: boolean) => void;
}

export interface IFormProps {
  name: string;
  description: string;
  knowledgeType: string;
  dataType: string;
  link?: string;
  file?: ArrayBuffer;
}

export default (props: ICreateModalProps) => {
  const [form] = Form.useForm<IFormProps>();
  const { theme, themeType } = useTheme()
  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: themeType == "dark"? theme?.colors.contentInverseSecondary : theme?.colors.contentSecondary,
          colorPrimary: themeType == "dark"? theme?.colors.contentInversePrimary : theme?.colors.contentPrimary,
          colorBgBase: themeType == "dark"? theme?.colors.backgroundInverseSecondary : theme?.colors.backgroundSecondary,
        },
      }}
    >
      <ModalForm<IFormProps>
        title="保存会话"
        open={props.showModal}
        form={form}
        autoFocusFirstInput
        initialValues={{
          knowledgeType: '1',
          dataType: 'file',
        }}
        modalProps={{
          closable: false,
          centered: true,
          destroyOnClose: true,
          onCancel: () => props.onOpenChange(false),
        }}
        loading={props.submitLoading}
        onFinish={async (values) => {
          // 当dataType字段为file时，获取文件对象
          let new_values = {...values}
          if (values?.dataType == 'file'){
            new_values.file = values?.file?.[0].originFileObj
          }
          props.onCreateKnowledge(new_values);
          return true;
        }}
      >
        <ProFormRadio.Group
          style={{
            margin: 16,
          }}
          name="knowledgeType"
          label="知识库类型"
          options={[{label: '私有知识库', value: '1'}, {label: '公共知识库', value: '2'}]}
        />
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
        <ProFormRadio.Group
          style={{
            margin: 16,
          }}
          name="dataType"
          label="知识库类型"
          options={[{label: '本地文件', value: 'file'}, {label: '网络链接', value: 'link'}]}
        />
        <ProFormDependency name={['dataType']}>
          {({ dataType }) => {
            if (dataType == 'link' ){
              return (
                <ProFormText
                  width="md"
                  name="link"
                  label="数据地址"
                  placeholder="请输入网址: https://xxx.xx.xx"
                />
              );
            }
            return (
              <ProFormUploadButton
                extra="支持扩展名：.docx .pdf"
                label="数据文件"
                name="file"
                title="上传文件"
                max={1}
              />
            );
          }}
        </ProFormDependency>
      </ModalForm>
    </ConfigProvider>
  );
};