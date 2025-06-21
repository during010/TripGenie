import json
import scrapy
from scrapy.http import TextResponse
import time
import random
import base64
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import cv2
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

class DianpingSpider(scrapy.Spider):
    name = 'dianping'
    allowed_domains = ['dianping.com']
    start_urls = ['https://www.dianping.com/jinan/ch10']  # 起始的 URL

    def parse(self, response):
        # 如果页面包含验证码相关内容，使用 Selenium 获取页面
        if 'verify.meituan.com' in response.url:
            self.logger.warning(f'被验证界面阻塞: {response.url}')
            page_source = get_page_with_selenium(response.url)
            if "验证失败！！！！!" in page_source:
                self.logger.error('验证失败不能继续爬虫..........')
                return  # 如果验证失败，则不再继续抓取
            # 使用 Selenium 获取的页面内容生成 Scrapy 响应对象
            response = TextResponse(url=response.url, body=page_source, encoding='utf-8')

        # 正常解析页面的逻辑
        stores = response.xpath('//div[@class="shop-list J_shop-list shop-all-list"]/ul/li')
        for store in stores:
            yield {
                'name': store.xpath('.//div[@class="tit"]/a/h4/text()').get(),
                'address': store.xpath('.//div[@class="tag-addr"]/a/span[@class="tag"]/text()').getall()[-1],
                'cuisine': store.xpath('.//div[@class="tag-addr"]/a/span[@class="tag"]/text()').get(),
                'average_price': store.xpath('.//div[@class="comment"]/a[@class="mean-price"]/b/text()').get(),
                'comments_number': store.xpath('.//div[@class="comment"]/a[@class="review-num"]/b/text()').get(),
                'link': store.xpath('.//div[@class="tit"]/a/@href').get(),
                'recommendations': store.xpath('.//div[@class="recommend"]/a[@class="recommend-click"]/text()').getall()
            }

        # 翻页处理
        next_page = response.xpath('//a[@class="next"]/@href').get()
        if next_page:
            yield response.follow(next_page, self.parse)

    def start_requests(self):
        with open('E:/pythoncode/dianping_scraper/dianping_scraper/cookies.json', 'r', encoding='utf-8') as json_file:
            cookies = json.load(json_file)

        for url in self.start_urls:
            yield scrapy.Request(url, cookies=cookies, callback=self.parse)


def get_page_with_selenium(url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 无头模式
    driver = webdriver.Chrome(options=options)
    driver.get(url)

    # 等待页面加载
    time.sleep(3)  # 等待页面加载并显示验证码

    try:
        # 处理滑块图像（puzzleSliderDrag）
        puzzle_slider_drag = driver.find_element(By.ID, "puzzleSliderDrag")
        style = puzzle_slider_drag.get_attribute('style')
        # 提取Base64编码的滑块图像部分
        if 'background-image' in style:
            base64_str_slider = style.split('background-image: url("')[1].split('")')[0]
            base64_str_slider = base64_str_slider.replace("&quot;", "")
            base64_str_slider = base64_str_slider.split('base64,')[1]
            img_data_slider = base64.b64decode(base64_str_slider)
            with open('slider_image.png', 'wb') as f:
                f.write(img_data_slider)
            print("滑块图片已保存为 'slider_image.png'")

            # 调用识别函数，获取滑块位置
            slider_x = detect_slider_gap("slider_image.png")
            if slider_x is None:
                raise Exception("未能识别出缺口，验证中断")

        # 捕捉验证码区域
        puzzle_image_element = driver.find_element(By.XPATH, "//div[@class='puzzle-main']//div[@class='puzzle-slider-image']")
        # 获取图片的背景图片URL (base64 编码)
        image_url = puzzle_image_element.value_of_css_property('background-image')
        # 提取Base64编码的图片部分
        base64_str = image_url.split('base64,')[1].strip('")')
        # 保存Base64编码的图片
        img_data = base64.b64decode(base64_str)
        with open('captcha_image.png', 'wb') as f:
            f.write(img_data)
        print("验证码图片已保存为 'captcha_image.png'")
        # 调用识别函数，获取缺口位置
        gap_x = detect_puzzle_gap("captcha_image.png")
        if gap_x is None:
            raise Exception("未能识别出缺口，验证中断")

        # 拖动滑块
        slider = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "puzzleSliderMoveingBar"))
        )
        action = ActionChains(driver)
        action.click_and_hold(slider).perform()
        gap_x=gap_x/888*296
        slider_x=slider_x/280*93.292

        # 更自然的拖动方式：模拟不规则的速度和小停顿
        total_offset = gap_x - slider_x  # 滑动距离（缺口位置 - 滑块位置）

        print(f"gap_x: {gap_x}, slider_x: {slider_x}, total_offset: {total_offset}")

        moved = 0
        while moved < total_offset:
            step = random.randint(5, 10)
            if moved + step > total_offset:
                step = total_offset - moved
            action.move_by_offset(step, 0).perform()
            moved += step
            time.sleep(random.uniform(0.01, 0.03))

        action.release().perform()

        # 等待验证码验证结果
        time.sleep(5)

        if 'verify.meituan.com' in driver.current_url:
            raise Exception("验证失败！！！！!")

        page_source = driver.page_source
        driver.quit()
        return page_source
    except Exception as e:
        driver.quit()
        print(f"错误发生: {str(e)}")
        return str(e)

