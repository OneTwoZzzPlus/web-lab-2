export default function Header({ onSearch, onFilter, onSort }) {
    const header = document.createElement("header");

    const title = document.createElement("h1");
    title.textContent = "Задачник+";
    header.append(title);

    header.append(Search({ onSearch }));

    const radios = document.createElement("div");
    radios.classList.add("radios");
    radios.append(Filter({ onFilter }));
    radios.append(Sort({ onSort }));
    header.append(radios);

    return header;
}

function Search({ onSearch }) {
    const search = document.createElement("div");
    search.classList.add("search");

    const label = document.createElement("label");
    label.htmlFor = "search";
    label.textContent = "Поиск задач";
    search.append(label);

    const input = document.createElement("input");
    input.type = "text";
    input.name = "search";
    input.id = "search";
    input.placeholder = "Поиск задач...";
    const handleSearch = () => {
        onSearch(input.value);
    };
    input.addEventListener("input", handleSearch);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleSearch();
    });
    search.append(input);

    const button = document.createElement("button");
    button.type = "button";
    button.ariaLabel = "Очистить поиск";
    const span = document.createElement("span");
    span.textContent = "×";
    button.append(span);
    button.addEventListener("click", () => {
        input.value = "";
        onSearch("");
    });
    search.append(button);

    return search;
}

function Filter({ onFilter }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("radio");

    const options = [
        { id: "all", value: "all", label: "Все" },
        { id: "active", value: "active", label: "Активные" },
        { id: "completed", value: "completed", label: "Выполненные" },
    ];

    options.forEach(({ id, value, label }) => {
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "status";
        input.id = id;
        input.value = value;
        input.checked = value === "all";

        input.addEventListener("change", () => {
            onFilter(input.value);
        });

        const text = document.createElement("label");
        text.htmlFor = id;
        text.textContent = label;

        wrapper.append(input, text);
    });

    return wrapper;
}

export function Sort({ onSort }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("radio");

    const options = [
        { id: "custom", value: "custom", label: "Вручную" },
        { id: "new", value: "new", label: "Ранние" },
        { id: "old", value: "old", label: "Поздние" },
    ];

    options.forEach(({ id, value, label }) => {
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "sort";
        input.id = id;
        input.value = value;
        input.checked = value === "custom";

        input.addEventListener("change", () => {
            onSort(input.value);
        });

        const text = document.createElement("label");
        text.htmlFor = id;
        text.textContent = label;

        wrapper.append(input, text);
    });

    return wrapper;
}
