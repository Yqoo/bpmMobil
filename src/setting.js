const env = process.env.NODE_ENV;

const Setting = {
  // 接口请求地址,生产环境请自行使用Nginx解决跨域问题，开发环境请配置/bpm-app/config/index.js  proxyTable， target为代理服务器地址
  ctx: env === "development" ? "/api" : "/agile-bpm-platform",
  // 路由模式，可选值为 history 或 hash
  routerMode: "history",

  //是否支持OA，非OA版本不含公告新闻功能，这里配置是否开启该功能项
  supportOA: true,

  // 是否支持微信授权登录 (线上为微信免登模式)
  supportOauth2Type: env === "development" ? false : "weixin", //weixin：微信公众号，小程序，企业微信，dingding：钉钉，weixinqiye：微信企业

  //微信小程序 AppId ，企业微信 CorpID
  weixinAppId: "ww87c2829160c0cd11", //test环境 wx2b8025b664ee8ea6

  // 微信回调地址，必须配置网页授权
  //redirect_uri: 'http://test1.agilebpm.cn/bpm-app/authorization',
  // 企业微信回调地址，必须配置网页授权
  redirect_uri: "http://ces.agilebpm.cn/bpm-app/wxQyAuthorization",

  // 微信小程序免登使用的ID，微信小程序获取到code后访问  /bpm-app/appletAuthorization 页面，该页面访问后台获取openId，通过openId拿到用户绑定
  //appletAppId:'wx0efa63f2b7904bca',
  //supportWxOauth2: 'weixinqiye', 下面会覆盖掉上面 supportOauth2Type的配置
  // 测试号的配置
  /*supportWxOauth2: true,
	//微信TOKEN
	weixinAppId:'wx2b8025b664ee8ea6', //test环境 wx2b8025b664ee8ea6
	redirect_uri: 'http://47.106.189.156:30006/bpm-app/authorization',
	*/

  // 钉钉的企业ID，钉钉企业请设置H5应用地址为 http://test1.agilebpm.cn/bpm-app/dingding
  ddCorpId: "ding49c7e31712db80c135c2f4657eb6378f"
};

export default Setting;
