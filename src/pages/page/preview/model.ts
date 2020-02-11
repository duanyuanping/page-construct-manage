import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { ResponseType } from './data.d';
import { preview } from './service';

export interface StateType {
  url: string;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchPreview: Effect;
  };
  reducers: {
    setData: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'pagePreview',

  state: {
    url: ''
  },

  effects: {
    *fetchPreview({ payload }, { call, put }) {
      const response: ResponseType = yield call(preview, payload.uid);
      if (response.code === 0) {
        yield put({
          type: 'setData',
          payload: {
            url: response.data
          },
        });
      }
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
