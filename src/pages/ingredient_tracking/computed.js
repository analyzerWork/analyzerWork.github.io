
const computedTrendData = (data, type)=>{
    const monthMap = new Map();
    data.forEach(item=>{
        const month = item['月份'];
        if(monthMap.has(month)){
            monthMap.set(month, [...monthMap.get(month),item[type]])
        }else{
            monthMap.set(month, [item[type]])
        }
    })

    const dataList = [...monthMap.entries()];
    return {
        x_data:dataList.map(([month]) => month),
        y_data:dataList.map(([_,list]) => [...new Set(list)].length)
    }
}