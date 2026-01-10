/**
 * Personal Execution OS Dashboard
 * Handles all dashboard interactions and API calls
 */

// API Configuration
const API_BASE = "/api";
const ENDPOINTS = {
  getActiveProject: `${API_BASE}/projects/active/current`,
  getProjects: `${API_BASE}/projects`,
  createProject: `${API_BASE}/projects`,
  activateProject: (projectId) => `${API_BASE}/projects/${projectId}/activate`,
  getMetrics: (projectId) => `${API_BASE}/metrics/${projectId}`,
  getDailyLogs: (projectId) => `${API_BASE}/dailylogs/project/${projectId}`,
  createDailyLog: `${API_BASE}/dailylogs`,
  getDailyLogsByDateRange: (projectId, startDate, endDate) =>
    `${API_BASE}/dailylogs/project/${projectId}/range?startDate=${startDate}&endDate=${endDate}`,
};

// State
let currentActiveProject = null;
let currentMetrics = null;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
  // Refresh every 30 seconds
  setInterval(refreshDashboard, 30000);
});

// ============================================================================
// Dashboard Refresh
// ============================================================================

async function refreshDashboard() {
  try {
    showLoading();
    dismissError();

    // Fetch active project
    await fetchActiveProject();

    // Fetch all projects (for selector list)
    await fetchProjects();

    // Fetch metrics if project exists
    if (currentActiveProject && currentActiveProject.id) {
      await fetchMetrics(currentActiveProject.id);
      await fetchLastActivity(currentActiveProject.id);
    } else {
      displayNoActiveProject();
    }

    hideLoading();
  } catch (error) {
    console.error("Dashboard refresh error:", error);
    hideLoading();
    showError(`Failed to refresh dashboard: ${error.message}`);
  }
}

async function fetchActiveProject() {
  try {
    const response = await fetch(ENDPOINTS.getActiveProject);

    if (response.status === 204) {
      currentActiveProject = null;
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch active project: ${response.statusText}`);
    }

    const apiProject = await response.json();
    currentActiveProject = normalizeProject(apiProject);
    if (currentActiveProject && currentActiveProject.id) {
      displayActiveProject(currentActiveProject);
    } else {
      currentActiveProject = null;
    }
  } catch (error) {
    console.error("Error fetching active project:", error);
    currentActiveProject = null;
  }
}

async function fetchProjects() {
  try {
    const response = await fetch(ENDPOINTS.getProjects);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const apiProjects = await response.json();
    const projects = Array.isArray(apiProjects)
      ? apiProjects.map(normalizeProject).filter((p) => p && p.id)
      : [];

    displayProjects(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

async function fetchMetrics(projectId) {
  try {
    if (!projectId) {
      return;
    }

    const response = await fetch(ENDPOINTS.getMetrics(projectId));

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const apiMetrics = await response.json();
    currentMetrics = normalizeMetrics(apiMetrics);
    displayMetrics(currentMetrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    showError(`Failed to load metrics: ${error.message}`);
  }
}

async function fetchLastActivity(projectId) {
  try {
    if (!projectId) {
      return;
    }

    // Get logs for this week
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = formatDateForAPI(weekAgo);
    const endDate = formatDateForAPI(today);

    const response = await fetch(
      ENDPOINTS.getDailyLogsByDateRange(projectId, startDate, endDate)
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const apiLogs = await response.json();
    const logs = Array.isArray(apiLogs)
      ? apiLogs.map(normalizeDailyLog).filter((l) => l && l.id)
      : [];

    if (logs && logs.length > 0) {
      displayLastActivity(logs[logs.length - 1]);
    } else {
      displayNoLastActivity();
    }
  } catch (error) {
    console.error("Error fetching last activity:", error);
  }
}

// ============================================================================
// Display Functions
// ============================================================================

function displayActiveProject(project) {
  const projectCard = document.getElementById("active-project");
  const nameEl = document.getElementById("project-name");
  const goalEl = document.getElementById("project-goal");
  const datesEl = document.getElementById("project-dates");

  nameEl.textContent = project.name;
  goalEl.textContent = project.goal || "No goal set";

  const startDate = new Date(project.startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  datesEl.textContent = `Started: ${startDate}`;
}

function displayProjects(projects) {
  const list = document.getElementById("projects-list");

  if (!list) {
    return;
  }

  if (!projects || projects.length === 0) {
    list.innerHTML = '<div class="no-activity">No projects yet</div>';
    return;
  }

  const rows = projects
    .slice()
    .sort((a, b) => {
      if (a.isActive === b.isActive) {
        return a.name.localeCompare(b.name);
      }
      return a.isActive ? -1 : 1;
    })
    .map((p) => {
      const activeBadge = p.isActive
        ? '<span class="project-active-badge">ACTIVE</span>'
        : "";
      const activateButton = p.isActive
        ? '<button class="btn btn-secondary" disabled>Active</button>'
        : `<button class="btn btn-secondary activate-project-btn" data-project-id="${escapeHtml(
            p.id
          )}">Activate</button>`;

      const goal = p.goal ? escapeHtml(p.goal) : "No goal";
      return `
        <div class="project-list-item">
          <div class="project-list-item-left">
            <div class="project-list-item-name">${escapeHtml(p.name)}</div>
            <div class="project-list-item-meta">${goal}</div>
          </div>
          <div class="project-list-item-actions">
            ${activeBadge}
            ${activateButton}
          </div>
        </div>
      `;
    })
    .join("");

  list.innerHTML = rows;

  list.querySelectorAll(".activate-project-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;
      activateProject(projectId);
    });
  });

  list.innerHTML = rows;
}

