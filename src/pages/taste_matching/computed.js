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

const computedClassificationIngredientListTopN = (
  resortSecondClassificationIngredient,
  secondIngredientCountMap,
  n
) => {
  return resortSecondClassificationIngredient.map(
    ({ classification, ingredientList }) => ({
      classification,
      ingredientListWithCount: ingredientList
        .map((ingredient) => ({
          ingredient,
          count: secondIngredientCountMap.get(ingredient),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n),
    })
  );
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

const computedFirstClassificationIngredientTreeData = (
  classificationIngredientList,
  selectClassification,
  firstIngredientCountMap
) => {
  const firstClassificationIngredient = classificationIngredientList.find(
    ({ classification }) => classification === selectClassification
  );
  if (firstClassificationIngredient) {
    return firstClassificationIngredient.ingredientList.map((ingredient) => ({
      name: ingredient,
      value: firstIngredientCountMap.get(ingredient),
    }));
  }
};

const computedSecondClassificationIngredientTreeData = (
  secondClassificationWithCount
) => {
  return secondClassificationWithCount.map(
    ({ classification, ingredientListWithCount }) => {
      const total = ingredientListWithCount.reduce(
        (prev, next) => prev + next.count
      ,0);
      return {
        name: classification,
        value: total,
        children: ingredientListWithCount.map(({ count, ingredient }) => ({
          name: ingredient,
          value: count,
        })),
      };
    }
  );
};

const computedHotTopIngredientData = (resortFirstClassificationIngredient,firstIngredientCountMap,firstClassification) => {
  const currentData = resortFirstClassificationIngredient.find(({ classification }) => firstClassification === classification);
  if (currentData) {
    const topIngredientList = currentData.ingredientList.slice(0,15)
    return {
      x_data: topIngredientList.map((ingredient) => ingredient),
      y_data: topIngredientList.map((ingredient) => firstIngredientCountMap.get(ingredient))
    }
  }
}


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

  }
}
