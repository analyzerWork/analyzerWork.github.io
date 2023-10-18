const SELECT_BUTTON_ID = "ingredient-track-select-button";

const SELECT_BUTTON_TEXT_ID = "ingredient-track-select-button-text";

const SELECT_PANEL_CONTAINER_ID = "ingredient-track-select-panel-container";

const SELECT_PANEL_ID = "ingredient-track-select-panel";

const SELECT_PANEL_SEARCH_INPUT_ID =
  "ingredient-track-select-panel-search-input";

const PRODUCT_SELECT_BUTTON_ID = "ingredient-track-product-select-button";

const PRODUCT_SELECT_BUTTON_TEXT_ID =
  "ingredient-track-product-select-button-text";

const PRODUCT_SELECT_PANEL_WRAPPER_ID =
  "ingredient-track-product-select-panel-wrapper-id";

const DEFAULT_SELECT_BUTTON_CONFIG = {
  label: "选择成分：",
  constainerClass: "text",
  labelClass: "",
  id: SELECT_BUTTON_ID,
  textId: SELECT_BUTTON_TEXT_ID,
  buttonClass: "ingredient-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  searchable: true,
  containerClass: "ingredient-select-panel-container",
  id: SELECT_PANEL_ID,
  searchInputId: SELECT_PANEL_SEARCH_INPUT_ID,
  containerId: SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
};

const BASE_PRODUCT_SELECT_BUTTON_CONFIG = {
  labelClass: "",
  buttonClass: "header-select-button",
  constainerClass: "text",
  inputMaxWidth: "170px",
};

const DEFAULT_PRODUCT_SELECT_BUTTON_CONFIG = {
  label: "产品类型：",
  id: PRODUCT_SELECT_BUTTON_ID,
  textId: PRODUCT_SELECT_BUTTON_TEXT_ID,
  ...BASE_PRODUCT_SELECT_BUTTON_CONFIG,
};

const PRODUCT_SELECT_PANEL_ID = "ingredient-track-product-select-panel-id";

const PRODUCT_SELECT_PANEL_CONTAINER_ID =
  "ingredient-track-product-select-panel-container-id";

const PRODUCT_CONFRIM_BUTTON_ID = "ingredient-track-product-confrim-button-id";
const PRODUCT_CANCEL_BUTTON_ID = "ingredient-track-product-cancel-button-id";

const DEFAULT_PRODUCT_SELECT_PANEl_CONFIG = {
  containerClass: "base-multi-select-panel-container",
  id: PRODUCT_SELECT_PANEL_ID,
  containerId: PRODUCT_SELECT_PANEL_CONTAINER_ID,
  confirmButtonId: PRODUCT_CONFRIM_BUTTON_ID,
  cancelButtonId: PRODUCT_CANCEL_BUTTON_ID,
};
const PRODUCT_NAME = '产品名称';
const BRAND_NAME = '品牌';

class IngredientTracking extends CustomResizeObserver{
  data = [];
  productSelectOptions = [];
  classificationIngredientList = [];
  brandTrendInstance = null;
  ingredientDropInstance = null;
  computedData = {
    startDateIndex: 0,
    endDateIndex: 0,
    selectedIngredient: "",
    currentRangeData: [],
    keyword: "",
    productTypeValue: [SELECT_ALL],
  };

  element = {
    $datePicker: document.querySelector("#ingredient-track-date-picker"),
    $ingredientSelectContainer: document.querySelector(
      "#ingredientSelectContainer"
    ),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $productPanelWraper: document.getElementById(
      PRODUCT_SELECT_PANEL_WRAPPER_ID
    ),
    $contentWrapper: document.querySelector("#contentWrapper"),
    $productSection: document.querySelector("#productSection"),
    $brandSection: document.querySelector("#brandSection"),
    $productTrend: document.querySelector("#productTrend"),
    $brandTrend: document.querySelector("#brandTrend"),
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
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);
    const selectedIngredient =
      resortFirstClassificationIngredient[0].ingredientList[0];
    this.set({
      startDateIndex,
      endDateIndex,
      currentRangeData: this.data
        .slice(startDateIndex, endDateIndex)
        .filter((item) => item["加工后成分"] === selectedIngredient),
      selectedIngredient,
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
    this.renderProductSelectComponent();
    this.renderNewProductBrandTrend(PRODUCT_NAME);
    this.renderNewProductBrandTrend(BRAND_NAME);
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
      .addEventListener("click", this.ingredientButtonSelectHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("keyup", this.ingredientSearchHandler);

    document
      .getElementById(SELECT_PANEL_SEARCH_INPUT_ID)
      .addEventListener("input", this.ingredientSearchInputHandler);

    document
      .getElementById(SELECT_PANEL_ID)
      .addEventListener("click", this.ingredientSelectHandler);

    document.addEventListener("click", this.hidePanel);

    document
      .getElementById(PRODUCT_SELECT_BUTTON_ID)
      .addEventListener("click", (e) => {
        e.stopPropagation();
        document
          .getElementById(PRODUCT_SELECT_PANEL_CONTAINER_ID)
          .classList.toggle("hide");
      });

    document
      .getElementById(PRODUCT_SELECT_PANEL_WRAPPER_ID)
      .addEventListener("click", (e) =>
        this.productSelectedHandler(e, PRODUCT_SELECT_BUTTON_ID)
      );

    super.observe(this.element.$contentWrapper, () => {
      this.newProductTrendInstance.resize();
      this.brandTrendInstance.resize();
    });
  };

  reRender = () => {
    this.updateCurrentRangeData();
    // 重新渲染
    this.renderNewProductBrandTrend(PRODUCT_NAME);
    this.renderNewProductBrandTrend(BRAND_NAME);
  };

  dateChangeHandler(dateRange) {
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      startDateIndex,
      endDateIndex,
    });

    this.reRender();
  }

