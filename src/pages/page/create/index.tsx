import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { Component } from 'react';
import { connect, Dispatch } from 'dva';
import { Form, Input, InputNumber, message, Button } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { routerRedux } from 'dva/router';
import { throttle } from '@/utils/utils';
import Phone from '@/components/Phone';
import UpdatePage from '../list/components/UpdateForm';
import Schema from './components/schema';
import { StateType } from './model';
import { PropType } from './data.d';
import styles from './index.less';
// import freeIcon from '@/assets/free.gif';

interface ComponentProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  pageCreate: StateType;
  loading: boolean;
  location: {
    query: any;
  };
}

interface ComponentState {
  schemaDefaultVal: {
    props: any;
    key: string;
  };
  addComponentName: string;
  isShowSchema: boolean;
  updateModalVisible: boolean;
  showPreservation: boolean;
}

interface FetchComponentType {
  name: string;
  props: any;
  key: string;
}

class PageCreate extends Component<ComponentProps, ComponentState> {
  iframeRef: any = React.createRef()
  isDeleteComponent = false

  state = {
    schemaDefaultVal: {
      props: {},
      key: '',
    },
    addComponentName: '',
    isShowSchema: false,
    updateModalVisible: false,
    showPreservation: false,
  }

  componentDidMount() {
    window.removeEventListener('message', this.handleMessage);

    const { dispatch, location } = this.props;
    dispatch({
      type: 'pageCreate/fetchComponentList'
    });
    dispatch({
      type: 'pageCreate/fetchPageCode',
      payload: {
        uid: location.query.uid
      }
    });

    window.addEventListener('message', this.handleMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
  }

  handleDragStart = (e: any, src: string, name: string): void => {
    e.target.style.opacity = .5;
    this.iframeRef.current.contentWindow.postMessage(`previewImage:::${src}`);
    this.setState({
      addComponentName: name
    });
  }

  handleDragEnd = (e: any): void => {
    e.target.style.opacity = "";
  }

  handleShowSchema = (data: string): void => {
    const { dispatch } = this.props;
    const [name, key, props] = data.split(';;;');

    dispatch({
      type: 'pageCreate/fetchComponentDetail',
      payload: {
        name: name,
      }
    });

    this.setState({
      schemaDefaultVal: {
        props: JSON.parse(props),
        key,
      },
      isShowSchema: true
    })
  }

  initSchema = () => {
    this.setState({
      schemaDefaultVal: {
        props: {},
        key: '',
      },
      isShowSchema: false
    })
  }

  handlePageConstruct = (data: string) => {
    const { dispatch, location } = this.props;
    const { addComponentName } = this.state;
    const [prevComponents, index]= data.split(';;;');
    const componentsConfig = JSON.parse(prevComponents);
    const newComponentConfig = {
      name: addComponentName,
      props: {}
    };
    componentsConfig.splice(index, 0, newComponentConfig);

    if (!addComponentName) return;

    this.initSchema();

    dispatch({
      type: 'pageCreate/fetchPageConstruct',
      payload: {
        env: 'development',
        uid: location.query.uid,
        components: componentsConfig
      },
      sucessCallBack: () => {
        message.success('构建成功');
        this.setState({
          showPreservation: false
        });
      },
      failCallBack: (msg: string) => message.error(msg)
    });
  }

  handleMessage = (e: any): void => {
    if (typeof e.data !== 'string') return;
    const { form } = this.props;
    const [type, data] = e.data.split(':::');

    switch (type) {
      case 'enter':
        break;
      case 'leave':
        break;
      case 'componentClick':
        form.resetFields();
        this.handleShowSchema(data);
        break;
      case 'pageConstruct':
        this.handlePageConstruct(data);
        break;
      case 'pageComponentConfigUpdate':
        this.handleUpdatePageConfig(data);
        break;
      default:
        break;
    }
  }

  handleFormChange = throttle(() => {
    console.log('test000000')
    const { form : { validateFields }, pageCreate: { schemaRule } } = this.props;
    const { schemaDefaultVal } = this.state;

    validateFields((err, values) => {
      if (err) return;
      console.log('test',values)
      schemaRule.props.forEach(({ key, type }) => {
        if (type === 'array' && typeof values[key] === 'string') {
          values[key] = values[key].split('\n');
        }
      });
      this.iframeRef.current.contentWindow.postMessage(`componentPropsUpdata:::${(schemaDefaultVal as { key: string }).key};;;${JSON.stringify(values)}`)

      this.setState({
        showPreservation: true
      })
    });
  }, 200)

  handleSaveClick = () => {
    this.iframeRef.current.contentWindow.postMessage('sendComponents');
  }

  handleDeleteComponent = () => {
    this.iframeRef.current.contentWindow.postMessage('sendComponents');
    this.isDeleteComponent = true;
  }

  handleUpdatePageConfig = (data: string) => {
    const { location, dispatch } = this.props;
    const { schemaDefaultVal } = this.state;
    let components: FetchComponentType[] = JSON.parse(data);

    if (this.isDeleteComponent) {
      components = components.filter(item => item.key.toString() !== schemaDefaultVal.key);
      this.isDeleteComponent = false;
    }

    this.initSchema();

    dispatch({
      type: 'pageCreate/fetchPageConstruct',
      payload: {
        env: 'development',
        uid: location.query.uid,
        components
      },
      sucessCallBack: () => {
        message.success('构建成功');

        this.setState({
          showPreservation: false
        })
      },
      failCallBack: (msg: string) => message.error(msg)
    });
  }

  render() {
    const {
      pageCreate: {
        componentList = [],
        pageHtml = '',
        constructLoading
      },
      location,
      dispatch
    } = this.props;
    const { isShowSchema, updateModalVisible, showPreservation, schemaDefaultVal } = this.state;

    return (
      <div>
        <PageHeaderWrapper
          title="页面搭建"
          extraContent={
            <div className={styles.pageHeaderButton}>
              <Button
                type="primary"
                onClick={() => window.open(`/page/preview?uid=${location.query.uid}`)}
                loading={constructLoading}
              >预览</Button>
              <Button
                loading={constructLoading}
                type="primary"
                onClick={() => this.setState({ updateModalVisible: true })}
              >上线</Button>
            </div>
          }
        />

        {/** 组件列表板块 */}
        <div className={styles.content}>
          <div className={styles.components}>
            {
              componentList.map(item => (
                <div className={styles.componentList}>
                  <div className={styles.componentInfo}>
                    {item.nameCh}
                  </div>
                  <img
                    draggable={true}
                    src={item.image}
                    onDragStart={e => this.handleDragStart(e, item.image, item.nameEn)}
                    onDragEnd={this.handleDragEnd}
                  />
                </div>
              ))
            }
          </div>

          {/** 页面预览板块 */}
          <Phone
            loading={constructLoading}
            iframeRef={this.iframeRef}
            // content="/page/test"
            content={pageHtml}
            // showBorder={true}
          />

          {/** schema 板块 */}
          <Schema
            key={schemaDefaultVal.key}
            parentForm={this.props.form}
            showPreservation={showPreservation}
            isShowSchema={isShowSchema}
            defaultValue={schemaDefaultVal}
            handleSaveClick={this.handleSaveClick}
            handleFormChange={this.handleFormChange}
            handleDeleteComponent={this.handleDeleteComponent}
          />
        </div>
        <UpdatePage
          onSuccess={() => {
            this.setState({ updateModalVisible: false });
            message.success('页面上线成功');
            dispatch(routerRedux.push('/page/list'));
          }}
          onCancel={() => {
            this.setState({ updateModalVisible: false });
          }}
          modalVisible={updateModalVisible}
          uid={location.query.uid}
          construct={true}
        />
      </div>
    );
  }
}

const WarpForm = Form.create<ComponentProps>({
  onValuesChange({ dispatch }: ComponentProps, _, allValues) {},
})(PageCreate);

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