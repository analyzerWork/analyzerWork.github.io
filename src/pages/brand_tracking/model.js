const SELECT_BUTTON_ID = "brand-track-select-button";

const SELECT_BUTTON_TEXT_ID = "brand-track-select-button-text";

const SELECT_PANEL_CONTAINER_ID = "brand-track-select-panel-container";

const SELECT_PANEL_ID = "brand-track-select-panel";

const SELECT_PANEL_SEARCH_INPUT_ID = "brand-track-select-panel-search-input";

const DEFAULT_SELECT_BUTTON_CONFIG = {
  label: "选择品牌：",
  constainerClass: "text",
  labelClass: "",
  id: SELECT_BUTTON_ID,
  textId: SELECT_BUTTON_TEXT_ID,
  buttonClass: "brand-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  seachable: true,
  containerClass: "brand-select-panel-container",
  id: SELECT_PANEL_ID,
  searchInputId: SELECT_PANEL_SEARCH_INPUT_ID,
  containerId: SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
};

class BrandTracking {
  data = [];
  brandTrendInstance = null;
  brandDropInstance = null;
  computedData = {
    startDateIndex: 0,
    endDateIndex: 0,
    selectedBrand: "",
    brandOptions: [],
    currentRangeData: [],
    keyword: "",
    brandProducts: [],
  };

