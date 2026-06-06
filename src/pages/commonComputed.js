const hasFirstHalf = (year) => {
  return year < CURRENT_YEAR || (year === CURRENT_YEAR && CURRENT_MONTH >= 8);
};

const hasSecondHalf = (year) => {
  return (
    year < CURRENT_YEAR - 1 || (year === CURRENT_YEAR - 1 && CURRENT_MONTH >= 2)
  );
};

const isHalfYear = (date) => {
  return date === FIRST_HALF_VALUE || date === SECOND_HALF_VALUE;
};

const computeComparedList = (date) => {
  return isHalfYear(date) ? YoY_COMPARE : MoM_COMPARE.concat(YoY_COMPARE);
};

const computeDateList = (year) => {
  return []
    .concat(
      hasSecondHalf(year)
        ? [{ value: SECOND_HALF_VALUE, text: SECOND_HALF }]
        : []
    )
    .concat(
      hasFirstHalf(year) ? [{ value: FIRST_HALF_VALUE, text: FIRST_HALF }] : []
    )
    .concat(
      (year === CURRENT_YEAR
        ? MONTH_LIST.filter((month) => month <= CURRENT_MONTH)
        : MONTH_LIST
      ).map((item) => ({
        value: `${item}`.padStart(2, 0),
        text: `${item}月`,
      }))
    );
};

const computeResortClassificationIngredient = (
  classificationIngredientMap,
  type,
  bigProductTypeValue
) => {
  const classificationIngredientArray = [...classificationIngredientMap].map(
    ([classification, ingredientList]) => ({
      classification,
      ingredientList,
      priority: classificationPriorityMap.get(classification),
    })
  );

  const sortClassificationIngredient = classificationIngredientArray.sort(
    (a, b) => b.priority - a.priority
  );

  const resortClassificationIngredient =
    type === "first"
      ? sortClassificationIngredient.filter(
          ({ classification }) => classification !== "小料"
        )
      : sortClassificationIngredient;

  return bigProductTypeValue === "咖啡"
    ? resortClassificationIngredient.filter((item) =>
        COFFICE_LIST.includes(item.classification)
      )
    : resortClassificationIngredient;
};

const computedProductsByBrand = (data) => {
  const monthMap = new Map();

  data.forEach((item) => {
    if (monthMap.has(item["月份"])) {
      const brandProductMap = monthMap.get(item["月份"]);
      const brand = item["品牌"];
      if (brandProductMap.has(brand)) {
        brandProductMap.set(brand, [
          ...brandProductMap.get(brand),
          item["产品名称"],
        ]);
      } else {
        brandProductMap.set(brand, [item["产品名称"]]);
      }
    } else {
      monthMap.set(item["月份"], new Map());
    }
  });

  return monthMap;
};

const computedRelatedFirstClassificationData = (data, bigProductTypeValue) => {
  const firstIngredientCountMap = new Map();

  const firstClassificationIngredientMap = new Map();

  data.forEach((item) => {
    const key = item["加工后成分"];
    if (firstIngredientCountMap.has(key)) {
      firstIngredientCountMap.set(key, firstIngredientCountMap.get(key) + 1);
    } else {
      firstIngredientCountMap.set(key, 1);
    }
  });

  const sortedData = data
    .map((item) => ({
      ...item,
      count: firstIngredientCountMap.get(item["加工后成分"]),
    }))
    .sort((a, b) => b.count - a.count);

  sortedData.forEach((item) => {
    const key = item[`成分分类-${bigProductTypeValue}`];
    const value = item["加工后成分"];
    if (firstClassificationIngredientMap.has(key)) {
      firstClassificationIngredientMap.set(
        key,
        firstClassificationIngredientMap.get(key).concat(value)
      );
    } else {
      firstClassificationIngredientMap.set(key, [value]);
    }
  });

  // 加工后成分去重
  for (let [key, value] of firstClassificationIngredientMap.entries()) {
    firstClassificationIngredientMap.set(key, [...new Set(value)]);
  }

  const resortFirstClassificationIngredient =
    computeResortClassificationIngredient(
      firstClassificationIngredientMap,
      "first",
      bigProductTypeValue
    );

  const firstClassificationMenuList = resortFirstClassificationIngredient.map(
    ({ classification }) => classification
  );

  return {
    firstClassificationIngredientMap,
    firstIngredientCountMap,
    resortFirstClassificationIngredient,
    firstClassificationMenuList:
      bigProductTypeValue === "咖啡"
        ? firstClassificationMenuList.filter((item) =>
            COFFICE_LIST.includes(item)
          )
        : firstClassificationMenuList,
  };
};

