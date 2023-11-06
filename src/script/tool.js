window.ANAlYZER_UTILS = {
  mutableSetState(data, key, val) {
    data[key] = val;
  },
  requestData(url, params = {}) {
    const queryStr = Object.keys(params).reduce((prev, next, index) => {
      const prefix = index === 0 ? "?" : "&";
      return (prev += `${prefix}${next}=${params[next]}`);
    }, "");

    return fetch(`${url}${queryStr}`, { cache: "no-cache", mode: "no-cors" })
      .then((response) => response.json())
      .then((data) => data);
  },
  locateToPage: (params) => {
    const { path = "", type = "href" } = params;
    if (type === "href") {
      window.location.href = `/${path}`;
    } else if (type === "replace") {
      window.location.replace(`/${path}`);
    }
  },
};

window.echartsUtil = {
  format: echarts.format,
};

class IndexedDBUtil {
  db_config = {
    dbName: "userDB",
    // 用于版本控制，在升级 DB 结构时，将此数字 + 1
    dbVersion: 3,
    storeName: "userStore",
    keyPath: "id",
  };
  db_expiration = 24 * 60 * 60 * 1000;
  dbUpdateTime = 0;
  deleteIndexedDB = (dbName) =>
    new Promise((resolve, reject) => {
      const deleteDBRequest = window.indexedDB.deleteDatabase(dbName);

      deleteDBRequest.onsuccess = () => {
        console.info("IndexedDB deleted successfully.");
        resolve();
      };

      deleteDBRequest.onerror = (event) => {
        console.error("IndexedDB error on delete.", event);
        reject(deleteDBRequest.error);
      };
    });

  connectIndexedDB = (dbInformation) =>
    new Promise((resolve, reject) => {
      const { dbName, dbVersion, storeName, keyPath } = dbInformation;
      const dbRequest = window.indexedDB.open(dbName, dbVersion);

      dbRequest.onerror = (event) => {
        console.error("IndexedDB error on open.", event);
        // 打开错误时，删除用户本地 DB
        this.deleteIndexedDB(dbName).catch(() => {});
        reject(dbRequest.error);
      };
      dbRequest.onupgradeneeded = () => {
        const db = dbRequest.result;

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath });
        }
      };
      dbRequest.onsuccess = () => {
        resolve(dbRequest.result);
      };
    });

  getIndexedDBData = (dbQuery) =>
    new Promise((resolve, reject) => {
      const { storeName, query } = dbQuery;

      this.connectIndexedDB(dbQuery)
        .then((db) => {
          const transaction = db
            .transaction([storeName], "readonly")
            .objectStore(storeName)
            .get(query);

          transaction.onsuccess = () => {
            resolve(transaction.result);
          };
          transaction.onerror = () => {
            reject(transaction.error);
          };
        })
        .catch(reject);
    });

  setIndexedDBData = (dbInformation, data) =>
    new Promise((resolve, reject) => {
      const { storeName } = dbInformation;

      this.connectIndexedDB(dbInformation)
        .then((db) => {
          const transaction = db
            .transaction([storeName], "readwrite")
            .objectStore(storeName)
            .put(data);

          transaction.onsuccess = () => {
            resolve();
          };
          transaction.onerror = () => {
            reject(transaction.error);
          };
        })
        .catch(reject);
    });
}

window.analyzer_env = {
  MODE: "FE", //DB
  TARGET: "Dev", // Prod
};

const URL =
  window.analyzer_env.TARGET === "Dev"
    ? "/api/"
    : "http://www.analyzer.work/api/";

window.apiConfig = [
  "auth",
  "taste_matching",
  "ingredient_tracking",
  "brand_tracking",
  "ingredient_analysis",
].reduce(
  (prev, next) => ({
    ...prev,
    [next]: `${URL}${next}`,
  }),
  {}
);
