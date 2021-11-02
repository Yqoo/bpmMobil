import Vue from "vue";
import { baseService, arrayTools } from "@/service/common/baseService";
import tools from "@/service/common/tools";
import formValidator from "@/service/form/formValidator";
import formServiceExtend from "./formServiceExtend";

import abCheckbox from "@/components/form/abCheckbox.vue";
import abDict from "@/components/form/abDict.vue";
Vue.component("abCheckbox", abCheckbox);
Vue.component("abDict", abDict);
import AbDate from "@/components/form/abDate.vue";
Vue.component("abDate", AbDate);
import AbUpload from "@/components/form/abUpload.vue";
Vue.component("abUpload", AbUpload);
import Datetime from "vux/src/components/datetime/index.vue";

Vue.component("datetime", Datetime);
import AbSubAdd from "@/components/form/abSubAdd.vue";
Vue.component("abSubAdd", AbSubAdd);

import abDynamicSelect from "../../components/form/abDynamicSelect.vue";
Vue.component("abDynamicSelect", abDynamicSelect);

import abSerialNo from "@/components/form/abSerialNo.vue";
Vue.component("abSerialNo", abSerialNo);

import aSignature from "@/components/form/ab-signature.vue";
Vue.component("abSignature", aSignature);

import abScanCode from "@/components/form/abScanCode.vue";
Vue.component("abScanCode", abScanCode);

import abNumber from "@/components/form/abNumber.vue";
Vue.component("abNumber", abNumber);

import abFlowQuote from "@/components/form/ab-flow-quote.vue";
Vue.component("abFlowQuote", abFlowQuote);

import abOpinion from "@/components/form/abOpinion.vue";
Vue.component("abOpinion", abOpinion);

import abUsefulOpinion from "@/components/form/abUsefulOpinion.vue";
Vue.component("abUsefulOpinion", abUsefulOpinion);

import abRegion from "@/components/form/abRegion.vue";
Vue.component("abRegion", abRegion);

var FormService = {};
/**
 * 混入html中的组件定义的参数变量
 */
FormService.initCustFormFu = function (html, data, methods = {}) {
  if (data.form && data.form.type !== "INNER") return;

  window.custFormComponentMixin = {};
  var custComponentData = data;

  if (html.indexOf("<script>") != -1) {
    var reg = /<script[^>]*?>[\s\S]*?<\/script>/i;
    var patten = reg.exec(html);
    var script = patten[0];

    var len1 = script.indexOf(">");
    var len2 = script.lastIndexOf("<");
    var custScriptStr = script.substring(len1 + 1, len2);
    html = html.replace(reg, "");

    if (custScriptStr) {
      try {
        eval(
          custScriptStr.substring(
            custScriptStr.indexOf("window.custFormComponentMixin")
          )
        );
      } catch (e) {
        console.error("解析表单脚本异常", custScriptStr, e);
      }
    }

    custComponentData.subTempData = {};

    custComponentData.subTableDialog = {};
  }

  /**
   * 公共的常用 表单 js
   */
  var custFormMethods = {
    abGetNumber: function(data) {
      if (data === undefined || data === "") {
        return 0;
      }
      var number = Number(data);
      if (number === NaN) {
        console.info("计算对象中存在 NaN");
        return 0;
      }
      return number;
    },
    abSubAvg: function(subDataList, key) {
      if (!subDataList || !key || subDataList.length == 0) {
        return "not calculate";
      }
      var sum = 0;
      subDataList.forEach(function(data) {
        if (!data[key]) return;
        sum = sum + Number(data[key]);
      });
      return sum / subDataList.length;
    },
    abSubSum: function(subDataList, key) {
      if (!subDataList || !key || subDataList.length == 0) {
        return "not calculate";
      }
      var sum = 0;
      subDataList.forEach(function(data) {
        if (!data[key]) return;
        sum = sum + Number(data[key]);
      });
      return sum;
    },

    showSubTable: function(dataScope, tableName) {
      if (!dataScope[tableName + "List"]) {
        this.$set(dataScope, tableName + "List", []);
      }

      this.$set(
        this.subTempData,
        tableName + "List",
        dataScope[tableName + "List"]
      );
      this.$set(this.subTableDialog, tableName, true);
    },
    ...methods
  };

  Vue.component("ab-custom-form", {
    name: "customForm",
    mixins: [custFormComponentMixin],
    template: html,
    data: function() {
      return custComponentData;
    },
    methods: custFormMethods
  });
};

/**
 * <pre>
 * 表单增加子表指令
 * abSubAdd: 为一个list push 一个对象
 * Arr{0] = list
 * Arr[1] = object
 * 会将 object extends 然后push 到 list 中
 * </pre>
 */
Vue.directive("SubAdd", {
  bind: function(el, binding, vnode) {
    initEmptySub(binding, vnode);

    addEvent(el, "click", function(e) {
      if (binding.value && binding.value.length == 2) {
        binding.value[0].push(Vue.tools.extend(binding.value[1]));
      }
    });
  }
});

Vue.directive("SubDel", {
  bind: function(el, binding) {
    addEvent(el, "click", function(e) {
      if (binding.value && binding.value.length == 2) {
        arrayTools.del(binding.value[1], binding.value[0]);
      }
    });
  }
});

