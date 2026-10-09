export default function TaskItem(
    taskId,
    { title, date, completed },
    { onToggle, onMoveUp, onMoveDown, onEdit, onRemove, onMove },
) {
    const wrapper = document.createElement("li");
    wrapper.classList.add("task");
    wrapper.dataset.taskId = taskId;

    if (completed) wrapper.classList.add("checked");

    const canReorder = Boolean(onMoveUp || onMoveDown || onMove);
    wrapper.draggable = canReorder;

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

    if (canReorder) {
        wrapper.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", taskId);
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => {
                wrapper.classList.add("dragging");
            }, 0);
        });

        wrapper.addEventListener("dragend", () => {
            wrapper.classList.remove("dragging");
            const virtual = document.querySelector(".task.virtual");
            if (virtual) virtual.remove();
        });

        let isTouching = false;
        let touchStartY = 0;

        wrapper.addEventListener(
            "touchstart",
            (e) => {
                if (e.target.closest("button")) return;

                isTouching = true;
                touchStartY = e.touches[0].clientY;

                setTimeout(() => {
                    if (isTouching) {
                        wrapper.classList.add("dragging");
                    }
                }, 150);
            },
            { passive: true },
        );

        wrapper.addEventListener(
            "touchmove",
            (e) => {
                if (!isTouching || !wrapper.classList.contains("dragging"))
                    return;

                const touch = e.touches[0];
                const touchY = touch.clientY;

                const elementBelow = document.elementFromPoint(
                    touch.clientX,
                    touchY,
                );
                if (!elementBelow) return;

                const targetTask = elementBelow.closest(
                    ".task:not(.dragging):not(.virtual)",
                );
                if (
                    targetTask &&
                    targetTask.parentNode === wrapper.parentNode
                ) {
                    const rect = targetTask.getBoundingClientRect();
                    const isAfter = touchY > rect.top + rect.height / 2;

                    targetTask.parentNode.insertBefore(
                        wrapper,
                        isAfter ? targetTask.nextSibling : targetTask,
                    );
                }
            },
            { passive: true },
        );

        const handleTouchEnd = () => {
            if (!isTouching) return;
            isTouching = false;

            const wasDragging = wrapper.classList.contains("dragging");
            wrapper.classList.remove("dragging");

            if (wasDragging && typeof onMove === "function") {
                const nextElement = wrapper.nextElementSibling;
                const targetId =
                    nextElement && nextElement.dataset
                        ? nextElement.dataset.taskId
                        : null;

                onMove(taskId, targetId, "before");
            }
        };

        wrapper.addEventListener("touchend", handleTouchEnd);
        wrapper.addEventListener("touchcancel", handleTouchEnd);
    }

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
    );

    if (onMoveUp) {
        wrapper.append(
            createButton("Переместить вверх", "assets/up.svg", onMoveUp),
        );
    }

    if (onMoveDown) {
        wrapper.append(
            createButton("Переместить вниз", "assets/down.svg", onMoveDown),
        );
    }

    wrapper.append(
        createButton("Редактировать", "assets/edit.svg", onEdit),
        createButton("Удалить", "assets/remove.svg", onRemove),
    );

    return wrapper;
}
