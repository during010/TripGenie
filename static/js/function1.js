// 切换主题菜单的显示状态
function toggleThemeOptions() {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect.style.display === 'none') {
        themeSelect.style.display = 'inline-block';
    } else {
        themeSelect.style.display = 'none';
    }
}

// 点击主题切换按钮时显示/隐藏选择框
document.querySelector('.theme-toggle').addEventListener('click', function (event) {
    if (event.target !== document.getElementById('themeSelect')) { // 点击其他部分才切换选择框显示状态
        toggleThemeOptions();
    }
});
// 切换到深色主题
function switchToDarkTheme() {
    document.body.classList.remove('light-theme', 'custom-background');
    document.body.classList.add('dark-theme');
    document.body.style.backgroundImage = 'none';
    localStorage.setItem('theme', 'dark');
    localStorage.removeItem('customBackgroundUrl');
    document.getElementById('themeSelect').style.display = 'none';
}

// 切换到浅色主题
function switchToLightTheme() {
    document.body.classList.remove('dark-theme', 'custom-background');
    document.body.classList.add('light-theme');
    document.body.style.backgroundImage = 'none';
    localStorage.setItem('theme', 'light');
    localStorage.removeItem('customBackgroundUrl');
    document.getElementById('themeSelect').style.display = 'none';
}

// 打开文件上传
function openFileInput() {
    document.getElementById('file-input').click();
    document.getElementById('themeSelect').style.display = 'none';
}

// 文件上传处理
document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add('custom-background');
            // 用CSS变量设置图片url
            document.body.style.setProperty('--custom-bg-url', `url(${e.target.result})`);
            localStorage.setItem('theme', 'custom');
            localStorage.setItem('customBackgroundUrl', e.target.result);
        };

        reader.readAsDataURL(file);
    }
});

function handleThemeChange() {
    const themeSelect = document.getElementById('themeSelect');
    const selectedTheme = themeSelect.value;

    if (selectedTheme === 'light') {
        switchToLightTheme();
    } else if (selectedTheme === 'dark') {
        switchToDarkTheme();
    } else if (selectedTheme === 'custom') {
        openFileInput();
    }
}
// 初始化主题
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const customBackgroundUrl = localStorage.getItem('customBackgroundUrl');

    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    if (customBackgroundUrl) {
        document.body.classList.add('custom-background');
        document.body.style.setProperty('--custom-bg-url', `url(${customBackgroundUrl})`);
    }

});

// 点击其他区域关闭主题菜单
document.addEventListener('click', function (event) {
    const themeMenu = document.getElementById('themeMenu');
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeMenu && !themeMenu.contains(event.target) && event.target !== themeToggle) {
        themeMenu.classList.remove('active');
    }
});
// 切换语言功能
document.getElementById('languageToggleBtn').addEventListener('click', toggleLanguage);

// 切换语言
let currentLanguage = 'zh';
function toggleLanguage() {
    if (window.location.pathname === '/home') {
        window.location.href = '/en';
    } else if (window.location.pathname === '/en') {
        window.location.href = '/home';
    }
}

// 切换选择框的显示状态
function toggleSelect(selectId) {
    const selectElement = document.getElementById(selectId);
    if (selectElement.style.display === 'none') {
        selectElement.style.display = 'block';
    } else {
        selectElement.style.display = 'none';
    }
}

// 截图功能
async function takeScreenshot() {
    try {
        const chatContainer = document.querySelector('.chat-container');
        const canvas = await html2canvas(chatContainer);
        const link = document.createElement('a');
        link.download = '聊天截图.png';
        link.href = canvas.toDataURL();
        link.click();
    } catch (error) {
        console.error('截图失败:', error);
        alert('截图失败，请稍后重试！');
    }
}

// 显示设置菜单
function toggleSettings() {
    const menu = document.querySelector('.settings-menu');
    menu.classList.toggle('show');
}

// 点击外部关闭菜单
document.addEventListener('click', (e) => {
    const settingsMenu = document.querySelector('.settings-menu');
    const settingsButton = document.querySelector('.user-settings .sidebar-tool');
    const sidebar = document.querySelector('.right-sidebar');
    const searchButtons = document.querySelectorAll('[onclick="toggleSearch()"]');

    // 处理设置菜单
    if (!settingsButton.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('show');
    }

    // 处理搜索栏
    let shouldCloseSearch = true;
    if (sidebar.contains(e.target)) {
        shouldCloseSearch = false;
    }
    searchButtons.forEach(button => {
        if (button.contains(e.target)) {
            shouldCloseSearch = false;
        }
    });

    if (shouldCloseSearch && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// 切换侧边栏
function toggleSidebar() {
    const sidebar = document.getElementById('leftSidebar');
    const toggleIcon = document.querySelector('.toggle-sidebar i');
    sidebar.classList.toggle('expanded');
    if (sidebar.classList.contains('expanded')) {
        toggleIcon.classList.remove('fa-chevron-right');
        toggleIcon.classList.add('fa-chevron-left');
    } else {
        toggleIcon.classList.remove('fa-chevron-left');
        toggleIcon.classList.add('fa-chevron-right');
    }
}
// 创建消息元素
function createMessageElement(content, isUser = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user-message' : ''}`;

    const processedContent = content.replace(/\n/g, "<br>");

    const messageHtml = `
      ${isUser ? '' : '<div class="avatar"><img src="static/logo.jpg" alt="Logo" class="logo"></div>'}
        <div class="message">
            ${processedContent}
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
            ${!isUser ? `
                <div class="message-feedback">
                    <button class="feedback-button" onclick="handleLike(this)">
                        <i class="far fa-thumbs-up"></i>
                        <span>有帮助</span>
                    </button>
                    <button class="feedback-button" onclick="handleDislike(this)">
                        <i class="far fa-thumbs-down"></i>
                        <span>需改进</span>
                    </button>
                </div>
                ${conversationState.round === 4 ? '<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i> 复制</button>' : ''}
            ` : ''}
        </div>
        ${isUser ? '<div class="avatar">我</div>' : ''}
    `;

    wrapper.innerHTML = messageHtml;
    return wrapper;
}

// 处理点赞
function handleLike(button) {
    const dislikeButton = button.nextElementSibling;

    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        button.querySelector('i').className = 'far fa-thumbs-up';
    } else {
        button.classList.add('liked');
        button.querySelector('i').className = 'fas fa-thumbs-up';
        // 移除踩的状态
        dislikeButton.classList.remove('disliked');
        dislikeButton.querySelector('i').className = 'far fa-thumbs-down';
    }
}

// 处理踩
function handleDislike(button) {
    const likeButton = button.previousElementSibling;

    if (button.classList.contains('disliked')) {
        button.classList.remove('disliked');
        button.querySelector('i').className = 'far fa-thumbs-down';
    } else {
        button.classList.add('disliked');
        button.querySelector('i').className = 'fas fa-thumbs-down';
        // 显示反馈弹窗
        showFeedbackModal();
        // 移除赞的状态
        likeButton.classList.remove('liked');
        likeButton.querySelector('i').className = 'far fa-thumbs-up';
    }
}

// 显示反馈弹窗
function showFeedbackModal() {
    document.getElementById('feedbackOverlay').classList.add('show');
    document.querySelector('.feedback-modal').classList.add('show');
}

// 关闭反馈弹窗
function closeFeedbackModal() {
    document.getElementById('feedbackOverlay').classList.remove('show');
    document.querySelector('.feedback-modal').classList.remove('show');
    document.querySelector('.feedback-textarea').value = '';
}

// 提交反馈
function submitFeedback() {
    const feedback = document.querySelector('.feedback-textarea').value;
    console.log('反馈内容:', feedback);

    // 发送到后端
    fetch('/api/save_feedback', {  // 通过自定义路由发送反馈
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedback }),
    }).then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // alert('感谢您的反馈！');
            closeFeedbackModal();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// 点击遮罩层关闭弹窗
document.getElementById('feedbackOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeFeedbackModal();
    }
});

