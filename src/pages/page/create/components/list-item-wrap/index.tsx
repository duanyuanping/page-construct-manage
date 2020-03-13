import React from 'react';
import { Popconfirm } from 'antd';

import styles from './index.less';

interface PropsType {
  children: any;
  onDelete: () => void;
}

export default (props: PropsType) => {
  const { children, onDelete = () => {} } = props;

  return (
    <div className={styles.schemaListItemStyle}>
      {children}
      <Popconfirm
        title="确认删除吗？"
        onConfirm={onDelete}
        onCancel={() => {}}
        okText="是"
        cancelText="否"
      >
        <span
          className={styles.deleteStyle}
        >删除列表</span>
      </Popconfirm>
    </div>
  );
}