function displayNoActiveProject() {
  document.getElementById("active-project").innerHTML = `
        <div class="no-active-project">
            <p>No active project</p>
        </div>
    `;

  // Clear metrics
  document.getElementById("time-value").textContent = "0";
  document.getElementById("time-hours").textContent = "0h 0m";
  document.getElementById("revenue-value").textContent = "0.00";
  document.getElementById("revenue-per-hour-detail").textContent = "$0.00/hr";
  document.getElementById("days-worked").textContent = "0";
  document.getElementById("streak-value").textContent = "0";
  document.getElementById("streak-icon").textContent = "";

  displayNoLastActivity();
}

function displayMetrics(metrics) {
  // Time Spent
  const totalMinutes = metrics.totalTimeMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.getElementById("time-value").textContent = totalMinutes.toString();
  document.getElementById("time-hours").textContent = `${hours}h ${minutes}m`;

  // Revenue
  document.getElementById("revenue-value").textContent =
    metrics.totalRevenue.toFixed(2);
  document.getElementById(
    "revenue-per-hour-detail"
  ).textContent = `$${metrics.revenuePerHour.toFixed(2)}/hr`;

  // Days Worked
  document.getElementById("days-worked").textContent =
    metrics.daysWorked.toString();

  // Current Streak
  const streakEl = document.getElementById("streak-value");
  const streakIconEl = document.getElementById("streak-icon");

  streakEl.textContent = metrics.currentStreak.toString();

  if (metrics.currentStreak > 0) {
    streakIconEl.textContent = "🔥";
  } else {
    streakIconEl.textContent = "";
  }
}

