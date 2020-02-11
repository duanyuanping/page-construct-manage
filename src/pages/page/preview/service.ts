import request from '@/utils/request';

export async function preview(uid: string) {
  return request('/online/api/page/preview', {
    params: { uid },
  });
}
