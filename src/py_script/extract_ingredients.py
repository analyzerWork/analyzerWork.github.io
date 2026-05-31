import json
import os
import glob


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
                # 按顿号拆分成列表
                ingredients_list = raw_ingredients.split('、')
                
                for ing in ingredients_list:
                    # 1. 彻底去除字符串中间和首尾的换行符(\n)、回车符(\r)
                    cleaned_ing = ing.replace('\n', '').replace('\r', '')
                    
                    # 2. 去除首尾可能存在的普通空格
                    cleaned_ing = cleaned_ing.strip()
                    
                    if cleaned_ing:
                        unique_ingredients.add(cleaned_ing)
        
        print(f"✅ 已处理文件: {os.path.basename(file)}")

    # 将集合转化为排序后的列表，方便阅读
    final_ingredients = sorted(list(unique_ingredients))
    print(f"\n🎉 提取完成！共计 {len(final_ingredients)} 种不重复的原料。")
    return final_ingredients



if __name__ == '__main__':
    input_dir = "../pages/datasource/clean_data"

    # 提取所有原料成分
    ingredients_array = extract_unique_ingredients(input_dir)

    # 将结果保存为一个新的JSON文件，可以取消下面的注释：
    with open("../pages/datasource/all_unique_ingredients.json", "w", encoding="utf-8") as f:
        json.dump(ingredients_array, f, ensure_ascii=False, indent=4)
