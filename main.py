from flask import Flask, request, jsonify, render_template, send_from_directory, send_file
from flask_cors import CORS
import argparse
from model.utils.proxy_call import OpenaiCall
import numpy as np
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import re
import csv
import os
from datetime import datetime

# 创建 Flask 应用
app = Flask(__name__)

# 启用 CORS 以允许跨域请求
CORS(app)

# 在返回响应之前，确保将所有的 int64 转换为 int
def convert_int64_to_int(data):
    if isinstance(data, dict):
        return {key: convert_int64_to_int(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_int64_to_int(item) for item in data]
    elif isinstance(data, np.integer):  # 兼容 np.int32, np.int64
        return int(data)
    else:
        return data
# 路径：根路径返回 test.html
# @app.route('/')
# def index():
#     return render_template('test16.html')

# 路径：返回英文版
@app.route('/en')
def index_en():
    return render_template('page_en.html')
# 假设你的文件存放在 './model/output/' 目录下
OUTPUT_DIR = './model/output/'

@app.route('/output/<filename>')
def serve_file(filename):
    # 确保文件存在
    if os.path.exists(os.path.join(OUTPUT_DIR, filename)):
        return send_from_directory(OUTPUT_DIR, filename)
    else:
        return jsonify({'status': 'error', 'message': '文件未找到'}), 404

def arg_parse(parser):
    parser.add_argument('--city', type=str, default='jinan',
                        choices=["hangzhou", "qingdao", "shenzhen", "shanghai", "beijing", "changsha", "wuhan",
                                 "jinan"],
                        help='dataset')
    parser.add_argument('--type', type=str, default='zh', choices=["zh", "en"], help='language type')
    return parser.parse_args()

def run(args, query) -> dict:
    # 根据语言选择导入不同的模型
    if args.type == "zh":
        from model.itinera import ItiNera
    else:
        from model.itinera_en import ItiNera

    # 创建 ItiNera 对象并获取行程
    day_planner = ItiNera(user_reqs=[query], proxy_call=OpenaiCall(), city=args.city, type=args.type)
    itinerary, lookup, path, time, food_detail, hotel_detail = day_planner.solve()

    # 返回生成的行程
    return {
        'itinerary': itinerary,
        'lookup': lookup,
        'map_path': path,
        'time': time,
        'hotel_detail': hotel_detail,
        'food_detail': food_detail
    }
def use_chat(user_input):
    # 构建消息格式：以一轮对话为例
    messages = [
        {"role": "user", "content": "请用自然语言回答下面的问题,一定不要使用markdown格式"+user_input}
    ]
    
    # 创建聊天接口对象
    openai_api = OpenaiCall()

    # 获取回复
    try:
        reply = openai_api.chat(messages)
    except Exception as e:
        reply = f"调用出错：{str(e)}"
    
    return reply

    
# 统一的 CSV 文件路径
HISTORY_CSV_PATH = r"static\history\itinerary_history.csv"

# 添加保存行程规划到 CSV 的函数
def save_itinerary_to_csv(itinerary_data):
    try:
        # 确保目录存在
        output_dir = os.path.dirname(HISTORY_CSV_PATH)
        os.makedirs(output_dir, exist_ok=True)

        # 构建完整的地图文件 URL 路径
        base_url = request.host_url  # 获取 Flask 应用的基础 URL
        map_path = itinerary_data.get('map_path', '')
        full_map_url = f"{base_url}output/{map_path}" if map_path else ''

        # 写入 CSV 文件
        file_exists = os.path.isfile(HISTORY_CSV_PATH)
        with open(HISTORY_CSV_PATH, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)

            # 如果文件不存在，写入表头
            if not file_exists:
                writer.writerow(['Date', 'Itinerary', 'Lookup', 'Map Path', 'Time', 'Hotel Detail', 'Food Detail'])

            # 写入数据行，确保所有数据都是字符串类型
            writer.writerow([
                datetime.now().strftime('%Y-%m-%d'),
                str(itinerary_data.get('itinerary', '')),
                ', '.join(map(str, itinerary_data.get('lookup', []))),
                full_map_url,  # 使用完整的地图文件 URL 路径
                str(itinerary_data.get('time', '')),
                str(itinerary_data.get('hotel_detail', '')),
                str(itinerary_data.get('food_detail', ''))
            ])

        print(f"行程规划已保存到 {HISTORY_CSV_PATH}")
        return HISTORY_CSV_PATH
    except PermissionError:
        print(f"权限错误：无法写入文件 {HISTORY_CSV_PATH}")
        return None
    except FileNotFoundError:
        print(f"文件未找到：{HISTORY_CSV_PATH}")
        return None
    except Exception as e:
        print(f"保存文件时出现未知错误：{str(e)}")
        return None
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # 获取前端传来的 JSON 数据
        data = request.get_json()
        print("接收到的请求数据:", data)  # 打印接收到的数据
        user_input = data
        result = use_chat(user_input)
        return result
    except Exception as e:
        print("后端错误:", str(e))
        return jsonify({'status': 'error', 'message': '服务器内部错误'}), 500


# 修改 plan_trip 函数，添加保存 CSV 的逻辑
@app.route('/api/plan_trip', methods=['POST'])
def plan_trip():
    try:
        # 获取前端传来的 JSON 数据
        data = request.get_json()
        user_input = data.get('query')
        city = "jinan"
        ai_model = data.get('type')

        if not user_input:
            return jsonify({'status': 'error', 'message': '请输入查询内容！'}), 400

        # 打印接收到的数据
        print(f"用户问题: {user_input}")
        print(f"选择城市: {city}")
        print(f"选择模型: {ai_model}")

        # 解析命令行参数并运行规划函数
        args = arg_parse(argparse.ArgumentParser())
        args.city = city
        args.type = ai_model

        # 调用 run 函数生成行程
        result = run(args, user_input)

        # 检查 result 是否包含必要的元素
        if 'itinerary' not in result or 'map_path' not in result:
            return jsonify({'status': 'error', 'message': '行程规划失败，缺少必要信息'}), 500

        # 确保将结果中的所有 int64 转换为 int
        result = convert_int64_to_int(result)

        # 创建响应数据
        response_data = {
            'message': f"根据您的问题 '{user_input}'，我们生成的行程是：{result['itinerary']}",
            'status': 'success',
            'itinerary': result['itinerary'],
            'lookup': result['lookup'],
            'map_path': result['map_path'],
            'time': result['time'],
            'hotel_detail': result['hotel_detail'],
            'food_detail': result['food_detail']
        }

        # 保存行程规划到 CSV
        save_result = save_itinerary_to_csv(response_data)
        if save_result is None:
            print("保存行程规划到 CSV 失败")

        print(response_data)

        return jsonify(response_data)
    except Exception as e:
        print("后端错误:", str(e))
        return jsonify({'status': 'error', 'message': '服务器内部错误'}), 500

# 添加获取历史记录的 API
@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        history = []
        history_dir = './static/history/'

        # 检查目录是否存在
        if not os.path.exists(history_dir):
            return jsonify({'status': 'success', 'data': []})

        # 固定的文件名
        filename = "itinerary_history.csv"
        filepath = os.path.join(history_dir, filename)

        # 检查文件是否存在
        if not os.path.isfile(filepath):
            return jsonify({'status': 'success', 'data': []})

        # 读取 CSV 文件的内容
        with open(filepath, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                history.append({
                    'id': len(history) + 1,
                    'title': f"行程规划 - {row['Date']}",
                    'date': row['Date'],
                    'summary': row['Itinerary'][:50] + '...' if len(row['Itinerary']) > 50 else row['Itinerary'],
                    'fullContent': row['Itinerary'],
                    'mapUrl': row['Map Path']
                })

        return jsonify({'status': 'success', 'data': history})
    except Exception as e:
        print("获取历史记录失败:", str(e))
        return jsonify({'status': 'error', 'message': '获取历史记录失败'}), 500


def generate_pdf(message, map_image_path=None):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # 注册支持中文的字体
    pdfmetrics.registerFont(TTFont('SimHei', 'SimHei.ttf'))

    # 获取样式表
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']
    normal_style.fontName = 'SimHei'
    normal_style.fontSize = 12

    title_style = styles['Heading1']
    title_style.fontName = 'SimHei'
    title_style.fontSize = 16

    # 设置标题
    title = Paragraph("您的行程规划", title_style)
    title.wrapOn(c, width, height)
    title.drawOn(c, inch, height - inch)

    # 设置内容（正文）
    content = Paragraph(message, normal_style)
    content_width = width - 2 * inch
    content_height = height - 3 * inch  # 为地图预留空间
    content.wrapOn(c, content_width, content_height)
    content.drawOn(c, inch, height - 3.5 * inch)

    # 添加地图图片
    if map_image_path:
        # 创建PNG地图的保存路径
        png_maps_dir = './upload_images/'
        os.makedirs(png_maps_dir, exist_ok=True)  # 确保目录存在
        png_map_path = os.path.join(png_maps_dir, map_image_path.replace('.html', '.png'))

        # 设置 ChromeOptions
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")  # 无头模式
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        # 指定 ChromeDriver 的路径（如果不在 PATH 中）
        # service = Service('/path/to/chromedriver')
        # driver = webdriver.Chrome(service=service, options=chrome_options)
        driver = webdriver.Chrome(options=chrome_options)

        try:
            driver.get(f"http://127.0.0.1:5000/output/{map_image_path}")
            time.sleep(2)  # 等待页面加载完成
            driver.save_screenshot(png_map_path)
        except Exception as e:
            print(f"地图截图失败: {e}")
            # 这里可以添加更多错误处理逻辑，例如通知用户或记录日志
        finally:
            driver.quit()

        if os.path.exists(png_map_path):
            img = ImageReader(png_map_path)
            c.drawImage(img, inch, 3 * inch, width=content_width, height=3 * inch)
        else:
            # 如果截图失败，可以添加一个占位符或通知用户
            error_text = "地图截图失败，请检查链接或稍后重试。"
            error_para = Paragraph(error_text, normal_style)
            error_para.wrapOn(c, content_width, 1 * inch)
            error_para.drawOn(c, inch, inch)

    # 保存 PDF
    c.save()
    buffer.seek(0)
    return buffer
# 添加保存用户反馈的路由
@app.route('/api/save_feedback', methods=['POST'])
def save_feedback():
    try:
        # 获取前端传来的 JSON 数据
        data = request.get_json()
        feedback = data.get('feedback')
        if not feedback:
            return jsonify({'status': 'error', 'message': '请输入反馈内容！'}), 400

        # 将反馈保存到 CSV
        if save_feedback_to_csv(feedback):
            return jsonify({'status': 'success', 'message': '反馈已保存'})
        else:
            return jsonify({'status': 'error', 'message': '保存反馈失败'}), 500

    except Exception as e:
        print("保存反馈时出错:", str(e))
        return jsonify({'status': 'error', 'message': '服务器内部错误'}), 500

# 定义保存用户反馈到 CSV 的函数
def save_feedback_to_csv(feedback):
    try:
        # 定义反馈 CSV 文件的路径（在 static 文件夹下）
        feedback_csv_path = os.path.join('static', 'feedback.csv')

        # 确保目录存在
        output_dir = os.path.dirname(feedback_csv_path)
        os.makedirs(output_dir, exist_ok=True)

        # 写入 CSV 文件
        file_exists = os.path.isfile(feedback_csv_path)
        with open(feedback_csv_path, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)

            # 如果文件不存在，写入表头
            if not file_exists:
                writer.writerow(['Date', 'Feedback'])

            # 写入数据行
            writer.writerow([
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),  # 保存日期和时间
                feedback
            ])

        print(f"反馈已保存到 {feedback_csv_path}")
        return True
    except Exception as e:
        print(f"保存反馈时出现错误：{str(e)}")
        return False
@app.route('/api/get_bus_data', methods=['GET'])
def get_bus_data():
    try:
        data = []
        seen_lines = set()  # 用于记录已出现的线路名
        # 读取CSV文件（注意文件路径和编码）
        with open(r"static/jinan_bus.csv", 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                line_name = row['线路名']
                if line_name not in seen_lines:  # 检查线路名是否已存在
                    seen_lines.add(line_name)
                    data.append({
                        '线路名': line_name,
                        '起点': row['起点'],
                        '终点': row['终点'],
                        '运营日期': row['运营日期'],
                        '首班车时间': row['首班车时间'],
                        '末班车时间': row['末班车时间'],
                        '票价': row['票价'],
                        '折扣方式': row['折扣方式'],
                        '具体站点信息': row['具体站点信息'],
                    })
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'读取文件失败：{str(e)}'}), 500
@app.route('/download-pdf', methods=['POST'])
def download_pdf():
    try:
        data = request.get_json()
        message = data.get('message')
        map_image_path = data.get('map_image_path')  # 获取地图路径

        if not message:
            return jsonify({'status': 'error', 'message': '消息内容不能为空！'}), 400

        # 生成PDF
        pdf_buffer = generate_pdf(message, map_image_path)

        # 提供下载
        return send_file(
            pdf_buffer,
            download_name='行程规划.pdf',
            mimetype='application/pdf',
            as_attachment=True
        )

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# 设置语言
@app.route('/api/set_language', methods=['POST'])
def set_language():
    data = request.get_json()
    language = data.get('language')
    # 保存语言设置（可以存储到数据库或会话中）
    return jsonify({'status': 'success', 'message': f'语言已设置为 {language}'})


