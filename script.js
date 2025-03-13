// API Key for OpenWeatherMap
const API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Free API key for demo purposes

// DOM Elements
// Navigation
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.section');
const menuToggle = document.getElementById('menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

// Theme Toggle
const themeSwitch = document.getElementById('theme-switch');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Weather Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastCards = document.getElementById('forecast-cards');

// Temperature Unit Toggle
const unitBtns = document.querySelectorAll('.unit-btn');
let temperatureUnit = 'celsius'; // Default unit

// Task Elements
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskPriority = document.getElementById('task-priority');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksList = document.getElementById('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');

// Set default date to today for task input
taskDate.valueAsDate = new Date();

// Initialize the app
function init() {
    // Check for saved theme preference
    checkThemePreference();

    // Set up event listeners
    setupEventListeners();

    // Load weather for default city or last searched city
    const lastCity = localStorage.getItem('lastCity') || 'New York';
    getWeatherData(lastCity);

    // Load tasks from local storage
    loadTasks();
}

// Check for saved theme preference
function checkThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
        darkModeToggle.checked = true;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link and corresponding section
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }
        });
    });

    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);
    darkModeToggle.addEventListener('change', toggleTheme);

    // Temperature unit toggle
    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            unitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            temperatureUnit = btn.getAttribute('data-unit');

            // Update weather display with new unit
            const lastCity = localStorage.getItem('lastCity') || 'New York';
            getWeatherData(lastCity);
        });
    });

    // Weather search
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeatherData(city);
            }
        }
    });

    // Task manager
    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTask();
        }
    });

    // Task filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.getAttribute('data-filter'));
        });
    });
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');

    // Sync both theme toggles
    themeSwitch.checked = isDarkMode;
    darkModeToggle.checked = isDarkMode;

    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
}

// Weather Functions
async function getWeatherData(city) {
    try {
        // Show loading state
        setWeatherLoadingState();

        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!currentWeatherResponse.ok) {
            throw new Error(`City not found (${currentWeatherResponse.status})`);
        }

        const currentWeatherData = await currentWeatherResponse.json();

        // Save last searched city
        localStorage.setItem('lastCity', city);

        // Update current weather UI
        updateCurrentWeather(currentWeatherData);

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }

        const forecastData = await forecastResponse.json();

        // Update forecast UI
        updateForecast(forecastData);

        // Clear input field
        cityInput.value = '';

    } catch (error) {
        console.error('Error fetching weather data:', error);
        cityName.textContent = 'City not found';
        temperature.textContent = '--°';
        weatherIcon.src = '/placeholder.svg?height=100&width=100';
        weatherDescription.textContent = 'Error loading weather data';

        // Show error message for 3 seconds
        setTimeout(() => {
            if (cityName.textContent === 'City not found') {
                const lastCity = localStorage.getItem('lastCity') || 'New York';
                getWeatherData(lastCity);
            }
        }, 3000);
    }
}

function setWeatherLoadingState() {
    cityName.textContent = 'Loading...';
    temperature.textContent = '--°';
    feelsLike.textContent = 'Feels like: --°';
    weatherDescription.textContent = '--';
    humidity.textContent = '--%';
    windSpeed.textContent = '-- km/h';
    pressure.textContent = '-- hPa';
    forecastCards.innerHTML = '';

    // Add loading animation
    document.querySelector('.current-weather').classList.add('loading');
}

