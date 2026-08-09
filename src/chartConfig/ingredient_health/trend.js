function generateTrendChartOptions(brandStats, industryStats, brandName = '本品牌') {
    if (!Array.isArray(brandStats) || !Array.isArray(industryStats)) return {};
  
    const months = brandStats.map(item => item.month);
    const industryMap = new Map(industryStats.map(item => [item.month, item]));
  
    // 提取数据
    const brandHealthData = brandStats.map(item => item.healthCount);
    const brandRiskData = brandStats.map(item => item.riskCount);
    const industryHealthData = months.map(m => industryMap.get(m)?.healthCount ?? null);
    const industryRiskData = months.map(m => industryMap.get(m)?.riskCount ?? null);
  
    // 定义统一的调色板
    const healthColor = '#52c41a';
    const riskColor = '#ff4d4f';
  
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          if (!Array.isArray(params) || params.length === 0) return '';
          
          const axisValue = params[0].axisValue;
          let htmlStr = `<div style="font-weight:bold;margin-bottom:8px;">${axisValue}</div>`;
          
          params.forEach(item => {
            // 1. 根据名称精准匹配颜色，避免 areaStyle 导致 item.color 变成渐变对象的问题
            const isHealth = item.seriesName.includes('健康');
            const color = isHealth ? healthColor : riskColor;
            
            // 2. 根据名称判断是否为行业大盘，匹配虚线样式
            const isIndustry = item.seriesName.includes('大盘');
            
            // 3. 动态生成小图标样式
            const markerStyle = isIndustry 
              ? `border:2px dashed ${color};background:transparent;` // 大盘：虚线边框 + 透明背景
              : `border:2px solid ${color};background:${color};`; // 本品牌：纯色实心背景
            
            htmlStr += `
              <div style="display:flex;align-items:center;margin:4px 0;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;${markerStyle}margin-right:8px;"></span>
                <span style="flex:1;">${item.seriesName}</span>
                <span style="font-weight:bold;margin-left:20px;">${item.value ?? '-'}</span>
              </div>
            `;
          });
          
          return htmlStr;
        }
      },
      
      legend: {
        bottom: '2%',
        itemGap: 20,
        textStyle: { color: '#666', fontSize: 12 },
        selectedMode: true,
        data: [
          { 
            name: `${brandName}-健康`, 
            icon: 'roundRect', // 本品牌使用实心色块/矩形
            itemStyle: { color: 'transparent', borderWidth: 2, borderColor:healthColor } 
          },
          { 
            name: `${brandName}-风险`, 
            icon: 'roundRect', 
            itemStyle: { color: 'transparent', borderWidth: 2, borderColor:riskColor } 
          },
          { 
            name: '大盘(除本品牌)-健康', 
            // 🔥 极简方案：直接使用 borderType 绘制虚线边框
            icon: 'rect', // 推荐使用空心矩形 rect 配合边框显示虚线
            itemStyle: { 
              color: 'transparent', // 内部透明
              borderColor: healthColor, // 边框颜色与折线一致
              borderWidth: 2, // ⚠️ 关键：必须设置宽度 > 0，borderType 才会生效
              borderType: 'dashed' // 虚线样式
            }
          },
          { 
            name: '大盘(除本品牌)-风险', 
            icon: 'rect', 
            itemStyle: { 
              color: 'transparent', 
              borderColor: riskColor, 
              borderWidth: 2, 
              borderType: 'dashed' 
            }
          }
        ]
      },
  
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: months },
      yAxis: { type: 'value', name: '命中标签的成分数量', minInterval: 1 },
  
      series: [
        // 本品牌 - 健康 (实线 + 面积)
        {
          name: `${brandName}-健康`, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
          lineStyle: { width: 3, color: healthColor },
          itemStyle: { color: healthColor },
          areaStyle: { color: 'rgba(82, 196, 26, 0.1)' },
          data: brandHealthData
        },
        // 本品牌 - 风险 (实线 + 面积)
        {
          name: `${brandName}-风险`, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
          lineStyle: { width: 3, color: riskColor },
          itemStyle: { color: riskColor },
          areaStyle: { color: 'rgba(255, 77, 79, 0.1)' },
          data: brandRiskData
        },
  
        // 行业大盘 - 健康 (虚线 + 无填充)
        {
          name: '大盘(除本品牌)-健康', type: 'line', smooth: true, symbol: 'none',
          lineStyle: { width: 2, color: healthColor, type: 'dashed' },
          areaStyle: undefined,
          data: industryHealthData
        },
        // 行业大盘 - 风险 (虚线 + 无填充)
        {
          name: '大盘(除本品牌)-风险', type: 'line', smooth: true, symbol: 'none',
          lineStyle: { width: 2, color: riskColor, type: 'dashed' },
          areaStyle: undefined,
          data: industryRiskData
        }
      ]
    };
  }