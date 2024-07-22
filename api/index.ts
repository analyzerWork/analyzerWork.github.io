import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";
import { CONNECTION_URL } from './_constants.js';
const client = new MongoClient(CONNECTION_URL);

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  await client.connect();
  console.log('Connected successfully to server');

  const data = {
    result:[],
  };
  res.status(200).json(data);
};
