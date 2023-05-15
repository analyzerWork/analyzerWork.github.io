const classificationPriorityMap = new Map([
  ["果味", 6],
  ["茶底", 5],
  ["花香", 4],
  ["其他", 3],
  ["乳基底", 2],
  ["小料", 1],
]);

const computeResortClassificationIngredient = (
  classificationIngredientMap,
  type
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

  return resortClassificationIngredient;
};

const computedRelatedFirstClassificationData = (data) => {
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
    const key = item["成分分类"];
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
      "first"
    );

  const firstClassificationMenuList = resortFirstClassificationIngredient.map(
    ({ classification }) => classification
  );

  return {
    firstClassificationIngredientMap,
    firstIngredientCountMap,
    resortFirstClassificationIngredient,
    firstClassificationMenuList,
  };
};

const transClassName = (classname) =>
  typeof classname !== "undefined"
    ? Array.isArray(classname)
      ? classname.join(" ")
      : classname
    : "";

const getSelectButtonConfig = (config) => {
  const {
    label,
    constainerClass = "",
    labelClass,
    id,
    buttonClass,
    value,
    textId,
  } = config;

  return `<div style="display:flex;align-items: center;" class=${constainerClass}>
    <span class="text ${transClassName(labelClass)}">${label}</span>
    <div
      id=${id}
      style="position: relative;"
      class="ui-select-button ${transClassName(buttonClass)}"
    ><span id=${textId} style="display:inline-block;min-width:100px;max-width:200px;overflow:hidden;text-overflow: ellipsis;">${value}</span><i class="ui-select-icon" aria-hidden="true"></i></div>
  </div>`;
};

// 计算 panel 渲染 dom
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
        }" ${option.length >= 10 ? `title=${option}` : ""} data-value=${option}>${option}</div>`
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
// 计算Pannel渲染数据
const getPanelDataByKeyword = (data, keyword) =>
  !keyword
    ? data
    : data
        .map(({ title, options }) => ({
          title,
          options: options.filter((option) => option.includes(keyword)),
        }))
        .filter(({ options }) => options.length > 0);

const geSelectPanelConfig = (config) => {
  const {
    id,
    containerId,
    searchInputId,
    seachable,
    containerClass,
    data = [],
    value,
    maxLength = 10,
  } = config;

  return `
        <div id=${containerId} class="select-panel-container hide ${transClassName(containerClass)}">
          ${
            seachable
              ? `<span class="ui-input ui-input-search">
                <input type="search" placeholder="搜索成分关键字" id=${searchInputId} maxLength=${maxLength} />
                <span class="ui-icon-search cursor-default">搜索</span>
              </span>`
              : null
          }
          <div id=${id} style="display:flex;min-width:100px;margin-block: 12px 0;" >
            ${computedSelectPanelList(data, value)}
          </div>
        </div>
      `;
};
