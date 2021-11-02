// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import FastClick from "fastclick";
import App from "./App";
import router from "./router";
import store from "./store";
import { sync } from 'vuex-router-sync'

import "./assets/css/weui.css"
import "./assets/css/font-awesome.css"

import AbJwtSetting from './service/common/ab-jwt-setting'
import BaseService from './service/common/baseService'
import Tools from './service/common/tools'

Vue.use(AbJwtSetting)
Vue.use(Tools)
Vue.use(BaseService)


import {
  LoadingPlugin,
  ToastPlugin,
  AlertPlugin,
  ConfirmPlugin,
  BusPlugin,
  LocalePlugin,
  ConfigPlugin,
  CloseDialogsPlugin,
  Marquee,
  MarqueeItem,
  GroupTitle,
  Cell,
  Grid,
  GridItem,
  XHeader,
  Popup,
  TransferDom,
  XSwitch,
  Tabbar,
  TabbarItem,
  Loading,
  Flexbox,
  FlexboxItem,
  XDialog,
  Divider,
  Card,
  Badge,
  Popover,
  XButton 
} from "vux";

Vue.use(LoadingPlugin);
Vue.use(AlertPlugin);
Vue.use(ToastPlugin);
Vue.use(ConfirmPlugin);
Vue.use(BusPlugin);
Vue.use(LocalePlugin);
Vue.use(CloseDialogsPlugin, router)

Vue.component("x-header", XHeader);
Vue.component("grid", Grid);
Vue.component("grid-item", GridItem);
Vue.component("group-title", GroupTitle);
Vue.component("cell", Cell);
Vue.directive("transfer-dom", TransferDom);
Vue.component("x-switch", XSwitch);
Vue.component("tabbar", Tabbar);
Vue.component("tabbar-item", TabbarItem);
Vue.component("loading", Loading);

Vue.component("popup", Popup);
Vue.component("x-dialog", XDialog);

Vue.component("flexbox", Flexbox);
Vue.component("flexbox-item", FlexboxItem);
Vue.component("divider", Divider);
Vue.component("card", Card);
Vue.component("badge", Badge);
Vue.component("popover", Popover);

Vue.component("marquee", Marquee);
Vue.component("marqueeItem", MarqueeItem);
Vue.component('x-button', XButton)

const shouldUseTransition = !/transition=none/.test(location.href);

store.registerModule("vux", {
  state: {
    isLoading: false,
    direction: shouldUseTransition ? "forward" : ""
  },
  mutations: {
    updateLoadingStatus(state, payload) {
      state.isLoading = payload.isLoading;
    },
    updateDirection(state, payload) {
      if (!shouldUseTransition) {
        return;
      }
      state.direction = payload.direction;
    }
  }
});

// global VUX config
Vue.use(ConfigPlugin, {
  $layout: "VIEW_BOX" // global config for VUX, since v2.5.12
});

FastClick.attach(document.body);
Vue.config.productionTip = false;

sync(store, router)

// simple history management
const history = window.sessionStorage;
history.clear();
let historyCount = history.getItem("count") * 1 || 0;
history.setItem("/", 0);
let isPush = false;
let isTouchStart = false;
let endTime = Date.now();
let methods = ["push", "go", "replace", "forward", "back"];

document.addEventListener("touchend", () => {
  isTouchStart = false;
  endTime = Date.now();
});
document.addEventListener("touchstart", () => {
  isTouchStart = true;
});
methods.forEach(key => {
  let method = router[key].bind(router);
  router[key] = function(...args) {
    isPush = true;
    method.apply(null, args);
  };
});

router.beforeEach(function(to, from, next) {
  store.commit("updateLoadingStatus", { isLoading: true });

  const toIndex = history.getItem(to.path);
  const fromIndex = history.getItem(from.path);
  let direction;

  if (toIndex) {
    if (
      !fromIndex ||
      parseInt(toIndex, 10) > parseInt(fromIndex, 10) ||
      (toIndex === "0" && fromIndex === "0")
    ) {
      direction = "forward";
    } else {
      direction = "reverse";
    }
  } else {
    ++historyCount;
    history.setItem("count", historyCount);
    to.path !== "/" && history.setItem(to.path, historyCount);
    direction = "forward";
  }

  // 判断是否是ios左滑返回 或者 右滑前进
  if (
    toIndex &&
    toIndex !== "0" &&
    !isPush &&
    (Date.now() - endTime < 377 || isTouchStart)
  ) {
    store.commit("updateDirection", { direction: "" });
  } else {
    store.commit("updateDirection", { direction: direction });
  }
  isTouchStart = false;

  if (/\/http/.test(to.path)) {
    let url = to.path.split("http")[1];
    window.location.href = `http${url}`;
  } else {
    next();
  }
});

router.afterEach(function(to) {
  isPush = false;
  store.commit("updateLoadingStatus", { isLoading: false });
  if (process.env.NODE_ENV === "production") {
    ga && ga("set", "page", to.fullPath);
    ga && ga("send", "pageview");
  }
});

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app-box");
