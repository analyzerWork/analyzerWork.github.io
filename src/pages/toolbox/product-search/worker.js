if( 'function' === typeof importScripts) {
  importScripts("../computed.js");
}

self.addEventListener(
  "message",
  function (e) {
    const { offset, pageSize, data, keyword } = e.data;
    const wordCloudData = computeProductWordCloudData(data, keyword).slice(
      offset * pageSize,
      (offset + 1) * pageSize
    );
    self.postMessage({ payload: wordCloudData });
  },
  false
);
