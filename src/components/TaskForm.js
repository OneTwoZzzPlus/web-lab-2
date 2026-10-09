export default function TaskForm(
    { title = "", date = "" } = {},
    { onSave, onCancel },
) {
    const wrapper = document.createElement("li");
    wrapper.classList.add("task");
    wrapper.draggable = false;

    const form = document.createElement("form");

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.name = "title";
    titleInput.placeholder = "Название задачи...";
    titleInput.required = true;
    titleInput.value = title;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.name = "date";
    dateInput.value = date;

    const buttonsWrapper = document.createElement("div");

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Сохранить";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Отмена";

    buttonsWrapper.append(saveButton, cancelButton);
    form.append(titleInput, dateInput, buttonsWrapper);
    wrapper.append(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        onSave({
            title: titleInput.value.trim(),
            date: dateInput.value,
        });
    });

    cancelButton.addEventListener("click", () => {
        onCancel();
    });

    return wrapper;
}
