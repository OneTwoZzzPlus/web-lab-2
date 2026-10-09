import TaskItem from "./TaskItem.js";
import TaskForm from "./TaskForm.js";

function getDragAfterElement(container, y) {
    const draggableElements = [
        ...container.querySelectorAll(".task:not(.dragging):not(.virtual)"),
    ];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY },
    ).element;
}

export default function TaskList(
    tasks,
    { onAdd, onEdit, onRemove, onToggle, onMove, isSorted = false },
) {
    const wrapper = document.createElement("section");

    const taskAddButton = document.createElement("button");
    taskAddButton.type = "button";
    taskAddButton.classList.add("task-add");
    taskAddButton.textContent = "+ добавить задачу";

    const taskListWrapper = document.createElement("ul");
    taskListWrapper.classList.add("tasks");

    const virtualPlaceholder = document.createElement("li");
    virtualPlaceholder.classList.add("task", "virtual");
    virtualPlaceholder.style.pointerEvents = "none";

    function setupVirtualPlaceholder(sourceTask) {
        virtualPlaceholder.replaceChildren(
            ...Array.from(sourceTask.childNodes).map((node) =>
                node.cloneNode(true),
            ),
        );
        virtualPlaceholder.className = sourceTask.className;
        virtualPlaceholder.classList.add("virtual");
        virtualPlaceholder.style.pointerEvents = "none";
    }

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
                        taskListWrapper.replaceChild(taskItem, activeForm);
                        activeForm = null;
                        taskAddButton.hidden = false;
                    }
                },
            },
        );

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

            onMoveUp: isSorted
                ? null
                : (id) => {
                      if (activeForm) return;
                      if (index > 0) {
                          const prevTaskId = tasks[index - 1].id;
                          onMove(id, prevTaskId, "before");
                      }
                  },

            onMoveDown: isSorted
                ? null
                : (id) => {
                      if (activeForm) return;
                      if (index < tasks.length - 1) {
                          const nextTaskId = tasks[index + 1].id;
                          onMove(id, nextTaskId, "after");
                      }
                  },
        });

        taskListWrapper.append(taskItem);
    });

    if (!isSorted) {
        taskListWrapper.addEventListener("dragstart", (e) => {
            const draggedItem = e.target.closest(".task");
            if (!draggedItem || activeForm) return;

            e.dataTransfer.setData("text/plain", draggedItem.dataset.taskId);
            e.dataTransfer.effectAllowed = "move";

            setupVirtualPlaceholder(draggedItem);
            draggedItem.after(virtualPlaceholder);

            setTimeout(() => {
                draggedItem.classList.add("dragging");
            }, 0);
        });

        wrapper.addEventListener("dragover", (e) => {
            if (activeForm) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";

            const afterElement = getDragAfterElement(
                taskListWrapper,
                e.clientY,
            );
            if (afterElement == null) {
                taskListWrapper.append(virtualPlaceholder);
            } else {
                taskListWrapper.insertBefore(virtualPlaceholder, afterElement);
            }
        });

        wrapper.addEventListener("drop", (e) => {
            if (activeForm) return;
            e.preventDefault();

            const draggedId = e.dataTransfer.getData("text/plain");
            const nextElement = virtualPlaceholder.nextElementSibling;

            virtualPlaceholder.remove();
            const draggingEl = taskListWrapper.querySelector(".dragging");
            if (draggingEl) draggingEl.classList.remove("dragging");

            if (!draggedId) return;

            if (
                nextElement &&
                nextElement.dataset &&
                nextElement.dataset.taskId
            ) {
                onMove(draggedId, nextElement.dataset.taskId, "before");
            } else {
                onMove(draggedId, null);
            }
        });

        wrapper.addEventListener("dragend", () => {
            virtualPlaceholder.remove();
            const draggingEl = taskListWrapper.querySelector(".dragging");
            if (draggingEl) draggingEl.classList.remove("dragging");
        });

        let touchDraggedTask = null;
        let touchStartY = 0;
        let isTouchDragging = false;

        taskListWrapper.addEventListener(
            "touchstart",
            (e) => {
                if (activeForm) return;
                const taskItem = e.target.closest(".task");
                if (!taskItem || e.target.closest("button")) return;

                touchDraggedTask = taskItem;
                touchStartY = e.touches[0].clientY;
                isTouchDragging = false;
            },
            { passive: true },
        );

        taskListWrapper.addEventListener(
            "touchmove",
            (e) => {
                if (!touchDraggedTask) return;

                const touchY = e.touches[0].clientY;
                const moveDelta = Math.abs(touchY - touchStartY);

                if (!isTouchDragging && moveDelta > 5) {
                    isTouchDragging = true;
                    setupVirtualPlaceholder(touchDraggedTask);
                    touchDraggedTask.after(virtualPlaceholder);
                    touchDraggedTask.classList.add("dragging");
                }

                if (isTouchDragging) {
                    e.preventDefault();

                    const afterElement = getDragAfterElement(
                        taskListWrapper,
                        touchY,
                    );
                    if (afterElement == null) {
                        taskListWrapper.append(virtualPlaceholder);
                    } else {
                        taskListWrapper.insertBefore(
                            virtualPlaceholder,
                            afterElement,
                        );
                    }
                }
            },
            { passive: false },
        );

        const handleTouchEnd = () => {
            if (!touchDraggedTask) return;

            if (isTouchDragging) {
                const nextElement = virtualPlaceholder.nextElementSibling;
                const targetId =
                    nextElement && nextElement.dataset
                        ? nextElement.dataset.taskId
                        : null;
                const draggedId = touchDraggedTask.dataset.taskId;

                virtualPlaceholder.remove();
                touchDraggedTask.classList.remove("dragging");

                onMove(draggedId, targetId, "before");
            }

            touchDraggedTask = null;
            isTouchDragging = false;
        };

        taskListWrapper.addEventListener("touchend", handleTouchEnd);
        taskListWrapper.addEventListener("touchcancel", handleTouchEnd);
    }

    wrapper.append(taskAddButton, taskListWrapper);

    return wrapper;
}
