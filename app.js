exports.handler = async (event) => {
  // TODO implement
  const axios = require("axios");
  const { all = false } = event.queryStringParameters || {};
  var { get, map, sortBy, filter, includes, uniq } = require("lodash");
  var chineseConv = require("chinese-conv");
  const featuredLeagues = [
    "英超",
    "西甲",
    "意甲",
    "法甲",
    "英足总杯",
    "德甲",
    "欧冠杯",
    "欧联杯",
    "欧国联",
    "西杯",
    "意杯",
    "德国杯",
    "英联杯",
    "世界杯",
    "世俱杯",
    "欧罗巴杯",
  ];

  const basicLeagues = [
    "西乙",
    "巴西甲",
    "日联杯",
    "日皇杯",
    "日职乙",
    "韩K联",
    "韩K2联",
    "澳洲甲",
    "智利甲",
  ];
  const ch = (s) => {
    try {
      return chineseConv.tify(s);
    } catch (err) {
      return s;
    }
  };

  const matches = await axios
    .get(
      "https://www.heibaizhibo.com/api/index/index?sub_class=0&class1=1&page=1&size=1000"
    )
    .then(({ data }) => {
      const list = [
        ...get(data, "data.list[0].data", []),
        ...get(data, "data.list[1].data", []),
      ];
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
        } = match;
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
              };
            }),
            (s) => {
              return s.title.indexOf("粤") > -1 ? -1 : 1;
            }
          ),
          start: mstartTime * 1000,
        };
      });

      const matches = filter(_matches, (m) => {
        return includes(
          [...(all === "true" ? basicLeagues : []), ...featuredLeagues],
          m.league
        );
      });

      return map(matches, (m) => {
        return {
          ...m,
          league: ch(m.league),
          homeName: ch(m.homeName),
          awayName: ch(m.awayName),
        };
      });
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify(matches),
  };
  return response;
};
