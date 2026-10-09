import Header from "./components/Header.js";

document.body.append(
    Header({
        onSearch: (value) => console.log("Поиск:", value),
        onFilter: (value) => console.log("Фильтр:", value),
        onSort: (value) => console.log("Сортировка:", value),
    }),
);
