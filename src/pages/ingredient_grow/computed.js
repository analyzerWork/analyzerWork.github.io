
const computedBrandTrendData = (data)=>{
    const monthMap = new Map();
    data.forEach(item=>{
        const month = item['月份'];
        if(monthMap.has(month)){
            monthMap.set(month, [...monthMap.get(month),item['产品名称']])
        }else{
            monthMap.set(month, [item['产品名称']])
        }
    })

    const dataList = [...monthMap.entries()];
    return {
        x_data:dataList.map(([month]) => month),
        y_data:dataList.map(([_,list]) => {
            const products = [...new Set(list)];
            return {
                products,
                value: products.length
            }
            
        })
    }
}