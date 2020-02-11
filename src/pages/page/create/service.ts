import request from '@/utils/request';

interface ComponentListParamsType {
  name?: string;
}
interface PageConstructParamsType {
  env: 'development' | 'production';
  name: string;
  components: { name: string; props: any; };
}

export async function componentList(params: ComponentListParamsType) {
  Object.entries(params).forEach(([key, val]) => {
    if (typeof val !== 'number' && !val) {
      Reflect.deleteProperty(params, key);
    }
  });
  return request('/online/api/component/list', {
    params
  });
}

export async function pageCode(params: { uid: string }) {
  return request('/online/api/page/code', {
    params,
  });
}

export async function pageConstruct(params: PageConstructParamsType) {
  return request(`/online/api/page/construct`, {
    method: 'POST',
    data: params
  });
}