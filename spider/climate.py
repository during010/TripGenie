import datetime
import os
import random
import csv

from bs4 import BeautifulSoup
import requests


# 得到网页并用bs4进行网页解析
def getHtml(url):
    # 请求头被封，于是采用多个请求头，每次随机用一个，防止被服务器识别为爬虫
    user_agent_list = [
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
        "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)",
        "Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.5; en-US; rv:1.9.2.15) Gecko/20110303 Firefox/3.6.15",
        "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Maxthon 2.0)",
        "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; TencentTraveler 4.0)",
        "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
        "Mozilla/4.0 (compatible; MSIE 6.0; ) Opera/UCWEB7.0.2.37/28/999",
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; HTC; Titan)"
    ]
    header = {'User-Agent': random.choice(user_agent_list)}
    # 如果超时，重新进行三次连接
    reconnect = 0
    while reconnect < 3:
        try:
            with requests.get(url=url, headers=header, stream=True, timeout=20) as rep:
                # 得到中文乱码，查询网页编码方式为utf-8
                rep.encoding = 'utf-8'
                # 解析网页
                soup = BeautifulSoup(rep.text, 'html.parser')
                return soup
        except (requests.exceptions.RequestException, ValueError):
            reconnect += 1
    return None


# 获取天气数据
def get_content(soup, i):
    try:
        # 返回的是从今天开始的天气，下标[i]表示第i天
        wea = soup.find_all(name="p", attrs={"class": "wea"})
        tem = soup.find_all(name="p", attrs={"class": "tem"})
        win = soup.find_all(name="p", attrs={"class": "win"})

        if i >= len(wea) or i >= len(tem) or i >= len(win):
            return None, None, None, None, None, None

        weather = wea[i].text.replace('\n', '')
        temperature = tem[i].text.strip()
        wind_direction = win[i].find(name="span")['title']
        wind_scale = win[i].find(name="i").text

        # 解析最高气温和最低气温
        temp_parts = temperature.split('/')
        if len(temp_parts) == 2:
            high_temp = temp_parts[0].strip()
            low_temp = temp_parts[1].strip()
        else:
            high_temp = temperature
            low_temp = ""

        return weather, temperature, high_temp, low_temp, wind_direction, wind_scale
    except (IndexError, TypeError):
        return None, None, None, None, None, None


if __name__ == '__main__':
    file = r"./天气.csv"
    if os.path.exists(file):
        os.remove(file)
    url = 'http://www.weather.com.cn/weather/101120101.shtml'
    soup = getHtml(url)
    if soup:
        with open(file, mode='a', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["日期", "天气", "气温", "最高气温", "最低气温"])  # 写入表头
            for i in range(7):  # 获取7天的天气数据
                time = datetime.date.today() + datetime.timedelta(days=i)
                weather, temperature, high_temp, low_temp, wind_direction, wind_scale = get_content(soup, i)
                if weather is None:
                    print(f"第 {i + 1} 天的天气数据不存在")
                    break  # 如果没有更多天气数据，退出循环
                writer.writerow([time, weather, temperature, high_temp, low_temp])
    else:
        print("获取网页内容失败")