(function(){
    const user = window.localStorage.getItem('analyzer-login-user');
    if(!user){
        window.location.href = '/login.html'
    }
})()