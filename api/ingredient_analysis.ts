import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL } from "./_constants.js";
import {
  Dictionary,
  QueryTypeEnum,
  PublicBigDataItem,
} from "./type.js";
const client = new MongoClient(CONNECTION_URL);

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  await client.connect();
  console.log("Connected successfully to server");
  console.log("---".repeat(5));

  const db = await client.db("public");
  let targetData: PublicBigDataItem[] = [];
  let otherData: Dictionary = {};

  switch (req.query.name) {
    case QueryTypeEnum.Init:
      const allData = await db.collection<PublicBigDataItem>("bigData");
      const allDataArray = await allData.find().toArray();
      const [firstItem] = allDataArray;
      const lastItem = allDataArray[allDataArray.length - 1];
      const initFirstItem = allDataArray[allDataArray.length - 13];
      const minDate = firstItem["月份"];
      const maxDate = lastItem["月份"];
      const initStartDate = initFirstItem["月份"];

      const initData = await allData.find({ 月份: { $eq: maxDate } }).toArray();

      const ingredientClassOptions = [
        ...new Set(allDataArray.map((item) => item["成分分类"])),
      ];
      const productTypeOptions = [
        ...new Set(allDataArray.map((item) => item["产品类型"])),
      ];

      otherData = {
        initStartDate,
        minDate,
        maxDate,
        ingredientClassOptions,
        productTypeOptions,
      };

      targetData = initData;

      break;

    case QueryTypeEnum.FetchData:
      const { date, selectedProductType, selectedIngredients } = req.query as {
        [key: string]: string;
      };

      const dataSlice = await db
        .collection<PublicBigDataItem>("bigData")
        .find({ 月份: { $eq: date } })
        .toArray();

      targetData = dataSlice.filter(
        (item) =>
          selectedIngredients.includes(item["成分分类"]) &&
          selectedProductType === item["产品类型"]
      );
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
