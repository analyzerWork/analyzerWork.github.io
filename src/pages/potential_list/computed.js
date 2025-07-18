const computeTotalCount = (dateRange, currentRangeData, name) =>
  dateRange
    .map((date) => {
      const uniqueData = [
        ...new Set(
          currentRangeData
            .filter((item) => item["月份"] === date)
            .map((item) => item[name])
        ),
      ];

      if (name === "品牌") {
        return uniqueData.length;
      }

      if (name === "门店数") {
        return uniqueData.reduce((sum, storeCount) => sum + storeCount, 0);
      }
    })
    .reduce((sum, monthCount) => sum + monthCount, 0);

const computeIngredientCount = (
  dateRange,
  currentRangeData,
  ingredient,
  name
) =>
  dateRange
    .map((date) => {
      const currentMonthData = currentRangeData.filter(
        (item) => item["月份"] === date && item["加工后成分"] === ingredient
      );

      const uniqueList = [
        ...new Set(currentMonthData.map((item) => item[name])),
      ];
      if (name === "品牌") {
        return uniqueList.length;
      }

      if (name === "门店数") {
        return uniqueList.reduce((sum, storeCount) => sum + storeCount, 0);
      }
    })
    .reduce((sum, monthCount) => sum + monthCount, 0);

const computedPotentialData = (currentRangeData, previousData) => {
  const previousIngredients = [
    ...new Set(previousData.map((item) => item["加工后成分"])),
  ];
  const currentRangeIngredients = [
    ...new Set(currentRangeData.map((item) => item["加工后成分"])),
  ];

  const currentRangeNewIngredients = currentRangeIngredients.filter(
    (ingredient) => !previousIngredients.includes(ingredient)
  );

  const dateRange = [...new Set(currentRangeData.map((item) => item["月份"]))];

  // 计算 score = (统计周期内的) 上新该成分的品牌数 / 监测总品牌数 * 0.5 + 上新该成分的品牌门店数 / 监测品牌总门店数 * 0.5

  // 监测总品牌数
  const totalCurrentRangeBrands = computeTotalCount(
    dateRange,
    currentRangeData,
    "品牌"
  );

  // 监测品牌总门店数
  const totalCurrentRangeStores = computeTotalCount(
    dateRange,
    currentRangeData,
    "门店数"
  );

  // 上新该成分的品牌数
  const ingredientCountList = currentRangeNewIngredients.map((ingredient) => {
    const brandCount = computeIngredientCount(
      dateRange,
      currentRangeData,
      ingredient,
      "品牌"
    );

    const storeCount = computeIngredientCount(
      dateRange,
      currentRangeData,
      ingredient,
      "门店数"
    );

    const score =
      ((brandCount / totalCurrentRangeBrands) * 0.5 +
        (storeCount / totalCurrentRangeStores) * 0.5) *
      100;
    return {
      ingredient,
      score,
      tableRow: [
        { name: "ingredient", value: ingredient },
        { name: "brandCount", value: brandCount },
        { name: "storeCount", value: storeCount },
        { name: "score", value: score },
      ],
    };
  });

  const sortedIngredientList = ingredientCountList.sort(
    (prev, next) => next["score"] - prev["score"]
  );

  const no20Ingredient = sortedIngredientList.at(19);

  if (no20Ingredient !== undefined) {
    const lastNo20ScoreIndex = sortedIngredientList.findLastIndex(
      (item) => item.score === no20Ingredient.score
    );
    
    return sortedIngredientList.slice(0, lastNo20ScoreIndex);
  } else {
    return sortedIngredientList.slice(0, 20);
  }
};