const transClassName = (classname) =>
  typeof classname !== "undefined"
    ? Array.isArray(classname)
      ? classname.join(" ")
      : classname
    : "";

const getWrapperWithId = (id) => `<div id=${id}></div>`;

const getSelectButtonConfig = (config) => {
  const {
    label,
    constainerClass = "",
    labelClass,
    id,
    buttonClass,
    value,
    textId,
    inputMinWidth = "100px",
    inputMaxWidth = "200px",
  } = config;

  const finalValue = typeof config.value === "string" ? value : value.join(",");

  return `<div style="display:flex;align-items: center;" class=${constainerClass}>
    <span class="text ${transClassName(labelClass)}">${label}</span>
    <div
      id=${id}
      style="position: relative;"
      class="ui-select-button ${transClassName(buttonClass)}"
    >
    <span id=${textId} style="display:inline-block;white-space:nowrap; min-width:${inputMinWidth};max-width:${inputMaxWidth};overflow:hidden;text-overflow: ellipsis;">${finalValue}</span>
    <i class="ui-select-icon" aria-hidden="true"></i></div>
  </div>`;
};

// 计算 panel 渲染 dom（分组）
const computedSelectPanelList = (data, value) => {
  if (data.length === 0) {
    return "<div>暂无搜索结果</div>";
  }

  const panelListHTML = [];

  data.forEach(({ title, options }) => {
    const panelOptionsHTML = [];
    options.forEach((option) => {
      panelOptionsHTML.push(
        `<div class="select-panel-option ${
          value === option ? "option-active" : ""
        }" ${
          option.length >= 10 ? `title=${option}` : ""
        } data-value=${option}>${option}</div>`
      );
    });
    panelListHTML.push(`<div class="select-panel-item"> 
    <div class="text-title select-panel-item-title">${title}</div> 
    <div class="text select-panel-option-container" >${panelOptionsHTML.join(
      ""
    )}</div>
    </div> `);
  });

  return panelListHTML.join("");
};

// 计算 panel 渲染 dom（不分组）
const computedSelectOptions = (data, value) => {
  if (data.length === 0) {
    return "<div>暂无搜索结果</div>";
  }

  const panelOptionsHTML = [];

  data.forEach((option) => {
    panelOptionsHTML.push(
      `<div class="text select-option ${
        value === option ? "option-active" : ""
      }" ${
        option.length >= 10 ? `title=${option}` : ""
      } data-value=${option}>${option}</div>`
    );
  });

  return panelOptionsHTML.join("");
};

// 计算多选 select 下拉
const computedMultiSelectOptions = (data, values = []) => {
  if (data.length === 0) {
    return "<div>暂无结果</div>";
  }

  const panelOptionsHTML = [];

  data.forEach((option) => {
    panelOptionsHTML.push(
      `<div class="text multi-select-option"  ${
        option.length >= 10 ? `title=${option}` : ""
      }>
      <input class="multi-select-checkbox" type="checkbox" data-value=${option} id=${option}  ${
        values.includes(option) ? "checked" : ""
      } name="checkbox" is="ui-checkbox">
      <label class="multi-select-checkbox-label" for=${option}>${option}</label>
      </div>`
    );
  });

  return panelOptionsHTML.join("");
};

