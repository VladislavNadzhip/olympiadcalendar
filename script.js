// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let currentCity = localStorage.getItem('currentCity') || 'Москва';
let olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];let isAdmin = localStorage.getItem('isAdmin') === 'true';
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

// Туториал по умолчанию
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

// Элементы туториала
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация календаря...');
    
    reloadOlympiads();
    initializeTutorial();
    initializeEventListeners();
    updateAdminUI();
    renderAllMonths();
    
    citySelect.value = currentCity;
    
    setTimeout(() => {
        updateCurrentMonthTitle();
    }, 100);
});

function initializeTutorial() {
    const savedTutorial = localStorage.getItem('tutorial');
    if (!savedTutorial) {
        localStorage.setItem('tutorial', DEFAULT_TUTORIAL);
    }
}

function loadTutorial() {
    const tutorial = localStorage.getItem('tutorial') || DEFAULT_TUTORIAL;
    tutorialContent.innerHTML = tutorial;
}

function openTutorialModal() {
    loadTutorial();
    tutorialModal.classList.add('active');
}

function closeTutorialModal() {
    tutorialModal.classList.remove('active');
}

function openEditTutorialModal() {
    const currentTutorial = localStorage.getItem('tutorial') || DEFAULT_TUTORIAL;
    tutorialTextInput.value = currentTutorial;
    closeTutorialModal();
    editTutorialModal.classList.add('active');
}

function closeEditTutorialModal() {
    editTutorialModal.classList.remove('active');
}

function handleEditTutorialSubmit(e) {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    const newTutorial = tutorialTextInput.value;
    localStorage.setItem('tutorial', newTutorial);
    
    closeEditTutorialModal();
    alert('Туториал успешно обновлён!');
}

function reloadOlympiads() {
    const stored = localStorage.getItem(`olympiads_${currentCity}`);
    console.log(`📦 Загрузка олимпиад из localStorage для города: ${currentCity}`);
    console.log(`📦 Сырые данные из localStorage:`, stored);
    
    if (stored) {
        try {
            olympiads = JSON.parse(stored);
            console.log(`✅ Загружено олимпиад: ${olympiads.length}`);
            console.log(`📋 Список ID олимпиад:`, olympiads.map(o => o.id));
        } catch (e) {
            console.error('❌ Ошибка парсинга данных из localStorage:', e);
            olympiads = [];
        }
    } else {
        console.log('⚠️ Нет сохранённых олимпиад в localStorage');
        olympiads = [];
    }
}

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
    // Туториал
    if (tutorialModal.classList.contains('active') && !tutorialModal.contains(e.target)) {
        closeTutorialModal();
        return;
    }
    
    if (editTutorialModal.classList.contains('active') && !editTutorialModal.contains(e.target)) {
        closeEditTutorialModal();
        return;
    }
    
    if (monthOlympiadsModal.classList.contains('active') && monthOlympiadsModal.contains(e.target)) {
        const olympiadCard = e.target.closest('.month-olympiad-card');
        if (olympiadCard) {
            e.preventDefault();
            e.stopPropagation();
            const olympiadId = parseFloat(olympiadCard.dataset.olympiadId);
            console.log('📌 Клик по карточке олимпиады в модальном окне, ID:', olympiadId);
            showOlympiadDetailsById(olympiadId);
            closeMonthOlympiadsModal();
            return;
        }
        return;
    }
    
    if (dayPanel.classList.contains('active') && dayPanel.contains(e.target)) {
        const header = e.target.closest('.day-olympiad-header');
        if (header) {
            e.preventDefault();
            e.stopPropagation();
            const card = header.closest('.day-olympiad-card');
            if (card && dayPanel.contains(card)) {
                const olympiadId = parseFloat(card.dataset.olympiadId);
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
                const olympiadId = parseFloat(card.dataset.olympiadId);
                handleEditFromDay(olympiadId);
            }
            return;
        }
        
        if (e.target.classList.contains('delete-btn-compact')) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.day-olympiad-card');
            if (card && dayPanel.contains(card)) {
                const olympiadId = parseFloat(card.dataset.olympiadId);
                handleDeleteFromDay(olympiadId);
            }
            return;
        }
        
        if (e.target.tagName === 'A') {
            return;
        }
        
        return;
    }
    
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
    
    // Туториал
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTutorialModal();
        });
    }
    
    if (closeTutorialBtn) {
        closeTutorialBtn.addEventListener('click', closeTutorialModal);
    }
    
    if (editTutorialBtn) {
        editTutorialBtn.addEventListener('click', openEditTutorialModal);
    }
    
    if (closeEditTutorialBtn) {
        closeEditTutorialBtn.addEventListener('click', closeEditTutorialModal);
    }
    
    if (cancelEditTutorialBtn) {
        cancelEditTutorialBtn.addEventListener('click', closeEditTutorialModal);
    }
    
    if (editTutorialForm) {
        editTutorialForm.addEventListener('submit', handleEditTutorialSubmit);
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

// Остальные функции остаются без изменений...
[REST OF THE ORIGINAL SCRIPT.JS CONTINUES HERE - keeping all existing functions unchanged]