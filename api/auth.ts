import { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL } from "./_constants";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const client = new MongoClient(CONNECTION_URL);

  await client.connect();
  console.log("Connected successfully to server");

  const db = await client.db("user");
  const dbData = await db
    .collection("meta")
    .find()
    .toArray();
  const data = {
    data: dbData,
  };
  res.setHeader('access-control-allow-origin', '*').status(200).json(data);
};