// 显示打字指示器
function showTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    indicator.classList.add('show');
}

// 隐藏打字指示器
function hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    indicator.classList.remove('show');
}

// 用于存储对话状态
let conversationState = {
    round: 0,
    userInputs: [],
    firstQuery: "",
    secondQuery: "",
    thirdQuery: "",
    query: ""
};

// 全局作用域中的 updateProgress 函数
function updateProgress(step) {
    const currentStep = document.getElementById(`step${step}`);
    if (!currentStep) return;

    currentStep.style.display = 'block';
    const progressBar = currentStep.querySelector('.progress');

    let width = 0;
    const interval = setInterval(() => {
        if (width <= 100) {
            progressBar.style.width = `${width}%`;
            width += 1.3;
        } else {
            clearInterval(interval);
            // 延迟隐藏当前步骤并显示下一步
            setTimeout(() => {
                currentStep.style.display = 'none';
                const nextStep = document.getElementById(`step${step + 1}`);
                if (nextStep) {
                    updateProgress(step + 1);
                } else {
                    const notification = document.getElementById('progress-notification');
                    notification?.remove();
                }
            }, 300);
        }
    }, 50);
}

// 获取天气信息的函数
async function getWeatherInfo(date) {
    try {
        // 通过 fetch 从服务器加载 CSV 文件
        const response = await fetch('static/jinan_climate.csv'); // 请根据你的服务器路径修改此路径
        const data = await response.text();

        const lines = data.split('\n'); // 按行分割 CSV 数据

        // 遍历每一行
        for (const line of lines) {
            const [time, day, weather, temperature, low, high, logo] = line.split(',');
            // 去除多余的空格
            if (time.trim() === date.trim()) {
                return {
                    日期: time.trim(),
                    天气: weather.trim(),
                    温度: temperature.trim()
                };
            }
        }
        // 如果没有找到指定日期的天气信息
        console.warn(`未找到日期 ${date} 的天气信息`);
        return null;
    } catch (error) {
        console.error('读取CSV文件失败:', error.message);
        return null;
    }
}

async function getEnWeatherInfo(date) {
    try {
        // 通过 fetch 从服务器加载 CSV 文件
        const response = await fetch('static/jinan_en_climate.csv'); // 请根据你的服务器路径修改此路径
        const data = await response.text();

        const lines = data.split('\n'); // 按行分割 CSV 数据

        // 遍历每一行
        for (const line of lines) {
            const [time, day, weather, temperature, low, high, logo] = line.split(',');
            // 去除多余的空格
            if (time.trim() === date.trim()) {
                return {
                    日期: time.trim(),
                    天气: weather.trim(),
                    温度: temperature.trim()
                };
            }
        }
        // 如果没有找到指定日期的天气信息
        console.warn(`not find 日期 ${date} 的天气信息`);
        return null;
    } catch (error) {
        console.error('读取CSV文件失败:', error.message);
        return null;
    }
}

//英文版本交互
function enCreateMessageElement(content, isUser = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user-message' : ''}`;

    const processedContent = content.replace(/\n/g, "<br>");

    const messageHtml = `
      ${isUser ? '' : '<div class="avatar"><img src="static/logo.jpg" alt="Logo" class="logo"></div>'}
        <div class="message">
            ${processedContent}
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
            ${!isUser ? `
                <div class="message-feedback">
                    <button class="feedback-button" onclick="handleLike(this)">
                        <i class="far fa-thumbs-up"></i>
                        <span>Helpful</span>
                    </button>
                    <button class="feedback-button" onclick="handleDislike(this)">
                        <i class="far fa-thumbs-down"></i>
                        <span>Needs Improvement</span>
                    </button>
                </div>
                ${conversationState.round === 4 ? '<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i> Copy</button>' : ''}
            ` : ''}
        </div>
        ${isUser ? '<div class="avatar">Me</div>' : ''}
    `;

    wrapper.innerHTML = messageHtml;
    return wrapper;
}

document.getElementById('languageToggleBtn').addEventListener('click', toggleLanguage);


// 判断当前语言并设置交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    const currentLanguage = window.location.pathname === '/en' ? 'en' : 'zh';
    setInteractionFunctions(currentLanguage);
});

function setInteractionFunctions(lang) {
    if (lang === 'en') {
        // 英文页面使用英文交互逻辑
        window.sendMessage = enSendMessage;
        window.requestItineraryData = enRequestItineraryData;
        window.displayItinerary = enDisplayItinerary;
        window.displayChatResponse = enDisplayChatResponse;
        window.createMessageElement = enCreateMessageElement; // 使用英文版创建消息元素
        window.enextractLocations = enextractLocations;
    } else {
        // 中文页面使用中文交互逻辑
        window.sendMessage = sendMessage;
        window.requestItineraryData = requestItineraryData;
        window.displayItinerary = displayItinerary;
        window.displayChatResponse = displayChatResponse;
        window.createMessageElement = createMessageElement;
        windows.extractLocations = extractLocations;// 使用中文版创建消息元素
    }
}

