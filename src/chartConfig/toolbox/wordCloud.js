const getWordCloudOption = ({ data }) => ({
  tooltip: {
    show: true,
    formatter: "产品名称：{b0}  <br/> 数量：{c0}"
  },
  series: [
    {
      type: "wordCloud",

      textStyle: {
        color: function () {
          // Random color
          return (
            "rgb(" +
            [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
            ].join(",") +
            ")"
          );
        },
      },
      data,
    },
  ],
});
