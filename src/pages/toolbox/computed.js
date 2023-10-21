const computeProductWordCloudData = (data, keyword = "") => {
  const dataFiltered =
    keyword.trim().length === 0
      ? data
      : data.filter((item) => {
          return item["加工后成分"].includes(keyword);
        });
  if (dataFiltered.length === 0) {
    return [];
  }

  const dataMap = dataFiltered.reduce((prev, next) => {
    return prev[next["产品名称"]]
      ? {
          ...prev,
          [next["产品名称"]]: prev[next["产品名称"]] + 1,
        }
      : {
          ...prev,
          [next["产品名称"]]: 1,
        };
  }, {});

  return Object.entries(dataMap)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => (a.value < b.value ? 1 : -1));
};
