import pandas as pd
import json

# 读取原始数据,转换为json格式
def transToJSON():
    try:
        df = pd.read_excel(r'./datasource/taste_matching.xlsx')

        df['月份']= df['月份'].dt.strftime('%Y-%m')
        
        df['品牌-产品名称-原料构成'] = df['品牌'] + '-' + df['产品名称'] + '-' + df['原料构成']


        df.to_json('./datasource/taste_matching.json',orient='records',force_ascii=False,indent=4)

        print('# success: Excel转换JSON数据成功 #')
    except:
        print('# error: Excel转换JSON数据失败 #')


# 读取转换好的原始json数据
def get_data():

    # 使用 Python JSON 模块载入数据
    try:
        with open('./datasource/taste_matching.json','r') as f:
            origin_data = json.loads(f.read())
            
        print('# success: 读取数据成功 #')
        return pd.json_normalize(origin_data)
    except:
        print('# error: 读取数据失败 #')


# 获取一级分类、一级分类:加工后成分映射关系（去重）
def get_first_classification_ingredient(data):
    first_classification = data['成分分类'].drop_duplicates().to_list()
    first_classification_ingredient_dict = {}

    for index, row in data.iterrows():
        key = row['成分分类']
        if key in first_classification_ingredient_dict:
            first_classification_ingredient_dict.get(key).append(row['加工后成分'])
        else:
            first_classification_ingredient_dict[key] = []

    # 去重处理
    for key,value in first_classification_ingredient_dict.items():
        first_classification_ingredient_dict[key] = list(set(value))
    
    return first_classification,first_classification_ingredient_dict
    
# 获取品牌-产品名称-原料构成列表作为辅助数据
def get_unique_product_brand_ingredient_list(data):
    unique_product_brand_ingredient_list = []
    for index, row in data.iterrows():
        unique_product_brand_ingredient_list.append('-'.join([row['品牌'],row['产品名称'],row['原料构成']]))
    return list(set(unique_product_brand_ingredient_list))

def get_second_classification_ingredient(data, first_class_ingredient):
    unique_product_brand_ingredient_list = data['品牌-产品名称-原料构成'].drop_duplicates().to_list()
    # 二级成分:出现次数映射关系
    second_ingredient_count_dict={}

    # 遍历unique_product_brand_ingredient_list,计算二级成分:出现次数映射关系
    for item in unique_product_brand_ingredient_list:
        # 获取品牌、产品名称、原料构成对应的二级成分
        second_ingredient_list = data[data['品牌-产品名称-原料构成'] == item]['加工后成分'].to_list()
        # 排除一级成分后的二级成分
        omit_first_second_ingredient_list = list(set(second_ingredient_list) - set(first_class_ingredient))
        # 统计二级成分出现次数
        for ingredient in omit_first_second_ingredient_list:
            if ingredient in second_ingredient_count_dict:
                second_ingredient_count_dict[ingredient] += 1
            else:
                second_ingredient_count_dict[ingredient] = 1

    # 获取二级创新成分分类:二级创新成分映射关系
    second_classification_ingredient_list_dict={
        'all':[]
    }

    # 遍历second_ingredient_count_dict
    for key,value in second_ingredient_count_dict.items():
        # 获取二级成分对应的二级创新成分分类
        second_classification = data[data['加工后成分'] == key]['成分分类'].to_list()[0]
        second_classification_ingredient_list_dict['all'].append(key)
        if second_classification in second_classification_ingredient_list_dict:
            second_classification_ingredient_list_dict[second_classification].append(key)
        else:
            second_classification_ingredient_list_dict[second_classification] = []

    return second_ingredient_count_dict, second_classification_ingredient_list_dict

# 获取产品示例
def get_product_list(data,first_class_ingredient, second_class_ingredient):
    # 分别获取一级成分、二级成分对应的品牌-产品名称-原料构成列表
    first_class_product_list = data[data['加工后成分'] == first_class_ingredient]['品牌-产品名称-原料构成'].to_list()
    second_class_product_list = data[data['加工后成分'] == second_class_ingredient]['品牌-产品名称-原料构成'].to_list()
    # 取交集
    product_list = list(set(first_class_product_list).intersection(second_class_product_list))
    return product_list

def init():
    #transToJSON()

    data = get_data()

    # first_classification, first_classification_ingredient_dict = get_first_classification_ingredient(data)

    # second_ingredient_count_dict, second_classification_ingredient_list_dict = get_second_classification_ingredient(data,'桃子')
    
    product_list = get_product_list(data,'桃子','草莓')
    # return first_classification, first_classification_ingredient_dict, second_ingredient_count_dict, second_classification_ingredient_list_dict,product_list


init()