//Constants 
const QUIZ_TITLE = "JavaScript Basics Quiz";
const STORAGE_KEYS = { questions: "quiz-questions", history: "quiz-history" };

const DEFAULT_QUESTIONS = [
  { id: 1, text: "Which keyword creates a constant?", options: ["let", "const", "var"], correctIndex: 1, category: "variables" },
  { id: 2, text: "What does 5 + 2 + '3' give?", options: ["10", "73", "523"], correctIndex: 1, category: "operators" },
  { id: 3, text: "Which brackets create an array?", options: ["{}", "[]", "()"], correctIndex: 1, category: "arrays" },
  { id: 4, text: "Which keyword creates a function?", options: ["function", "fun", "def"], correctIndex: 0, category: "functions" }
];

//Storage helping shit
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Could not load", key, error);
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not save", key, error);
  }
}

//State
let questions = loadData(STORAGE_KEYS.questions, [...DEFAULT_QUESTIONS]);
let quizHistory = loadData(STORAGE_KEYS.history, []);
let quiz = { list: [], index: 0, score: 0, wrongQuestions: [], answers: new Map() };

const $ = id => document.getElementById(id); // short helper
const getCategories = () => [...new Set(questions.map(q => q.category))]; // up to date

//Helpers
function checkAnswer(question, answerIndex) {
  return question.correctIndex === answerIndex;
}
const calculatePercent = (correct, total) => (correct / total) * 100;
const sumScores = (...scores) => scores.reduce((sum, s) => sum + s, 0);

function getGrade(percent) {
  if (percent >= 80) return "Excellent";
  if (percent >= 50) return "Good";
  return "Keep practicing";
}

function getTip(category) {
  switch (category) {
    case "variables": return "Review let and const.";
    case "operators": return "Review how + works with strings.";
    case "arrays": return "Review arrays.";
    default: return `Review ${category}.`;
  }
}

function saveResult(result) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (result.total > 0) resolve(result);
      else reject(new Error("No questions answered"));
    }, 600);
  });
}

//Screens
function showView(name) {
  for (const id of ["menu", "quiz", "result-section"]) {
    $(id).hidden = id !== name;
  }
}

function showHistory() {
  const list = $("history");
  list.innerHTML = "";
  for (const item of quizHistory) {
    const li = document.createElement("li");
    li.textContent = `${item.date} - ${item.score}/${item.total}`;
    list.appendChild(li);
  }
  const summary = document.createElement("li");
  summary.textContent = `Total correct so far: ${sumScores(...quizHistory.map(item => item.score))}`;
  list.appendChild(summary);
}

// Quiz flow 
function startQuiz(list = [...questions]) {
  if (list.length === 0) {
    $("menu-message").textContent = "Add a question first.";
    return;
  }
  $("menu-message").textContent = "";
  quiz = { list, index: 0, score: 0, wrongQuestions: [], answers: new Map() };
  showView("quiz");
  showQuestion();
}

function showQuestion() {
  const { text, options } = quiz.list[quiz.index];
  $("progress").textContent = `Question ${quiz.index + 1}/${quiz.list.length}`;
  $("question-text").textContent = text;
  $("options").innerHTML = "";
  options.forEach((option, n) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => handleAnswer(n));
    $("options").appendChild(button);
  });
}

function handleAnswer(answerIndex) {
  const question = quiz.list[quiz.index];
  quiz.answers.set(question.id, answerIndex);
  if (checkAnswer(question, answerIndex)) {
    quiz.score++;
  } else {
    quiz.wrongQuestions.push(question);
  }
  quiz.index++;
  if (quiz.index < quiz.list.length) showQuestion();
  else finishQuiz();
}

async function finishQuiz() {
  const total = quiz.list.length;
  const percent = calculatePercent(quiz.score, total);
  const tips = [...new Set(quiz.wrongQuestions.map(q => q.category))].map(getTip).join(" ");
  $("result").textContent =
    `${QUIZ_TITLE}: ${quiz.score}/${total} (${Math.round(percent)}%) - ${getGrade(percent)}. ${tips}`;
  showView("result-section");
   $("retry-btn").hidden = quiz.wrongQuestions.length === 0;
  try {
    const saved = await saveResult({ score: quiz.score, total, percent });
    quizHistory.push({ ...saved, date: new Date().toLocaleString() });
    saveData(STORAGE_KEYS.history, quizHistory);
    showHistory();
  } catch (error) {
    $("result").textContent += ` Error: ${error.message}`;
  } finally {
    console.log("Quiz finished");
  }
}

//Manage questions 
let editingId = null;

const nextId = () => questions.reduce((max, q) => Math.max(max, q.id), 0) + 1;

function saveQuestions() {
  saveData(STORAGE_KEYS.questions, questions);
  renderQuestionList();
  renderCategoryFilter();
}

function renderQuestionList() {
  const list = $("question-list");
  list.innerHTML = "";
  for (const q of questions) {
    const li = document.createElement("li");
    li.textContent = `${q.text} [${q.category}] `;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => editQuestion(q.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteQuestion(q.id));

    li.append(editBtn, deleteBtn);
    list.appendChild(li);
  }
  renderCategoryFilter();
}

function renderCategoryFilter() {
  const filter = $("category-filter");
  const selectedCategory = filter.value;
  filter.replaceChildren(new Option("All categories", ""));

  for (const category of getCategories()) {
    filter.add(new Option(category, category));
  }

  if (getCategories().includes(selectedCategory)) {
    filter.value = selectedCategory;
  }
}

function deleteQuestion(id) {
  questions = questions.filter(q => q.id !== id);
  saveQuestions();
}

function editQuestion(id) {
  const q = questions.find(item => item.id === id);
  $("q-text").value = q.text;
  $("q-options").value = q.options.join(", ");
  $("q-correct").value = q.correctIndex + 1;
  $("q-category").value = q.category;
  editingId = id;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const options = $("q-options").value.split(",").map(o => o.trim()).filter(Boolean);
  const correctIndex = Number($("q-correct").value) - 1;
  if (options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
    $("form-message").textContent = "Enter at least 2 options and a valid correct option number.";
    return;
  }
  $("form-message").textContent = "";
  const data = { text: $("q-text").value.trim(), options, correctIndex, category: $("q-category").value.trim() };

  if (editingId === null) {
    questions.push({ id: nextId(), ...data });
  } else {
    questions = questions.map(q => (q.id === editingId ? { ...q, ...data } : q));
    editingId = null;
  }
  event.target.reset();
  saveQuestions();
}

// Categories
function renderCategoryFilter() {
  const select = $("category-filter");
  const current = select.value;
  select.innerHTML = '<option value="all">All categories</option>';
  for (const category of getCategories()) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  }
  select.value = getCategories().includes(current) ? current : "all";
}

function getQuizQuestions() {
  const category = $("category-filter").value;
  return category === "all" ? [...questions] : questions.filter(q => q.category === category);
}
//Start up part
$("start-btn").addEventListener("click", () => startQuiz(getQuizQuestions()));
renderCategoryFilter();
  const category = $("category-filter").value;
  const filteredQuestions = category
    ? questions.filter(question => question.category === category)
    : [...questions];
  startQuiz(filteredQuestions);
  $("retry-btn").addEventListener("click", () => startQuiz(quiz.wrongQuestions));

$("back-btn").addEventListener("click", () => showView("menu"));
$("question-form").addEventListener("submit", handleFormSubmit);
renderQuestionList();
showView("menu");
showHistory();