// 英文版sendMessage
function enSendMessage() {
    const userInput = document.getElementById("userInput").value;

    if (!userInput.trim()) {
        alert("Please enter your question!");
        document.getElementById("userInput").focus();
        return;
    }

    const chatContainer = document.querySelector('.chat-container');
    chatContainer.appendChild(createMessageElement(userInput, true));
    chatContainer.scrollTop = chatContainer.scrollHeight;

    document.getElementById("userInput").value = "";
    showTypingIndicator();

    // 更新对话状态
    conversationState.round++;
    conversationState.userInputs.push(userInput);

    switch (conversationState.round) {
        case 1:
            conversationState.firstQuery = userInput;
            chatContainer.appendChild(createMessageElement("Do you have any specific attractions in mind that you'd like to visit?"));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 2:
            conversationState.secondQuery = userInput;
            const mentionedLocations = enextractLocations(userInput);
            const message = `You mentioned: ${mentionedLocations.length > 0 ? mentionedLocations.join(', ') : 'No attractions mentioned'}. Are you traveling with children? I can recommend some child-friendly spots if you are.`;
            chatContainer.appendChild(createMessageElement(message));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 3:
            conversationState.thirdQuery = userInput;

            // 简单字符串匹配
            let travelType = "";
            if (userInput.includes("yes") || userInput.includes("with children") || userInput.includes("with kids") || userInput.includes("children") || userInput.includes("kids")) {
                travelType = "family-friendly";
            } else if (userInput.includes("no") || userInput.includes("without children") || userInput.includes("without kids") || userInput.includes("alone")) {
                travelType = "solo";
            }
            conversationState.thirdQuery = travelType;
            chatContainer.appendChild(createMessageElement("When do you plan to go?"));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 4:
            const userDateInput = userInput;

            // 解析用户输入的日期
            const parseDate = (input) => {
                input = input.trim().replace(/[日号]/g, '');

                const regex = /(?:(?:大概|大约|大致)?\s*(\d{1,2})[月.\s]*(\d{1,2}))/;
                const match = input.match(regex);

                if (match) {
                    const month = match[1].padStart(2, '0');
                    const day = match[2].padStart(2, '0');
                    return `${month}-${day}`;
                } else {
                    return null;
                }
            };

            const formattedDate = parseDate(userDateInput);


            if (formattedDate) {
                // 获取天气信息
                getEnWeatherInfo(formattedDate).then(weatherInfo => {
                    if (weatherInfo) {
                        const [month, day] = weatherInfo.日期.split("-");
                        const formattedDate = `${parseInt(month)}.${parseInt(day)}`;
                        // 天气提示
                        let weatherTip = "";
                        if (weatherInfo.天气.includes("rain")) {
                            weatherTip = "It might rain, don't forget to bring an umbrella!";
                        } else if (weatherInfo.天气.includes("sunny")) {
                            weatherTip = "It's sunny, consider bringing a sun umbrella.";
                        }
                        const weatherMessage = `You plan to travel on ${formattedDate}, the weather will be ${weatherInfo.天气}, with a temperature of ${weatherInfo.温度}.\n${weatherTip} You can adjust your clothing based on the day's temperature.`;
                        chatContainer.scrollTop = chatContainer.scrollHeight;

                        // 准备请求数据
                        const allQueries = [conversationState.firstQuery, conversationState.secondQuery, conversationState.thirdQuery]
                            .filter(query => query)
                            .join(" ");

                        const requestData = {
                            query: allQueries,
                            city: "jinan",
                            type: document.getElementById('languageSelect').value
                        };

                        // 创建进度提示通知
                        const notification = document.createElement('div');
                        notification.className = 'notification-content';
                        notification.id = 'progress-notification';
                        notification.innerHTML = `
                            <div class="step-container">
                                <div class="step-item" id="step1" style="display: none;">
                                    <div class="progress-info">
                                        <div class="left-text">Accessing Database</div>
                                        <div class="right-text">Querying attractions...</div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                </div>

                                <div class="step-item" id="step2" style="display: none;">
                                    <div class="progress-info">
                                        <div class="left-text">Processing Data</div>
                                        <div class="right-text">Analyzing attraction data...</div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                </div>

                                <div class="step-item" id="step3" style="display: none;">
                                    <div class="progress-info">
                                        <div class="left-text">Planning Route</div>
                                        <div class="right-text">Planning the optimal route...</div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                </div>

                                <div class="step-item" id="step4" style="display: none;">
                                    <div class="progress-info">
                                        <div class="left-text">Generating Itinerary</div>
                                        <div class="right-text">Creating your itinerary...</div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                </div>

                                <div class="step-item" id="step5" style="display: none;">
                                    <div class="progress-info">
                                        <div class="left-text">Optimizing Itinerary</div>
                                        <div class="right-text">Finalizing your itinerary, please wait...</div>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        `;

                        document.querySelector('.chat-container').appendChild(notification);
                        chatContainer.scrollTop = chatContainer.scrollHeight;

                        // 延迟后开始进度显示
                        setTimeout(() => {
                            document.getElementById('step1').style.display = 'block';
                            updateProgress(1);
                        }, 500);

                        // 请求行程数据
                        requestItineraryData(requestData, weatherMessage, chatContainer);

                    } else {
                        // 没有找到天气信息
                        chatContainer.appendChild(createMessageElement(`Sorry, I couldn't find weather information for ${formattedDate}.`));
                    }
                }).catch(error => {
                    // 处理获取天气信息失败
                    console.error('Failed to retrieve weather information:', error.message);
                    chatContainer.appendChild(createMessageElement("Failed to retrieve weather information. Please try again later."));
                });
            } else {
                // 日期解析失败
                chatContainer.appendChild(createMessageElement("I didn't understand your date input. Please describe it again."));
            }
            break;

        default:
            // 默认情况下，直接发送消息
            chat(userInput, chatContainer);
            console.log("Current round is out of the expected range, sending message directly");
            break;
    }
}

// 英文版requestItineraryData
async function enRequestItineraryData(requestData, weatherMessage, chatContainer) {
    try {
        const query = requestData.query;

        const response = await fetch("http://127.0.0.1:5000/api/plan_trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Response from the backend:", responseData);

        hideTypingIndicator();

        // 显示行程
        enDisplayItinerary(query, responseData, weatherMessage, chatContainer);
    } catch (error) {
        console.error("Request failed:", error);
        chatContainer.appendChild(createMessageElement("Failed to retrieve itinerary data. Please try again later.", false));
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// 英文版displayItinerary
function enDisplayItinerary(query, responseData, weatherMessage, chatContainer) {
    // 提取行程规划
    const itineraryMatch = responseData.message.match(/'itinerary': '([^']*)'/);
    let itineraryString = itineraryMatch && itineraryMatch[1] ? itineraryMatch[1] : "No itinerary information found. Please try again later.";

    // 提取景点详细理由
    const poisObj = responseData.itinerary && responseData.itinerary.pois ? responseData.itinerary.pois : {};
    let poisDetails = Object.entries(poisObj).map(
        ([key, value], i) => `${i + 1}. ${value}`
    ).join('\n');

    // 提取总体理由
    const reasonMatch = responseData.message.match(/'Overall Reason': '([^']*)'/);
    let reasonString = reasonMatch && reasonMatch[1] ? reasonMatch[1] : "No overall reason provided.";

    // 提取预计时间
    let timeString = (responseData.time !== undefined) ? `${responseData.time} hours` : "Unknown";

    // 拼接完整消息文本
    const fullMessage = `${weatherMessage}\n Itinerary Planning: ${itineraryString}\n Reason for Itinerary: ${poisDetails}\n Estimated Time: ${timeString}\n`;

    // 创建消息包装元素
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    const innerContent = document.createElement('div');
    innerContent.className = 'message';
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';

    const img = document.createElement('img');
    img.src = 'static/logo.jpg'; // 确保路径正确
    img.alt = 'Logo';
    img.className = 'logo'; // 添加类名，以便通过 CSS 控制样式
    avatarDiv.appendChild(img);
    wrapper.appendChild(avatarDiv);

    // 加入文字内容（格式化换行）
    const textDiv = document.createElement('div');
    textDiv.innerHTML = fullMessage.replace(/\n/g, "<br>");
    innerContent.appendChild(textDiv);

    // 添加时间
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    innerContent.appendChild(timeDiv);

    // 添加反馈按钮
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';
    feedbackDiv.innerHTML = `
        <button class="feedback-button" onclick="handleLike(this)">
            <i class="far fa-thumbs-up"></i><span>Helpful</span>
        </button>
        <button class="feedback-button" onclick="handleDislike(this)">
            <i class="far fa-thumbs-down"></i><span>Needs Improvement</span>
        </button>
        ${conversationState.round === 4 ? '<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i> Copy</button>' : ''}
    `;
    innerContent.appendChild(feedbackDiv);

    // 最后拼装整个wrapper
    wrapper.appendChild(innerContent);
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 检查是否有地图路径
    if (responseData.map_path) {
        try {
            const iframeElement = createIframeElement("http://127.0.0.1:5000/output/" + responseData.map_path);
            chatContainer.appendChild(iframeElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            chatContainer.scrollTop = chatContainer.scrollHeight;

            // 添加PDF导出按钮的显示和事件监听
            const exportPdfBtn = document.getElementById('exportPdfBtn');
            exportPdfBtn.style.display = 'block';
            exportPdfBtn.addEventListener('click', function () {
                try {
                    fetch('/download-pdf', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: fullMessage,
                            map_image_path: responseData.map_path
                        })
                    })
                        .then(response => response.blob())
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = '行程规划.pdf';
                            a.click();
                            window.URL.revokeObjectURL(url);
                        })
                        .catch(error => {
                            console.error('PDF download failed:', error);
                        });
                } catch (error) {
                    console.error('Request failed:', error);
                }
            });

        } catch (error) {
            // 地图路径解析失败时的提示
            chatContainer.appendChild(createMessageElement("Failed to parse map path. Please check the link or try again later.", false));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            console.error("Map path parsing failed:", error);
        }
    } else {
        console.warn("No valid mapPath provided");
    }

    // 更新进度步骤
    setTimeout(() => {
        updateProgress(3);
    }, 2000);
}

