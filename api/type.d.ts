import type { WithId } from "mongodb";

export type Dictionary = {
  [key: string]: any;
};

export enum QueryTypeEnum {
  Init = "init",
  FetchData = "fetchData",
}

export type PrivateDataItem = WithId<{
  月份: string;
  品牌: string;
  产品名称: string;
  原料构成: string;
  基础成分: string;
  成分分类: string;
  加工后成分: string;
  品牌类型: string;
  产品类型: string;
  "品牌-产品名称-原料构成": string;
}>;

export type PublicBigDataItem = WithId<{
  月份: string;
  趋势名称: string;
  成分分类: string;
  加工后成分: string;
  PGC: string;
  UGC: string;
  当月加权声量: string;
  当月声量: string;
  当月声量环比增长: string;
  产品类型: string;
}>;


