// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let currentCity = localStorage.getItem('currentCity') || 'Москва';
let olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];
let editingOlympiadId = null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let focusedOlympiadId = null;
let expandedOlympiads = new Set();

// Фильтры
let currentFilter = {
    difficultyFrom: '',
    difficultyTo: '',
    grade: null
};

// Пароль админа
const ADMIN_PASSWORD = 'admin123';

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const difficultyLevels = {
    'Легкая': 1,
    'Средняя': 2,
    'Сложная': 3,
    'Очень сложная': 4
};

// DOM элементы
const monthView = document.getElementById('monthView');
const currentMonthTitle = document.getElementById('currentMonthTitle');
const monthsScrollContainer = document.getElementById('monthsScrollContainer');
const sidePanel = document.getElementById('sidePanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const dayPanel = document.getElementById('dayPanel');
const closeDayPanelBtn = document.getElementById('closeDayPanelBtn');
const dayPanelContent = document.getElementById('dayPanelContent');
const addOlympiadBtn = document.getElementById('addOlympiadBtn');
const olympiadModal = document.getElementById('olympiadModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const olympiadForm = document.getElementById('olympiadForm');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const registerBtn = document.getElementById('registerBtn');
const editOlympiadBtn = document.getElementById('editOlympiadBtn');
const deleteOlympiadBtn = document.getElementById('deleteOlympiadBtn');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
const adminForm = document.getElementById('adminForm');
const cancelAdminBtn = document.getElementById('cancelAdminBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminError = document.getElementById('adminError');
const focusHint = document.getElementById('focusHint');

// Элементы фильтра и города
const filterBtn = document.getElementById('filterBtn');
const filterModal = document.getElementById('filterModal');
const closeFilterModalBtn = document.getElementById('closeFilterModalBtn');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const difficultyFromSelect = document.getElementById('difficultyFromSelect');
const difficultyToSelect = document.getElementById('difficultyToSelect');
const gradeFilterInput = document.getElementById('gradeFilterInput');
const citySelect = document.getElementById('citySelect');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateAdminUI();
    renderAllMonths();
    
    // Устанавливаем текущий город
    citySelect.value = currentCity;
});

// Обновление интерфейса
function updateAdminUI() {
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (isAdmin) {
        adminElements.forEach(el => el.classList.remove('hidden'));
        adminBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        adminElements.forEach(el => el.classList.add('hidden'));
        adminBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Инициализация обработчиков
function initializeEventListeners() {
    closePanelBtn.addEventListener('click', closeSidePanel);
    closeDayPanelBtn.addEventListener('click', closeDayPanel);
    addOlympiadBtn.addEventListener('click', () => openOlympiadModal());
    closeModalBtn.addEventListener('click', closeOlympiadModal);
    cancelFormBtn.addEventListener('click', closeOlympiadModal);
    olympiadForm.addEventListener('submit', handleFormSubmit);
    registerBtn.addEventListener('click', handleRegistration);
    editOlympiadBtn.addEventListener('click', handleEdit);
    deleteOlympiadBtn.addEventListener('click', handleDelete);
    
    adminBtn.addEventListener('click', openAdminModal);
    logoutBtn.addEventListener('click', handleLogout);
    closeAdminModalBtn.addEventListener('click', closeAdminModal);
    cancelAdminBtn.addEventListener('click', closeAdminModal);
    adminForm.addEventListener('submit', handleAdminLogin);
    
    // Фильтр и город
    filterBtn.addEventListener('click', openFilterModal);
    closeFilterModalBtn.addEventListener('click', closeFilterModal);
    applyFilterBtn.addEventListener('click', applyFilter);
    resetFilterBtn.addEventListener('click', resetFilter);
    citySelect.addEventListener('change', handleCityChange);
    
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('contextmenu', handleRightClick);
    
    // Делегирование событий для Day Panel
    dayPanel.addEventListener('click', handleDayPanelClick);
}

// Обработчик кликов внутри Day Panel
function handleDayPanelClick(e) {
    // Обработка клика по хедеру карточки олимпиады
    const header = e.target.closest('.day-olympiad-header');
    if (header) {
        e.stopPropagation();
        const card = header.closest('.day-olympiad-card');
        if (card) {
            const olympiadId = parseInt(card.dataset.olympiadId);
            toggleOlympiadDetails(olympiadId);
        }
        return;
    }
    
    // Обработка кнопки регистрации
    if (e.target.classList.contains('register-btn-compact')) {
        e.stopPropagation();
        handleRegistration();
        return;
    }
    
    // Обработка кнопки редактирования
    if (e.target.classList.contains('edit-btn-compact')) {
        e.stopPropagation();
        const card = e.target.closest('.day-olympiad-card');
        if (card) {
            const olympiadId = parseInt(card.dataset.olympiadId);
            handleEditFromDay(olympiadId);
        }
        return;
    }
    
    // Обработка кнопки удаления
    if (e.target.classList.contains('delete-btn-compact')) {
        e.stopPropagation();
        const card = e.target.closest('.day-olympiad-card');
        if (card) {
            const olympiadId = parseInt(card.dataset.olympiadId);
            handleDeleteFromDay(olympiadId);
        }
        return;
    }
    
    // Обработка ссылок - не блокируем
    if (e.target.tagName === 'A') {
        e.stopPropagation();
        return;
    }
}

// Фильтрация олимпиад
function getFilteredOlympiads() {
    return olympiads.filter(olympiad => {
        // Фильтр по сложности
        if (currentFilter.difficultyFrom || currentFilter.difficultyTo) {
            const olympiadLevel = difficultyLevels[olympiad.difficulty];
            const fromLevel = currentFilter.difficultyFrom ? difficultyLevels[currentFilter.difficultyFrom] : 1;
            const toLevel = currentFilter.difficultyTo ? difficultyLevels[currentFilter.difficultyTo] : 4;
            
            if (olympiadLevel < fromLevel || olympiadLevel > toLevel) {
                return false;
            }
        }
        
        // Фильтр по классу
        if (currentFilter.grade) {
            const gradeStr = olympiad.grade.toLowerCase();
            const targetGrade = currentFilter.grade;
            
            if (!gradeStr.includes(targetGrade.toString())) {
                return false;
            }
        }
        
        return true;
    });
}

function openFilterModal() {
    difficultyFromSelect.value = currentFilter.difficultyFrom;
    difficultyToSelect.value = currentFilter.difficultyTo;
    gradeFilterInput.value = currentFilter.grade || '';
    
    filterModal.classList.add('active');
}

function closeFilterModal() {
    filterModal.classList.remove('active');
}

function applyFilter() {
    currentFilter.difficultyFrom = difficultyFromSelect.value;
    currentFilter.difficultyTo = difficultyToSelect.value;
    currentFilter.grade = gradeFilterInput.value ? parseInt(gradeFilterInput.value) : null;
    
    closeFilterModal();
    renderAllMonths();
}

function resetFilter() {
    currentFilter = {
        difficultyFrom: '',
        difficultyTo: '',
        grade: null
    };
    
    difficultyFromSelect.value = '';
    difficultyToSelect.value = '';
    gradeFilterInput.value = '';
    
    closeFilterModal();
    renderAllMonths();
}

// Смена города
function handleCityChange() {
    const newCity = citySelect.value;
    
    if (newCity !== currentCity) {
        localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
        
        currentCity = newCity;
        localStorage.setItem('currentCity', currentCity);
        
        olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];
        
        exitFocusMode();
        closeSidePanel();
        closeDayPanel();
        
        renderAllMonths();
    }
}

// Обработчик ПКМ - переключает режим фокуса или выключает его
function handleRightClick(e) {
    // Проверяем, был ли клик по элементу олимпиады в календаре
    const olympiadEvent = e.target.closest('.olympiad-event');
    
    if (olympiadEvent) {
        e.preventDefault();
        
        // Извлекаем olympiadId из onclick атрибута или через другой способ
        const onclickAttr = olympiadEvent.getAttribute('onclick');
        const match = onclickAttr.match(/showOlympiadDetailsById\((\d+)\)/);
        
        if (match) {
            const olympiadId = parseInt(match[1]);
            
            // Если уже в режиме фокуса на этой олимпиаде - выключаем
            if (focusedOlympiadId === olympiadId) {
                exitFocusMode();
            } else {
                // Включаем режим фокуса
                enterFocusMode(olympiadId);
            }
        }
        return;
    }
    
    // Если клик ПКМ не по олимпиаде, но режим фокуса активен - выключаем
    if (focusedOlympiadId !== null) {
        e.preventDefault();
        exitFocusMode();
    }
}

function enterFocusMode(olympiadId) {
    focusedOlympiadId = olympiadId;
    const focusedOlympiad = olympiads.find(o => o.id === olympiadId);
    
    if (!focusedOlympiad) return;
    
    focusHint.classList.remove('hidden');
    renderAllMonths();
}

function exitFocusMode() {
    focusedOlympiadId = null;
    focusHint.classList.add('hidden');
    renderAllMonths();
}

function handleOutsideClick(e) {
    const isSidePanelOpen = sidePanel.classList.contains('active');
    const isDayPanelOpen = dayPanel.classList.contains('active');
    
    if (!isSidePanelOpen && !isDayPanelOpen) return;
    
    const clickedInsideSidePanel = sidePanel.contains(e.target);
    const clickedInsideDayPanel = dayPanel.contains(e.target);
    
    if (clickedInsideSidePanel || clickedInsideDayPanel) return;
    
    const clickedOnOlympiadEvent = e.target.closest('.olympiad-event');
    if (clickedOnOlympiadEvent) return;
    
    const clickedDayCell = e.target.closest('.day-cell:not(.empty-cell)');
    if (clickedDayCell) {
        const clickedInsideEvents = e.target.closest('.olympiad-events-container');
        if (clickedInsideEvents) return;
        return;
    }
    
    closeSidePanel();
    closeDayPanel();
}

function openAdminModal() {
    adminModal.classList.add('active');
    adminPasswordInput.value = '';
    adminError.classList.add('hidden');
}

function closeAdminModal() {
    adminModal.classList.remove('active');
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = adminPasswordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        closeAdminModal();
        updateAdminUI();
        renderAllMonths();
    } else {
        adminError.classList.remove('hidden');
    }
}

function handleLogout() {
    isAdmin = false;
    localStorage.setItem('isAdmin', 'false');
    updateAdminUI();
    closeSidePanel();
    closeDayPanel();
    exitFocusMode();
    renderAllMonths();
}

function renderAllMonths() {
    monthsScrollContainer.innerHTML = '';
    
    const filteredOlympiads = getFilteredOlympiads();
    
    for (let month = 0; month < 12; month++) {
        const monthWrapper = document.createElement('div');
        monthWrapper.className = 'month-calendar-wrapper';
        monthWrapper.id = `month-${month}`;
        
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekdays.forEach(day => {
            const weekdayDiv = document.createElement('div');
            weekdayDiv.className = 'weekday';
            weekdayDiv.textContent = day;
            calendarGrid.appendChild(weekdayDiv);
        });
        
        const daysContainer = document.createElement('div');
        daysContainer.className = 'days-container';
        daysContainer.innerHTML = renderMonthDays(month, filteredOlympiads);
        calendarGrid.appendChild(daysContainer);
        
        monthWrapper.appendChild(calendarGrid);
        monthsScrollContainer.appendChild(monthWrapper);
    }
    
    monthsScrollContainer.addEventListener('scroll', updateCurrentMonthTitle);
}

function updateCurrentMonthTitle() {
    const scrollTop = monthsScrollContainer.scrollTop;
    const monthIndex = Math.round(scrollTop / window.innerHeight);
    currentMonthTitle.textContent = `${monthNames[monthIndex]} ${currentYear}`;
}

function renderMonthDays(month, filteredOlympiads) {
    let html = '';
    
    const firstDay = new Date(currentYear, month, 1);
    const lastDay = new Date(currentYear, month + 1, 0);
    
    const firstDayWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    
    for (let i = 1; i < firstDayWeek; i++) {
        html += '<div class="day-cell empty-cell"></div>';
    }
    
    for (let day = 1; day <= lastDayDate; day++) {
        html += createDayCellHTML(day, month, filteredOlympiads);
    }
    
    return html;
}

// Функция для преобразования hex цвета в rgba с прозрачностью
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ИЗМЕНЕНО: Используем кастомные метки и цвета из настроек олимпиады с динамическими стилями
function createDayCellHTML(day, month, filteredOlympiads) {
    const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOlympiads = filteredOlympiads.filter(o => o.date === dateStr);
    
    let regLabel = '';
    let regClass = '';
    let customGlowStyle = '';
    
    if (focusedOlympiadId !== null) {
        const focusedOlympiad = olympiads.find(o => o.id === focusedOlympiadId);
        if (focusedOlympiad) {
            if (focusedOlympiad.regStart === dateStr) {
                const labelText = focusedOlympiad.focusLabelStart || 'Начало регистрации';
                const color = focusedOlympiad.focusColorStart || '#ff6b6b';
                
                regLabel = `<div class="reg-label" style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); box-shadow: 0 3px 10px ${hexToRgba(color, 0.5)};">${labelText}</div>`;
                regClass = ' reg-start';
                
                // Создаем кастомное свечение с цветом из настроек
                customGlowStyle = `
                    <style>
                        .day-cell.reg-start[data-date="${dateStr}"]::before {
                            background: radial-gradient(ellipse at center, ${hexToRgba(color, 0.5)} 0%, ${hexToRgba(color, 0.2)} 50%, ${hexToRgba(color, 0)} 100%) !important;
                        }
                    </style>
                `;
            } else if (focusedOlympiad.regEnd === dateStr) {
                const labelText = focusedOlympiad.focusLabelEnd || 'Конец регистрации';
                const color = focusedOlympiad.focusColorEnd || '#ff4757';
                
                regLabel = `<div class="reg-label" style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); box-shadow: 0 3px 10px ${hexToRgba(color, 0.5)};">${labelText}</div>`;
                regClass = ' reg-end';
                
                // Создаем кастомное свечение с цветом из настроек
                customGlowStyle = `
                    <style>
                        .day-cell.reg-end[data-date="${dateStr}"]::before {
                            background: radial-gradient(ellipse at center, ${hexToRgba(color, 0.6)} 0%, ${hexToRgba(color, 0.3)} 50%, ${hexToRgba(color, 0)} 100%) !important;
                        }
                    </style>
                `;
            }
        }
    }
    
    let eventsHTML = '';
    dayOlympiads.forEach(olympiad => {
        const bgColor = olympiad.color || '#4a5ab3';
        eventsHTML += `<div class="olympiad-event" style="background-color: ${bgColor}" onclick="event.stopPropagation(); showOlympiadDetailsById(${olympiad.id})">${olympiad.name}</div>`;
    });
    
    let focusClass = '';
    if (focusedOlympiadId !== null) {
        const hasFocusedOlympiad = dayOlympiads.some(o => o.id === focusedOlympiadId);
        if (!hasFocusedOlympiad && dayOlympiads.length > 0) {
            focusClass = ' focus-hidden';
        }
    }
    
    const clickHandler = dayOlympiads.length > 0 
        ? `onclick="handleDayCellClick('${dateStr}', event)"` 
        : (isAdmin ? `onclick="openOlympiadModal('${dateStr}')"` : '');
    
    return `
        ${customGlowStyle}
        <div class="day-cell${regClass}${focusClass}" data-date="${dateStr}" ${clickHandler}>
            ${regLabel}
            <div class="day-number">${day}</div>
            <div class="olympiad-events-container">
                ${eventsHTML}
            </div>
        </div>
    `;
}

function handleDayCellClick(dateStr, event) {
    showDayPanel(dateStr);
}

function showDayPanel(dateStr) {
    const filteredOlympiads = getFilteredOlympiads();
    const dayOlympiads = filteredOlympiads.filter(o => o.date === dateStr);
    
    if (dayOlympiads.length === 0) return;
    
    closeSidePanel();
    
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const monthGenitive = monthNamesGenitive[date.getMonth()];
    const year = date.getFullYear();
    const olympiadWord = getOlympiadWord(dayOlympiads.length);
    
    document.getElementById('dayPanelTitle').innerHTML = `${day} ${monthGenitive} ${year}<br><small style="font-size: 0.7em; font-weight: 400; opacity: 0.9;">${dayOlympiads.length} ${olympiadWord}</small>`;
    
    dayPanelContent.innerHTML = dayOlympiads.map(olympiad => {
        const isExpanded = expandedOlympiads.has(olympiad.id);
        const detailsClass = isExpanded ? '' : 'hidden';
        const iconRotation = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        
        return `
        <div class="day-olympiad-card" data-olympiad-id="${olympiad.id}">
            <div class="day-olympiad-header">
                <div class="day-olympiad-title">
                    <div class="day-olympiad-color" style="background-color: ${olympiad.color || '#4a5ab3'}"></div>
                    <span>${olympiad.name}</span>
                </div>
                <span class="expand-icon" style="transform: ${iconRotation}">▼</span>
            </div>
            <div class="day-olympiad-preview">
                <div class="preview-item">
                    <strong>Сложность:</strong> ${olympiad.difficulty}
                </div>
                ${olympiad.website ? `<div class="preview-item">
                    <strong>Сайт:</strong> <a href="${olympiad.website}" target="_blank">${olympiad.website}</a>
                </div>` : ''}
            </div>
            <div class="day-olympiad-details ${detailsClass}">
                ${olympiad.description ? `<div class="detail-item">
                    <strong>Описание:</strong> ${olympiad.description}
                </div>` : ''}
                <div class="detail-item">
                    <strong>Время:</strong> ${olympiad.time || 'Не установлено'}
                </div>
                <div class="detail-item">
                    <strong>Класс:</strong> ${olympiad.grade}
                </div>
                <div class="detail-item">
                    <strong>Место проведения:</strong> ${olympiad.location || 'Не установлено'}
                </div>
                ${olympiad.regStart ? `<div class="detail-item">
                    <strong>Начало регистрации:</strong> ${formatDate(olympiad.regStart)}
                </div>` : ''}
                ${olympiad.regEnd ? `<div class="detail-item">
                    <strong>Конец регистрации:</strong> ${formatDate(olympiad.regEnd)}
                </div>` : ''}
                ${olympiad.archive ? `<div class="detail-item">
                    <strong>Архив задач:</strong> <a href="${olympiad.archive}" target="_blank">Скачать</a>
                </div>` : ''}
                <button class="register-btn-compact">Регистрация на олимпиаду</button>
                ${isAdmin ? `
                    <div class="admin-actions-compact">
                        <button class="edit-btn-compact">Редактировать</button>
                        <button class="delete-btn-compact">Удалить</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }).join('');
    
    dayPanel.classList.add('active');
}

function getOlympiadWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'олимпиад';
    }
    
    if (lastDigit === 1) {
        return 'олимпиада';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'олимпиады';
    }
    
    return 'олимпиад';
}

