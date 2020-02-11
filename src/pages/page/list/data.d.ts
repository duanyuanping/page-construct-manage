export interface TableListItem {
  id: number;
  uid: string;
  name: string;
  url: string;
  status: number;
  updateTime: string;
  createTime: string;
  onlineTime: string;
  offlineTime: string;
  content: string;
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListData {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
}

export interface TableListParams {
  sorter?: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
}
