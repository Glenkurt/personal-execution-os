/**
 * Personal Execution OS Dashboard
 * Handles all dashboard interactions and API calls
 */

// API Configuration
const API_BASE = '/api';
const ENDPOINTS = {
    getActiveProject: `${API_BASE}/projects/active/current`,
    getProjects: `${API_BASE}/projects`,
    createProject: `${API_BASE}/projects`,
    getMetrics: (projectId) => `${API_BASE}/metrics/${projectId}`,
    getDailyLogs: (projectId) => `${API_BASE}/dailylogs/project/${projectId}`,
    createDailyLog: `${API_BASE}/dailylogs`,
    getDailyLogsByDateRange: (projectId, startDate, endDate) =>
        `${API_BASE}/dailylogs/project/${projectId}/range?startDate=${startDate}&endDate=${endDate}`
};

// State
let currentActiveProject = null;
let currentMetrics = null;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
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

        // Fetch metrics if project exists
        if (currentActiveProject) {
            await fetchMetrics(currentActiveProject.id);
            await fetchLastActivity(currentActiveProject.id);
        } else {
            displayNoActiveProject();
        }

        hideLoading();
    } catch (error) {
        console.error('Dashboard refresh error:', error);
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

        currentActiveProject = await response.json();
        displayActiveProject(currentActiveProject);
    } catch (error) {
        console.error('Error fetching active project:', error);
        currentActiveProject = null;
    }
}

async function fetchMetrics(projectId) {
    try {
        const response = await fetch(ENDPOINTS.getMetrics(projectId));

        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }

        currentMetrics = await response.json();
        displayMetrics(currentMetrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        showError(`Failed to load metrics: ${error.message}`);
    }
}

async function fetchLastActivity(projectId) {
    try {
        // Get logs for this week
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const startDate = formatDateForAPI(weekAgo);
        const endDate = formatDateForAPI(today);

        const response = await fetch(ENDPOINTS.getDailyLogsByDateRange(projectId, startDate, endDate));

        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }

        const logs = await response.json();
        if (logs && logs.length > 0) {
            displayLastActivity(logs[logs.length - 1]);
        } else {
            displayNoLastActivity();
        }
    } catch (error) {
        console.error('Error fetching last activity:', error);
    }
}

// ============================================================================
// Display Functions
// ============================================================================

