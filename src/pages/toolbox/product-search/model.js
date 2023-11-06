class ToolBox extends CustomResizeObserver {
  data = [];
  pageSize = 50;
  productWordCloudInstance = null;
  workerInstance = null;
  computedData = {
    keyword: "",
    offset: 0,
    totalPage: 0,
    dataSource: [],
  };

  element = {
    $chartLoading: document.querySelector("#chartLoading"),
    $toolboxContent: document.querySelector("#toolboxContent"),
    $ingredientSearch: document.querySelector("#ingredientSearch"),
    $refreshProduct: document.querySelector("#refreshProduct"),
    $ingredientWordCloudSection: document.querySelector(
      "#ingredientWordCloudSection"
    ),
    $ingredientWordCloud: document.querySelector("#ingredientWordCloud"),
    $emptySection: document.querySelector("#emptySection"),
  };
  constructor(initData) {
    super();
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;

    this.set({
      dataSource: initData,
      totalPage: Math.ceil(initData.length / this.pageSize),
    });

    this.productWordCloudInstance = window.parent.echarts.init(
      this.element.$ingredientWordCloud
    );

    this.workerInstance = new Worker("worker.js");
  };

  setup() {
    this.emitPostMessage();
  }

  get = (...keys) =>
    keys.reduce(
      (prev, key) => ({
        ...prev,
        [key]: this.computedData[key],
      }),
      {}
    );

  set = (data) => {
    this.computedData = {
      ...this.computedData,
      ...data,
    };
  };

  bind = () => {
    this.element.$ingredientSearch.addEventListener(
      "change",
      this.ingredientSearchChangeHandler
    );

    this.element.$ingredientSearch.addEventListener(
      "keyup",
      this.ingredientOnSearchHandler
    );

    this.element.$refreshProduct.addEventListener("click", this.refreshHandler);

    this.workerInstance.addEventListener(
      "message",
      this.workerMessageHandler,
      false
    );

    super.observe(this.element.$toolboxContent, () =>
      this.productWordCloudInstance.resize()
    );
  };

  ingredientSearchChangeHandler = (e) => {
    this.set({
      keyword: e.target.value.trim(),
    });

    if (e.target.value === "") {
      this.emitPostMessage();
    }
  };

  ingredientOnSearchHandler = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      this.emitPostMessage();
    }
  };

  emitPostMessage = () => {
    console.log("[product-search] post message to worker");

    const { keyword } = this.get("keyword");
    this.set({
      offset: 0,
    });
    this.element.$chartLoading.classList.remove("hide");

    this.workerInstance.postMessage({
      data: this.data,
      keyword,
    });
  };

  refreshHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const { offset } = this.get("offset");

    this.set({
      offset: offset + 1,
    });
    this.renderProductWordCloud();
  };

  // worker 过滤 & 排序后的数据
  workerMessageHandler = (e) => {
    console.log("[product-search] message received from worker");
    const data = e.data.payload;

    this.set({
      dataSource: data,
    });

    this.renderProductWordCloud();
  };

  renderProductWordCloud() {
    const { dataSource, offset } = this.get("dataSource", "offset");

    const currentData = dataSource.slice(
      offset * this.pageSize,
      (offset + 1) * this.pageSize
    );

    const emptySection = document.querySelector(".empty-content");
    if (emptySection) {
      this.element.$ingredientWordCloudSection.removeChild(emptySection);
    }

    if (currentData.length === 0) {
      this.element.$ingredientWordCloud.classList.add("hide");
      this.element.$ingredientWordCloudSection.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
    } else {
      this.element.$ingredientWordCloud.classList.remove("hide");
      const wordCloudOption = getWordCloudOption({ data: currentData });
      this.productWordCloudInstance.setOption(wordCloudOption);
    }
    this.element.$chartLoading.classList.add("hide");
  }
}
