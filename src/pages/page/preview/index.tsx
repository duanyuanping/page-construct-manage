import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import { connect } from 'dva' ;
import { Dispatch } from 'redux';
import { StateType } from './model';
import Phone from '@/components/Phone';
import QRCode from 'qrcode';
import './index.less';

interface PropsType {
  url: string;
  dispatch: Dispatch<any>,
  location: {
    query: any;
  };
  loading: boolean;
}

const Preview = (props: PropsType) => {
  const canvasRef = useRef();
  const { loading, dispatch, location, url } = props;
  useEffect(() => {
    const uid = location.query.uid;

    dispatch({
      type: 'pagePreview/fetchPreview',
      payload: {
        uid,
      },
    });
  }, []);

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, url, () => {});
  }, [url]);

  return (
    <PageHeaderWrapper title="页面预览">
      <Card>
        <div className='preview-wrapper'>
          <Phone
            loading={loading}
            content={loading ? '' : url}
            showBorder={true}
          />
          <div
            className='preview-qrcode'
            style={{
              opacity: loading ? '0' : '1'
            }}
          >
            <canvas ref={canvasRef}/>
            <div className="preview-src">{url}</div>
          </div>
        </div>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(
  ({
    pagePreview,
    loading,
  }: {
    pagePreview: StateType;
    loading: { models: { [key: string]: boolean } };
  }) => ({
    url: pagePreview.url,
    loading: loading.models.pagePreview,
  }),
)(Preview);
