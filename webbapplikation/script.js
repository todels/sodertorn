// Globala variabler
let usersList = []; // Lista med alla användare

// Hämta referenser till DOM-element
const taskTableBody = document.getElementById("taskTableBody");
const addTaskBtn = document.getElementById("addTaskBtn");

// Ladda användarlistan från servern
function loadUsers() {
  fetch("?action=list_users")
    .then((response) => response.json())
    .then((data) => {
      usersList = data;
      loadTasks(); // När användarna är laddade, ladda tasks
    })
    .catch((err) => console.error(err));
}

// 1) Ladda alla tasks
function loadTasks() {
  fetch("?action=list")
    .then((response) => response.json())
    .then((data) => {
      taskTableBody.innerHTML = ""; // Rensa tabellen
      data.forEach((task) => {
        addTaskRow(task);
      });
    })
    .catch((err) => console.error(err));
}

// Skapar en rad i tabellen för varje task
function addTaskRow(task) {
  const tr = document.createElement("tr");

  // Namn
  const tdName = document.createElement("td");
  const inputName = document.createElement("input");
  inputName.type = "text";
  inputName.value = task.name;
  inputName.className = "edit-field";
  inputName.addEventListener("change", () => {
    updateTask(
      task.id,
      inputName.value,
      inputDueDate.value,
      checkboxCompleted.checked,
      selectUser.value
    );
  });
  tdName.appendChild(inputName);
  tr.appendChild(tdName);

  // Datum
  const tdDate = document.createElement("td");
  const inputDueDate = document.createElement("input");
  inputDueDate.type = "date";
  inputDueDate.value = task.due_date;
  inputDueDate.className = "edit-field";
  inputDueDate.addEventListener("change", () => {
    updateTask(
      task.id,
      inputName.value,
      inputDueDate.value,
      checkboxCompleted.checked,
      selectUser.value
    );
  });
  tdDate.appendChild(inputDueDate);
  tr.appendChild(tdDate);

  // Completed (checkbox)
  const tdCompleted = document.createElement("td");
  const checkboxCompleted = document.createElement("input");
  checkboxCompleted.type = "checkbox";
  checkboxCompleted.checked = task.completed == 1;
  checkboxCompleted.addEventListener("change", () => {
    updateTask(
      task.id,
      inputName.value,
      inputDueDate.value,
      checkboxCompleted.checked,
      selectUser.value
    );
  });
  tdCompleted.appendChild(checkboxCompleted);
  tr.appendChild(tdCompleted);

  // Användare (dropdown)
  const tdUser = document.createElement("td");
  const selectUser = document.createElement("select");
  selectUser.className = "user-select"; // Add a class for better styling
  
  // Make sure usersList exists and has items
  if (usersList && usersList.length > 0) {
    usersList.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.full_name;
      // Sätt default värde om matchar task.user_id
      if (parseInt(task.user_id) === parseInt(user.id)) {
        option.selected = true;
      }
      selectUser.appendChild(option);
    });
  } else {
    // Fallback if usersList is empty
    const option = document.createElement("option");
    option.value = task.user_id || 1;
    option.textContent = task.full_name || "Unknown User";
    option.selected = true;
    selectUser.appendChild(option);
    
    // Try to reload users
    loadUsers();
  }
  
  selectUser.addEventListener("change", () => {
    updateTask(
      task.id,
      inputName.value,
      inputDueDate.value,
      checkboxCompleted.checked,
      selectUser.value
    );
  });
  tdUser.appendChild(selectUser);
  tr.appendChild(tdUser);

  // Radera-knapp
  const tdDelete = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Radera";
  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id);
  });
  tdDelete.appendChild(deleteBtn);
  tr.appendChild(tdDelete);

  taskTableBody.appendChild(tr);
}

// 2) Uppdatera en task (inklusive user_id)
function updateTask(id, name, due_date, completed, user_id) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("name", name);
  formData.append("due_date", due_date);
  formData.append("completed", completed);
  formData.append("user_id", user_id);

  fetch("?action=update", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        alert("Kunde inte uppdatera tasken!");
      }
    })
    .catch((err) => console.error(err));
}

// 3) Radera en task
function deleteTask(id) {
  if (!confirm("Är du säker på att du vill radera denna task?")) return;

  const formData = new FormData();
  formData.append("id", id);

  fetch("?action=delete", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadTasks();
      } else {
        alert("Kunde inte radera tasken!");
      }
    })
    .catch((err) => console.error(err));
}

// 4) Lägg till en ny task
addTaskBtn.addEventListener("click", () => {
  fetch("?action=add")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadTasks();
      } else {
        alert("Kunde inte lägga till en ny task!");
      }
    })
    .catch((err) => console.error(err));
});

// Ladda användare och tasks vid sidstart
loadUsers();