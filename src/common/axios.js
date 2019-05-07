/**
 * Created by gs on 2019/5/7.
 */
import axios from 'axios'
import browser from './browser'
import console from 'console'
import user from '../store/user'
import router from '../router'

const http = axios.create({
    timeout: 60000
})

// 设置 post、put 默认 Content-Type
http.defaults.headers.post['Content-Type'] = 'application/json'
http.defaults.headers.put['Content-Type'] = 'application/json'

http.interceptors.request.use(config => {
        if(config.method === 'post' || config.method === 'put'){
            // post、put 提交时，将对象转换为string, 为处理Java后台解析问题
            config.data = JSON.stringify(config.data)
        }else if (config.method === 'get' && browser.isIE) {
            // 给GET 请求后追加时间戳， 解决IE GET 请求缓存问题
            let symbol = config.url.indexOf('?') >= 0 ? '&' : '?'
            config.url += symbol + '_=' + Date.now()
        }
        //设置token
        if(user.getToken()){
            config.headers.token = user.getToken()
        }
        // 请求发送前进行处理
        return config
    },error => {
        // 请求错误处理
        return Promise.reject(error)
    }
)

http.interceptors.response.use(response =>{
        const resp = response.data
        if(resp.code === 40001){
            console.log("未登录或登录超时")
            user.removeToken();
            router.push("login")
        }
        return resp;
    },error => {
        let info = {}
        let {status, statusText, data} = error.response
        if (!error.response) {
            info = {
                code: 5000,
                msg: 'Network Error'
            }
        } else {
            // 此处整理错误信息格式
            info = {
                code: status,
                data: data,
                msg: statusText
            }
        }
        return Promise.reject(info)
    }
)

export default function () {
    return http
}