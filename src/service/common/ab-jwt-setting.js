/**
 * ab项目关于jwt的配置
 */
 window.AbJwtSetting = {
	storage: window.sessionStorage,//window.localStorage 配置存储jwt鉴权信息
	headerName: "Authorization",//鉴权头的名称
	getHeader: function() {
		var header = window.AbJwtSetting.storage.getItem(window.AbJwtSetting.headerName);
		if (!header) {
			header = window.AbJwtSetting.getParam(window.AbJwtSetting.headerName);
			if (header) {//设置鉴权信息
				window.AbJwtSetting.setHeader(header);
			}
		}
		return header;
	},
	setHeader: function(jwtHeader) {
		window.AbJwtSetting.storage.setItem(window.AbJwtSetting.headerName, jwtHeader);
	},
	getParam: function(name) {
		var url = window.location.href;
		var locUrl = url.substr(url.indexOf("?") + 1);
		var aryParams = locUrl.split("&");
		var rtn = "";
		for (var i = 0; i < aryParams.length; i++) {
			var pair = aryParams[i];
			var aryEnt = pair.split("=");
			var key = aryEnt[0];
			var val = aryEnt[1];
			if (key != name) continue;
			if (rtn == "") {
				rtn = val;
			}
			else {
				rtn += "," + val;
			}
		}
		return rtn;
	}
};

export default {
	// 全局安装时候
	install(Vue) {
		Vue.abJwtSetting = window.AbJwtSetting;
		Vue.prototype.abJwtSetting = window.AbJwtSetting;
	}
}
