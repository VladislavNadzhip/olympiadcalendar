// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let currentCity = localStorage.getItem('currentCity') || 'Москва';
let olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let focusedOlympiadId = null;
let expandedOlympiads = new Set();
let currentOpenMonth = null;
let currentOpenDate = null;
let currentOpenOlympiadId = null;
let currentVisibleMonthIndex = 1;
let currentTheme = localStorage.getItem('theme') || 'dark';
let adminModeEnabled = false;
let calendarClickHandlerAttached = false;
let editingOlympiadId = null;
let selectedRelatedEvents = [];

// Фильтры
let currentFilter = {
    difficultyFrom: '',
    difficultyTo: '',
    grade: null
};

const ADMIN_PASSWORD = 'admin123';

const DEFAULT_TUTORIAL = `
<h4>Основные функции</h4>
<p><strong>Просмотр календаря:</strong> Прокручивайте страницу вверх или вниз для перехода между месяцами. Текущий месяц отображается в верхней части экрана.</p>
<p><strong>Просмотр олимпиады:</strong> Нажмите левой кнопкой мыши на плашку олимпиады для просмотра подробной информации в боковой панели.</p>
<p><strong>Просмотр олимпиад дня:</strong> Нажмите на день в календаре, чтобы увидеть все олимпиады на эту дату в боковой панели.</p>

<h4>Фокус-режим</h4>
<p><strong>Включение:</strong> Нажмите правой кнопкой мыши на плашку олимпиады. Календарь скроет все остальные олимпиады и подсветит важные даты выбранной олимпиады.</p>
<p><strong>Отключение:</strong> Нажмите правой кнопкой мыши любое место на календаре, чтобы выйти из фокус-режима.</p>
<p><em>Примечание: Фокус-режим работает только для олимпиад с настроенными важными датами.</em></p>

<h4>Фильтры</h4>
<p><strong>Фильтр по сложности:</strong> Нажмите кнопку "Фильтр" в верхней панели. Выберите диапазон сложности олимпиад (от легкой до очень сложной).</p>
<p><strong>Фильтр по классу:</strong> Введите номер класса в окне фильтра, чтобы увидеть только олимпиады для вашего класса.</p>

<h4>Выбор города</h4>
<p>Используйте выпадающее меню "Город" в верхней панели для переключения между календарями разных городов.</p>

<h4>Олимпиады месяца</h4>
<p>Нажмите кнопку "Олимпиады в этом месяце" для просмотра всех олимпиад текущего месяца в удобном формате.</p>

<h4>Закрытие панелей</h4>
<p>Кликните вне открытой панели или нажмите крестик в верхнем правом углу, чтобы закрыть боковую панель или модальное окно.</p>
`;

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const monthNamesGenitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const difficultyLevels = {'Легкая': 1, 'Средняя': 2, 'Сложная': 3, 'Очень сложная': 4};

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
const monthOlympiadsModal = document.getElementById('monthOlympiadsModal');
const closeMonthOlympiadsBtn = document.getElementById('closeMonthOlympiadsBtn');
const monthOlympiadsTitle = document.getElementById('monthOlympiadsTitle');
const knownDatesColumn = document.getElementById('knownDatesColumn');
const unknownDatesColumn = document.getElementById('unknownDatesColumn');
const cancelledColumn = document.getElementById('cancelledColumn');
const headerMonthOlympiadsBtn = document.getElementById('headerMonthOlympiadsBtn');
const filterBtn = document.getElementById('filterBtn');
const filterModal = document.getElementById('filterModal');
const closeFilterModalBtn = document.getElementById('closeFilterModalBtn');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const difficultyFromSelect = document.getElementById('difficultyFromSelect');
const difficultyToSelect = document.getElementById('difficultyToSelect');
const gradeFilterInput = document.getElementById('gradeFilterInput');
const citySelect = document.getElementById('citySelect');
const focusPlatesCountInput = document.getElementById('focusPlatesCountInput');
const focusPlatesContainer = document.getElementById('focusPlatesContainer');
const themeToggle = document.getElementById('themeToggle');
const tutorialBtn = document.getElementById('tutorialBtn');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialBtn = document.getElementById('closeTutorialBtn');
const tutorialContent = document.getElementById('tutorialContent');
const editTutorialBtn = document.getElementById('editTutorialBtn');
const editTutorialModal = document.getElementById('editTutorialModal');
const closeEditTutorialBtn = document.getElementById('closeEditTutorialBtn');
const editTutorialForm = document.getElementById('editTutorialForm');
const cancelEditTutorialBtn = document.getElementById('cancelEditTutorialBtn');
const tutorialTextInput = document.getElementById('tutorialTextInput');
const addOlympiadInMonthBtn = document.getElementById('addOlympiadInMonthBtn');

function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    adminModeEnabled = urlParams.has('admin');
    
// Кнопки редактирования столбцов в модальном окне олимпиад месяца
const columnEditButtons = document.querySelectorAll('.column-edit-btn');
    console.log('🔐 Админ-режим:', adminModeEnabled ? 'включен' : 'отключен');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация календаря...');
    checkAdminMode();
    reloadOlympiads();
    initializeTutorial();
    initializeTheme();
    initializeEventListeners();
    updateAdminUI();
    renderAllMonths();
    citySelect.value = currentCity;
    setTimeout(() => updateCurrentMonthTitle(), 100);
});

function initializeTutorial() {
    if (!localStorage.getItem('tutorial')) {
        localStorage.setItem('tutorial', DEFAULT_TUTORIAL);
    }
}

function initializeTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '🌞';
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
    }
}

function toggleTheme() {
    if (currentTheme === 'dark') {
        currentTheme = 'light';
        document.body.classList.add('light-theme');
        themeToggle.textContent = '🌞';
    } else {
        currentTheme = 'dark';
        document.body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', currentTheme);
}

function loadTutorial() {
    tutorialContent.innerHTML = localStorage.getItem('tutorial') || DEFAULT_TUTORIAL;
}

function openTutorialModal() {
    loadTutorial();
    tutorialModal.classList.add('active');
}

function closeTutorialModal() {
    tutorialModal.classList.remove('active');
}

function openEditTutorialModal() {
    tutorialTextInput.value = localStorage.getItem('tutorial') || DEFAULT_TUTORIAL;
    closeTutorialModal();
    editTutorialModal.classList.add('active');
}

function closeEditTutorialModal() {
    editTutorialModal.classList.remove('active');
}

function handleEditTutorialSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return;
    localStorage.setItem('tutorial', tutorialTextInput.value);
    closeEditTutorialModal();
    alert('Туториал успешно обновлён!');
}

