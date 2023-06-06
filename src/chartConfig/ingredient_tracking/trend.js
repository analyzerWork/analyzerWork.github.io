const getTrendOptions = ({x_data, y_data}) => {
  return {
    xAxis: {
      type: "category",
      data: x_data,
      axisTick:{
        alignWithLabel: true
      }
    },
    yAxis: {
      type: "value",
      name: "数量",
      nameTextStyle: {
        align: 'right'
      }
    },
    series: [
      {
        data: y_data,
        type: "line",
        smooth: true,
        markPoint:{
          itemStyle: {
            color: '#fff',
            opacity: 0.8
          },
          data: x_data.map((_,index)=> ({
            coord: [index, y_data[index]],
            value: y_data[index]
          }))
        }
      },
    ],
  };
};
