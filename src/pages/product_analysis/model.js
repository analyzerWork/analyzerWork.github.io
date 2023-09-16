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
  taste_matching_data = [];
  matrixInstance = null;
  computedData = {
    month: "",
    selectedIngredients: [],
    ingredientClassOptions: [],
    selectedProductType: "",
    productTypeOptions: [],
    currentRangeData: [],
  };

  element = {
    $datePicker: document.querySelector("#product-analysis-date-picker"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $ingredientMatrixContainer: document.querySelector(
      "#ingredientMatrixContainer"
    ),
  };
  constructor(initData) {
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = ({ taste_matching_data, big_data }) => {
    this.data = big_data;
    this.taste_matching_data = taste_matching_data;
    const dateRange = [...new Set(big_data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    this.element.$datePicker.value = lastDate;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;

    const ingredientClassOptions = [
      ...new Set(initData.map((item) => item["成分分类"])),
    ];
    const productTypeOptions = [
      ...new Set(initData.map((item) => item["产品类型"])),
    ];
    const initSelectedProductType = productTypeOptions[0];
    const initSelectedIngredients = ingredientClassOptions.includes("果味")
      ? ["果味"]
      : [ingredientClassOptions[0]];

    this.set({
      month: lastDate,
      ingredientClassOptions,
      productTypeOptions,
      currentRangeData: big_data.filter(
        (item) =>
          item["月份"] === lastDate &&
          initSelectedIngredients.includes(item["成分分类"]) &&
          initSelectedProductType === item["产品类型"]
      ),
      selectedProductType: initSelectedProductType,
      selectedIngredients: initSelectedIngredients,
    });

    // this.brandTrendInstance = window.parent.echarts.init(
    //   this.element.$brandTrend
    // );
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
      .addEventListener("click", this.ingredientButtonSelectHandler);

    document
      .getElementById(INGREDIENT_SELECT_PANEL_ID)
      .addEventListener("click", this.ingredientSelectHandler);

    document.addEventListener("click", this.hidePanel);
  };

  dateChangeHandler(month) {
    this.set({
      month,
    });

    this.updateCurrentRangeData();
    // 重新渲染
    // this.renderMatrix();
  }

  updateCurrentRangeData() {
    const { month, big_data, selectedProductType, selectedIngredients } =
      this.get("month", "big_data");

    const currentRangeData = big_data.filter(
      (item) =>
        item["月份"] === month &&
        selectedIngredients.includes(item["成分分类"]) &&
        selectedProductType === item["产品类型"]
    );
    this.set({
      currentRangeData,
    });
  }

  renderIngredientSelectButton = () => {
    const { selectedIngredients } = this.get("selectedIngredients");

    this.element.$brandSelectContainer.innerHTML = `${getSelectButtonConfig({
      ...DEFAULT_SELECT_BUTTON_CONFIG,
      value: selectedIngredients,
    })}`;
  };

  renderIngredientSelectPanelComponent = () => {
    const { selectedIngredients, ingredientClassOptions } = this.get(
      "selectedIngredients",
      "ingredientClassOptions"
    );

    const panelWraper = document.createElement("div");

    panelWraper.innerHTML += `${getSelectPanelConfig({
      ...DEFAULT_SELECT_PANEl_CONFIG,
      value: selectedIngredients,
      data: getOptionsDataByKeyword(ingredientClassOptions),
    })}`;
    document.body.appendChild(panelWraper);
  };

  ingredientButtonSelectHandler = (e) => {
    e.stopPropagation();
    document.getElementById(SELECT_PANEL_CONTAINER_ID).classList.toggle("hide");
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

  // 选择成分分类
  ingredientSelectHandler = (e) => {
    if (e.target.classList.contains("select-option")) {
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
      const { ingredientClassOptions } = this.get("ingredientClassOptions");

      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectOptions(ingredientClassOptions, value);

      // this.renderMatrix();
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
