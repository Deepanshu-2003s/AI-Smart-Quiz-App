let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;
let selectedAnswer = null;

async function fetchQuestions() {
  const difficulty = document.getElementById("difficulty").value;
  const category = document.getElementById("category").value;

  const res = await fetch(
    `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`
  );

  const data = await res.json();
  questions = data.results;
}

async function startQuiz() {
  await fetchQuestions();

  document.getElementById("home").classList.add("hidden");
  document.getElementById("quiz-box").classList.remove("hidden");

  currentIndex = 0;
  score = 0;

  loadQuestion();
}

function loadQuestion() {
  resetTimer();
  updateProgress();

  let q = questions[currentIndex];
  document.getElementById("question").innerHTML = q.question;

  let options = [...q.incorrect_answers, q.correct_answer];
  options.sort(() => Math.random() - 0.5);

  let html = "";
  options.forEach(option => {
    html += `<button onclick="selectAnswer('${option}', this)">${option}</button>`;
  });

  document.getElementById("options").innerHTML = html;

  startTimer();
}

function selectAnswer(answer, btn) {
  let correct = questions[currentIndex].correct_answer;

  let buttons = document.querySelectorAll("#options button");
  buttons.forEach(b => b.disabled = true);

  if (answer === correct) {
    score++;
    btn.classList.add("correct");
    document.getElementById("correctSound").play();
  } else {
    btn.classList.add("wrong");
    document.getElementById("wrongSound").play();
  }

  buttons.forEach(b => {
    if (b.innerText === correct) b.classList.add("correct");
  });

  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function startTimer() {
  timeLeft = 10;
  document.getElementById("timer").innerText = "Time: " + timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = "Time: " + timeLeft;

    if (timeLeft === 0) {
      nextQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
}

function updateProgress() {
  let progress = (currentIndex / questions.length) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}

function generateFeedback() {
  if (score === 5) return "🚀 Outstanding!";
  if (score >= 3) return "👍 Good job!";
  return "📚 Keep practicing!";
}

function showResult() {
  document.getElementById("quiz-box").classList.add("hidden");
  document.getElementById("result-box").classList.remove("hidden");

  document.getElementById("score").innerText = `Score: ${score}/5`;
  document.getElementById("feedback").innerText = generateFeedback();

  drawScoreChart();
}

function saveResult() {
  let name = document.getElementById("username").value;

  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push({ name, score });

  localStorage.setItem("scores", JSON.stringify(scores));
  alert("Saved!");
}

function showLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];

  scores.sort((a, b) => b.score - a.score);

  let html = "<h3>Leaderboard</h3>";
  scores.forEach(s => {
    html += `<p>${s.name} - ${s.score}</p>`;
  });

  document.getElementById("leaderboard").innerHTML = html;
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
}

function drawScoreChart() {
  let canvas = document.getElementById("scoreChart");
  let ctx = canvas.getContext("2d");

  let percent = (score / questions.length) * 100;

  ctx.beginPath();
  ctx.arc(75, 75, 60, 0, 2 * Math.PI);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(75, 75, 60, 0, (percent/100) * 2 * Math.PI);
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 10;
  ctx.stroke();
}