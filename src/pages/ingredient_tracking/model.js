const SELECT_BUTTON_ID = "ingredient-track-select-button";

const SELECT_PANEL_ID = "ingredient-track-select-panel";

const SELECT_PANEL_SEARCH_INPUT_ID = "ingredient-track-select-panel-search-input";


const DEFAULT_SELECT_BUTTON_CONFIG = {
  label: "选择成分：",
  constainerClass: "text",
  labelClass: "",
  id: SELECT_BUTTON_ID,
  buttonClass: "ingredient-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  seachable: true,
  containerClass: "panel-container",
  id: SELECT_PANEL_ID,
  searchInputId: SELECT_PANEL_SEARCH_INPUT_ID,
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
    this.renderSelectPanel();
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

    // document.getElementById(SELECT_PANEL_SEARCH_INPUT_ID).addEventListener("keyup", this.ingredientSearchHandler)
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

  // 绘制成分选择下拉面板
  renderSelectPanel = () => {
    const { selectedIngredient } = this.get("selectedIngredient");
    this.element.$ingredientSelectContainer.innerHTML = getSelectButtonConfig({
      ...DEFAULT_SELECT_BUTTON_CONFIG,
      value: selectedIngredient,
    });
    const dialog = document.createElement("div");
    dialog.style.width = '660px';
    dialog.innerHTML = geSelectPanelConfig(
      {
        ...DEFAULT_SELECT_PANEl_CONFIG,
        value: selectedIngredient,
        data: this.classificationIngredientList,
      }
    );
    this.element.$ingredientSelectContainer.appendChild(dialog)


  };

  ingreIndentSelectHandler = () => {
    const { selectedIngredient } = this.get("selectedIngredient");
    console.log('eefwefwefewf');
    this.ingredientDropInstance.element.content.innerHTML = geSelectPanelConfig(
      {
        ...DEFAULT_SELECT_PANEl_CONFIG,
        value: selectedIngredient,
        data: this.classificationIngredientList,
      }
    );
    // this.ingredientDropInstance.show();
  };

  // 搜索成分
  ingredientSearchHandler = (e) => {
    console.log(e);
    // 过滤,重新渲染 pannel
  };

  // 点击选择成分
  ingredientSelectHandler = (ingredient) => {
    // select 组件赋值
    this.set({
      selectedIngredient: ingredient,
    });
    // 重新计算data
    this.updateCurrentRangeData(ingredient);

    // 重新渲染新品、品牌趋势图
  };

  // 绘制应用新品数量趋势
  renderNewProductTrend = () => {};

  // 绘制应用品牌数量趋势
  renderBrandTrend = () => {};
}
