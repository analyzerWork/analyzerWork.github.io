
class LoginModel extends Cookie {
  loginChecking = false;
  constructor() {
    super();
  }
  element = {
    $loginBtn: document.querySelector("#loginBtn"),
    $account: document.querySelector('#account'),
    $password: document.querySelector("#password"),

  };

  init = () =>{
    this.element.$loginBtn.addEventListener('click', this.loginHandler);
    this.element.$account.addEventListener('keyup', this.keyLoginHandler);
    this.element.$password.addEventListener('keyup', this.keyLoginHandler)

  }

  loginHandler = async () => {
    const accountValue = this.element.$account.value.trim();
    const password = this.element.$password.value.trim();

    if(accountValue.length === 0){
        new LightTip('请输入用户名', 2000, 'error');
        return
    }
    const userList = await this.loadUsers();

    const currentUser = userList.find(({name}) => name === accountValue);

    if(!currentUser){
        new LightTip('用户名不存在', 2000, 'error');
        return
    }

    if (currentUser.password === password){
        new LightTip('登录成功', 'success');
        super.set('name', currentUser.name);
        window.setTimeout(()=>{
          ANAlYZER_UTILS.locateToPage({type: 'replace'})
        },1000)

        return;
    }
    if(password.length === 0){
        new LightTip('请输入密码', 2000, 'error');
        return
    }    
    if(currentUser.password !== password){
        new LightTip('账号或密码错误', 2000, 'error');
        return
    } 
  }

  keyLoginHandler = (e) => {
    if(e.key === "Enter"){
        this.loginHandler()
    }
  }
}

const loginInstance = new LoginModel();
loginInstance.init()