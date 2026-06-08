function formatEchartsData(stats) {
  // 将 dimensions 映射为 ECharts series.data 格式
  const chartData = stats.dimensions.map((item) => ({
    value: item.count, // 使用 count 作为扇区大小
    name: item.name, // 画像名称
    percentage: item.percentage, // 保留百分比用于显示
    topTags: item.topTags, // 将 Top5 标签一并带入数据项
  }));

  return chartData;
}

const getBarChartOption = (stats, title) => {
  // 🌟 【核心改动】不再过滤 count === 0 的数据，完整保留所有维度
  const allDimensions = stats.dimensions;

  // 提取 Y 轴的类目名称（画像标签）
  const categories = allDimensions.map((item) => item.name);

  // 提取真实的业务百分比数据（包含 0）
  const percentages = allDimensions.map((item) => item.percentage);

  return {
    title: {
      text: `${title}`,
      subtext: `基于 ${stats.totalProducts} 款产品分析`,
      left: "center",
      textStyle: { fontSize: 16, fontWeight: "bold" },
      subtextStyle: { fontSize: 12, color: "#999" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },

      // 🌟 【核心】启用 HTML 渲染模式，并限制整体最大宽度防止撑爆屏幕
      renderMode: "html",
      confine: true, // 防止超出屏幕边缘

      // 🌟 【核心修复】2. 通过 extraCssText 注入全局样式，限制最大宽度并允许正常断词换行
      extraCssText: "max-width: 300px; white-space: normal;",

      formatter: function (params) {
        const param = params[0];
        const dataItem = allDimensions[param.dataIndex];

        // 组装核心特征标签文本
        let tagStr = "";
        if (dataItem.topTags && dataItem.topTags.length > 0) {
          tagStr = dataItem.topTags.map((t) => t.tag).join("、");
        } else {
          tagStr =
            '<span style="color:#999;font-size:12px;">暂无明显特征标签</span>';
        }

        return `
          <div style="font-size:14px; line-height:1.6;">
            ${param.marker} <b>${param.name}</b><br/>
            产品数量：<b>${dataItem.count}</b> 款<br/>
            
            <div style="display:flex; align-items:flex-start;">
          <!-- 左侧 Label：强制不换行 -->
          <span style="white-space:nowrap; margin-right:8px; flex-shrink:0;">产品特征：</span>
          
          <div style="flex:1; min-width:0; color:#409EFF;  word-break:keep-all; overflow-wrap:break-word;">
            ${tagStr}
          </div>
        </div>
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "15%", // 右侧留出空间给数据标签显示
      top: "20%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: 100, // X轴上限锁定为 100%，确保柱子长度与百分比严格对应
      axisLabel: {
        formatter: "{value}%",
      },
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true, // 倒序排列，让第一个画像在最上方
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        name: "画像占比",
        type: "bar",
        barWidth: 20,
        data: percentages,
        label: {
          show: true,
          position: "right",
          formatter: "{c}%",
          color: "#333",
        },
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          // 🌟 【视觉优化】根据数值动态设置颜色：有数据的显示蓝色渐变，为0的显示浅灰色占位
          color: function (params) {
            if (params.value === 0) {
              return "#E8EBEF"; // 浅灰色，作为空数据的视觉占位
            }
            return new window.parent.echarts.graphic.LinearGradient(
              0,
              0,
              1,
              0,
              [
                { offset: 0, color: "#83bff6" },
                { offset: 0.5, color: "#188df0" },
                { offset: 1, color: "#188df0" },
              ]
            );
          },
        },
        emphasis: {
          itemStyle: {
            color: new window.parent.echarts.graphic.LinearGradient(
              0,
              0,
              1,
              0,
              [
                { offset: 0, color: "#2378f7" },
                { offset: 1, color: "#83bff6" },
              ]
            ),
          },
        },
      },
    ],
  };
};
