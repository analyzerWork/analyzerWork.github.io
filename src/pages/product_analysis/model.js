const INGREDIENT_SELECT_BUTTON_ID = "ingredient-class-select-button";

const INGREDIENT_SELECT_BUTTON_TEXT_ID = "ingredient-class-select-button-text";

const INGREDIENT_SELECT_PANEL_CONTAINER_ID =
  "ingredient-class-select-panel-container";

const INGREDIENT_SELECT_PANEL_ID = "ingredient-class-select-panel";

const DEFAULT_INGREDIENT_CLASS_BUTTON_CONFIG = {
  label: "成分分类：",
  containerClass: "text",
  labelClass: "",
  id: INGREDIENT_SELECT_BUTTON_ID,
  textId: INGREDIENT_SELECT_BUTTON_TEXT_ID,
  buttonClass: "brand-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  searchable: true,
  containerClass: "ingredient-select-panel-container",
  id: INGREDIENT_SELECT_PANEL_ID,
  containerId: INGREDIENT_SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
};

class ProductAnalysis {
  data = [];
  matrixInstance = null;
  computedData = {
    selectedIngredients: [],
    ingredientClassOptions: [],
    selectedProductType: "",
    productTypeOptions: [],
    currentRangeData: [],
  };

  element = {
    $datePicker: document.querySelector("#product-analysis-date-picker"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $ingredientMatrixContainer: document.querySelector("#ingredientMatrixContainer"),
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
    this.element.$datePicker.value = lastDate;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;

    const ingredientClassOptions = [...new Set(initData.map((item) => item["成分分类"]))];
    const productTypeOptions = [...new Set(initData.map((item) => item["产品类型"]))];

    this.set({
      ingredientClassOptions,
      productTypeOptions,
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
    this.renderIngredientSelectButton();
    this.renderIngredientSelectPanelComponent();
    this.renderMatrix();
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
      .getElementById(INGREDIENT_SELECT_BUTTON_ID)
      .addEventListener("click", this.brandButtonSelectHandler);

    document
      .getElementById(INGREDIENT_SELECT_PANEL_ID)
      .addEventListener("click", this.brandSelectHandler);

    document.addEventListener("click", this.hidePanel);

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
    this.renderMatrix();
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
      brandOptions: [...new Set(currentData.map((item) => item["品牌"]))],
      currentRangeData,
    });
  }

  renderIngredientSelectButton = () => {
    const { selectedBrand } = this.get("selectedBrand");

    this.element.$brandSelectContainer.innerHTML = `${getSelectButtonConfig({
      ...DEFAULT_SELECT_BUTTON_CONFIG,
      value: selectedBrand,
    })}`;
  };

  renderIngredientSelectPanelComponent = () => {
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
      const { selectedBrand, startDateIndex, endDateIndex } = this.get(
        "selectedBrand",
        "startDateIndex",
        "endDateIndex"
      );
      const brandOptions = [
        ...new Set(
          this.data
            .slice(startDateIndex, endDateIndex)
            .map((item) => item["品牌"])
        ),
      ];

      const data = getOptionsDataByKeyword(brandOptions);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(data, selectedBrand);
      this.set({
        keyword: "",
        brandOptions,
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

  // 点击选择品牌
  brandSelectHandler = (e) => {
    if (e.target.classList.contains("select-option")) {
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
      const { brandOptions } = this.get("brandOptions");

      const data = getOptionsDataByKeyword(brandOptions);
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(data, value);

      this.renderMatrix();
    }
  };


  // 绘制矩阵图
  renderMatrix = () => {
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
