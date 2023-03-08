class TasteMatching {
    data = []
    computedData = {
        firstClassification: [],
        firstClassificationIngredientMap: new Map(),
    }
    element = {
        $datePicker: document.querySelector('#taste-matching-date-picker'),
        $firstClassPanel: document.querySelector('#firstClassPanel'),
    }
    constructor(initData){
        this.init(initData);
        this.bind();
    }

    init = (initData) => {
        this.data = initData;
        const dateRange  = [...new Set(this.data.map((item) =>item['月份']))];
        const lastDate = dateRange[dateRange.length-1];
        this.element.$datePicker.value = `${lastDate} 至 ${lastDate}`;
        this.element.$datePicker.min = dateRange[0];
        this.element.$datePicker.max = lastDate;
        this.getFirstClassificationIngredient(0, this.data.length - 1);
        this.renderFirstClassificationIngredient();
    }

    get = (...keys) => keys.reduce((prev,key) => ({
        ...prev,
        [key]:this.computedData[key]
    }),{})

    set = (data) => {
        this.computedData = {
            ...this.computedData,
            ...data
        }
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

        this.data.slice(startIndex,endIndex).forEach((item) =>{
            if(firstClassificationIngredientMap.has(item['成分分类'])){
                firstClassificationIngredientMap.set(item['成分分类'],
                firstClassificationIngredientMap.get(item['成分分类']).concat(item['加工后成分']))
            } else {
                firstClassificationIngredientMap.set(item['成分分类'], [item['加工后成分']])
            }
        })

        // 加工后成分去重
        for(let [key,value] of firstClassificationIngredientMap.entries()){
            firstClassificationIngredientMap.set(key,[...new Set(value)])
        }
        
        this.set({
            firstClassification,
            firstClassificationIngredientMap
        })
    }

    renderFirstClassificationIngredient = () => {
        const {firstClassificationIngredientMap} = this.get('firstClassification','firstClassificationIngredientMap')
        const firstPanelFragment = document.createDocumentFragment()
        for(let [classification,ingredientList] of firstClassificationIngredientMap.entries()){
            const panelItemInstance = new PanelItem({type:'first',classification,ingredientList})
            firstPanelFragment.appendChild(panelItemInstance.produce())
        }
        this.element.$firstClassPanel.appendChild(firstPanelFragment)

    }

}

class PanelItem{
    constructor({type, classification,ingredientList}){
        this.type = type;
        this.classification = classification;
        this.ingredientList = ingredientList;
    }

    produce = () => {
        const {type, classification,ingredientList} = this;
        const panelEle = document.createElement('div');
        panelEle.className = `panel ${type}-panel`;
        panelEle.innerHTML = `<div class='panel-title ${type}-panel-title'>${classification}</div>`;
        const ingredientWraper = document.createElement('div');
        ingredientWraper.className = 'ingredient-wrapper';
        const panelFragment = document.createDocumentFragment();
        ingredientList.forEach((ingredient)=>{
            const ingredientItem = document.createElement('div');
            ingredientItem.className = `ingredient-item ${type}-ingredient-item`;
            ingredientItem.innerHTML = ingredient
            panelFragment.appendChild(ingredientItem);
        });
        ingredientWraper.appendChild(panelFragment);
        panelEle.appendChild(ingredientWraper);

        return panelEle;

    }
}