import request from '@/utils/request';

export async function pageDetail(uid: string) {
  return request('/online/api/page/detail', {
    params: { uid }
  });
}

export async function pageUpdate(params: any) {
  return request('/online/api/page/update', {
    method: 'POST',
    data: params,
  });
}

export async function online(params: any) {
  return request('/online/api/page/online', {
    params,
  });
}