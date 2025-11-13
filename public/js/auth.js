const API_BASE_URL = "/api";

function saveToken(token) {
  localStorage.setItem("taskflow_token", token);
}

function getToken() {
  return localStorage.getItem("taskflow_token");
}

function logout() {
  localStorage.removeItem("taskflow_token");
  window.location.href = "/index.html";
}

// Handle login on index.html
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || "Login failed";
        return;
      }

      saveToken(data.token);
      window.location.href = "/home-tasks.html";
    } catch (err) {
      console.error("Login error", err);
      errorEl.textContent = "Network error. Please try again.";
    }
  });
}