// 英文版displayChatResponse
function enDisplayChatResponse(responseData, chatContainer) {

    // 创建消息包装元素
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    // 创建头像区域
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';

    const img = document.createElement('img');
    img.src = 'static/logo.jpg';
    img.alt = 'Logo';
    img.className = 'logo';

    avatarDiv.appendChild(img);
    wrapper.appendChild(avatarDiv);

    // 创建消息内容区域
    const innerContent = document.createElement('div');
    innerContent.className = 'message';

    // 添加时间
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    innerContent.appendChild(timeDiv);

    // 添加AI回复内容
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-text';
    contentDiv.textContent = responseData.response || "(No content returned)";
    innerContent.appendChild(contentDiv);

    // 拼装整体
    wrapper.appendChild(innerContent);
    chatContainer.appendChild(wrapper);

    // 自动滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function sendMessage() {
    const userInput = document.getElementById("userInput").value;

    if (!userInput.trim()) {
        alert("请输入您的问题！");
        document.getElementById("userInput").focus();
        return;
    }

    const chatContainer = document.querySelector('.chat-container');
    chatContainer.appendChild(createMessageElement(userInput, true));
    chatContainer.scrollTop = chatContainer.scrollHeight;

    document.getElementById("userInput").value = "";
    showTypingIndicator();

    // 更新对话状态
    conversationState.round++;
    conversationState.userInputs.push(userInput);

    // 更新前三次输入的内容
    switch (conversationState.round) {
        case 1:
            conversationState.firstQuery = userInput;
            chatContainer.appendChild(createMessageElement("请问您心中有没有特别想去打卡的景点？"));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 2:
            conversationState.secondQuery = userInput;
            const mentionedLocations = extractLocations(userInput);
            const message = `您提到的景点有：${mentionedLocations.length > 0 ? mentionedLocations.join('、') : '暂无景点信息'}。我想确认下，您这次是带着孩子一起出行吗？要是的话，我可以给您推荐一些更适合小朋友的景点。`;
            chatContainer.appendChild(createMessageElement(message));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 3:
            conversationState.thirdQuery = userInput;

            // 对第三次输入做字符串匹配
            let travelType = "";
            if (userInput.includes("是的") || userInput.includes("带孩子") || userInput.includes("带") || userInput.includes("是")) {
                travelType = "家庭亲子";
            } else if (userInput.includes("不带") || userInput.includes("不是") || userInput.includes("不")) {
                travelType = "";
            }
            conversationState.thirdQuery = travelType;
            chatContainer.appendChild(createMessageElement("请问您计划什么时候去呢"));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            hideTypingIndicator();
            break;

        case 4:
            const userDateInput = userInput;

            // 解析用户的日期输入
            const parseDate = (input) => {
                // 去除空格和末尾的“日”或“号”
                input = input.trim().replace(/[日号]/g, '');

                // 匹配常见日期表达形式
                const regex = /(?:(?:大概|大约|大致)?\s*(\d{1,2})[月.\s]*(\d{1,2}))/;
                const match = input.match(regex);

                if (match) {
                    const month = match[1].padStart(2, '0'); // 确保月份为两位数
                    const day = match[2].padStart(2, '0');   // 确保日期为两位数
                    return `${month}-${day}`;
                } else {
                    return null;
                }
            };

            // 获取日期格式化后的字符串
            const formattedDate = parseDate(userDateInput);

            if (formattedDate) {
                // 调用 getWeatherInfo 获取天气信息
                getWeatherInfo(formattedDate).then(weatherInfo => {
                    if (weatherInfo) {
                        const [month, day] = weatherInfo.日期.split("-");
                        const formattedDate = `${parseInt(month)}月${parseInt(day)}日`;
                        // 天气提示
                        let weatherTip = "";
                        if (weatherInfo.天气.includes("雨")) {
                            weatherTip = "可能会下雨别忘了带伞哦~";
                        } else if (weatherInfo.天气.includes("晴")) {
                            weatherTip = "怕晒的话别忘了带上一把遮阳伞哦~";
                        }
                        // 拼接天气信息
                        const weatherMessage = `您计划在 ${formattedDate} 出行，当天的天气是 ${weatherInfo.天气}，温度是 ${weatherInfo.温度}。\n${weatherTip} 可以参考当天温度添衣减衣。`;
                        chatContainer.scrollTop = chatContainer.scrollHeight;

                        // 这里移动了 requestItineraryData 的调用，保证 weatherMessage 已经赋值
                        const allQueries = [conversationState.firstQuery, conversationState.secondQuery, conversationState.thirdQuery]
                            .filter(query => query)
                            .join(" ");

                        const requestData = {
                            query: allQueries,
                            city: "jinan",
                            type: document.getElementById('languageSelect').value
                        };
                        const notification = document.createElement('div');
                        notification.className = 'notification-content';
                        notification.id = 'progress-notification';
                        notification.innerHTML = `
                <div class="step-container">
                    <div class="step-item" id="step1" style="display: none;">
                        <div class="progress-info">
                            <div class="left-text">访问数据库</div>
                            <div class="right-text">正在查询景点信息...</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="step-item" id="step2" style="display: none;">
                        <div class="progress-info">
                            <div class="left-text">处理数据</div>
                            <div class="right-text">正在分析景点数据</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="step-item" id="step3" style="display: none;">
                        <div class="progress-info">
                            <div class="left-text">规划路线</div>
                            <div class="right-text">正在规划最佳路线</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="step-item" id="step4" style="display: none;">
                        <div class="progress-info">
                            <div class="left-text">生成行程</div>
                            <div class="right-text">正在生成行程</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="step-item" id="step5" style="display: none;">
                        <div class="progress-info">
                            <div class="left-text">优化行程</div>
                            <div class="right-text">行程生成中，请稍候</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;

                        document.querySelector('.chat-container').appendChild(notification);
                        chatContainer.scrollTop = chatContainer.scrollHeight;



                        setTimeout(() => {
                            document.getElementById('step1').style.display = 'block';
                            updateProgress(1);
                        }, 500);

                        // **这里移动到了 then 里面**
                        requestItineraryData(requestData, weatherMessage, chatContainer);

                    } else {
                        // 没有找到对应天气信息
                        chatContainer.appendChild(createMessageElement(`抱歉，我没有找到 ${formattedDate} 的天气信息。`));
                    }
                }).catch(error => {
                    // 处理 getWeatherInfo 异常
                    console.error('获取天气信息失败:', error.message);
                    chatContainer.appendChild(createMessageElement("获取天气信息失败，请稍后重试。"));
                });
            } else {
                // 日期解析失败
                chatContainer.appendChild(createMessageElement("我没有理解您的日期输入，请您再描述一次~"));
            }
            break;

        default:
            console.log(userInput + "1111111111111111111111");
            chat(userInput, chatContainer)
            console.log("当前轮次不在预期范围内，直接发送消息");
            break;
    }
}
// 请求行程数据函数修改
async function requestItineraryData(requestData, weatherMessage, chatContainer) {
    try {
        query = requestData.query;

        const response = await fetch("http://127.0.0.1:5000/api/plan_trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });


        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("后端返回的数据:", responseData);

        hideTypingIndicator();

        // 显示行程
        displayItinerary(query, responseData, weatherMessage, chatContainer);
    } catch (error) {
        console.error("请求失败:", error);
        chatContainer.appendChild(createMessageElement("请求行程数据失败，请稍后重试。", false));
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}
async function chat(requestData, chatContainer) {
    try {


        const response = await fetch("http://127.0.0.1:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        const responseText = await response.text();
        console.log("后端返回的文本数据:", responseText);

        hideTypingIndicator();

        displayChatResponse({ response: responseText }, chatContainer);

    } catch (error) {
        console.error("请求失败:", error);
        chatContainer.appendChild(createMessageElement("请求数据失败，请稍后重试。", false));
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function displayChatResponse(responseData, chatContainer) {

    // 创建一个 message 的包裹元素
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    // 创建头像区域
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';

    const img = document.createElement('img');
    img.src = 'static/logo.jpg'; // 确保路径正确
    img.alt = 'Logo';
    img.className = 'logo'; // 添加类名，以便通过 CSS 控制样式

    avatarDiv.appendChild(img);
    wrapper.appendChild(avatarDiv);
    // 创建消息内容区域
    const innerContent = document.createElement('div');
    innerContent.className = 'message';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-text';
    contentDiv.textContent = responseData.response || "（无返回内容）";
    innerContent.appendChild(contentDiv);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    innerContent.appendChild(timeDiv);


    // 拼装整体
    wrapper.appendChild(innerContent);
    chatContainer.appendChild(wrapper);

    // 自动滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // 添加反馈按钮
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';
    feedbackDiv.innerHTML = `
        <button class="feedback-button" onclick="handleLike(this)">
            <i class="far fa-thumbs-up"></i><span>有帮助</span>
        </button>
        <button class="feedback-button" onclick="handleDislike(this)">
            <i class="far fa-thumbs-down"></i><span>需改进</span>
        </button>
        ${conversationState.round === 4 ? '<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i> Copy</button>' : ''}
    `;
    innerContent.appendChild(feedbackDiv);

}

// 显示行程
function displayItinerary(query, responseData, weatherMessage, chatContainer) {

    // 提取行程规划
    const itineraryMatch = responseData.message.match(/'itinerary': '([^']*)'/);
    let itineraryString = itineraryMatch && itineraryMatch[1] ? itineraryMatch[1] : "未找到行程信息，请稍后再试。";

    // 提取 pois 详细理由
    const poisObj = responseData.itinerary && responseData.itinerary.pois ? responseData.itinerary.pois : {};
    let poisDetails = Object.entries(poisObj).map(
        ([key, value], i) => `${i + 1}. ${value}`
    ).join('\n');

    // 提取总体理由
    const reasonMatch = responseData.message.match(/'总体理由': '([^']*)'/);
    let reasonString = reasonMatch && reasonMatch[1] ? reasonMatch[1] : "暂无总体理由。";

    // 提取预计时间
    let timeString = (responseData.time !== undefined) ? `${responseData.time} 小时` : "未知";

    // 拼接完整消息文字
    const fullMessage = `${weatherMessage}\n 行程规划：${itineraryString}\n 行程理由：\n${poisDetails} \n总体理由：${reasonString}\n 预计花费时间：${timeString}`;

    // 创建一个 message 的包裹元素（用 createMessageElement 的结构）
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    const innerContent = document.createElement('div');
    innerContent.className = 'message';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';

    const img = document.createElement('img');
    img.src = 'static/logo.jpg'; // 确保路径正确
    img.alt = 'Logo';
    img.className = 'logo'; // 添加类名，以便通过 CSS 控制样式
    avatarDiv.appendChild(img);
    wrapper.appendChild(avatarDiv);


    // 加入文字内容（格式化换行）
    const textDiv = document.createElement('div');
    textDiv.innerHTML = fullMessage.replace(/\n/g, "<br>");
    innerContent.appendChild(textDiv);

    // 添加时间
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    innerContent.appendChild(timeDiv);

    // 添加反馈按钮（你原来 AI 回答部分的按钮）
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';
    feedbackDiv.innerHTML = `
    <button class="feedback-button" onclick="handleLike(this)">
        <i class="far fa-thumbs-up"></i><span>有帮助</span>
    </button>
    <button class="feedback-button" onclick="handleDislike(this)">
        <i class="far fa-thumbs-down"></i><span>需改进</span>
    </button>
    ${conversationState.round === 4 ? '<button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i> 复制</button>' : ''}
`;
    innerContent.appendChild(feedbackDiv);

    // 创建 toggleBox 内容
    const toggleBox = document.createElement("div");
    toggleBox.style.marginTop = "10px";
    let foodVisible = false;
    let hotelVisible = false;

    const foodButton = document.createElement("button");
    foodButton.textContent = "查看美食推荐";
    foodButton.className = "generate-button no"; // 添加样式类
    foodButton.onclick = function () {
        foodVisible = !foodVisible;
        foodButton.textContent = foodVisible ? "关闭美食推荐" : "查看美食推荐";
        foodButton.style.backgroundColor = foodVisible ? "#ccc" : "#4CAF50"; // 切换颜色
        foodButton.style.color = foodVisible ? "black" : "white"; // 切换文字颜色
        foodDetailBox.style.display = foodVisible ? "block" : "none";
    };

    const hotelButton = document.createElement("button");
    hotelButton.textContent = "查看住宿推荐";
    hotelButton.className = "generate-button no"; // 添加样式类
    hotelButton.onclick = function () {
        hotelVisible = !hotelVisible;
        hotelButton.textContent = hotelVisible ? "关闭住宿推荐" : "查看住宿推荐";
        hotelButton.style.backgroundColor = hotelVisible ? "#ccc" : "#4CAF50"; // 切换颜色
        hotelButton.style.color = hotelVisible ? "black" : "white"; // 切换文字颜色
        hotelDetailBox.style.display = hotelVisible ? "block" : "none";
    };

    foodButton.style.marginRight = "10px";

    const foodDetailBox = document.createElement("div");
    const hotelDetailBox = document.createElement("div");

    function createDetailList(detailArray) {
        const container = document.createElement("div");
        let count = 1;
        // 展平数组并去重
        const uniqueItems = [...new Set(detailArray.flat())];
        uniqueItems.forEach(item => {
            const p = document.createElement("div");
            p.innerHTML = `${count}. ${item}`; // 使用 innerHTML 确保 HTML 实体被解析
            container.appendChild(p);
            count++;
        });
        return container;
    }

    foodDetailBox.style.display = "none";
    hotelDetailBox.style.display = "none";

    foodDetailBox.appendChild(createDetailList(responseData.food_detail || []));
    hotelDetailBox.appendChild(createDetailList(responseData.hotel_detail || []));

    // 填入 toggleBox
    toggleBox.appendChild(document.createElement("hr"));
    toggleBox.appendChild(foodButton);
    toggleBox.appendChild(hotelButton);
    toggleBox.appendChild(foodDetailBox);
    toggleBox.appendChild(hotelDetailBox);

    // 把 toggleBox 一起塞入 innerContent（message 主体）
    innerContent.appendChild(toggleBox);

    // 最后拼装整个 wrapper（加头像）
    wrapper.appendChild(innerContent);

    // 添加到 chatContainer
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 检查是否有地图路径
    if (responseData.map_path) {
        try {
            const iframeElement = createIframeElement("http://127.0.0.1:5000/output/" + responseData.map_path);
            chatContainer.appendChild(iframeElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            const generateNewOption = createGenerateNewOption(query, weatherMessage);
            chatContainer.appendChild(generateNewOption);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // 添加PDF导出按钮的显示和事件监听
            const exportPdfBtn = document.getElementById('exportPdfBtn');
            exportPdfBtn.style.display = 'block';
            exportPdfBtn.addEventListener('click', function () {
                try {
                    fetch('/download-pdf', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: fullMessage,
                            map_image_path: responseData.map_path
                        }) // 包含地图路径
                    })
                        .then(response => response.blob())
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = '行程规划.pdf';
                            a.click();
                            window.URL.revokeObjectURL(url);
                        })
                        .catch(error => {
                            console.error('下载 PDF 失败:', error);
                        });
                } catch (error) {
                    console.error('请求失败:', error);
                }
            });

        } catch (error) {
            // 地图路径解析失败时的提示
            chatContainer.appendChild(createMessageElement("地图路径解析失败，请检查链接的合法性或稍后重试。", false));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            console.error("地图路径解析失败:", error);
        }
    } else {
        console.warn("未提供有效的mapPath");
    }

    setTimeout(() => {
        const version = isFirstItinerary ? 'version1' : 'version2';
        showReferences(version);
    }, 1000);

    if (isFirstItinerary) {
        isFirstItinerary = false; // 更新标记
    }
}

function closeSidebar() {
    document.getElementById("rightSidebar").style.display = "none";
}

// 创建iframe
function createIframeElement(url) {
    const iframeContainer = document.createElement("div");
    iframeContainer.classList.add("iframe-container");

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = "100%";
    iframe.height = "400px";
    iframe.style.border = "1px solid #ccc";
    iframeContainer.appendChild(iframe);

    return iframeContainer;
}

// 创建新行程选项
function createGenerateNewOption(query, weatherMessage) {
    const optionContainer = document.createElement('div');
    optionContainer.className = 'generate-new-option';

    const message = document.createElement('p');
    message.textContent = '是否需要生成另一个行程？';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'generate-buttons';

    const yesButton = document.createElement('button');
    yesButton.textContent = '是';
    yesButton.className = 'generate-button yes';
    yesButton.addEventListener('click', function () {
        noButton.classList.add('white');
        generateNewItinerary(query, weatherMessage);
    });

    const noButton = document.createElement('button');
    noButton.textContent = '否';
    noButton.className = 'generate-button no';
    noButton.addEventListener('click', function () {
        optionContainer.remove();
    });

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    optionContainer.appendChild(message);
    optionContainer.appendChild(buttonContainer);

    return optionContainer;
}

// 生成新行程
async function generateNewItinerary(query, weatherMessage) {
    const chatContainer = document.querySelector('.chat-container');
    showTypingIndicator(); // 显示打字指示器

    // 创建进度提示通知
    const notification = document.createElement('div');
    notification.className = 'notification-content';
    notification.id = 'progress-notification';
    notification.innerHTML = `
        <div class="step-container">
            <div class="step-item" id="step1" style="display: none;">
                <div class="progress-info">
                    <div class="left-text">访问数据库</div>
                    <div class="right-text">正在查询景点信息...</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>

            <div class="step-item" id="step2" style="display: none;">
                <div class="progress-info">
                    <div class="left-text">处理数据</div>
                    <div class="right-text">正在分析景点数据...</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>

            <div class="step-item" id="step3" style="display: none;">
                <div class="progress-info">
                    <div class="left-text">规划路线</div>
                    <div class="right-text">正在规划最佳路线...</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>

            <div class="step-item" id="step4" style="display: none;">
                <div class="progress-info">
                    <div class="left-text">生成行程</div>
                    <div class="right-text">正在生成行程...</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>

            <div class="step-item" id="step5" style="display: none;">
                <div class="progress-info">
                    <div class="left-text">优化行程</div>
                    <div class="right-text">行程生成中，请稍候...</div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.chat-container').appendChild(notification);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const requestData = {
            query: query,
            city: "jinan",
            type: document.getElementById('languageSelect').value
        };

        // 延迟后开始进度显示
        setTimeout(() => {
            document.getElementById('step1').style.display = 'block';
            updateProgress(1);
        }, 500);

        const response = await fetch("http://127.0.0.1:5000/api/plan_trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('请求失败');
        }

        const responseData = await response.json();
        displayItinerary(query, responseData, weatherMessage, chatContainer);

        // 移除生成新行程的选项
        const generateNewOptionElement = document.querySelector('.generate-new-option');
        if (generateNewOptionElement) {
            generateNewOptionElement.remove();
        }
        toggleSearch(); // 假设这是展开/折叠右侧工具栏的函数

        // 显示参考链接
        showReferences('version1'); // 在生成新行程后显示参考链接

    } catch (error) {
        console.error("请求失败:", error);
        chatContainer.appendChild(createMessageElement("生成新行程失败，请稍后再试。", false));
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } finally {
        hideTypingIndicator(); // 隐藏打字指示器
    }
}

// 在 function.js 中添加
document.addEventListener('DOMContentLoaded', () => {
    // 初始时隐藏参考链接边栏
    const rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.remove('open');
    }
});

// 关闭参考链接边栏的按钮
function closeSidebar() {
    document.getElementById("rightSidebar").classList.remove('open');
}
function extractLocations(text) {
    // 简化，这里使用简单的关键词匹配
    const keywords = ['趵突泉', '大明湖', '融创茂', '千佛山', '中山公园', '五龙潭', '李清照故居'];
    const mentionedLocations = [];
    for (const keyword of keywords) {
        if (text.includes(keyword)) {
            mentionedLocations.push(keyword);
        }
    }
    return mentionedLocations;
}
function enextractLocations(text) {
    // 简化，这里使用简单的关键词匹配
    const keywords = ['Baotu Spring', 'Daming Lake', 'Thousand Buddha Mountain'];
    const mentionedLocations = [];
    for (const keyword of keywords) {
        if (text.includes(keyword)) {
            mentionedLocations.push(keyword);
        }
    }
    return mentionedLocations;
}

function startNewConversation() {
    // 重置对话状态
    conversationState.round = 0;
    conversationState.userInputs = [];
    conversationState.firstQuery = "";
    conversationState.secondQuery = "";
    conversationState.thirdQuery = "";

    // 清空聊天容器
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.innerHTML = '';
    }

    // 刷新页面以确保完全重置
    window.location.reload();

    // 可选：添加视觉反馈，例如短暂高亮按钮
    const newConversationBtn = document.getElementById('newConversationBtnSide');
    newConversationBtn.classList.add('active');
    setTimeout(() => {
        newConversationBtn.classList.remove('active');
    }, 300);
}

// 复制到剪贴板
function copyToClipboard(button) {
    const messageElement = button.closest('.message');
    const messageText = messageElement.innerText.trim();

    // 使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText)
            .then(() => {
                // 显示复制成功的提示
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> 已复制';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制！');
            });
    } else {
        // 回退到 document.execCommand('copy')
        const textarea = document.createElement('textarea');
        textarea.value = messageText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        // 显示复制成功的提示
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }
}
// 获取对话轮次
function getConversationRound() {
    // 简单示例，根据聊天记录数量判断轮次
    const chatContainer = document.querySelector('.chat-container');
    const messages = chatContainer.querySelectorAll('.message-wrapper');
    return Math.floor(messages.length / 2) + 1;
}

