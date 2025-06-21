let weatherData = [];
let currentDateIndex = 0;
let tempChart = null;

// 切换到天气信息页面
function showWeatherPage() {
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('publicTransportPage').style.display = 'none';
    document.getElementById('historyPage').style.display = 'none';
    document.getElementById('weatherPage').style.display = 'block';
    fetchWeatherCSV();
}

// 返回主页面
function backToMainPage() {
    document.getElementById('weatherPage').style.display = 'none';
    document.getElementById('publicTransportPage').style.display = 'none';
    document.getElementById('historyPage').style.display = 'none';
    document.getElementById('mainPage').style.display = '';
}

// 获取当前日期（MM-DD 格式）
function getTodayString() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${mm}-${dd}`;
}

// 读取CSV并解析
function fetchWeatherCSV() {
    fetch('static/jinan_climate.csv')
        .then(response => response.text())
        .then(text => {
            const lines = text.trim().split('\n');
            weatherData = lines.slice(1).map(line => {
                const [date, weekday, condition, tempRange, min, max, logo] = line.split(',');
                return { date, weekday, condition, tempRange, min: +min, max: +max, logo };
            });

            const today = getTodayString();
            currentDateIndex = weatherData.findIndex(item => item.date === today);
            if (currentDateIndex === -1) currentDateIndex = 0; // fallback
            showWeather(7);
        });
}

// 显示N天的天气
function showWeather(days) {
    const displayData = weatherData.slice(currentDateIndex, currentDateIndex + days);

    const container = document.getElementById('weatherCards');
    container.innerHTML = '';

    displayData.forEach(item => {
        const card = document.createElement('div');
        card.style = `
    flex: 0 0 auto;
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
    width: 160px;
    background-color: #e0f7fa; /* 浅蓝色背景 */
    border-radius: 8px;
`;

        card.innerHTML = `
            <div><strong>${item.date}</strong> (${item.weekday})</div>
            <img src="${item.logo}" alt="天气" width="50">
            <div>${item.condition}</div>
            <div>${item.tempRange}</div>
        `;
        container.appendChild(card);
    });

    drawTempChart(displayData);
}


// 画折线图
function drawTempChart(data) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    const labels = data.map(item => item.date);
    const minTemps = data.map(item => item.min);
    const maxTemps = data.map(item => item.max);

    if (tempChart) tempChart.destroy(); // 清除旧图

    const days = data.length; // 获取天数

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '最低温 (℃)',
                    data: minTemps,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0,0,255,0.1)',
                    tension: 0.3
                },
                {
                    label: '最高温 (℃)',
                    data: maxTemps,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255,0,0,0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `未来${days}天温度变化`,
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

