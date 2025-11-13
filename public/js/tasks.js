// Different name to avoid conflict with auth.js
const TASK_API_BASE_URL = "/api";

// Keep last loaded tasks in memory so Edit can use them
let cachedTasks = [];

function getToken() {
  return localStorage.getItem("taskflow_token");
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/index.html";
  }
  return token;
}

// Load tasks on My Tasks / Calendar pages
async function loadTasks() {
  const token = requireAuth();
  if (!token) return;

  try {
    const res = await fetch(`${TASK_API_BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("GET /api/tasks error:", res.status, errData);

      const listElError = document.getElementById("tasksList");
      if (listElError) {
        listElError.innerHTML = `<p style="color:#fff">Error loading tasks (${res.status}).</p>`;
      }
      return;
    }

    const tasks = await res.json();
    cachedTasks = Array.isArray(tasks) ? tasks : [];
    console.log("Tasks from API:", tasks);

    // --- My Tasks page ---
    const listEl = document.getElementById("tasksList");
    if (listEl) {
      listEl.innerHTML = "";

      if (!Array.isArray(tasks) || tasks.length === 0) {
        listEl.innerHTML =
          "<p style='color: #fff; font-size:14px'>No tasks yet. Create one!</p>";
      } else {
        tasks.forEach((task) => {
          const isDelayed = task.status === "delayed";

          const card = document.createElement("div");
          card.className = "task-card";
          card.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || ""}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Due:</strong> ${
              task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "-"
            }</p>
            <div class="task-actions">
              ${
                !isDelayed
                  ? `<button class="btn small" onclick="delayTask('${task._id}')">Delay</button>`
                  : `<button class="btn small disabled" disabled>Delayed</button>`
              }
              <button class="btn small" onclick="editTask('${
                task._id
              }')">Edit</button>
              <button class="btn small danger" onclick="deleteTask('${
                task._id
              }')">Delete</button>
            </div>
          `;
          listEl.appendChild(card);
        });
      }
    }

    // --- Calendar ---
    renderCalendar(tasks);
  } catch (err) {
    console.error("Error loading tasks", err);
  }
}