  updateCurrentRangeData() {
    const {
      startDateIndex,
      endDateIndex,
      selectedIngredient,
      productTypeValue,
    } = this.get(
      "startDateIndex",
      "endDateIndex",
      "selectedIngredient",
      "productTypeValue"
    );

    const currentData = computedCurrentDataAndRange(
      this.data,
      startDateIndex,
      endDateIndex,
      null,
      productTypeValue
    );

    this.set({
      currentRangeData: currentData.filter(
        (item) => item["加工后成分"] === selectedIngredient
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

    this.productSelectOptions = [
      ...new Set(this.data.map((item) => item["产品类型"])),
    ];

    this.element.$productTypeSelect.innerHTML = `${getSelectButtonConfig({
      ...DEFAULT_PRODUCT_SELECT_BUTTON_CONFIG,
      value: [SELECT_ALL],
    })}${getWrapperWithId(PRODUCT_SELECT_PANEL_WRAPPER_ID)}`;
  };

  renderSelectPanelComponent = () => {
    const { selectedIngredient } = this.get("selectedIngredient");

    const panelWraper = document.createElement("div");

    panelWraper.innerHTML += `${getSelectPanelConfig({
      ...DEFAULT_SELECT_PANEl_CONFIG,
      value: selectedIngredient,
      data: getPanelDataByKeyword(this.classificationIngredientList),
      byGroup: true,
    })}`;
    document.body.appendChild(panelWraper);
  };

  renderProductSelectComponent = () => {
    const { productTypeValue } = this.get("productTypeValue");
    const panelWraper = document.getElementById(
      PRODUCT_SELECT_PANEL_WRAPPER_ID
    );

    panelWraper.innerHTML = `${getMultipleSelectConfig({
      ...DEFAULT_PRODUCT_SELECT_PANEl_CONFIG,
      value: productTypeValue,
      data: this.productSelectOptions,
    })}`;
    this.element.$productTypeSelect.appendChild(panelWraper);
  };

  ingredientButtonSelectHandler = (e) => {
    e.stopPropagation();
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
    [SELECT_PANEL_CONTAINER_ID,PRODUCT_SELECT_PANEL_CONTAINER_ID].forEach(id => {
      const elePanel = document.getElementById(id);
      if (!eleClicked || elePanel.classList.contains("hide")) {
        return;
      }
  
      if (!elePanel.contains(eleClicked)) {
        elePanel.classList.add("hide");
      }
      
    })
    
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
      this.set({
        selectedIngredient: value,
      });

      // 重新渲染panelList
      const data = getPanelDataByKeyword(
        this.classificationIngredientList,
        keyword
      );
      document.getElementById(SELECT_PANEL_ID).innerHTML =
        computedSelectPanelList(data, value);
      this.reRender();
    }
  };

  productSelectedHandler = (e) => {
    e.stopPropagation();

    if (e.target.id === PRODUCT_CANCEL_BUTTON_ID) {
      document
        .getElementById(PRODUCT_SELECT_PANEL_CONTAINER_ID)
        .classList.add("hide");
      this.renderProductSelectComponent();
    }
    if (e.target.id === PRODUCT_CONFRIM_BUTTON_ID) {
      const { productTypeValue } = this.get("productTypeValue");

      const optionNodes = document.querySelectorAll(
        `#${PRODUCT_SELECT_PANEL_ID} .multi-select-checkbox:checked`
      );

      const selectedValue =
        optionNodes.length > 0
          ? Array.from(optionNodes).map((item) => item.dataset.value)
          : [SELECT_ALL];
      document
        .getElementById(PRODUCT_SELECT_PANEL_CONTAINER_ID)
        .classList.add("hide");

      if (selectedValue.join() !== productTypeValue.join()) {
        this.set({
          productTypeValue: selectedValue,
        });
        // select 组件赋值
        document.getElementById(PRODUCT_SELECT_BUTTON_TEXT_ID).innerText =
          selectedValue.join();

        this.reRender();
      }
    }
  };

  // 绘制数量趋势
  renderNewProductBrandTrend = (name) => {
    const isBrand = name === BRAND_NAME;
    const emptySectionId = isBrand ? 'brandSection' : 'productSection';
    const sectionEle = isBrand ? this.element.$brandSection : this.element.$productSection; 
    const chartEle = isBrand ? this.element.$brandTrend : this.element.$productTrend;
    const chartInstance = isBrand ? this.brandTrendInstance : this.newProductTrendInstance;
    const { currentRangeData } = this.get("currentRangeData");

    const emptySection = document.querySelector(
      `#${emptySectionId} .empty-content`
    );
    if (emptySection) {
      sectionEle.removeChild(emptySection);
    }

    if (currentRangeData.length === 0) {
      chartEle.classList.add("hide");
      sectionEle.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
    } else {
      chartEle.classList.remove("hide");

      const trendData = computedTrendData(currentRangeData, name);
      chartInstance.setOption(getTrendOptions({ ...trendData }));
    }
  };
}
