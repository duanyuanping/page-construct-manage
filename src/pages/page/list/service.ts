import request from '@/utils/request';
import { TableListParams } from './data.d';

export async function queryRule(params?: TableListParams) {
  return request('/online/api/page/list', {
    params,
  });
}

export async function removeRule(id: number) {
  return request('/online/api/page/delete', {
    params: {
      id
    }
  });
}

export async function addRule(params: TableListParams) {
  return request('/online/api/page/create', {
    params
  });
}

export async function updateRule(params: TableListParams) {
  return request('/api/rule', {
    method: 'POST',
    data: {
      ...params,
      method: 'update',
    },
  });
}
