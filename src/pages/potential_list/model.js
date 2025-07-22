const { setOptionConfig } = window.parent.echartsVariables;

class PotentialIngredientList {
  data = [];
  dateRange = [];
  potentialListInstance = null;
  bigProductTypeOptions = ["茶饮", "咖啡"];
  computedData = {
    previousData: [],
    startDateIndex: 0,
    endDateIndex: 0,
    currentRangeData: [],
    bigProductTypeValue: "茶饮",
    selectedIngredientClass: '',
  };

  element = {
    $datePicker: document.querySelector("#potential-ingredient-date-picker"),
    $bigProductTypeSelect: document.querySelector("#bigProductTypeSelect"),
    $potentialIngredientSelect: document.querySelector("#potentialIngredientSelect"),
    $potentialListSection: document.querySelector("#potentialListSection"),
    $potentialList: document.querySelector("#potentialList"),
    $potentialListTable: document.querySelector("#potentialListTable"),
    $potentialListTbody: document.querySelector("#potentialListTbody"),
    $emptySection: document.querySelector("#emptySection"),
    $pageLoading: document.querySelector("#pageLoading"),
    $potentialListLoading: document.querySelector("#potentialListLoading"),
  };
  constructor(initData) {
    this.init(initData);
    this.bind();
    this.setup();
  }

  init = (initData) => {
    this.data = initData;

    const dateRange = (this.dateRange = [
      ...new Set(this.data.map((item) => item["月份"])),
    ]);
    const lastDate = dateRange[dateRange.length - 1];
    const startDate = dateRange[dateRange.length - 6];
    this.element.$datePicker.value = `${startDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);

    this.set({
      currentRangeData: this.data.slice(startDateIndex, endDateIndex),
      startDateIndex,
      endDateIndex,
      previousData: this.data.slice(0, startDateIndex),
    });

    this.potentialListInstance = window.parent.echarts.init(
      this.element.$potentialList
    );

    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
    this.renderHeaderSelect();
    this.renderPotentialList();
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

    this.element.$bigProductTypeSelect.addEventListener(
      "change",
      this.bigProductTypeSelectChangeHandler
    );

    this.element.$potentialIngredientSelect.addEventListener(
      "change",
      this.potentialIngredientSelectChangeHandler
    );
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

    // 所选时间段内可能没有当前的成分分类，所以要重新计算
    this.renderHeaderSelect(); 

    this.renderPotentialList();
  }

  renderHeaderSelect() {
    const { bigProductTypeValue, startDateIndex,endDateIndex } = this.get(
      "bigProductTypeValue",
      "startDateIndex",
      "endDateIndex"
    );
    if (this.bigProductTypeOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(
        this.bigProductTypeOptions
      );
      this.element.$bigProductTypeSelect.innerHTML = null;
      this.element.$bigProductTypeSelect.appendChild(menuFragment);
      this.element.$bigProductTypeSelect.value = bigProductTypeValue;
    }

    const currentBigProductTypeData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex,
      endDateIndex,
      bigProductTypeValue,
    });
    const previousDataBigProductTypeData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex:0,
      endDateIndex:startDateIndex,
      bigProductTypeValue,
    });

    const ingredientClassOptions = [...new Set(currentBigProductTypeData.map((item)=>item[`成分分类-${bigProductTypeValue}`]))];
    const ingredientClassMenuFragment = computedMenuOptionsFragment(
      ingredientClassOptions
    );
    this.element.$potentialIngredientSelect.innerHTML = null;
    this.element.$potentialIngredientSelect.appendChild(ingredientClassMenuFragment);
    const selectedIngredientClass= ingredientClassOptions[0] || "";
    this.element.$potentialIngredientSelect.value = selectedIngredientClass;

    this.set({
      selectedIngredientClass,
      currentRangeData: currentBigProductTypeData.filter(item => item[`成分分类-${bigProductTypeValue}`] === selectedIngredientClass),
      previousData: previousDataBigProductTypeData.filter(item => item[`成分分类-${bigProductTypeValue}`] === selectedIngredientClass)
    })

  }

  // 产品大类选择
  bigProductTypeSelectChangeHandler = (e) => {
    this.set({
      bigProductTypeValue: e.target.value,
    });

    this.renderHeaderSelect();
  
    this.renderPotentialList();
  };

  potentialIngredientSelectChangeHandler = (e) => {
    const selectedIngredientClass= e.target.value || '';

    const { bigProductTypeValue, startDateIndex,endDateIndex } = this.get(
      "bigProductTypeValue",
      "startDateIndex",
      "endDateIndex"
    );
    const currentBigProductTypeData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex,
      endDateIndex,
      bigProductTypeValue,
    });
    const previousDataBigProductTypeData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex:0,
      endDateIndex:startDateIndex,
      bigProductTypeValue,
    });

    this.set({
      selectedIngredientClass,
      currentRangeData: currentBigProductTypeData.filter(item => item[`成分分类-${bigProductTypeValue}`] === selectedIngredientClass),
      previousData: previousDataBigProductTypeData.filter(item => item[`成分分类-${bigProductTypeValue}`] === selectedIngredientClass)
    });

    this.renderPotentialList();
  };

  renderPotentialList = () => {
    this.element.$potentialListLoading.classList.remove("hide");

    this.element.$potentialListTbody.innerHTML = null;

    const sectionEle = this.element.$potentialListSection;

    const { currentRangeData, previousData } = this.get(
      "currentRangeData",
      "previousData"
    );

    const emptySection = document.querySelector(
      "#potentialListSection .empty-content"
    );
    if (emptySection) {
      sectionEle.removeChild(emptySection);
    }

    if (currentRangeData.length === 0) {
      sectionEle.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
    } else {
      const potentialData = computedPotentialData(
        currentRangeData,
        previousData
      );

      const delay =
        potentialData.length < 10
          ? 1000
          : (Math.random() * 2 + 1).toFixed(2) * 1000;
      

      setTimeout(() => {
        if (potentialData.length === 0) {
          const tr = document.createElement('tr');
          const td =  document.createElement('td');
          td.appendChild(this.element.$emptySection.content.cloneNode(true))
          td.colSpan = 4
          tr.appendChild(td)
          this.element.$potentialListTbody.appendChild(
            tr
          );
        } else {
          const tbodyFragment = document.createDocumentFragment();
          potentialData.forEach((item) => {
            const tr = document.createElement("tr");
            item.tableRow.forEach(({ name, value }) => {
              const td = document.createElement("td");
              const digits = name === "score" ? 2 : 0;
              td.innerHTML =
                name === "ingredient"
                  ? value
                  : new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: digits,
                      maximumFractionDigits: digits,
                    }).format(value);
              tr.appendChild(td);
            });
            tbodyFragment.appendChild(tr);
          });
          this.element.$potentialListTbody.appendChild(tbodyFragment);
        }

        this.element.$potentialListLoading.classList.add("hide");
      }, delay);
    }
  };
}
