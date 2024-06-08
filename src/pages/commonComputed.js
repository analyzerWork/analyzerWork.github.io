const SELECT_ALL = "全部";

const classificationPriorityMap = new Map([
  ["果味", 6],
  ["茶底", 5],
  ["花香", 4],
  ["其他", 3],
  ["乳基底", 2],
  ["小料", 1],
]);

const COFFICE_LIST = ['果味','茶底','花香','乳基底','谷物草本','烘焙','可可坚果']

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

  return bigProductTypeValue ==='咖啡' ? resortClassificationIngredient.filter((item)=> COFFICE_LIST.includes(item.classification)): resortClassificationIngredient;
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

const computedRelatedFirstClassificationData = (data,bigProductTypeValue) => {
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
    firstClassificationMenuList: bigProductTypeValue === '咖啡' ? firstClassificationMenuList.filter((item)=> COFFICE_LIST.includes(item)): firstClassificationMenuList,
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

const computedMenuOptionsFragment = (list) => {
  const menuFragment = document.createDocumentFragment();

  list.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.text = item;

    menuFragment.appendChild(option);
  });

  return menuFragment;
};
