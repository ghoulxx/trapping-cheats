(async function () {
  const SITE_DETECTION = {
    QUIZLET: "quizlet.com",
    BLOOKET: "blooket.com"
  };

  const currentSite = window.location.hostname;
  const isQuizlet = currentSite.includes(SITE_DETECTION.QUIZLET);
  const isBlooket = currentSite.includes(SITE_DETECTION.BLOOKET);

  // Helper function to create a draggable GUI
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
      <h3 style="color: #0074D9; text-align: center;">Trapping Study Assistant 📚</h3>
      <label>Question:</label>
      <textarea id="question-input" style="width: 100%; height: 50px; background-color: #111; color: #eee;"></textarea>
      <button id="answer-btn" style="width: 100%; background-color: #0074D9; color: white; margin-top: 8px;">Get Correct Answer</button>
      <div id="result-area" style="margin-top: 10px; padding: 5px; background: #001f3f; color: #eee; border-radius: 4px;">
        Results will appear here.
      </div>
      <small style="color: #0074D9; display: block; text-align: center; margin-top: 10px;">
        Created by Ghoulx 💻
      </small>
    `;
    document.body.appendChild(gui);
    return gui;
  }

  // Fetch correct answer from external API
  async function fetchCorrectAnswer(query) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data[0]?.meanings[0]?.definitions[0]?.definition || "Answer not found.";
      }
      return "Answer not found.";
    } catch (error) {
      return "Error fetching the answer. Try again.";
    }
  }

  // Highlight the correct answer on the page
  function highlightCorrectAnswer(correctAnswer) {
    const answerElements = document.querySelectorAll('.answer-choice, .option');
    let foundAnswer = false;

    answerElements.forEach((element) => {
      if (element.textContent.trim().toLowerCase() === correctAnswer.toLowerCase()) {
        element.style.backgroundColor = "#0074D9";
        element.style.color = "#fff";
        element.style.fontWeight = "bold";
        foundAnswer = true;
      }
    });

    return foundAnswer ? "Correct answer highlighted!" : "Correct answer not found on screen.";
  }

  // Extract question from site
  function extractQuestion() {
    if (isBlooket) {
      const questionElem = document.querySelector('.questionText');
      return questionElem ? questionElem.innerText : null;
    }
    if (isQuizlet) {
      const questionElem = document.querySelector('[data-testid="questionOrTerm"]');
      return questionElem ? questionElem.innerText : null;
    }
    return "Manual entry required.";
  }

  // GUI setup and event handling
  const gui = createGUI();
  const answerBtn = document.getElementById('answer-btn');
  const questionInput = document.getElementById('question-input');
  const resultArea = document.getElementById('result-area');

  // Prefill the question if detected from the site
  const detectedQuestion = extractQuestion();
  if (detectedQuestion) {
    questionInput.value = detectedQuestion;
  }

  // Correct Answer Button Logic
  answerBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();
    if (!question) {
      resultArea.textContent = 'Please enter a question!';
      return;
    }
    const correctAnswer = await fetchCorrectAnswer(question);
    resultArea.textContent = `Correct answer for "${question}": ${correctAnswer}`;

    // Highlight the correct answer if available on screen
    const highlightResult = highlightCorrectAnswer(correctAnswer);
    resultArea.textContent += `\n${highlightResult}`;
  });

  // Make GUI draggable
  gui.onmousedown = function (event) {
    let shiftX = event.clientX - gui.getBoundingClientRect().left;
    let shiftY = event.clientY - gui.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      gui.style.left = pageX - shiftX + 'px';
      gui.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    gui.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      gui.onmouseup = null;
    };
  };

  gui.ondragstart = function () {
    return false;
  };
})();
