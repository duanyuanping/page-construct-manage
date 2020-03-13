import { Card, Form, List, Icon, Typography, Button, Popconfirm, message } from 'antd';
import React, { Component } from 'react';

import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
// import moment from 'moment';
// import AvatarList from './components/AvatarList';
import CreateFrom from './components/CreateForm';
import { StateType } from './model';
import { ListItemDataType } from './data.d';
import styles from './style.less';

const { Paragraph } = Typography;

interface ComponentProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  component: StateType;
  loading: boolean;
}

interface StateTypes {
  showCreate: boolean;
}
// const getKey = (id: string, index: number) => `${id}-${index}`;

class ComponentList extends Component<ComponentProps, StateTypes> {
  state = {
    showCreate: false
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'component/fetch',
      payload: {
        count: 8,
      },
    });
  }

  handleSubmit = (val: any, cb: () => void) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'component/editor',
      payload: val,
      successCb: () => {
        message.success('组件添加成功');
        cb();
        this.setState({
          showCreate: false
        })

        dispatch({
          type: 'component/fetch',
          payload: {
            count: 8,
          },
        });
      },
      failCb: (msg: string) => message.error(msg)
    })
  }

  render() {
    const {
      component: { list = [] },
      loading,
    } = this.props;
    const {
      showCreate
    } = this.state;

    return (
      <div className={styles.coverCardList}>
        <div className={styles.buttonWrapper}>
          <Button
            type="primary"
            onClick={() => this.setState({
              showCreate: true
            })}
          >新建</Button>
        </div>
        <div className={styles.cardList}>
          {
            list && (
              <List<ListItemDataType>
                rowKey="id"
                loading={loading}
                grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
                dataSource={list}
                renderItem={item => (
                  <List.Item>
                    <div className={styles.itemWrapper}>
                      <Card
                        className={styles.card}
                        hoverable
                        cover={<img alt={item.nameCh} src={item.image} />}
                      >
                        <Card.Meta
                          title={<a>{item.nameCh}({item.nameEn})</a>}
                          description={
                            <Paragraph className={styles.item} ellipsis={{ rows: 2 }}>
                              {item.description}
                            </Paragraph>
                          }
                        />
                        {/* <div className={styles.cardItemContent}> */}
                          {/* <span>{moment(item.updatedAt).fromNow()}</span> */}
                          {/* <div className={styles.avatarList}>
                            <AvatarList size="small">
                              {item.members.map((member, i) => (
                                <AvatarList.Item
                                  key={getKey(item.id, i)}
                                  src={member.avatar}
                                  tips={member.name}
                                />
                              ))}
                            </AvatarList>
                          </div> */}
                        {/* </div> */}
                      </Card>
                      <div className={styles.itemMongolia}>
                        <Icon
                          type="eye"
                          onClick={() => window.open(`https://www.npmjs.com/package/${item.nameEn}`)}
                        />
                        {/* <Popconfirm
                          title="确认删除吗？"
                          onConfirm={() => message.info('功能维护中！！')}
                          onCancel={() => {}}
                          okText="是"
                          cancelText="否"
                        > */}
                          <Icon type="delete" onClick={() => message.info('功能维护中！！')} />
                        {/* </Popconfirm> */}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )
          }
        </div>
        <CreateFrom
          modalVisible={showCreate}
          onSubmit={this.handleSubmit}
          onCancel={() => this.setState({ showCreate: false })}
        />
      </div>
    );
  }
}

const WarpForm = Form.create<ComponentProps>()(ComponentList);

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
