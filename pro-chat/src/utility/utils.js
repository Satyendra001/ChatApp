import axios from 'axios'
// import { BASE_URL } from './Urls';
// axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;

export const APICall = (config) => {
    axios({
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers,
        params: config.params,
        // credentials: "same-origin"
    })
        .then((response) => {
            console.log("Success", response);
            config.successCallBack(response);
        })
        .catch((error) => {
            config.errorCallBack(error)
            console.log("Error!", error.response);
        });
}