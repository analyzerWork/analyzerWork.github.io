const INGREDIENT_SELECT_BUTTON_ID = "ingredient-class-select-button";

const INGREDIENT_SELECT_BUTTON_TEXT_ID = "ingredient-class-select-button-text";

const INGREDIENT_SELECT_PANEL_CONTAINER_ID =
  "ingredient-class-select-panel-container";

const INGREDIENT_SELECT_PANEL_WRAPPER_ID =
  "ingredient-class-select-wrapper-panel";

const INGREDIENT_SELECT_PANEL_ID = "ingredient-class-select-panel";

const INGREDIENT_SELECT_CONFRIM_BUTTON_ID =
  "ingredient-select-confrim-button-id";

const INGREDIENT_SELECT_CANCEL_BUTTON_ID = "ingredient-select-cancel-button-id";

const DEFAULT_INGREDIENT_CLASS_BUTTON_CONFIG = {
  label: "成分分类：",
  containerClass: "text",
  labelClass: "",
  id: INGREDIENT_SELECT_BUTTON_ID,
  textId: INGREDIENT_SELECT_BUTTON_TEXT_ID,
  buttonClass: "ingredient-select",
  inputMaxWidth: "130px",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  searchable: false,
  containerClass: "ingredient-select-panel-container",
  id: INGREDIENT_SELECT_PANEL_ID,
  containerId: INGREDIENT_SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
  confirmButtonId: INGREDIENT_SELECT_CONFRIM_BUTTON_ID,
  cancelButtonId: INGREDIENT_SELECT_CANCEL_BUTTON_ID,
};

class IngredientAnalysis extends CustomResizeObserver {
  data = [];
  taste_matching_data = [];
  ingredientMatrixInstance = null;
  computedData = {
    currentYearMonth: "",
    selectedIngredients: [],
    selectedProductType: "",
    ingredientClassOptions: [],
    productTypeOptions: [],
    currentRangeData: [],
  };

