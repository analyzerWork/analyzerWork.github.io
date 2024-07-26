import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL, SELECT_ALL } from "./_constants.js";
import { Dictionary, QueryTypeEnum, PrivateDataItem } from "./type.js";
const client = new MongoClient(CONNECTION_URL);


module.exports = async (req: VercelRequest, res: VercelResponse) => {
  await client.connect();
  console.log("Connected successfully to server");

  const db = await client.db("private");
  let targetData: PrivateDataItem[] = [];
  let otherData: Dictionary = {};
  
  switch (req.query.name) {
    case QueryTypeEnum.Init:
      const allData = await db.collection<PrivateDataItem>("data").find();
      const allDataArray = await allData.toArray();
      const [firstItem] = allDataArray;
      const lastItem = allDataArray[allDataArray.length - 1];
      const minDate = firstItem["月份"];
      const maxDate = lastItem["月份"];
      const brandSelectOptions = [
        ...new Set(allDataArray.map((item) => item["品牌类型"])),
      ];
      const productSelectOptions = [
        ...new Set(allDataArray.map((item) => item["产品类型"])),
      ];
      otherData = {
        minDate,
        maxDate,
        brandSelectOptions,
        productSelectOptions,
      };

      break;

    case QueryTypeEnum.FetchData:
      const {
        startDate,
        endDate,
        brandTypeValue,
        productTypeValue,
      } = req.query as {
        [key: string]: string;
      };

      const dataSlice = await db
        .collection<PrivateDataItem>("data")
        .find({ 月份: { $gte: startDate, $lte: endDate } }).toArray();

        const dataFilterByBrand =
        !brandTypeValue || brandTypeValue[0] === SELECT_ALL
          ? dataSlice
          : dataSlice.filter((item) => brandTypeValue.includes(item["品牌类型"]));
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
