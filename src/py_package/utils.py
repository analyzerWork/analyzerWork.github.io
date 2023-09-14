def unique_list(data):
    return list(data.filter(lambda x: data.count(x) == 1, data))

## 月份格式化 202301 -> 2023-01
def format_month(month):
    return '{}-{}'.format(month[:4], month[4:])

message = {
    'error': lambda info,e: 
        print("\033[0;31;40m{}\033[0m".format('error: '+ info + '失败' + '\t' + str(e))),
    'warning': lambda info: print("\033[0;33;40m{}\033[0m".format('warning: ' + info)),
    'success': lambda info: print("\033[0;32;40m{}\033[0m".format('success: ' + info + '成功')),
}
