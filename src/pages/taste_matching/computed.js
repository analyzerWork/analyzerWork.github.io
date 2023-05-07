const classificationPriorityMap = new Map([
  ["果味", 6],
  ["茶底", 5],
  ["花香", 4],
  ["其他口味", 3],
  ["乳基底", 2],
  ["小料", 1],
]);


const computeResortClassificationIngredient = (
  classificationIngredientMap,
  type
) => {
  const classificationIngredientArray = [
    ...classificationIngredientMap,
  ].map(([classification, ingredientList]) => ({
    classification,
    ingredientList,
    priority: classificationPriorityMap.get(classification),
  }));

  const sortClassificationIngredient = classificationIngredientArray
    .sort((a, b) => b.priority - a.priority)
    
  const resortClassificationIngredient = type === "first" ? sortClassificationIngredient.filter(({ classification }) => classification !== "小料") : sortClassificationIngredient;

  return resortClassificationIngredient;
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

const computedFirstClassificationIngredientTreeData = (classificationIngredientList,selectClassification,firstIngredientCountMap) => {
    const firstClassificationIngredient= classificationIngredientList.find(({classification})=>classification === selectClassification);
    if (firstClassificationIngredient) {
        return firstClassificationIngredient.ingredientList.map((ingredient) => ({
            name: ingredient,
            value: firstIngredientCountMap.get(ingredient)
        }))
    }
}
