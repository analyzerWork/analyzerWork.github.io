class TasteMatching {
  data = [];
  firstTreeMapInstance = null;
  secondTreeMapInstance = null;
  hotTopIngredientBarInstance = null;
  computedData = {
    currentData: [],
    currentDateRangeData: [],
    resortDateRangeFirstClassificationIngredient:[], 
    firstDateRangeIngredientCountMap: new Map(),
    activeIcon: "table",
    firstClassification: [],
    firstIngredientCountMap: new Map(),
    firstClassificationIngredientMap: new Map(),
    resortFirstClassificationIngredient: [],
    startIndex: 0,
    endIndex: 0,
    secondClassificationWithCount: [],
    selectedFirstIngredient: "",
    selectedSecondIngredient: "",
    productList: [],
    searchValue: "",
    searchFlag: false,
    firstClassificationMenuList: [],
  };

  element = {
    $datePicker: document.querySelector("#taste-matching-date-picker"),
    $switchIconButton: document.querySelector("#switchIconButton"),
    $tableIcon: document.querySelector("#tableIcon"),
    $chartIcon: document.querySelector("#chartIcon"),
    $hotIngredientSelect: document.querySelector("#hotIngredientSelect"),
    $firstClassSelect: document.querySelector("#firstClassSelect"),
    $firstClassPanel: document.querySelector("#firstClassPanel"),
    $firstClassChart: document.querySelector("#firstClassChart"),
    $secondClassSelect: document.querySelector("#secondClassSelect"),
    $secondClassPanel: document.querySelector("#secondClassPanel"),
    $secondClassChart: document.querySelector("#secondClassChart"),
    $secondPanel: document.querySelector(".second-class-section"),
    $productDialog: document.querySelector("#productDialog"),
    $productTbody: document.querySelector("#productTbody"),
    $productLoading: document.querySelector("#productLoading"),
    $productTable: document.querySelector("#productTable"),
    $ingredintSearch: document.querySelector("#ingredintSearch"),
    $emptySection: document.querySelector("#emptySection"),
    $firstClassSelectWrapper: document.querySelector(
      "#firstClassSelectWrapper"
    ),
    $firstTreeMap: document.querySelector("#firstTreeMap"),
    $secondTreeMap: document.querySelector("#secondTreeMap"),
    $hotTopIngredientBar: document.querySelector("#hotTopIngredientBar"),
  };
  timer = {};
  constructor(initData) {
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    this.element.$datePicker.value = `${lastDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    const startIndex = this.data.findIndex((d) => d["月份"] === lastDate);
    const endIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);
    this.set({
      currentData: this.data.slice(startIndex, endIndex),
      currentDateRangeData: this.data.slice(startIndex, endIndex),
    });
  };

  setup() {
    this.element.$tableIcon.classList.toggle("table-icon-active");
    this.firstTreeMapInstance = window.parent.echarts.init(
      this.element.$firstTreeMap
    );
    this.secondTreeMapInstance = window.parent.echarts.init(
      this.element.$secondTreeMap
    );
    this.hotTopIngredientBarInstance = window.parent.echarts.init(
      this.element.$hotTopIngredientBar
    );
    const shouldRender = this.getFirstClassificationIngredient();
    if (shouldRender) {
      this.renderFirstClassificationIngredient();
      this.renderTopHotIngredient();
    }
    this.element.$productDialog.setParams({
      buttons: [],
    });
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

    this.element.$hotIngredientSelect.addEventListener(
      "change",
      this.hotIngredientSelectChangeHandler
    );

    this.element.$switchIconButton.addEventListener(
      "click",
      this.switchIconClickHandler
    );

    this.element.$firstClassSelect.addEventListener(
      "change",
      this.firstClassSelectChangeHandler
    );

    this.element.$firstClassPanel.addEventListener(
      "click",
      this.firstIngredientClickHandler
    );

    this.element.$secondClassPanel.addEventListener(
      "click",
      this.secondIngredientClickHandler
    );

    this.element.$productDialog.addEventListener(
      "hide",
      this.productDialogHideHandler
    );

    this.element.$productDialog.addEventListener(
      "show",
      this.productDialogShowHandler
    );

    this.element.$ingredintSearch.addEventListener(
      "change",
      this.ingredientSearchChangeHandler
    );

    this.element.$ingredintSearch.addEventListener(
      "keyup",
      this.ingredientOnSearchHandler
    );

    this.firstTreeMapInstance.on("click", (params) =>
      this.treeMapClickHandler(params, "first")
    );
    this.secondTreeMapInstance.on("click", (params) =>
      this.treeMapClickHandler(params, "second")
    );
  };

  reset = () => {
    // 清除已选
    this.set({
      selectedFirstIngredient: "",
      selectedSecondIngredient: "",
    });
  };

  dateChangeHandler(dateRange) {
    const { searchValue } = this.get("searchValue");
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      currentData: this.data.slice(startIndex, endIndex),
      currentDateRangeData: this.data.slice(startIndex, endIndex),
    });
    this.reset();
    // 重新渲染热门top15
    this.renderTopHotIngredient();
    // 隐藏二级
    this.element.$secondPanel.classList.add("hide");
    // 重新渲染一级
    this.handleFirstClassificationRender(searchValue);
    

  }

  renderTopHotIngredient = () => {
    const { currentDateRangeData } = this.get("currentDateRangeData");

    const {
      resortFirstClassificationIngredient, firstIngredientCountMap,
      firstClassificationMenuList,
    } = computedRelatedFirstClassificationData(currentDateRangeData);

    this.set({
      resortDateRangeFirstClassificationIngredient:resortFirstClassificationIngredient, 
      firstDateRangeIngredientCountMap: firstIngredientCountMap,
    });

    const menuFragment = computedMenuOptionsFragment(
      firstClassificationMenuList
    );
    this.element.$hotIngredientSelect.innerHTML = null;
    this.element.$hotIngredientSelect.appendChild(menuFragment);
    this.element.$hotIngredientSelect.value = firstClassificationMenuList[0];

    this.renderHotTopIngredientBarmap(firstClassificationMenuList[0]);
  };

  renderHotTopIngredientBarmap = (firstClassification) => {
    const { resortDateRangeFirstClassificationIngredient, firstDateRangeIngredientCountMap } =
      this.get(
        "resortDateRangeFirstClassificationIngredient",
        "firstDateRangeIngredientCountMap"
      );

    const data = computedHotTopIngredientData(
      resortDateRangeFirstClassificationIngredient,
      firstDateRangeIngredientCountMap,
      firstClassification
    );

    this.hotTopIngredientBarInstance.setOption(getBarOptions({ ...data }));
  };

  productDialogHideHandler = () => {
    this.element.$productLoading.classList.remove("hide");
    this.element.$productTable.classList.add("hide");
    window.clearTimeout(this.timer.productLoading);
  };

  productDialogShowHandler = () => {
    const { productList } = this.get("productList");
    this.timer.productLoading = window.setTimeout(
      () => {
        this.element.$productLoading.classList.add("hide");
        this.element.$productTable.classList.remove("hide");
        if (productList.length > 0) {
          this.element.$productDialog.params.title += `产品示例 (共 ${productList.length} 条)`;
        }
      },
      productList.length > 10 ? 3000 : 1500
    );
  };

  switchIconClickHandler = (e) => {
    const activeEle = e.target;
    if (activeEle.classList.contains("switch-icon")) {
      const { activeIcon, selectedFirstIngredient, selectedSecondIngredient } =
        this.get(
          "activeIcon",
          "selectedFirstIngredient",
          "selectedSecondIngredient"
        );
      if (
        (activeIcon === "table" &&
          activeEle.classList.contains("table-icon")) ||
        (activeIcon === "chart" && activeEle.classList.contains("chart-icon"))
      ) {
        return;
      }

      if (activeEle.classList.contains("table-icon")) {
        this.set({
          activeIcon: "table",
        });
        activeEle.classList.toggle("table-icon-active");
        this.element.$chartIcon.classList.toggle("chart-icon-active");
      }
      if (activeEle.classList.contains("chart-icon")) {
        this.set({
          activeIcon: "chart",
        });
        activeEle.classList.toggle("chart-icon-active");
        this.element.$tableIcon.classList.toggle("table-icon-active");
      }
      this.renderFirstClassificationIngredient();
      if (selectedFirstIngredient) {
        this.renderSecondClassificationIngredient();
      }

      this.element.$firstClassChart.classList.toggle("hide-block");
      this.element.$firstClassPanel.classList.toggle("hide-block");
      this.element.$secondClassChart.classList.toggle("hide-block");
      this.element.$secondClassPanel.classList.toggle("hide-block");
      this.element.$firstClassSelectWrapper.classList.toggle("hide-block");
    }
  };

  // 切换热门top15菜单
  hotIngredientSelectChangeHandler = (e) => {
    this.renderHotTopIngredientBarmap(e.target.value);
  };

  // 切换一级分类下拉菜单
  firstClassSelectChangeHandler = (e) => {
    // 绘制 Treemap
    this.renderIngredientTreemap("first", e.target.value);
  };

  ingredientSearchChangeHandler = (e) => {
    this.set({
      searchValue: e.target.value.trim(),
      searchFlag: false,
    });

    if (e.target.value === "") {
      this.element.$secondPanel.classList.add("hide");
      this.handleFirstClassificationRender("");
    }
  };

  ingredientOnSearchHandler = (e) => {
    const { searchValue, searchFlag } = this.get("searchValue", "searchFlag");

    if (e.key === "Enter" && !searchFlag) {
      this.reset();
      this.element.$secondPanel.classList.add("hide");

      this.handleFirstClassificationRender(searchValue);
    }
  };

  handleFirstClassificationRender = (searchValue) => {
    const shouldRender = this.getFirstClassificationIngredient(searchValue);
    this.element.$firstClassPanel.innerHTML = null;
    if (shouldRender) {
      this.renderFirstClassificationIngredient();
    } else {
      this.element.$firstClassPanel.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
      document.querySelector("#emptyText").innerHTML =
        "暂无搜索结果，请重新输入关键词";
    }

    this.set({ searchFlag: true });
  };
  // 点击一级 Table item
  firstIngredientClickHandler = (e) => {
    const activeEle = e.target;
    // 标签点击
    if (
      activeEle.classList.contains("ingredient-item") &&
      !activeEle.classList.contains("first-ingredient-item-selected")
    ) {
      const currentSelectedItem = document.querySelector(
        ".first-ingredient-item-selected"
      );
      if (currentSelectedItem) {
        currentSelectedItem.classList.replace(
          "first-ingredient-item-selected",
          "first-ingredient-item"
        );
      }
      const nextSelectedItem = document.querySelector(
        `.first-panel [data-name=${activeEle.dataset.name}]`
      );
      if (nextSelectedItem) {
        nextSelectedItem.classList.replace(
          "first-ingredient-item",
          "first-ingredient-item-selected"
        );
        this.set({
          selectedFirstIngredient: activeEle.dataset.name,
        });
        this.handleAfterClickFirstIngredient();
      }
    }
  };

  handleAfterClickFirstIngredient = () => {
    if (this.element.$secondPanel.classList.contains("hide")) {
      this.element.$secondPanel.classList.remove("hide");
    }

    this.getSecondClassificationIngredient();
    this.renderSecondClassificationIngredient();
    this.element.$secondClassPanel.scrollIntoView({ behavior: "smooth" });
  };

  secondIngredientClickHandler = (e) => {
    let activeEle = e.target;
    const isTagChild = ["ingredientText", "ingredientHeat"].includes(
      activeEle.id
    );
    activeEle = isTagChild ? activeEle.parentNode : activeEle;
    // 标签点击
    if (activeEle.classList.contains("ingredient-item")) {
      if (!activeEle.classList.contains("second-ingredient-item-selected")) {
        const currentSelectedItem = document.querySelector(
          ".second-ingredient-item-selected"
        );
        if (currentSelectedItem) {
          currentSelectedItem.classList.replace(
            "second-ingredient-item-selected",
            "second-ingredient-item"
          );
        }
        const nextSelectedItem = document.querySelector(
          `.second-panel [data-name=${activeEle.dataset.name}]`
        );
        if (nextSelectedItem) {
          nextSelectedItem.classList.replace(
            "second-ingredient-item",
            "second-ingredient-item-selected"
          );
          this.set({
            selectedSecondIngredient: activeEle.dataset.name,
          });
          const { selectedFirstIngredient } = this.get(
            "selectedFirstIngredient"
          );

          const productList = this.computeProduction(
            selectedFirstIngredient,
            activeEle.dataset.name
          );

          this.set({
            productList,
          });

          this.loadProductList(productList);
        }
      } else {
        this.element.$productDialog.show();
      }
    }
  };

  getFirstClassificationIngredient = (searchKey) => {
    const { currentData } = this.get("currentData");

    const filterData = !!searchKey
      ? currentData.filter((data) => data["加工后成分"].includes(searchKey))
      : currentData;

    if (filterData.length === 0) {
      return false;
    }

    const {
      firstClassificationIngredientMap,
      firstIngredientCountMap,
      resortFirstClassificationIngredient,
      firstClassificationMenuList,
    } = computedRelatedFirstClassificationData(filterData);

    this.set({
      firstClassificationIngredientMap,
      firstIngredientCountMap,
      resortFirstClassificationIngredient,
      firstClassificationMenuList,
    });

    return true;
  };
  // 点击 TreeMap
  treeMapClickHandler = (params, type) => {
    const { componentType, seriesType, name } = params;
    if (componentType === "series" && seriesType === "treemap") {
      if (type === "first") {
        const { selectedFirstIngredient } = this.get("selectedFirstIngredient");
        // 跟当前选中不同时才继续
        if (selectedFirstIngredient !== name) {
          this.set({
            selectedFirstIngredient: name,
          });
          // 一级 Treemap 设置选中态
          this.renderIngredientTreemap(
            "first",
            this.element.$firstClassSelect.value
          );
          this.handleAfterClickFirstIngredient(name);
        }
      }
      if (type === "second") {
        const {
          secondClassificationWithCount,
          selectedFirstIngredient,
          selectedSecondIngredient,
        } = this.get(
          "secondClassificationWithCount",
          "selectedFirstIngredient",
          "selectedSecondIngredient"
        );
        const secondClassification = secondClassificationWithCount.map(
          ({ classification }) => classification
        );
        // 点击 name 为分类名称时 、跟当前选中一样的成分时 中断
        if (
          secondClassification.includes(name) ||
          selectedSecondIngredient === name
        ) {
          return;
        }

        this.set({
          selectedSecondIngredient: name,
        });
        // 二级 Treemap 设置选中态
        this.renderIngredientTreemap("second");

        const productList = this.computeProduction(
          selectedFirstIngredient,
          name
        );

        this.set({
          productList,
        });

        this.loadProductList(productList);
      }
    }
  };
  // 渲染一级成分
  renderFirstClassificationIngredient = () => {
    const {
      resortFirstClassificationIngredient,
      firstIngredientCountMap,
      activeIcon,
      selectedFirstIngredient,
      firstClassificationMenuList,
    } = this.get(
      "resortFirstClassificationIngredient",
      "firstIngredientCountMap",
      "activeIcon",
      "selectedFirstIngredient",
      "firstClassificationMenuList"
    );

    if (activeIcon === "table") {
      const firstPanelFragment = document.createDocumentFragment();

      for (let {
        classification,
        ingredientList,
      } of resortFirstClassificationIngredient) {
        const panelItemInstance = new PanelItem({
          type: "first",
          classification,
          ingredientList,
          selectedIngredient: selectedFirstIngredient,
          firstIngredientCountMap,
        });
        firstPanelFragment.appendChild(panelItemInstance.produce());
      }
      this.element.$firstClassPanel.replaceChildren(firstPanelFragment);
    }
    if (activeIcon === "chart") {
      // 生成一级成分下拉菜单
      const menuFragment = computedMenuOptionsFragment(
        firstClassificationMenuList
      );
      this.element.$firstClassSelect.innerHTML = null;
      this.element.$firstClassSelect.appendChild(menuFragment);
      this.element.$firstClassSelect.value = firstClassificationMenuList[0];
      this.renderIngredientTreemap("first", firstClassificationMenuList[0]);
    }
  };
  // 渲染 TreeMap
  renderIngredientTreemap = (type, classification) => {
    const {
      firstIngredientCountMap,
      selectedFirstIngredient,
      selectedSecondIngredient,
      resortFirstClassificationIngredient,
      secondClassificationWithCount,
    } = this.get(
      "firstIngredientCountMap",
      "selectedFirstIngredient",
      "selectedSecondIngredient",
      "resortFirstClassificationIngredient",
      "secondClassificationWithCount"
    );

    if (type === "first") {
      const data = computedFirstClassificationIngredientTreeData(
        resortFirstClassificationIngredient,
        classification,
        firstIngredientCountMap
      );

      this.firstTreeMapInstance.setOption(
        getTreemapOption("first", data, selectedFirstIngredient)
      );
    }
    if (type === "second") {
      const data = computedSecondClassificationIngredientTreeData(
        secondClassificationWithCount
      );

      this.secondTreeMapInstance.setOption(
        getTreemapOption("second", data, selectedSecondIngredient)
      );
    }
  };

  getSecondClassificationIngredient = () => {
    const { currentData, selectedFirstIngredient } = this.get(
      "currentData",
      "selectedFirstIngredient"
    );
    const uniqueProductBrandIngredientList = [
      ...new Set(
        currentData
          .filter((data) => data["加工后成分"] === selectedFirstIngredient)
          .map((item) => item["品牌-产品名称-原料构成"])
      ),
    ];

    // 二级成分:出现次数映射关系
    const secondIngredientCountMap = new Map();

    // 计算二级成分:出现次数映射关系
    for (let item of uniqueProductBrandIngredientList) {
      // 获取品牌、产品名称、原料构成对应的二级成分
      const secondIngredientList = currentData
        .filter((data) => data["品牌-产品名称-原料构成"] === item)
        .map((data) => data["加工后成分"]);

      // 排除一级成分后的二级成分
      const omitFirstSecondIngredientList = secondIngredientList.filter(
        (ingredient) => ingredient !== selectedFirstIngredient
      );

      // 统计二级成分出现次数
      for (let ingredient of omitFirstSecondIngredientList) {
        if (secondIngredientCountMap.has(ingredient)) {
          secondIngredientCountMap.set(
            ingredient,
            secondIngredientCountMap.get(ingredient) + 1
          );
        } else {
          secondIngredientCountMap.set(ingredient, 1);
        }
      }
    }

    // 获取二级创新成分分类:二级创新成分映射关系
    const secondClassificationIngredientListMap = new Map();

    for (let [ingredient] of secondIngredientCountMap.entries()) {
      // 获取二级成分对应的二级创新成分分类
      const secondClassificationList = currentData
        .filter((data) => data["加工后成分"] === ingredient)
        .map((data) => data["成分分类"]);
      const [secondClassification] = secondClassificationList;

      if (secondClassificationIngredientListMap.has(secondClassification)) {
        secondClassificationIngredientListMap.set(
          secondClassification,
          secondClassificationIngredientListMap
            .get(secondClassification)
            .concat(ingredient)
        );
      } else {
        secondClassificationIngredientListMap.set(secondClassification, [
          ingredient,
        ]);
      }
    }

    const resortSecondClassificationIngredient =
      computeResortClassificationIngredient(
        secondClassificationIngredientListMap
      );

    const secondClassificationWithCount =
      computedClassificationIngredientListTopN(
        resortSecondClassificationIngredient,
        secondIngredientCountMap,
        10
      );

    this.set({
      secondClassificationWithCount,
    });
  };

  // 渲染二级成分
  renderSecondClassificationIngredient = () => {
    const {
      secondClassificationWithCount,
      selectedSecondIngredient,
      activeIcon,
    } = this.get(
      "secondClassificationWithCount",
      "selectedSecondIngredient",
      "activeIcon"
    );

    if (activeIcon === "table") {
      const secondPanelFragment = document.createDocumentFragment();

      for (let {
        classification,
        ingredientListWithCount,
      } of secondClassificationWithCount) {
        const panelItemInstance = new PanelItem({
          type: "second",
          classification,
          ingredientList: ingredientListWithCount,
          selectedIngredient: selectedSecondIngredient,
        });
        secondPanelFragment.appendChild(panelItemInstance.produce());
      }
      this.element.$secondClassPanel.replaceChildren(secondPanelFragment);
    }
    if (activeIcon === "chart") {
      this.renderIngredientTreemap("second");
    }
  };

  computeProduction = (firstIngredient, secondIngredient) => {
    const { currentData } = this.get("currentData");
    const firstIngredientList = currentData
      .filter((data) => data["加工后成分"] === firstIngredient)
      .map((data) => data["品牌-产品名称-原料构成"]);
    const secondIngredientList = currentData
      .filter((data) => data["加工后成分"] === secondIngredient)
      .map((data) => data["品牌-产品名称-原料构成"]);
    const intersectionList = firstIngredientList.filter((item) =>
      secondIngredientList.includes(item)
    );

    return [...new Set(intersectionList)];
  };

  loadProductList = (productList) => {
    const { selectedFirstIngredient, selectedSecondIngredient } = this.get(
      "selectedFirstIngredient",
      "selectedSecondIngredient"
    );
    this.element.$productTbody.innerHTML = null;
    if (productList.length === 0) {
      this.element.$productTbody.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
      document.querySelector("#emptyText").innerHTML = "暂无示例结果";
    } else {
      const tbodyFragment = document.createDocumentFragment();
      productList.forEach((item) => {
        const tr = document.createElement("tr");
        item.split("-").forEach((value) => {
          const td = document.createElement("td");
          td.innerHTML = value;
          tr.appendChild(td);
        });
        tbodyFragment.appendChild(tr);
      });
      this.element.$productDialog.params.title = `现制饮品搭配 <span class="has-selected-ingredient">${selectedFirstIngredient} & ${selectedSecondIngredient}</span> `;
      this.element.$productTbody.appendChild(tbodyFragment);
    }

    this.element.$productDialog.show();
  };
}

class PanelItem {
  constructor({
    type,
    classification,
    ingredientList,
    selectedIngredient,
    firstIngredientCountMap,
  }) {
    this.type = type;
    this.classification = classification;
    this.ingredientList = ingredientList;
    this.selectedIngredient = selectedIngredient;
    this.firstIngredientCountMap = firstIngredientCountMap;
  }

  produce = () => {
    const { type, classification, ingredientList, selectedIngredient } = this;
    const panelEle = document.createElement("div");
    panelEle.className = `panel ${type}-panel ${type}-panel-${classification}`;
    panelEle.innerHTML = `<div class='pannel-title-container'>
        <div class='panel-title ${type}-panel-title'>${classification}</div>
    
        </div>`;
    const ingredientWraper = document.createElement("div");
    ingredientWraper.className = `ingredient-wrapper ${type}-ingredient-wrapper`;
    const panelFragment = document.createDocumentFragment();
    if (type === "first") {
      ingredientList.forEach((ingredient) => {
        const ingredientItem = document.createElement("div");
        ingredientItem.dataset.name = ingredient;
        ingredientItem.className = `ingredient-item ${
          selectedIngredient === ingredient
            ? `${type}-ingredient-item-selected`
            : `${type}-ingredient-item`
        }`;
        ingredientItem.innerHTML = `${ingredient} | ${this.firstIngredientCountMap.get(
          ingredient
        )}`;
        panelFragment.appendChild(ingredientItem);
      });
    } else if (type === "second") {
      ingredientList.forEach(({ ingredient, count }) => {
        const ingredientItem = document.createElement("div");
        ingredientItem.dataset.name = ingredient;
        ingredientItem.className = `ingredient-item ${
          selectedIngredient === ingredient
            ? `${type}-ingredient-item-selected`
            : `${type}-ingredient-item`
        }`;
        ingredientItem.innerHTML = `<span id="ingredientText" >${ingredient}</span> <span id="ingredientHeat">${count}°</span>`;
        panelFragment.appendChild(ingredientItem);
      });
    }

    ingredientWraper.appendChild(panelFragment);
    panelEle.appendChild(ingredientWraper);

    return panelEle;
  };
}
