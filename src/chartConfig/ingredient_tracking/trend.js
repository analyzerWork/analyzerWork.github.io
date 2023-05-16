const getTrendOptions = ({x_data, y_data}) => {
  return {
    xAxis: {
      type: "category",
      data: x_data,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: y_data,
        type: "line",
        smooth: true,
      },
    ],
  };
};
