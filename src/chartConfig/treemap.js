const getTreemapOption = (data) => {
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
            `<div class="tooltip-title">成分: ${formatUtil.encodeHTML(treePath.join('/'))}</div>`,
            `频次: ${formatUtil.addCommas(value)}`
          ].join('');
        }
      },
    series: [
      {
        type: "treemap",
        data,
        nodeClick: false,
        breadcrumb: false,
        roam: false,
        top:'top',
        width:'100%',
        height:'100%'
      },
    ],
  };
};

