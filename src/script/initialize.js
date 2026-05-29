const {
  ANAlYZER_UTILS,
  apiConfig,
  analyzer_env: { MODE },
  SOURCE_PATH,
  DATA_SOURCE_LIST,
} = window.parent;

const INIT = {
  loadData(key, ClassRef) {
    window.addEventListener("load", async function () {
      if (MODE === "FE") {

        const result = await Promise.all(DATA_SOURCE_LIST.map(year => ANAlYZER_UTILS.requestData(`${SOURCE_PATH}data_${year}.json`)))

        const data = result.reduce((prev,next)=> prev.concat(next));
        console.log("-- initialize --",data.length);
        

        new ClassRef(data);
       
      } else {
        // HOLD
        ANAlYZER_UTILS.requestData(apiConfig[key], {
          name: "init",
        }).then((result) => {
          const instance = new ClassRef(result);
        });
      }
    });
  },
};
