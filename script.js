// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let currentCity = localStorage.getItem('currentCity') || 'Москва';
let olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];
let editingOlympiadId = null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let focusedOlympiadId = null;
let expandedOlympiads = new Set();
let currentOpenMonth = null;

// Переменные для отслеживания текущих открытых панелей
let currentOpenDate = null;
let currentOpenOlympiadId = null;

// Переменная для отслеживания текущего видимого месяца
let currentVisibleMonthIndex = 1; // Февраль по умолчанию

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

// Новые элементы для модального окна олимпиад месяца
const monthOlympiadsModal = document.getElementById('monthOlympiadsModal');
const closeMonthOlympiadsBtn = document.getElementById('closeMonthOlympiadsBtn');
const monthOlympiadsTitle = document.getElementById('monthOlympiadsTitle');
const knownDatesColumn = document.getElementById('knownDatesColumn');
const unknownDatesColumn = document.getElementById('unknownDatesColumn');
const cancelledColumn = document.getElementById('cancelledColumn');

// Кнопка олимпиад в верхнем хедере
const headerMonthOlympiadsBtn = document.getElementById('headerMonthOlympiadsBtn');

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

// Элементы для фокус-плашек
const focusPlatesCountInput = document.getElementById('focusPlatesCountInput');
const focusPlatesContainer = document.getElementById('focusPlatesContainer');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация календаря...');
    initializeEventListeners();
    updateAdminUI();
    renderAllMonths();
    
    citySelect.value = currentCity;
    
    setTimeout(() => {
        updateCurrentMonthTitle();
    }, 100);
});

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

function handleGlobalClick(e) {
    // Обработка кликов внутри monthOlympiadsModal
    if (monthOlympiadsModal.classList.contains('active') && monthOlympiadsModal.contains(e.target)) {
        const olympiadCard = e.target.closest('.month-olympiad-card');
        if (olympiadCard) {
            e.preventDefault();
            e.stopPropagation();
            const olympiadId = parseInt(olympiadCard.dataset.olympiadId);
            console.log('📌 Клик по карточке олимпиады в модальном окне, ID:', olympiadId);
            showOlympiadDetailsById(olympiadId);
            closeMonthOlympiadsModal();
            return;
        }
        return;
    }
    
    // Обработка кликов внутри dayPanel
    if (dayPanel.classList.contains('active') && dayPanel.contains(e.target)) {
        const header = e.target.closest('.day-olympiad-header');
        if (header) {
            e.preventDefault();
            e.stopPropagation();
            const card = header.closest('.day-olympiad-card');
            if (card && dayPanel.contains(card)) {
                const olympiadId = parseInt(card.dataset.olympiadId);
                console.log('📌 Клик по заголовку карточки в dayPanel, ID:', olympiadId);
                toggleOlympiadDetails(olympiadId);
            }
            return;
        }
        
        if (e.target.classList.contains('register-btn-compact')) {
            e.preventDefault();
            e.stopPropagation();
            handleRegistration();
            return;
        }
        
        if (e.target.classList.contains('edit-btn-compact')) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.day-olympiad-card');
            if (card && dayPanel.contains(card)) {
                const olympiadId = parseInt(card.dataset.olympiadId);
                handleEditFromDay(olympiadId);
            }
            return;
        }
        
        if (e.target.classList.contains('delete-btn-compact')) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.day-olympiad-card');
            if (card && dayPanel.contains(card)) {
                const olympiadId = parseInt(card.dataset.olympiadId);
                handleDeleteFromDay(olympiadId);
            }
            return;
        }
        
        if (e.target.tagName === 'A') {
            return;
        }
        
        return;
    }
    
    // Проверка кликов вне панелей
    const isSidePanelOpen = sidePanel.classList.contains('active');
    const isDayPanelOpen = dayPanel.classList.contains('active');
    const isMonthModalOpen = monthOlympiadsModal.classList.contains('active');
    
    if (!isSidePanelOpen && !isDayPanelOpen && !isMonthModalOpen) return;
    
    const clickedInsideSidePanel = sidePanel.contains(e.target);
    const clickedInsideDayPanel = dayPanel.contains(e.target);
    const clickedInsideMonthModal = monthOlympiadsModal.contains(e.target);
    
    if (clickedInsideSidePanel || clickedInsideDayPanel || clickedInsideMonthModal) return;
    
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
    closeMonthOlympiadsModal();
}

