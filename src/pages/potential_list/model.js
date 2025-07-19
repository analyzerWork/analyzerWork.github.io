const { setOptionConfig } = window.parent.echartsVariables;

class PotentialIngredientList {
  data = [];
  dateRange = [];
  potentialListInstance = null;
  computedData = {
    previousData: [],
    startDateIndex: 0,
    endDateIndex: 0,
    currentRangeData: [],
  };

  element = {
    $datePicker: document.querySelector("#potential-ingredient-date-picker"),
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
      previousData: this.data.slice(0, startDateIndex),
    });

    this.potentialListInstance = window.parent.echarts.init(
      this.element.$potentialList
    );

    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
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
  };

  dateChangeHandler(dateRange) {
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      currentRangeData: this.data.slice(startDateIndex, endDateIndex),
      previousData: this.data.slice(0, startDateIndex),
    });

    this.renderPotentialList();
  }

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
          this.element.$potentialListTbody.appendChild(
            this.element.$emptySection.content.cloneNode(true)
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
