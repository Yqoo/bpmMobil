import Vue from "vue";
import { baseService, arrayTools } from "@/service/common/baseService";
import tools from "@/service/common/tools";
import formService from "@/service/form/formService";
import opinionDialog from "@/components/bpm/opinionDialog";
import taskOpinionHistory from "@/components/bpm/opinionHistoryDialog.vue";
import instanceImageDialog from "@/components/bpm/instanceImageDialog.vue";
import turnDialog from "@/components/bpm/turnDialog.vue";
import addDoDialog from "@/components/bpm/addDoDialog.vue";
Vue.component("instance-image-dialog", instanceImageDialog);

Vue.component("opinionDialog", opinionDialog);
Vue.component("opinion-history-dialog", taskOpinionHistory);
Vue.component("turn-dialog", turnDialog);
Vue.component("add-do-dialog", addDoDialog);

var BpmService = {};
/** taskId,instanceId,defId,bpmTask,form,buttons**/
BpmService.data;
//初始化动作
BpmService.init = function(params, fn) {
  this.data = params;
  var dataUrl = Vue.__ctx + "/bpm/task/getTaskData"; // taskId=xxx
  if (!params.taskId) {
    dataUrl = Vue.__ctx + "/bpm/instance/getInstanceData"; //?defId="+defId+"&instanceId="+instanceId+"&readonly="+param.readonly;
  }

  var defer = baseService.postForm(dataUrl, params);
  Vue.tools.getResultData(
    defer,
    function(data) {
      //可以再表单中扩展配置逻辑
      data.flowRequestParam = BpmService.getSubmitFlowParam(data);

      if (fn) fn(data);
      Vue.tools.extend(data, BpmService.data);
    },
    "alert",
    function() {
      Vue.$router ? this.$router.back() : window.history.back();
    }
  );
};

//获取表单的数据
BpmService.getFormData = function(custFormContext, button, postFn) {
  var validateForm = "start,agree,oppose".indexOf(button.alias) != -1;

  var frmType = this.data.form.type;
  if (frmType == "INNER") {
    var errorMsg = formService.getValidateMsg(custFormContext);
    if (errorMsg && validateForm) {
      Vue.$vux.alert.show({
        title: "表单校验提示",
        content: errorMsg,
        hideOnBlur: true
      });
      return false;
    }
    return custFormContext.data;
  }

  if (frmType == "FRAME") {
    // 获取url表单的iframe对象
    var iframeObj = document.getElementById("frmFrame").contentWindow;

    //尝试校验
    try {
      if (validateForm) {
        if (iframeObj.isValid() === false) {
          return false;
        }
      }
    } catch (e) {}

    try {
      // 取值方式一 : 尝试直接取值 , 在url表单中添加一个window.getData的函数 用来返回当前url的表单数据 ,
      // 注意需要自己校验数据 ,如果校验失败,需要自行提示,并且返回false , 比如
      /**
			 * window.getData = function(){
					if(!isValid){
						return false;
					}
					
					return data;
			   }
			 */
      return iframeObj.getData();
    } catch (e) {
      //debugger // 跨域URL表单要使用事件交互，请参考文档 http://www.agilebpm.cn/zh-cn/docs/flowConf.html#URL%E8%A1%A8%E5%8D%95%E5%89%8D%E7%AB%AF%E8%B7%A8%E5%9F%9F%E9%97%AE%E9%A2%98%E5%A4%84%E7%90%86

      // 判断子页面是否有监听事件 , 这里通过window.name == 'subIframeCallback'
      if (window.name != "subIframeCallback") {
        // 如果没有监听,则直接返回
        return {};
      }

      // 如果子页面没有getData函数, 或者是跨域了, 则通过 Html5通讯的方式获取
      // 判断是否跨域可参考这个链接 https://blog.csdn.net/shuiya3/article/details/49490441
      var targetUrl = document.getElementById("frmFrame").src;

      // 1. 当前页面接收子页面的数据事件
      window.onmessage = function(e) {
        e = e || event;
        var data = e.data || {};
        custFormContext.$vux.loading.hide();
        if (data.type == "getData" && data.url == targetUrl) {
          if (!data.valid) {
            // 如果校验失败,则提示
            if (data.errorMsg) {
              custFormContext.$vux.alert.show({
                title: "表单校验提示",
                content: data.errorMsg
              });
            }
            return;
          }
          var resultData = data.data;
          postFn(button, resultData, custFormContext);
        }
      };

      // 2. 由当前页面发送获取数据事件消息给子页面
      iframeObj.postMessage(
        { type: "getDataReady", url: document.location.href },
        targetUrl
      );

      // 3. 此时子页面需要接收该事件 , 并且将数据以html5通讯的方式发送回来 , 代码如下
      /**
			 * 
				window.onmessage = function(e){
			  		var data = e.data || {};
			  		var valid = true;
			  		var errorMsg = "数据不能为空";
			  		// TODO 校验表单的逻辑
			  		
			  		var formData = {};
			  		// TODO 获取数据的逻辑
			  		
			  		if( data.type == 'getDataReady'){
						window.parent.postMessage ( {
				            type : 'getData' ,
				            url : document.location.href ,
				            valid : valid,
				            errorMsg : errorMsg,
				            data : formData
				        }, data.url );
				    }
		        }
			 */

      return { waitIframeNotify: true };
    }
  }
};

