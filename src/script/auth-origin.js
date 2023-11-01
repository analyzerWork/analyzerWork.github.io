class Cookie extends IndexedDBUtil {
  cookieMap = new Map();
  allUsers = [];
  constructor() {
    super();
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
  getUserDataFromDB = () => {
    return this.getIndexedDBData({ ...this.db_config, query: 1 }).catch(
      () => {}
    );
  };
  isUsersDataExpired = (updateTime) => {
    const dbUpdateTime = updateTime ?? this.dbUpdateTime;
    return (
      !dbUpdateTime || new Date().getTime() - dbUpdateTime > this.db_expiration
    );
  };
  loadUsers = (ignoreCache) => {
    const authInstance = this;
    const cachedUsersPromise = (async () => {
      // const cachedUsers = new Map();
      // 从本地存储加载用户信息
      let queriedUsers;
      const userData = await authInstance.getUserDataFromDB();
      
      const { value, usersLastUpdate } = !ignoreCache ?  userData ?? {} : {};
      let dbUpdateTime = usersLastUpdate;
      try {
        queriedUsers = value ? JSON.parse(value) : undefined;
      } catch (e) {
        // 解析数据出错时，可忽略，后面会从接口查询
        console.warn("Parse cached user data failed.", e);
      }

      // 本地存储无数据 / 缓存过期时，从接口查询
      if (!queriedUsers?.length || authInstance.isUsersDataExpired(dbUpdateTime)) {
        const userList = await ANAlYZER_UTILS.requestData(apiConfig["auth"]);

        if (!userList) {
          // 为了支持查询出错后，再次查询
          return [];
        }
        queriedUsers = userList.data;
        dbUpdateTime = new Date().getTime();

        try {
          // 写入本地存储
          await authInstance.setIndexedDBData(this.db_config, {
            id: 1,
            value: JSON.stringify(queriedUsers),
            usersLastUpdate: dbUpdateTime,
          });
        } catch (e) {
          // 写入失败时，无影响，可忽略
          console.error("Write cached user data failed.", e);
        }
      }
      // 写入内存缓存
      // queriedUsers.forEach((cachedUser) => {
      //   cachedUsers.set(cachedUser.id, cachedUser);
      // });
      // this.dbUpdateTime = dbUpdateTime;

      return queriedUsers;
    })();

    return cachedUsersPromise;
  };
  authCheck = async () => {
    const user = this.getCookie("name");
    if (!user) {
      if (window.location.pathname !== "/login.html") {
        ANAlYZER_UTILS.locateToPage({ path: "login.html" });
      }
      return;
    }
    const userList = window.analyzer_env.MODE === 'FE' ? USER_INFO : await this.loadUsers();
    const currentUser = userList.find(({ name }) => name === user);
    if (!currentUser) {
      if (window.location.pathname !== "/login.html") {
        ANAlYZER_UTILS.locateToPage({ path: "login.html" });
      }
    } else {
      if (window.location.pathname === "/login.html") {
        ANAlYZER_UTILS.locateToPage({ type: "replace" });
      }
    }
  };
  set(key, value) {
    this.cookieMap.set(key, value);

    const date = new Date();
    const ms = 12 * 3600 * 1000;
    date.setTime(date.getTime() + ms);

    document.cookie = `${key}=${encodeURIComponent(
      value
    )}; expires=${date.toGMTString()}; SameSite=None; Secure`;
  }

  getCookie(key) {
    if (this.cookieMap.has(key)) {
      return decodeURIComponent(this.cookieMap.get(key));
    }
  }
}
