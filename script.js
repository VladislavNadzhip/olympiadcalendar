// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let olympiads = JSON.parse(localStorage.getItem('olympiads')) || [];
let editingOlympiadId = null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';
let focusedOlympiadId = null; // Для режима фокуса

// Пароль админа (в реальном проекте хранить на сервере)
const ADMIN_PASSWORD = 'admin123';

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

// DOM элементы
const yearView = document.getElementById('yearView');
const monthView = document.getElementById('monthView');
const backBtn = document.getElementById('backBtn');
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeMonthCards();
    initializeEventListeners();
    updateMonthHeatMap();
    updateAdminUI();
});

// Обновление интерфейса в зависимости от роли
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

// Инициализация карточек месяцев
function initializeMonthCards() {
    const monthCards = document.querySelectorAll('.month-card');
    monthCards.forEach(card => {
        card.addEventListener('click', () => {
            const month = parseInt(card.dataset.month);
            openMonthView(month);
        });
    });
}

// Обновление тепловой карты месяцев
function updateMonthHeatMap() {
    const monthCards = document.querySelectorAll('.month-card');
    
    monthCards.forEach(card => {
        const month = parseInt(card.dataset.month);
        const monthOlympiads = olympiads.filter(o => {
            const olympiadDate = new Date(o.date + 'T00:00:00');
            return olympiadDate.getMonth() === month && olympiadDate.getFullYear() === currentYear;
        });
        
        const count = monthOlympiads.length;
        
        // Удаляем все классы heat
        card.classList.remove('heat-1', 'heat-2', 'heat-3', 'heat-4', 'heat-5');
        
        // Добавляем класс в зависимости от количества олимпиад
        if (count > 0) {
            const heatLevel = Math.min(5, Math.ceil(count / 2));
            card.classList.add(`heat-${heatLevel}`);
        }
        
        // Обновляем счетчик
        let countElement = card.querySelector('.month-count');
        if (!countElement) {
            countElement = document.createElement('div');
            countElement.className = 'month-count';
            card.appendChild(countElement);
        }
        countElement.textContent = count > 0 ? `Олимпиад: ${count}` : '';
    });
}

// Инициализация обработчиков событий
function initializeEventListeners() {
    backBtn.addEventListener('click', closeMonthView);
    closePanelBtn.addEventListener('click', closeSidePanel);
    closeDayPanelBtn.addEventListener('click', closeDayPanel);
    addOlympiadBtn.addEventListener('click', () => openOlympiadModal());
    closeModalBtn.addEventListener('click', closeOlympiadModal);
    cancelFormBtn.addEventListener('click', closeOlympiadModal);
    olympiadForm.addEventListener('submit', handleFormSubmit);
    registerBtn.addEventListener('click', handleRegistration);
    editOlympiadBtn.addEventListener('click', handleEdit);
    deleteOlympiadBtn.addEventListener('click', handleDelete);
    
    // Админские обработчики
    adminBtn.addEventListener('click', openAdminModal);
    logoutBtn.addEventListener('click', handleLogout);
    closeAdminModalBtn.addEventListener('click', closeAdminModal);
    cancelAdminBtn.addEventListener('click', closeAdminModal);
    adminForm.addEventListener('submit', handleAdminLogin);
    
    // Закрытие панелей при клике вне их
    document.addEventListener('click', handleOutsideClick);
    
    // Выход из режима фокуса по ПКМ
    document.addEventListener('contextmenu', handleRightClick);
}

// Обработка правого клика (ПКМ)
function handleRightClick(e) {
    if (focusedOlympiadId !== null) {
        e.preventDefault();
        exitFocusMode();
    }
}

// Вход в режим фокуса
function enterFocusMode(olympiadId) {
    focusedOlympiadId = olympiadId;
    const focusedOlympiad = olympiads.find(o => o.id === olympiadId);
    
    if (!focusedOlympiad) return;
    
    // Показываем подсказку
    focusHint.classList.remove('hidden');
    
    // Перерисовываем календарь с режимом фокуса
    renderAllMonths();
}

// Выход из режима фокуса
function exitFocusMode() {
    focusedOlympiadId = null;
    
    // Скрываем подсказку
    focusHint.classList.add('hidden');
    
    // Перерисовываем календарь
    renderAllMonths();
}

