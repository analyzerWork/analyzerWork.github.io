const getTrendOptions = ({ x_data, y_data, brandProducts }) => {
  return {
    xAxis: {
      type: "category",
      data: x_data,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: "新品数量",
      nameTextStyle: {
        align: "right",
      },
    },
    tooltip: {
      triggerOn: 'none',
      formatter: (params) => {
        const { dataIndex } = params;
        const data = brandProducts[dataIndex] || [];
        return `<div style="padding:4px 6px; border-radius: 3px">
        <div style="font-weight:500; margin-block:0 4px;">本月新品</div>
        <div style="font-size:12px">${data.map((product) => `<div>${product}</div>`).join('')}</div>
      </div>`;
      },
    },
    series: [
      {
        data: y_data,
        type: "line",
        smooth: true,

        markPoint: {
          itemStyle: {
            color: "#fff",
            opacity: 0.8,
          },
          data: x_data.map((_, index) => ({
            coord: [index, y_data[index]],
            value: y_data[index],
          })),
        },
      },
    ],
  };
};
