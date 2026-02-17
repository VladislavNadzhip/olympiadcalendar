// Скрипт для загрузки февральских олимпиад в календарь

async function loadFebruaryOlympiads() {
    try {
        const response = await fetch('february_olympiads.json');
        const februaryData = await response.json();
        
        // Получаем текущий город
        const currentCity = localStorage.getItem('currentCity') || 'Москва';
        
        // Получаем текущие олимпиады из localStorage
        let olympiads = JSON.parse(localStorage.getItem(`olympiads_${currentCity}`)) || [];
        
        // Добавляем уникальные ID к каждой олимпиаде из февральских данных
        februaryData.forEach((olympiad, index) => {
            olympiad.id = Date.now() + index;
        });
        
        // Проверяем, какие олимпиады уже есть (по имени и дате)
        const existingKeys = new Set(
            olympiads.map(o => `${o.name}|${o.date}`)
        );
        
        // Добавляем только новые олимпиады
        const newOlympiads = februaryData.filter(
            o => !existingKeys.has(`${o.name}|${o.date}`)
        );
        
        // Объединяем существующие и новые олимпиады
        olympiads = [...olympiads, ...newOlympiads];
        
        // Сохраняем в localStorage
        localStorage.setItem(`olympiads_${currentCity}`, JSON.stringify(olympiads));
        
        console.log(`Загружено ${newOlympiads.length} новых олимпиад`);
        console.log(`Всего олимпиад в календаре: ${olympiads.length}`);
        
        return { success: true, added: newOlympiads.length, total: olympiads.length };
    } catch (error) {
        console.error('Ошибка при загрузке февральских олимпиад:', error);
        return { success: false, error: error.message };
    }
}

// Автоматическая загрузка при первом запуске
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Проверяем, были ли уже загружены февральские данные
        const febLoaded = localStorage.getItem('february_2026_loaded');
        
        if (!febLoaded) {
            loadFebruaryOlympiads().then(result => {
                if (result.success) {
                    localStorage.setItem('february_2026_loaded', 'true');
                    console.log('Февральские олимпиады успешно загружены!');
                    if (result.added > 0) {
                        alert(`Добавлено ${result.added} олимпиад из февральского календаря!`);
                        // Перезагружаем страницу для отображения изменений
                        location.reload();
                    }
                }
            });
        }
    });
}

// Экспортируем функцию для ручного вызова
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadFebruaryOlympiads };
}