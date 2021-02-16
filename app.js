var express = require('express');
var axios = require('axios');
var { get, map, sortBy, filter, includes } = require('lodash');
var app = express();

const featuredLeagues = [
  '英超',
  '西甲',
  '意甲',
  '法甲',
  '法甲',
  '英足总杯',
  '德甲',
  '欧冠杯',
  '欧联杯',
  '欧国联',
  '西杯',
  '意杯',
  '德国杯',
  '英联杯',
  '世界杯',
]

app.get('/', (req, res) => {
  axios.get('https://www.heibaizhibo.com/api/index/index?sub_class=0&class1=1&page=1&size=1000').then(({data}) => {
    const list = [...get(data, 'data.list[0].data', []), ...get(data, 'data.list[1].data', [])]
    const matches = map(list, (match) => {
      const {
        eventName: league,
        homeName,
        homeLogo,
        awayName,
        awayLogo,
        playCode,
        id,
        mstartTime,
      } = match
      return {
        league,
        homeName,
        homeLogo,
        awayName,
        awayLogo,
        id,
        source: sortBy(map(playCode, c => {
          return {
            title: c.name,
            id: c.id,
          }
        }), s => {
          return s.title.indexOf('粤') > -1 ? -1 : 1
        }),
        datetime: mstartTime * 1000,
      }
    })

    res.json(filter(matches, m => {
      return includes(featuredLeagues, m.league)
    }))
  })
})

app.listen(3000, function(){
  console.log('Listening on port 3000');
});

module.exports = app;
