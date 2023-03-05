def unique_list(data):
    return list(data.filter(lambda x: data.count(x) == 1, data))