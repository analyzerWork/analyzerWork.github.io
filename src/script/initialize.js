const {
  ANAlYZER_UTILS,
  apiConfig,
  analyzer_env: { MODE },
  SOURCE_PATH,
} = window.parent;

const INIT = {
  loadData(key, ClassRef) {
    window.addEventListener("load", function () {
      if (MODE === "FE") {

        ANAlYZER_UTILS.requestData(`${SOURCE_PATH}taste_matching_v2.json`).then(
          (result) => {
            console.log('--- load data ---');
            
            const instance = new ClassRef(result);
          }
        );
      } else {
        ANAlYZER_UTILS.requestData(apiConfig[key], {
          name: "init",
        }).then((result) => {
          const instance = new ClassRef(result);
        });
      }
    });
  },
};
