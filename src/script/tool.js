
window.ANAlYZER_UTILS = {
    mutableSetState(data,key,val){
        data[key] = val 
    },
    requestData(url){
        return fetch(url).then(response => response.json()).then(data => data)
    },
    locateToPage: (path = '') => {
        window.location.href = `/${path}`;
    }
};
