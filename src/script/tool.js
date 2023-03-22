
window.ANAlYZER_UTILS = {
    mutableSetState(data,key,val){
        data[key] = val 
    },
    requestData(url){
        return fetch(url).then(response => response.json()).then(data => data)
    },
    locateToPage: (params) => {
        const {path = '',type = 'href'} = params;
        if(type === 'href'){
            window.location.href = `/${path}`;
        } else if(type === 'replace'){
            window.location.replace(`/${path}`);
        }
    }
};
