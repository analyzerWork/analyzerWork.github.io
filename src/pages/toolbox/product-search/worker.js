if (typeof importScripts === "function") {
  importScripts("../computed.js");
}

self.addEventListener(
  "message",
  function (e) {
    const { data, keyword } = e.data;
    const wordCloudData = computeProductWordCloudData(data, keyword);
    self.postMessage({ payload: wordCloudData });
  },
  false
);
