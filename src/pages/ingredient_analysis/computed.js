const computedIngredientOptions = ({
  currentYearMonth,
  taste_matching_data,
  selectedIngredients,
  selectedProductType,
  currentRangeData,
}) => {
  if (currentRangeData.length > 0) {
    // 筛选时间、成分分类
    const isCoffee = selectedProductType === "咖啡饮品";
    const suffix = isCoffee ? '-咖啡' : '-茶饮';
    const filterByDateAndIngredient = taste_matching_data.filter(
      (item) =>
        item["月份"] === currentYearMonth &&
        selectedIngredients.includes(item[`成分分类${suffix}`])
    );
    // 筛选产品类型
    const filterByProductType = filterByDateAndIngredient.filter((item) => {
      if (isCoffee) {
        return item["产品大类"] === "咖啡";
      } else {
        return item["产品大类"] !== "咖啡";
      }
    });

    return currentRangeData.map((bigDataItem) => {
        const currentIngredient = bigDataItem['加工后成分'];
        const filterIngredientData = filterByProductType.filter(item=> item['加工后成分'] === currentIngredient)
        return [bigDataItem['当月加权声量'],bigDataItem['当月声量环比增长'],filterIngredientData.length,currentIngredient]
    });


  }
};
