import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';

import VuexPersistence from 'vuex-persist';
import { defaultState } from './default';

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: defaultState,
  mutations: {
    setClearStore(state) {
      state = Object.assign(state, defaultState)
    },
    setConfig(state, config) {
      state.config = config;
    },
    setResult(state, result = {}) {
      state.result = result;

      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (state.newLottery.find(item => item.name === newLottery.name)) {
        return;
      }
      state.newLottery.push(newLottery);
      setData(newLotteryField, state.newLottery);
      state.result[newLottery.key] = []
      setData(resultField, state.result)
    },
    setList(state, list) {
      state.list = list
      state.config.number = list.length
      setData(listField, list);
      setData("config", state.config)
    },
    setPhotos(state, photos) {
      state.photos = photos;
    }
  },
  actions: {},
  modules: {},
  plugins: [vuexLocal.plugin]
});
