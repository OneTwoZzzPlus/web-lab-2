import TaskItem from "./TaskItem.js";

let editingTaskId = null;
let draggedTaskId = null;

export default function TaskList(
    tasks,
    { onAdd, onEdit, onRemove, onToggle, onMove },
) {
    const callbacks = { onAdd, onEdit, onRemove, onToggle, onMove };
    const wrapper = document.createElement("section");

    const taskAddButton = document.createElement("button");
    taskAddButton.classList.add("task-add");
    taskAddButton.textContent = "+ добавить задачу";

    const taskListWrapper = document.createElement("ul");
    taskListWrapper.classList.add("tasks");

    tasks.forEach(({ id, ...task }) => {
        taskListWrapper.append(TaskItem(id, task, callbacks));
    });

    wrapper.append(taskAddButton);
    wrapper.append(taskListWrapper);
    return wrapper;
}