  element = {
    $datePicker: document.querySelector("#brand-track-date-picker"),
    $brandSelectContainer: document.querySelector("#brandSelectContainer"),
    $brandTrend: document.querySelector("#brandTrend"),
  };
  constructor(initData) {
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    const startDate = dateRange[dateRange.length - 13];
    this.element.$datePicker.value = `${startDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);
    const currentRangeData = this.data.slice(startDateIndex, endDateIndex);

    const selectedBrand = currentRangeData[currentRangeData.length - 1]["品牌"];

    this.set({
      startDateIndex,
      endDateIndex,
      brandOptions: [...new Set(currentRangeData.map((item) => item["品牌"]))],
      currentRangeData: currentRangeData.filter(
        (item) => item["品牌"] === selectedBrand
      ),
      selectedBrand,
    });

    this.brandTrendInstance = window.parent.echarts.init(
      this.element.$brandTrend
    );
  };

  setup() {
    this.renderSelectButton();
    this.renderSelectPanelComponent();
    this.renderBrandTrend();
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
    const instance = this;
    this.element.$datePicker.addEventListener("change", function () {
      instance.dateChangeHandler(this.value);
    });

    document
      .getElementById(SELECT_BUTTON_ID)
      .addEventListener("click", this.brandButtonSelectHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("keyup", this.brandSearchHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("input", this.brandSearchInputHandler);

    document
      .getElementById(SELECT_PANEL_ID)
      .addEventListener("click", this.brandSelectHandler);

    document.addEventListener("click", this.hidePanel);

    this.brandTrendInstance.on("click", this.markPointClickHandler);
    this.brandTrendInstance.on("mouseout", this.markPointMouseoutHandler);

  };

  dateChangeHandler(dateRange) {
    const { selectedBrand } = this.get("selectedBrand");
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      startDateIndex,
      endDateIndex,
    });

    this.updateCurrentRangeData(selectedBrand);
    // 重新渲染
    this.renderBrandTrend();
  }

  updateCurrentRangeData(brand) {
    const { startDateIndex, endDateIndex } = this.get(
      "startDateIndex",
      "endDateIndex"
    );

    const currentData = this.data.slice(startDateIndex, endDateIndex);
    const currentRangeData = currentData.filter(
      (item) => item["品牌"] === brand
    );
    this.set({
      selectedBrand: brand,
      brandOptions: [...new Set(currentRangeData.map((item) => item["品牌"]))],
      currentRangeData,
    });
  }

  renderSelectButton = () => {
    const { selectedBrand } = this.get("selectedBrand");

    this.element.$brandSelectContainer.innerHTML = `${getSelectButtonConfig({
      ...DEFAULT_SELECT_BUTTON_CONFIG,
      value: selectedBrand,
    })}`;
  };

  renderSelectPanelComponent = () => {
    const { selectedBrand, brandOptions } = this.get(
      "selectedBrand",
      "brandOptions"
    );

    const panelWraper = document.createElement("div");

    panelWraper.innerHTML += `${getSelectPanelConfig({
      ...DEFAULT_SELECT_PANEl_CONFIG,
      value: selectedBrand,
      data: getOptionsDataByKeyword(brandOptions),
    })}`;
    document.body.appendChild(panelWraper);
  };

  brandButtonSelectHandler = (e) => {
    e.stopPropagation();
    document.getElementById(SELECT_PANEL_CONTAINER_ID).classList.toggle("hide");
  };

  brandSearchInputHandler = (e) => {
    if (e.target.value.length === 0) {
      const { selectedBrand, brandOptions } = this.get(
        "selectedBrand",
        "brandOptions"
      );
      const data = getOptionsDataByKeyword(brandOptions);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(data, selectedBrand);
      this.set({
        keyword: "",
      });
    }
  };

  hidePanel = (event) => {
    let eleClicked = event && event.target;
    const elePanel = document.getElementById(SELECT_PANEL_CONTAINER_ID);
    if (!eleClicked || elePanel.classList.contains("hide")) {
      return;
    }

    if (!elePanel.contains(eleClicked)) {
      elePanel.classList.add("hide");
    }
  };

  // 搜索成分
  brandSearchHandler = (e) => {
    const keyword = e.target.value.trim();
    if (e.key === "Enter" && keyword.length > 0) {
      this.set({
        keyword,
      });
      const { selectedBrand, brandOptions } = this.get(
        "selectedBrand",
        "brandOptions"
      );
      const data = getOptionsDataByKeyword(brandOptions, keyword);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(data, selectedBrand);
    }
  };

  // 点击选择品牌
  brandSelectHandler = (e) => {
    if (e.target.classList.contains("select-option")) {
      const { keyword, brandOptions } = this.get("keyword", "brandOptions");
      const value = e.target.dataset.value;
      // select 组件赋值
      document.getElementById(SELECT_BUTTON_TEXT_ID).innerText = value;
      // 隐藏 Panel
      document
        .getElementById(SELECT_PANEL_CONTAINER_ID)
        .classList.toggle("hide");
      // 重新计算 data
      this.updateCurrentRangeData(value);

      // 重新渲染panelList

      const data = getOptionsDataByKeyword(brandOptions, keyword);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(data, value);

      this.renderBrandTrend();
    }
  };

  markPointClickHandler = (params) => {
    const { componentType, dataIndex, seriesIndex } = params;
    if (componentType === "markPoint") {
      this.brandTrendInstance.dispatchAction({
        type: "showTip",
        // 系列的 index，在 tooltip 的 trigger 为 axis 的时候可选。
        seriesIndex,
        // 数据项的 index，如果不指定也可以通过 name 属性根据名称指定数据项
        dataIndex,
      });
    }
  };

  markPointMouseoutHandler = (params) => {
    const { componentType, dataIndex, seriesIndex } = params;
    this.brandTrendInstance.dispatchAction({
        type: 'hideTip'
    })
  };

  // 绘制应用品牌数量趋势
  renderBrandTrend = () => {
    const { currentRangeData } = this.get("currentRangeData");

    const brandTrendData = computedBrandTrendData(currentRangeData);

    const { x_data, y_data: origin_y_data } = brandTrendData;

    const y_data = origin_y_data.map(({ value }) => value);

    const brandProducts = origin_y_data.map(({ products }) => products);

    this.set({
      brandProducts,
    });

    this.brandTrendInstance.setOption(
      getTrendOptions({ x_data, y_data, brandProducts })
    );
  };
}
