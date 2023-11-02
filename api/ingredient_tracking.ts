import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL, SELECT_ALL } from "./_constants";
import { Dictionary, QueryTypeEnum, PrivateDataItem } from "./type";
const client = new MongoClient(CONNECTION_URL);

const classificationPriorityMap = new Map([
  ["果味", 6],
  ["茶底", 5],
  ["花香", 4],
  ["其他", 3],
  ["乳基底", 2],
  ["小料", 1],
]);
const computeResortClassificationIngredient = (
  classificationIngredientMap: Map<string, string[]>,
  type: string
) => {
  const classificationIngredientArray = [...classificationIngredientMap].map(
    ([classification, ingredientList]) => ({
      classification,
      ingredientList,
      priority: classificationPriorityMap.get(classification) ?? 0,
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

const computedRelatedFirstClassificationData = (data: PrivateDataItem[]) => {
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
module.exports = async (req: VercelRequest, res: VercelResponse) => {
  await client.connect();
  console.log("Connected successfully to server");
  console.log("---".repeat(5));

  const db = await client.db("private");
  let targetData: PrivateDataItem[] = [];
  let otherData: Dictionary = {};

  switch (req.query.name) {
    case QueryTypeEnum.Init:
      const allData = await db.collection<PrivateDataItem>("data");
      const allDataArray = await allData.find().toArray();
      const [firstItem] = allDataArray;
      const lastItem = allDataArray[allDataArray.length - 1];
      const initFirstItem = allDataArray[allDataArray.length - 13];
      const minDate = firstItem["月份"];
      const maxDate = lastItem["月份"];
      const initStartDate = initFirstItem["月份"];
      const { resortFirstClassificationIngredient } =
        computedRelatedFirstClassificationData(allDataArray);
      const classificationIngredientList =
        resortFirstClassificationIngredient.map(
          ({ classification, ingredientList }) => ({
            title: classification,
            options: ingredientList,
          })
        );
      const initSelectedIngredient =
        resortFirstClassificationIngredient[0].ingredientList[0];

      const initData = await allData
        .find({ 月份: { $gte: initStartDate, $lte: maxDate } })
        .toArray();

      otherData = {
        initStartDate,
        minDate,
        maxDate,
        currentRangeData: initData.filter(
          (item) => item["加工后成分"] === initSelectedIngredient
        ),
        initSelectedIngredient,
        classificationIngredientList,
      };

      break;

    case QueryTypeEnum.FetchData:
      const { startDate, endDate, brandTypeValue, productTypeValue } =
        req.query as {
          [key: string]: string;
        };

      const dataSlice = await db
        .collection<PrivateDataItem>("data")
        .find({ 月份: { $gte: startDate, $lte: endDate } })
        .toArray();

      const dataFilterByBrand =
        !brandTypeValue || brandTypeValue[0] === SELECT_ALL
          ? dataSlice
          : dataSlice.filter((item) =>
              brandTypeValue.includes(item["品牌类型"])
            );
      const dataFilterByProduct =
        productTypeValue[0] === SELECT_ALL
          ? dataFilterByBrand
          : dataFilterByBrand.filter((item) =>
              productTypeValue.includes(item["产品类型"])
            );

      targetData = dataFilterByProduct;
      break;
    default:
      targetData = [];
      break;
  }
  const data = {
    result: {
      targetData,
      otherData,
    },
  };
  res.setHeader("access-control-allow-origin", "*").status(200).json(data);
};