function handleFocusPlatesCountChange() {
    const count = parseInt(focusPlatesCountInput.value) || 0;
    focusPlatesContainer.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const plateHTML = `
            <div class="form-group focus-plate-group" style="padding: 20px; background: #1a1a2e; border-radius: 10px; margin-bottom: 15px; border: 2px solid #3d3d54;">
                <label style="color: #667eea; font-size: 1.15em; margin-bottom: 15px; display: block; font-weight: 700;">
                    📌 Фокус-плашка ${i}
                </label>
                
                <div style="margin-bottom: 15px;">
                    <label for="focusPlateDate${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Дата:</label>
                    <input type="date" id="focusPlateDate${i}" class="focus-plate-date" style="width: 100%; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label for="focusPlateName${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Название плашки:</label>
                    <input type="text" id="focusPlateName${i}" class="focus-plate-name" 
                           placeholder="Например: Начало регистрации" maxlength="50"
                           style="width: 100%; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;">
                </div>
                
                <div>
                    <label for="focusPlateColor${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Цвет свечения:</label>
                    <input type="color" id="focusPlateColor${i}" class="focus-plate-color" value="#667eea"
                           style="width: 100%; height: 50px; border: 2px solid #3d3d54; border-radius: 8px; cursor: pointer; background: #2d2d44;">
                </div>
            </div>
        `;
        focusPlatesContainer.insertAdjacentHTML('beforeend', plateHTML);
    }
}

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
    
    closeMonthOlympiadsBtn.addEventListener('click', closeMonthOlympiadsModal);
    
    if (headerMonthOlympiadsBtn) {
        headerMonthOlympiadsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCurrentMonthOlympiadsModal();
        });
    }
    
    filterBtn.addEventListener('click', openFilterModal);
    closeFilterModalBtn.addEventListener('click', closeFilterModal);
    applyFilterBtn.addEventListener('click', applyFilter);
    resetFilterBtn.addEventListener('click', resetFilter);
    citySelect.addEventListener('change', handleCityChange);
    
    if (focusPlatesCountInput) {
        focusPlatesCountInput.addEventListener('change', handleFocusPlatesCountChange);
        focusPlatesCountInput.addEventListener('input', handleFocusPlatesCountChange);
    }
    
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('contextmenu', handleRightClick);
    
    console.log('✅ Обработчики событий инициализированы');
}

function openCurrentMonthOlympiadsModal() {
    openMonthOlympiadsModal(currentVisibleMonthIndex);
}

function openMonthOlympiadsModal(month) {
    currentOpenMonth = month;
    const filteredOlympiads = getFilteredOlympiads();
    
    const monthOlympiads = filteredOlympiads.filter(o => {
        const olympiadDate = new Date(o.date + 'T00:00:00');
        return olympiadDate.getMonth() === month && olympiadDate.getFullYear() === currentYear;
    });
    
    monthOlympiadsTitle.textContent = `Олимпиады - ${monthNames[month]} ${currentYear}`;
    
    knownDatesColumn.innerHTML = '';
    unknownDatesColumn.innerHTML = '';
    cancelledColumn.innerHTML = '';
    
    monthOlympiads.forEach(olympiad => {
        const card = createMonthOlympiadCard(olympiad);
        knownDatesColumn.appendChild(card);
    });
    
    if (knownDatesColumn.children.length === 0) {
        knownDatesColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет олимпиад</p>';
    }
    if (unknownDatesColumn.children.length === 0) {
        unknownDatesColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет олимпиад</p>';
    }
    if (cancelledColumn.children.length === 0) {
        cancelledColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет отменённых олимпиад</p>';
    }
    
    monthOlympiadsModal.classList.add('active');
}

