import { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
const CONNECTION_URL = `mongodb+srv://${process.env.DB_KEY}.feljs0l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(CONNECTION_URL);

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  await client.connect();
  console.log('Connected successfully to server');

  const db = await client.db("public");
  var result = await db.collection("bigData").find({"加工后成分":'西梅'}).toArray();
  const data = {
    result,
  };
  res.status(200).json(data);
};
