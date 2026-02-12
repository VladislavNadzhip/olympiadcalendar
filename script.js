// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let olympiads = JSON.parse(localStorage.getItem('olympiads')) || [];
let editingOlympiadId = null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// Пароль админа (в реальном проекте хранить на сервере)
const ADMIN_PASSWORD = 'admin123';

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// DOM элементы
const yearView = document.getElementById('yearView');
const monthView = document.getElementById('monthView');
const backBtn = document.getElementById('backBtn');
const currentMonthTitle = document.getElementById('currentMonthTitle');
const monthsScrollContainer = document.getElementById('monthsScrollContainer');
const sidePanel = document.getElementById('sidePanel');
const closePanelBtn = document.getElementById('closePanelBtn');
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
    let eventsHTML = '';
    
    const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOlympiads = olympiads.filter(o => o.date === dateStr);
    
    dayOlympiads.forEach(olympiad => {
        const bgColor = olympiad.color || '#4a5ab3';
        eventsHTML += `<div class="olympiad-event" style="background-color: ${bgColor}" onclick="showOlympiadDetailsById(${olympiad.id})">${olympiad.name}</div>`;
    });
    
    // Клик по ячейке доступен только для админа
    const clickHandler = isAdmin ? `onclick="openOlympiadModal('${dateStr}')"` : '';
    
    return `
        <div class="day-cell" ${clickHandler}>
            <div class="day-number">${day}</div>
            <div class="olympiad-events-container">
                ${eventsHTML}
            </div>
        </div>
    `;
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
    document.getElementById('olympiadName').textContent = olympiad.name;
    document.getElementById('olympiadDate').textContent = formatDate(olympiad.date);
    document.getElementById('olympiadTime').textContent = olympiad.time;
    document.getElementById('olympiadDifficulty').textContent = olympiad.difficulty;
    document.getElementById('olympiadGrade').textContent = olympiad.grade;
    document.getElementById('olympiadLocation').textContent = olympiad.location;
    
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
        closeSidePanel();
        renderAllMonths();
        updateMonthHeatMap();
    }
}

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}