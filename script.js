// Глобальные переменные
let currentYear = 2026;
let currentMonth = 0;
let olympiads = JSON.parse(localStorage.getItem('olympiads')) || [];
let editingOlympiadId = null;

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// DOM элементы
const yearView = document.getElementById('yearView');
const monthView = document.getElementById('monthView');
const backBtn = document.getElementById('backBtn');
const currentMonthTitle = document.getElementById('currentMonthTitle');
const daysContainer = document.getElementById('daysContainer');
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeMonthCards();
    initializeEventListeners();
});

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
}

// Открыть календарь месяца
function openMonthView(month) {
    currentMonth = month;
    yearView.classList.add('hidden');
    monthView.classList.remove('hidden');
    currentMonthTitle.textContent = `${monthNames[month]} ${currentYear}`;
    renderMonthCalendar();
}

// Закрыть календарь месяца
function closeMonthView() {
    monthView.classList.add('hidden');
    yearView.classList.remove('hidden');
    closeSidePanel();
}

// Отрисовка календаря месяца
function renderMonthCalendar() {
    daysContainer.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    
    const firstDayWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    
    // Дни предыдущего месяца
    for (let i = firstDayWeek - 1; i > 0; i--) {
        const dayCell = createDayCell(prevLastDayDate - i + 1, true);
        daysContainer.appendChild(dayCell);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDayDate; day++) {
        const dayCell = createDayCell(day, false);
        daysContainer.appendChild(dayCell);
    }
    
    // Дни следующего месяца
    const totalCells = daysContainer.children.length;
    const remainingCells = 35 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(day, true);
        daysContainer.appendChild(dayCell);
    }
}

// Создать ячейку дня
function createDayCell(day, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);
    
    if (!isOtherMonth) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOlympiads = olympiads.filter(o => o.date === dateStr);
        
        dayOlympiads.forEach(olympiad => {
            const event = document.createElement('div');
            event.className = 'olympiad-event';
            event.textContent = olympiad.name;
            event.style.backgroundColor = olympiad.color || '#4A90E2';
            event.addEventListener('click', (e) => {
                e.stopPropagation();
                showOlympiadDetails(olympiad);
            });
            cell.appendChild(event);
        });
        
        // Клик по ячейке для добавления олимпиады
        cell.addEventListener('click', () => {
            openOlympiadModal(dateStr);
        });
    }
    
    return cell;
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
    renderMonthCalendar();
}

// Обработка регистрации
function handleRegistration() {
    alert('Функция регистрации будет реализована позже. Здесь должна быть интеграция с системой регистрации.');
}

// Обработка редактирования
function handleEdit() {
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
        document.getElementById('colorInput').value = olympiad.color || '#4A90E2';
        
        closeSidePanel();
        olympiadModal.classList.add('active');
    }
}

// Обработка удаления
function handleDelete() {
    const olympiadId = parseInt(sidePanel.dataset.olympiadId);
    
    if (confirm('Вы уверены, что хотите удалить эту олимпиаду?')) {
        olympiads = olympiads.filter(o => o.id !== olympiadId);
        localStorage.setItem('olympiads', JSON.stringify(olympiads));
        closeSidePanel();
        renderMonthCalendar();
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