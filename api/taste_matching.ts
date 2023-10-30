import { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient, WithId } from "mongodb";
const CONNECTION_URL = `mongodb+srv://${process.env.DB_KEY}.feljs0l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(CONNECTION_URL);

enum QueryTypeEnum {
    Init = 'init',
    FetchData = 'fetchData',
}

type PrivateDataItem = WithId<{
    "月份": string,
    "品牌": string,
    "产品名称": string,
    "原料构成": string,
    "基础成分": string,
    "成分分类": string,
    "加工后成分": string,
    "品牌类型": string,
    "产品类型": string,
    "品牌-产品名称-原料构成":string,
}>

module.exports = async (req: VercelRequest, res: VercelResponse) => {
    await client.connect();
    console.log('Connected successfully to server');

    const db = await client.db("private");
    const all_data = await db.collection<PrivateDataItem>('data').find();
    let result: PrivateDataItem[] = [];
    
    switch (req.query.type) {
        case QueryTypeEnum.Init:
            result = await all_data.sort({ '月份': -1 }).limit(1).toArray();

        case QueryTypeEnum.FetchData:
            result = []
        default:
            result = [];
    }
    const data = {
        result,
    };
    res.status(200).json(data);
};
