class TasteMatching {
    data = {}
    computedData = {
        dateRange: []
    }
    $datePickerEle = document.querySelector('#taste-matching-date-picker');
    constructor(initData){
        this.data = initData;
        this.init();
        this.computed();
        this.bind();
    }

    init = () =>{
        const { date_range } = this.data;
        const last_date = date_range[date_range.length-1]
        this.$datePickerEle.value = `${last_date} 至 ${last_date}`;
        this.$datePickerEle.min = date_range[0]
        this.$datePickerEle.max = last_date
    }

    computed = () =>{
        const { date_range } = this.data;
        this.computedData.dateRange = date_range.map((date) => parent.dayjs(date).unix())
    }



    bind = () =>{
        this.$datePickerEle.addEventListener('change', function () {
           
        });
    }



}