// 计算Pannel渲染数据（分组）
const getPanelDataByKeyword = (data, keyword) =>
  !keyword
    ? data
    : data
        .map(({ title, options }) => ({
          title,
          options: options.filter((option) => option.includes(keyword)),
        }))
        .filter(({ options }) => options.length > 0);

// 计算Pannel渲染数据（不分组）
const getOptionsDataByKeyword = (data, keyword) =>
  !keyword ? data : data.filter((option) => option.includes(keyword));

const getSelectPanelConfig = (config) => {
  const {
    id,
    containerId,
    searchInputId,
    searchable,
    containerClass,
    data = [],
    value,
    maxLength = 10,
    byGroup,
  } = config;

  return `
        <div id=${containerId} class="select-panel-container hide ${transClassName(
    containerClass
  )}">
          ${
            searchable
              ? `<span class="ui-input ui-input-search">
                <input type="search" placeholder="输入关键字搜索" id=${searchInputId} maxLength=${maxLength} />
                <span class="ui-icon-search cursor-default">搜索</span>
              </span>`
              : ""
          }
          <div id=${id} style="display:flex;min-width:100px;margin-block: 12px 0;" class=${
    byGroup ? "select-option-container-group" : "select-option-container"
  } >
            ${
              byGroup
                ? computedSelectPanelList(data, value)
                : computedSelectOptions(data, value)
            }
          </div>
        </div>
      `;
};

const getMultipleSelectConfig = (config) => {
  const {
    id,
    containerId,
    containerClass,
    data = [],
    value,
    searchable,
    maxLength,
    byGroup,
    confirmButtonId,
    cancelButtonId,
  } = config;

  return `
        <div id=${containerId} class="select-panel-container hide ${transClassName(
    containerClass
  )}">
          ${
            searchable
              ? `<span class="ui-input ui-input-search">
                <input type="search" placeholder="输入关键字搜索" id=${searchInputId} maxLength=${maxLength} />
                <span class="ui-icon-search cursor-default">搜索</span>
              </span>`
              : ""
          }
          <div id=${id} style="display:flex;min-width:100px;" class=${
    byGroup ? "" : "select-option-container"
  } >
            ${computedMultiSelectOptions(data, value)}
          </div>
          <div class="multi-select-panel-footer" >
          <button id=${confirmButtonId} class="small-btn" type="button" data-type="primary" is="ui-button">确定</button>
          <button id=${cancelButtonId} type="normal" class="ui-button small-btn">取消</button>
          </div>
        </div>
      `;
};

const computedCurrentDataAndRange = ({
  data,
  startDateIndex,
  endDateIndex,
  bigProductTypeValue,
  brandTypeValue,
  productTypeValue,
}) => {
  const dataSlice = data.slice(startDateIndex, endDateIndex);
  const dataFilterByBigProductType = dataSlice.filter(
    (item) => item["产品大类"] === bigProductTypeValue
  );
  const dataFilterByBrand =
    !brandTypeValue || brandTypeValue[0] === SELECT_ALL
      ? dataFilterByBigProductType
      : dataFilterByBigProductType.filter((item) =>
          brandTypeValue.includes(item["品牌类型"])
        );
  const dataFilterByProduct =
    !productTypeValue || productTypeValue[0] === SELECT_ALL
      ? dataFilterByBrand
      : dataFilterByBrand.filter((item) =>
          productTypeValue.includes(item["产品类型"])
        );

  return dataFilterByProduct;
};

