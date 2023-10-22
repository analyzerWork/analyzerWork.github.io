class ToolBox extends CustomResizeObserver {
  data = [];
  pageSize = 50;
  totalPage = 0;
  productWordCloudInstance = null;
  workerInstance = null;
  computedData = {
    keyword: "",
    offset: 0,
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

    this.totalPage = Math.ceil(initData.length / this.pageSize);

    this.productWordCloudInstance = window.parent.echarts.init(
      this.element.$ingredientWordCloud
    );

    this.workerInstance = new Worker("worker.js");
  };

  initWebWorker = () => {
    if (window.Worker) {
      const myWorker = new Worker("worker.js");

      [first, second].forEach((input) => {
        input.onchange = function () {
          myWorker.postMessage([first.value, second.value]);
          console.log("Message posted to worker");
        };
      });

      myWorker.onmessage = function (e) {
        result.textContent = e.data;
        console.log("Message received from worker");
      };
    } else {
      console.log("Your browser doesn't support web workers.");
    }
  };

  setup() {
    this.renderProductWordCloud();
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
      this.workMessageHandler,
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
      this.renderProductWordCloud();
    }
  };

  ingredientOnSearchHandler = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      this.renderProductWordCloud();
    }
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

  workMessageHandler = (e) => {
    console.log("Message received from worker");
    const data = e.data.payload;

    const emptySection = document.querySelector(".empty-content");
    if (emptySection) {
      this.element.$ingredientWordCloudSection.removeChild(emptySection);
    }

    if (data.length === 0) {
      this.element.$ingredientWordCloud.classList.add("hide");
      this.element.$ingredientWordCloudSection.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
    } else {
      this.element.$ingredientWordCloud.classList.remove("hide");
      const wordCloudOption = getWordCloudOption({ data });
      this.productWordCloudInstance.setOption(wordCloudOption);
    }
    this.element.$chartLoading.classList.add("hide");
  };

  renderProductWordCloud() {
    const { data } = this;
    let { offset, keyword } = this.get("keyword", "offset");

    if (offset + 1 >= this.totalPage) {
      offset = 0;
    }
    console.log("Message posted to worker");
    this.element.$chartLoading.classList.remove("hide");

    this.workerInstance.postMessage({
      offset,
      pageSize: this.pageSize,
      data,
      keyword,
    });
  }
}