BpmService.getSubmitFlowParam = function(data) {
  if (!data) {
    alert("error");
    return;
  }

  if (data.task) {
    return {
      taskId: data.task.id,
      instanceId: data.task.instId,
      nodeId: data.task.nodeId
    };
  }

  if (data.instance) {
    // started 判断是否为草稿
    return {
      instanceId: data.instance.id,
      defId: data.instance.defId,
      started: data.instance.actDefId
    };
  }

  var defId = data.defId || this.data.defId;

  return {
    defId: defId,
    instanceId: this.data.instanceId,
    businessKey: this.data.bizId
  };
};
/**
 * 流程按钮解析。
 * 关于按钮样式，对话框宽高属性，不做可配置行，因为前段无法统一，
 * 但是、请求资源路径要求一致，比如/bpm/task/   /bpm/instance.
 * 前缀自己前段控制
 */
Vue.component("bpmButtons", {
  props: ["buttons"],
  data: function() {
    return {};
  },
  methods: {
    buttonClick: async function(button) {
      this.$vux.loading.show({ text: "Loading" });

      //获取流程数据
      var custFormContext = getCustFormComponent(this.$parent);
      //执行前置js
      if (!this.execuFn(button.beforeFn, custFormContext)) {
        return;
      }

      //如果自定义表单定义了 custValid表单组件的function 则执行返回 false 则不提交
      let validateForm = "start,agree,oppose".indexOf(button.alias) != -1;
      if (validateForm && custFormContext.custValid) {
        if (custFormContext.custValid() === false) {
          this.$vux.loading.hide();
          return;
        }
      }
      if (validateForm && custFormContext.asyncCustValid) {
        let result = await custFormContext.asyncCustValid();
        if (result === false) {
          this.$vux.loading.hide();
          return;
        }
      }

      var busData = BpmService.getFormData(
        custFormContext,
        button,
        this.postFn
      );
      if (busData === false) {
        //获取数据失败
        this.$vux.loading.hide();
        return;
      }
      //如果是等待通讯中则不调用触发方法
      if (!busData.waitIframeNotify) {
        this.postFn(button, busData, custFormContext);
      }
    },
    postFn: function(button, busData, custFormContext) {
      var scope = this;
      var flowData = custFormContext.flowRequestParam;
      flowData.data = busData;
      flowData.action = button.alias;

      if (!flowData.extendConf) {
        flowData.extendConf = {};
      }
      flowData.extendConf.nodeId = this.$route.query.nodeId;
      flowData.extendConf.carbonId = this.$route.query.carbonId;

      //获取更多完成动作配置
      if (button.configPage) {
        this.$vux.loading.hide();
        var componentKey = "opinion-dialog";
        if ("taskOpinion" === button.alias) {
          componentKey = "opinion-history-dialog";
        }
        if ("flowImage" === button.alias) {
          componentKey = "instance-image-dialog";
        }
        if ("turn" === button.alias) {
          componentKey = "turn-dialog";
        }
        if ("addDo" === button.alias) {
          componentKey = "add-do-dialog";
        }

        var formContext = this.$parent;
        if (
          formContext.dynamicComponent.key === componentKey &&
          componentKey != "opinion-dialog"
        ) {
          formContext.dynamicComponent.show = true;
          return;
        }

        //处理“不填意见配置”
        if (
          componentKey == "opinion-dialog" &&
          custFormContext.configSpecified &&
          custFormContext.configSpecified.requiredOpinion == false
        ) {
          scope.postAction(flowData);
          return;
        }
        formContext.dynamicComponent = {
          show: true,
          key: componentKey,
          flowParam: flowData,
          name: button.name,
          callback: function(data) {
            scope.postAction(data, formContext);
          }
        };
      } else {
        scope.postAction(flowData);
      }
    },
    postAction: function(flowData, formContext) {
      this.$vux.loading.show({ text: "Loading" });
      // 执行动作
      var url =
        Vue.__ctx +
        (flowData.taskId ? "/bpm/task/doAction" : "/bpm/instance/doAction");
      var defer = Vue.baseService.post(url, flowData);

      defer.then(
        data => {
          Vue.$vux.loading.hide();
          this.abTools.alert(data.msg, data.isOk ? "" : "错误信息", function() {
            if (data.isOk) {
              Vue.$router ? this.$router.back() : window.history.back();
            } else {
              formContext.dynamicComponent.show = false;
            }
          });
        },
        function() {
          Vue.$vux.loading.hide();
        }
      );

      /*Vue.tools.getResultMsg(defer,function(data){
					Vue.$vux.loading.hide();
					Vue.$router ? this.$router.back() : window.history.back();
				},function(){
					Vue.$vux.loading.hide();
				});
				*/
    },
    execuFn: function(fnStr, scope) {
      if (!fnStr) return true;
      var script = "var tempFunction = function(scope){ " + fnStr + "};";
      var result = eval(script + "tempFunction(scope);");
      if (result === false) return false;
      return true;
    },
    getButtonCss: function(alias) {
      var buttonsCss = {
        start: "icon-success-fa fa fa-send",
        draft: "icon-primary-fa fa fa-clipboard",
        save: "icon-primary-fa fa fa-clipboard",
        agree: "icon-success-fa fa fa-check-square-o",
        oppose: "icon-primary-fa  fa-close",
        reject: "icon-danger-fa fa fa-lastfm",
        reject2Start: "icon-danger-fa  fa fa-lastfm",
        lock: "icon-primary-fa fa fa-lock",
        unlock: "icon-primary-fa fa fa-unlock",
        taskOpinion: "icon-primary-fa fa fa-navicon",
        manualEnd: "icon-primary-fa fa fa-ioxhost",
        flowImage: "icon-primary-fa fa fa-image",
        carbonCopy: "icon-primary-fa fa fa-share",
        turn: "icon-primary-fa fa fa-share"
      };
      if (buttonsCss[alias]) return buttonsCss[alias];

      return "icon-primary-fa fa fa-navicon";
    }
  },
  template:
    '<tabbar style="position:fixed">                                                                                     						\
		 			<tabbar-item  v-for="btn in buttons" v-if="\'print,carbonCopy,reminder,taskFreeJump\'.indexOf(btn.alias)==-1">                                            \
						 <span slot="icon" :class="getButtonCss(btn.alias)" v-on:click="buttonClick(btn)"></span>													\
					     <span slot="label" v-on:click="buttonClick(btn)">{{btn.name}}</span>																		\
			 		</tabbar-item>                                                                          							\
	 		  </tabbar>'
});

