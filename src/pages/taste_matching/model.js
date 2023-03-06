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
        const date_range  = [...new Set(this.data.map((item) =>item['月份']))];
        const last_date = date_range[date_range.length-1];
        this.element.$datePicker.value = `${last_date} 至 ${last_date}`;
        this.element.$datePicker.min = date_range[0];
        this.element.$datePicker.max = last_date;
    }

    computed = () =>{
    }



    bind = () =>{
        this.element.$datePicker.addEventListener('change', function () {
           
        });
    }



}