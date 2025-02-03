(async function () {
  const CryptoJS = {
    encrypt: (text, pass) => btoa(text.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ pass.charCodeAt(i % pass.length))).join('')),
    decrypt: (cipher, pass) => atob(cipher).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ pass.charCodeAt(i % pass.length))).join('')
  };

  let USER_KEYS = JSON.parse(localStorage.getItem("user_keys")) || {};

  function logEvent(event) {
    let logs = JSON.parse(localStorage.getItem("study_tool_logs")) || [];
    logs.push({ event, timestamp: new Date().toISOString() });
    localStorage.setItem("study_tool_logs", JSON.stringify(logs));
  }

  function getStoredCredentials() {
    return JSON.parse(localStorage.getItem("study_tool_credentials"));
  }

  function storeCredentials(username, key) {
    localStorage.setItem("study_tool_credentials", JSON.stringify({ username, key: CryptoJS.encrypt(key, "secret") }));
    logEvent(`User ${username} logged in.`);
  }

  function validateCredentials(username, key) {
    return USER_KEYS[username] === CryptoJS.encrypt(key, "secret");
  }

  async function requestCredentials() {
    let credentials = getStoredCredentials();
    if (credentials && validateCredentials(credentials.username, CryptoJS.decrypt(credentials.key, "secret"))) return true;
    
    while (true) {
      let username = prompt("Enter your username:");
      if (!username) return false;
      
      if (!USER_KEYS[username]) {
        let newKey = prompt("No key found. Create a new key:");
        if (!newKey) return false;
        USER_KEYS[username] = CryptoJS.encrypt(newKey, "secret");
        localStorage.setItem("user_keys", JSON.stringify(USER_KEYS));
        alert("Key created successfully!");
      }
      
      let userKey = prompt("Enter your access key:");
      if (!userKey) return false;
      
      if (validateCredentials(username, userKey)) {
        storeCredentials(username, userKey);
        return true;
      } else {
        alert("Invalid username or key! Try again.");
        logEvent(`Failed login attempt for username: ${username}`);
      }
    }
  }

  if (!(await requestCredentials())) {
    alert("Access Denied. Invalid Credentials.");
    logEvent("Access denied due to invalid credentials.");
    return;
  }

  alert("Access Granted! Welcome, Ghoulx User");
  logEvent("Access granted.");

  // Injecting Study Assistant GUI
  (async function () {
    alert("Made by Ghoulx");

    const SITE_DETECTION = {
      QUIZLET: "quizlet.com",
      BLOOKET: "blooket.com"
    };

    const currentSite = window.location.hostname;
    const isQuizlet = currentSite.includes(SITE_DETECTION.QUIZLET);
    const isBlooket = currentSite.includes(SITE_DETECTION.BLOOKET);

    function createGUI() {
      const gui = document.createElement('div');
      gui.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background-color: #001f3f;
        padding: 15px;
        border: 2px solid #0074D9;
        z-index: 10000;
        box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
        font-family: 'Arial', sans-serif;
        border-radius: 12px;
        color: white;
      `;
      gui.innerHTML = `
        <h3 style="color: #0074D9; text-align: center;">Trapping Study Assistant</h3>
        <label>Question:</label>
        <textarea id="question-input" style="width: 100%; height: 50px; background-color: #111; color: #eee;"></textarea>
        <button id="answer-btn" style="width: 100%; background-color: #0074D9; color: white; margin-top: 8px;">Get Correct Answer</button>
        <div id="result-area" style="margin-top: 10px; padding: 5px; background: #001f3f; color: #eee; border-radius: 4px;">
          Results will appear here.
        </div>
        <a href="https://github.com/ghoulxx/trapping-cheats/edit/main/cheats/Glock.js" target="_blank" style="display: block; text-align: center; margin-top: 10px; color: #0074D9;">Github Repository</a>
        <small style="color: #0074D9; display: block; text-align: center; margin-top: 10px;">
          Created by Ghoulx
        </small>
      `;
      document.body.appendChild(gui);
      return gui;
    }

    const gui = createGUI();
    const answerBtn = document.getElementById('answer-btn');
    const questionInput = document.getElementById('question-input');
    const resultArea = document.getElementById('result-area');
    
    answerBtn.addEventListener('click', async () => {
      const question = questionInput.value.trim();
      if (!question) {
        resultArea.textContent = 'Please enter a question!';
        return;
      }
      const correctAnswer = await fetchCorrectAnswer(question);
      resultArea.textContent = `Correct answer for "${question}": ${correctAnswer}`;
    });
  })();
})()
