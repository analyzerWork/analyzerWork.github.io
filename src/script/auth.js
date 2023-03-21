class Cookie {
  cookieMap = new Map();
  constructor() {
    this.init();
  }
  init() {
    const allCookies = document.cookie;
    if (allCookies.length) {
      const cookieArray = allCookies.split("; ");

      cookieArray.forEach((cookie) => {
        const [name, value] = cookie.split("=");
        this.cookieMap.set(name, value);
      });
    }

    this.authCheck();

    
  }
  authCheck = () => {
    const user = this.get("name");
    const currentUser = USER_INFO.find(({ name }) => name === user);
    if (!user || !currentUser) {
        if(window.location.pathname !== "/login.html"){
            window.location.href = "/login.html";
        }      
    } else {
        if(window.location.pathname === "/login.html"){
            ANAlYZER_UTILS.locateToPage();
        }
    }
  }
  set(key, value) {
    this.cookieMap.set(key, value);

    const date = new Date();
    const ms = 20/3600 * 3600 * 1000;
    date.setTime(date.getTime() + ms);

    document.cookie = `${key}=${encodeURIComponent(
      value
    )}; expires=${date.toGMTString()}`;
  }

  get(key) {
    if (this.cookieMap.has(key)) {
      return decodeURIComponent(this.cookieMap.get(key));
    }
  }
}