window.onload = function () {
    const username = sessionStorage.getItem("username") || "默认用户";

    // 一定展示用户信息
    document.getElementById("displayUsername").textContent = username;
    document.getElementById("menuUsername").textContent = username;
    document.getElementById("historyUsername").textContent = username;
};

// 切换用户菜单显示/隐藏
function toggleUserMenu() {
    const menu = document.getElementById("userMenu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// 显示确认退出弹窗
function logout() {
    document.getElementById("confirmModal").style.display = "flex";
}

// 确认退出：清除 session、隐藏菜单、跳转
function confirmLogout() {
    sessionStorage.removeItem("username");
    document.getElementById("userMenu").style.display = "none";
    document.getElementById("confirmModal").style.display = "flex";
    // 跳转登录页
    setTimeout(() => {
        window.location.href = "/";
    }, 1000);
}

// 关闭弹窗
function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
}

function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}
// 全局变量，用于跟踪是否是第一次生成行程
let isFirstItinerary = true;

// 显示参考链接
function showReferences(version) {
    // 清空现有的搜索结果
    document.getElementById('searchResults').innerHTML = '';

    // 根据版本选择 CSV 文件
    const csvFile = version === 'version1'
        ? "static/jinan_version1.csv"
        : "static/jinan_version2.csv";

    // 从选中的 CSV 文件加载数据
    fetch(csvFile)
        .then(response => response.text())
        .then(data => {
            const items = parseCSV(data);
            displaySearchItems(items);
        })
        .catch(error => {
            console.error('加载 CSV 文件时出错:', error);
            document.getElementById('searchResults').innerHTML = '<p>加载数据时出错，请稍后再试。</p>';
        });

    // 打开右侧边栏
    document.getElementById('rightSidebar').classList.add('open');
}

