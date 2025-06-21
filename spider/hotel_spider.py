import scrapy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains
from scrapy.selector import Selector
from fake_useragent import UserAgent
import random
import time


class CtripJinanSpider(scrapy.Spider):
    name = 'ctrip_jinan'
    allowed_domains = ['hotels.ctrip.com']
    start_urls = ['https://hotels.ctrip.com/hotel/jinan144']

    def __init__(self):
        ua = UserAgent()
        user_agent = ua.random
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument(f"user-agent={user_agent}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1280,800")
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(30)

    def parse(self, response):
        self.driver.get(response.url)
        time.sleep(random.uniform(2, 4))

        # 检测滑块页面并处理
        if "verify" in self.driver.current_url or "yoda" in self.driver.page_source:
            self.logger.info("检测到滑块验证，开始处理...")
            if not self.solve_slider():
                self.logger.warning("滑块处理失败，跳过本次抓取")
                return

        hotel_id = 1
        page_index = 1

        while True:
            self.logger.info(f"正在抓取第 {page_index} 页...")
            self.scroll_to_bottom()
            sel = Selector(text=self.driver.page_source)

            hotels = sel.css('ul.hotel-list li.hotel_new_list')
            if not hotels:
                self.logger.warning("页面未找到酒店数据，终止爬取")
                break

            for hotel in hotels:
                name = hotel.css('h2.hotel_name a::attr(title)').get()
                rank = hotel.css('.hotel_guide::text').get() or '无星级'
                data_lat = hotel.attrib.get("data-lat")
                data_lon = hotel.attrib.get("data-lon")
                data_x = hotel.attrib.get("data-mapx")
                data_y = hotel.attrib.get("data-mapy")

                yield {
                    "id": hotel_id,
                    "name": name.strip() if name else None,
                    "rank": rank.strip(),
                    "x": data_x,
                    "y": data_y,
                    "lon": data_lon,
                    "lat": data_lat
                }
                hotel_id += 1

            # 翻页操作
            try:
                next_btn = self.driver.find_element(By.CSS_SELECTOR, 'a.down')
                if "disabled" in next_btn.get_attribute("class"):
                    self.logger.info("到达最后一页，结束抓取。")
                    break
                self.driver.execute_script("arguments[0].click();", next_btn)
                time.sleep(random.uniform(2, 4))
                page_index += 1
            except Exception as e:
                self.logger.warning(f"翻页失败: {e}")
                break

        self.driver.quit()

    def scroll_to_bottom(self):
        """模拟页面下滑加载"""
        for _ in range(3):
            self.driver.execute_script("window.scrollBy(0, document.body.scrollHeight/2);")
            time.sleep(random.uniform(1, 2))

    def solve_slider(self):
        """处理携程滑块验证码（Yoda）"""
        try:
            slider = self.driver.find_element(By.CLASS_NAME, 'yoda-slider')
            knob = slider.find_element(By.CLASS_NAME, 'yoda-slider-knob')
            ActionChains(self.driver).click_and_hold(knob).perform()
            time.sleep(0.2)

            # 构造轨迹
            distance = 310 + random.randint(0, 10)
            moved = 0
            while moved < distance:
                move = random.randint(6, 10)
                ActionChains(self.driver).move_by_offset(move, 0).perform()
                moved += move
                time.sleep(random.uniform(0.01, 0.03))

            # 回拉一点
            ActionChains(self.driver).move_by_offset(-3, 0).perform()
            time.sleep(0.02)
            ActionChains(self.driver).move_by_offset(3, 0).perform()
            ActionChains(self.driver).release().perform()
            time.sleep(3)

            return "verify" not in self.driver.current_url
        except Exception as e:
            self.logger.error(f"滑块处理失败: {e}")
            return False