function reloadOlympiads() {
    const stored = localStorage.getItem(`olympiads_${currentCity}`);
    if (stored) {
        try {
            olympiads = JSON.parse(stored);
        } catch (e) {
            console.error('❌ Ошибка парсинга:', e);
            olympiads = [];
        }
    } else {
        olympiads = [];
    }
}

function updateAdminUI() {
    const showAdmin = adminModeEnabled && isAdmin;
    document.querySelectorAll('.admin-only').forEach(el => {
        if (showAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
    if (adminModeEnabled && !isAdmin) {
        adminBtn.classList.remove('hidden');
    } else {
        adminBtn.classList.add('hidden');
    }
    if (adminModeEnabled && isAdmin) {
        logoutBtn.classList.remove('hidden');
    } else {
        logoutBtn.classList.add('hidden');
    }
}

function handleGlobalClick(e) {
    if (tutorialModal.classList.contains('active') && e.target === tutorialModal) {
        closeTutorialModal();
        return;
    }
    if (editTutorialModal.classList.contains('active') && e.target === editTutorialModal) {
        closeEditTutorialModal();
        return;
    }
    
    // Обработка кликов на связанные события в боковой панели
    if (sidePanel.classList.contains('active')) {
        const relatedCard = e.target.closest('.related-event-card');
        if (relatedCard) {
            e.preventDefault();
            e.stopPropagation();
            const relatedId = parseFloat(relatedCard.dataset.olympiadId);
            scrollToOlympiadAndShow(relatedId);
            return;
        }
    }
    
    if (monthOlympiadsModal.classList.contains('active') && monthOlympiadsModal.contains(e.target)) {
        const card = e.target.closest('.month-olympiad-card');
        if (card) {
            e.preventDefault();
            e.stopPropagation();
            
            // Проверяем, не нажата ли кнопка редактирования
            if (e.target.closest('.edit-month-olympiad-btn')) {
                handleEditFromMonthModal(parseFloat(card.dataset.olympiadId));
                return;
            }
            
            showOlympiadDetailsById(parseFloat(card.dataset.olympiadId));
            closeMonthOlympiadsModal();
        }
        return;
    }
    if (dayPanel.classList.contains('active') && dayPanel.contains(e.target)) {
        const header = e.target.closest('.day-olympiad-header');
        if (header) {
            e.preventDefault();
            e.stopPropagation();
            const card = header.closest('.day-olympiad-card');
            if (card) toggleOlympiadDetails(parseFloat(card.dataset.olympiadId));
            return;
        }
        if (e.target.classList.contains('register-btn-compact')) { e.preventDefault(); e.stopPropagation(); handleRegistration(); return; }
        if (e.target.classList.contains('edit-btn-compact')) { e.preventDefault(); e.stopPropagation(); const card = e.target.closest('.day-olympiad-card'); if (card) handleEditFromDay(parseFloat(card.dataset.olympiadId)); return; }
        if (e.target.classList.contains('delete-btn-compact')) { e.preventDefault(); e.stopPropagation(); const card = e.target.closest('.day-olympiad-card'); if (card) handleDeleteFromDay(parseFloat(card.dataset.olympiadId)); return; }
        if (e.target.tagName === 'A') return;
        return;
    }
    const isSidePanelOpen = sidePanel.classList.contains('active');
    const isDayPanelOpen = dayPanel.classList.contains('active');
    const isMonthModalOpen = monthOlympiadsModal.classList.contains('active');
    if (!isSidePanelOpen && !isDayPanelOpen && !isMonthModalOpen) return;
    if (sidePanel.contains(e.target) || dayPanel.contains(e.target) || monthOlympiadsModal.contains(e.target)) return;
    if (e.target.closest('.olympiad-event')) return;
    const clickedDay = e.target.closest('.day-cell:not(.empty-cell)');
    if (clickedDay && e.target.closest('.olympiad-events-container')) return;
    closeSidePanel(); closeDayPanel(); closeMonthOlympiadsModal();
}

function scrollToOlympiadAndShow(olympiadId) {
    const o = olympiads.find(x => x.id === olympiadId);
    if (!o) return;
    
    if (!o.date || o.dateUnknown) {
        // Если дата неизвестна, просто показываем детали
        showOlympiadDetails(o);
        return;
    }
    
    const d = new Date(o.date + 'T00:00:00');
    const targetMonth = d.getMonth();
    
    // Прокручиваем к нужному месяцу
    const scrollPos = (targetMonth / 12) * monthsScrollContainer.scrollHeight;
    monthsScrollContainer.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
    });
    
    // Показываем детали олимпиады после небольшой задержки
    setTimeout(() => {
        showOlympiadDetails(o);
    }, 500);
}

function handleEditFromMonthModal(id) {
    const o = olympiads.find(x => x.id === id);
    if (o) {
        closeMonthOlympiadsModal();
        populateFormForEdit(o);
        olympiadModal.classList.add('active');
    }
}

function handleAddOlympiadInMonth() {
    if (!isAdmin || currentOpenMonth === null) return;
    
    // Закрываем модальное окно месяца
    const wasOpen = currentOpenMonth;
    closeMonthOlympiadsModal();
    
    // Открываем форму создания олимпиады
    openOlympiadModal();
    
    // Устанавливаем месяц и год, активируем чекбокс "Дата неизвестна"
    setTimeout(() => {
        const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
        const monthSelect = document.getElementById('monthSelect');
        const yearInput = document.getElementById('yearInput');
        const monthYearContainer = document.getElementById('monthYearContainer');
        const dateInput = document.getElementById('dateInput');
        
        if (dateUnknownCheckbox && monthSelect && yearInput) {
            dateUnknownCheckbox.checked = true;
            dateInput.disabled = true;
            dateInput.value = '';
            monthYearContainer.classList.remove('hidden');
            monthSelect.value = wasOpen.toString();
            yearInput.value = currentYear.toString();
        }
    }, 100);
}

function handleFocusPlatesCountChange() {
    const count = parseInt(focusPlatesCountInput.value) || 0;
    focusPlatesContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        focusPlatesContainer.insertAdjacentHTML('beforeend', `
            <div class="form-group focus-plate-group" style="padding: 20px; background: #1a1a2e; border-radius: 10px; margin-bottom: 15px; border: 2px solid #3d3d54;">
                <label style="color: #667eea; font-size: 1.15em; margin-bottom: 15px; display: block; font-weight: 700;">📌 Фокус-плашка ${i}</label>
                <div style="margin-bottom: 15px;"><label for="focusPlateDate${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Дата:</label><input type="date" id="focusPlateDate${i}" class="focus-plate-date" style="width: 100%; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;"></div>
                <div style="margin-bottom: 15px;"><label for="focusPlateName${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Название плашки:</label><input type="text" id="focusPlateName${i}" class="focus-plate-name" placeholder="Например: Начало регистрации" maxlength="50" style="width: 100%; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;"></div>
                <div><label for="focusPlateColor${i}" style="display: block; margin-bottom: 8px; font-weight: 600; color: #eaeaea;">Цвет свечения:</label><input type="color" id="focusPlateColor${i}" class="focus-plate-color" value="#667eea" style="width: 100%; height: 50px; border: 2px solid #3d3d54; border-radius: 8px; cursor: pointer; background: #2d2d44;"></div>
            </div>
        `);
    }
}

