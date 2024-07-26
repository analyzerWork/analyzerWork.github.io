const getBarOptions = ({ x_data, y_data }) => {
  return {
    grid: {
        bottom: 100,
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const [{name,value}] = params;
        return [
          `<div class="tooltip-title">成分：${name}</div>`,
          `频次：${value}`,
        ].join("");
      },
    },
    xAxis: {
      type: "category",
      data: x_data,
      axisLabel: {
        rotate: -45
      }
    },
    yAxis: {
      type: "value",
      splitLine:{
        show: false,
      }
    },
    series: [
      {
        data: y_data,
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.2)",
        },
        barMaxWidth: 60,
      },
    ],

  };
};