function initEmptySub(binding, vnode) {
  if (!binding.value && binding.value.length !== 2) {
    return;
  }
  if (binding.value[0]) return;

  var dataPath = binding.expression.split(",")[0].substring(1);
  var index = dataPath.lastIndexOf(".");
  var tableKey = dataPath.substring(index + 1);
  var prePath = dataPath.substring(0, index);

  binding.value[0] = [];
  eval(
    "vnode.context.$set(vnode.context." +
      prePath +
      ',"' +
      tableKey +
      '",binding.value[0])'
  );
  return;

  var scope = vnode.context;

  for (var i = 0; i < array.length; i++) {
    if (i == array.lenght) scope = scope[array[i]];
  }

  for (var i = 0, k; (k = array[i++]); ) {
    scope = scope[k];
  }
  return value;
}

/**
 * 校验,依赖 v-model 或者 组件的 input 事件
 *
 */
Vue.directive("AbValidate", {
  inserted: function(el, binding, vnode) {
    console.info("inserted");
    formValidator.doValidate(el, binding, vnode);
    var validateHandler = function(e) {
      if (e.target && e.target !== el) return;

      var value = e.target ? e.target.value : e;
      formValidator.doValidate(el, binding, vnode, value);
    };

    if (vnode.componentInstance) {
      vnode.componentInstance.$on("input", function(value) {
        validateHandler(value);
      });
    } else {
    }
  },
  update: function(el, binding, vnode, oldVnode) {
    if (el.value === undefined) return;

    if (vnode.data.attrs.desc === "表单控件案例-省") {
      debugger;
    }

    var value = el.value;
    if (vnode.data && vnode.data.model && vnode.data.model.value) {
      value = vnode.data.model.value;
    }

    var oldValue = vnode.elm.$_oldValue;
    if (oldValue !== value || el.type === "radio") {
      formValidator.doValidate(el, binding, vnode, value);
    }
    vnode.elm.$_oldValue = value;
  },
  unbind: function(el, binding, vnode) {
    if (vnode.context.$validity[vnode.data.attrs.desc]) {
      delete vnode.context.$validity[vnode.data.attrs.desc];
    }
  }
});

/**
 * 获取表单的校验情况
 * 自定义表单为<custForm> 组件。当前componentScope 为页面的scope
 * 所以要先找到 custForm 组件的作用域
 * return
 */
FormService.getValidateMsg = function(componentScope) {
  var errorStr = "";
  if (!componentScope.$validity) {
    return errorStr;
  }

  for (var key in componentScope.$validity) {
    if (errorStr) {
      errorStr = errorStr + "<br/>";
    }
    errorStr =
      errorStr + "【" + key + "】" + "：" + componentScope.$validity[key];
  }

  if (errorStr) {
    errorStr = "<div style='text-align:left'>" + errorStr + "</div>";
  }

  return errorStr;
};

/**
 *  基础权限，对控件做只读、必填、无权限, @v-model 必须
 *  v-ab-permission="permission.kjcs.cskj.xb" v-model=""
 *
 *  判断是否有展示权限，无则移除dom
 *  v-ab-permission:show="permission.kjcs.cskj.xb"
 *
 *   *  判断是否有编辑权限，无则移除dom
 *  v-ab-permission:edit="permission.kjcs.cskj.xb"
 */
Vue.directive("AbPermission", {
  inserted: function(el, binding, vnode) {
    handleElementPermission(el, binding, vnode);
  },
  update: function(el, binding, vnode) {
    handleElementPermission(el, binding, vnode);
  }
});

/**
 * 处理控件权限
 *
 * @param el
 * @param binding
 * @param vnode
 * @returns
 */
function handleElementPermission(el, binding, vnode) {
  if (!binding.value) return;

  if (el.dataset.hasInited) return;

  if (binding.arg) {
    handleSpecialPermision(el, binding, vnode);
    return;
  }

  if (binding.value == "b") {
    vnode.elm.required = true;
  } else if (binding.value === "w") {
  } else if (binding.value === "r") {
    vnode.elm.readOnly = true;
    vnode.elm.disabled = true;
    if (vnode.elm.childNodes) {
      disableChildNodes(vnode.elm, true);
    }
  } else if (binding.value === "n") {
    vnode.elm.remove();
  }

  el.dataset.hasInited = true;
}

function disableChildNodes(elm, isReadOnly) {
  if (elm.childNodes) {
    elm.childNodes.forEach(function(child) {
      child.disabled = isReadOnly;
      child.readOnly = isReadOnly;
      if (child.childNodes) {
        disableChildNodes(child, isReadOnly);
      }
    });
  }
}

function handleSpecialPermision(el, binding, vnode) {
  if (binding.arg === "show" && binding.value == "n") {
    vnode.elm.remove();
  }

  if (
    binding.arg === "edit" &&
    binding.value !== "w" &&
    binding.value !== "b"
  ) {
    vnode.elm.remove();
  }

  el.dataset.hasInited = true;
}

function addEvent(element, event, listener) {
  if (element.addEventListener) {
    element.addEventListener(event, listener, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + event, listener);
  } else {
    element["on" + event] = listener;
  }
}
export default FormService;