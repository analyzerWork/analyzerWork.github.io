import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL } from "./_constants";
import { Dictionary, QueryTypeEnum, PrivateDataItem } from "./type";
const client = new MongoClient(CONNECTION_URL);


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

      const initData = await allData
        .find({ 月份: { $gte: initStartDate, $lte: maxDate } })
        .toArray();

      const selectedBrand = initData[initData.length - 1]["品牌"];

      const brandOptions = [...new Set(initData.map((item) => item["品牌"]))];

      otherData = {
        initStartDate,
        minDate,
        maxDate,
        selectedBrand,
        brandOptions,
      };
      targetData = initData.filter((item) => item["品牌"] === selectedBrand);

      break;

    case QueryTypeEnum.FetchData:
      const { startDate, endDate, brand } = req.query as {
        [key: string]: string;
      };

      const dataSlice = await db
        .collection<PrivateDataItem>("data")
        .find({ 月份: { $gte: startDate, $lte: endDate } })
        .toArray();

      otherData = {
        brandOptions: [...new Set(dataSlice.map((item) => item["品牌"]))]
      }
      targetData = dataSlice.filter((item) => item["品牌"] === brand);
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