function toggleOlympiadDetails(olympiadId) {
    const card = document.querySelector(`[data-olympiad-id="${olympiadId}"]`);
    if (!card) return;
    
    const details = card.querySelector('.day-olympiad-details');
    const icon = card.querySelector('.expand-icon');
    
    const isCurrentlyHidden = details.classList.contains('hidden');
    
    if (isCurrentlyHidden) {
        details.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
        expandedOlympiads.add(olympiadId);
    } else {
        details.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
        expandedOlympiads.delete(olympiadId);
    }
}

function closeDayPanel() {
    dayPanel.classList.remove('active');
    expandedOlympiads.clear();
}

function handleEditFromDay(olympiadId) {
    closeDayPanel();
    const olympiad = olympiads.find(o => o.id === olympiadId);
    if (olympiad) {
        populateFormForEdit(olympiad);
        olympiadModal.classList.add('active');
    }
}

function handleDeleteFromDay(olympiadId) {
    if (confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
        const dateStr = olympiads.find(o => o.id === olympiadId)?.date;
        olympiads = olympiads.filter(o => o.id !== olympiadId);
        localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
        
        if (focusedOlympiadId === olympiadId) {
            exitFocusMode();
        }
        
        const remainingOlympiads = olympiads.filter(o => o.date === dateStr);
        if (remainingOlympiads.length > 0) {
            showDayPanel(dateStr);
        } else {
            closeDayPanel();
        }
        
        renderAllMonths();
    }
}