// Обработка клика вне панелей
function handleOutsideClick(e) {
    // Проверяем, открыта ли какая-то панель
    const isSidePanelOpen = sidePanel.classList.contains('active');
    const isDayPanelOpen = dayPanel.classList.contains('active');
    
    if (!isSidePanelOpen && !isDayPanelOpen) return;
    
    // Проверяем, что клик не по панелям
    const clickedInsideSidePanel = sidePanel.contains(e.target);
    const clickedInsideDayPanel = dayPanel.contains(e.target);
    
    if (clickedInsideSidePanel || clickedInsideDayPanel) return;
    
    // Проверяем, что клик не по элементам олимпиад (которые открывают панели)
    const clickedOnOlympiadEvent = e.target.closest('.olympiad-event');
    if (clickedOnOlympiadEvent) return;
    
    // Проверяем, что клик по непустой ячейке дня с олимпиадами
    const clickedDayCell = e.target.closest('.day-cell:not(.empty-cell)');
    if (clickedDayCell) {
        // Если кликнули внутри контейнера событий, не закрываем
        const clickedInsideEvents = e.target.closest('.olympiad-events-container');
        if (clickedInsideEvents) return;
        
        // Если кликнули на номер дня или пустое место в ячейке - не закрываем (откроется панель дня)
        return;
    }
    
    // Во всех остальных случаях (клик по фону, пустым ячейкам, промежуткам) - закрываем
    closeSidePanel();
    closeDayPanel();
}

// Открыть модальное окно авторизации
function openAdminModal() {
    adminModal.classList.add('active');
    adminPasswordInput.value = '';
    adminError.classList.add('hidden');
}

// Закрыть модальное окно авторизации
function closeAdminModal() {
    adminModal.classList.remove('active');
}

// Обработка входа админа
function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = adminPasswordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        closeAdminModal();
        updateAdminUI();
        renderAllMonths(); // Перерисовка для обновления кликов на ячейки
    } else {
        adminError.classList.remove('hidden');
    }
}

// Выход из режима админа
function handleLogout() {
    isAdmin = false;
    localStorage.setItem('isAdmin', 'false');
    updateAdminUI();
    closeSidePanel();
    closeDayPanel();
    exitFocusMode();
    renderAllMonths(); // Перерисовка для обновления кликов на ячейки
}

