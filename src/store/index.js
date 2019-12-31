import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';

import VuexPersistence from 'vuex-persist';

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
});

Vue.use(Vuex);

const initState = {
  config: {
    name: 'SAP Family Day 抽奖',
    number: 70,
    specialAward: 0,
    firstPrize: 2,
    secondPrize: 4,
    thirdPrize: 8,
  },
  result: {
    specialAward: [],
    firstPrize: [],
    secondPrize: [],
    thirdPrize: [],
  },
  newLottery: [
    { key: "specialAward", name: "特等奖" },
    { key: "firstPrize", name: "一等奖" },
    { key: "secondPrize", name: "二等奖" },
    { key: "thirdPrize", name: "三等奖" },
  ],
  list: [],
  photos: []
}

export default new Vuex.Store({
  state: initState,
  mutations: {
    setClearStore(state) {
      state = Object.assign(state, initState)
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
      const arr = state.list;
      list.forEach(item => {
        const arrIndex = arr.findIndex(data => data.key === item.key);
        if (arrIndex > -1) {
          arr[arrIndex].name = item.name;
        } else {
          arr.push(item);
        }
      });
      state.list = arr;
      state.config.number = arr.length

      setData(listField, arr);
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