// 解析 CSV 数据
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(',');
        const item = {
            url: columns[0].trim(),
            title: columns[1].trim(),
            description: columns[2].trim()
        };
        result.push(item);
    }

    return result;
}
// 显示搜索结果
function displaySearchItems(items) {
    const searchResultsDiv = document.getElementById('searchResults');

    items.forEach(item => {
        const searchItemDiv = document.createElement('div');
        searchItemDiv.className = 'search-item';
        searchItemDiv.innerHTML = `
            <h4><a href="${item.url}" target="_blank">${item.title}</a></h4>
            <p>${item.description}</p>
        `;
        searchResultsDiv.appendChild(searchItemDiv);
    });
}
// 显示/隐藏右侧搜索栏
function toggleSearch() {
    const sidebar = document.querySelector('.right-sidebar');
    sidebar.classList.toggle('open');
}

// 初始化事件
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('userInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('newConversationBtnSide').addEventListener('click', startNewConversation);
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);
    document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
    if (window.location.pathname === '/') {
        currentLanguage = 'zh';
    } else if (window.location.pathname === '/en') {
        currentLanguage = 'en';
    }
    updateLanguageText();
});
// 切换到公共交通页面
document.getElementById('publicTransportBtn').addEventListener('click', function () {
    document.getElementById('leftSidebar').classList.toggle('expanded');
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('publicTransportPage').style.display = 'flex';
    loadCSVContent(); // 加载并显示CSV文件内容
});

