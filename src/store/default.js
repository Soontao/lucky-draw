
export const defaultState = {
  config: {
    name: 'SAP IBSO Chengdu Year End Event (2021) 抽奖',
    number: 70,
    firstPrize: 2,
    secondPrize: 4,
    thirdPrize: 8,
    headerInterval: 5000,
    copyright: 'Happy "牛" Year, IBSO Chengdu Year End Event, powered by Theo Sun',
    bgImage: 'https://res.cloudinary.com/digf90pwi/image/upload/c_scale,q_50,w_2635/v1577698710/wes-hicks-Kcna-zCEog0-unsplash_dxm9ph.jpg'
  },
  result: {
    firstPrize: [],
    secondPrize: [],
    thirdPrize: [],
  },
  newLottery: [
    { key: "firstPrize", name: `"牛"气冲天奖` },
    { key: "secondPrize", name: `小试"牛"刀奖` },
    { key: "thirdPrize", name: `九"牛"一毛奖` },
  ],
  list: [],
  photos: []
}
