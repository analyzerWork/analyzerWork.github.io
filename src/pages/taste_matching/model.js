class TasteMatching {
  data = [];
  computedData = {
    firstClassification: [],
    firstClassificationIngredientMap: new Map(),
    startIndex: 0,
    endIndex: 0,
    secondIngredientCountMap: new Map(),
    secondClassificationIngredientListMap: new Map(),
  };
  element = {
    $datePicker: document.querySelector("#taste-matching-date-picker"),
    $firstClassPanel: document.querySelector("#firstClassPanel"),
    $secondClassPanel: document.querySelector("#secondClassPanel"),
  };
  constructor(initData) {
    this.init(initData);
    this.bind();
  }

  init = (initData) => {
    this.data = initData;
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    this.element.$datePicker.value = `${lastDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    this.set({
      startIndex: this.data.findIndex((d) => d["月份"] === lastDate),
      endIndex: this.data.findLastIndex((d) => d["月份"] === lastDate),
    });
    this.getFirstClassificationIngredient(0, this.data.length - 1);
    this.renderFirstClassificationIngredient();
  };

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

    this.element.$firstClassPanel.addEventListener(
      "click",
      this.firstIngredientClickHandler
    );
  };

  dateChangeHandler(dateRange) {
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      startIndex: startDateIndex,
      endIndex: endDateIndex,
    });
    this.getFirstClassificationIngredient();
    this.renderFirstClassificationIngredient();
    // 清除二级
  }

  firstIngredientClickHandler = (e) => {
    const activeEle = e.target;
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
        `[data-name=${activeEle.dataset.name}]`
      );
      if (nextSelectedItem) {
        nextSelectedItem.classList.replace(
          "first-ingredient-item",
          "first-ingredient-item-selected"
        );
        this.getSecondClassificationIngredient(activeEle.dataset.name);
      }
    }
  };

  getFirstClassificationIngredient = () => {
    const { startIndex, endIndex } = this.get("startIndex", "endIndex");
    const firstClassification = [
      ...new Set(
        this.data.slice(startIndex, endIndex).map((item) => item["成分分类"])
      ),
    ];
    const firstClassificationIngredientMap = new Map();

    this.data.slice(startIndex, endIndex).forEach((item) => {
      if (firstClassificationIngredientMap.has(item["成分分类"])) {
        firstClassificationIngredientMap.set(
          item["成分分类"],
          firstClassificationIngredientMap
            .get(item["成分分类"])
            .concat(item["加工后成分"])
        );
      } else {
        firstClassificationIngredientMap.set(item["成分分类"], [
          item["加工后成分"],
        ]);
      }
    });

    // 加工后成分去重
    for (let [key, value] of firstClassificationIngredientMap.entries()) {
      firstClassificationIngredientMap.set(key, [...new Set(value)]);
    }

    this.set({
      firstClassification,
      firstClassificationIngredientMap,
    });
  };

  renderFirstClassificationIngredient = (selectedIngredient) => {
    const { firstClassificationIngredientMap } = this.get(
      "firstClassification",
      "firstClassificationIngredientMap"
    );
    const firstPanelFragment = document.createDocumentFragment();
    // '其他口味'的索引
    const firstClassificationIngredientArray = [
      ...firstClassificationIngredientMap,
    ];
    const otherIndex = firstClassificationIngredientArray.findIndex(
      ([key]) => key === "其他口味"
    );
    const resortFirstClassificationIngredient = [
      ...firstClassificationIngredientArray.slice(0, otherIndex),
      ...firstClassificationIngredientArray.slice(otherIndex + 1),
      firstClassificationIngredientArray[otherIndex],
    ];
    for (let [
      classification,
      ingredientList,
    ] of resortFirstClassificationIngredient) {
      const panelItemInstance = new PanelItem({
        type: "first",
        classification,
        ingredientList,
        selectedIngredient,
      });
      firstPanelFragment.appendChild(panelItemInstance.produce());
    }
    this.element.$firstClassPanel.replaceChildren(firstPanelFragment);
  };

  getSecondClassificationIngredient = (currentFirstIngredient) => {
    const { startIndex, endIndex } = this.get("startIndex", "endIndex");

    const currentData = this.data.slice(startIndex, endIndex);
    const uniqueProductBrandIngredientList = [
      ...new Set(currentData.map((item) => item["品牌-产品名称-原料构成"])),
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
        (ingredient) => ingredient !== currentFirstIngredient
      );

      // 统计二级成分出现次数
      for (let ingredient in omitFirstSecondIngredientList) {
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
    const secondClassificationIngredientListMap = new Map(["all"], [[]]);

    for (let [ingredient] of secondIngredientCountMap.entries()) {
      // 获取二级成分对应的二级创新成分分类
      const secondClassificationList = currentData
        .filter((data) => data["加工后成分"] === ingredient)
        .map((data) => data["成分分类"]);
      const [secondClassification] = secondClassificationList;

      secondClassificationIngredientListMap.set(
        "all",
        secondClassificationIngredientListMap.get("all").concat(ingredient)
      );

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

    this.set({
      firstClassification,
      firstClassificationIngredientMap,
    });
  };
}

class PanelItem {
  constructor({ type, classification, ingredientList, selectedIngredient }) {
    this.type = type;
    this.classification = classification;
    this.ingredientList = ingredientList;
    this.selectedIngredient = selectedIngredient;
  }

  produce = () => {
    const { type, classification, ingredientList, selectedIngredient } = this;
    const panelEle = document.createElement("div");
    panelEle.className = `panel ${type}-panel`;
    panelEle.innerHTML = `<div class='panel-title ${type}-panel-title'>${classification}</div>`;
    const ingredientWraper = document.createElement("div");
    ingredientWraper.className = "ingredient-wrapper";
    const panelFragment = document.createDocumentFragment();
    ingredientList.forEach((ingredient) => {
      const ingredientItem = document.createElement("div");
      ingredientItem.dataset.name = ingredient;
      ingredientItem.className = `ingredient-item ${
        selectedIngredient === ingredient
          ? `${type}-ingredient-item-selected`
          : `${type}-ingredient-item`
      }`;
      ingredientItem.innerHTML = ingredient;
      panelFragment.appendChild(ingredientItem);
    });
    ingredientWraper.appendChild(panelFragment);
    panelEle.appendChild(ingredientWraper);

    return panelEle;
  };
}