def detect_puzzle_gap(image_path):
    # 加载图像
    image = cv2.imread(image_path)
    if image is None:
        print(f"无法加载图像: {image_path}")
        return None

    # 转为灰度图像
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite('gray_image.png', gray)  # 保存灰度图像用于调试
    print("灰度图像保存为 'gray_image.png'")

    # 对灰度图像进行高斯模糊
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)  # 调整核大小
    cv2.imwrite('blurred_image.png', blurred)  # 保存模糊图像用于调试
    print("模糊图像保存为 'blurred_image.png'")

    # 使用 Canny 算法做边缘检测
    edges = cv2.Canny(blurred,140, 180)  # 调整阈值
    cv2.imwrite('edges_image.png', edges)  # 保存边缘检测结果用于调试
    print("边缘检测图像保存为 'edges_image.png'")

    # 寻找轮廓
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print(f"找到 {len(contours)} 个轮廓")

    # 存储符合条件的候选框
    candidate_boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)  # 使用 boundingRect 计算每个轮廓的最小外接矩形
        area = cv2.contourArea(cnt)
        # 根据面积、宽度和高度来筛选潜在的滑块缺口区域
        if 90 < w < 120 and 90 < h < 120 and 8000 < area :  # 调整筛选条件
            candidate_boxes.append((x, y, w, h))

    print(f"候选框数: {len(candidate_boxes)}")

    # 按x坐标从左到右排序
    candidate_boxes.sort(key=lambda box: box[0])

    # 如果有符合条件的候选框
    if candidate_boxes:
        best_match = candidate_boxes[0]
        print(f"识别到的缺口位置: x = {best_match[0]}, 宽度 = {best_match[2]}, 高度 = {best_match[3]}")

        # 在原图上绘制候选框，帮助调试
        for box in candidate_boxes:
            cv2.rectangle(image, (box[0], box[1]), (box[0] + box[2], box[1] + box[3]), (0, 255, 0), 2)

        cv2.imwrite('debug_image_with_boxes.png', image)  # 保存包含候选框的图像用于调试
        print("带有候选框的调试图像已保存为 'debug_image_with_boxes.png'")
        return best_match[0]  # 返回缺口的x坐标
    else:
        print("未识别到缺口区域")
        return None
def detect_slider_gap(image_path):
    # 加载图像
    image = cv2.imread(image_path)
    if image is None:
        print(f"无法加载图像: {image_path}")
        return None

    # 转为灰度图像
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite('slider_gray_image.png', gray)  # 保存灰度图像用于调试
    print("灰度图像保存为 'slider_gray_image.png'")

    # 对灰度图像进行高斯模糊
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)  # 调整核大小
    cv2.imwrite('slider_blurred_image.png', blurred)  # 保存模糊图像用于调试
    print("模糊图像保存为 'slider_blurred_image.png'")

    # 使用 Canny 算法做边缘检测
    edges = cv2.Canny(blurred, 100, 150)  # 调整阈值
    cv2.imwrite('slider_edges_image.png', edges)  # 保存边缘检测结果用于调试
    print("边缘检测图像保存为 'slider_edges_image.png'")

    # 寻找轮廓
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print(f"找到 {len(contours)} 个轮廓")

    # 存储符合条件的候选框
    candidate_boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)  # 使用 boundingRect 计算每个轮廓的最小外接矩形
        area = cv2.contourArea(cnt)
        # 根据面积、宽度和高度来筛选潜在的滑块缺口区域
        if 90 < w < 120 and 90 < h < 120 and 8000 < area <10000 :  # 调整筛选条件
            candidate_boxes.append((x, y, w, h))

    print(f"候选框数: {len(candidate_boxes)}")

    # 按x坐标从左到右排序
    candidate_boxes.sort(key=lambda box: box[0])

    # 如果有符合条件的候选框
    if candidate_boxes:
        best_match = candidate_boxes[0]
        print(f"识别到的缺口位置: x = {best_match[0]}, 宽度 = {best_match[2]}, 高度 = {best_match[3]}")

        # 在原图上绘制候选框，帮助调试
        for box in candidate_boxes:
            cv2.rectangle(image, (box[0], box[1]), (box[0] + box[2], box[1] + box[3]), (0, 255, 0), 2)

        cv2.imwrite('slider_debug_image_with_boxes.png', image)  # 保存包含候选框的图像用于调试
        print("带有候选框的调试图像已保存为 'slider_debug_image_with_boxes.png'")
        return best_match[0]  # 返回缺口的x坐标
    else:
        print("未识别到缺口区域")
        return None