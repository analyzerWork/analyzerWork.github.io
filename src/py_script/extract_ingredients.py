import json
import os
import glob


def extract_unique_ingredients(input_dir):
    """
    统计指定目录下所有清洗后的JSON文件，按“产品大类”分类，
    提取并去重各类别下的所有“原料构成”。
    """
    # 使用字典来存储不同类别的原料集合
    # 结构示例: {"茶饮": {"草莓", "牛奶"}, "咖啡": {"咖啡豆", "糖浆"}}
    ingredients_by_category = {}

    # 匹配 clean_data 目录下所有的 _cleaned.json 文件
    search_pattern = os.path.join(input_dir, "*_cleaned.json")
    json_files = glob.glob(search_pattern)

    if not json_files:
        print(f"⚠️ 在 '{input_dir}' 目录下未找到以 '_cleaned.json' 结尾的文件。")
        return {}

    print(f"🔍 找到 {len(json_files)} 个文件，开始按类别提取原料...\n")

    for file in json_files:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for item in data:
            # 获取当前数据的产品大类
            category = item.get("产品大类")
            raw_ingredients = item.get("原料构成", "")

            # 如果没有产品大类或原料构成，则跳过
            if not category or not raw_ingredients:
                continue

            # 如果这个类别还没在字典里，就为它创建一个新的集合
            if category not in ingredients_by_category:
                ingredients_by_category[category] = set()

            # 按顿号拆分成列表，并进行清洗去重
            ingredients_list = raw_ingredients.split('、')
            for ing in ingredients_list:
                # 彻底去除字符串中间和首尾的换行符(\n)、回车符(\r)及空格
                cleaned_ing = ing.replace('\n', '').replace('\r', '').strip()
                if cleaned_ing:
                    # 将清洗后的原料加入对应类别的集合中
                    ingredients_by_category[category].add(cleaned_ing)

        print(f"✅ 已处理文件: {os.path.basename(file)}")

    # 将字典中的集合转化为排序后的列表，方便阅读和保存
    final_result = {}
    total_count = 0
    for category, ingredients_set in ingredients_by_category.items():
        sorted_list = sorted(list(ingredients_set))
        final_result[category] = sorted_list
        count = len(sorted_list)
        total_count += count
        print(f"📊 类别【{category}】提取完成，共计 {count} 种不重复原料。")

    print(f"\n🎉 全部提取完成！所有类别累计 {total_count} 种原料。")
    return final_result


if __name__ == '__main__':
    # 假设清洗后的文件都在 datasource/clean_data 目录下
    clean_data_dir = "../pages/datasource/clean_data"

    # 执行提取函数
    categorized_ingredients = extract_unique_ingredients(clean_data_dir)

    # 将结果保存为一个新的JSON文件
    output_file = "ingredients_by_category.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(categorized_ingredients, f, ensure_ascii=False, indent=4)
    print(f"📂 分类原料数组已保存至: {output_file}")

