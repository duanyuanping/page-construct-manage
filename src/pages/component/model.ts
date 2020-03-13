import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { ListItemDataType } from './data.d';
import { queryFakeList, editor } from './service';

export interface StateType {
  list: ListItemDataType[];
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    editor: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'component',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response.data) ? response.data : [],
      });
    },
    *editor({ payload, successCb, failCb }, { call, put }) {
      const response = yield call(editor, payload);
      if (response.code == 0) {
        successCb()
      } else {
        failCb(response.msg)
      }
    }
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  },
};

export default Model;
