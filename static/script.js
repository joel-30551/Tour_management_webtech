// ---------- GLOBALS ----------
let tours = JSON.parse(localStorage.getItem("tours")) || [];
const rowsPerPage = 5;
let currentPage = 1;

// ---------- ELEMENTS ----------
const tourTableBody = document.getElementById("tourTableBody");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

const formPopup = document.getElementById("formPopup");
const closePopup = document.getElementById("closePopup");
const addTourBtn = document.getElementById("addTourBtn");
const cancelBtn = document.getElementById("cancelBtn");
const tourForm = document.getElementById("tourForm");
const editModeField = document.getElementById("editMode");

const confirmationBox = document.getElementById("confirmationBox");
const tourIdField = document.getElementById("tourId");

// ---------- UTILITIES ----------
function saveToLocalStorage() {
  localStorage.setItem("tours", JSON.stringify(tours));
}

function showToast(message, color = "#4CAF50") {
  confirmationBox.innerText = message;
  confirmationBox.style.display = "block";
  confirmationBox.style.background = color;
  setTimeout(() => (confirmationBox.style.display = "none"), 2500);
}

function generateTourId() {
  const lastId =
    tours.length > 0
      ? Math.max(...tours.map(t => parseInt(t.tourId.replace("T", ""))))
      : 0;
  const newId = lastId + 1;
  return "T" + String(newId).padStart(3, "0");
}

function isTourIdUnique(id) {
  return !tours.some(t => t.tourId === id);
}

// ---------- TABLE RENDER ----------
function renderTable() {
  const query = searchInput.value.toLowerCase();
  const filteredTours = tours.filter(t =>
    Object.values(t).some(val => val.toString().toLowerCase().includes(query))
  );

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageTours = filteredTours.slice(start, end);

  tourTableBody.innerHTML = "";

  pageTours.forEach(tour => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tour.tourId}</td>
      <td>${tour.name}</td>
      <td>${tour.destination}</td>
      <td>${tour.startDate}</td>
      <td>${tour.endDate}</td>
      <td>${tour.price}</td>
      <td>${tour.tourGuide}</td>
      <td class="actions">
        <button onclick="editTour(${tours.indexOf(tour)})">Edit</button>
        <button onclick="deleteTour(${tours.indexOf(tour)})">Delete</button>
      </td>
    `;
    tourTableBody.appendChild(row);
  });

  renderPagination(filteredTours.length);
}

// ---------- PAGINATION ----------
function renderPagination(totalItems) {
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const prevBtn = document.createElement("button");
  prevBtn.innerText = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderTable(); };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => { currentPage = i; renderTable(); };
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.innerText = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  pagination.appendChild(nextBtn);
}

// ---------- CRUD ----------
function addTour(tour) {
  tours.push(tour);
  saveToLocalStorage();
  renderTable();
  showToast("✅ Tour added!");
}

function editTour(index) {
  const tour = tours[index];
  editModeField.value = index;
  tourIdField.value = tour.tourId;
  tourIdField.readOnly = true;

  document.getElementById("name").value = tour.name;
  document.getElementById("destination").value = tour.destination;
  document.getElementById("startDate").value = tour.startDate;
  document.getElementById("endDate").value = tour.endDate;
  document.getElementById("price").value = tour.price;
  document.getElementById("tourGuide").value = tour.tourGuide;

  document.getElementById("formTitle").innerText = "Edit Tour";
  formPopup.style.display = "flex";
}

function updateTour(index, updatedTour) {
  tours[index] = updatedTour;
  saveToLocalStorage();
  renderTable();
  showToast("✏️ Tour updated!");
}

function deleteTour(index) {
  if (confirm("Are you sure you want to delete this tour?")) {
    tours.splice(index, 1);
    saveToLocalStorage();
    renderTable();
    showToast("🗑️ Tour deleted!", "#FF7043");
  }
}

// ---------- FORM HANDLING ----------
addTourBtn.onclick = () => {
  editModeField.value = "false";
  tourForm.reset();
  document.getElementById("formTitle").innerText = "Add New Tour";
  tourIdField.value = generateTourId();
  tourIdField.readOnly = false;
  formPopup.style.display = "flex";
};

closePopup.onclick = () => (formPopup.style.display = "none");
cancelBtn.onclick = () => (formPopup.style.display = "none");

tourForm.onsubmit = (e) => {
  e.preventDefault();
  const newTour = {
    tourId: tourIdField.value,
    name: document.getElementById("name").value,
    destination: document.getElementById("destination").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    price: document.getElementById("price").value,
    tourGuide: document.getElementById("tourGuide").value,
  };

  if (!isTourIdUnique(newTour.tourId) && editModeField.value === "false") {
    alert("Tour ID must be unique!");
    return;
  }

  if (editModeField.value === "false") addTour(newTour);
  else updateTour(Number(editModeField.value), newTour);

  formPopup.style.display = "none";
  tourForm.reset();
};

// ---------- SEARCH ----------
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

// ---------- INIT ----------
renderTable();
