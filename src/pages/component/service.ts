import request from '@/utils/request';

export async function queryFakeList(params: { count: number }) {
  return request('/online/api/component/list', {
    params,
  });
}

export async function editor(params: any) {
  return request('/online/api/component/editor', {
    method: 'post',
    data: params
  })
}
