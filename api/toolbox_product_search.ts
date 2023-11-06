import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL, PAGE_SIZE } from "./_constants";
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
    case QueryTypeEnum.FetchData:
      const allData = await db.collection<PrivateDataItem>("data");
      const allDataArray = await allData.find().toArray();
      const { keyword, offset } = req.query as {
        [key: string]: string;
      };
      targetData =
        keyword.trim().length === 0
          ? allDataArray
          : allDataArray
              .filter((item) => {
                return item["加工后成分"].includes(keyword);
              })
              .slice(Number(offset) * PAGE_SIZE, (Number(offset) + 1) * PAGE_SIZE);

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
