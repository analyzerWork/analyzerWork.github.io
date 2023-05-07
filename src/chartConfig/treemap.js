const TOOLTIP_MAP = new Map([
  ['first','频次'],
  ['second','热度']
]);
const getTreemapOption = (type, data, selectedName) => {
  const { format: formatUtil } = window.parent.echartsUtil;
  return {
    tooltip: {
      formatter: function (info) {
        var value = info.value;
        var treePathInfo = info.treePathInfo;
        var treePath = [];
        for (var i = 1; i < treePathInfo.length; i++) {
          treePath.push(treePathInfo[i].name);
        }
        return [
          `<div class="tooltip-title">成分：${formatUtil.encodeHTML(
            treePath.join("/")
          )}</div>`,
          `${TOOLTIP_MAP.get(type)}：${formatUtil.addCommas(value)}`,
        ].join("");
      },
    },
    series: [
      {
        type: "treemap",
        data: data.map((item) => ({
          ...item,
          ...(item.name === selectedName
            ? {
                itemStyle: { borderWidth: 2, borderColor: "#fff" },
                label: { fontSize: 18 },
              }
            : undefined),
        })),
        upperLabel:
          type === "second"
            ? {
                show: true,
                height: 30,
              }
            : undefined,
        levels:
          type === "second"
            ? [
                {
                  itemStyle: {
                    borderColor: "#fff",
                    borderWidth: 0,
                    gapWidth: 1,
                  },
                  upperLabel: {
                    show: false,
                  },
                },
                {
                  itemStyle: {
                    borderColor: "#f0f0f0",
                    borderWidth: 5,
                    gapWidth: 1,
                  },
                },
              ]
            : undefined,
        nodeClick: false,
        breadcrumb: false,
        roam: false,
        top: "top",
        width: "100%",
        height: "100%",
      },
    ],
  };
};
