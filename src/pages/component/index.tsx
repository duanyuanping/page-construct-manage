import { Card, Col, Form, List, Row, Select, Typography } from 'antd';
import React, { Component } from 'react';

import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import moment from 'moment';
import AvatarList from './components/AvatarList';
import { StateType } from './model';
import { ListItemDataType } from './data.d';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import styles from './style.less';

const { Option } = Select;
const FormItem = Form.Item;
const { Paragraph } = Typography;

interface ComponentProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  component: StateType;
  loading: boolean;
}

const getKey = (id: string, index: number) => `${id}-${index}`;

class ComponentList extends Component<ComponentProps> {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'component/fetch',
      payload: {
        count: 8,
      },
    });
  }

  render() {
    const {
      component: { list = [] },
      loading,
      form,
    } = this.props;
    const { getFieldDecorator } = form;

    const cardList = list && (
      <List<ListItemDataType>
        rowKey="id"
        loading={loading}
        grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
        dataSource={list}
        renderItem={item => (
          <List.Item>
            <Card
              className={styles.card}
              hoverable
              cover={<img alt={item.title} src={item.cover} />}
            >
              <Card.Meta
                title={<a>{item.title}</a>}
                description={
                  <Paragraph className={styles.item} ellipsis={{ rows: 2 }}>
                    {item.subDescription}
                  </Paragraph>
                }
              />
              <div className={styles.cardItemContent}>
                <span>{moment(item.updatedAt).fromNow()}</span>
                <div className={styles.avatarList}>
                  <AvatarList size="small">
                    {item.members.map((member, i) => (
                      <AvatarList.Item
                        key={getKey(item.id, i)}
                        src={member.avatar}
                        tips={member.name}
                      />
                    ))}
                  </AvatarList>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );

    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div className={styles.coverCardList}>
        <Card bordered={false}>
          <Form layout="inline">
            <StandardFormRow title="所属类目" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('category')(
                  <TagSelect>
                    <TagSelect.Option value="cat1">内容类</TagSelect.Option>
                    <TagSelect.Option value="cat2">布局类</TagSelect.Option>
                  </TagSelect>,
                )}
              </FormItem>
            </StandardFormRow>
            {/* <StandardFormRow title="其它选项" grid last>
              <Row gutter={16}>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <FormItem {...formItemLayout} label="作者">
                    {getFieldDecorator(
                      'author',
                      {},
                    )(
                      <Select placeholder="不限" style={{ maxWidth: 200, width: '100%' }}>
                        <Option value="lisa">王昭君</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <FormItem {...formItemLayout} label="好评度">
                    {getFieldDecorator(
                      'rate',
                      {},
                    )(
                      <Select placeholder="不限" style={{ maxWidth: 200, width: '100%' }}>
                        <Option value="good">优秀</Option>
                        <Option value="normal">普通</Option>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
              </Row>
            </StandardFormRow> */}
          </Form>
        </Card>
        <div className={styles.cardList}>{cardList}</div>
      </div>
    );
  }
}

const WarpForm = Form.create<ComponentProps>({
  onValuesChange({ dispatch }: ComponentProps) {
    // 表单项变化时请求数据
    // 模拟查询表单生效
    dispatch({
      type: 'component/fetch',
      payload: {
        count: 8,
      },
    });
  },
})(ComponentList);

export default connect(
  ({
    component,
    loading,
  }: {
    component: StateType;
    loading: { models: { [key: string]: boolean } };
  }) => ({
    component,
    loading: loading.models.component,
  }),
)(WarpForm);
