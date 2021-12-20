exports.handler = async (event) => {
  // TODO implement
  const axios = require("axios");
  const { all = false } = event.queryStringParameters || {};
  var { get, groupBy, map, includes, reduce } = require("lodash");
  var chineseConv = require("chinese-conv");

  const sport = {
    斯诺克: "桌球",
    篮球: "籃球",
    网球: "網球",
    排球: "排球",
    足球: "足球",
  };

  const sportItems = Object.keys(sport);

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
    "欧洲杯",
    "美洲杯",
  ];

  const basicLeagues = [
    "西乙",
    "巴西甲",
    "日职联",
    "日职乙",
    "日联杯",
    "日皇杯",
    "日职乙",
    "韩K联",
    "澳洲甲",
    "智利甲",
    "美职业",
    "亚冠杯",
    "挪超",
  ];

  const ch = (s) => {
    try {
      return chineseConv.tify(s);
    } catch (err) {
      return s;
    }
  };

  const isHD = (v) => {
    return v === "FHD" || v === "HD";
  };

  const getMatches = async (url) => {
    try {
      return axios
        .get(url)
        .then((res) => {
          const data = get(res, "data.data");
          const items = reduce(
            data,
            (arr, v) => {
              const { ln: type, tn: league } = v;
              if (includes(sportItems, type)) {
                if (type === "足球") {
                  if (!all) {
                    if (includes(featuredLeagues, league)) {
                      arr.push(v);
                    }
                  } else {
                    if (
                      includes(featuredLeagues, league) ||
                      includes(basicLeagues, league)
                    ) {
                      arr.push(v);
                    }
                  }
                } else if (type === "篮球") {
                  if (league === "NBA") {
                    arr.push(v);
                  }
                } else {
                  arr.push(v);
                }
              }
              return arr;
            },
            []
          );

          return groupBy(
            map(items, (i) => {
              return {
                type: sport[i.ln],
                language: ch(i.islg),
                teams: ch(i.ti),
                league: ch(i.tn),
                datetime: Number(i.st) * 1000,
                hd: isHD(i.ishd),
                url: `https://v.stnye.cc/live/${i.id}`,
              };
            }),
            "type"
          );
        })
        .catch((err) => {
          console.log(err, "list");
          return [];
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  };
  let matches = await getMatches("https://data.stnye.cc/data/api.php");

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(matches),
  };
  return response;
};
