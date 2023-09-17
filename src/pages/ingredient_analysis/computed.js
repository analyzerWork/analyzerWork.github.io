const computedIngredientOptions = ({
  currentYearMonth,
  taste_matching_data,
  selectedIngredients,
  selectedProductType,
  currentRangeData,
}) => {
  if (currentRangeData.length > 0) {
    // 筛选时间、成分分类
    const filterByDateAndIngredient = taste_matching_data.filter(
      (item) =>
        item["月份"] === currentYearMonth &&
        selectedIngredients.includes(item["成分分类"])
    );
    // 筛选产品类型
    const filterByProductType = filterByDateAndIngredient.filter((item) => {
      if (selectedProductType === "咖啡饮品") {
        return item["产品类型"] === "咖啡";
      } else {
        return item["产品类型"] !== "咖啡";
      }
    });

    return currentRangeData.map((bigDataItem) => {
        const currentIngredient = bigDataItem['加工后成分'];
        const filterIngredientData = filterByProductType.filter(item=> item['加工后成分'] === currentIngredient)
        return [bigDataItem['规模指数'],bigDataItem['增长指数'],filterIngredientData.length,currentIngredient]
    });


  }
};
