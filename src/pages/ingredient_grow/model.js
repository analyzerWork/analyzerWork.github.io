const SELECT_BUTTON_ID = "brand-track-select-button";

const SELECT_BUTTON_TEXT_ID = "brand-track-select-button-text";

const SELECT_PANEL_CONTAINER_ID = "brand-track-select-panel-container";

const SELECT_PANEL_ID = "brand-track-select-panel";

const SELECT_PANEL_SEARCH_INPUT_ID = "brand-track-select-panel-search-input";

const DEFAULT_SELECT_BUTTON_CONFIG = {
  label: "选择品牌：",
  constainerClass: "text",
  labelClass: "",
  id: SELECT_BUTTON_ID,
  textId: SELECT_BUTTON_TEXT_ID,
  buttonClass: "brand-select",
};

const DEFAULT_SELECT_PANEl_CONFIG = {
  searchable: true,
  containerClass: "brand-select-panel-container",
  id: SELECT_PANEL_ID,
  searchInputId: SELECT_PANEL_SEARCH_INPUT_ID,
  containerId: SELECT_PANEL_CONTAINER_ID,
  maxLength: 20,
};

const { setOptionConfig } = window.parent.echartsVariables;

const CURRENT_YEAR = 2026;

const CURRENT_MONTH = 4;

const MONTH_LIST = Array.from({ length: 12 }, (_, index) => 12 - index);

const FIRST_HALF = "春夏(当年3月至8月)";

const FIRST_HALF_VALUE = "firstHalf";

const SECOND_HALF = "秋冬(当年9月至次年2月)";

const SECOND_HALF_VALUE = "secondHalf";

const YoY_COMPARE = [{ value: "yoy", text: "去年同期(同比)" }];

const MoM_COMPARE = [{ value: "mom", text: "上月(环比)" }];

class IngredientGrow extends CustomResizeObserver {
  data = [];

  computedData = {
    currentYear: CURRENT_YEAR,
    yearList: [],
    dateList: [],
    selectedDate: "",
    selectedCompared: "",
    comparedList: [],
    startDateIndex: 0,
    endDateIndex: 0,
    currentRangeData: [],
  };

  element = {
    $yearSelect: document.querySelector("#yearSelect"),
    $dateSelect: document.querySelector("#dateSelect"),
    $comparedSelect: document.querySelector("#comparedSelect"),
    $pageLoading: document.querySelector("#pageLoading"),
  };
  constructor(initData) {
    super();
    this.init(initData);
    this.setup();
    this.bind();
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
    this.element.$yearSelect.addEventListener("change", function () {
      instance.yearChangeHandler(this.value);
    });

    this.element.$dateSelect.addEventListener("change", function () {
      instance.dateChangeHandler(this.value);
    });

    this.element.$comparedSelect.addEventListener("change", function () {
      instance.comparedChangeHandler(this.value);
    });
  };

  hasFirstHalf(year) {
    return year < CURRENT_YEAR || (year === CURRENT_YEAR && CURRENT_MONTH >= 8);
  }

  hasSecondHalf(year) {
    return (
      year < CURRENT_YEAR - 1 ||
      (year === CURRENT_YEAR - 1 && CURRENT_MONTH >= 2)
    );
  }

  computeDateList = (year) => {
    return []
      .concat(
        this.hasSecondHalf(year)
          ? [{ value: SECOND_HALF_VALUE, text: SECOND_HALF }]
          : []
      )
      .concat(
        this.hasFirstHalf(year)
          ? [{ value: FIRST_HALF_VALUE, text: FIRST_HALF }]
          : []
      )
      .concat(
        MONTH_LIST.filter((month) => month <= CURRENT_MONTH).map((item) => ({
          value: `${item}`.padStart(2, 0),
          text: `${item}月`,
        }))
      );
  };

  isHalfYear(date) {
    return date === FIRST_HALF_VALUE || date === SECOND_HALF_VALUE;
  }

  computeComparedList = (date) => {
    return this.isHalfYear(date)
      ? YoY_COMPARE
      : YoY_COMPARE.concat(MoM_COMPARE);
  };

  computeDataRangeIndex = (date) => {
    let startDateIndex;
    let endDateIndex;
    if (date === SECOND_HALF_VALUE) {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${this.currentYear}-09`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${this.currentYear + 1}-02`
      );
    } else if (date === FIRST_HALF_VALUE) {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${this.currentYear}-03`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${this.currentYear}-08`
      );
    } else {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${this.currentYear}-${date}`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${this.currentYear}-${date}`
      );
    }

    return {
      startDateIndex,
      endDateIndex,
    };
  };

  init = (initData) => {
    this.data = initData;
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const yearRange = [...new Set(dateRange.map((date) => date.split("-")[0]))];

    const currentYear = yearRange[yearRange.length - 1];

    const dateList = this.computeDateList(Number(currentYear));

    const selectedDate = dateList[0].value;

    const comparedList = this.computeComparedList(selectedDate);

    const { startDateIndex, endDateIndex } =
      this.computeDataRangeIndex(selectedDate);

    this.set({
      currentYear,
      yearList: yearRange,
      startDateIndex,
      endDateIndex,
      dateList,
      selectedDate,
      comparedList,
      selectedCompared: comparedList[0].value,
    });

    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
    this.renderHeader();
  }

  renderHeader = () => {
    this.renderYearSelect();
    this.renderDateSelect();
    this.renderComparedSelect();
  };

  renderYearSelect = () => {
    const { yearList, currentYear } = this.get("currentYear", "yearList");
    if (yearList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(yearList);
      this.element.$yearSelect.innerHTML = null;
      this.element.$yearSelect.appendChild(menuFragment);
      this.element.$yearSelect.value = currentYear;
    }
  };

  renderDateSelect = () => {
    const { dateList, selectedDate } = this.get("selectedDate", "dateList");
    if (dateList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(dateList, true);
      this.element.$dateSelect.innerHTML = null;
      this.element.$dateSelect.appendChild(menuFragment);
      this.element.$dateSelect.value = selectedDate;
    }
  };

  renderComparedSelect = () => {
    const { comparedList, selectedCompared } = this.get(
      "selectedCompared",
      "comparedList"
    );
    const menuFragment = computedMenuOptionsFragment(comparedList, true);
    this.element.$comparedSelect.innerHTML = null;
    this.element.$comparedSelect.appendChild(menuFragment);
    this.element.$comparedSelect.value = selectedCompared;
  };

  yearChangeHandler(value) {
    const { selectedDate } = this.get("selectedDate");

    const dateList = this.computeDateList(Number(value));

    const dateValueList = dateList.map((date) => date.value);

    const currentSelectedDate = dateValueList.includes(selectedDate)
      ? selectedDate
      : dateList[0].value;

    this.set({
      dateList,
      currentYear: value,
      selectedDate: currentSelectedDate,
    });

    // 重新渲染
    this.renderDateSelect();
  }

  dateChangeHandler(value) {
    const comparedList = this.computeComparedList(value);

    const currentComparedVDate = comparedList[0].value;

    this.set({
      comparedList,
      selectedDate: value,
      selectedCompared: currentComparedVDate,
    });

    // 重新渲染
    this.renderComparedSelect();
  }

  comparedChangeHandler(value) {
    this.set({
      selectedCompared: value,
    });
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
}
