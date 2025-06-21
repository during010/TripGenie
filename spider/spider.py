
print("开始爬取济南景点信息，请稍候...")
print("随买随用，可订今日，随时退;https://dimg04.c-ctrip.com/images/0101012000f6t2g7s0322_C_220_140.jpg?proc=autoorient;趵突泉景区;5A;看泉水喷发的壮丽景象，遛娃宝藏地;2024中国100必打卡景点;8.8;4.6;3.5万条点评;大明湖/泉城广场;距市中心9.4km;门票；40")
print("随买随用，可订今日，随时退;https://dimg04.c-ctrip.com/images/0100612000j05h1njCBAC_C_220_140.jpg?proc=autoorient;千佛山;4A;山顶可俯瞰济南市区全景，遛娃宝藏地;济南必打卡景点榜 No.1;7.7;4.6;5704条点评;千佛山/舜耕会展中心;距市中心7.6km;门票；30")
print("https://dimg04.c-ctrip.com/images/100g1f000001gqzyj0422_C_220_140.jpg?proc=autoorient;大明湖景区;风光秀美的天然泉水湖公园，踏青必去;山东夜游必打卡榜 No.6；7.7;4.6;3610条点评;大明湖/泉城广场;距市中心8.8km;，免费；0")

import requests
import time
import random
import csv
import os

import requests
import time
import random
import csv

print("开始爬取济南景点信息，请稍候...")

cookies = {
    'UBT_VID': '1742263689725.ead7Lyrou5NJ',
    'MKT_CKID': '1742263690764.l71h7.z46g',
    'GUID': '09031050318829710128',
    '_RSG': 'zJqhAvQg_R8pJ6EcSZ53WB',
    '_RDG': '28e9bf1c7bbe6a2ed8287ff6803fdfaad4',
    '_RGUID': '86ffa9ae-4aaf-44fd-b803-1637263864f3',
    'nfes_isSupportWebP': '1',
    '_ga': 'GA1.1.1038787724.1742264322',
    '_bfaStatusPVSend': '1',
    'cticket': '088B6EDFB8B82FEC602800B0A6B1BEADD2D3DCE9CC353DDC7966630C915F6C82',
    'login_type': '0',
    'login_uid': '7458E0A8D5115E1C17762A2996465048',
    'DUID': 'u=261E4E243A132C6C0150E6D8AB9FE139&v=0',
    'IsNonUser': 'F',
    'AHeadUserInfo': 'VipGrade=5&VipGradeName=%B0%D7%D2%F8%B9%F3%B1%F6&UserName=&NoReadMessageCount=0',
    '_RF1': '2001%3Ada8%3A7001%3A2000%3A%3A2648',
    'MKT_Pagesource': 'PC',
    '_ubtstatus': '%7B%22vid%22%3A%221742263689725.ead7Lyrou5NJ%22%2C%22sid%22%3A8%2C%22pvid%22%3A13%2C%22pid%22%3A600001375%7D',
    '_bfi': 'p1%3D290532%26p2%3D10650142842%26v1%3D9%26v2%3D8; _bfaStatus=send',
    '_bfaStatus': 'success',
    'Hm_lvt_a8d6737197d542432f4ff4abc6e06384': '1742264322,1742605120,1743495523,1743841241',
    'HMACCOUNT': '9CDC6C061B5D40E0',
    '_ga_9BZF483VNQ': 'GS1.1.1743841241.4.0.1743841246.0.0.0',
    '_ga_5DVRDQD429': 'GS1.1.1743841241.4.0.1743841246.0.0.0',
    '_ga_B77BES1Z8Z': 'GS1.1.1743841241.4.0.1743841246.55.0.0',
    '_jzqco': '%7C%7C%7C%7C1743841242061%7C1.1481155731.1742263690770.1743851294193.1743852374872.1743851294193.1743852374872.undefined.0.0.55.55',
    '_bfa': '1.1742263689725.ead7Lyrou5NJ.1.1743851293835.1743852374601.9.3.290510;',
}
headers = {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/json',
    'cookieorigin': 'https://you.ctrip.com',
    'origin': 'https://you.ctrip.com',
    'priority': 'u=1, i',
    'referer': 'https://you.ctrip.com/',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
}

# x-traceID的生成
n1 = int(time.time() * 1000)
n2 = int(1e7 * random.random())
t = cookies.get("GUID")
n = f'{t}-{n1}-{n2}'

params = {
    '_fxpcqlniredt': t,
    'x-traceID': n,
}

# 定义 CSV 文件的列名
fieldnames = ['poiName', 'price', 'features', 'sightCategoryInfo', 'commentScore', 'heatScore', 'districtName',
              'displayField', 'url']

# 打开 CSV 文件以写入数据
with open('jinan_scenic_spots.csv', mode='w', newline='', encoding='utf-8-sig') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    # 写入 CSV 文件的表头
    writer.writeheader()

    for index in range(1, 301):
        json_data = {
            'head': {
                'cid': t,
                'ctok': '',
                'cver': '1.0',
                'lang': '01',
                'sid': '8888',
                'syscode': '999',
                'auth': '',
                'xsid': '',
                'extension': [],
            },
            'scene': 'online',
            'districtId': 100074,  # 假设济南的 districtId 为 100074，需根据实际调整
            'index': index,
            'sortType': 1,
            'count': 10,
            'filter': {
                'filterItems': [
                    '0',
                ],
            },
            'coordinate': {
                'latitude': 36.675808,  # 济南的纬度
                'longitude': 117.021706,  # 济南的经度
                'coordinateType': 'WGS84',
            },
            'returnModuleType': 'all',
        }
        try:
            resp = requests.post(
                "https://m.ctrip.com/restapi/soa2/18109/json/getAttractionList",
                headers=headers,
                cookies=cookies,
                params=params,
                json=json_data
            )
            resp.raise_for_status()
            html_json = resp.json()

            for i in range(0, 10):
                try:
                    card = html_json['attractionList'][i]['card']
                    # 不会缺少的数据量
                    poiName = card['poiName']  # 景点名
                    districtName = card['districtName']  # 城市
                    displayField = card['displayField']  # 地址
                    url = card['detailUrlInfo']['url']  # 链接

                    # 部分会缺少的数据量，用get设置默认值
                    commentScore = card.get('commentScore', 0)  # 评分
                    heatScore = card.get('heatScore', 0)  # 热度
                    price = card.get('price', '未提供')  # 门票
                    features = card.get('shortFeatures', ['未提供'])[0]  # 特点
                    sightCategoryInfo = card.get('sightCategoryInfo', '未提供')  # 类别

                    # 将数据写入 CSV 文件
                    writer.writerow({
                        'poiName': poiName,
                        'price': price,
                        'features': features,
                        'sightCategoryInfo': sightCategoryInfo,
                        'commentScore': commentScore,
                        'heatScore': heatScore,
                        'districtName': districtName,
                        'displayField': displayField,
                        'url': url
                    })
                except (KeyError, IndexError):
                    print(f"第{index}页的第{i + 1}个信息框出错")
        except requests.RequestException as e:
            print(f"第{index}页请求出错: {e}")
        finally:
            print(f"第{index}页爬取成功")
            # 随机间隔时间，避免被反爬机制拦截
            time.sleep(random.uniform(1, 3))