function showOlympiadDetailsById(olympiadId) {
    const olympiad = olympiads.find(o => o.id === olympiadId);
    if (olympiad) {
        showOlympiadDetails(olympiad);
    }
}

function showOlympiadDetails(olympiad) {
    closeDayPanel();
    
    document.getElementById('olympiadName').textContent = olympiad.name;
    document.getElementById('olympiadDescription').textContent = olympiad.description || 'Нет описания';
    document.getElementById('olympiadDate').textContent = formatDate(olympiad.date);
    document.getElementById('olympiadTime').textContent = olympiad.time || 'Не установлено';
    document.getElementById('olympiadDifficulty').textContent = olympiad.difficulty;
    document.getElementById('olympiadGrade').textContent = olympiad.grade;
    document.getElementById('olympiadLocation').textContent = olympiad.location || 'Не установлено';
    
    document.getElementById('olympiadRegStart').textContent = olympiad.regStart ? formatDate(olympiad.regStart) : 'Не установлено';
    document.getElementById('olympiadRegEnd').textContent = olympiad.regEnd ? formatDate(olympiad.regEnd) : 'Не установлено';
    
    const websiteLink = document.getElementById('olympiadWebsite');
    if (olympiad.website) {
        websiteLink.href = olympiad.website;
        websiteLink.textContent = olympiad.website;
        websiteLink.style.display = 'inline';
    } else {
        websiteLink.style.display = 'none';
    }
    
    const archiveLink = document.getElementById('olympiadArchive');
    if (olympiad.archive) {
        archiveLink.href = olympiad.archive;
        archiveLink.style.display = 'inline';
    } else {
        archiveLink.style.display = 'none';
    }
    
    sidePanel.dataset.olympiadId = olympiad.id;
    sidePanel.classList.add('active');
}