const computeCurrentDataRangeV2 = ({
  data,
  startDateIndex,
  endDateIndex,
  bigProductTypeValue,
  brand,
  productType,
  ingredientClassification,
  options = {},
}) => {
  const { excludeBrand } = options;
  const baseData =
    startDateIndex !== undefined && endDateIndex !== undefined
      ? data.slice(startDateIndex, endDateIndex)
      : data;
  const dataFilterByBigProductType =
    bigProductTypeValue === undefined ||
    bigProductTypeValue === SELECT_ALL_VALUE
      ? baseData
      : baseData.filter((item) => item["产品大类"] === bigProductTypeValue);

  const dataFilterByBrand =
    brand === undefined || brand === SELECT_ALL_VALUE
      ? dataFilterByBigProductType
      : dataFilterByBigProductType.filter((item) =>
          excludeBrand ? item["品牌"] !== brand : item["品牌"] === brand
        );

  const dataFilterByProduct =
    productType === undefined || productType === SELECT_ALL_VALUE
      ? dataFilterByBrand
      : dataFilterByBrand.filter((item) => item["产品类型"] === productType);

  const dataFilterByIngredientClassification =
    ingredientClassification === undefined ||
    ingredientClassification === SELECT_ALL_VALUE
      ? dataFilterByProduct
      : dataFilterByProduct.filter(
          (item) =>
            item[`成分分类-${bigProductTypeValue}`] === ingredientClassification
        );

  return dataFilterByIngredientClassification;
};

const computedMenuOptionsFragment = (list, isObjItem) => {
  const menuFragment = document.createDocumentFragment();

  list.forEach((item) => {
    const option = document.createElement("option");
    option.value = isObjItem ? item.value : item;
    option.text = isObjItem ? item.text : item;

    menuFragment.appendChild(option);
  });

  return menuFragment;
};

function computeCheckboxFragment(list, isObjItem) {
  // 防御性校验
  if (!Array.isArray(list)) return;

  // 1. 创建文档片段（内存中的轻量级 DOM 容器）
  const fragment = document.createDocumentFragment();

  // 2. 遍历规则数组，将节点追加到 Fragment 中（此时不会触发任何页面渲染）
  list.forEach((item) => {
    const labelEl = document.createElement("label");

    const inputEl = document.createElement("input");
    inputEl.setAttribute("is", "ui-checkbox");
    inputEl.type = "checkbox";
    inputEl.value = isObjItem ? item.value : item;

    labelEl.appendChild(inputEl);
    labelEl.append(isObjItem ? item.text : item);

    // 追加到离线容器
    fragment.appendChild(labelEl);
  });

  return fragment;
}