  element = {
    $datePicker: document.querySelector("#ingredient-analysis-date-picker"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $ingredientClassSelect: document.querySelector("#ingredientClassSelect"),
    $ingredientMatrixContainer: document.querySelector(
      "#ingredientMatrixContainer"
    ),
  };
  constructor(initData) {
    super();
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
      ...new Set(big_data.map((item) => item["成分分类"])),
    ];
    const productTypeOptions = [
      ...new Set(big_data.map((item) => item["产品类型"])),
    ];
    const initSelectedProductType = productTypeOptions[0];
    const initSelectedIngredients = ingredientClassOptions.includes("果味")
      ? ["果味"]
      : [ingredientClassOptions[0]];

    this.set({
      currentYearMonth: lastDate,
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

    this.ingredientMatrixInstance = window.parent.echarts.init(
      this.element.$ingredientMatrixContainer
    );
  };

  setup() {
    this.renderProductSelect();
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

    this.element.$productTypeSelect.addEventListener(
      "change",
      this.productTypeSelectChangeHandler
    );

    document
      .getElementById(INGREDIENT_SELECT_BUTTON_ID)
      .addEventListener("click", this.ingredientButtonSelectHandler);

    document
      .getElementById(INGREDIENT_SELECT_PANEL_WRAPPER_ID)
      .addEventListener("click", this.ingredientSelectHandler);

    document.addEventListener("click", this.hidePanel);


    super.observe(this.element.$ingredientMatrixContainer, ()=>this.ingredientMatrixInstance.resize()); 

  };

  dateChangeHandler(currentYearMonth) {
    this.set({
      currentYearMonth,
    });

    this.updateCurrentRangeData();
    // 重新渲染
    this.renderMatrix();
  }

  updateCurrentRangeData() {
    const { currentYearMonth, selectedProductType, selectedIngredients } =
      this.get(
        "currentYearMonth",
        "selectedProductType",
        "selectedIngredients"
      );

    const currentRangeData = this.data.filter(
      (item) =>
        item["月份"] === currentYearMonth &&
        selectedIngredients.includes(item["成分分类"]) &&
        selectedProductType === item["产品类型"]
    );
    this.set({
      currentRangeData,
    });
  }

  renderProductSelect() {
    const { productTypeOptions, selectedProductType } = this.get(
      "productTypeOptions",
      "selectedProductType"
    );
    if (productTypeOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(productTypeOptions);
      this.element.$productTypeSelect.innerHTML = null;
      this.element.$productTypeSelect.appendChild(menuFragment);
      this.element.$productTypeSelect.value = selectedProductType;
    }
  }

  renderIngredientSelectButton = () => {
    const { selectedIngredients } = this.get("selectedIngredients");

    this.element.$ingredientClassSelect.innerHTML = `${getSelectButtonConfig({
      ...DEFAULT_INGREDIENT_CLASS_BUTTON_CONFIG,
      value: selectedIngredients,
    })}${getWrapperWithId(INGREDIENT_SELECT_PANEL_WRAPPER_ID)}`;
  };

  renderIngredientSelectPanelComponent = () => {
    const { selectedIngredients, ingredientClassOptions } = this.get(
      "selectedIngredients",
      "ingredientClassOptions"
    );

    const panelWraper = document.getElementById(
      INGREDIENT_SELECT_PANEL_WRAPPER_ID
    );

    panelWraper.innerHTML = `${getMultipleSelectConfig({
      ...DEFAULT_SELECT_PANEl_CONFIG,
      value: selectedIngredients,
      data: getOptionsDataByKeyword(ingredientClassOptions),
    })}`;
    this.element.$ingredientClassSelect.appendChild(panelWraper);
  };

  // 产品类型选择
  productTypeSelectChangeHandler = (e) => {
    this.set({
      selectedProductType: e.target.value,
    });
    // 重新渲染
    this.renderMatrix();
  };

  ingredientButtonSelectHandler = (e) => {
    e.stopPropagation();
    document
      .getElementById(INGREDIENT_SELECT_PANEL_CONTAINER_ID)
      .classList.toggle("hide");
  };

  hidePanel = (event) => {
    let eleClicked = event && event.target;
    const elePanel = document.getElementById(
      INGREDIENT_SELECT_PANEL_CONTAINER_ID
    );
    if (!eleClicked || elePanel.classList.contains("hide")) {
      return;
    }

    if (!elePanel.contains(eleClicked)) {
      elePanel.classList.add("hide");
    }
  };

  // 选择成分分类
  ingredientSelectHandler = (e) => {
    e.stopPropagation();
    if (e.target.id === INGREDIENT_SELECT_CANCEL_BUTTON_ID) {
      document
        .getElementById(INGREDIENT_SELECT_PANEL_CONTAINER_ID)
        .classList.add("hide");
      this.renderIngredientSelectPanelComponent();
    }
    if (e.target.id === INGREDIENT_SELECT_CONFRIM_BUTTON_ID) {
      const { selectedIngredients: currentValue } = this.get(
        "selectedIngredients"
      );

      const optionNodes = document.querySelectorAll(
        `#${INGREDIENT_SELECT_PANEL_ID} .multi-select-checkbox:checked`
      );

      const selectedValue =
        optionNodes.length > 0
          ? Array.from(optionNodes).map((item) => item.dataset.value)
          : [];
      document
        .getElementById(INGREDIENT_SELECT_PANEL_CONTAINER_ID)
        .classList.add("hide");

      if (selectedValue.join() !== currentValue.join()) {
        this.set({
          selectedIngredients: selectedValue,
        });
        // select 组件赋值
        document.getElementById(INGREDIENT_SELECT_BUTTON_TEXT_ID).innerText =
          selectedValue.join();

        // 重新渲染
        this.renderMatrix();
      }
    }
  };

  // 绘制矩阵图
  renderMatrix = () => {
    const {
      currentYearMonth,
      selectedIngredients,
      selectedProductType,
      currentRangeData,
    } = this.get(
      "currentYearMonth",
      "selectedIngredients",
      "selectedProductType",
      "currentRangeData"
    );
    const data = computedIngredientOptions({
      currentYearMonth,
      taste_matching_data: this.taste_matching_data,
      selectedIngredients,
      selectedProductType,
      currentRangeData,
    });    

    const options = getScatterOptions({ data });

    this.ingredientMatrixInstance.setOption(options);
  };
}