function closeSidePanel() {
    sidePanel.classList.remove('active');
}

function openOlympiadModal(dateStr = null) {
    if (!isAdmin) return;
    
    editingOlympiadId = null;
    olympiadForm.reset();
    document.getElementById('modalTitle').textContent = 'Добавить олимпиаду';
    
    // Значения по умолчанию для новой олимпиады
    document.getElementById('focusLabelStartInput').value = '';
    document.getElementById('focusColorStartInput').value = '#ff6b6b';
    document.getElementById('focusLabelEndInput').value = '';
    document.getElementById('focusColorEndInput').value = '#ff4757';
    
    if (dateStr) {
        document.getElementById('dateInput').value = dateStr;
    }
    
    olympiadModal.classList.add('active');
}

function closeOlympiadModal() {
    olympiadModal.classList.remove('active');
    editingOlympiadId = null;
}

// Заполнение формы при редактировании
function populateFormForEdit(olympiad) {
    editingOlympiadId = olympiad.id;
    document.getElementById('modalTitle').textContent = 'Редактировать олимпиаду';
    document.getElementById('nameInput').value = olympiad.name;
    document.getElementById('descriptionInput').value = olympiad.description || '';
    document.getElementById('dateInput').value = olympiad.date;
    document.getElementById('timeInput').value = olympiad.time || '';
    document.getElementById('regStartInput').value = olympiad.regStart || '';
    document.getElementById('regEndInput').value = olympiad.regEnd || '';
    document.getElementById('focusLabelStartInput').value = olympiad.focusLabelStart || '';
    document.getElementById('focusColorStartInput').value = olympiad.focusColorStart || '#ff6b6b';
    document.getElementById('focusLabelEndInput').value = olympiad.focusLabelEnd || '';
    document.getElementById('focusColorEndInput').value = olympiad.focusColorEnd || '#ff4757';
    document.getElementById('difficultyInput').value = olympiad.difficulty;
    document.getElementById('gradeInput').value = olympiad.grade;
    document.getElementById('locationInput').value = olympiad.location || '';
    document.getElementById('websiteInput').value = olympiad.website || '';
    document.getElementById('archiveInput').value = olympiad.archive || '';
    document.getElementById('colorInput').value = olympiad.color || '#667eea';
}

