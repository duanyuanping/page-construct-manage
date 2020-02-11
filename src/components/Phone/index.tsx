import React from 'react';
import { Icon } from 'antd';

import styles from './index.less';

interface PropsType {
  content: string;
  iframeRef?: any;
  loading: boolean;
  showBorder?: boolean;
}

export default (props: PropsType) => {
  const { content, iframeRef, loading = false, showBorder = false } = props;
  const config: { ref?: any; src?: string; srcDoc?: string; } = {}
  if (!~content.indexOf('<!doctype html>')) {
    config.src = content;
  } else {
    config.srcDoc = content;
  }
  if (iframeRef) {
    config.ref = iframeRef;
  }
  return (
    <div className={`${styles.phoneWrapper} ${showBorder ? styles.showBorder : ''}`}>
      <div className={styles.phoneContentBorderOutSide}>
        <div className={styles.phoneContentBorderInner}>
          { showBorder && <div className={styles.phoneContentTitle}>未命名</div> }
          <div className={styles.phoneContentMain}>
            <iframe {...config} />
            {
              loading && (
                <div className={styles.loadingStyle}>
                  <Icon
                    type="loading"
                    style={{
                      color: '#1890ff',
                      fontSize: 40
                    }}
                  />
                  <div className={styles.loadingFont}>loading</div>
                </div>
              )
            }
          </div>
        </div>
        <div className={styles.phoneContentCircle}></div>
      </div>
    </div>
  );
}