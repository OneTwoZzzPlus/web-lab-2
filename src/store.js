const tasks = {};
const order = [];
const listeners = new Set();

const load = () => {
    for (const key in tasks) {
        delete tasks[key];
    }
    order.length = 0;

    const rawTasks = localStorage.getItem("todo:tasks");
    if (rawTasks) {
        try {
            Object.assign(tasks, JSON.parse(rawTasks));
        } catch (e) {
            console.error("Ошибка чтения todo:tasks из localStorage", e);
        }
    }

    const rawOrder = localStorage.getItem("todo:order");
    if (rawOrder) {
        try {
            const parsedOrder = JSON.parse(rawOrder);
            if (Array.isArray(parsedOrder)) {
                order.push(...parsedOrder);
            }
        } catch (e) {
            console.error("Ошибка чтения todo:order из localStorage", e);
        }
    }

    for (let i = order.length - 1; i >= 0; i--) {
        if (!tasks[order[i]]) {
            order.splice(i, 1);
        }
    }
    Object.keys(tasks).forEach((id) => {
        if (!order.includes(id)) {
            order.push(id);
        }
    });

    return { tasks, order };
};

const save = () => {
    localStorage.setItem("todo:tasks", JSON.stringify(tasks));
    localStorage.setItem("todo:order", JSON.stringify(order));
};

const notify = () => {
    listeners.forEach((handler) => handler({ tasks, order }));
};

const commit = () => {
    save();
    notify();
};

export const store = {
    load,
    getTasks() {
        return { ...tasks };
    },
    getOrder() {
        return [...order];
    },
    getData() {
        return { tasks, order };
    },
    subscribe(handler) {
        listeners.add(handler);
        return () => listeners.delete(handler);
    },
    add(title, date) {
        const id = crypto.randomUUID();

        tasks[id] = {
            title,
            date,
            completed: false,
        };
        order.push(id);

        commit();
        return id;
    },
    edit(id, title, date) {
        const task = tasks[id];
        if (!task) return;

        task.title = title;
        task.date = date;

        commit();
    },
    remove(id) {
        if (!tasks[id]) return;

        delete tasks[id];

        const index = order.indexOf(id);
        if (index !== -1) order.splice(index, 1);

        commit();
    },
    toggle(id) {
        const task = tasks[id];
        if (!task) return;

        task.completed = !task.completed;

        commit();
    },
    move(draggedId, targetId, position = "before") {
        const oldIndex = order.indexOf(draggedId);
        if (oldIndex === -1) return;

        order.splice(oldIndex, 1);

        if (!targetId) {
            order.push(draggedId);
        } else {
            const targetIndex = order.indexOf(targetId);
            if (targetIndex !== -1) {
                const insertIndex =
                    position === "after" ? targetIndex + 1 : targetIndex;
                order.splice(insertIndex, 0, draggedId);
            } else {
                order.push(draggedId);
            }
        }

        commit();
    },
};
