const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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"; // Paste your API key here 


const loadDataFromLocalstorage = () => {
    // Tải các cuộc trò chuyện và chủ đề đã lưu từ bộ nhớ cục bộ và áp dụng/thêm trên trang
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Welcome to Chatdemo</h1>
                            <p>Bạn có thể hỏi bất cứ câu hỏi nào <br> Chatdemo sẽ gửi thông tin để hỗ trợ bạn Bạn hết mức có thể 😀                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Cuộn xuống cuối vùng trò chuyện
}

const createChatElement = (content, className) => {
    // Tạo div mới và áp dụng trò chuyện, lớp được chỉ định và đặt nội dung html của div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    // Xác định các thuộc tính và dữ liệu cho yêu cầu API
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: userText,
            
            max_tokens: 2048,
            temperature: 0.1,
            n: 1,
            stop: null

            
        })
    }

    // Gửi yêu cầu POST tới API, nhận phản hồi và đặt phản hồi dưới dạng văn bản thành phần đoạn văn
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) { // Thêm lớp lỗi vào thành phần đoạn văn và đặt văn bản lỗi
        pElement.classList.add("error");
        pElement.textContent = "Ối! Đã xảy ra lỗi khi truy xuất phản hồi. Vui lòng thử lại.";
    }

    // Xóa hoạt ảnh gõ, nối thêm thành phần đoạn văn và lưu cuộc trò chuyện vào bộ nhớ cục bộ
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Sao chép nội dung văn bản phản hồi vào clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Hiển thị ảnh động gõ và gọi hàm getChatResponse
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Tạo một div trò chuyện đến bằng cách nhập hoạt ảnh và thêm nó vào vùng chứa trò chuyện
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Nhận giá trị chatInput và xóa khoảng trắng thừa
    if(!userText) return; // Nếu chatInput trống, hãy quay lại từ đây

    // Xóa trường nhập và đặt lại chiều cao của nó
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Tạo div trò chuyện gửi đi với tin nhắn của người dùng và thêm nó vào vùng chứa trò chuyện
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Xóa các cuộc trò chuyện khỏi bộ nhớ cục bộ và gọi hàm LoadDataFromLocalstorage
    if(confirm("Bạn có chắc chắn muốn xóa tất cả các cuộc trò chuyện không?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Chuyển đổi lớp của nội dung cho chế độ chủ đề và lưu chủ đề đã cập nhật vào bộ nhớ cục bộ
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {   
    // Điều chỉnh linh hoạt chiều cao của trường đầu vào dựa trên nội dung của nó
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // Nếu nhấn phím Enter mà không có Shift và chiều rộng cửa sổ lớn hơn
    // hơn 800 pixel, xử lý cuộc trò chuyện đi
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 1000) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);