// Delay a task (increase due date + set status=delayed)
async function delayTask(taskId) {
  const token = getToken();
  if (!token) return;

  const confirmDelay = confirm("Delay this task by one day?");
  if (!confirmDelay) return;

  try {
    const res = await fetch(`${TASK_API_BASE_URL}/tasks/${taskId}/delay`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    console.log("PATCH /tasks/:id/delay response:", res.status, data);

    if (!res.ok) {
      alert(data.message || `Failed to delay task (${res.status})`);
      return;
    }

    await loadTasks(); // refresh UI
  } catch (err) {
    console.error("Delay task error", err);
    alert("Network error while delaying task");
  }
}

// Edit a task (simple prompt-based editor)
async function editTask(taskId) {
  const token = getToken();
  if (!token) return;

  // Find task from cached list
  const task = cachedTasks.find((t) => t._id === taskId);
  if (!task) {
    alert("Task not found in memory. Please refresh the page.");
    return;
  }

  const newTitle = prompt("Edit task title:", task.title);
  if (newTitle === null) return; // user cancelled

  const newDescription = prompt(
    "Edit description:",
    task.description || ""
  );
  if (newDescription === null) return;

  const newDueDate = prompt(
    "Edit due date (YYYY-MM-DD, leave empty to clear):",
    task.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  if (newDueDate === null) return;

  const newPriority = prompt(
    "Edit priority (low / medium / high):",
    task.priority || "medium"
  );
  if (newPriority === null) return;

  const body = {
    title: newTitle.trim(),
    description: newDescription.trim(),
    priority: newPriority.trim().toLowerCase(),
  };

  // Only send dueDate if not empty
  if (newDueDate.trim() !== "") {
    body.dueDate = newDueDate.trim();
  } else {
    body.dueDate = null;
  }

  try {
    const res = await fetch(`${TASK_API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT", // or PATCH, backendine göre
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    console.log("PUT /tasks/:id response:", res.status, data);

    if (!res.ok) {
      alert(data.message || `Failed to update task (${res.status})`);
      return;
    }

    await loadTasks(); // refresh list + calendar
  } catch (err) {
    console.error("Edit task error", err);
    alert("Network error while updating task");
  }
}

// Delete a task
async function deleteTask(taskId) {
  const token = getToken();
  if (!token) return;

  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${TASK_API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    console.log("DELETE /tasks/:id response:", res.status, data);

    if (!res.ok) {
      alert(data.message || `Failed to delete task (${res.status})`);
      return;
    }

    await loadTasks(); // refresh list + calendar
  } catch (err) {
    console.error("Delete task error", err);
    alert("Network error while deleting task");
  }
}

// Handle Add Task form
const addTaskForm = document.getElementById("addTaskForm");
if (addTaskForm) {
  requireAuth();
  addTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = getToken();
    const title = document.getElementById("taskTitle").value.trim();
    const description = document
      .getElementById("taskDescription")
      .value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;

    try {
      const res = await fetch(`${TASK_API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate, priority }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("POST /api/tasks response:", res.status, data);

      if (!res.ok) {
        alert(data.message || `Failed to create task (${res.status})`);
        return;
      }

      alert("Task created!");
      window.location.href = "/home-tasks.html";
    } catch (err) {
      console.error("Create task error", err);
      alert("Network error while creating task");
    }
  });
}

// Simple calendar renderer: group tasks by date
function renderCalendar(tasks) {
  const container = document.getElementById("calendarContainer");
  if (!container) return;

  const byDate = new Map();

  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const dateKey = new Date(task.dueDate).toDateString();
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey).push(task);
  });

  container.innerHTML = "";

  if (byDate.size === 0) {
    container.innerHTML = "<p>No dated tasks yet.</p>";
    return;
  }

  for (const [date, list] of byDate.entries()) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.innerHTML = `<h3>${date}</h3>`;

    const ul = document.createElement("ul");
    list.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = `• ${task.title} (${task.priority} – ${task.status})`;
      ul.appendChild(li);
    });

    dayEl.appendChild(ul);
    container.appendChild(dayEl);
  }
}

// Load profile on settings page
async function loadProfile() {
  const token = requireAuth();
  if (!token) return;

  const el = document.getElementById("profileInfo");
  if (!el) return;

  try {
    const res = await fetch(`${TASK_API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      el.textContent = data.message || "Error loading profile";
      return;
    }

    el.textContent = `${data.fullName} (${data.email})`;
  } catch (err) {
    console.error("Profile load error", err);
    el.textContent = "Error loading profile";
  }
}

// Handle Change Password form on Settings page
const changePasswordForm = document.getElementById("changePasswordForm");
if (changePasswordForm) {
  requireAuth();
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = getToken();
    const currentPassword = document
      .getElementById("currentPassword")
      .value.trim();
    const newPassword = document
      .getElementById("newPassword")
      .value.trim();

    if (!currentPassword || !newPassword) {
      alert("Please enter both current and new password.");
      return;
    }

    try {
      const res = await fetch(
        `${TASK_API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json().catch(() => ({}));
      console.log("PUT /auth/change-password response:", res.status, data);

      if (!res.ok) {
        alert(data.message || `Failed to change password (${res.status})`);
        return;
      }

      alert("Password updated successfully.");
      changePasswordForm.reset();
    } catch (err) {
      console.error("Change password error", err);
      alert("Network error while changing password");
    }
  });
}

// Auto bootstrap
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tasksList")) {
    loadTasks();
  }
  if (document.getElementById("calendarContainer")) {
    loadTasks();
  }
  if (document.getElementById("profileInfo")) {
    loadProfile();
  }
});
