import { store } from "./store.js";
import Header from "./components/Header.js";
import TaskList from "./components/TaskList.js";

function head() {
    document.documentElement.setAttribute("lang", "ru");

    // <meta charset="UTF-8">
    const metaCharset = document.createElement("meta");
    metaCharset.setAttribute("charset", "UTF-8");
    document.head.append(metaCharset);

    // <meta name="viewport" content="width=device-width, initial-scale=1.0">
    const metaViewport = document.createElement("meta");
    metaViewport.setAttribute("name", "viewport");
    metaViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0",
    );
    document.head.append(metaViewport);

    // <title>Задачник+</title>
    const title = document.createElement("title");
    title.textContent = "Задачник+";
    document.head.append(title);

    // <link rel="stylesheet" href="style.css">
    const linkStyle = document.createElement("link");
    linkStyle.setAttribute("rel", "stylesheet");
    linkStyle.setAttribute("href", "style.css");
    document.head.append(linkStyle);

    // <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    const linkFavicon = document.createElement("link");
    linkFavicon.setAttribute("rel", "icon");
    linkFavicon.setAttribute("type", "image/svg+xml");
    linkFavicon.setAttribute("href", "assets/favicon.svg");
    document.head.append(linkFavicon);
}

head();

const state = {
    search: "",
    filter: "all",
    sort: "custom",
};

const header = Header({
    onSearch: (value) => {
        state.search = value;
        renderTaskList();
    },
    onFilter: (value) => {
        state.filter = value;
        renderTaskList();
    },
    onSort: (value) => {
        state.sort = value;
        renderTaskList();
    },
});

const taskListContainer = document.createElement("main");
document.body.append(header, taskListContainer);

function getVisibleTasks() {
    const { tasks, order } = store.getData();

    let result = order
        .filter((id) => tasks[id])
        .map((id) => ({ id, ...tasks[id] }));

    if (state.search.trim()) {
        const query = state.search.trim().toLowerCase();
        result = result.filter((task) =>
            task.title.toLowerCase().includes(query),
        );
    }

    if (state.filter === "active") {
        result = result.filter((task) => !task.completed);
    } else if (state.filter === "completed") {
        result = result.filter((task) => task.completed);
    }

    if (state.sort === "new") {
        result.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (state.sort === "old") {
        result.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
    }

    return result;
}

function renderTaskList() {
    const tasks = getVisibleTasks();
    const isSorted = state.sort !== "custom";

    const taskList = TaskList(tasks, {
        isSorted,
        onAdd: (title, date) => {
            store.add(title, date);
        },
        onEdit: (id, title, date) => {
            store.edit(id, title, date);
        },
        onRemove: (id) => {
            store.remove(id);
        },
        onToggle: (id) => {
            store.toggle(id);
        },
        onMove: (draggedId, targetId, position) => {
            if (isSorted) return;
            store.move(draggedId, targetId, position);
        },
    });

    taskListContainer.replaceChildren(taskList);
}

store.load();
store.subscribe(renderTaskList);

renderTaskList();
