console.log("main.js loaded");
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const apiKeyInput = document.getElementById('apiKey');

function appendMsg(text, sender) {
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert('請先輸入 API Key');
    return;
  }
  const text = userInput.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  userInput.value = '';
  appendMsg('AI 正在回應...', 'ai');

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      }
    );
    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      data = null;
    }
    // 移除 loading
    chatBox.removeChild(chatBox.lastChild);
    if (!res.ok) {
      appendMsg(`API 錯誤 (${res.status}): ${(data && data.error && data.error.message) ? data.error.message : res.statusText}`, 'ai');
      return;
    }
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      appendMsg(data.candidates[0].content.parts[0].text, 'ai');
    } else {
      appendMsg('AI 回應失敗，請檢查 API Key 或稍後再試。', 'ai');
    }
  } catch (err) {
    chatBox.removeChild(chatBox.lastChild);
    appendMsg('發生錯誤：' + err, 'ai');
  }
});
