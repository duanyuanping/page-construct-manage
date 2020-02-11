import React, { useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import '@ant-design/compatible/assets/index.css';
import moment from 'moment';
import { Input, Modal, DatePicker, message } from 'antd';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import React from 'react';

const FormItem = Form.Item;

interface UpdateFormProps extends FormComponentProps {
  modalVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  dispatch: Dispatch<any>;
  uid: number;
  pageDetail: any;
  loading: boolean;
  construct?: boolean;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const { modalVisible, form, onCancel, onSuccess, uid, dispatch, pageDetail, loading, construct } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      // handleAdd(fieldsValue);
      const { name, onlineTime, offlineTime } = fieldsValue;
      // console.log('test',construct)
      const params = {
        id: pageDetail.id,
        uid: pageDetail.uid,
        name: name,
        onlineTime: onlineTime && +new Date(onlineTime.toString()),
        offlineTime: offlineTime && +new Date(offlineTime.toString()),
        construct,
      };
      dispatch({
        type: 'global/fetchPageUpdate',
        payload: params,
        successCallback: () => {
          message.success('更新成功');
          onSuccess()
        },
        failCallback: (msg: string) => message.error(msg)
      })
    });
  };

  useEffect(() => {
    if (modalVisible) {
      dispatch({
        type: 'global/fetchPageDetail',
        payload: {
          uid,
        },
        successCallback: () => message.success('更新成功'),
        failCallback: (msg: string) => message.error(msg)
      })
    }
  }, [uid, modalVisible])

  return (
    <Modal
      destroyOnClose
      title="页面更新"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      confirmLoading={loading}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="页面名">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入页面名' }],
          initialValue: pageDetail.name
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上线时间">
        {form.getFieldDecorator('onlineTime', {
          rules: [{ required: false, message: '请选择上线时间' }],
          initialValue: pageDetail.onlineTime && moment(pageDetail.onlineTime)
        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="下线时间">
        {form.getFieldDecorator('offlineTime', {
          rules: [{ required: false, message: '请选择下线时间' }],
          initialValue: pageDetail.offlineTime && moment(pageDetail.offlineTime)
        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
      </FormItem>
    </Modal>
  );
};

const FormWrap = Form.create<UpdateFormProps>()(UpdateForm);

export default connect(
  ({
    global,
    loading,
  }: {
    global: any;
    loading: { models: { [key: string]: boolean } };
  }) => ({
    pageDetail: global.pageDetail,
    loading: loading.models.global,
  }),
)(FormWrap);