function renderRelatedEventsSelector() {
    const container = document.getElementById('relatedEventsContainer');
    if (!container) return;
    
    container.innerHTML = '<label style="color: #667eea; font-size: 1.15em; margin-bottom: 15px; display: block; font-weight: 700;">Связанные события</label>';
    
    const currentEditId = editingOlympiadId;
    const availableOlympiads = olympiads.filter(o => o.id !== currentEditId);
    
    if (availableOlympiads.length === 0) {
        container.innerHTML += '<p style="color: #999; font-size: 0.9em; padding: 10px;">Нет доступных олимпиад для связывания</p>';
        return;
    }
    
    // Поле поиска
    container.innerHTML += `
        <div style="margin-bottom: 15px;">
            <input type="text" id="relatedEventsSearchInput" placeholder="Начните вводить название олимпиады..." style="width: 100%; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;">
        </div>
        <div id="relatedEventsSearchResults" style="max-height: 300px; overflow-y: auto;"></div>
        <div id="relatedEventsSelected" style="margin-top: 20px;"></div>
    `;
    
    // Загружаем выбранные события
    if (editingOlympiadId) {
        const editedOlympiad = olympiads.find(x => x.id === editingOlympiadId);
        if (editedOlympiad?.relatedEvents) {
            selectedRelatedEvents = [...editedOlympiad.relatedEvents];
        } else {
            selectedRelatedEvents = [];
        }
    } else {
        selectedRelatedEvents = [];
    }
    
    renderSelectedRelatedEvents();
    
    // Обработчик поиска
    const searchInput = document.getElementById('relatedEventsSearchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('relatedEventsSearchResults');
        
        if (query.length === 0) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        const filtered = availableOlympiads.filter(o => 
            o.name.toLowerCase().includes(query) && !selectedRelatedEvents.includes(o.id)
        );
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="color: #999; padding: 10px; text-align: center;">Ничего не найдено</p>';
            return;
        }
        
        resultsContainer.innerHTML = filtered.map(o => `
            <div class="related-event-search-item" data-olympiad-id="${o.id}" style="display: flex; align-items: center; padding: 10px; margin: 5px 0; background: #2d2d44; border-radius: 8px; cursor: pointer; border: 2px solid #3d3d54; transition: all 0.3s ease;">
                <div style="display: inline-block; width: 20px; height: 20px; background: ${o.color || '#667eea'}; border-radius: 4px; margin-right: 10px; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                    <div style="color: #eaeaea; font-weight: 600;">${o.name}</div>
                    <div style="color: #999; font-size: 0.85em;">${o.dateUnknown ? 'Дата неизвестна' : (o.cancelled ? 'Отменена' : formatDate(o.date))}</div>
                </div>
            </div>
        `).join('');
        
        // Обработчики кликов на результаты поиска
        resultsContainer.querySelectorAll('.related-event-search-item').forEach(item => {
            item.addEventListener('click', () => {
                const olympiadId = parseFloat(item.dataset.olympiadId);
                if (!selectedRelatedEvents.includes(olympiadId)) {
                    selectedRelatedEvents.push(olympiadId);
                    renderSelectedRelatedEvents();
                    searchInput.value = '';
                    resultsContainer.innerHTML = '';
                }
            });
            
            item.addEventListener('mouseenter', (e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = '#3d3d54';
            });
            
            item.addEventListener('mouseleave', (e) => {
                e.target.style.borderColor = '#3d3d54';
                e.target.style.background = '#2d2d44';
            });
        });
    });
}

function renderSelectedRelatedEvents() {
    const container = document.getElementById('relatedEventsSelected');
    if (!container) return;
    
    if (selectedRelatedEvents.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<label style="color: #667eea; font-size: 1em; margin-bottom: 10px; display: block; font-weight: 600;">Выбранные события:</label>';
    
    selectedRelatedEvents.forEach(relatedId => {
        const o = olympiads.find(x => x.id === relatedId);
        if (!o) return;
        
        const card = document.createElement('div');
        card.style.cssText = 'display: flex; align-items: center; padding: 10px; margin: 5px 0; background: #2d2d44; border-radius: 8px; border: 2px solid ' + (o.color || '#667eea');
        card.innerHTML = `
            <div style="display: inline-block; width: 20px; height: 20px; background: ${o.color || '#667eea'}; border-radius: 4px; margin-right: 10px; flex-shrink: 0;"></div>
            <div style="flex: 1;">
                <div style="color: #eaeaea; font-weight: 600;">${o.name}</div>
                <div style="color: #999; font-size: 0.85em;">${o.dateUnknown ? 'Дата неизвестна' : (o.cancelled ? 'Отменена' : formatDate(o.date))}</div>
            </div>
            <button type="button" class="remove-related-btn" data-olympiad-id="${relatedId}" style="background: #ff4757; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.85em; font-weight: 600;">Удалить</button>
        `;
        
        const removeBtn = card.querySelector('.remove-related-btn');
        removeBtn.addEventListener('click', () => {
            selectedRelatedEvents = selectedRelatedEvents.filter(id => id !== relatedId);
            renderSelectedRelatedEvents();
        });
        
        container.appendChild(card);
    });
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
    if (headerMonthOlympiadsBtn) headerMonthOlympiadsBtn.addEventListener('click', e => { e.stopPropagation(); openCurrentMonthOlympiadsModal(); });
    if (addOlympiadInMonthBtn) addOlympiadInMonthBtn.addEventListener('click', e => { e.stopPropagation(); handleAddOlympiadInMonth(); });

        // Обработчики для кнопок редактирования столбцов
    columnEditButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const columnType = btn.dataset.column;
            editingOlympiadId = null;
            openOlympiadModal();
            // Устанавливаем контекст, что добавляем олимпиаду в определенный столбец
            focusedOlympiadId = null;
            currentOpenMonth = null;
            currentOpenDate = null;
            currentOpenOlympiadId = null;
        });
    });
    if (tutorialBtn) tutorialBtn.addEventListener('click', e => { e.stopPropagation(); openTutorialModal(); });
    if (closeTutorialBtn) closeTutorialBtn.addEventListener('click', closeTutorialModal);
    if (editTutorialBtn) editTutorialBtn.addEventListener('click', openEditTutorialModal);
    if (closeEditTutorialBtn) closeEditTutorialBtn.addEventListener('click', closeEditTutorialModal);
    if (cancelEditTutorialBtn) cancelEditTutorialBtn.addEventListener('click', closeEditTutorialModal);
    if (editTutorialForm) editTutorialForm.addEventListener('submit', handleEditTutorialSubmit);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
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
    
    // Обработчик для чекбокса "Дата неизвестна"
    const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
    const dateInput = document.getElementById('dateInput');
    if (dateUnknownCheckbox && dateInput) {
        dateUnknownCheckbox.addEventListener('change', () => {
            if (dateUnknownCheckbox.checked) {
                dateInput.disabled = true;
                dateInput.value = '';
            } else {
                dateInput.disabled = false;
            }
        });
    }
}