Vue.component("ab-url-form", {
  props: ["form"],
  name: "urlForm",
  template:
    "<iframe id='frmFrame' src='' @load='iframeHeight(this)' style='width:100%;border:none;'></iframe>",
  data: function() {
    return { url: "" };
  },
  methods: {
    iframeHeight: function() {
      var height =
        document.documentElement.clientHeight || document.body.clientHeight;
      $(this.$el).height(height - 40);
    }
  },
  mounted: function() {
    if (this.form.type != "FRAME") return;

    var url = this.form.formValue;
    if (!url) return;
    var bizIdName = this.$route.query.bizIdName || "bizId";
    var bizId = this.$route.query[bizIdName];
    if (bizId) {
      url = url.replace(bizIdName + "=&", bizIdName + "=" + bizId + "&");
    }
    //url = url.startWith("http")?url : getProjectUrl(url);
    this.url = url;
    $(this.$el).attr("src", url);

    // 接收子window信号，是否以事件交互方式
    window.onmessage = function(e) {
      e = e || event;
      var data = e.data || {};
      if (data.type == "callback" && data.name == "subIframeCallback") {
        window.name = "subIframeCallback";
      }
    };
  }
});

function getCustFormComponent(pageComponent) {
  for (var i = 0, c; (c = pageComponent.$children[i++]); ) {
    if (c.$options._componentTag === "ab-custom-form") {
      return c;
    }

    // url 表单则返回父页面
    if (c.$options._componentTag === "ab-url-form") {
      return pageComponent;
    }
  }
  // 不向下递归
  console.error("页面中找不到 cust-form 的组件！！！");
  return null;
}

export default BpmService;