// Сохраняем кастомные метки и цвета
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    const olympiad = {
        id: editingOlympiadId || Date.now(),
        name: document.getElementById('nameInput').value,
        description: document.getElementById('descriptionInput').value,
        date: document.getElementById('dateInput').value,
        time: document.getElementById('timeInput').value,
        regStart: document.getElementById('regStartInput').value,
        regEnd: document.getElementById('regEndInput').value,
        focusLabelStart: document.getElementById('focusLabelStartInput').value,
        focusColorStart: document.getElementById('focusColorStartInput').value,
        focusLabelEnd: document.getElementById('focusLabelEndInput').value,
        focusColorEnd: document.getElementById('focusColorEndInput').value,
        difficulty: document.getElementById('difficultyInput').value,
        grade: document.getElementById('gradeInput').value,
        location: document.getElementById('locationInput').value,
        website: document.getElementById('websiteInput').value,
        archive: document.getElementById('archiveInput').value,
        color: document.getElementById('colorInput').value
    };
    
    if (editingOlympiadId) {
        const index = olympiads.findIndex(o => o.id === editingOlympiadId);
        olympiads[index] = olympiad;
    } else {
        olympiads.push(olympiad);
    }
    
    localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
    closeOlympiadModal();
    renderAllMonths();
}

function handleRegistration() {
    alert('Функция регистрации будет реализована позже. Здесь должна быть интеграция с системой регистрации.');
}

function handleEdit() {
    if (!isAdmin) return;
    
    const olympiadId = parseInt(sidePanel.dataset.olympiadId);
    const olympiad = olympiads.find(o => o.id === olympiadId);
    
    if (olympiad) {
        closeSidePanel();
        populateFormForEdit(olympiad);
        olympiadModal.classList.add('active');
    }
}

function handleDelete() {
    if (!isAdmin) return;
    
    const olympiadId = parseInt(sidePanel.dataset.olympiadId);
    
    if (confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
        olympiads = olympiads.filter(o => o.id !== olympiadId);
        localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
        
        if (focusedOlympiadId === olympiadId) {
            exitFocusMode();
        }
        
        closeSidePanel();
        renderAllMonths();
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = monthNamesGenitive[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}