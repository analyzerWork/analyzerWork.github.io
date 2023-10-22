const getWordCloudOption = ({ data }) => {
  const colors = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc",
  ];

  const colorsLength = colors.length;

  return {
    tooltip: {
      show: true,
      formatter: "产品名称：{b0}  <br/> 数量：{c0}",
    },
    series: [
      {
        type: "wordCloud",
        shape: 'heart',
        sizeRange: [12, 48],
        textStyle: {
          color: function () {
            const index = Math.floor(Math.random()*(colorsLength + 1));
            return colors[index];
          },
        },
        data,
      },
    ],
  };
};
