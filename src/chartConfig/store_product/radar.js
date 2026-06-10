/**
 * 将分析结果转换为多个独立的 ECharts Radar Option
 * @param {Object} analysisResult - analyzeConsumerExperience 或 calculateMonthlyTagCounts 的返回值
 * @returns {Array<Object>} 包含 title, key, option 的数组
 *
 */
function generateRadarOptions(data, compareData, { title, comparedTitle }) {
  // 💡 修复点2：补全所有的维度中英文映射表（涵盖体验、健康、风险）
  const dimensionTitleMap = {
    // 消费者体验维度
    texture: "口感/质地",
    flavor: "风味/香气",
    health: "健康/营养",
    burden: "身体负担/清爽度",
    stability: "温度耐受/状态",
  };

  const currentData = data || {};
  const compare = compareData || {};

  return Object.entries(dimensionTitleMap).map(([key, chartTitle]) => {
    const currentMap = currentData[key] || {};
    const compareMap = compare[key] || {};

    // ================== 核心修复：自适应 Max 计算 ==================
    const allValues = [
      ...Object.values(currentMap),
      ...Object.values(compareMap),
    ].filter((v) => typeof v === "number");

    const dataMax = allValues.length > 0 ? Math.max(...allValues) : 1;

    let step = 1;
    if (dataMax >= 100) step = 50;
    else if (dataMax >= 50) step = 20;
    else if (dataMax >= 20) step = 10;
    else if (dataMax >= 10) step = 5;
    else if (dataMax >= 5) step = 2;
    else step = 1;

    // 乘以 1.2 留出 20% 的外围空白，再按 step 向上取整
    let calculatedMax = Math.ceil((dataMax * 1.2) / step) * step;
    if (calculatedMax < 2) calculatedMax = 2;
    // =============================================================

    const indicator = Object.keys(currentMap).map((label) => ({
      name: label,
      max: calculatedMax,
    }));

    const MIN_VISUAL_VALUE = 0.5;
    const getRenderValues = (map) =>
      Object.values(map).map((value) =>
        value === 0 ? MIN_VISUAL_VALUE : value
      );

    const seriesData = [
      {
        value: getRenderValues(currentMap),
        name: `${title}`,
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 2 },
        itemStyle: { color: "#5470c6" },
      },
    ];

    if (Object.keys(compareMap).length > 0) {
      seriesData.push({
        value: getRenderValues(compareMap),
        name: `${comparedTitle}`,
        areaStyle: { opacity: 0 },
        lineStyle: { width: 1.5, type: "dashed", color: "#10b981" },
        itemStyle: { color: "#10b981" },
        symbol: "none",
      });
    }

    const option = {
      title: {
        text: chartTitle,
        top: 0,        // ★ 核心参数：距离容器顶部仅保留 5% 的空间
        left: 20,
        textStyle: {
          fontSize: 14,
        },
      },

      legend: {
        bottom: 8,
        itemGap: 20,
        textStyle: { color: "#666", fontSize: 12 },
        selectedMode: true,
        data: [
          {
            name: title,
            icon: "roundRect", // 本品牌使用实心色块/矩形
            itemStyle: {
              color: "transparent",
              borderWidth: 2,
              borderColor: "#5470c6",
            },
          },
          {
            name: comparedTitle,
            icon: "roundRect",
            itemStyle: {
              color: "transparent",
              borderWidth: 2,
              borderColor: "#10b981",
            },
          },
        ],
      },
      tooltip: {
        trigger: "item", // ★ 关键：改为 axis 触发，以便同时获取多条线的数据
        // 【样式微调】由于左右并排会增加宽度，建议设置最小宽度防止内容挤压
        extraCssText: "min-width: 240px;",
        formatter: function (params) {
          if (!params || !params.value) return "";

          // 提取颜色小圆点的辅助函数
          const getMarker = (color) =>
            `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`;

          // 💡 核心修改：构建左右并排的 Flex 布局 HTML
          let html = `<div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;">命中[${chartTitle}]各维度标签的成分数量</div>`;

          // 开启 Flex 容器，使本期与对比期左右平铺
          html += `<div style="display:flex; justify-content:space-between; gap:20px;">`;

          // --- 左侧：本期数据 ---
          html += `<div style="flex:1;">`;
          html += `<div style="margin-bottom:5px;">${getMarker(
            "#5470c6"
          )}<strong>${title}</strong></div>`;
          Object.entries(currentMap).forEach(([label, value]) => {
            html += `<div style="padding-left:15px;color:#666; line-height:1.6;">${label}: ${
              value || 0
            }</div>`;
          });
          html += `</div>`; // 结束左侧

          // --- 右侧：对比期数据（如果有）---
          if (Object.keys(compareMap).length > 0) {
            html += `<div style="flex:1;">`;
            html += `<div style="margin-bottom:5px;">${getMarker(
              "#10b981"
            )}<strong>${comparedTitle}</strong></div>`;
            Object.entries(compareMap).forEach(([label, value]) => {
              html += `<div style="padding-left:15px;color:#666; line-height:1.6;">${label}: ${
                value || 0
              }</div>`;
            });
            html += `</div>`; // 结束右侧
          }

          html += `</div>`; // 结束 Flex 容器

          return html;
        },
      },

      legend: { show: true, bottom: 0, textStyle: { fontSize: 11 } },
      radar: {
        center: ["50%", "45%"],

        indicator: indicator,
        shape: "polygon",
        splitNumber: 4,
        axisName: { fontSize: 12, color: "#666" },
        splitArea: {
          show: true,
          areaStyle: { color: ["rgba(255,255,255,0.1)", "rgba(0,0,0,0.05)"] },
        },
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { borderWidth: 2 },
          data: seriesData,
        },
      ],
    };

    return { key: key, title: chartTitle, option: option };
  });
}
