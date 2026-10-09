export default function TaskItem(
    taskId,
    { title, date, completed },
    { onToggle, onMoveUp, onMoveDown, onEdit, onRemove, onDrop },
) {
    const wrapper = document.createElement("li");
    wrapper.classList.add("task");
    wrapper.draggable = true;
    wrapper.dataset.taskId = taskId;

    if (completed) wrapper.classList.add("checked");

    const titleNode = document.createElement("p");
    titleNode.textContent = title;

    const dateNode = document.createElement("p");
    dateNode.textContent = date || "";

    const control = TaskControlPanel(taskId, completed, {
        onToggle,
        onMoveUp,
        onMoveDown,
        onEdit,
        onRemove,
    });

    wrapper.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", taskId);
        e.dataTransfer.effectAllowed = "move";
        wrapper.classList.add("dragging");
    });

    wrapper.addEventListener("dragend", () => {
        wrapper.classList.remove("dragging");
    });

    wrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        wrapper.classList.add("drag-over");
    });

    wrapper.addEventListener("dragleave", () => {
        wrapper.classList.remove("drag-over");
    });

    wrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        wrapper.classList.remove("drag-over");

        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId && draggedId !== taskId && onDrop) {
            onDrop(draggedId, taskId);
        }
    });

    wrapper.append(titleNode, dateNode, control);

    return wrapper;
}

function TaskControlPanel(
    taskId,
    completed,
    { onToggle, onMoveUp, onMoveDown, onEdit, onRemove },
) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("iconic-wrapper");

    const createButton = (label, src, handler) => {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("iconic");
        button.setAttribute("aria-label", label);

        const image = document.createElement("img");
        image.alt = "";
        image.src = src;

        button.append(image);
        button.addEventListener("click", () => handler(taskId));

        return button;
    };

    wrapper.append(
        createButton(
            completed ? "Отметить активной" : "Отметить выполненной",
            completed ? "assets/completed.svg" : "assets/active.svg",
            onToggle,
        ),
        createButton("Переместить вверх", "assets/up.svg", onMoveUp),
        createButton("Переместить вниз", "assets/down.svg", onMoveDown),
        createButton("Редактировать", "assets/edit.svg", onEdit),
        createButton("Удалить", "assets/remove.svg", onRemove),
    );

    return wrapper;
}
