import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Divider, Dropdown, Menu, message, Popconfirm } from 'antd';
import React, { useState, useRef } from 'react';
import { Link } from 'dva/router';
import { FormComponentProps } from '@ant-design/compatible/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import moment from 'moment';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import { TableListItem } from './data.d';
import { queryRule, updateRule, addRule, removeRule } from './service';

import './index.less';

interface TableListProps extends FormComponentProps {}

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: FormValueType) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({
      name: fields.name
    });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 * @desc 列表数据
 */
const requestListData = async (params: any) => {
  const { data: { data, total, current, pageSize }} = await queryRule(params);

  return Promise.resolve({
    data: data,
    total,
    current,
    pageSize
  });
}

const TableList: React.FC<TableListProps> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [updateUid, handelUpdateUid] = useState<number>(0);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '页面名',
      dataIndex: 'name',
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   valueEnum: {
    //     0: { text: '开发中', status: 'Default' },
    //     1: { text: '已上线', status: 'Processing' },
    //     2: { text: '已下线', status: 'Error' },
    //   },
    // },
    {
      title: '页面线上地址',
      dataIndex: 'url',
    },
    {
      title: '上线时间',
      dataIndex: 'onlineTime',
      render: (val: string) => val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '暂未设置',
    },
    {
      title: '下线时间',
      dataIndex: 'offlineTime',
      render: (val: string) => val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '暂未设置',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
              handelUpdateUid(record.uid)
            }}
          >
            配置
          </a>
          <Divider type="vertical" />
          <Link to={`/page/create?uid=${record.uid}`}>搭建</Link>
          <Divider type="vertical" />
          <Popconfirm
            title="确认删除该页面？"
            onConfirm={() => handleRemove(record.id)}
            onCancel={() => {}}
            okText="是"
            cancelText="否"
          >
            <a href="#" style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </>
      ),
    },
  ];

  /**
   * @desc 删除
   */
  const handleRemove = async (id: number) => {
    const result =  await removeRule(id);

    if (result.code === 0) {
      message.success('删除成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } else {
      message.error(result.msg);
    }
  }

  return (
    <div className="page-manage-list-wrapper">
      <PageHeaderWrapper>
        <ProTable<TableListItem>
          headerTitle="查询表格"
          actionRef={actionRef}
          rowKey="key"
          toolBarRender={(action, { selectedRows }) => [
            <Button icon={<PlusOutlined />} type="primary" onClick={() => handleModalVisible(true)}>
              新建
            </Button>
          ]}
          request={requestListData}
          columns={columns}
          rowSelection={false}
        />
        <CreateForm
          onSubmit={async value => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => handleModalVisible(false)}
          modalVisible={createModalVisible}
        />
        {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSuccess={() => {
            setStepFormValues({});
            handleUpdateModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          modalVisible={updateModalVisible}
          uid={updateUid}
        />
      ) : null}
      </PageHeaderWrapper>
    </div>
  );
};

export default Form.create<TableListProps>()(TableList);
