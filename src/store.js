const tasks = {};
const order = [];
const listeners = new Set();

const load = () => {
    const rawTasks = localStorage.getItem("todo:tasks");
    const parsedTasks = rawTasks ? JSON.parse(rawTasks) : {};
    Object.assign(tasks, parsedTasks);

    const rawOrder = localStorage.getItem("todo:order");
    const parsedOrder = rawOrder ? JSON.parse(rawOrder) : [];
    Object.assign(order, parsedOrder);

    return { tasks: tasks, order: order };
};

const save = () => {
    localStorage.setItem("todo:tasks", JSON.stringify(tasks));
    localStorage.setItem("todo:order", JSON.stringify(order));
};

const notify = () => {
    listeners.forEach((handler) => handler({ tasks: tasks, order: order }));
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
    move(id, newIndex) {
        const oldIndex = order.indexOf(id);
        if (oldIndex === -1) return;

        newIndex = Math.max(0, Math.min(newIndex, tasks.length - 1));

        if (oldIndex === newIndex) return;

        order.splice(oldIndex, 1);
        order.splice(newIndex, 0, id);

        commit();
    },
};