function createMonthOlympiadCard(olympiad) {
    const card = document.createElement('div');
    card.className = 'month-olympiad-card';
    card.dataset.olympiadId = olympiad.id;
    card.style.background = `linear-gradient(135deg, ${olympiad.color || '#667eea'} 0%, ${adjustColor(olympiad.color || '#667eea', -20)} 100%)`;
    
    const name = document.createElement('div');
    name.className = 'month-olympiad-name';
    name.textContent = olympiad.name;
    
    card.appendChild(name);
    
    return card;
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function closeMonthOlympiadsModal() {
    monthOlympiadsModal.classList.remove('active');
    currentOpenMonth = null;
}

function getFilteredOlympiads() {
    return olympiads.filter(olympiad => {
        if (currentFilter.difficultyFrom || currentFilter.difficultyTo) {
            const olympiadLevel = difficultyLevels[olympiad.difficulty];
            const fromLevel = currentFilter.difficultyFrom ? difficultyLevels[currentFilter.difficultyFrom] : 1;
            const toLevel = currentFilter.difficultyTo ? difficultyLevels[currentFilter.difficultyTo] : 4;
            
            if (olympiadLevel < fromLevel || olympiadLevel > toLevel) {
                return false;
            }
        }
        
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
        closeMonthOlympiadsModal();
        
        renderAllMonths();
    }
}

function handleRightClick(e) {
    const olympiadEvent = e.target.closest('.olympiad-event');
    
    if (olympiadEvent) {
        e.preventDefault();
        
        const olympiadId = parseInt(olympiadEvent.dataset.olympiadId);
        
        if (focusedOlympiadId === olympiadId) {
            exitFocusMode();
        } else {
            enterFocusMode(olympiadId);
        }
        return;
    }
    
    if (focusedOlympiadId !== null) {
        e.preventDefault();
        exitFocusMode();
    }
}

function enterFocusMode(olympiadId) {
    focusedOlympiadId = olympiadId;
    const focusedOlympiad = olympiads.find(o => o.id === olympiadId);
    
    if (!focusedOlympiad) return;
    
    console.log('🎯 Включен фокус-режим для олимпиады:', focusedOlympiad.name);
    focusHint.classList.remove('hidden');
    renderAllMonths();
}

function exitFocusMode() {
    console.log('❌ Выход из фокус-режима');
    focusedOlympiadId = null;
    focusHint.classList.add('hidden');
    renderAllMonths();
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
    console.log('🎨 Рендеринг всех месяцев...');
    monthsScrollContainer.innerHTML = '';
    
    const filteredOlympiads = getFilteredOlympiads();
    console.log(`📊 Всего олимпиад после фильтров: ${filteredOlympiads.length}`);
    
    for (let month = 0; month < 12; month++) {
        const monthWrapper = document.createElement('div');
        monthWrapper.className = 'month-calendar-wrapper';
        monthWrapper.id = `month-${month}`;
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'month-title-container';
        
        const monthTitle = document.createElement('h3');
        monthTitle.className = 'month-title';
        monthTitle.textContent = `${monthNames[month]} ${currentYear}`;
        
        titleContainer.appendChild(monthTitle);
        monthWrapper.appendChild(titleContainer);
        
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
    
    // КРИТИЧНО: Добавляем обработчики после рендера
    setTimeout(() => {
        attachEventHandlers();
        console.log('✅ Обработчики кликов добавлены после рендера');
    }, 100);
    
    monthsScrollContainer.addEventListener('scroll', updateCurrentMonthTitle);
}

// ИСПРАВЛЕНО: Функция для добавления обработчиков кликов к динамически созданным элементам
function attachEventHandlers() {
    // Обработчики для плашек олимпиад
    const olympiadEvents = document.querySelectorAll('.olympiad-event');
    console.log(`🔗 Добавление обработчиков к ${olympiadEvents.length} плашкам олимпиад`);
    
    olympiadEvents.forEach(event => {
        // Удаляем старый обработчик если есть
        event.replaceWith(event.cloneNode(true));
    });
    
    document.querySelectorAll('.olympiad-event').forEach(event => {
        event.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const olympiadId = parseInt(this.dataset.olympiadId);
            console.log('🎯 Клик по плашке олимпиады, ID:', olympiadId);
            showOlympiadDetailsById(olympiadId);
        });
    });
    
    // Обработчики для дней календаря
    const dayCells = document.querySelectorAll('.day-cell:not(.empty-cell)');
    console.log(`🔗 Добавление обработчиков к ${dayCells.length} дням календаря`);
    
    dayCells.forEach(cell => {
        cell.addEventListener('click', function(e) {
            // Если клик по плашке олимпиады - игнорируем
            const clickedOnEvent = e.target.closest('.olympiad-event');
            if (clickedOnEvent) {
                console.log('⏭️  Клик по плашке внутри дня - пропускаем обработчик дня');
                return;
            }
            
            const dateStr = this.dataset.date;
            if (!dateStr) return;
            
            console.log('📅 Клик по дню календаря:', dateStr);
            
            const filteredOlympiads = getFilteredOlympiads();
            const dayOlympiads = filteredOlympiads.filter(o => o.date === dateStr);
            
            if (dayOlympiads.length > 0) {
                handleDayCellClick(dateStr, e);
            } else if (isAdmin) {
                openOlympiadModal(dateStr);
            }
        });
    });
}

function updateCurrentMonthTitle() {
    const scrollTop = monthsScrollContainer.scrollTop;
    const containerHeight = monthsScrollContainer.scrollHeight / 12;
    const monthIndex = Math.max(0, Math.min(11, Math.floor(scrollTop / containerHeight)));
    
    currentVisibleMonthIndex = monthIndex;
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

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDayCellHTML(day, month, filteredOlympiads) {
    const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOlympiads = filteredOlympiads.filter(o => o.date === dateStr);
    
    let regLabel = '';
    let regClass = '';
    let customGlowStyle = '';
    
    if (focusedOlympiadId !== null) {
        const focusedOlympiad = olympiads.find(o => o.id === focusedOlympiadId);
        if (focusedOlympiad) {
            // Проверяем новый формат (focusPlates)
            if (focusedOlympiad.focusPlates && Array.isArray(focusedOlympiad.focusPlates) && focusedOlympiad.focusPlates.length > 0) {
                const plateForThisDate = focusedOlympiad.focusPlates.find(p => p.date === dateStr);
                if (plateForThisDate) {
                    const color = plateForThisDate.color || '#667eea';
                    const name = plateForThisDate.name || 'Важная дата';
                    
                    regLabel = `<div class="reg-label" style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); box-shadow: 0 3px 10px ${hexToRgba(color, 0.5)};">${name}</div>`;
                    regClass = ' reg-start';
                    
                    customGlowStyle = `
                        <style>
                            .day-cell.reg-start[data-date="${dateStr}"]::before {
                                background: radial-gradient(ellipse at center, ${hexToRgba(color, 0.5)} 0%, ${hexToRgba(color, 0.2)} 50%, ${hexToRgba(color, 0)} 100%) !important;
                            }
                        </style>
                    `;
                }
            }
            // Поддержка старого формата (regStart/regEnd)
            else if (focusedOlympiad.regStart || focusedOlympiad.regEnd) {
                if (focusedOlympiad.regStart === dateStr) {
                    const labelText = focusedOlympiad.focusLabelStart || 'Начало регистрации';
                    const color = focusedOlympiad.focusColorStart || '#ff6b6b';
                    
                    regLabel = `<div class="reg-label" style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); box-shadow: 0 3px 10px ${hexToRgba(color, 0.5)};">${labelText}</div>`;
                    regClass = ' reg-start';
                    
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
    }
    
    let eventsHTML = '';
    dayOlympiads.forEach(olympiad => {
        const bgColor = olympiad.color || '#4a5ab3';
        eventsHTML += `<div class="olympiad-event" data-olympiad-id="${olympiad.id}" style="background-color: ${bgColor}">${olympiad.name}</div>`;
    });
    
    let focusClass = '';
    if (focusedOlympiadId !== null) {
        const hasFocusedOlympiad = dayOlympiads.some(o => o.id === focusedOlympiadId);
        if (!hasFocusedOlympiad && dayOlympiads.length > 0) {
            focusClass = ' focus-hidden';
        }
    }
    
    return `
        ${customGlowStyle}
        <div class="day-cell${regClass}${focusClass}" data-date="${dateStr}">
            ${regLabel}
            <div class="day-number">${day}</div>
            <div class="olympiad-events-container">
                ${eventsHTML}
            </div>
        </div>
    `;
}

function handleDayCellClick(dateStr, event) {
    if (dayPanel.classList.contains('active') && currentOpenDate === dateStr) {
        closeDayPanel();
        return;
    }
    
    showDayPanel(dateStr);
}

function showDayPanel(dateStr) {
    const filteredOlympiads = getFilteredOlympiads();
    const dayOlympiads = filteredOlympiads.filter(o => o.date === dateStr);
    
    if (dayOlympiads.length === 0) return;
    
    closeSidePanel();
    
    currentOpenDate = dateStr;
    
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const monthGenitive = monthNamesGenitive[date.getMonth()];
    const year = date.getFullYear();
    const olympiadWord = getOlympiadWord(dayOlympiads.length);
    
    console.log(`📋 Открытие панели дня для ${dateStr}, олимпиад: ${dayOlympiads.length}`);
    
    document.getElementById('dayPanelTitle').innerHTML = `${day} ${monthGenitive} ${year}<br><small style="font-size: 0.7em; font-weight: 400; opacity: 0.9;">${dayOlympiads.length} ${olympiadWord}</small>`;
    
    dayPanelContent.innerHTML = dayOlympiads.map(olympiad => {
        const isExpanded = expandedOlympiads.has(olympiad.id);
        const detailsClass = isExpanded ? '' : 'hidden';
        const iconRotation = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        
        // Поддержка обоих форматов
        let focusPlatesHTML = '';
        if (olympiad.focusPlates && olympiad.focusPlates.length > 0) {
            focusPlatesHTML = '<div class="detail-item"><strong>Важные даты:</strong></div>';
            olympiad.focusPlates.forEach(plate => {
                focusPlatesHTML += `<div class="detail-item" style="padding-left: 20px;">
                    <span style="display: inline-block; width: 12px; height: 12px; background: ${plate.color}; border-radius: 50%; margin-right: 8px;"></span>
                    <strong>${plate.name}:</strong> ${formatDate(plate.date)}
                </div>`;
            });
        } else if (olympiad.regStart || olympiad.regEnd) {
            if (olympiad.regStart) {
                focusPlatesHTML += `<div class="detail-item">
                    <strong>Начало регистрации:</strong> ${formatDate(olympiad.regStart)}
                </div>`;
            }
            if (olympiad.regEnd) {
                focusPlatesHTML += `<div class="detail-item">
                    <strong>Конец регистрации:</strong> ${formatDate(olympiad.regEnd)}
                </div>`;
            }
        }
        
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
                ${focusPlatesHTML}
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
    const card = dayPanel.querySelector(`[data-olympiad-id="${olympiadId}"]`);
    if (!card) return;
    
    const details = card.querySelector('.day-olympiad-details');
    const icon = card.querySelector('.expand-icon');
    if (!details || !icon) return;
    
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
    currentOpenDate = null;
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
        
        expandedOlympiads.delete(olympiadId);
        
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
    console.log('📖 Открытие боковой панели для олимпиады ID:', olympiadId);
    
    if (sidePanel.classList.contains('active') && currentOpenOlympiadId === olympiadId) {
        closeSidePanel();
        return;
    }
    
    const olympiad = olympiads.find(o => o.id === olympiadId);
    if (olympiad) {
        showOlympiadDetails(olympiad);
    } else {
        console.error('❌ Олимпиада не найдена! ID:', olympiadId);
    }
}

// Поддержка обоих форматов в боковой панели
function showOlympiadDetails(olympiad) {
    closeDayPanel();
    
    currentOpenOlympiadId = olympiad.id;
    
    document.getElementById('olympiadName').textContent = olympiad.name;
    document.getElementById('olympiadDescription').textContent = olympiad.description || 'Нет описания';
    document.getElementById('olympiadDate').textContent = formatDate(olympiad.date);
    document.getElementById('olympiadTime').textContent = olympiad.time || 'Не установлено';
    document.getElementById('olympiadDifficulty').textContent = olympiad.difficulty;
    document.getElementById('olympiadGrade').textContent = olympiad.grade;
    document.getElementById('olympiadLocation').textContent = olympiad.location || 'Не установлено';
    
    // Показываем/скрываем старые поля
    const regStartField = document.getElementById('olympiadRegStart').parentElement;
    const regEndField = document.getElementById('olympiadRegEnd').parentElement;
    
    // Поддержка нового формата (focusPlates)
    let focusPlatesContainer = document.getElementById('focusPlatesInfoContainer');
    if (!focusPlatesContainer) {
        focusPlatesContainer = document.createElement('div');
        focusPlatesContainer.id = 'focusPlatesInfoContainer';
        regEndField.insertAdjacentElement('afterend', focusPlatesContainer);
    }
    
    focusPlatesContainer.innerHTML = '';
    
    if (olympiad.focusPlates && olympiad.focusPlates.length > 0) {
        // Новый формат - показываем фокус-плашки
        regStartField.style.display = 'none';
        regEndField.style.display = 'none';
        
        focusPlatesContainer.innerHTML = '<div class="info-field"><label>Важные даты:</label></div>';
        olympiad.focusPlates.forEach(plate => {
            const plateDiv = document.createElement('div');
            plateDiv.className = 'info-field';
            plateDiv.style.paddingLeft = '20px';
            plateDiv.innerHTML = `
                <label style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-block; width: 16px; height: 16px; background: ${plate.color}; border-radius: 50%;"></span>
                    ${plate.name}:
                </label>
                <span>${formatDate(plate.date)}</span>
            `;
            focusPlatesContainer.appendChild(plateDiv);
        });
    } else {
        // Старый формат - показываем regStart/regEnd
        regStartField.style.display = olympiad.regStart ? 'block' : 'none';
        regEndField.style.display = olympiad.regEnd ? 'block' : 'none';
        
        document.getElementById('olympiadRegStart').textContent = olympiad.regStart ? formatDate(olympiad.regStart) : 'Не установлено';
        document.getElementById('olympiadRegEnd').textContent = olympiad.regEnd ? formatDate(olympiad.regEnd) : 'Не установлено';
    }
    
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
    currentOpenOlympiadId = null;
}

function openOlympiadModal(dateStr = null) {
    if (!isAdmin) return;
    
    editingOlympiadId = null;
    olympiadForm.reset();
    document.getElementById('modalTitle').textContent = 'Добавить олимпиаду';
    
    focusPlatesCountInput.value = 0;
    focusPlatesContainer.innerHTML = '';
    
    const gradeCheckboxes = document.querySelectorAll('input[name="grade"]');
    gradeCheckboxes.forEach(cb => cb.checked = false);
    
    if (dateStr) {
        document.getElementById('dateInput').value = dateStr;
    }
    
    olympiadModal.classList.add('active');
}

function closeOlympiadModal() {
    olympiadModal.classList.remove('active');
    editingOlympiadId = null;
}

function populateFormForEdit(olympiad) {
    editingOlympiadId = olympiad.id;
    document.getElementById('modalTitle').textContent = 'Редактировать олимпиаду';
    document.getElementById('nameInput').value = olympiad.name;
    document.getElementById('descriptionInput').value = olympiad.description || '';
    document.getElementById('dateInput').value = olympiad.date;
    document.getElementById('timeInput').value = olympiad.time || '';
    document.getElementById('difficultyInput').value = olympiad.difficulty;
    
    const gradeCheckboxes = document.querySelectorAll('input[name="grade"]');
    gradeCheckboxes.forEach(cb => cb.checked = false);
    
    const nameWithoutGrade = olympiad.name.replace(/\s*\(\d+\s*класс\)\s*$/, '');
    document.getElementById('nameInput').value = nameWithoutGrade;
    
    const gradeMatch = olympiad.grade.match(/\d+/);
    if (gradeMatch) {
        const grade = gradeMatch[0];
        const checkbox = document.querySelector(`input[name="grade"][value="${grade}"]`);
        if (checkbox) checkbox.checked = true;
    }
    
    document.getElementById('locationInput').value = olympiad.location || '';
    document.getElementById('websiteInput').value = olympiad.website || '';
    document.getElementById('archiveInput').value = olympiad.archive || '';
    document.getElementById('colorInput').value = olympiad.color || '#667eea';
    
    if (olympiad.focusPlates && olympiad.focusPlates.length > 0) {
        focusPlatesCountInput.value = olympiad.focusPlates.length;
        handleFocusPlatesCountChange();
        
        setTimeout(() => {
            olympiad.focusPlates.forEach((plate, index) => {
                const i = index + 1;
                const dateInput = document.getElementById(`focusPlateDate${i}`);
                const nameInput = document.getElementById(`focusPlateName${i}`);
                const colorInput = document.getElementById(`focusPlateColor${i}`);
                
                if (dateInput) dateInput.value = plate.date;
                if (nameInput) nameInput.value = plate.name;
                if (colorInput) colorInput.value = plate.color;
            });
        }, 100);
    } else {
        focusPlatesCountInput.value = 0;
        focusPlatesContainer.innerHTML = '';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    const selectedGrades = Array.from(document.querySelectorAll('input[name="grade"]:checked')).map(cb => cb.value);
    
    if (selectedGrades.length === 0) {
        alert('Выберите хотя бы один класс!');
        return;
    }
    
    const focusPlatesCount = parseInt(focusPlatesCountInput.value) || 0;
    const focusPlates = [];
    for (let i = 1; i <= focusPlatesCount; i++) {
        const dateInput = document.getElementById(`focusPlateDate${i}`);
        const nameInput = document.getElementById(`focusPlateName${i}`);
        const colorInput = document.getElementById(`focusPlateColor${i}`);
        
        const date = dateInput?.value;
        const name = nameInput?.value;
        const color = colorInput?.value;
        
        if (date && name) {
            focusPlates.push({ date, name, color: color || '#667eea' });
        }
    }
    
    const baseName = document.getElementById('nameInput').value;
    const baseOlympiad = {
        description: document.getElementById('descriptionInput').value,
        date: document.getElementById('dateInput').value,
        time: document.getElementById('timeInput').value,
        difficulty: document.getElementById('difficultyInput').value,
        location: document.getElementById('locationInput').value,
        website: document.getElementById('websiteInput').value,
        archive: document.getElementById('archiveInput').value,
        color: document.getElementById('colorInput').value,
        focusPlates: focusPlates
    };
    
    if (editingOlympiadId) {
        const grade = selectedGrades[0];
        const olympiad = {
            ...baseOlympiad,
            id: editingOlympiadId,
            name: selectedGrades.length > 1 ? `${baseName} (${grade} класс)` : baseName,
            grade: `${grade} класс`
        };
        
        const index = olympiads.findIndex(o => o.id === editingOlympiadId);
        olympiads[index] = olympiad;
    } else {
        selectedGrades.forEach(grade => {
            const olympiad = {
                ...baseOlympiad,
                id: Date.now() + Math.random(),
                name: selectedGrades.length > 1 ? `${baseName} (${grade} класс)` : baseName,
                grade: `${grade} класс`
            };
            olympiads.push(olympiad);
        });
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
        
        expandedOlympiads.delete(olympiadId);
        
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