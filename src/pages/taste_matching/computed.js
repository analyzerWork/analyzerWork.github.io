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
        (prev, next) => prev + next.count,
        0
      );
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

const computedHotTopIngredientData = (
  resortFirstClassificationIngredient,
  firstIngredientCountMap,
  firstClassification
) => {
  const currentData = resortFirstClassificationIngredient.find(
    ({ classification }) => firstClassification === classification
  );
  if (currentData) {
    const topIngredientList = currentData.ingredientList.slice(0, 15);
    return {
      x_data: topIngredientList.map((ingredient) => ingredient),
      y_data: topIngredientList.map((ingredient) =>
        firstIngredientCountMap.get(ingredient)
      ),
    };
  }
};

