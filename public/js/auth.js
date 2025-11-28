

const AUTH_API_BASE_URL = "/api/auth";

// Helper: save & read token
function saveToken(token) {
  localStorage.setItem("taskflow_token", token);
}

function getToken() {
  return localStorage.getItem("taskflow_token");
}

function clearToken() {
  localStorage.removeItem("taskflow_token");
}

// Require auth for protected pages
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/index.html";
  }
  return token;
}



const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("POST /api/auth/login", res.status, data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save JWT + redirect to My Tasks
      saveToken(data.token);
      window.location.href = "/home-tasks.html";
    } catch (err) {
      console.error("Login error", err);
      alert("Network error while logging in");
    }
  });
}



const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document
      .getElementById("registerFullName")
      .value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document
      .getElementById("registerPassword")
      .value.trim();

    try {
      const res = await fetch(`${AUTH_API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("POST /api/auth/register", res.status, data);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Account created! You can now log in.");
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Register error", err);
      alert("Network error while creating account");
    }
  });
}



function logout() {
  clearToken();
  window.location.href = "/index.html";
}


window.authHelpers = {
  getToken,
  requireAuth,
  logout,
};
