function zScoreToPositiveScore(zScore) {
  // 近似计算标准正态分布的 CDF (误差极小，性能极高)
  const cdf = 1 / (1 + Math.exp(-1.65451 * zScore));
  // 映射到 0-100 区间，并保留一位小数
  return Number((cdf * 100).toFixed(1));
}

function generateCompareRadarOptions(brandStats, globalStats) {
  const { health: brandHealth, risk: brandRisk } = brandStats;
  const { health: globalHealth, risk: globalRisk } = globalStats;

  // 提取维度名称
  const healthDimensions = HEALTH_RULES.map((rule) => rule.label);
  const riskDimensions = RISK_RULES.map((rule) => rule.label);

  // --- 辅助函数：安全获取数值 & 计算内部结构占比 ---
  function getSafeValue(statsObj, dim) {
    return Number(statsObj?.[dim]) || 0;
  }

  function toPercentage(statsObj, dimensions) {
    const values = dimensions.map((dim) => getSafeValue(statsObj, dim));
    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return dimensions.map(() => 0);
    return values.map((val) => (val / total) * 100);
  }

  // --- 辅助函数：基于占比计算 Mean 和 StdDev ---
  function getMetricsFromArr(arr) {
    const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
    const variance =
      arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev: stdDev === 0 ? 1 : stdDev };
  }

  // --- 1. 提取全局大盘的结构占比与统计指标 ---
  const globalHealthPct = toPercentage(globalHealth, healthDimensions);
  const globalRiskPct = toPercentage(globalRisk, riskDimensions);
  const healthMetrics = getMetricsFromArr(globalHealthPct);
  const riskMetrics = getMetricsFromArr(globalRiskPct);

  // --- 2. 计算当前品牌的【结构占比】与【原始绝对值】---
  const brandHealthPct = toPercentage(brandHealth, healthDimensions);
  const brandRiskPct = toPercentage(brandRisk, riskDimensions);
  const brandHealthRaw = healthDimensions.map((dim) =>
    getSafeValue(brandHealth, dim)
  );
  const brandRiskRaw = riskDimensions.map((dim) =>
    getSafeValue(brandRisk, dim)
  );

  // --- 3. 提取行业平均线的【原始绝对值】---
  const globalHealthRaw = healthDimensions.map((dim) =>
    getSafeValue(globalHealth, dim)
  );
  const globalRiskRaw = riskDimensions.map((dim) =>
    getSafeValue(globalRisk, dim)
  );

  // --- 4. 统一走算法映射，不再对 0 进行特殊物理拦截 ---
  const calcScores = (pcts, metrics) => {
    return pcts.map((pct) => {
      const z = (pct - metrics.mean) / metrics.stdDev;
      return zScoreToPositiveScore(z);
    });
  };

  const brandHealthData = calcScores(brandHealthPct, healthMetrics);
  const brandRiskData = calcScores(brandRiskPct, riskMetrics);
  const globalHealthData = calcScores(globalHealthPct, healthMetrics);
  const globalRiskData = calcScores(globalRiskPct, riskMetrics);

  // --- 5. 构建 ECharts Option ---
  const createRadarOption = (
    titleText,
    categories,
    brandData,
    globalData,
    brandRawCounts,
    globalRawCounts,
    color
  ) => {
    return {
      title: { text: titleText, left: "center", textStyle: { fontSize: 16 } },

      // 【核心修复】严格保证 formatter 始终返回字符串
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          if (!params.value || !Array.isArray(params.value)) return "";

          let html = `<div style="font-weight:bold; margin-bottom:8px;">${params.name}</div>`;

          // 根据触发的系列名称决定读取哪一份原始数据
          const rawCounts =
            params.name === "当前品牌" ? brandRawCounts : globalRawCounts;

          // 拼接各维度的真实原始命中次数
          params.value.forEach((score, idx) => {
            const realCount = rawCounts[idx];

            // 【核心逻辑】：原始值为0时展示0，否则展示映射好的得分
            const displayValue = realCount === 0 ? 0 : score.toFixed(2);

            html += `<div>${categories[idx]}：<b>${displayValue}</b></div>`;
          });

          // 最终统一返回有效的 HTML 字符串
          return html;
        },
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#e2e8f0",
        textStyle: { color: "#1e293b" },
      },

      legend: {
        bottom: 0,
        data: [
          { name: "当前品牌" },
          {
            name: "行业(所有品牌)均值",
            itemStyle: {
              color: "#FF9800",
            },
          },
        ],
      },
      radar: {
        indicator: categories.map((name) => ({ name, max: 100 })),
        radius: "60%",
        center: ["50%", "50%"],
        axisName: { color: "#666" },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: brandData,
              name: "当前品牌",
              lineStyle: { color: color, width: 2 },
              itemStyle: { color: color },
            },
            {
              value: globalData,
              name: "行业(所有品牌)均值",
              symbol: "none",
              lineStyle: { color: "#FF9800", width: 2, type: "dashed" },
            },
          ],
        },
      ],
    };
  };

  return {
    // 将两套原始数据都传入配置生成器
    healthOption: createRadarOption(
      "健康属性评估",
      healthDimensions,
      brandHealthData,
      globalHealthData,
      brandHealthRaw,
      globalHealthRaw,
      "#10b981"
    ),
    riskOption: createRadarOption(
      "风险属性评估",
      riskDimensions,
      brandRiskData,
      globalRiskData,
      brandRiskRaw,
      globalRiskRaw,
      "#ef4444"
    ),
  };
}
