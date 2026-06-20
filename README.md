# Analyzer 

Enrich data analysis

1. 更新数据后,运行 py_script/clean_data.py 重新生成 cleaned_data 文件, 同时更新 all_unique_ingredients.json

2. AI 检查是否需要更新原料各维度规则: 成分的各个维度划分(关键词和正则表达式)如下,根据文件中的最新的成分数组,判断维度划分的关键词和正则表达式是否需要更新(删减\替换\新增),如果需要,准确描述需要更新的部分

