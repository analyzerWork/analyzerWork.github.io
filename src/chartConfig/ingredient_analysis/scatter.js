

const getScatterOptions = (options) => {
  const { data } = options;
  const xValues = data.map(function(item) {
    return item[0];
  });

  const yValues = data.map(function(item) {
      return item[1];
  });

  const yMax =  Math.ceil(Math.max(...yValues));
  const yMin =  Math.floor(Math.min(...yValues));
  const xMin = Math.floor(Math.min(...xValues));
  const xMax = Math.ceil(Math.max(...xValues));
  const middle_x_max = Math.pow(10,(Math.log10(xMin) + Math.log10(xMax)) / 2);;
  const middle_y_max = (Number(yMax) + Number(yMin)) / 2;
  console.log(yMax, xMin, xMax, Math.pow(10,Math.log10(xMax)));
  return {
    xAxis: {
      name: "当月加权声量",
      splitLine: {
        show: false,
      },
      axisLine:{
        onZero: false,
      },
      offset: Number(yMin) ,
      type: 'log',
      min: Math.floor(Math.pow(10,Math.log10(xMin))),
      max: Math.ceil(Math.pow(10,Math.log10(xMax)))
    },
    yAxis: {
      name: "当月声量环比增长",
      splitLine: {
        show: false,
      },
      max: Number(yMax),
      min: Number(yMin),
      axisLabel: {
        formatter:(value)=> `${(value * 100).toFixed(0)} %` 
      }
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
        height: 15,
        showDetail: false,
        showDataShadow: false,
        backgroundColor: 'rgba(42,128,235,0.06)',
        handleSize: 30,
      },
      {
        type: 'slider',
        show: true,
        yAxisIndex: 0,
        width: 15,
        height: 440,
        bottom: 100,
        right: '7%',
        end: 100,
        showDetail: false,
        showDataShadow: false,
        backgroundColor: 'rgba(42,128,235,0.06)',
        handleSize: 30
      },
      
    ],
    tooltip: {
      show: true,
      trigger: "item",
      
      formatter: (params) => {
        const { data, dimensionNames } = params;
        const dimensionNodes = dimensionNames
          .map(
            (dimension, index) =>
              `<div style="margin-bottom:8px">${dimension}：${index ===1 ? `${(data[index]*100).toFixed(2)}%`  : data[index]} </div>`
          );
        return `<div>
                  ${dimensionNodes.join("")}
                </div>`;
      },
    },
    series: [
      {
        dimensions: ["当月加权声量", "当月声量环比增长", "成分数量", "成分名称"],
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
            if (xValue < middle_x_max && yValue < middle_y_max) {
              return '#5470c6';
            }
            if (xValue < middle_x_max && yValue >= middle_y_max) {
              return  '#91cc75';
            }
            if (xValue >= middle_x_max && yValue < middle_y_max) {
              return '#fac858';
            }
            if (xValue >= middle_x_max && yValue >= middle_y_max) {
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
                coord: [xMax, yMin],
                symbol: "none",
              },
              {
                coord: [xMax, yMax],
                symbol: "none",
              },
            ],
            // 上边框
            [
              {
                coord: [xMin, yMax],
                symbol: "none",
              },
              {
                coord: [xMax, yMax],
                symbol: "none",
              },
            ],
            // 垂直中线
            [
              {
                coord: [middle_x_max, yMax],
                symbol: "none",
              },
              {
                coord: [middle_x_max, yMin],
                symbol: "none",
              },
            ],
            // 水平中线
            [
              {
                coord: [xMin, middle_y_max],
                symbol: "none",
              },
              {
                coord: [xMax, middle_y_max],
                symbol: "none",
              },
            ],
          ],
        },
      },
    ],
  };
};
