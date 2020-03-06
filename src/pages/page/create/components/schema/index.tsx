import React, { useState, useEffect } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Form, Button, Popconfirm, Input, InputNumber } from 'antd';
import { StateType } from '../../model';
import { PropType } from '../../data.d';

import styles from './index.less';

interface PropsType extends FormComponentProps {
  pageCreate: StateType;
  parentForm: any;
  showPreservation: boolean;
  isShowSchema: boolean;
  handleSaveClick: () => void;
  handleFormChange: () => void;
  defaultValue: {
    props: any;
    key: string;
  };
  handleDeleteComponent: () => void;
}

const schema = (props: PropsType) => {
  const {
    showPreservation, isShowSchema, handleSaveClick,
    handleFormChange, defaultValue, handleDeleteComponent,
    parentForm, // 父组件内部的form
    form, // 本组件内部的form
    pageCreate: {
      schemaRule,
      constructLoading
    }
  } = props;

  const [listLength, setListLength] = useState({}); // schema中属性类型为数组，该属性子元素的个数

  useEffect(() => {
    Object.entries(defaultValue.props).forEach(([key, val]) => {
      if (val instanceof Array && listLength[key] !== val.length) {
        setListLength({ ...listLength, [key]: val.length });
      }
    });
  }, [])

  const schemaStyle = !isShowSchema && document.body.clientWidth < 1270 ? {
    position: 'absolute',
    right: '-530px'
  } : {};

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  };

  const currentGetFieldDecorator = form.getFieldDecorator;

  // 数据类型为array的属性变化的时候才会触发
  const handleArrFormChange = (key: string, child: any, length: number) => {
    // console.log('test000000000', form.getFieldsValue())
    const formVal = form.getFieldsValue();
    let arrayVal: any[] = [];

    // 数组类型属性值读取，数组子元素类型可以是string和map
    if (child instanceof Array) {
      
      Array(length).fill('').forEach((_, index) => {
        const childVal = {};

        child.forEach(({ key: childKey }) => {
          const formItemKey = `${key}-${index}-${childKey}`;
          childVal[childKey] = formVal[formItemKey];
        });

        arrayVal.push(childVal);
      });
    } else {
      arrayVal = Object.values(formVal);
    }

    parentForm.setFieldsValue({ [key]: arrayVal });
    handleFormChange();
  }

  const renderSchemaFormItem = (params: PropType, value: any, showLabel: boolean, getFieldDecorator: any): any => {
    const { key, type, desc, child } = params;
    let init = value;
    
    if (type === 'array') {
      if (!(init instanceof Array)) init = [];
      init = JSON.parse(JSON.stringify(init));
      const currentKeyLen = listLength[key] || 0;
      if (currentKeyLen > init.length) {
        for (let i = init.length; i < currentKeyLen; i++) init.push('');
      }
    }

    const map = {
      array: (
        <Form.Item label={showLabel && `${desc}(${type})`}>
          <Form
            onChange={e => {
              e.stopPropagation();
              handleArrFormChange(key, child || 'string', (init && init.length) || 0);
            }}
          >
            {
              !child || typeof child === 'string'
              ? (
                init && init.map && init.map((val: any, index: number) => (
                  <div className={styles.schemaListItemStyle}>
                    {
                      renderSchemaFormItem(
                        {
                          key: `${key}-${index}`,
                          type: child || 'string',
                          desc: '',
                          child: undefined
                        },
                        val,
                        false,
                        currentGetFieldDecorator
                      )
                    }
                  </div>
                ))
              )
              : (
                init && init.map && init.map((val: any, index: number) => (
                  <div className={styles.schemaListItemStyle}>
                    {
                      child.map((rule: any) => (
                        renderSchemaFormItem(
                          {
                            key: `${key}-${index}-${rule.key}`,
                            type: rule.type || 'string',
                            desc: rule.desc,
                            child: undefined
                          },
                          val[rule.key],
                          true,
                          currentGetFieldDecorator
                        )
                      ))
                    }
                  </div>
                ))
              )
            }
            <div
              className={styles.addStyle}
              onClick={() => {
                setListLength({
                  ...listLength,
                  [key]: (listLength[key] || 0) + 1
                })
              }}
            >点击新增</div>
          </Form>
        </Form.Item>
      ),
      string: (
        <Form.Item label={showLabel && `${desc}(${type})`}>
          {getFieldDecorator(key, {
            rules: [ {required: false} ],
            initialValue: init
          })(<Input
            placeholder="请输入"
          />)}
        </Form.Item>
      ),
      number: (
        <Form.Item label={showLabel && `${desc}(${type})`}>
          {getFieldDecorator(key, {
            rules: [ {required: false} ],
            initialValue: init
          })(<InputNumber
            placeholder="请输入"
          />)}
        </Form.Item>
      )
    }

    return map[type];
  }

  return (
    <div
      className={styles.schema}
      style={{
        // backgroundImage: isShowSchema ? '' : `url(${freeIcon})`
        ...schemaStyle
      }}
    >
      <div
        className={styles.preservation}
        style={{
          height: showPreservation ? 25 : 0
        }}
      >
        <span>页面有内容更新，请点击保存。</span>
        <Button
          type="primary"
          onClick={handleSaveClick}
          loading={constructLoading}
          size="small"
        >
          保存
        </Button>
      </div>
      { !isShowSchema && <div className={styles.schemaPlaceholder}>点击预览板块中的组件，本区域将展示对应组件的schema。</div>}
      <div style={{ display: isShowSchema ? 'block' : 'none' }}>
        <div className={styles.schemaComponentName}>
          {schemaRule.nameCh}
        </div>
        <Form
          {...formItemLayout}
          className={styles.schemaForm}
          onChange={handleFormChange}
        >
          {
            schemaRule.props.map(item => (
              renderSchemaFormItem(
                item,
                defaultValue.props && defaultValue.props[item.key],
                true,
                parentForm.getFieldDecorator
              )
            ))
          }
          <div className={styles.formBottom}>
            <Popconfirm
              title="确认删除吗？"
              onConfirm={handleDeleteComponent}
              onCancel={() => {}}
              okText="是"
              cancelText="否"
            >
              <Button
                type="danger"
                loading={constructLoading}
              >
                删除组件
              </Button>
            </Popconfirm>
          </div>
        </Form>
      </div>
    </div>
  );
}

const WarpForm = Form.create()(schema);

export default connect(
  ({
    pageCreate,
    loading,
  }: {
    pageCreate: StateType;
    loading: { models: { [key: string]: boolean } };
  }) => ({
    pageCreate,
    loading: loading.models.pageCreate,
  }),
)(WarpForm);