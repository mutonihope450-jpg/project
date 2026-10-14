const STORAGE_KEY = "clinic-flow-tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    console.warn("Could not load saved tasks.", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function render() {
  list.replaceChildren();
  const filteredTasks = visibleTasks();

  filteredTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
  emptyState.hidden = filteredTasks.length > 0;
  emptyState.textContent = tasks.length === 0
    ? "No tasks yet. Add your first task above."
    : `No ${currentFilter} tasks.`;
}

function addTask(text) {
  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  form.reset();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filter) => filter.classList.toggle("active", filter === button));
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

render();