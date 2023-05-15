const SELECT_BUTTON_ID = "ingredient-track-select-button";

const SELECT_BUTTON_TEXT_ID = "ingredient-track-select-button-text";

const SELECT_PANEL_CONTAINER_ID = "ingredient-track-select-panel-container";

const SELECT_PANEL_ID = "ingredient-track-select-panel";

const SELECT_PANEL_SEARCH_INPUT_ID =
  "ingredient-track-select-panel-search-input";

const DEFAULT_SELECT_BUTTON_CONFIG = {
  label: "选择成分：",
  constainerClass: "text",
  labelClass: "",
  id: SELECT_BUTTON_ID,
  textId: SELECT_BUTTON_TEXT_ID,
  buttonClass: "ingredient-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  seachable: true,
  containerClass: "ingredient-select-panel-container",
  id: SELECT_PANEL_ID,
  searchInputId: SELECT_PANEL_SEARCH_INPUT_ID,
  containerId: SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
};

class IngredientTracking {
  data = [];
  classificationIngredientList = [];
  brandTrendInstance = null;
  ingredientDropInstance = null;
  computedData = {
    startDateIndex: 0,
    endDateIndex: 0,
    selectedIngredient: "",
    currentRangeData: [],
    keyword: "",
  };

  element = {
    $datePicker: document.querySelector("#ingredient-track-date-picker"),
    $ingredientSelectContainer: document.querySelector(
      "#ingredientSelectContainer"
    ),
    $productTrend: document.querySelector("#productTrend"),
    $brandTrend: document.querySelector("#brandTrend"),
  };
  constructor(initData) {
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;
    const { resortFirstClassificationIngredient } =
      computedRelatedFirstClassificationData(initData);
    this.classificationIngredientList = resortFirstClassificationIngredient.map(
      ({ classification, ingredientList }) => ({
        title: classification,
        options: ingredientList,
      })
    );
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    const startDate = dateRange[dateRange.length - 13];
    this.element.$datePicker.value = `${startDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    const startIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);
    this.set({
      startIndex,
      endIndex,
      currentRangeData: this.data.slice(startIndex, endIndex),
      selectedIngredient:
        resortFirstClassificationIngredient[0].ingredientList[0],
    });
    this.newProductTrendInstance = window.parent.echarts.init(
      this.element.$productTrend
    );
    this.brandTrendInstance = window.parent.echarts.init(
      this.element.$brandTrend
    );
  };

  setup() {
    this.renderSelectButton();
    this.renderSelectPanelComponent();
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
      .addEventListener("click", this.ingreIndentSelectHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("keyup", this.ingredientSearchHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("input", this.ingredientSearchInputHandler);

    document
      .getElementById(SELECT_PANEL_ID)
      .addEventListener("click", this.ingredientSelectHandler);

    document.addEventListener("mouseup", this.hidePanel);
  };

  dateChangeHandler(dateRange) {
    const { selectedIngredient } = this.get("selectedIngredient");
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      startIndex,
      endIndex,
    });

    updateCurrentRangeData(selectedIngredient);
    // 重新渲染热门top15
    // this.renderTopHotIngredient();
    // 重新渲染一级
    // this.handleFirstClassificationRender(searchValue);
  }

  updateCurrentRangeData(ingredient) {
    const { startDateIndex, endDateIndex } = this.get(
      "startDateIndex",
      "endDateIndex"
    );

    const currentData = this.data.slice(startDateIndex, endDateIndex);

    this.set({
      selectedIngredient: ingredient,
      currentRangeData: currentData.filter(
        (item) => item["加工后成分"] === ingredient
      ),
    });
  }

  renderSelectButton = () => {
    const { selectedIngredient } = this.get("selectedIngredient");

    this.element.$ingredientSelectContainer.innerHTML = `${getSelectButtonConfig(
      {
        ...DEFAULT_SELECT_BUTTON_CONFIG,
        value: selectedIngredient,
      }
    )}`;
  };

  renderSelectPanelComponent = () => {
    const { selectedIngredient } = this.get("selectedIngredient");

    const panelWraper = document.createElement("div");

    panelWraper.innerHTML += `${geSelectPanelConfig(
      {
        ...DEFAULT_SELECT_PANEl_CONFIG,
        value: selectedIngredient,
        data: getPanelDataByKeyword(this.classificationIngredientList),
      }
    )}`;
    document.body.appendChild(panelWraper)
  };

  ingreIndentSelectHandler = () => {
    document.getElementById(SELECT_PANEL_CONTAINER_ID).classList.toggle("hide");
  };

  ingredientSearchInputHandler = (e) => {
    if (e.target.value.length === 0) {
      const { selectedIngredient } = this.get("selectedIngredient");
      const data = getPanelDataByKeyword(this.classificationIngredientList);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectPanelList(data, selectedIngredient);
      this.set({
        keyword: "",
      });
    }
  };

  hidePanel = (event) => {
    let eleClicked = event && event.target;
    const elePanel = document.getElementById(SELECT_PANEL_CONTAINER_ID);
    if (!eleClicked || elePanel.classList.contains('hide')) {
      return;
    }

    if (
      !elePanel.contains(eleClicked) ||
      eleClicked.contains(elePanel)
    ) {
      elePanel.classList.add('hide');
    }
  };

  // 搜索成分
  ingredientSearchHandler = (e) => {
    const keyword = e.target.value.trim();
    if (e.key === "Enter" && keyword.length > 0) {
      this.set({
        keyword,
      });
      const { selectedIngredient } = this.get("selectedIngredient");

      const data = getPanelDataByKeyword(
        this.classificationIngredientList,
        keyword
      );
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectPanelList(data, selectedIngredient);
    }
  };

  // 点击选择成分
  ingredientSelectHandler = (e) => {
    if (e.target.classList.contains("select-panel-option")) {
      const { keyword } = this.get("keyword");
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
      const data = getPanelDataByKeyword(
        this.classificationIngredientList,
        keyword
      );
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectPanelList(data, value);
      // 重新渲染新品、品牌趋势图
    }
  };

  // 绘制应用新品数量趋势
  renderNewProductTrend = () => {};

  // 绘制应用品牌数量趋势
  renderBrandTrend = () => {};
}
