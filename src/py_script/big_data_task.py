"""
大数据表处理
"""
import os
import sys
import pandas as pd

sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from py_package.utils import message, format_month

print(pd.__version__)


class BigDataTask:

    def __init__(self, options):
        self.options = options
        self.data = pd.DataFrame([])

    def exec(self):
        if self.options.get('isDataTransfer') == True:
            self.transToJSON()

    # 读取原始数据,转换为json格式
    def transToJSON(self):
        log_message = 'bigdata.xlsx - Excel 转换 JSON 数据'
        try:
            df = pd.read_excel(
                r'../pages/datasource/bigdata.xlsx',)
            df['月份'] = df['月份'].astype(str).apply(format_month)
            df = df.sort_values(by='月份')
            # 只保留成分分类是果味和乳基底的数据
            df = df[df['成分分类'].isin(['果味','乳基底'])]
            
            df['当月声量环比增长'] = df.groupby('趋势名称',group_keys=False)['当月声量'].apply(lambda x: x / x.shift(1) - 1)
            
            # 创建一个新列 'month' 来存储年份和月份
            df['month'] = pd.to_datetime(df['月份']).dt.to_period('M')

            # 找到第一个月并删除其所有数据
            first_month = df['month'].min()
            df = df[df['month'] != first_month]

            # 计算每个月的 当月声量环比增长 的最大值
            max_rate = df.groupby(df['month'])['当月声量环比增长'].transform(max)

            # 将 NaN 值替换为每个月的最大值
            df['当月声量环比增长'] = df['当月声量环比增长'].fillna(max_rate)

            # 删除 'month' 列
            df = df.drop(columns=['month'])
            df.to_json('../pages/datasource/bigdata.json',
                       orient='records',
                       force_ascii=False,
                       indent=4)

            message.get('success')(log_message)
        except Exception as e:
            message.get('error')(log_message, e)


bigDataTaskInstance = BigDataTask({
    'isDataTransfer': True,
})



bigDataTaskInstance.exec()