function openCurrentMonthOlympiadsModal() { openMonthOlympiadsModal(currentVisibleMonthIndex); }

function openMonthOlympiadsModal(month) {
    currentOpenMonth = month;
    const filtered = getFilteredOlympiads().filter(o => {
        // Для олимпиад без даты проверяем месяц из поля month
        if (o.dateUnknown) {
            return o.month === month && o.year === currentYear;
        }
        // Для обычных олимпиад проверяем дату
        const d = new Date(o.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === currentYear;
    });
    
    monthOlympiadsTitle.textContent = `Олимпиады - ${monthNames[month]} ${currentYear}`;
    
    // Разделяем на три категории
    const knownDates = filtered.filter(o => !o.dateUnknown && !o.cancelled);
    const unknownDates = filtered.filter(o => o.dateUnknown && !o.cancelled);
    const cancelled = filtered.filter(o => o.cancelled);
    
    // Очищаем колонки
    knownDatesColumn.innerHTML = '';
    unknownDatesColumn.innerHTML = '';
    cancelledColumn.innerHTML = '';
    
    // Заполняем колонки
    knownDates.forEach(o => knownDatesColumn.appendChild(createMonthOlympiadCard(o)));
    unknownDates.forEach(o => unknownDatesColumn.appendChild(createMonthOlympiadCard(o)));
    cancelled.forEach(o => cancelledColumn.appendChild(createMonthOlympiadCard(o)));
    
    // Если колонка пустая, показываем сообщение
    if (!knownDatesColumn.children.length) knownDatesColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет олимпиад</p>';
    if (!unknownDatesColumn.children.length) unknownDatesColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет олимпиад</p>';
    if (!cancelledColumn.children.length) cancelledColumn.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет отменённых олимпиад</p>';
    
    monthOlympiadsModal.classList.add('active');
}

function createMonthOlympiadCard(olympiad) {
    const card = document.createElement('div');
    card.className = 'month-olympiad-card';
        if (olympiad.cancelled) card.classList.add('cancelled');
    card.dataset.olympiadId = olympiad.id;
    card.style.background = `linear-gradient(135deg, ${olympiad.color || '#667eea'} 0%, ${adjustColor(olympiad.color || '#667eea', -20)} 100%)`;
    
    const content = document.createElement('div');
    content.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    
    const textContainer = document.createElement('div');
    textContainer.style.flex = '1';
    
    const name = document.createElement('div');
    name.className = 'month-olympiad-name';
    name.textContent = olympiad.name;
    textContainer.appendChild(name);
    
    // Добавляем дату если известна
    if (!olympiad.dateUnknown) {
        const date = document.createElement('div');
        date.style.cssText = 'color: rgba(255,255,255,0.8); font-size: 0.85em; margin-top: 5px;';
        date.textContent = formatDate(olympiad.date);
        textContainer.appendChild(date);
    }
    
    content.appendChild(textContainer);
    
    // Добавляем кнопку редактирования для админов
    if (adminModeEnabled && isAdmin) {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-month-olympiad-btn';
        editBtn.innerHTML = '✏️';
        editBtn.style.cssText = 'background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 1.1em; margin-left: 10px; transition: all 0.3s ease;';
        editBtn.addEventListener('mouseenter', () => {
            editBtn.style.background = 'rgba(255,255,255,0.3)';
        });
        editBtn.addEventListener('mouseleave', () => {
            editBtn.style.background = 'rgba(255,255,255,0.2)';
        });
        content.appendChild(editBtn);
    }
    
    card.appendChild(content);
    return card;
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16), amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt, G = (num >> 8 & 0xFF) + amt, B = (num & 0xFF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function closeMonthOlympiadsModal() { monthOlympiadsModal.classList.remove('active'); currentOpenMonth = null; }

function getFilteredOlympiads() {
    return olympiads.filter(o => {
        if (currentFilter.difficultyFrom || currentFilter.difficultyTo) {
            const level = difficultyLevels[o.difficulty];
            const from = currentFilter.difficultyFrom ? difficultyLevels[currentFilter.difficultyFrom] : 1;
            const to = currentFilter.difficultyTo ? difficultyLevels[currentFilter.difficultyTo] : 4;
            if (level < from || level > to) return false;
        }
        if (currentFilter.grade && !o.grade.toLowerCase().includes(currentFilter.grade.toString())) return false;
        return true;
    });
}

function openFilterModal() {
    difficultyFromSelect.value = currentFilter.difficultyFrom;
    difficultyToSelect.value = currentFilter.difficultyTo;
    gradeFilterInput.value = currentFilter.grade || '';
    filterModal.classList.add('active');
}

function closeFilterModal() { filterModal.classList.remove('active'); }

function applyFilter() {
    currentFilter.difficultyFrom = difficultyFromSelect.value;
    currentFilter.difficultyTo = difficultyToSelect.value;
    currentFilter.grade = gradeFilterInput.value ? parseInt(gradeFilterInput.value) : null;
    closeFilterModal();
    renderAllMonths();
}

function resetFilter() {
    currentFilter = { difficultyFrom: '', difficultyTo: '', grade: null };
    difficultyFromSelect.value = difficultyToSelect.value = gradeFilterInput.value = '';
    closeFilterModal();
    renderAllMonths();
}

function handleCityChange() {
    const newCity = citySelect.value;
    if (newCity !== currentCity) {
        localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
        currentCity = newCity;
        localStorage.setItem('currentCity', currentCity);
        reloadOlympiads();
        exitFocusMode();
        closeSidePanel(); closeDayPanel(); closeMonthOlympiadsModal();
        renderAllMonths();
    }
}

function handleRightClick(e) {
    const event = e.target.closest('.olympiad-event');
    if (event) {
        e.preventDefault();
        const id = parseFloat(event.dataset.olympiadId);
        if (focusedOlympiadId === id) exitFocusMode(); else enterFocusMode(id);
        return;
    }
    if (focusedOlympiadId !== null) { e.preventDefault(); exitFocusMode(); }
}

function enterFocusMode(id) {
    const o = olympiads.find(x => x.id === id);
    if (!o || !o.focusPlates || !o.focusPlates.length) return;
    focusedOlympiadId = id;
    focusHint.classList.remove('hidden');
    renderAllMonths();
}

function exitFocusMode() {
    focusedOlympiadId = null;
    focusHint.classList.add('hidden');
    renderAllMonths();
}

function openAdminModal() { adminModal.classList.add('active'); adminPasswordInput.value = ''; adminError.classList.add('hidden'); }
function closeAdminModal() { adminModal.classList.remove('active'); }

function handleAdminLogin(e) {
    e.preventDefault();
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
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
    closeSidePanel(); closeDayPanel();
    exitFocusMode();
    renderAllMonths();
}

function renderAllMonths() {
    monthsScrollContainer.innerHTML = '';
    const filtered = getFilteredOlympiads();
    for (let month = 0; month < 12; month++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'month-calendar-wrapper';
        wrapper.id = `month-${month}`;
        const titleContainer = document.createElement('div');
        titleContainer.className = 'month-title-container';
        const title = document.createElement('h3');
        title.className = 'month-title';
        title.textContent = `${monthNames[month]} ${currentYear}`;
        titleContainer.appendChild(title);
        wrapper.appendChild(titleContainer);
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(d => { const div = document.createElement('div'); div.className = 'weekday'; div.textContent = d; grid.appendChild(div); });
        const days = document.createElement('div');
        days.className = 'days-container';
        days.innerHTML = renderMonthDays(month, filtered);
        grid.appendChild(days);
        wrapper.appendChild(grid);
        monthsScrollContainer.appendChild(wrapper);
    }
    attachEventHandlers();
}

function attachEventHandlers() {
    if (calendarClickHandlerAttached) {
        console.log('⚠️ Обработчики уже подключены, пропускаем');
        return;
    }
    console.log('🔧 Подключение обработчиков событий...');
    calendarClickHandlerAttached = true;
    monthsScrollContainer.addEventListener('click', function(e) {
        const olympiadEvent = e.target.closest('.olympiad-event');
        if (olympiadEvent) {
            e.stopPropagation();
            e.preventDefault();
            showOlympiadDetailsById(parseFloat(olympiadEvent.dataset.olympiadId));
            return;
        }
        const dayCell = e.target.closest('.day-cell:not(.empty-cell)');
        if (dayCell) {
            const date = dayCell.dataset.date;
            if (!date) return;
            const dayOlympiads = getFilteredOlympiads().filter(o => o.date === date && !o.dateUnknown);
            if (dayOlympiads.length > 0) {
                e.stopPropagation();
                e.preventDefault();
                handleDayCellClick(date);
                return;
            } else {
                if (adminModeEnabled && isAdmin) {
                    e.stopPropagation();
                    e.preventDefault();
                    openOlympiadModal(date);
                    return;
                }
            }
        }
    });
    monthsScrollContainer.addEventListener('scroll', updateCurrentMonthTitle);
}

function updateCurrentMonthTitle() {
    const idx = Math.max(0, Math.min(11, Math.floor(monthsScrollContainer.scrollTop / (monthsScrollContainer.scrollHeight / 12))));
    currentVisibleMonthIndex = idx;
    currentMonthTitle.textContent = `${monthNames[idx]} ${currentYear}`;
}

function renderMonthDays(month, filtered) {
    let html = '';
    const first = new Date(currentYear, month, 1), last = new Date(currentYear, month + 1, 0);
    const firstWeek = first.getDay() === 0 ? 7 : first.getDay();
    for (let i = 1; i < firstWeek; i++) html += '<div class="day-cell empty-cell"></div>';
    for (let day = 1; day <= last.getDate(); day++) html += createDayCellHTML(day, month, filtered);
    return html;
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDayCellHTML(day, month, filtered) {
    const date = `${currentYear}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayOlympiads = filtered.filter(o => o.date === date && !o.dateUnknown && !o.cancelled);
    let label = '', regClass = '', style = '';
    if (focusedOlympiadId) {
        const focused = olympiads.find(o => o.id === focusedOlympiadId);
        if (focused?.focusPlates) {
            const plate = focused.focusPlates.find(p => p.date === date);
            if (plate) {
                const c = plate.color || '#667eea';
                label = `<div class="reg-label" style="background: linear-gradient(135deg, ${c} 0%, ${c}dd 100%); box-shadow: 0 3px 10px ${hexToRgba(c, 0.5)};">${plate.name}</div>`;
                regClass = ' reg-start';
                style = `<style>.day-cell.reg-start[data-date="${date}"]::before { background: radial-gradient(ellipse at center, ${hexToRgba(c, 0.5)} 0%, ${hexToRgba(c, 0.2)} 50%, ${hexToRgba(c, 0)} 100%) !important; }</style>`;
            }
        }
    }
    let events = '';
    dayOlympiads.forEach(o => events += `<div class="olympiad-event" data-olympiad-id="${o.id}" style="background-color: ${o.color || '#4a5ab3'}">${o.name}</div>`);
    let focusClass = '';
    if (focusedOlympiadId && !dayOlympiads.some(o => o.id === focusedOlympiadId) && dayOlympiads.length > 0) focusClass = ' focus-hidden';
    return `${style}<div class="day-cell${regClass}${focusClass}" data-date="${date}">${label}<div class="day-number">${day}</div><div class="olympiad-events-container">${events}</div></div>`;
}

function handleDayCellClick(date) {
    if (dayPanel.classList.contains('active') && currentOpenDate === date) { 
        closeDayPanel(); 
        return; 
    }
    showDayPanel(date);
}

function showDayPanel(date) {
    const dayOlympiads = getFilteredOlympiads().filter(o => o.date === date && !o.dateUnknown);
    if (!dayOlympiads.length) return;
    closeSidePanel();
    currentOpenDate = date;
    const d = new Date(date + 'T00:00:00');
    document.getElementById('dayPanelTitle').innerHTML = `${d.getDate()} ${monthNamesGenitive[d.getMonth()]} ${d.getFullYear()}<br><small style="font-size: 0.7em; font-weight: 400; opacity: 0.9;">${dayOlympiads.length} ${getOlympiadWord(dayOlympiads.length)}</small>`;
    dayPanelContent.innerHTML = dayOlympiads.map(o => {
        const expanded = expandedOlympiads.has(o.id);
        let platesHTML = '';
        if (o.focusPlates?.length) {
            platesHTML = '<div class="detail-item"><strong>Важные даты:</strong></div>';
            o.focusPlates.forEach(p => platesHTML += `<div class="detail-item" style="padding-left: 20px;"><span style="display: inline-block; width: 12px; height: 12px; background: ${p.color}; border-radius: 50%; margin-right: 8px;"></span><strong>${p.name}:</strong> ${formatDate(p.date)}</div>`);
        }
        return `<div class="day-olympiad-card" data-olympiad-id="${o.id}"><div class="day-olympiad-header"><div class="day-olympiad-title"><div class="day-olympiad-color" style="background-color: ${o.color || '#4a5ab3'}"></div><span>${o.name}</span></div><span class="expand-icon" style="transform: rotate(${expanded ? 180 : 0}deg)">▼</span></div><div class="day-olympiad-preview"><div class="preview-item"><strong>Сложность:</strong> ${o.difficulty}</div>${o.website ? `<div class="preview-item"><strong>Сайт:</strong> <a href="${o.website}" target="_blank">${o.website}</a></div>` : ''}</div><div class="day-olympiad-details ${expanded ? '' : 'hidden'}">${o.description ? `<div class="detail-item"><strong>Описание:</strong> ${o.description}</div>` : ''}<div class="detail-item"><strong>Время:</strong> ${o.time || 'Не установлено'}</div><div class="detail-item"><strong>Класс:</strong> ${o.grade}</div><div class="detail-item"><strong>Место проведения:</strong> ${o.location || 'Не установлено'}</div>${platesHTML}${o.archive ? `<div class="detail-item"><strong>Архив задач:</strong> <a href="${o.archive}" target="_blank">Скачать</a></div>` : ''}<button class="register-btn-compact">Регистрация на олимпиаду</button>${(adminModeEnabled && isAdmin) ? '<div class="admin-actions-compact"><button class="edit-btn-compact">Редактировать</button><button class="delete-btn-compact">Удалить</button></div>' : ''}</div></div>`;
    }).join('');
    dayPanel.classList.add('active');
}

function getOlympiadWord(count) {
    const last = count % 10, lastTwo = count % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'олимпиад';
    if (last === 1) return 'олимпиада';
    if (last >= 2 && last <= 4) return 'олимпиады';
    return 'олимпиад';
}

function toggleOlympiadDetails(id) {
    const card = dayPanel.querySelector(`[data-olympiad-id="${id}"]`);
    if (!card) return;
    const details = card.querySelector('.day-olympiad-details'), icon = card.querySelector('.expand-icon');
    if (!details || !icon) return;
    const hidden = details.classList.contains('hidden');
    if (hidden) { details.classList.remove('hidden'); icon.style.transform = 'rotate(180deg)'; expandedOlympiads.add(id); }
    else { details.classList.add('hidden'); icon.style.transform = 'rotate(0deg)'; expandedOlympiads.delete(id); }
}

function closeDayPanel() { dayPanel.classList.remove('active'); currentOpenDate = null; }

function handleEditFromDay(id) {
    closeDayPanel();
    const o = olympiads.find(x => x.id === id);
    if (o) { populateFormForEdit(o); olympiadModal.classList.add('active'); }
}

function handleDeleteFromDay(id) {
    if (!confirm('Вы уверены, что хотите удалить эту олимпиаду?')) return;
    const date = olympiads.find(o => o.id === id)?.date;
    olympiads = olympiads.filter(o => o.id !== id);
    localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
    if (focusedOlympiadId === id) exitFocusMode();
    reloadOlympiads();
    renderAllMonths();
    if (date && olympiads.filter(o => o.date === date).length > 0) {
        showDayPanel(date);
    } else {
        closeDayPanel();
    }
}

function showOlympiadDetailsById(id) {
    if (sidePanel.classList.contains('active') && currentOpenOlympiadId === id) { 
        closeSidePanel(); 
        return; 
    }
    const o = olympiads.find(x => x.id === id);
    if (o) showOlympiadDetails(o);
}

function showOlympiadDetails(o) {
    closeDayPanel();
    currentOpenOlympiadId = o.id;
    document.getElementById('olympiadName').textContent = o.name;
    document.getElementById('olympiadDescription').textContent = o.description || 'Нет описания';
    
    const dateField = document.getElementById('olympiadDate');
    if (o.dateUnknown) {
        dateField.textContent = 'Дата неизвестна';
    } else {
        dateField.textContent = formatDate(o.date);
    }
    
    document.getElementById('olympiadTime').textContent = o.time || 'Не установлено';
    document.getElementById('olympiadDifficulty').textContent = o.difficulty;
    document.getElementById('olympiadGrade').textContent = o.grade;
    document.getElementById('olympiadLocation').textContent = o.location || 'Не установлено';
    
    const regStart = document.getElementById('olympiadRegStart')?.parentElement;
    const regEnd = document.getElementById('olympiadRegEnd')?.parentElement;
    if (regStart) regStart.style.display = 'none';
    if (regEnd) regEnd.style.display = 'none';
    
    let container = document.getElementById('focusPlatesInfoContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'focusPlatesInfoContainer';
        if (regEnd) regEnd.insertAdjacentElement('afterend', container);
    }
    container.innerHTML = '';
    if (o.focusPlates?.length) {
        container.innerHTML = '<div class="info-field"><label>Важные даты:</label></div>';
        o.focusPlates.forEach(p => {
            const div = document.createElement('div');
            div.className = 'info-field';
            div.style.paddingLeft = '20px';
            div.innerHTML = `<label style="display: flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 16px; height: 16px; background: ${p.color}; border-radius: 50%;"></span>${p.name}:</label><span>${formatDate(p.date)}</span>`;
            container.appendChild(div);
        });
    }
    
    // Отображение связанных событий
    let relatedContainer = document.getElementById('relatedEventsInfoContainer');
    if (!relatedContainer) {
        relatedContainer = document.createElement('div');
        relatedContainer.id = 'relatedEventsInfoContainer';
        container.insertAdjacentElement('afterend', relatedContainer);
    }
    relatedContainer.innerHTML = '';
    
    if (o.relatedEvents?.length) {
        relatedContainer.innerHTML = '<div class="info-field" style="margin-top: 30px; margin-bottom: 25px;"><label style="color: #667eea; font-size: 1.1em; font-weight: 700;">Связанные события:</label></div>';
        const relatedEventsContainer = document.createElement('div');
        relatedEventsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px;';
        
        o.relatedEvents.forEach(relatedId => {
            const related = olympiads.find(x => x.id === relatedId);
            if (related) {
                const card = document.createElement('div');
                card.className = 'related-event-card';
                card.dataset.olympiadId = related.id;
                card.style.cssText = `
                    background: linear-gradient(135deg, ${related.color || '#667eea'} 0%, ${adjustColor(related.color || '#667eea', -20)} 100%);
                    padding: 12px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                card.innerHTML = `
                    <div style="font-weight: 600; font-size: 1em; color: #fff; margin-bottom: 5px;">${related.name}</div>
                    <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">${related.dateUnknown ? 'Дата неизвестна' : formatDate(related.date)}</div>
                `;
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                });
                relatedEventsContainer.appendChild(card);
            }
        });
        relatedContainer.appendChild(relatedEventsContainer);
    }
    
    const website = document.getElementById('olympiadWebsite');
    if (o.website) { website.href = website.textContent = o.website; website.style.display = 'inline'; } else website.style.display = 'none';
    const archive = document.getElementById('olympiadArchive');
    if (o.archive) { archive.href = o.archive; archive.style.display = 'inline'; } else archive.style.display = 'none';
    sidePanel.dataset.olympiadId = o.id;
    sidePanel.classList.add('active');
}

