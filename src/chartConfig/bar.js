const getBarOptions = ({ x_data, y_data }) => {
  return {
    grid: {
        bottom: 100,
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
    },
    series: [
      {
        data: y_data,
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.2)",
        },
      },
    ],
    tooltip:{
        trigger: "axis",
    }
  };
};