// 加载CSV内容并渲染表格
function loadCSVContent() {
    fetch('/api/get_bus_data')
        .then(response => {
            if (!response.ok) throw new Error('网络请求失败');
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                displayBusData(data.data); // 渲染数据到表格
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            alert('加载公交线路数据失败，请重试');
        });
}

// 渲染表格数据
let currentPage = 1; // 当前页码
const pageSize = 10; // 每页显示数量
let totalPages = 0; // 总页数
let allData = []; // 存储所有数据

function displayBusData(data) {
    allData = data; // 保存所有数据
    updatePagination(); // 计算总页数
    renderCurrentPage(); // 渲染当前页数据
}

function renderCurrentPage() {
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const currentData = allData.slice(start, end);

    const tbody = document.getElementById('busTableBody');
    tbody.innerHTML = '';

    currentData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['线路名']}</td>
           <td class="arrow-cell">
    <span class="start-point">${row['起点']}</span>
    <span class="arrow">⇄</span>
    <span class="end-point">${row['终点']}</span>
</td>
            <td>${row['运营日期']}</td>
            <td>${row['首班车时间']}</td>
            <td>${row['末班车时间']}</td>
            <td>${row['票价']}</td>
            <td>${row['折扣方式']}</td>
            <td class="station-cell" onclick="showStationInfo(this)">
                ${row['具体站点信息'].replace(/\n/g, '<br>')}
            </td>
        `;
        tbody.appendChild(tr);
    });
    updatePageInfo(); // 更新页码显示
}

function updatePagination() {
    totalPages = Math.ceil(allData.length / pageSize);
    updatePageInfo();
    // 禁用首尾页按钮
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function updatePageInfo() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// 上一页
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
}

// 下一页
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderCurrentPage();
    }
}

// 搜索时重置分页
function searchRoute() {
    const searchText = document.getElementById('routeSearch').value.trim().toLowerCase();
    // 过滤数据（假设allData是原始数据，需根据搜索条件重新过滤）
    const filteredData = allData.filter(row =>
        row['线路名'].toLowerCase().includes(searchText) ||
        row['起点'].toLowerCase().includes(searchText) ||
        row['终点'].toLowerCase().includes(searchText)
    );
    allData = filteredData; // 更新为过滤后的数据
    currentPage = 1; // 重置页码
    updatePagination();
    renderCurrentPage();
}

// 在 function.js 中调整渲染逻辑
function showStationInfo(cell) {
    const lineName = cell.closest('tr').cells[0].textContent.trim();
    if (!lineName) return;

    fetch(`/api/get_stations?line_name=${encodeURIComponent(lineName)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                throw new Error(data.message || '数据加载失败');
            }

            // 渲染站点列表，包含站点名称和详情
            const html = data.stations.map(station => `
                <div class="station-item">
                    <p><strong class="station-name">${station.站点}</strong></p>
                    <p>${station.站点详情}</p>
                </div>
            `).join('');

            document.getElementById('stationInfoContent').innerHTML = html;
            document.getElementById('stationInfoSidebar').classList.add('active');
        })
        .catch(error => {
            console.error('前端错误:', error);
            document.getElementById('stationInfoContent').innerHTML = `
                <p>加载站点信息失败，请稍后重试。</p>
            `;
            document.getElementById('stationInfoSidebar').classList.add('active');
        });
}
// 反转站点信息
function reverseStations() {
    const stationInfoContent = document.getElementById('stationInfoContent');
    const stations = stationInfoContent.querySelectorAll('.station-item');
    const stationArray = Array.from(stations);

    // 反转数组
    stationArray.reverse();

    // 清空当前内容
    stationInfoContent.innerHTML = '';

    // 重新添加反转后的站点信息
    stationArray.forEach(station => {
        const clonedStation = station.cloneNode(true); // 克隆节点以避免直接操作DOM
        stationInfoContent.appendChild(clonedStation);
    });
}
// 隐藏站点信息边栏
function hideStationInfo() {
    document.getElementById('stationInfoSidebar').classList.remove('active');
}


