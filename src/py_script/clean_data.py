import json
import os
import glob

def process_year_file(input_file, output_dir):
    """
    处理单个年份的JSON文件：
    1. 在文件内部按“月份”分组。
    2. 在每个“月份”内部，按之前的逻辑进行去重。
    3. 剔除不需要的字段，并根据“产品大类”动态保留对应的“成分分类”字段。
    4. 最终按“年份”输出。
    """
    # 1. 读取原始JSON文件
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 从文件名中提取年份
    base_name = os.path.basename(input_file)
    year = base_name.replace('data_', '').replace('.json', '')
    
    # 2. 按“月份”对数据进行分组
    data_by_month = {}
    for item in data:
        month = item.get("月份")
        if not month:
            continue
            
        if month not in data_by_month:
            data_by_month[month] = []
        data_by_month[month].append(item)
    
    print(f"📂 文件 {input_file} 包含 {len(data_by_month)} 个月份的数据。")

    # 3. 遍历每个月份，在月份内部进行去重和字段处理
    final_cleaned_data = []
    
    for month, month_items in data_by_month.items():
        seen_keys = set()
        
        for item in month_items:
            # 按之前的逻辑构建唯一 key
            unique_key = (
                item.get("品牌"),
                item.get("产品名称"),
                item.get("原料构成")
            )
            
            if unique_key not in seen_keys:
                # --- 字段剔除与动态保留逻辑开始 ---
                
                # 1. 剔除绝对不需要的字段
                item.pop("基础成分", None)
                item.pop("加工后成分", None)
                
                # 2. 根据“产品大类”动态保留对应的“成分分类”字段
                product_category = item.get("产品大类")
                if product_category == "茶饮":
                    item.pop("成分分类-咖啡", None)  # 是茶饮，删掉咖啡分类
                elif product_category == "咖啡":
                    item.pop("成分分类-茶饮", None)  # 是咖啡，删掉茶饮分类
                # 如果产品大类既不是茶饮也不是咖啡，则两个分类字段都保留（或者你可以根据需求选择都删掉）
                
                # --- 字段剔除与动态保留逻辑结束 ---
                
                final_cleaned_data.append(item)
                seen_keys.add(unique_key)
        
        print(f"   🗓️ 月份 {month}: 原始 {len(month_items)} 条 -> 去重后 {len(seen_keys)} 条")

    # 4. 将处理完所有月份的数据，依然按年份输出
    output_file = os.path.join(output_dir, f"data_{year}_cleaned.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_cleaned_data, f, ensure_ascii=False, indent=4)
        
    print(f"✅ 年份 {year} 处理完成！最终输出 {len(final_cleaned_data)} 条数据 | 保存至: {output_file}\n")


def extract_unique_ingredients(input_dir):
    """
    统计指定目录下所有清洗后的JSON文件，提取并去重所有的“原料构成”。
    """
    unique_ingredients = set()  # 使用集合自动去重
    
    # 匹配 clean_data 目录下所有的 _cleaned.json 文件
    search_pattern = os.path.join(input_dir, "*_cleaned.json")
    json_files = glob.glob(search_pattern)
    
    if not json_files:
        print(f"⚠️ 在 '{input_dir}' 目录下未找到以 '_cleaned.json' 结尾的文件。")
        return []

    print(f"🔍 找到 {len(json_files)} 个文件，开始提取原料...\n")
    
    for file in json_files:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for item in data:
            raw_ingredients = item.get("原料构成", "")
            if raw_ingredients:
                # 原料构成是以顿号分隔的字符串，按顿号拆分成列表
                ingredients_list = raw_ingredients.split('、')
                # 去除每个原料可能存在的空格，并加入集合中
                for ing in ingredients_list:
                    unique_ingredients.add(ing.strip())
        
        print(f"✅ 已处理文件: {os.path.basename(file)}")

    # 将集合转化为排序后的列表，方便阅读
    final_ingredients = sorted(list(unique_ingredients))
    print(f"\n🎉 提取完成！共计 {len(final_ingredients)} 种不重复的原料。")
    return final_ingredients

if __name__ == '__main__':
    # 定义输入和输出目录
    input_dir = "../pages/datasource"
    output_dir = "../pages/datasource/clean_data"
    
    
    # 确保输出目录存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📂 已自动创建输出目录: {output_dir}\n")

    # 匹配 datasource 目录下所有 data_ 开头的 json 文件
    search_pattern = os.path.join(input_dir, "data_*.json")
    json_files = [f for f in glob.glob(search_pattern) if not f.endswith("_cleaned.json")]
    
    if not json_files:
        print(f"⚠️ 在 '{input_dir}' 目录下未找到以 'data_' 开头的 JSON 文件。")
    else:
        print(f"🔍 找到 {len(json_files)} 个年份文件，开始批量处理...\n")
        
        for input_file in json_files:
            process_year_file(input_file, output_dir)
            
        print("🎉 所有年份文件处理完毕！")
        
        extract_unique_ingredients(output_dir)
        

        
        