function updateCurrentWeather(data) {
    // Remove loading animation
    document.querySelector('.current-weather').classList.remove('loading');

    // Update city name
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    // Update date
    const date = new Date();
    currentDate.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Convert temperature if needed
    let temp = data.main.temp;
    let feelsLikeTemp = data.main.feels_like;

    if (temperatureUnit === 'fahrenheit') {
        temp = (temp * 9 / 5) + 32;
        feelsLikeTemp = (feelsLikeTemp * 9 / 5) + 32;
    }

    // Update temperature
    temperature.textContent = `${Math.round(temp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
    feelsLike.textContent = `Feels like: ${Math.round(feelsLikeTemp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;

    // Update weather icon and description
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherDescription.textContent = data.weather[0].description;

    // Update details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    pressure.textContent = `${data.main.pressure} hPa`;

    // Add animation
    temperature.classList.add('pulse');
    setTimeout(() => {
        temperature.classList.remove('pulse');
    }, 500);
}

function updateForecast(data) {
    // Clear previous forecast
    forecastCards.innerHTML = '';

    // Get one forecast per day (excluding today)
    const dailyForecasts = {};
    const today = new Date().setHours(0, 0, 0, 0);

    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayTime = date.setHours(0, 0, 0, 0);

        // Only take the first forecast of each day and exclude today
        if (!dailyForecasts[day] && dayTime > today) {
            dailyForecasts[day] = forecast;
        }
    });

    // Create forecast cards (limit to 5 days)
    Object.values(dailyForecasts).slice(0, 5).forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Convert temperature if needed
        let temp = forecast.main.temp;
        if (temperatureUnit === 'fahrenheit') {
            temp = (temp * 9 / 5) + 32;
        }

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="forecast-date">${day}, ${formattedDate}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
            <div class="forecast-temp">${Math.round(temp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}</div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;

        forecastCards.appendChild(card);
    });
}

// Task Manager Functions
function addTask() {
    const taskText = taskInput.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;

    if (taskText) {
        // Create task object
        const task = {
            id: Date.now(),
            text: taskText,
            date: date,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add task to local storage
        const tasks = getTasks();
        tasks.push(task);
        saveTasks(tasks);

        // Clear input
        taskInput.value = '';

        // Refresh task list
        renderTasks();

        // Show success animation
        addTaskBtn.classList.add('success');
        setTimeout(() => {
            addTaskBtn.classList.remove('success');
        }, 1000);
    } else {
        // Shake input to indicate error
        taskInput.classList.add('error');
        setTimeout(() => {
            taskInput.classList.remove('error');
        }, 500);
    }
}

function renderTasks(filter = 'all') {
    // Clear task list
    tasksList.innerHTML = '';

    // Get tasks from local storage
    const tasks = getTasks();

    // Filter tasks
    let filteredTasks = tasks;
    if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Sort tasks by date (closest due date first)
    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Render tasks
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">No tasks found</div>';
        return;
    }

    filteredTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        taskItem.style.animationDelay = `${index * 0.05}s`;

        const formattedDate = new Date(task.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Check if task is overdue
        const isOverdue = new Date(task.date) < new Date().setHours(0, 0, 0, 0) && !task.completed;

        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.text} ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}</div>
                <div class="task-date">
                    <span>${formattedDate}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" title="Edit Task">✏️</button>
                <button class="task-btn delete-btn" title="Delete Task">🗑️</button>
            </div>
        `;

        tasksList.appendChild(taskItem);

        // Add event listeners to task item
        const checkbox = taskItem.querySelector('.task-checkbox');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => {
            toggleTaskStatus(task.id);
        });

        editBtn.addEventListener('click', () => {
            editTask(task.id);
        });

        deleteBtn.addEventListener('click', () => {
            deleteTask(task.id);
        });
    });
}

function toggleTaskStatus(taskId) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks(tasks);
        renderTasks(getActiveFilter());
    }
}

function editTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === taskId);

    if (task) {
        // Populate form with task data
        taskInput.value = task.text;
        taskDate.value = task.date;
        taskPriority.value = task.priority;

        // Remove task from list
        deleteTask(taskId, false);

        // Focus on input
        taskInput.focus();

        // Change button text temporarily
        const originalBtnText = addTaskBtn.innerHTML;
        addTaskBtn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Update Task</span>';

        // Reset button after 3 seconds if not clicked
        setTimeout(() => {
            addTaskBtn.innerHTML = originalBtnText;
        }, 3000);
    }
}

function deleteTask(taskId, render = true) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(filteredTasks);

    if (render) {
        renderTasks(getActiveFilter());
    }
}

function filterTasks(filter) {
    renderTasks(filter);
}

function getActiveFilter() {
    const activeFilter = document.querySelector('.filter-btn.active');
    return activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
}

// Local Storage Functions
function getTasks() {
    try {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
        return [];
    }
}

function saveTasks(tasks) {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
    }
}

function loadTasks() {
    renderTasks();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add CSS class for loading animation
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});