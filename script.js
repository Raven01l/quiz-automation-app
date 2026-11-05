
const QUIZ_TITLE = "JavaScript Basics Quiz"; 
let score = 0;                               
const history = [];                         

const questions = [                          
  { id: 1, text: "Which keyword creates a constant?", options: ["let", "const", "var"], correctIndex: 1, category: "variables" },
  { id: 2, text: "What does 5 + 2 + '3' give?", options: ["10", "73", "523"], correctIndex: 1, category: "operators" },
  { id: 3, text: "Which brackets create an array?", options: ["{}", "[]", "()"], correctIndex: 1, category: "arrays" },
  { id: 4, text: "Which keyword creates a function?", options: ["function", "fun", "def"], correctIndex: 0, category: "functions" }
];


const categories = new Set(questions.map(q => q.category)); 
const answers = new Map();                                  


function checkAnswer(question, answerIndex) {
  return question.correctIndex === answerIndex;
}
const calculatePercent = (correct, total) => (correct / total) * 100; 
const sumScores = (...scores) => scores.reduce((sum, s) => sum + s, 0); 


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


function saveResult(result) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {                         
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
  for (const item of history) {                
    const li = document.createElement("li");
    li.textContent = `${item.date} - ${item.score}/${item.total}`;
    list.appendChild(li);
  }
  const totalCorrect = sumScores(...history.map(item => item.score)); 
  const summary = document.createElement("li");
  summary.textContent = `Total correct so far: ${totalCorrect}`;
  list.appendChild(summary);
}


async function startQuiz() {
  score = 0;
  answers.clear();
  const wrongCategories = new Set();

  for (let i = 0; i < questions.length; i++) {            
    const { id, text, options, category } = questions[i]; 
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
    history.push({ ...saved, date: new Date().toLocaleString() }); 
    showHistory();
  } catch (error) {
    document.getElementById("result").textContent += ` Error: ${error.message}`;
  } finally {
    console.log("Quiz finished");                             
  }
}

document.getElementById("start-btn").addEventListener("click", startQuiz);