import json

def split_json_by_year(input_file):
    """
    按年份将JSON文件拆分为不同的文件。
    
    参数:
    input_file (str): 原始JSON文件的路径
    """
    # 1. 读取原始JSON文件
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 2. 创建一个字典，用于按年份分组存储数据
    # 例如: {'2026': [数据1, 数据2], '2024': [数据3]}
    data_by_year = {}
    
    for item in data:
        # 从 "月份" 字段中提取年份 (例如从 "2026-03" 中提取 "2026")
        month_str = item.get("月份")
        if month_str:
            year = month_str.split('-')[0]
            
            # 如果该年份的列表还不存在，就创建一个空列表
            if year not in data_by_year:
                data_by_year[year] = []
            
            # 将当前数据添加到对应年份的列表中
            data_by_year[year].append(item)
    
    # 3. 将分组后的数据分别写入不同的JSON文件
    for year, items in data_by_year.items():
        output_filename = f"../pages/datasource/data_{year}.json"
        with open(output_filename, 'w', encoding='utf-8') as f:
            # ensure_ascii=False 保证中文能正常显示，indent=4 让文件排版更美观
            json.dump(items, f, ensure_ascii=False, indent=4)
            print(f"已成功生成文件: {output_filename}，包含 {len(items)} 条数据")

# 使用示例
if __name__ == '__main__':
    split_json_by_year('../pages/datasource/taste_matching_v2.json')