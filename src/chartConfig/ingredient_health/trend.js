/**
 * 根据月度标签统计结果生成 ECharts 趋势图配置项
 * @param {Array} monthlyStats - calculateMonthlyTagCounts 函数的返回值，格式为 [{month, healthCount, riskCount}, ...]
 * @returns {Object} ECharts Option 配置对象
 */
function generateTrendChartOptions(monthlyStats) {
  // 防御性校验
  if (!Array.isArray(monthlyStats)) return {};

  // 提取 X 轴月份与两条折线的数据
  const months = monthlyStats.map((item) => item.month);
  const healthData = monthlyStats.map((item) => item.healthCount);
  const riskData = monthlyStats.map((item) => item.riskCount);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    legend: {
      data: ["健康标签命中数", "风险标签命中数"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: months,
    },
    yAxis: {
      type: "value",
      name: "成分命中标签数量",
      minInterval: 1,
    },
    series: [
      {
        name: "健康标签命中数",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: "#52c41a" },
        itemStyle: { color: "#52c41a" },
        areaStyle: {
          color: "rgba(82, 196, 26, 0.1)",
        },
        data: healthData,
      },
      {
        name: "风险标签命中数",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: "#ff4d4f" },
        itemStyle: { color: "#ff4d4f" },
        areaStyle: {
          color: "rgba(255, 77, 79, 0.1)",
        },
        data: riskData,
      },
    ],
  };
}