function getProcessedIngredientsStats(data) {
  const countObj = data.reduce((acc, item) => {
    const ingredient = item["加工后成分"];
    if (ingredient) {
      acc[ingredient] = (acc[ingredient] || 0) + 1;
    }
    return acc;
  }, {});

  // 转换为数组并按 count 降序排列
  const resultArray = Object.entries(countObj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // 降序排序

  return resultArray;
}

function getBrandByBigProductType(data, bigProductType, isOptionHasAll) {
  const filteredData =
    bigProductType === SELECT_ALL_VALUE
      ? data
      : data.filter((item) => item["产品大类"] === bigProductType);
  const brandList = [...new Set(filteredData.map((d) => d["品牌"]))];
  const brandOptions = brandList.map((brand) => ({
    text: brand,
    value: brand,
  }));

  return {
    brandOptions: isOptionHasAll
      ? [{ text: SELECT_ALL, value: SELECT_ALL_VALUE }].concat(brandOptions)
      : brandOptions,
    brandList,
  };
}

function getProductType(data, filter, isOptionHasAll) {
  const { bigProductType, brand } = filter;

  const filteredDataByBigProductType =
    bigProductType === undefined || bigProductType === SELECT_ALL_VALUE
      ? data
      : data.filter((item) => item["产品大类"] === bigProductType);

  const filteredDataByBrand =
    brand === undefined || brand === SELECT_ALL_VALUE
      ? filteredDataByBigProductType
      : filteredDataByBigProductType.filter((item) => item["品牌"] === brand);

  const productTypeList = [
    ...new Set(filteredDataByBrand.map((d) => d["产品类型"])),
  ];
  const productTypeOptions = productTypeList.map((productType) => ({
    text: productType,
    value: productType,
  }));

  return {
    productTypeOptions: isOptionHasAll
      ? [{ text: SELECT_ALL, value: SELECT_ALL_VALUE }].concat(
          productTypeOptions
        )
      : productTypeOptions,
    productTypeList,
  };
}

function computeCurrentDataRangeV3(data, year, date) {
  let startDateIndex;
  let endDateIndex;

  if (date === SECOND_HALF_VALUE) {
    startDateIndex = data.findIndex((d) => d["月份"] === `${year}-09`);
    endDateIndex = data.findLastIndex((d) => d["月份"] === `${year + 1}-02`);
  } else if (date === FIRST_HALF_VALUE) {
    startDateIndex = data.findIndex((d) => d["月份"] === `${year}-03`);
    endDateIndex = data.findLastIndex((d) => d["月份"] === `${year}-08`);
  } else {
    startDateIndex = data.findIndex((d) => d["月份"] === `${year}-${date}`);
    endDateIndex = data.findLastIndex((d) => d["月份"] === `${year}-${date}`);
  }

  return {
    startDateIndex,
    endDateIndex,
    dataRange: data.slice(startDateIndex, endDateIndex),
  };
}

/**
 * 计算包含对比时间项的索引
 */
function computeDataRangeIndexV2(data, options) {
  const { currentYear, date, selectedCompared } = options;
  let startDateIndex;
  let endDateIndex;
  let comparedStartDateIndex;
  let comparedEndDateIndex;
  let currentDateStr;
  let comparedDateStr;

  if (date === SECOND_HALF_VALUE) {
    startDateIndex = data.findIndex((d) => d["月份"] === `${currentYear}-09`);
    endDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear + 1}-02`
    );
    comparedStartDateIndex = data.findIndex(
      (d) => d["月份"] === `${currentYear - 1}-09`
    );
    comparedEndDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear}-02`
    );
    currentDateStr = `${currentYear}年${SECOND_SHORT_HALF}`;
    comparedDateStr = `${currentYear - 1}年${SECOND_SHORT_HALF}`;
  } else if (date === FIRST_HALF_VALUE) {
    startDateIndex = data.findIndex(
      (d) => d["月份"] === `${currentYear}-03`
    );
    endDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear}-08`
    );
    comparedStartDateIndex = data.findIndex(
      (d) => d["月份"] === `${currentYear - 1}-03`
    );
    comparedEndDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear - 1}-08`
    );
    currentDateStr = `${currentYear}年${FIRST_SHORT_HALF}`;
    comparedDateStr = `${currentYear - 1}年${FIRST_SHORT_HALF}`;
  } else {
    startDateIndex = data.findIndex(
      (d) => d["月份"] === `${currentYear}-${date}`
    );
    endDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear}-${date}`
    );

    const comparedYearMoM = date === "01" ? currentYear - 1 : currentYear;

    const comparedMonthMoM =
      date === "01" ? "12" : `${date - 1}`.padStart(2, 0);

    const comparedYearYoY = currentYear - 1;

    const comparedMonthYoY = date.padStart(2, 0);

    const comparedYear =
      selectedCompared === YoY_VALUE ? comparedYearYoY : comparedYearMoM;

    const comparedMonth =
      selectedCompared === YoY_VALUE ? comparedMonthYoY : comparedMonthMoM;

    comparedStartDateIndex = data.findIndex(
      (d) => d["月份"] === `${comparedYear}-${comparedMonth}`
    );
    comparedEndDateIndex = data.findLastIndex(
      (d) => d["月份"] === `${currentYear}-${comparedMonth}`
    );
    currentDateStr = `${currentYear}年${date}月`;
    comparedDateStr = `${comparedYear}年${comparedMonth}月`;
  }

  return {
    startDateIndex,
    endDateIndex,
    comparedStartDateIndex,
    comparedEndDateIndex,
    currentDateStr,
    comparedDateStr,
  };
}
