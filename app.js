exports.handler = async (event) => {
  // TODO implement
  const axios = require('axios')
  const DOMAIN = process.env.DOMAIN || 'heibaizhibo'
  const { all = false } = event.queryStringParameters || {}
  var { get, map, sortBy, filter, includes, isEmpty } = require('lodash')
  var chineseConv = require('chinese-conv')
  const featuredLeagues = [
    '英超',
    '西甲',
    '意甲',
    '法甲',
    '英挑杯',
    '英足总杯',
    '英社盾',
    '德甲',
    '欧冠杯',
    '欧联杯',
    '欧国联',
    '西杯',
    '意杯',
    '德国杯',
    '英联杯',
    '世界杯',
    '世俱杯',
    '欧罗巴杯',
    '欧洲杯',
    '美洲杯',
  ]

  const basicLeagues = [
    '西乙',
    '巴西甲',
    '日职联',
    '日职乙',
    '日联杯',
    '日皇杯',
    '日职乙',
    '韩K联',
    '澳洲甲',
    '智利甲',
    '美职业',
    '亚冠杯',
    '挪超',
  ]
  const ch = (s) => {
    try {
      return chineseConv.tify(s)
    } catch (err) {
      return s
    }
  }

  const isUrlExist = async (url) => {
    try {
      return axios
        .get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          },
        })
        .then(({ data }) => {
          if (data) {
            return url
          }
          return ''
        })
        .catch((err) => {
          return ''
        })
    } catch (err) {
      return ''
    }
  }

  const getLiveUrl = async (id, source) => {
    return `https://www.${DOMAIN}.com/play-iframe/${id}#${source}`
  }

  const getMatches = async (url) => {
    try {
      return axios
        .get(url)
        .then(async ({ data }) => {
          const list = [
            ...get(data, 'data.list[0].data', []),
            ...get(data, 'data.list[1].data', []),
          ]
          const _matches = map(list, (match) => {
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
              source: sortBy(
                map(playCode, (c) => {
                  return {
                    title: c.name,
                    id: c.id,
                  }
                }),
                (s) => {
                  return s.title.indexOf('粤') > -1 ? -1 : 1
                }
              ),
              start: mstartTime * 1000,
            }
          })

          const matches = filter(_matches, (m) => {
            return includes(
              [...(all === 'true' ? basicLeagues : []), ...featuredLeagues],
              m.league
            )
          })

          return Promise.all(
            map(matches, async (m) => {
              return {
                ...m,
                league: ch(m.league),
                homeName: ch(m.homeName),
                awayName: ch(m.awayName),
                url: await getLiveUrl(m.id, get(m, 'source[0].id', '')),
              }
            })
          )
        })
        .catch((err) => {
          console.log(err, 'list')
          return []
        })
    } catch (err) {
      console.log(err)
      return []
    }
  }
  const url = `https://www.${DOMAIN}.com/api/index/index?sub_class=0&class1=1&page=1&size=500`

  const matches = await getMatches(url)

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(matches),
  }
  return response
}