// Открыть календарь месяца
function openMonthView(month) {
    currentMonth = month;
    yearView.classList.add('hidden');
    monthView.classList.remove('hidden');
    currentMonthTitle.textContent = `${monthNames[month]} ${currentYear}`;
    renderAllMonths();
    
    // Прокрутка к выбранному месяцу
    setTimeout(() => {
        const monthWrapper = document.getElementById(`month-${month}`);
        if (monthWrapper) {
            monthWrapper.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Закрыть календарь месяца
function closeMonthView() {
    monthView.classList.add('hidden');
    yearView.classList.remove('hidden');
    closeSidePanel();
    closeDayPanel();
    exitFocusMode();
    updateMonthHeatMap();
}

// Отрисовка всех месяцев
function renderAllMonths() {
    monthsScrollContainer.innerHTML = '';
    
    for (let month = 0; month < 12; month++) {
        const monthWrapper = document.createElement('div');
        monthWrapper.className = 'month-calendar-wrapper';
        monthWrapper.id = `month-${month}`;
        
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        // Дни недели
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekdays.forEach(day => {
            const weekdayDiv = document.createElement('div');
            weekdayDiv.className = 'weekday';
            weekdayDiv.textContent = day;
            calendarGrid.appendChild(weekdayDiv);
        });
        
        // Дни месяца
        const daysContainer = document.createElement('div');
        daysContainer.className = 'days-container';
        daysContainer.innerHTML = renderMonthDays(month);
        calendarGrid.appendChild(daysContainer);
        
        monthWrapper.appendChild(calendarGrid);
        monthsScrollContainer.appendChild(monthWrapper);
    }
    
    // Обновляем заголовок при скролле
    monthsScrollContainer.addEventListener('scroll', updateCurrentMonthTitle);
}

// Обновление заголовка при скролле
function updateCurrentMonthTitle() {
    const scrollTop = monthsScrollContainer.scrollTop;
    const monthIndex = Math.round(scrollTop / window.innerHeight);
    currentMonthTitle.textContent = `${monthNames[monthIndex]} ${currentYear}`;
}

// Отрисовка дней месяца
function renderMonthDays(month) {
    let html = '';
    
    const firstDay = new Date(currentYear, month, 1);
    const lastDay = new Date(currentYear, month + 1, 0);
    
    const firstDayWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    
    // Пустые ячейки для выравнивания первого дня месяца
    for (let i = 1; i < firstDayWeek; i++) {
        html += '<div class="day-cell empty-cell"></div>';
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDayDate; day++) {
        html += createDayCellHTML(day, month);
    }
    
    return html;
}

// Создать HTML ячейки дня
function createDayCellHTML(day, month) {
    const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOlympiads = olympiads.filter(o => o.date === dateStr);
    
    // Проверяем, является ли этот день датой регистрации в фокусе
    let regLabel = '';
    let regClass = '';
    
    if (focusedOlympiadId !== null) {
        const focusedOlympiad = olympiads.find(o => o.id === focusedOlympiadId);
        if (focusedOlympiad) {
            if (focusedOlympiad.regStart === dateStr) {
                regLabel = '<div class="reg-label">Начало регистрации</div>';
                regClass = ' reg-start';
            } else if (focusedOlympiad.regEnd === dateStr) {
                regLabel = '<div class="reg-label">Конец регистрации</div>';
                regClass = ' reg-end';
            }
        }
    }
    
    // Генерируем HTML для олимпиад
    let eventsHTML = '';
    dayOlympiads.forEach(olympiad => {
        const bgColor = olympiad.color || '#4a5ab3';
        // ОДИНОЧНЫЙ клик открывает панель олимпиады, ДВОЙНОЙ - режим фокуса
        eventsHTML += `<div class="olympiad-event" style="background-color: ${bgColor}" onclick="event.stopPropagation(); showOlympiadDetailsById(${olympiad.id})" ondblclick="event.stopPropagation(); enterFocusMode(${olympiad.id})">${olympiad.name}</div>`;
    });
    
    // Определяем класс для скрытия в режиме фокуса
    let focusClass = '';
    if (focusedOlympiadId !== null) {
        const hasFocusedOlympiad = dayOlympiads.some(o => o.id === focusedOlympiadId);
        if (!hasFocusedOlympiad && dayOlympiads.length > 0) {
            focusClass = ' focus-hidden';
        }
    }
    
    // Клик по ячейке дня открывает панель дня (только если есть олимпиады) или модальное окно для админа
    const clickHandler = dayOlympiads.length > 0 
        ? `onclick="handleDayCellClick('${dateStr}', event)"` 
        : (isAdmin ? `onclick="openOlympiadModal('${dateStr}')"` : '');
    
    return `
        <div class="day-cell${regClass}${focusClass}" ${clickHandler}>
            ${regLabel}
            <div class="day-number">${day}</div>
            <div class="olympiad-events-container">
                ${eventsHTML}
            </div>
        </div>
    `;
}

// Обработка клика по ячейке дня (НЕ по олимпиаде)
function handleDayCellClick(dateStr, event) {
    // Клик на саму ячейку (не на олимпиаду) открывает панель дня
    showDayPanel(dateStr);
}

// Показать панель дня со всеми олимпиадами
function showDayPanel(dateStr) {
    const dayOlympiads = olympiads.filter(o => o.date === dateStr);
    
    if (dayOlympiads.length === 0) return;
    
    // Закрываем панель отдельной олимпиады если открыта
    closeSidePanel();
    
    // Форматируем дату и количество олимпиад
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const monthGenitive = monthNamesGenitive[date.getMonth()];
    const year = date.getFullYear();
    const olympiadWord = getOlympiadWord(dayOlympiads.length);
    
    // Обновляем заголовок
    document.getElementById('dayPanelTitle').innerHTML = `${day} ${monthGenitive} ${year}<br><small style="font-size: 0.7em; font-weight: 400; opacity: 0.9;">${dayOlympiads.length} ${olympiadWord}</small>`;
    
    // Рендерим карточки олимпиад
    dayPanelContent.innerHTML = dayOlympiads.map(olympiad => `
        <div class="day-olympiad-card" data-olympiad-id="${olympiad.id}">
            <div class="day-olympiad-header" onclick="toggleOlympiadDetails(${olympiad.id})">
                <div class="day-olympiad-title">
                    <div class="day-olympiad-color" style="background-color: ${olympiad.color || '#4a5ab3'}"></div>
                    <span>${olympiad.name}</span>
                </div>
                <span class="expand-icon">▼</span>
            </div>
            <div class="day-olympiad-preview">
                <div class="preview-item">
                    <strong>Сложность:</strong> ${olympiad.difficulty}
                </div>
                ${olympiad.website ? `<div class="preview-item">
                    <strong>Сайт:</strong> <a href="${olympiad.website}" target="_blank" onclick="event.stopPropagation()">${olympiad.website}</a>
                </div>` : ''}
            </div>
            <div class="day-olympiad-details hidden">
                <div class="detail-item">
                    <strong>Время:</strong> ${olympiad.time}
                </div>
                <div class="detail-item">
                    <strong>Класс:</strong> ${olympiad.grade}
                </div>
                <div class="detail-item">
                    <strong>Место проведения:</strong> ${olympiad.location}
                </div>
                ${olympiad.regStart ? `<div class="detail-item">
                    <strong>Начало регистрации:</strong> ${formatDate(olympiad.regStart)}
                </div>` : ''}
                ${olympiad.regEnd ? `<div class="detail-item">
                    <strong>Конец регистрации:</strong> ${formatDate(olympiad.regEnd)}
                </div>` : ''}
                ${olympiad.archive ? `<div class="detail-item">
                    <strong>Архив задач:</strong> <a href="${olympiad.archive}" target="_blank" onclick="event.stopPropagation()">Скачать</a>
                </div>` : ''}
                <button class="register-btn-compact" onclick="event.stopPropagation(); handleRegistration()">Записаться</button>
                ${isAdmin ? `
                    <div class="admin-actions-compact">
                        <button class="edit-btn-compact" onclick="event.stopPropagation(); handleEditFromDay(${olympiad.id})">Редактировать</button>
                        <button class="delete-btn-compact" onclick="event.stopPropagation(); handleDeleteFromDay(${olympiad.id})">Удалить</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    dayPanel.classList.add('active');
}

// Получить правильное склонение слова "олимпиада"
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

// Раскрыть/скрыть детали олимпиады в панели дня
function toggleOlympiadDetails(olympiadId) {
    const card = document.querySelector(`[data-olympiad-id="${olympiadId}"]`);
    if (!card) return;
    
    const details = card.querySelector('.day-olympiad-details');
    const icon = card.querySelector('.expand-icon');
    
    details.classList.toggle('hidden');
    icon.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Закрыть панель дня
function closeDayPanel() {
    dayPanel.classList.remove('active');
}

// Редактировать из панели дня
function handleEditFromDay(olympiadId) {
    closeDayPanel();
    const olympiad = olympiads.find(o => o.id === olympiadId);
    if (olympiad) {
        editingOlympiadId = olympiadId;
        document.getElementById('modalTitle').textContent = 'Редактировать олимпиаду';
        document.getElementById('nameInput').value = olympiad.name;
        document.getElementById('dateInput').value = olympiad.date;
        document.getElementById('timeInput').value = olympiad.time;
        document.getElementById('regStartInput').value = olympiad.regStart || '';
        document.getElementById('regEndInput').value = olympiad.regEnd || '';
        document.getElementById('difficultyInput').value = olympiad.difficulty;
        document.getElementById('gradeInput').value = olympiad.grade;
        document.getElementById('locationInput').value = olympiad.location;
        document.getElementById('websiteInput').value = olympiad.website || '';
        document.getElementById('archiveInput').value = olympiad.archive || '';
        document.getElementById('colorInput').value = olympiad.color || '#667eea';
        
        olympiadModal.classList.add('active');
    }
}

// Удалить из панели дня
function handleDeleteFromDay(olympiadId) {
    if (confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
        const dateStr = olympiads.find(o => o.id === olympiadId)?.date;
        olympiads = olympiads.filter(o => o.id !== olympiadId);
        localStorage.setItem('olympiads', JSON.stringify(olympiads));
        
        // Выходим из режима фокуса если удалили фокусированную олимпиаду
        if (focusedOlympiadId === olympiadId) {
            exitFocusMode();
        }
        
        // Обновляем панель дня
        const remainingOlympiads = olympiads.filter(o => o.date === dateStr);
        if (remainingOlympiads.length > 0) {
            showDayPanel(dateStr);
        } else {
            closeDayPanel();
        }
        
        renderAllMonths();
        updateMonthHeatMap();
    }
}

// Показать детали олимпиады по ID
function showOlympiadDetailsById(olympiadId) {
    const olympiad = olympiads.find(o => o.id === olympiadId);
    if (olympiad) {
        showOlympiadDetails(olympiad);
    }
}

// Показать детали олимпиады
function showOlympiadDetails(olympiad) {
    // Закрываем панель дня если открыта
    closeDayPanel();
    
    document.getElementById('olympiadName').textContent = olympiad.name;
    document.getElementById('olympiadDate').textContent = formatDate(olympiad.date);
    document.getElementById('olympiadTime').textContent = olympiad.time;
    document.getElementById('olympiadDifficulty').textContent = olympiad.difficulty;
    document.getElementById('olympiadGrade').textContent = olympiad.grade;
    document.getElementById('olympiadLocation').textContent = olympiad.location;
    
    // Даты регистрации
    document.getElementById('olympiadRegStart').textContent = olympiad.regStart ? formatDate(olympiad.regStart) : 'Не указано';
    document.getElementById('olympiadRegEnd').textContent = olympiad.regEnd ? formatDate(olympiad.regEnd) : 'Не указано';
    
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
    
    // Сохраняем ID для редактирования/удаления
    sidePanel.dataset.olympiadId = olympiad.id;
    
    sidePanel.classList.add('active');
}

// Закрыть боковую панель
function closeSidePanel() {
    sidePanel.classList.remove('active');
}

// Открыть модальное окно
function openOlympiadModal(dateStr = null) {
    if (!isAdmin) return; // Только для админа
    
    editingOlympiadId = null;
    olympiadForm.reset();
    document.getElementById('modalTitle').textContent = 'Добавить олимпиаду';
    
    if (dateStr) {
        document.getElementById('dateInput').value = dateStr;
    }
    
    olympiadModal.classList.add('active');
}

// Закрыть модальное окно
function closeOlympiadModal() {
    olympiadModal.classList.remove('active');
    editingOlympiadId = null;
}

// Обработка отправки формы
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!isAdmin) return; // Только для админа
    
    const olympiad = {
        id: editingOlympiadId || Date.now(),
        name: document.getElementById('nameInput').value,
        date: document.getElementById('dateInput').value,
        time: document.getElementById('timeInput').value,
        regStart: document.getElementById('regStartInput').value,
        regEnd: document.getElementById('regEndInput').value,
        difficulty: document.getElementById('difficultyInput').value,
        grade: document.getElementById('gradeInput').value,
        location: document.getElementById('locationInput').value,
        website: document.getElementById('websiteInput').value,
        archive: document.getElementById('archiveInput').value,
        color: document.getElementById('colorInput').value
    };
    
    if (editingOlympiadId) {
        // Редактирование
        const index = olympiads.findIndex(o => o.id === editingOlympiadId);
        olympiads[index] = olympiad;
    } else {
        // Добавление
        olympiads.push(olympiad);
    }
    
    localStorage.setItem('olympiads', JSON.stringify(olympiads));
    closeOlympiadModal();
    renderAllMonths();
    updateMonthHeatMap();
}

// Обработка регистрации
function handleRegistration() {
    alert('Функция регистрации будет реализована позже. Здесь должна быть интеграция с системой регистрации.');
}

// Обработка редактирования
function handleEdit() {
    if (!isAdmin) return; // Только для админа
    
    const olympiadId = parseInt(sidePanel.dataset.olympiadId);
    const olympiad = olympiads.find(o => o.id === olympiadId);
    
    if (olympiad) {
        editingOlympiadId = olympiadId;
        document.getElementById('modalTitle').textContent = 'Редактировать олимпиаду';
        document.getElementById('nameInput').value = olympiad.name;
        document.getElementById('dateInput').value = olympiad.date;
        document.getElementById('timeInput').value = olympiad.time;
        document.getElementById('regStartInput').value = olympiad.regStart || '';
        document.getElementById('regEndInput').value = olympiad.regEnd || '';
        document.getElementById('difficultyInput').value = olympiad.difficulty;
        document.getElementById('gradeInput').value = olympiad.grade;
        document.getElementById('locationInput').value = olympiad.location;
        document.getElementById('websiteInput').value = olympiad.website || '';
        document.getElementById('archiveInput').value = olympiad.archive || '';
        document.getElementById('colorInput').value = olympiad.color || '#667eea';
        
        closeSidePanel();
        olympiadModal.classList.add('active');
    }
}

// Обработка удаления
function handleDelete() {
    if (!isAdmin) return; // Только для админа
    
    const olympiadId = parseInt(sidePanel.dataset.olympiadId);
    
    if (confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
        olympiads = olympiads.filter(o => o.id !== olympiadId);
        localStorage.setItem('olympiads', JSON.stringify(olympiads));
        
        // Выходим из режима фокуса если удалили фокусированную олимпиаду
        if (focusedOlympiadId === olympiadId) {
            exitFocusMode();
        }
        
        closeSidePanel();
        renderAllMonths();
        updateMonthHeatMap();
    }
}

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = monthNamesGenitive[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}