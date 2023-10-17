import pandas as pd
import random

def test():
        fruit_list = ['苹果', '香蕉', '橙子', '梨',
                      '葡萄', '菠萝', '草莓', '蓝莓', '猕猴桃', '西瓜']
        date_range = pd.date_range(start='2019-12-01', end='2020-12-31', freq='MS').strftime("%Y-%m").tolist()

        # 创建空的 DataFrame
        df = pd.DataFrame(columns=['date', 'value', 'name'])
        
        # 对于每个日期，随机选择6-10个水果，并为每个水果生成一个随机值
        data_list = []
        for date in date_range:
            n = random.randint(6, 10)
            fruits = random.sample(fruit_list, n)
            for fruit in fruits:
                value = random.random()
                data_list.append({'date': date, 'value': value, 'name': fruit})

        df = pd.concat([df, pd.DataFrame(data_list)], ignore_index=True)

        # 计算环比，使用 group_keys=False 来避免警告
        df['circle_rate'] = df.groupby('name', group_keys=False)['value'].apply(lambda x: x / x.shift(1) - 1)

        # 创建一个新列 'month' 来存储年份和月份
        df['month'] = pd.to_datetime(df['date']).dt.to_period('M')

        # 找到第一个月并删除其所有数据
        first_month = df['month'].min()
        df = df[df['month'] != first_month]

        # 计算每个月的 circle_rate 的最大值
        max_circle_rate = df.groupby(df['month'])['circle_rate'].transform(max)
        pd.set_option('display.max_rows', 200)

        print(df)
        print('------------------')
        # 将 NaN 值替换为每个月的最大值
        df['circle_rate'] = df['circle_rate'].fillna(max_circle_rate)

        # 删除 'month' 列
        df = df.drop(columns=['month'])

        print(df)