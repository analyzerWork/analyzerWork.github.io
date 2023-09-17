
const X_Y_MAX = 100;
const MIDDLE_MAX = X_Y_MAX / 2;
const getScatterOptions = (options) => {
  return {
    xAxis: {
      name: "规模指数",
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      name: "增长指数",
      splitLine: {
        show: false,
      },
    },
    tooltip: {
      show: true,
      trigger: "item",
      
      formatter: (params) => {
        const { data, dimensionNames } = params;
        const reversedData = data.reverse();
        const dimensionNodes = dimensionNames.reverse()
          .map(
            (dimension, index) =>
              `<div style="margin-bottom:8px">${dimension}：${reversedData[index]} </div>`
          );
        return `<div>
                  ${dimensionNodes.join("")}
                </div>`;
      },
    },
    series: [
      {
        dimensions: ["规模指数", "增长指数", "成分数量", "成分名称"],
        data: options.data,
        type: "scatter",
        label: {
          show: true,
          position: "bottom",
          formatter: "{@[3]}",
        },
        itemStyle: {
          color: (params) => {
            const [xValue, yValue,ingredientNum] = params.data;
            if(ingredientNum === 0){
                return '#999';
            }
            if (xValue < MIDDLE_MAX && yValue < MIDDLE_MAX) {
              return '#5470c6';
            }
            if (xValue < MIDDLE_MAX && yValue >= MIDDLE_MAX) {
              return  '#91cc75';
            }
            if (xValue >= MIDDLE_MAX && yValue < MIDDLE_MAX) {
              return '#fac858';
            }
            if (xValue >= MIDDLE_MAX && yValue >= MIDDLE_MAX) {
              return '#ee6666';
            }
          },
        },
        symbolSize: (value) => {
          const [, , ingredientNumber] = value;
          if(ingredientNumber === 0){
            return 5
          }
          const size = Math.ceil(ingredientNumber/10);
          return size * 10;
          
        },
        markLine: {
          name: "axis",
          silent: true,
          lineStyle: {
            color: "#666",
            type: "solid",
          },
          animation: false,
          data: [
            // 右边框
            [
              {
                coord: [X_Y_MAX, 0],
                symbol: "none",
              },
              {
                coord: [X_Y_MAX, X_Y_MAX],
                symbol: "none",
              },
            ],
            // 上边框
            [
              {
                coord: [0, X_Y_MAX],
                symbol: "none",
              },
              {
                coord: [X_Y_MAX, X_Y_MAX],
                symbol: "none",
              },
            ],
            // 垂直中线
            [
              {
                coord: [MIDDLE_MAX, X_Y_MAX],
                symbol: "none",
              },
              {
                coord: [MIDDLE_MAX, 0],
                symbol: "none",
              },
            ],
            // 水平中线
            [
              {
                coord: [0, MIDDLE_MAX],
                symbol: "none",
              },
              {
                coord: [X_Y_MAX, MIDDLE_MAX],
                symbol: "none",
              },
            ],
          ],
        },
      },
    ],
  };
};
