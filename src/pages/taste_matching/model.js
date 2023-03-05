class TasteMatching {
    data = {}
    $datePickerEle = document.querySelector('#taste-matching-date-picker');
    constructor(initData){
        this.data = initData;
        this.init();
        this.bind();
    }

    init(){
        const { date_range } = this.data;
        const last_date = date_range[date_range.length-1]
        this.$datePickerEle.value = `${last_date} 至 ${last_date}`;
        this.$datePickerEle.min = date_range[0]
        this.$datePickerEle.max = last_date
    }

    bind(){
        this.$datePickerEle.addEventListener('change', function () {
            console.log('选择的时间是：' + this.value);
        });
        this.$datePickerEle.addEventListener('show', function() {
            console.log(`显示了，ID是${ this.id }`);
        });
        this.$datePickerEle.addEventListener('hide', function(e) {
            console.log(`隐藏了，ID是${ this.id }`);
        });
    }



}