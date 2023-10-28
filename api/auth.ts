import { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL } from "./constants";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const client = new MongoClient(CONNECTION_URL);

  await client.connect();
  console.log("Connected successfully to server");

  const db = await client.db("user");
  var result = await db
    .collection("meta")
    .find()
    .toArray();
  const data = {
    result,
  };
  res.setHeader('access-control-allow-origin', '*').status(200).json(data);
};