function closeSidePanel() { sidePanel.classList.remove('active'); currentOpenOlympiadId = null; }

function openOlympiadModal(date = null) {
    if (!isAdmin) return;
    editingOlympiadId = null;
    selectedRelatedEvents = [];
    olympiadForm.reset();
    document.getElementById('modalTitle').textContent = 'Добавить олимпиаду';
    focusPlatesCountInput.value = 0;
    focusPlatesContainer.innerHTML = '';
    
    // Добавляем контейнер для связанных событий, если его нет
    let relatedContainer = document.getElementById('relatedEventsContainer');
    if (!relatedContainer) {
        relatedContainer = document.createElement('div');
        relatedContainer.id = 'relatedEventsContainer';
        relatedContainer.className = 'form-group';
        relatedContainer.style.cssText = 'padding: 20px; background: #1a1a2e; border-radius: 10px; margin-bottom: 15px; border: 2px solid #3d3d54;';
        document.getElementById('colorInput').parentElement.insertAdjacentElement('beforebegin', relatedContainer);
    }
    
    // Добавляем поля для олимпиад без даты, если их нет
    let statusContainer = document.getElementById('statusContainer');
    if (!statusContainer) {
        statusContainer = document.createElement('div');
        statusContainer.id = 'statusContainer';
        statusContainer.className = 'form-group';
        statusContainer.innerHTML = `
            <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="checkbox" id="dateUnknownCheckbox" style="width: auto;">
                <span style="color: #eaeaea; font-weight: 600;">Дата неизвестна</span>
            </label>
            <label style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="cancelledCheckbox" style="width: auto;">
                <span style="color: #eaeaea; font-weight: 600;">Олимпиада отменена</span>
            </label>
            <div id="monthYearContainer" class="hidden" style="margin-top: 15px;">
                <label style="color: #eaeaea; font-weight: 600; margin-bottom: 8px; display: block;">Месяц и год</label>
                <div style="display: flex; gap: 10px;">
                    <select id="monthSelect" style="flex: 1; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;">
                        <option value="0">Январь</option>
                        <option value="1">Февраль</option>
                        <option value="2">Март</option>
                        <option value="3">Апрель</option>
                        <option value="4">Май</option>
                        <option value="5">Июнь</option>
                        <option value="6">Июль</option>
                        <option value="7">Август</option>
                        <option value="8">Сентябрь</option>
                        <option value="9">Октябрь</option>
                        <option value="10">Ноябрь</option>
                        <option value="11">Декабрь</option>
                    </select>
                    <input type="number" id="yearInput" min="2020" max="2030" value="2026" style="width: 120px; padding: 12px; border: 2px solid #3d3d54; border-radius: 8px; font-size: 1em; background: #2d2d44; color: #eaeaea;">
                </div>
            </div>
        `;
        document.getElementById('dateInput').parentElement.insertAdjacentElement('afterend', statusContainer);
        
        // Обработчики для чекбоксов
        const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
        const cancelledCheckbox = document.getElementById('cancelledCheckbox');
        const dateInput = document.getElementById('dateInput');
        const monthYearContainer = document.getElementById('monthYearContainer');
        
        dateUnknownCheckbox.addEventListener('change', () => {
            if (dateUnknownCheckbox.checked) {
                dateInput.disabled = true;
                dateInput.value = '';
                monthYearContainer.classList.remove('hidden');
            } else {
                dateInput.disabled = false;
                monthYearContainer.classList.add('hidden');
            }
        });
        
        cancelledCheckbox.addEventListener('change', () => {
            if (cancelledCheckbox.checked) {
                dateUnknownCheckbox.checked = false;
                dateInput.disabled = true;
                dateInput.value = '';
                monthYearContainer.classList.remove('hidden');
            } else {
                dateInput.disabled = false;
                monthYearContainer.classList.add('hidden');
            }
        });
    }
    
    renderRelatedEventsSelector();
    document.querySelectorAll('input[name="grade"]').forEach(cb => cb.checked = false);
    if (date) {
        document.getElementById('dateInput').value = date;
        document.getElementById('dateUnknownCheckbox').checked = false;
        document.getElementById('cancelledCheckbox').checked = false;
        document.getElementById('monthYearContainer').classList.add('hidden');
    }
    olympiadModal.classList.add('active');
}