# 默认跳转登录页
@app.route('/')
def index():
    return render_template('login.html')  # 改为 login.html

# 登录成功后的主页
@app.route('/home')
def home():
    return render_template('page.html')  # 改为首页页面

@app.route('/register')
def register_page():
    return render_template('register.html')



USER_CSV_PATH = 'static/users.csv'

# 加载用户数据（格式必须是含表头的 username,password,nickname）
def load_users():
    users = {}
    try:
        with open(USER_CSV_PATH, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                users[row['username']] = row['password']
    except FileNotFoundError:
        pass
    return users

def save_user(username, password):
    file_exists = os.path.isfile(USER_CSV_PATH)
    with open(USER_CSV_PATH, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['username', 'password'])
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            'username': username,
            'password': password
        })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    users = load_users()
    if username in users:
        if users[username] == password:
            return jsonify({'status': 'success'})
        else:
            return jsonify({'status': 'error', 'message': '密码错误'}), 401
    else:
        return jsonify({'status': 'error', 'message': '用户未注册，请先注册'}), 404

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '用户名和密码不能为空'}), 400

    users = load_users()
    if username in users:
        return jsonify({'status': 'error', 'message': '用户名已存在'}), 409
    else:
        save_user(username, password)
        return jsonify({'status': 'success', 'message': '注册成功，请返回登录'})



# 新增路由：获取 k1 站点信息
@app.route('/api/get_stations', methods=['GET'])
def get_stations():
    try:
        line_name = request.args.get('line_name')
        if not line_name:
            return jsonify({'status': 'error', 'message': '缺少线路名'}), 400

        cleaned_line = line_name.strip().replace('路', '').lower()
        csv_path = f'static/bus_stations/{cleaned_line}.csv'

        if not os.path.exists(csv_path):
            return jsonify({'status': 'error', 'message': '线路数据不存在'}), 404

        stations = []
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            # 读取表头（英文逗号分隔）
            header = f.readline().strip().split(',')

            # 处理数据行（去除行首编号，英文逗号分隔）
            for idx, raw_line in enumerate(f, start=2):
                line = re.sub(r'^\d+\.\s*', '', raw_line.strip())
                if not line:
                    continue
                station, detail = line.split(',', 1)  # 分割首次逗号
                detail = detail.strip().strip('"')  # 关键修改：去除引号
                stations.append({'站点': station.strip(), '站点详情': detail.strip()})

        return jsonify({'status': 'success', 'stations': stations})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)