function searchRoute() {
    const searchText = document.getElementById('routeSearch').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#busTableBody tr');

    // 如果没有搜索内容，恢复到显示所有数据的界面
    if (searchText === '') {
        // 移除可能存在的“没有找到匹配的线路”提示行
        const noResultRow = document.querySelector('.no-result-row');
        if (noResultRow) {
            noResultRow.remove();
        }

        // 恢复所有行的显示
        rows.forEach(row => {
            row.style.display = 'table-row';
        });

        // 恢复总页数为40，并重置当前页为1
        document.getElementById('totalPages').textContent = 40;
        document.getElementById('currentPage').textContent = 1;
        document.getElementById('prevBtn').disabled = true;
        document.getElementById('nextBtn').disabled = false;

        return;
    }

    let visibleCount = 0;

    // 更新总页数为1
    document.getElementById('totalPages').textContent = 1;
    document.getElementById('currentPage').textContent = 1;
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;

    rows.forEach(row => {
        // 获取线路名、起点、终点的文本（第二列是起点→，第三列是←终点，需提取纯文本）
        const lineName = row.cells[0].textContent.toLowerCase(); // 线路名（第一列）
        const start = row.cells[1].textContent.replace('→', '').trim().toLowerCase(); // 起点（去除箭头）
        const end = row.cells[2].textContent.replace('←', '').trim().toLowerCase(); // 终点（去除箭头）

        // 检查三个字段是否包含搜索文本
        const isMatch =
            lineName.includes(searchText) ||
            start.includes(searchText) ||
            end.includes(searchText);

        row.style.display = isMatch ? 'table-row' : 'none';

        // 计算当前可见的行数
        if (isMatch) {
            visibleCount++;
        }
    });

    // 如果没有任何匹配项，显示提示信息
    if (visibleCount === 0) {
        const tbody = document.getElementById('busTableBody');
        const noResultRow = document.createElement('tr');
        noResultRow.className = 'no-result-row';
        noResultRow.innerHTML = `<td colspan="8" class="no-result-text">没有找到匹配的线路</td>`;
        tbody.appendChild(noResultRow);
    }
}
// 获取历史记录数据
async function fetchHistoryData() {
    try {
        console.log('开始请求历史记录...');
        const response = await fetch('/api/history');
        const data = await response.json();
        console.log('历史记录响应数据:', data);

        if (data.status === 'success') {
            return data.data;
        } else {
            console.error('获取历史记录失败:', data.message);
            return [];
        }
    } catch (error) {
        console.error('获取历史记录失败:', error.message);
        return [];
    }
}

// 渲染历史记录卡片
async function renderHistoryCards() {
    const historyCardsContainer = document.getElementById('historyCards');
    console.log('获取的 historyCardsContainer:', historyCardsContainer);

    if (!historyCardsContainer) {
        console.error('未找到 id 为 "historyCards" 的容器元素');
        return;
    }

    historyCardsContainer.innerHTML = '';

    const historyData = (await fetchHistoryData()).reverse();
    console.log('历史记录数据条数:', historyData.length);

    historyData.forEach((record, index) => {
        console.log(`开始渲染第 ${index + 1} 条记录:`, record);

        try {
            // 修复非法 JSON 字符串
            let jsonStr = record.fullContent;

            // 替换属性名和字符串值的单引号为双引号（非贪婪匹配，避免破坏内容）
            jsonStr = jsonStr
                .replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":')   // 属性名用双引号包裹
                .replace(/:\s*'([^']*?)'(?=[,}])/g, ': "$1"')     // 属性值用双引号包裹
                .replace(/\\"/g, '"')                             // 清除已有转义
                .replace(/\\?"/g, '\\"')                          // 转义双引号
                .replace(/\\"/g, '"');                            // 再次解码

            const itineraryInfo = JSON.parse(jsonStr);
            console.log('解析后的 itineraryInfo:', itineraryInfo);

            const itineraryParts = itineraryInfo.itinerary || '行程规划信息暂无';
            const reasonParts = itineraryInfo['总体理由'] || '总体理由暂无';

            let poisHtml = '<div><strong>详细景点描述：</strong></div>';
            if (itineraryInfo.pois && typeof itineraryInfo.pois === 'object') {
                for (const key in itineraryInfo.pois) {
                    poisHtml += `<div>${itineraryInfo.pois[key]}</div>`;
                }
            } else {
                poisHtml += '<div>景点描述暂无</div>';
            }

            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-card-header">
                    <h3>${record.title}</h3>
                </div>
                <div class="history-card-body">
                    <div class="history-date">${record.date}</div>
                    <div class="history-summary">${itineraryParts}</div>
                    <button class="history-toggle" onclick="toggleHistoryDetails(${record.id})">
                        <i class="fas fa-chevron-down"></i> 查看详情
                    </button>
                    <div class="history-details" id="details-${record.id}" style="display: none;">
                        <div class="history-full-content">
                            <div><strong>行程规划：</strong>${itineraryParts}</div>
                            ${poisHtml}
                            <div><strong>总体理由：</strong>${reasonParts}</div>
                        </div>
                        <iframe class="history-map" src="${record.mapUrl}" frameborder="0"></iframe>
                    </div>
                </div>
            `;
            historyCardsContainer.appendChild(historyCard);
            console.log(`已添加第 ${index + 1} 条历史记录卡片`);
        } catch (e) {
            console.error('解析 itinerary JSON 失败:', e, '原始内容:', record.fullContent);

            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-card-header">
                    <h3>${record.title}</h3>
                </div>
                <div class="history-card-body">
                    <div class="history-date">${record.date}</div>
                    <div class="history-summary">行程规划信息暂无</div>
                    <button class="history-toggle" onclick="toggleHistoryDetails(${record.id})">
                        <i class="fas fa-chevron-down"></i> 查看详情
                    </button>
                    <div class="history-details" id="details-${record.id}" style="display: none;">
                        <div class="history-full-content">
                            <div>行程规划：暂无详细信息</div>
                            <div>详细景点描述：暂无详细信息</div>
                            <div>总体理由：暂无详细信息</div>
                        </div>
                        <iframe class="history-map" src="${record.mapUrl}" frameborder="0"></iframe>
                    </div>
                </div>
            `;
            historyCardsContainer.appendChild(historyCard);
        }
    });
}


// 切换历史记录详情显示/隐藏
function toggleHistoryDetails(recordId) {
    const button = event.currentTarget;
    const detailsSection = document.getElementById(`details-${recordId}`);
    const icon = button.querySelector('i');

    if (detailsSection.style.display === 'block') {
        detailsSection.style.display = 'none';
        button.innerHTML = '<i class="fas fa-chevron-down"></i> 查看详情';
    } else {
        detailsSection.style.display = 'block';
        button.innerHTML = '<i class="fas fa-chevron-up"></i> 收起详情';
    }
}

// 显示历史记录页面
function showHistoryPage() {
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('publicTransportPage').style.display = 'none';
    document.getElementById('weatherPage').style.display = 'none';
    document.getElementById('historyPage').style.display = 'block';

    renderHistoryCards(); // 渲染历史记录卡片
}


// 回到主页面
function backToMainPage() {
    document.getElementById('mainPage').style.display = '';
    document.getElementById('weatherPage').style.display = 'none';
    document.getElementById('publicTransportPage').style.display = 'none';
    document.getElementById('historyPage').style.display = 'none';
}


// 初始化时渲染历史记录
document.addEventListener('DOMContentLoaded', () => {
    // 其他初始化代码...

    // 如果需要在页面加载时显示历史记录，可以调用以下函数
    // renderHistoryCards();
});