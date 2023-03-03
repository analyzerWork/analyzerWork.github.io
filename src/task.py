import pandas as pd


def transferDate(para):
    delta = pd.Timedelta(str(int(para))+'days')
    time = pd.to_datetime("1899/12/30") + delta
    return time

def transToJSON():
    try:
        df = pd.read_excel(r'./datasource/data.xlsx')

        df['月份']= df['月份'].dt.strftime('%Y-%m')

        df.to_json('./datasource/origin_data.json',orient='records',force_ascii=False,indent=4)

        print('# success: Excel转换JSON数据成功 #')
    except:
        print('# error: Excel转换JSON数据失败 #')


def main():
    transToJSON()


main()