# TaskFlow — JavaScript To-Do App 

A fully functional to-do list application built with vanilla JavaScript (ES6+), demonstrating core JavaScript fundamentals: DOM manipulation, event handling, array methods, and browser localStorage for data persistence.

## Live Features

- **Add tasks** — with category, priority level, and due date
- **Edit tasks** — via a modal popup with pre-filled values
- **Delete tasks** — with confirmation before removing
- **Mark complete/incomplete** — animated checkbox toggle
- **Data persistence** — tasks are saved to `localStorage` and remain after page refresh
- **Filter tasks** — All / Pending / Completed / High Priority / Due Today
- **Real-time search** — filters the task list as you type
- **Sort tasks** — Newest, Oldest, By Priority, By Due Date, A–Z
- **Progress bar** — shows completion percentage
- **Stats dashboard** — total, pending, completed, and high-priority counts
- **Dark mode toggle** — theme preference saved in localStorage
- **Overdue detection** — tasks past their due date are flagged automatically
- **Toast notifications** — instant feedback for every action

## Technologies Used

- **HTML5** — semantic structure
- **CSS3** — custom properties (variables), Flexbox, responsive design, dark mode theming
- **JavaScript (ES6+)** — arrow functions, template literals, array methods (`.filter()`, `.map()`, `.sort()`, `.find()`), destructuring
- **Web Storage API** — `localStorage.setItem()` / `getItem()` for persistent data

## Folder Structure

```
Week2_TodoApp/
├── index.html      — App structure and markup
├── style.css       — Styling, layout, and dark mode theme
├── script.js       — All JavaScript logic (CRUD, localStorage, filtering, sorting)
└── README.md       — This file
```

## How to Run

1. Download or clone this repository
2. Open `index.html` directly in any browser — no build step or server required
3. Start adding tasks — they'll automatically save to your browser's localStorage

## Core JavaScript Concepts Demonstrated

### DOM Manipulation
```javascript
function renderTasks() {
  const wrap = document.getElementById('taskListWrap');
  wrap.innerHTML = pending.map(t => taskHTML(t, today)).join('');
}
```

### Event Handling
```javascript
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
```

### localStorage Persistence
```javascript
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
  } catch { tasks = []; }
}
```

### Array Methods for Filtering & Sorting
```javascript
function getFiltered() {
  let arr = [...tasks];
  if (filter === 'pending') arr = arr.filter(t => !t.done);
  if (sortMode === 'priority') arr.sort((a,b) => pOrder[a.priority] - pOrder[b.priority]);
  return arr;
}
```

## Author

**Sundas Bibi**
Computer Science Student, COMSATS University Islamabad
🔗 [LinkedIn](https://www.linkedin.com/in/sundas-bibi-7249b8280)
