class TasteMatching {
    data = []
    computedData = {
    }
    element = {
        $datePicker: document.querySelector('#taste-matching-date-picker'),
    }
    constructor(initData){
        this.data = initData;
        this.init();
        this.computed();
        this.bind();
    }

    init = () =>{
        const dateRange  = [...new Set(this.data.map((item) =>item['月份']))];
        const lastDate = dateRange[dateRange.length-1];
        this.element.$datePicker.value = `${lastDate} 至 ${lastDate}`;
        this.element.$datePicker.min = dateRange[0];
        this.element.$datePicker.max = lastDate;
        this.getFirstClassificationIngredient(0, this.data.length - 1)
    }

    computed = () =>{
    }



    bind = () =>{
        this.element.$datePicker.addEventListener('change', this.dateChangeHandler);
    }

    dateChangeHandler = () => {
        const [startDate,endDate] = this.value.split('至').map((value)=>value.trim());
        const startDateIndex = this.data.findIndex(d=>d['月份'] === startDate);
        const endDateIndex = this.data.findLastIndex(d=>d['月份'] === endDate);
        this.getFirstClassificationIngredient(startDateIndex, endDateIndex);
    }

    getFirstClassificationIngredient = (startIndex,endIndex) => {
        const firstClassification  = [...new Set(this.data.map((item) =>item['成分分类']))];
        const firstClassificationIngredientMap = new Map();

        this.data.forEach((item) =>{
            if(firstClassificationIngredientMap.has(item['成分分类'])){
                firstClassificationIngredientMap.set(item['成分分类'],
                firstClassificationIngredientMap.get(item['成分分类']).concat(item['加工后成分']))
            } else {
                firstClassificationIngredientMap.set(item['成分分类'], [item['加工后成分']])
            }
        })

        // 去重处理
        for(let [key,value] of firstClassificationIngredientMap.entries()){
            firstClassificationIngredientMap.set(key,[...new Set(value)])
        }
        console.log(firstClassificationIngredientMap);

    }


    


}