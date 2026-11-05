// ===== Week 1: variables, arrays, operators =====
const QUIZ_TITLE = "JavaScript Basics Quiz"; // const = never changes (constants are UPPER_SNAKE_CASE)
let score = 0;                               // let = changes over time (camelCase)
const history = [];                          // array: starts empty

const questions = [                          // array of objects
  { id: 1, text: "Which keyword creates a constant?", options: ["let", "const", "var"], correctIndex: 1, category: "variables" },
  { id: 2, text: "What does 5 + 2 + '3' give?", options: ["10", "73", "523"], correctIndex: 1, category: "operators" },
  { id: 3, text: "Which brackets create an array?", options: ["{}", "[]", "()"], correctIndex: 1, category: "arrays" },
  { id: 4, text: "Which keyword creates a function?", options: ["function", "fun", "def"], correctIndex: 0, category: "functions" }
];

// ===== Week 2: Set and Map =====
const categories = new Set(questions.map(q => q.category)); // Set = unique values only
const answers = new Map();                                  // Map = key/value pairs (question id -> answer)

// ===== Week 2: normal function, arrow function, rest parameter =====
function checkAnswer(question, answerIndex) {
  return question.correctIndex === answerIndex;
}
const calculatePercent = (correct, total) => (correct / total) * 100; // arrow function
const sumScores = (...scores) => scores.reduce((sum, s) => sum + s, 0); // ...scores = rest

// ===== Week 1: conditions (if / switch) =====
function getGrade(percent) {
  if (percent >= 80) {
    return "Excellent";
  } else if (percent >= 50) {
    return "Good";
  } else {
    return "Keep practicing";
  }
}

function getTip(category) {
  switch (category) {
    case "variables": return "Review let and const.";
    case "operators": return "Review how + works with strings.";
    case "arrays": return "Review arrays.";
    default: return "Review this topic.";
  }
}

// ===== Week 3: Promise =====
function saveResult(result) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {                         // simulates a slow save (600 ms)
      if (result.total > 0) {
        resolve(result);
      } else {
        reject(new Error("No questions answered"));
      }
    }, 600);
  });
}

function showHistory() {
  const list = document.getElementById("history");
  list.innerHTML = "";
  for (const item of history) {                // loop through the history array
    const li = document.createElement("li");
    li.textContent = `${item.date} - ${item.score}/${item.total}`;
    list.appendChild(li);
  }
  const totalCorrect = sumScores(...history.map(item => item.score)); // spread operator
  const summary = document.createElement("li");
  summary.textContent = `Total correct so far: ${totalCorrect}`;
  list.appendChild(summary);
}

// ===== Main: async, destructuring, template literals, try/catch/finally =====
async function startQuiz() {
  score = 0;
  answers.clear();
  const wrongCategories = new Set();

  for (let i = 0; i < questions.length; i++) {            // for loop
    const { id, text, options, category } = questions[i]; // destructuring
    const optionList = options.map((option, n) => `${n + 1}) ${option}`).join("\n");
    const answer = Number(prompt(`Question ${i + 1}/${questions.length}\n${text}\n${optionList}`)) - 1;
    answers.set(id, answer);
    if (checkAnswer(questions[i], answer)) {
      score++;
    } else {
      wrongCategories.add(category);
    }
  }

  const percent = calculatePercent(score, questions.length);
  const tips = [...wrongCategories].map(getTip).join(" ");
  document.getElementById("result").textContent =
    `${QUIZ_TITLE}: ${score}/${questions.length} (${percent}%) - ${getGrade(percent)}. ${tips}`;

  try {
    const saved = await saveResult({ score, total: questions.length, percent });
    history.push({ ...saved, date: new Date().toLocaleString() }); // spread copies the object
    showHistory();
  } catch (error) {
    document.getElementById("result").textContent += ` Error: ${error.message}`;
  } finally {
    console.log("Quiz finished");                              // runs success or fail
  }
}

document.getElementById("start-btn").addEventListener("click", startQuiz);