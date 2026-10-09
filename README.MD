# Список задач

[ТЗ на работу](https://github.com/Dasha2101/WEB2025Q26LB2) ●
[Развернутая страница](onetwozzzplus.github.io/web-lab-2)

[![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Запуск

Запустить простой http сервер, например `python3 -m http.server 8000` или vscode live server, открыть сайт.

## Структура проекта

```text
/
├── index.html              # HTML (подключение скрипта)
├── style.css               # CSS (стили)
├── assets/                 # Иконки
└── src/
    ├── main.js             # Точка входа и фильтры
    ├── store.js            # Хранилище задач
    ├── head.js             # Заполнение html/head
    └── components
        ├── Header.js       # Рендер фильтров
        ├── TaskList.js     # Рендер списка
        ├── TaskItem.js     # Рендер задачи
        └── TaskForm.js     # Рендер изменения задачи
```

## Схема работы

### Основные компоненты

- **`main.js`**: точка входа, хранит локальное состояние фильтров (`search`, `filter`, `sort`), применяет поиск/сортировку к массиву `order` и вызывает полный перерендер `TaskList`.
- **`head.js`**: подключает заголовок, иконку, стили и мета-информацию.
- **`Header.js`**: рендерит шапку с инпутом поиска и радио-кнопками фильтрации/сортировки.
- **`TaskItem.js`**: карточка задачи. Выводит заголовок, дату и кнопки управления (вверх/вниз, чекбокс, редактировать, удалить).
- **`TaskForm.js`**: простая инлайн-форма с полями `title` и `date` для добавления/редактирования.

### Поток данных (Store & Pub/Sub)

Данные живут в `store.js`:

- `tasks` — хэш-таблица объектов по `UUID`.
- `order` — массив `UUID`, определяющий порядок задач.

Хранилище работает по подписке. Любое изменение (`add`, `edit`, `remove`, `move`, `toggle`) вызывает `commit()`, который синхронизирует состояние с `localStorage` и оповещает подписчиков.

```mermaid
flowchart TD
    User["Действие пользователя"] --> Store["store.js"]
    Store -- "save()" --> LS[("localStorage")]
    Store -- "notify() / subscribe()" --> Main["main.js"]
    Main --> Visible["getVisibleTasks & renderTaskList"]
```

### Компонент TaskList

Основной контейнер интерфейса. Отвечает за рендеринг списка, управление формами и перетаскивание (DnD).

#### Контроль форм

В один момент времени может быть открыта **только одна** форма (создания или редактирования).

- При открытии формы скрывается кнопка `+ добавить задачу`.
- Если открыта форма, события перетаскивания и создание других форм блокируются.

#### Drag-and-Drop (Desktop + Touch)

Сортировка перетаскиванием работает **только** при режиме сортировки «вручную» (`isSorted = false`).

1. **Desktop:** используется нативный Drag and Drop API (`dragstart`, `dragover`, `drop`, `dragend`).
2. **Touch (мобилки):** самописная обработка `touchstart`, `touchmove`, `touchend` с порогом сдвига `> 5px` (чтобы не перехватывать обычный скролл).
3. **Placeholder:** во время перетаскивания создается фантомный элемент `.virtual`. Позиция вставки вычисляется функцией `getDragAfterElement()` на основе Y-координаты курсора/пальца относительно центров соседних элементов.

```mermaid
sequenceDiagram
    autonumber
    actor U as Пользователь
    participant DOM as Список задач (DOM)
    participant Ghost as Фантом (.virtual)
    participant Store as Хранилище (store.js)

    U->>DOM: 1. Зажал карточку задачи
    DOM->>Ghost: Вставить серый фантом рядом с карточкой

    U->>DOM: 2. Ведёт палец / мышь по списку
    DOM->>Ghost: Перепрыгнуть на ближайшее место (по координате Y)

    U->>DOM: 3. Отпустил карточку
    DOM->>Ghost: Удалить фантом
    DOM->>Store: store.move(draggedId, targetId) — сохранить новый порядок
```
