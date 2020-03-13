import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Modal, Row, Col, Select } from 'antd';
import AceEditor from 'react-ace';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import React, { useState } from 'react';

import styles from './index.less';

const FormItem = Form.Item;
const Option = Select.Option;

const propTypes = [
  'string',
  'number',
  'array'
];
const childPropTypes = [
  'string',
  'number'
];
const childTypes = [
  'string',
  'number',
  'map'
];
const createParamsName = ['nameCh', 'nameEn', 'image', 'description']; // props、defaultProps 属性需要特殊处理

interface ComPropsItemTypes {
  key: string;
  desc: string;
  type: string;
  childType: string;
}

interface ComPropsTypes extends ComPropsItemTypes {
  child: ComPropsTypes[] | string;
}

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  onSubmit: (val: any, cb: () => void) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, form, onSubmit: handleAdd, onCancel } = props;
  const [comProps, setComProps] = useState([]);

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = {
        props: comProps.map((item: ComPropsTypes) => ({
          key: item.key,
          type: item.type,
          child: item.child,
          desc: item.desc
        })),
        defaultProps: JSON.parse(fieldsValue.defaultProps)
      };
      createParamsName.forEach(key => params[key] = fieldsValue[key]);
      handleAdd(params, () => form.resetFields());
    });
  };

  const handlePropChange = () => {
    const val = form.getFieldsValue();

    const newProps: ComPropsTypes[] = comProps.map((prop: ComPropsTypes, index) => ({
      key: val[`prop-${index}-key`],
      type: val[`prop-${index}-type`],
      desc: val[`prop-${index}-desc`],
      childType: val[`prop-${index}-childType`],
      child: val[`prop-${index}-childType`] === 'map' 
        ? (
          prop.child && prop.child instanceof Array
            ? prop.child.map((_, idx) => ({
              key: val[`prop-${index}-child-${idx}-key`],
              desc: val[`prop-${index}-child-${idx}-desc`],
              type: val[`prop-${index}-child-${idx}-type`],
            }))
            : [{}]
        ) : val[`prop-${index}-childType`]
    }));


    setComProps(newProps);
  }

  const handleSelectChange = (val: string, name: string) => {
    form.setFieldsValue({ [name]: val });
    handlePropChange()
  }

  const handleValidatorJson = (_: any, value: string, cb: (message?: any) => void) => {
    try {
      JSON.parse(value);
    } catch (err) {
      cb('请输入正确的JSON数据');
    }

    cb();
  }

  const renderProps = (prop: ComPropsTypes, index: number, name: string, types: string[]) => {
    return (
      <div className={styles.propsStyle}>
        <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="属性名">
          {form.getFieldDecorator(`${name}-${index}-key`, {
            initialValue: prop.key,
            rules: [{ required: true, message: '请输入属性名' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="属性介绍">
          {form.getFieldDecorator(`${name}-${index}-desc`, {
            initialValue: prop.desc,
            rules: [{ required: true, message: '请输入属性介绍' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="属性类型">
          {form.getFieldDecorator(`${name}-${index}-type`, {
            initialValue: prop.type,
            rules: [{ required: true, message: '请选择属性类型' }],
          })(<Select
            onChange={(val: string) => handleSelectChange(val, `${name}-${index}-type`)}
            placeholder="请选择"
          >
            {
              types.map(type => <Option value={type}>{type}</Option>)
            }
          </Select>)}
          {
            prop.type === 'array' && (
              <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="子属性类型">
                {form.getFieldDecorator(`${name}-${index}-childType`, {
                  initialValue: prop.childType,
                  rules: [{ required: true, message: '请选择子属性类型' }],
                })(<Select
                  onChange={(val: string) => handleSelectChange(val, `${name}-${index}-childType`)}
                  placeholder="请选择"
                >
                  {
                    childTypes.map(type => <Option value={type}>{type}</Option>)
                  }
                </Select>)}
              </FormItem>
            )
          }
          {
            prop.type === 'array' && prop.childType === 'map' && (
              <div className={styles.childPropsStyle}>
                {
                  prop.child && prop.child instanceof Array && prop.child.map((item, idx) => (
                    renderProps(item, idx, `${name}-${index}-child`, childPropTypes)
                  ))
                }
                <div onClick={() => {
                  const newComProps = JSON.parse(JSON.stringify(comProps));
                  if (newComProps[index].child instanceof Array) {
                    newComProps[index].child = [...newComProps[index].child, {}];
                  } else {
                    newComProps[index].child = [{}];
                  }
                  setComProps(newComProps);
                }}>新增一条子属性</div>
              </div>
            )
          }
        </FormItem>
      </div>
    );
  }

  return (
    <Modal
      destroyOnClose
      title="新建组件"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={600}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="组件名">
        {form.getFieldDecorator('nameCh', {
          rules: [{ required: true, message: '请输入组件名' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="npm包名">
        {form.getFieldDecorator('nameEn', {
          rules: [{ required: true, message: '请输入npm包名' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="效果图地址">
        {form.getFieldDecorator('image', {
          rules: [{ required: true, message: '请输入效果图地址' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('description', {
          rules: [{ required: false, message: '请输入描述' }],
        })(<Input.TextArea placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="属性值">
        <Form onChange={handlePropChange}>
        {
          comProps.map((prop, index) => renderProps(prop, index, `prop`, propTypes))
        }
        </Form>
        <div onClick={() => setComProps([...comProps, {}])}>新增一条属性</div>
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="默认值">
        {form.getFieldDecorator('defaultProps', {
          initialValue: JSON.stringify({}),
          rules: [
            { required: false, message: '请输入组件调用默认值' },
            { validator: handleValidatorJson }
          ],
        })(<AceEditor
          mode="json"
          theme="github"
          name="ace-editor"
          editorProps={{ $blockScrolling: true }}
          enableBasicAutocompletion
          enableLiveAutocompletion
          enableSnippets
          width='100%'
          maxLines={20}
          minLines={3}
        />)}
        <div>{`例：{ "name": "hello", "age": 1 }`}</div>
      </FormItem>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);