function displayActiveProject(project) {
    const projectCard = document.getElementById('active-project');
    const nameEl = document.getElementById('project-name');
    const goalEl = document.getElementById('project-goal');
    const datesEl = document.getElementById('project-dates');

    nameEl.textContent = project.name;
    goalEl.textContent = project.goal || 'No goal set';

    const startDate = new Date(project.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    datesEl.textContent = `Started: ${startDate}`;
}

function displayNoActiveProject() {
    document.getElementById('active-project').innerHTML = `
        <div class="no-active-project">
            <p>No active project</p>
        </div>
    `;
    
    // Clear metrics
    document.getElementById('time-value').textContent = '0';
    document.getElementById('time-hours').textContent = '0h 0m';
    document.getElementById('revenue-value').textContent = '0.00';
    document.getElementById('revenue-per-hour-detail').textContent = '$0.00/hr';
    document.getElementById('days-worked').textContent = '0';
    document.getElementById('streak-value').textContent = '0';
    document.getElementById('streak-icon').textContent = '';
    
    displayNoLastActivity();
}

function displayMetrics(metrics) {
    // Time Spent
    const totalMinutes = metrics.totalTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    document.getElementById('time-value').textContent = totalMinutes.toString();
    document.getElementById('time-hours').textContent = `${hours}h ${minutes}m`;

    // Revenue
    document.getElementById('revenue-value').textContent = metrics.totalRevenue.toFixed(2);
    document.getElementById('revenue-per-hour-detail').textContent = `$${metrics.revenuePerHour.toFixed(2)}/hr`;

    // Days Worked
    document.getElementById('days-worked').textContent = metrics.daysWorked.toString();

    // Current Streak
    const streakEl = document.getElementById('streak-value');
    const streakIconEl = document.getElementById('streak-icon');
    
    streakEl.textContent = metrics.currentStreak.toString();
    
    if (metrics.currentStreak > 0) {
        streakIconEl.textContent = '🔥';
    } else {
        streakIconEl.textContent = '';
    }
}

function displayLastActivity(log) {
    const activityCard = document.getElementById('last-activity');
    const logDate = new Date(log.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    activityCard.innerHTML = `
        <div class="activity-item">
            <div class="activity-date">${logDate}</div>
            <div class="activity-description"><strong>${log.taskDescription}</strong></div>
            <div class="activity-description">${log.outputDescription}</div>
            <div class="activity-meta">
                <span>⏱️ ${log.timeSpentMinutes} min</span>
                <span>💰 $${log.revenueGenerated.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function displayNoLastActivity() {
    const activityCard = document.getElementById('last-activity');
    activityCard.innerHTML = '<div class="no-activity">No logs recorded yet</div>';
}

// ============================================================================
// UI State Management
// ============================================================================

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorBanner = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');
}

function dismissError() {
    document.getElementById('error').classList.add('hidden');
}

// ============================================================================
// Modal Management
// ============================================================================

function openProjectModal() {
    document.getElementById('project-modal').classList.remove('hidden');
    document.getElementById('project-name-input').focus();
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
    document.getElementById('project-name-input').value = '';
    document.getElementById('project-goal-input').value = '';
}

function openNewLogModal() {
    if (!currentActiveProject) {
        showError('Please create or activate a project first');
        return;
    }
    document.getElementById('log-modal').classList.remove('hidden');
    document.getElementById('log-task-input').focus();
}

function closeLogModal() {
    document.getElementById('log-modal').classList.add('hidden');
    document.getElementById('log-task-input').value = '';
    document.getElementById('log-output-input').value = '';
    document.getElementById('log-time-input').value = '';
    document.getElementById('log-revenue-input').value = '0';
    document.getElementById('log-note-input').value = '';
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const projectModal = document.getElementById('project-modal');
    const logModal = document.getElementById('log-modal');

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

    const name = document.getElementById('project-name-input').value.trim();
    const goal = document.getElementById('project-goal-input').value.trim();

    if (!name) {
        showError('Project name is required');
        return;
    }

    try {
        const payload = {
            name,
            goal: goal || null,
            startDate: formatDateForAPI(new Date()),
            isActive: true
        };

        const response = await fetch(ENDPOINTS.createProject, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create project');
        }

        closeProjectModal();
        await refreshDashboard();
    } catch (error) {
        console.error('Error creating project:', error);
        showError(`Failed to create project: ${error.message}`);
    }
}

async function handleCreateLog(event) {
    event.preventDefault();

    if (!currentActiveProject) {
        showError('No active project');
        return;
    }

    const taskDescription = document.getElementById('log-task-input').value.trim();
    const outputDescription = document.getElementById('log-output-input').value.trim();
    const timeSpentMinutes = parseInt(document.getElementById('log-time-input').value);
    const revenueGenerated = parseFloat(document.getElementById('log-revenue-input').value) || 0;
    const note = document.getElementById('log-note-input').value.trim();

    if (!taskDescription || !outputDescription || !timeSpentMinutes) {
        showError('Task, output, and time are required');
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
            note: note || null
        };

        const response = await fetch(ENDPOINTS.createDailyLog, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create log');
        }

        closeLogModal();
        await refreshDashboard();
    } catch (error) {
        console.error('Error creating log:', error);
        showError(`Failed to log work: ${error.message}`);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDateForAPI(date) {
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// For debugging
window.DEBUG = {
    currentActiveProject,
    currentMetrics,
    refreshDashboard
};
