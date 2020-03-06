import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { ListItemDataType, ResponseType } from './data.d';
import { componentList, pageCode, pageConstruct, componentDetail } from './service';

export interface StateType {
  componentList: ListItemDataType[];
  pageHtml: string;
  schemaRule: Partial<ListItemDataType>;
  constructLoading: boolean;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchComponentList: Effect;
    fetchPageCode: Effect;
    fetchComponentDetail: Effect;
    fetchPageConstruct: Effect;
  };
  reducers: {
    setData: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'pageCreate',

  state: {
    componentList: [],
    pageHtml: '',
    schemaRule: {
      props: []
    },
    constructLoading: false
  },

  effects: {
    *fetchComponentList({ payload = {} }, { call, put }) {
      const { name } = payload;
      const response: ResponseType = yield call(componentList, { name });
      if (response.code === 0) {
        yield put({
          type: 'setData',
          payload: {
            componentList: response.data
          },
        });
      }
    },
    *fetchPageCode({ payload }, { call, put }) {
      yield put({
        type: 'setData',
        payload: {
          constructLoading: true
        },
      });

      const response: ResponseType = yield call(pageCode, payload);
      if (response.code === 0) {
        yield put({
          type: 'setData',
          payload: {
            pageHtml: response.data
          },
        });
      }

      yield put({
        type: 'setData',
        payload: {
          constructLoading: false
        },
      });
    },
    *fetchComponentDetail({ payload }, { call, put }) {
      const { name } = payload;
      const response: ResponseType = yield call(componentDetail, name);

      if (response.code === 0) {
        yield put({
          type: 'setData',
          payload: {
            schemaRule: response.data
          },
        });
      }
    },
    *fetchPageConstruct({ payload, sucessCallBack, failCallBack }, { call, put }) {
      yield put({
        type: 'setData',
        payload: {
          constructLoading: true
        },
      });

      const response: ResponseType = yield call(pageConstruct, payload);

      if (response.code === 0) {
        sucessCallBack();
        yield put({
          type: 'setData',
          payload: {
            pageHtml: response.data
          },
        });
      } else {
        failCallBack(response.msg);
      }

      yield put({
        type: 'setData',
        payload: {
          constructLoading: false
        },
      });
    }
    
  },

  reducers: {
    setData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

export default Model;