function displayLastActivity(log) {
  const activityCard = document.getElementById("last-activity");
  const logDate = new Date(log.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  activityCard.innerHTML = `
        <div class="activity-item">
            <div class="activity-date">${logDate}</div>
            <div class="activity-description"><strong>${
              log.taskDescription
            }</strong></div>
            <div class="activity-description">${log.outputDescription}</div>
            <div class="activity-meta">
                <span>⏱️ ${log.timeSpentMinutes} min</span>
                <span>💰 $${log.revenueGenerated.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function displayNoLastActivity() {
  const activityCard = document.getElementById("last-activity");
  activityCard.innerHTML =
    '<div class="no-activity">No logs recorded yet</div>';
}

// ============================================================================
// UI State Management
// ============================================================================

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

function showError(message) {
  const errorBanner = document.getElementById("error");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorBanner.classList.remove("hidden");
}

function dismissError() {
  document.getElementById("error").classList.add("hidden");
}

// ============================================================================
// Modal Management
// ============================================================================

function openProjectModal() {
  document.getElementById("project-modal").classList.remove("hidden");
  document.getElementById("project-name-input").focus();
}

function closeProjectModal() {
  document.getElementById("project-modal").classList.add("hidden");
  document.getElementById("project-name-input").value = "";
  document.getElementById("project-goal-input").value = "";
}

function openNewLogModal() {
  if (!currentActiveProject) {
    showError("Please create or activate a project first");
    return;
  }
  document.getElementById("log-modal").classList.remove("hidden");
  document.getElementById("log-task-input").focus();
}

function closeLogModal() {
  document.getElementById("log-modal").classList.add("hidden");
  document.getElementById("log-task-input").value = "";
  document.getElementById("log-output-input").value = "";
  document.getElementById("log-time-input").value = "";
  document.getElementById("log-revenue-input").value = "0";
  document.getElementById("log-note-input").value = "";
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  const projectModal = document.getElementById("project-modal");
  const logModal = document.getElementById("log-modal");

  if (e.target === projectModal) {
    closeProjectModal();
  }
  if (e.target === logModal) {
    closeLogModal();
  }
});

// ============================================================================
// Form Submission Handlers
// ============================================================================

async function handleCreateProject(event) {
  event.preventDefault();

  const name = document.getElementById("project-name-input").value.trim();
  const goal = document.getElementById("project-goal-input").value.trim();

  if (!name) {
    showError("Project name is required");
    return;
  }

  try {
    const payload = {
      name,
      goal: goal || null,
      startDate: formatDateForAPI(new Date()),
      isActive: true,
    };

    const response = await fetch(ENDPOINTS.createProject, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create project");
    }

    closeProjectModal();
    await refreshDashboard();
  } catch (error) {
    console.error("Error creating project:", error);
    showError(`Failed to create project: ${error.message}`);
  }
}

async function handleCreateLog(event) {
  event.preventDefault();

  if (!currentActiveProject) {
    showError("No active project");
    return;
  }

  const taskDescription = document
    .getElementById("log-task-input")
    .value.trim();
  const outputDescription = document
    .getElementById("log-output-input")
    .value.trim();
  const timeSpentMinutes = parseInt(
    document.getElementById("log-time-input").value
  );
  const revenueGenerated =
    parseFloat(document.getElementById("log-revenue-input").value) || 0;
  const note = document.getElementById("log-note-input").value.trim();

  if (!taskDescription || !outputDescription || !timeSpentMinutes) {
    showError("Task, output, and time are required");
    return;
  }

  try {
    const payload = {
      date: formatDateForAPI(new Date()),
      projectId: currentActiveProject.id,
      taskDescription,
      outputDescription,
      timeSpentMinutes,
      revenueGenerated,
      note: note || null,
    };

    const response = await fetch(ENDPOINTS.createDailyLog, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create log");
    }

    // ============================================================================
    // Data Normalizers & Actions
    // ============================================================================

    function normalizeProject(apiProject) {
      if (!apiProject) {
        return null;
      }

      return {
        id: apiProject.Id ?? apiProject.id ?? null,
        name: apiProject.Name ?? apiProject.name ?? "",
        goal: apiProject.Goal ?? apiProject.goal ?? null,
        startDate: apiProject.StartDate ?? apiProject.startDate ?? null,
        isActive:
          typeof apiProject.IsActive === "boolean"
            ? apiProject.IsActive
            : typeof apiProject.isActive === "boolean"
            ? apiProject.isActive
            : false,
      };
    }

    function normalizeMetrics(apiMetrics) {
      if (!apiMetrics) {
        return {
          totalTimeMinutes: 0,
          totalRevenue: 0,
          revenuePerHour: 0,
          daysWorked: 0,
          currentStreak: 0,
        };
      }

      return {
        totalTimeMinutes: apiMetrics.TotalTimeMinutes ?? apiMetrics.totalTimeMinutes ?? 0,
        totalRevenue: apiMetrics.TotalRevenue ?? apiMetrics.totalRevenue ?? 0,
        revenuePerHour: apiMetrics.RevenuePerHour ?? apiMetrics.revenuePerHour ?? 0,
        daysWorked: apiMetrics.DaysWorked ?? apiMetrics.daysWorked ?? 0,
        currentStreak: apiMetrics.CurrentStreak ?? apiMetrics.currentStreak ?? 0,
      };
    }

    function normalizeDailyLog(apiLog) {
      if (!apiLog) {
        return null;
      }

      return {
        id: apiLog.Id ?? apiLog.id ?? null,
        date: apiLog.Date ?? apiLog.date ?? null,
        taskDescription: apiLog.TaskDescription ?? apiLog.taskDescription ?? "",
        outputDescription: apiLog.OutputDescription ?? apiLog.outputDescription ?? "",
        timeSpentMinutes: apiLog.TimeSpentMinutes ?? apiLog.timeSpentMinutes ?? 0,
        revenueGenerated: apiLog.RevenueGenerated ?? apiLog.revenueGenerated ?? 0,
      };
    }

    async function activateProject(projectId) {
      if (!projectId) {
        showError("Invalid project selected");
        return;
      }

      try {
        const response = await fetch(ENDPOINTS.activateProject(projectId), {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to activate project");
        }

        await refreshDashboard();
      } catch (error) {
        console.error("Error activating project:", error);
        showError(`Failed to activate project: ${error.message}`);
      }
    }

    function escapeHtml(value) {
      if (!value) {
        return "";
      }

      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    closeLogModal();
    await refreshDashboard();
  } catch (error) {
    console.error("Error creating log:", error);
    showError(`Failed to log work: ${error.message}`);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDateForAPI(date) {
  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================================================
// Project Activation
// ============================================================================

async function activateProject(projectId) {
  try {
    if (!projectId) {
      showError("Project ID is missing");
      return;
    }

    const response = await fetch(ENDPOINTS.activateProject(projectId), {
      method: "POST",
    });

    if (!response.ok) {
      let message = "Failed to activate project";
      try {
        const error = await response.json();
        message = error.error || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    await refreshDashboard();
  } catch (error) {
    console.error("Error activating project:", error);
    showError(`Failed to activate project: ${error.message}`);
  }
}

// ============================================================================
// API Response Normalization (PascalCase/camelCase tolerant)
// ============================================================================

function pick(obj, pascalKey, camelKey) {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }
  if (obj[pascalKey] !== undefined) {
    return obj[pascalKey];
  }
  if (obj[camelKey] !== undefined) {
    return obj[camelKey];
  }
  return undefined;
}

function normalizeProject(apiProject) {
  if (!apiProject || typeof apiProject !== "object") {
    return null;
  }

  return {
    id: pick(apiProject, "Id", "id"),
    name: pick(apiProject, "Name", "name"),
    goal: pick(apiProject, "Goal", "goal"),
    startDate: pick(apiProject, "StartDate", "startDate"),
    isActive: Boolean(pick(apiProject, "IsActive", "isActive")),
    createdAt: pick(apiProject, "CreatedAt", "createdAt"),
  };
}

function normalizeMetrics(apiMetrics) {
  if (!apiMetrics || typeof apiMetrics !== "object") {
    return null;
  }

  return {
    projectId: pick(apiMetrics, "ProjectId", "projectId"),
    totalTimeMinutes: Number(
      pick(apiMetrics, "TotalTimeMinutes", "totalTimeMinutes") || 0
    ),
    totalRevenue: Number(pick(apiMetrics, "TotalRevenue", "totalRevenue") || 0),
    revenuePerHour: Number(
      pick(apiMetrics, "RevenuePerHour", "revenuePerHour") || 0
    ),
    daysWorked: Number(pick(apiMetrics, "DaysWorked", "daysWorked") || 0),
    currentStreak: Number(
      pick(apiMetrics, "CurrentStreak", "currentStreak") || 0
    ),
  };
}

function normalizeDailyLog(apiLog) {
  if (!apiLog || typeof apiLog !== "object") {
    return null;
  }

  return {
    id: pick(apiLog, "Id", "id"),
    date: pick(apiLog, "Date", "date"),
    projectId: pick(apiLog, "ProjectId", "projectId"),
    taskDescription: pick(apiLog, "TaskDescription", "taskDescription"),
    timeSpentMinutes: Number(
      pick(apiLog, "TimeSpentMinutes", "timeSpentMinutes") || 0
    ),
    outputDescription: pick(apiLog, "OutputDescription", "outputDescription"),
    revenueGenerated: Number(
      pick(apiLog, "RevenueGenerated", "revenueGenerated") || 0
    ),
    note: pick(apiLog, "Note", "note"),
    createdAt: pick(apiLog, "CreatedAt", "createdAt"),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// For debugging
window.DEBUG = {
  currentActiveProject,
  currentMetrics,
  refreshDashboard,
};
