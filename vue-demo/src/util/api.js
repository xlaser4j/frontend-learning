import Axios from "axios";
import Message from "element-ui/packages/message/src/main";
import router from "../router";

// 使用axios统一拦截所有响应处理
Axios.interceptors.response.use(
  success => {
    // 存在status,如果http响应为200,但是后端封装的data中的status属性为500,就展示后端的错误信息
    if (success.status && success.status === 200) {
      if (success.data.code === 500 || success.data.code === 400) {
        Message.error({ message: success.data.message });
        return;
      }
    }
    // 成功如果有消息弹窗提示
    if (success.data.message) {
      Message.success({ message: success.data.message });
    }
    return success.data;
  },
  error => {
    // http状态码不等于200的处理逻辑
    if (error.response.status === 404 || error.response.status === 504) {
      Message.error({ message: "服务异常!" });
    } else if (error.response.status === 401) {
      Message.error({ message: "认证失败,请重新登陆!" });
      router.replace("/");
    } else if (error.response.status === 403) {
      Message.error({ message: "权限不足,请联系管理员处理!" });
    } else if (error.response.data.message) {
      Message.error({ message: error.response.data.message });
    } else {
      Message.error({ message: "未知错误!" });
    }
  }
);

// 统一设置base路径
let base = "";

// 后端security默认登陆使用form-data格式(可以修改json),也就是kv形式,这里封装一个post请求支持kv
export const postKVRequest = (url, params) => {
  return Axios({
    method: "post",
    url: `${base}${url}`,
    data: params,
    // 参数转换为x-www-form-urlencoded(等价于form-data)
    transformRequest: [
      function(data) {
        let ret = "";
        for (let k in data) {
          ret +=
            encodeURIComponent(k) + "=" + encodeURIComponent(data[k]) + "&";
        }
        return ret;
      }
    ],
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
};

// json参数请求封装: post, put, delete, get
export const postRequest = (url, params) => {
  return Axios({
    method: "post",
    url: `${base}${url}`,
    data: params
  });
};
export const putRequest = (url, params) => {
  return Axios({
    method: "put",
    url: `${base}${url}`,
    data: params
  });
};
export const getRequest = (url, params) => {
  return Axios({
    method: "get",
    url: `${base}${url}`,
    data: params
  });
};
export const deleteRequest = (url, params) => {
  return Axios({
    method: "delete",
    url: `${base}${url}`,
    data: params
  });
};
// 可以通过export语法在调用出导入使用这些方法;也可以在main.js一次性导入,封装成一个vue插件,以Vue.prototype插件形式通过this.方法全局使用
