if (typeof importScripts === "function") {
  importScripts("../computed.js");
}

self.addEventListener(
  "message",
  function (e) {
    if(e.data.type === 'COMPUTED_WORD_CLOUD_DATA'){
      const { data, keyword } = e.data;
      const wordCloudData = computeProductWordCloudData(data, keyword);
      self.postMessage({ payload: wordCloudData });
    }

  },
  false
);