function closeOlympiadModal() { olympiadModal.classList.remove('active'); editingOlympiadId = null; selectedRelatedEvents = []; }

function populateFormForEdit(o) {
    editingOlympiadId = o.id;
    document.getElementById('modalTitle').textContent = 'Редактировать олимпиаду';
    document.getElementById('nameInput').value = o.name.replace(/\s*\(\d+\s*класс\)\s*$/, '');
    document.getElementById('descriptionInput').value = o.description || '';
    
    const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
    const cancelledCheckbox = document.getElementById('cancelledCheckbox');
    const dateInput = document.getElementById('dateInput');
    const monthYearContainer = document.getElementById('monthYearContainer');
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearInput');
    
    if (o.dateUnknown) {
        dateUnknownCheckbox.checked = true;
        cancelledCheckbox.checked = false;
        dateInput.disabled = true;
        dateInput.value = '';
        monthYearContainer.classList.remove('hidden');
        monthSelect.value = o.month.toString();
        yearInput.value = o.year.toString();
    } else if (o.cancelled) {
        dateUnknownCheckbox.checked = false;
        cancelledCheckbox.checked = true;
        dateInput.disabled = true;
        dateInput.value = '';
        monthYearContainer.classList.remove('hidden');
        monthSelect.value = o.month.toString();
        yearInput.value = o.year.toString();
    } else {
        dateUnknownCheckbox.checked = false;
        cancelledCheckbox.checked = false;
        dateInput.disabled = false;
        dateInput.value = o.date;
        monthYearContainer.classList.add('hidden');
    }
    
    document.getElementById('timeInput').value = o.time || '';
    document.getElementById('difficultyInput').value = o.difficulty;
    document.querySelectorAll('input[name="grade"]').forEach(cb => cb.checked = false);
    const match = o.grade.match(/\d+/);
    if (match) {
        const cb = document.querySelector(`input[name="grade"][value="${match[0]}"]`);
        if (cb) cb.checked = true;
    }
    document.getElementById('locationInput').value = o.location || '';
    document.getElementById('websiteInput').value = o.website || '';
    document.getElementById('archiveInput').value = o.archive || '';
    document.getElementById('colorInput').value = o.color || '#667eea';
    
    // Добавляем контейнер для связанных событий, если его нет
    let relatedContainer = document.getElementById('relatedEventsContainer');
    if (!relatedContainer) {
        relatedContainer = document.createElement('div');
        relatedContainer.id = 'relatedEventsContainer';
        relatedContainer.className = 'form-group';
        relatedContainer.style.cssText = 'padding: 20px; background: #1a1a2e; border-radius: 10px; margin-bottom: 15px; border: 2px solid #3d3d54;';
        document.getElementById('colorInput').parentElement.insertAdjacentElement('beforebegin', relatedContainer);
    }
    
    renderRelatedEventsSelector();
    
    if (o.focusPlates?.length) {
        focusPlatesCountInput.value = o.focusPlates.length;
        handleFocusPlatesCountChange();
        setTimeout(() => o.focusPlates.forEach((p, i) => {
            const idx = i + 1;
            const date = document.getElementById(`focusPlateDate${idx}`);
            const name = document.getElementById(`focusPlateName${idx}`);
            const color = document.getElementById(`focusPlateColor${idx}`);
            if (date) date.value = p.date;
            if (name) name.value = p.name;
            if (color) color.value = p.color;
        }), 100);
    } else {
        focusPlatesCountInput.value = 0;
        focusPlatesContainer.innerHTML = '';
    }
    
    olympiadModal.classList.add('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return;
    const grades = Array.from(document.querySelectorAll('input[name="grade"]:checked')).map(cb => cb.value);
    if (!grades.length) { alert('Выберите хотя бы один класс!'); return; }
    
    const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
    const cancelledCheckbox = document.getElementById('cancelledCheckbox');
    const dateInput = document.getElementById('dateInput');
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearInput');
    
    let dateUnknown = dateUnknownCheckbox.checked;
    let cancelled = cancelledCheckbox.checked;
    let date = dateInput.value;
    let month = null;
    let year = null;
    
    if (dateUnknown || cancelled) {
        month = parseInt(monthSelect.value);
        year = parseInt(yearInput.value);
        date = '';
    } else if (!date) {
        alert('Укажите дату олимпиады или отметьте "Дата неизвестна"!');
        return;
    }
    
    const count = parseInt(focusPlatesCountInput.value) || 0;
    const plates = [];
    for (let i = 1; i <= count; i++) {
        const plateDate = document.getElementById(`focusPlateDate${i}`)?.value;
        const name = document.getElementById(`focusPlateName${i}`)?.value;
        const color = document.getElementById(`focusPlateColor${i}`)?.value;
        if (plateDate && name) plates.push({ date: plateDate, name, color: color || '#667eea' });
    }
    
    const base = {
        description: document.getElementById('descriptionInput').value,
        date: date,
        dateUnknown: dateUnknown,
        cancelled: cancelled,
        month: month,
        year: year,
        time: document.getElementById('timeInput').value,
        difficulty: document.getElementById('difficultyInput').value,
        location: document.getElementById('locationInput').value,
        website: document.getElementById('websiteInput').value,
        archive: document.getElementById('archiveInput').value,
        color: document.getElementById('colorInput').value,
        focusPlates: plates,
        relatedEvents: selectedRelatedEvents
    };
    const baseName = document.getElementById('nameInput').value;
    if (editingOlympiadId) {
        const grade = grades[0];
        const o = { ...base, id: editingOlympiadId, name: grades.length > 1 ? `${baseName} (${grade} класс)` : baseName, grade: `${grade} класс` };
        olympiads[olympiads.findIndex(x => x.id === editingOlympiadId)] = o;
    } else {
        grades.forEach(g => olympiads.push({ ...base, id: Date.now() + Math.random(), name: grades.length > 1 ? `${baseName} (${g} класс)` : baseName, grade: `${g} класс` }));
    }
    localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
    closeOlympiadModal();
    renderAllMonths();
    
    // Если был открыт месяц олимпиад, обновляем его
    if (currentOpenMonth !== null) {
        openMonthOlympiadsModal(currentOpenMonth);
    }
}

function handleRegistration() { alert('Функция регистрации будет реализована позже. Здесь должна быть интеграция с системой регистрации.'); }

function handleEdit() {
    if (!isAdmin) return;
    const o = olympiads.find(x => x.id === parseFloat(sidePanel.dataset.olympiadId));
    if (o) { closeSidePanel(); populateFormForEdit(o); }
}

function handleDelete() {
    if (!isAdmin) return;
    if (!confirm('Вы уверены, что хотите удалить эту олимпиаду?')) return;
    const id = parseFloat(sidePanel.dataset.olympiadId);
    olympiads = olympiads.filter(o => o.id !== id);
    localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
    if (focusedOlympiadId === id) exitFocusMode();
    expandedOlympiads.delete(id);
    closeSidePanel();
    renderAllMonths();
}

function formatDate(date) {
    const d = new Date(date + 'T00:00:00');
    return `${d.getDate()} ${monthNamesGenitive[d.getMonth()]} ${d.getFullYear()}`;
}
