export default function TaskItem(
    task_id,
    { title, date, completed },
    { onAdd, onEdit, onRemove, onToggle, onMove },
) {
    const wrapper = document.createElement("li");
    wrapper.classList.add("task");
    wrapper.draggable = true;
    wrapper["data-task-id"] = task_id;

    if (completed) wrapper.classList.add("checked");

    const titleNode = document.createElement("p");
    titleNode.textContent = title;
    wrapper.append(titleNode);

    const dateNode = document.createElement("p");
    dateNode.textContent = date;
    wrapper.append(dateNode);

    return wrapper;
}
