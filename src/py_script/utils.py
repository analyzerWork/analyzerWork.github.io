import json
import os
import glob

def analyze_product_and_ingredients(input_dir):
    """
    读取指定目录下所有 data_ 开头的 JSON 文件，
    1. 统计“茶饮”和“咖啡”对应的去重后的“产品类型”
    2. 分别统计去重后的“成分分类-茶饮”和“成分分类-咖啡”
    """
    # 初始化四个集合，分别用于存储去重后的数据
    product_types_by_category = {} # 存储产品类型
    tea_ingredients = set()        # 存储成分分类-茶饮
    coffee_ingredients = set()     # 存储成分分类-咖啡
    
    # 匹配 datasource 目录下所有 data_ 开头的 json 文件
    search_pattern = os.path.join(input_dir, "data_*.json")
    json_files = glob.glob(search_pattern)
    
    if not json_files:
        print(f"⚠️ 在 '{input_dir}' 目录下未找到以 'data_' 开头的 JSON 文件。")
        return

    print(f"🔍 找到 {len(json_files)} 个文件，开始分析数据...\n")
    
    for file in json_files:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for item in data:
            # 1. 统计产品类型（按产品大类区分）
            category = item.get("产品大类")
            product_type = item.get("产品类型")
            if category in ["茶饮", "咖啡"] and product_type:
                if category not in product_types_by_category:
                    product_types_by_category[category] = set()
                product_types_by_category[category].add(product_type)
            
            # 2. 统计成分分类-茶饮
            tea_class = item.get("成分分类-茶饮")
            if tea_class:
                tea_ingredients.add(tea_class)
            
            # 3. 统计成分分类-咖啡
            coffee_class = item.get("成分分类-咖啡")
            if coffee_class:
                coffee_ingredients.add(coffee_class)
        
        print(f"✅ 已处理文件: {os.path.basename(file)}")

    # 将集合转化为排序后的数组（列表）并组装最终结果
    result = {}
    
    # 处理产品类型
    for category in ["茶饮", "咖啡"]:
        if category in product_types_by_category:
            result[f"{category}_产品类型"] = sorted(list(product_types_by_category[category]))
        else:
            result[f"{category}_产品类型"] = []
            
    # 处理成分分类
    result["成分分类-茶饮"] = sorted(list(tea_ingredients))
    result["成分分类-咖啡"] = sorted(list(coffee_ingredients))

    return result

if __name__ == '__main__':
    data_dir = "../pages/datasource"
    
    # 执行分析函数
    final_result = analyze_product_and_ingredients(data_dir)
    
    # 格式化打印最终的数组结果
    print("\n最终统计结果（数组格式）：")
    print(json.dumps(final_result, ensure_ascii=False, indent=4))
    

