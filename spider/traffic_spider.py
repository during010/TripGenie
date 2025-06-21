import requests
from bs4 import BeautifulSoup
import scrapy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains
from scrapy.selector import Selector
from fake_useragent import UserAgent
import random
import time

# 模拟浏览器的请求头
headers = {
    'User - Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}


def get_all_bus_links():
    base_url = 'http://www.jnbus.com.cn/jnbus/line/list.jsp'
    try:
        response = requests.get(base_url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            bus_links = []
            # 根据页面结构获取所有公交线的链接
            for link in soup.select('div.line_list ul li a'):
                bus_links.append('http://www.jnbus.com.cn/jnbus/line/' + link['href'])
            return bus_links
        else:
            print(f"请求失败，状态码: {response.status_code}")
            return []
    except requests.RequestException as e:
        print(f"请求过程中出现异常: {e}")
        return []


def get_bus_info(bus_link):
    try:
        response = requests.get(bus_link, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # 获取公交名称
            bus_name = soup.select_one('div.line_title h2').text.strip()
            # 获取途径站点
            stations = []
            for station in soup.select('div.station_list li'):
                stations.append(station.text.strip())
            # 获取始发站和终点站
            start_station = stations[0] if stations else None
            end_station = stations[-1] if stations else None

            return {
                'bus_name': bus_name,
                'stations': stations,
                'start_station': start_station,
                'end_station': end_station
            }
        else:
            print(f"请求公交详情失败，状态码: {response.status_code}")
            return None
    except requests.RequestException as e:
        print(f"请求公交详情时出现异常: {e}")
        return None


if __name__ == '__main__':
    all_bus_links = get_all_bus_links()
    all_bus_info = []
    for bus_link in all_bus_links:
        bus_info = get_bus_info(bus_link)
        if bus_info:
            all_bus_info.append(bus_info)

    for info in all_bus_info:
        print(info)