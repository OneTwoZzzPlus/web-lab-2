import TaskItem from "./TaskItem.js";
import TaskForm from "./TaskForm.js";

export default function TaskList(
    tasks,
    { onAdd, onEdit, onRemove, onToggle, onMove },
) {
    const wrapper = document.createElement("section");

    const taskAddButton = document.createElement("button");
    taskAddButton.type = "button";
    taskAddButton.classList.add("task-add");
    taskAddButton.textContent = "+ добавить задачу";

    const taskListWrapper = document.createElement("ul");
    taskListWrapper.classList.add("tasks");

    // Текущая активная форма (null, если форма не открыта)
    let activeForm = null;

    function closeForm() {
        if (!activeForm) return;

        activeForm.remove();
        activeForm = null;

        taskAddButton.hidden = false;
    }

    function openAddForm() {
        if (activeForm) return;

        taskAddButton.hidden = true;

        activeForm = TaskForm(
            {},
            {
                onSave: ({ title, date }) => {
                    closeForm();
                    onAdd(title, date);
                },

                onCancel: closeForm,
            },
        );

        taskListWrapper.prepend(activeForm);
    }

    function openEditForm(task, taskItem) {
        if (activeForm) return;

        taskAddButton.hidden = true;

        activeForm = TaskForm(
            {
                title: task.title,
                date: task.date,
            },
            {
                onSave: ({ title, date }) => {
                    closeForm();
                    onEdit(task.id, title, date);
                },

                onCancel: () => {
                    if (activeForm) {
                        // Возвращаем исходный элемент карточки задачи на место формы
                        taskListWrapper.replaceChild(taskItem, activeForm);
                        activeForm = null;
                        taskAddButton.hidden = false;
                    }
                },
            },
        );

        // Заменяем карточку задачи формой редактирования
        taskListWrapper.replaceChild(activeForm, taskItem);
    }

    taskAddButton.addEventListener("click", openAddForm);

    tasks.forEach((task, index) => {
        const taskItem = TaskItem(task.id, task, {
            onToggle,
            onRemove,

            onEdit: () => {
                openEditForm(task, taskItem);
            },

            onMoveUp: (id) => {
                if (activeForm) return;
                if (index > 0) {
                    const prevTaskId = tasks[index - 1].id;
                    onMove(id, prevTaskId);
                }
            },

            onMoveDown: (id) => {
                if (activeForm) return;
                if (index < tasks.length - 1) {
                    const nextTaskId = tasks[index + 1].id;
                    onMove(id, nextTaskId);
                }
            },

            onDrop: (draggedId, targetId) => {
                if (activeForm) return;
                onMove(draggedId, targetId);
            },
        });

        taskListWrapper.append(taskItem);
    });

    wrapper.append(taskAddButton, taskListWrapper);

    return wrapper;
}
