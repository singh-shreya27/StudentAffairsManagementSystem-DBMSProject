const API_BASE_URL = "http://localhost:3000/api";

// Loader and notification functions - defined early to ensure availability
function showLoader(message = "Loading...") {
  console.log("showLoader called with message:", message);
  const existingLoader = document.getElementById("globalLoader");
  if (existingLoader) {
    existingLoader.remove();
  }

  const loader = document.createElement("div");
  loader.id = "globalLoader";
  loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            ">
                <div style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <div style="color: #333; font-size: 16px;">${message}</div>
            </div>
        </div>
    `;

  document.body.appendChild(loader);
}

function hideLoader() {
  console.log("hideLoader called");
  const loader = document.getElementById("globalLoader");
  if (loader) {
    loader.remove();
  }
}

function showNotification(message, type = "info") {
  console.log("showNotification called with message:", message, "type:", type);
  const notification = document.createElement("div");

  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 300px;
        word-wrap: break-word;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Global data store
let globalData = {
  students: [],
  departments: [],
  staff: [],
  hostels: [],
  rooms: [],
  mess: [],
  events: [],
  organizations: [],
  placements: [],
  payments: [],
  feedback: [],
  alumni: [],
  disciplinary: [],
  memberships: [],
  eventParticipation: [],
};

// Helper function for authenticated API requests
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Try auto-login if no token
    console.log("No token found, attempting auto-login...");
    const loginSuccess = await autoLogin();
    if (!loginSuccess) {
      showLoginModal();
      throw new Error("No authentication token found");
    }
  }

  const currentToken = localStorage.getItem("token");
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      localStorage.removeItem("token");
      showLoginModal();
      throw new Error("Authentication failed");
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Auto-login for testing purposes
async function autoLogin() {
  try {
    console.log("Attempting auto-login with admin credentials...");
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    console.log("Auto-login response status:", response.status);
    const data = await response.json();
    console.log("Auto-login response data:", data);

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      hideLoginModal();
      console.log(
        "Auto-login successful, token stored:",
        data.token.substring(0, 20) + "..."
      );
      return true;
    } else {
      console.log("Auto-login failed:", data.message || "Unknown error");
      return false;
    }
  } catch (error) {
    console.error("Auto-login error:", error);
    return false;
  }
}

// Authentication functions
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page loaded, checking authentication...");
  console.log("showLoader function available:", typeof showLoader);
  console.log("hideLoader function available:", typeof hideLoader);
  console.log("showNotification function available:", typeof showNotification);

  const token = localStorage.getItem("token");
  if (token) {
    console.log("Token found in localStorage:", token.substring(0, 20) + "...");
    hideLoginModal();
    loadTabData("dashboard");
  } else {
    console.log("No token found, attempting auto-login...");
    // Try auto-login for testing
    const loginSuccess = await autoLogin();
    if (loginSuccess) {
      console.log("Auto-login successful, loading dashboard...");
      loadTabData("dashboard");
    } else {
      console.log("Auto-login failed, showing login modal...");
      showLoginModal();
    }
  }

  setupEventListeners();
  setupFormEventListeners();
});

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Tab switching
  document.querySelectorAll(".nav-link[data-tab]").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(button.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  document
    .querySelectorAll(".nav-link[data-tab]")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to clicked tab and corresponding content
  const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(tabName);

  if (activeButton && activeContent) {
    activeButton.classList.add("active");
    activeContent.classList.add("active");
    loadTabData(tabName);
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("loginError");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      hideLoginModal();
      loadTabData("dashboard");
    } else {
      errorDiv.textContent = data.message || "Login failed";
      errorDiv.style.display = "block";
    }
  } catch (error) {
    errorDiv.textContent = "Network error. Please try again.";
    errorDiv.style.display = "block";
  }
}

function showLoginModal() {
  document.getElementById("loginModal").style.display = "block";
  document.getElementById("mainApp").style.display = "none";
}

function hideLoginModal() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

function logout() {
  localStorage.removeItem("token");
  showLoginModal();
}

// Data loading functions
async function loadTabData(tabName) {
  try {
    switch (tabName) {
      case "dashboard":
        await loadDashboardData();
        break;
      case "students":
        await loadStudents();
        break;
      case "departments":
        await loadDepartments();
        break;
      case "staff":
        await loadStaff();
        break;
      case "hostels":
        await loadHostels();
        break;
      case "rooms":
        await loadRooms();
        break;
      case "mess":
        await loadMess();
        break;
      case "events":
        await loadEvents();
        break;
      case "organizations":
        await loadOrganizations();
        break;
      case "placements":
        await loadPlacements();
        break;
      case "payments":
        await loadPayments();
        break;
      case "feedback":
        await loadFeedback();
        break;
      case "alumni":
        await loadAlumni();
        break;
      case "disciplinary":
        await loadDisciplinary();
        break;
    }
  } catch (error) {
    console.error(`Error loading ${tabName} data:`, error);
    showErrorMessage(`Failed to load ${tabName} data. Please try again.`);
  }
}

async function loadDashboardData() {
  try {
    // Load basic data for dashboard
    await Promise.all([
      loadStudents(true),
      loadEvents(true),
      loadPayments(true),
      loadDepartments(true),
    ]);

    updateDashboardStats();
    updateDashboardCharts();
  } catch (error) {
    console.error("Dashboard loading error:", error);
  }
}

async function loadStudents(isDashboard = false) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/students`);
    const students = await response.json();

    globalData.students = Array.isArray(students) ? students : [];

    if (!isDashboard) {
      displayStudents(globalData.students);
      populateDepartmentFilter();
    }

    return globalData.students;
  } catch (error) {
    console.error("Error loading students:", error);
    if (!isDashboard) {
      document.getElementById("studentsTableBody").innerHTML =
        '<tr><td colspan="7">Error loading students data</td></tr>';
    }
    return [];
  }
}

async function loadDepartments(isDashboard = false) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/departments`);
    const departments = await response.json();

    globalData.departments = Array.isArray(departments) ? departments : [];

    if (!isDashboard) {
      displayDepartments(globalData.departments);
    }

    return globalData.departments;
  } catch (error) {
    console.error("Error loading departments:", error);
    if (!isDashboard) {
      document.getElementById("departmentsTableBody").innerHTML =
        '<tr><td colspan="4">Error loading departments data</td></tr>';
    }
    return [];
  }
}

async function loadStaff() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/staff`);
    const staff = await response.json();

    globalData.staff = Array.isArray(staff) ? staff : [];
    displayStaff(globalData.staff);

    return globalData.staff;
  } catch (error) {
    console.error("Error loading staff:", error);
    document.getElementById("staffTableBody").innerHTML =
      '<tr><td colspan="6">Error loading staff data</td></tr>';
    return [];
  }
}

async function loadHostels() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/hostels`);
    const hostels = await response.json();

    globalData.hostels = Array.isArray(hostels) ? hostels : [];
    displayHostels(globalData.hostels);

    return globalData.hostels;
  } catch (error) {
    console.error("Error loading hostels:", error);
    document.getElementById("hostelsTableBody").innerHTML =
      '<tr><td colspan="4">Error loading hostels data</td></tr>';
    return [];
  }
}

async function loadRooms() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/rooms`);
    const rooms = await response.json();

    globalData.rooms = Array.isArray(rooms) ? rooms : [];
    displayRooms(globalData.rooms);

    return globalData.rooms;
  } catch (error) {
    console.error("Error loading rooms:", error);
    document.getElementById("roomsTableBody").innerHTML =
      '<tr><td colspan="7">Error loading rooms data</td></tr>';
    return [];
  }
}

async function loadMess() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/mess`);
    const mess = await response.json();

    globalData.mess = Array.isArray(mess) ? mess : [];
    displayMess(globalData.mess);

    return globalData.mess;
  } catch (error) {
    console.error("Error loading mess:", error);
    document.getElementById("messTableBody").innerHTML =
      '<tr><td colspan="4">Error loading mess data</td></tr>';
    return [];
  }
}

async function loadEvents() {
  try {
    const [eventsResponse, orgsResponse] = await Promise.all([
      authenticatedFetch(`${API_BASE_URL}/events`),
      authenticatedFetch(`${API_BASE_URL}/organizations`),
    ]);

    const events = await eventsResponse.json();
    const organizations = await orgsResponse.json();

    globalData.events = Array.isArray(events) ? events : [];
    globalData.organizations = Array.isArray(organizations)
      ? organizations
      : [];

    displayEvents(globalData.events);

    return globalData.events;
  } catch (error) {
    console.error("Error loading events:", error);
    document.getElementById("eventsTableBody").innerHTML =
      '<tr><td colspan="9">Error loading events data</td></tr>';
    return [];
  }
}

async function loadOrganizations() {
  try {
    const [orgsResponse, membershipsResponse, eventsResponse] =
      await Promise.all([
        authenticatedFetch(`${API_BASE_URL}/organizations`),
        authenticatedFetch(`${API_BASE_URL}/memberships`),
        authenticatedFetch(`${API_BASE_URL}/events`),
      ]);

    const organizations = await orgsResponse.json();
    const memberships = await membershipsResponse.json();
    const events = await eventsResponse.json();

    globalData.organizations = Array.isArray(organizations)
      ? organizations
      : [];
    globalData.memberships = Array.isArray(memberships) ? memberships : [];
    globalData.events = Array.isArray(events) ? events : [];

    displayOrganizations(globalData.organizations);

    return globalData.organizations;
  } catch (error) {
    console.error("Error loading organizations:", error);
    document.getElementById("organizationsTableBody").innerHTML =
      '<tr><td colspan="8">Error loading organizations data</td></tr>';
    return [];
  }
}

async function loadPlacements() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/placements`);
    const placements = await response.json();

    globalData.placements = Array.isArray(placements) ? placements : [];
    displayPlacements(globalData.placements);

    return globalData.placements;
  } catch (error) {
    console.error("Error loading placements:", error);
    document.getElementById("placementsTableBody").innerHTML =
      '<tr><td colspan="8">Error loading placements data</td></tr>';
    return [];
  }
}

async function loadPayments(isDashboard = false) {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/payments`);
    const payments = await response.json();

    globalData.payments = Array.isArray(payments) ? payments : [];

    if (!isDashboard) {
      displayPayments(globalData.payments);
    }

    return globalData.payments;
  } catch (error) {
    console.error("Error loading payments:", error);
    if (!isDashboard) {
      document.getElementById("paymentsTableBody").innerHTML =
        '<tr><td colspan="8">Error loading payments data</td></tr>';
    }
    return [];
  }
}

async function loadFeedback() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/feedback`);
    const feedback = await response.json();

    globalData.feedback = Array.isArray(feedback) ? feedback : [];
    displayFeedback(globalData.feedback);

    return globalData.feedback;
  } catch (error) {
    console.error("Error loading feedback:", error);
    document.getElementById("feedbackTableBody").innerHTML =
      '<tr><td colspan="7">Error loading feedback data</td></tr>';
    return [];
  }
}

async function loadAlumni() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/alumni`);
    const alumni = await response.json();

    globalData.alumni = Array.isArray(alumni) ? alumni : [];
    displayAlumni(globalData.alumni);

    return globalData.alumni;
  } catch (error) {
    console.error("Error loading alumni:", error);
    document.getElementById("alumniTableBody").innerHTML =
      '<tr><td colspan="7">Error loading alumni data</td></tr>';
    return [];
  }
}

async function loadDisciplinary() {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/disciplinary-actions`
    );
    const disciplinary = await response.json();

    globalData.disciplinary = Array.isArray(disciplinary) ? disciplinary : [];
    displayDisciplinary(globalData.disciplinary);

    return globalData.disciplinary;
  } catch (error) {
    console.error("Error loading disciplinary actions:", error);
    document.getElementById("disciplinaryTableBody").innerHTML =
      '<tr><td colspan="9">Error loading disciplinary data</td></tr>';
    return [];
  }
}

async function loadMemberships() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/memberships`);
    const memberships = await response.json();

    globalData.memberships = Array.isArray(memberships) ? memberships : [];

    return globalData.memberships;
  } catch (error) {
    console.error("Error loading memberships:", error);
    return [];
  }
}

// Display functions
function displayStudents(students) {
  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;

  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="7">No students found</td></tr>';
    return;
  }

  tbody.innerHTML = students
    .map((student) => {
      const department =
        student.department_name ||
        globalData.departments.find(
          (d) => d.department_id === student.department_id
        )?.department_name ||
        "Unknown";
      const hostel =
        student.hostel_name ||
        globalData.hostels.find((h) => h.hostel_id === student.hostel_id)
          ?.hostel_name ||
        "Unassigned";
      const roomNumber = student.room_number || "Unassigned";

      return `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.student_name}</td>
                <td>${student.email}</td>
                <td>${department}</td>
                <td>${hostel}</td>
                <td>${roomNumber}</td>
                <td><span class="status-badge status-${student.status
                  .toLowerCase()
                  .replace(" ", "-")}">${student.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewStudent(${
                          student.student_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editStudent(${
                          student.student_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteStudent(${
                          student.student_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayDepartments(departments) {
  const tbody = document.getElementById("departmentsTableBody");
  if (!tbody) return;

  if (!departments.length) {
    tbody.innerHTML = '<tr><td colspan="4">No departments found</td></tr>';
    return;
  }

  tbody.innerHTML = departments
    .map(
      (dept) => `
        <tr>
            <td>${dept.department_id}</td>
            <td>${dept.department_name}</td>
            <td>${dept.department_code}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewDepartment(${dept.department_id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action btn-edit" onclick="editDepartment(${dept.department_id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteDepartment(${dept.department_id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

function displayStaff(staff) {
  const tbody = document.getElementById("staffTableBody");
  if (!tbody) return;

  if (!staff.length) {
    tbody.innerHTML = '<tr><td colspan="6">No staff found</td></tr>';
    return;
  }

  tbody.innerHTML = staff
    .map((member) => {
      const department = globalData.departments.find(
        (d) => d.department_id === member.department_id
      );

      return `
        <tr>
            <td>${member.staff_id}</td>
            <td>${member.staff_name}</td>
            <td>${member.designation}</td>
            <td>${
              department ? department.department_name : "Unknown Department"
            }</td>
            <td>${member.email}</td>
            <td>${member.contact_number || "Not Provided"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewStaff(${
                      member.staff_id
                    })">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-action btn-edit" onclick="editStaff(${
                      member.staff_id
                    })">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteStaff(${
                      member.staff_id
                    })">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
        `;
    })
    .join("");
}

function displayHostels(hostels) {
  const tbody = document.getElementById("hostelsTableBody");
  if (!tbody) return;

  if (!hostels.length) {
    tbody.innerHTML = '<tr><td colspan="4">No hostels found</td></tr>';
    return;
  }

  tbody.innerHTML = hostels
    .map((hostel) => {
      const warden = globalData.staff.find(
        (s) => s.staff_id === hostel.warden_id
      );
      return `
            <tr>
                <td>${hostel.hostel_id}</td>
                <td>${hostel.hostel_name}</td>
                <td>${warden ? warden.staff_name : "No Warden Assigned"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewHostel(${
                          hostel.hostel_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editHostel(${
                          hostel.hostel_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteHostel(${
                          hostel.hostel_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayRooms(rooms) {
  const tbody = document.getElementById("roomsTableBody");
  if (!tbody) return;

  if (!rooms.length) {
    tbody.innerHTML = '<tr><td colspan="7">No rooms found</td></tr>';
    return;
  }

  tbody.innerHTML = rooms
    .map((room) => {
      const hostel = globalData.hostels.find(
        (h) => h.hostel_id === room.hostel_id
      );
      const occupancy = Math.floor(Math.random() * room.capacity); // Simulate occupancy
      const status =
        occupancy === room.capacity
          ? "Full"
          : occupancy === 0
          ? "Empty"
          : "Partial";

      return `
            <tr>
                <td>${room.room_id}</td>
                <td>${hostel ? hostel.hostel_name : "Unknown Hostel"}</td>
                <td>${room.room_number}</td>
                <td>${room.capacity}</td>
                <td>${occupancy}/${room.capacity}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewRoom(${
                          room.room_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editRoom(${
                          room.room_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteRoom(${
                          room.room_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayMess(mess) {
  const tbody = document.getElementById("messTableBody");
  if (!tbody) return;

  if (!mess.length) {
    tbody.innerHTML = '<tr><td colspan="4">No mess found</td></tr>';
    return;
  }

  tbody.innerHTML = mess
    .map((m) => {
      const incharge = globalData.staff.find(
        (s) => s.staff_id === m.mess_incharge_id
      );
      return `
            <tr>
                <td>${m.mess_id}</td>
                <td>${m.mess_name}</td>
                <td>${
                  incharge ? incharge.staff_name : "No Incharge Assigned"
                }</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewMess(${
                          m.mess_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editMess(${
                          m.mess_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteMess(${
                          m.mess_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayEvents(events) {
  const tbody = document.getElementById("eventsTableBody");
  if (!tbody) return;

  if (!events.length) {
    tbody.innerHTML = '<tr><td colspan="9">No events found</td></tr>';
    return;
  }

  tbody.innerHTML = events
    .map((event) => {
      const organization = globalData.organizations.find(
        (o) => o.org_id === event.organizing_org_id
      );
      const eventDate = new Date(event.event_date).toLocaleDateString();

      return `
            <tr>
                <td>${event.event_id}</td>
                <td>${event.event_name}</td>
                <td>${event.event_type}</td>
                <td>${
                  organization ? organization.org_name : "Unknown Organization"
                }</td>
                <td>${eventDate}</td>
                <td>${event.venue || "TBD"}</td>
                <td>${event.event_level}</td>
                <td>₹${event.budget ? event.budget.toLocaleString() : "0"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewEvent(${
                          event.event_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editEvent(${
                          event.event_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteEvent(${
                          event.event_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayOrganizations(organizations) {
  const tbody = document.getElementById("organizationsTableBody");
  if (!tbody) return;

  if (!organizations.length) {
    tbody.innerHTML = '<tr><td colspan="8">No organizations found</td></tr>';
    return;
  }

  tbody.innerHTML = organizations
    .map((org) => {
      const memberCount = globalData.memberships.filter(
        (m) => m.org_id === org.org_id
      ).length;
      const eventCount = globalData.events.filter(
        (e) => e.organizing_org_id === org.org_id
      ).length;

      return `
            <tr>
                <td>${org.org_id}</td>
                <td><a href="#" onclick="showOrganizationDetails(${
                  org.org_id
                })" class="org-link">${org.org_name}</a></td>
                <td>${org.org_type}</td>
                <td>${org.category}</td>
                <td>₹${org.budget ? org.budget.toLocaleString() : "0"}</td>
                <td>${memberCount}</td>
                <td>${eventCount}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="showOrganizationDetails(${
                          org.org_id
                        })">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn-action btn-edit" onclick="editOrganization(${
                          org.org_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteOrganization(${
                          org.org_id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayPlacements(placements) {
  const tbody = document.getElementById("placementsTableBody");
  if (!tbody) return;

  if (!placements.length) {
    tbody.innerHTML = '<tr><td colspan="8">No placements found</td></tr>';
    return;
  }

  tbody.innerHTML = placements
    .map((placement) => {
      const student = globalData.students.find(
        (s) => s.student_id === placement.student_id
      );
      const placementDate = new Date(
        placement.placement_date
      ).toLocaleDateString();

      return `
            <tr>
                <td>${placement.placement_id}</td>
                <td>${placement.student_id}</td>
                <td>${placement.company_name}</td>
                <td>${placement.role_offered}</td>
                <td>₹${
                  placement.package_offered
                    ? placement.package_offered.toLocaleString()
                    : "N/A"
                }</td>
                <td>${placement.placement_type}</td>
                <td><span class="status-badge status-${placement.status.toLowerCase()}">${
        placement.status
      }</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewPlacement(${
                          placement.placement_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editPlacement(${
                          placement.placement_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayPayments(payments) {
  const tbody = document.getElementById("paymentsTableBody");
  if (!tbody) return;

  if (!payments.length) {
    tbody.innerHTML = '<tr><td colspan="8">No payments found</td></tr>';
    return;
  }

  tbody.innerHTML = payments
    .map((payment) => {
      const student = globalData.students.find(
        (s) => s.student_id === payment.student_id
      );
      const paymentDate = new Date(payment.payment_date).toLocaleDateString();

      return `
            <tr>
                <td>${payment.payment_id}</td>
                <td>${student ? student.student_name : "N/A"}</td>
                <td>${payment.payment_type}</td>
                <td>₹${payment.amount.toLocaleString()}</td>
                <td>${paymentDate}</td>
                <td><span class="status-badge status-${payment.payment_status.toLowerCase()}">${
        payment.payment_status
      }</span></td>
                <td>${payment.transaction_id}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewPayment(${
                          payment.payment_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editPayment(${
                          payment.payment_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayFeedback(feedback) {
  const tbody = document.getElementById("feedbackTableBody");
  if (!tbody) return;

  if (!feedback.length) {
    tbody.innerHTML = '<tr><td colspan="7">No feedback found</td></tr>';
    return;
  }

  tbody.innerHTML = feedback
    .map((fb) => {
      const student = globalData.students.find(
        (s) => s.student_id === fb.student_id
      );
      const feedbackDate = new Date(fb.feedback_date).toLocaleDateString();
      const stars = "★".repeat(fb.rating) + "☆".repeat(5 - fb.rating);

      return `
            <tr>
                <td>${fb.feedback_id}</td>
                <td>${student ? student.student_name : "N/A"}</td>
                <td>${fb.category}</td>
                <td><span class="rating-stars">${stars} (${
        fb.rating
      }/5)</span></td>
                <td>${fb.feedback_text.substring(0, 50)}${
        fb.feedback_text.length > 50 ? "..." : ""
      }</td>
                <td>${feedbackDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewFeedback(${
                          fb.feedback_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editFeedback(${
                          fb.feedback_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayAlumni(alumni) {
  const tbody = document.getElementById("alumniTableBody");
  if (!tbody) return;

  if (!alumni.length) {
    tbody.innerHTML = '<tr><td colspan="7">No alumni found</td></tr>';
    return;
  }

  tbody.innerHTML = alumni
    .map((alum) => {
      const student = globalData.students.find(
        (s) => s.student_id === alum.student_id
      );

      return `
            <tr>
                <td>${alum.alumni_id}</td>
                <td>${student ? student.student_name : "N/A"}</td>
                <td>${alum.graduation_year}</td>
                <td>${alum.current_position}</td>
                <td>${alum.company_name}</td>
                <td>${alum.location}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewAlumni(${
                          alum.alumni_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editAlumni(${
                          alum.alumni_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function displayDisciplinary(disciplinary) {
  const tbody = document.getElementById("disciplinaryTableBody");
  if (!tbody) return;

  if (!disciplinary.length) {
    tbody.innerHTML =
      '<tr><td colspan="9">No disciplinary actions found</td></tr>';
    return;
  }

  tbody.innerHTML = disciplinary
    .map((action) => {
      const student = globalData.students.find(
        (s) => s.student_id === action.student_id
      );
      const incidentDate = new Date(action.incident_date).toLocaleDateString();

      return `
            <tr>
                <td>${action.action_id}</td>
                <td>${student ? student.student_name : "N/A"}</td>
                <td>${incidentDate}</td>
                <td>${action.description.substring(0, 30)}${
        action.description.length > 30 ? "..." : ""
      }</td>
                <td>${action.action_taken}</td>
                <td>₹${action.fine_amount}</td>
                <td><span class="status-badge status-${action.severity.toLowerCase()}">${
        action.severity
      }</span></td>
                <td><span class="status-badge status-${action.status.toLowerCase()}">${
        action.status
      }</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewDisciplinary(${
                          action.action_id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-edit" onclick="editDisciplinary(${
                          action.action_id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

// Search and filter functions
function filterTable(tableId, searchTerm) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");

  for (let row of rows) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? "" : "none";
  }
}

function populateDepartmentFilter() {
  const select = document.getElementById("departmentFilter");
  if (!select || !globalData.departments.length) return;

  // Clear existing options (except "All Departments")
  select.innerHTML = '<option value="">All Departments</option>';

  globalData.departments.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept.department_id;
    option.textContent = dept.department_name;
    select.appendChild(option);
  });
}

function filterStudentsByStatus() {
  const status = document.getElementById("statusFilter").value;
  const filteredStudents = status
    ? globalData.students.filter((s) => s.status === status)
    : globalData.students;
  displayStudents(filteredStudents);
}

function filterStudentsByDepartment() {
  const deptId = document.getElementById("departmentFilter").value;
  const filteredStudents = deptId
    ? globalData.students.filter((s) => s.department_id == deptId)
    : globalData.students;
  displayStudents(filteredStudents);
}

// Organization detail modal
async function showOrganizationDetails(orgId) {
  const organization = globalData.organizations.find((o) => o.org_id === orgId);
  if (!organization) return;

  // Load additional data if needed
  if (!globalData.memberships.length) {
    await loadOrganizations();
  }

  const members = globalData.memberships.filter((m) => m.org_id === orgId);
  const events = globalData.events.filter((e) => e.organizing_org_id === orgId);
  const totalBudgetUsed = events.reduce(
    (sum, event) => sum + (event.budget || 0),
    0
  );

  const modalHTML = `
        <div class="org-detail-modal" id="orgModal">
            <div class="org-detail-content">
                <div class="org-detail-header">
                    <h2><i class="fas fa-sitemap"></i> ${
                      organization.org_name
                    }</h2>
                    <button class="close-modal" onclick="closeOrgModal()">&times;</button>
                </div>
                
                <div class="org-stats">
                    <div class="stat-item">
                        <div class="stat-value">${members.length}</div>
                        <div class="stat-label">Total Members</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${events.length}</div>
                        <div class="stat-label">Events Organized</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">₹${
                          organization.budget
                            ? organization.budget.toLocaleString()
                            : "N/A"
                        }</div>
                        <div class="stat-label">Total Budget</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">₹${totalBudgetUsed.toLocaleString()}</div>
                        <div class="stat-label">Budget Used</div>
                    </div>
                </div>
                
                <div class="org-section">
                    <h3><i class="fas fa-calendar-alt"></i> Recent Events</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Budget</th>
                                    <th>Venue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${events
                                  .map(
                                    (event) => `
                                    <tr>
                                        <td>${event.event_name}</td>
                                        <td>${new Date(
                                          event.event_date
                                        ).toLocaleDateString()}</td>
                                        <td>${event.event_type}</td>
                                        <td>₹${
                                          event.budget
                                            ? event.budget.toLocaleString()
                                            : "N/A"
                                        }</td>
                                        <td>${event.venue}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                                ${
                                  events.length === 0
                                    ? '<tr><td colspan="5">No events organized yet</td></tr>'
                                    : ""
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="org-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3><i class="fas fa-users"></i> Members</h3>
                        <button class="btn-primary" onclick="showAddMemberModal(${orgId})">
                            <i class="fas fa-plus"></i> Add Member
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Role</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${members
                                  .map((member) => {
                                    const student = globalData.students.find(
                                      (s) => s.student_id === member.student_id
                                    );
                                    return `
                                        <tr>
                                            <td>${member.student_id} ${
                                      student ? `(${student.student_name})` : ""
                                    }</td>
                                            <td>${member.role}</td>
                                            <td>${new Date(
                                              member.join_date
                                            ).toLocaleDateString()}</td>
                                            <td><span class="status-badge status-active">Active</span></td>
                                            <td>
                                                <button class="btn-sm btn-danger" onclick="removeMember(${
                                                  member.membership_id
                                                })" title="Remove Member">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                  })
                                  .join("")}
                                ${
                                  members.length === 0
                                    ? '<tr><td colspan="5">No members found</td></tr>'
                                    : ""
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function closeOrgModal() {
  const modal = document.getElementById("orgModal");
  if (modal) {
    modal.remove();
  }
}

// Dashboard functions
function updateDashboardStats() {
  const totalStudents = globalData.students.length;
  const activeEvents = globalData.events.filter(
    (e) => new Date(e.event_date) > new Date()
  ).length;
  const pendingPayments = globalData.payments.filter(
    (p) => p.payment_status === "Pending"
  ).length;

  document.getElementById("totalStudents").textContent = totalStudents;
  document.getElementById("totalEvents").textContent = activeEvents;
  document.getElementById("pendingPayments").textContent = pendingPayments;

  // Calculate hostel occupancy (simplified)
  const occupiedRooms = Math.floor(globalData.rooms.length * 0.75); // Simulate 75% occupancy
  const occupancyPercentage =
    globalData.rooms.length > 0
      ? Math.round((occupiedRooms / globalData.rooms.length) * 100)
      : 0;
  document.getElementById(
    "hostelOccupancy"
  ).textContent = `${occupancyPercentage}%`;
}

function updateDashboardCharts() {
  updateDepartmentChart();
  updateStatusChart();
}

function updateDepartmentChart() {
  const ctx = document.getElementById("departmentChart");
  if (!ctx) return;

  const departmentData = globalData.departments.map((dept) => {
    const studentCount = globalData.students.filter(
      (s) => s.department_id === dept.department_id
    ).length;
    return {
      department: dept.department_code,
      count: studentCount,
    };
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: departmentData.map((d) => d.department),
      datasets: [
        {
          label: "Number of Students",
          data: departmentData.map((d) => d.count),
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateStatusChart() {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;

  const statusCounts = globalData.students.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {});

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ["#28a745", "#17a2b8", "#ffc107", "#dc3545"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// Utility functions
function showErrorMessage(message) {
  // Create a simple error toast
  const toast = document.createElement("div");
  toast.className = "error-toast";
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Room management functions
async function loadRoomsForHostel(
  hostelId,
  selectElementId,
  selectedRoomId = null
) {
  const roomSelect = document.getElementById(selectElementId);
  if (!roomSelect) return;

  roomSelect.innerHTML = '<option value="">Loading rooms...</option>';

  if (!hostelId) {
    roomSelect.innerHTML =
      '<option value="">Select Room (Choose hostel first)</option>';
    return;
  }

  try {
    // Filter rooms by hostel from global data or fetch from API
    const hostelRooms = globalData.rooms.filter(
      (room) => room.hostel_id == hostelId
    );

    if (hostelRooms.length === 0) {
      // Try to fetch rooms from API if not in global data
      const response = await authenticatedFetch(`${API_BASE_URL}/rooms`);
      const allRooms = await response.json();
      const filteredRooms = allRooms.filter(
        (room) => room.hostel_id == hostelId
      );

      if (filteredRooms.length === 0) {
        roomSelect.innerHTML =
          '<option value="">No rooms available in this hostel</option>';
        return;
      }

      // Update global data with fetched rooms
      globalData.rooms = allRooms;
      populateRoomOptions(roomSelect, filteredRooms, selectedRoomId);
    } else {
      populateRoomOptions(roomSelect, hostelRooms, selectedRoomId);
    }
  } catch (error) {
    console.error("Error loading rooms:", error);
    roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
  }
}

function populateRoomOptions(selectElement, rooms, selectedRoomId = null) {
  selectElement.innerHTML = '<option value="">Select Room</option>';

  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.room_id;
    option.textContent = `Room ${room.room_number} (Capacity: ${room.capacity})`;

    if (selectedRoomId && room.room_id == selectedRoomId) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
}

// Modal management functions
function showViewModal(title, content) {
  document.getElementById("viewModalTitle").textContent = title;
  document.getElementById("viewModalBody").innerHTML = content;
  document.getElementById("viewModal").style.display = "flex";
}

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

function showEditModal(title, formContent) {
  document.getElementById("editModalTitle").textContent = title;
  document.getElementById("editModalBody").innerHTML = formContent;
  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function showDeleteModal(message, confirmCallback) {
  document.getElementById("deleteModalMessage").textContent = message;
  document.getElementById("deleteModal").style.display = "flex";

  // Remove any existing event listeners
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

  // Add new event listener
  newBtn.addEventListener("click", () => {
    confirmCallback();
    closeDeleteModal();
  });
}

function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}

// View functions
function viewStudent(id) {
  const student = globalData.students.find((s) => s.student_id == id);
  if (!student) return;

  const department =
    student.department_name ||
    globalData.departments.find(
      (d) => d.department_id === student.department_id
    )?.department_name ||
    "Unknown Department";
  const hostel =
    student.hostel_name ||
    globalData.hostels.find((h) => h.hostel_id === student.hostel_id)
      ?.hostel_name ||
    "No Hostel Assigned";
  const mess =
    student.mess_name ||
    globalData.mess.find((m) => m.mess_id === student.mess_id)?.mess_name ||
    "No Mess Assigned";
  const roomNumber = student.room_number || "No Room Assigned";

  const content = `
        <div class="detail-section">
            <h4>Personal Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Student ID:</span>
                <span class="detail-value">${student.student_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${student.student_name}</span>
                <span class="detail-label">Email:</span>
                <span class="detail-value">${student.email}</span>
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${
                  student.contact_number || "Not Provided"
                }</span>
                <span class="detail-label">Gender:</span>
                <span class="detail-value">${student.gender}</span>
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${
                  student.date_of_birth
                    ? new Date(student.date_of_birth).toLocaleDateString()
                    : "Not Provided"
                }</span>
                <span class="detail-label">Address:</span>
                <span class="detail-value">${
                  student.address || "Not Provided"
                }</span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Academic Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${department}</span>
                <span class="detail-label">Department Code:</span>
                <span class="detail-value">${
                  student.department_code || "Unknown"
                }</span>
                <span class="detail-label">Admission Year:</span>
                <span class="detail-value">${student.admission_year}</span>
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${student.status
                  .toLowerCase()
                  .replace(" ", "-")}">${student.status}</span></span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Accommodation & Mess</h4>
            <div class="detail-grid">
                <span class="detail-label">Hostel:</span>
                <span class="detail-value">${hostel}</span>
                <span class="detail-label">Room Number:</span>
                <span class="detail-value">${roomNumber}</span>
                <span class="detail-label">Mess:</span>
                <span class="detail-value">${mess}</span>
            </div>
        </div>
    `;

  showViewModal(`Student Details - ${student.student_name}`, content);
}

function viewDepartment(id) {
  const dept = globalData.departments.find((d) => d.department_id == id);
  if (!dept) return;

  const studentsInDept = globalData.students.filter(
    (s) => s.department_id === dept.department_id
  );
  const staffInDept = globalData.staff.filter(
    (s) => s.department_id === dept.department_id
  );

  const content = `
        <div class="detail-section">
            <h4>Department Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Department ID:</span>
                <span class="detail-value">${dept.department_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${dept.department_name}</span>
                <span class="detail-label">Code:</span>
                <span class="detail-value">${dept.department_code}</span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Statistics</h4>
            <div class="detail-grid">
                <span class="detail-label">Total Students:</span>
                <span class="detail-value">${studentsInDept.length}</span>
                <span class="detail-label">Total Staff:</span>
                <span class="detail-value">${staffInDept.length}</span>
            </div>
        </div>
    `;

  showViewModal(`Department Details - ${dept.department_name}`, content);
}

function viewStaff(id) {
  const staff = globalData.staff.find((s) => s.staff_id == id);
  if (!staff) return;

  const department = globalData.departments.find(
    (d) => d.department_id === staff.department_id
  );

  const content = `
        <div class="detail-section">
            <h4>Staff Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Staff ID:</span>
                <span class="detail-value">${staff.staff_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${staff.staff_name}</span>
                <span class="detail-label">Designation:</span>
                <span class="detail-value">${staff.designation}</span>
                <span class="detail-label">Department:</span>
                <span class="detail-value">${
                  department ? department.department_name : "N/A"
                }</span>
                <span class="detail-label">Email:</span>
                <span class="detail-value">${staff.email}</span>
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${staff.contact_number}</span>
            </div>
        </div>
    `;

  showViewModal(`Staff Details - ${staff.staff_name}`, content);
}

function viewHostel(id) {
  const hostel = globalData.hostels.find((h) => h.hostel_id == id);
  if (!hostel) return;

  const warden = globalData.staff.find((s) => s.staff_id === hostel.warden_id);
  const studentsInHostel = globalData.students.filter(
    (s) => s.hostel_id === hostel.hostel_id
  );

  const content = `
        <div class="detail-section">
            <h4>Hostel Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Hostel ID:</span>
                <span class="detail-value">${hostel.hostel_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${hostel.hostel_name}</span>
                <span class="detail-label">Warden:</span>
                <span class="detail-value">${
                  warden ? warden.staff_name : "N/A"
                }</span>
                <span class="detail-label">Total Students:</span>
                <span class="detail-value">${studentsInHostel.length}</span>
            </div>
        </div>
    `;

  showViewModal(`Hostel Details - ${hostel.hostel_name}`, content);
}

async function viewEvent(id) {
  const event = globalData.events.find((e) => e.event_id == id);
  if (!event) return;

  const organization = globalData.organizations.find(
    (o) => o.org_id === event.organizing_org_id
  );

  try {
    // Load participants for this event
    const response = await authenticatedFetch(
      `${API_BASE_URL}/event-participation/event/${id}`
    );
    const participants = await response.json();

    const participantsSection =
      participants.length > 0
        ? `
        <div class="detail-section">
            <h4>Participants <button class="btn-small btn-primary" onclick="showAddParticipantModal(${id})" style="margin-left: 10px;">+ Add Participant</button></h4>
            <div class="participants-list">
                ${participants
                  .map(
                    (p) => `
                    <div class="participant-item" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; background: #f9f9f9;">
                        <div style="display: flex; justify-content: between; align-items: center;">
                            <div>
                                <strong>${p.student_name}</strong> - <em>${
                      p.role
                    }</em>
                                ${
                                  p.position_secured
                                    ? `<br><span class="badge" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Position: ${p.position_secured}</span>`
                                    : ""
                                }
                                ${
                                  p.medal
                                    ? `<span class="badge" style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">Medal: ${p.medal}</span>`
                                    : ""
                                }
                                ${
                                  p.certificate_issued === "Yes"
                                    ? `<span class="badge" style="background: #17a2b8; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">Certificate Issued</span>`
                                    : ""
                                }
                            </div>
                            <button class="btn-small btn-danger" onclick="removeParticipant(${
                              p.participation_id
                            }, ${id})" style="margin-left: auto;">Remove</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        `
        : `
        <div class="detail-section">
            <h4>Participants <button class="btn-small btn-primary" onclick="showAddParticipantModal(${id})" style="margin-left: 10px;">+ Add Participant</button></h4>
            <p style="color: #666; font-style: italic;">No participants registered for this event yet.</p>
        </div>
        `;

    const content = `
            <div class="detail-section">
                <h4>Event Information</h4>
                <div class="detail-grid">
                    <span class="detail-label">Event ID:</span>
                    <span class="detail-value">${event.event_id}</span>
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${event.event_name}</span>
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${event.event_type}</span>
                    <span class="detail-label">Organizing Organization:</span>
                    <span class="detail-value">${
                      organization ? organization.org_name : "N/A"
                    }</span>
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(
                      event.event_date
                    ).toLocaleDateString()}</span>
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">${event.venue}</span>
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${event.event_level}</span>
                    <span class="detail-label">Budget:</span>
                    <span class="detail-value">₹${
                      event.budget ? event.budget.toLocaleString() : "N/A"
                    }</span>
                </div>
            </div>
            ${
              event.description
                ? `
            <div class="detail-section">
                <h4>Description</h4>
                <p>${event.description}</p>
            </div>
            `
                : ""
            }
            ${participantsSection}
        `;

    showViewModal(`Event Details - ${event.event_name}`, content);
  } catch (error) {
    console.error("Error loading participants:", error);
    // Show basic event details even if participants fail to load
    const content = `
            <div class="detail-section">
                <h4>Event Information</h4>
                <div class="detail-grid">
                    <span class="detail-label">Event ID:</span>
                    <span class="detail-value">${event.event_id}</span>
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${event.event_name}</span>
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${event.event_type}</span>
                    <span class="detail-label">Organizing Organization:</span>
                    <span class="detail-value">${
                      organization ? organization.org_name : "N/A"
                    }</span>
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(
                      event.event_date
                    ).toLocaleDateString()}</span>
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">${event.venue}</span>
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${event.event_level}</span>
                    <span class="detail-label">Budget:</span>
                    <span class="detail-value">₹${
                      event.budget ? event.budget.toLocaleString() : "N/A"
                    }</span>
                </div>
            </div>
            ${
              event.description
                ? `
            <div class="detail-section">
                <h4>Description</h4>
                <p>${event.description}</p>
            </div>
            `
                : ""
            }
            <div class="detail-section">
                <h4>Participants</h4>
                <p style="color: #dc3545;">Error loading participants. <button class="btn-small btn-primary" onclick="showAddParticipantModal(${id})">+ Add Participant</button></p>
            </div>
        `;

    showViewModal(`Event Details - ${event.event_name}`, content);
  }
}

// Participant management functions
function showAddParticipantModal(eventId) {
  // Ensure students data is loaded
  if (!globalData.students || globalData.students.length === 0) {
    showNotification("Loading student data...", "info");
    loadStudents().then(() => showAddParticipantModal(eventId));
    return;
  }

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}">${s.student_name} (ID: ${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="addParticipantForm" class="modal-form">
            <div class="form-group">
                <label for="participantStudent">Student *</label>
                <select id="participantStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="participantRole">Role *</label>
                <select id="participantRole" name="role" required>
                    <option value="">Select Role</option>
                    <option value="Participant">Participant</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Volunteer">Volunteer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="participantPosition">Position Secured</label>
                <input type="text" id="participantPosition" name="position_secured" placeholder="e.g., 1st Place, Winner, etc.">
            </div>
            <div class="form-group">
                <label for="participantMedal">Medal</label>
                <select id="participantMedal" name="medal">
                    <option value="">No Medal</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Participation">Participation</option>
                </select>
            </div>
            <div class="form-group">
                <label for="participantCertificate">Certificate Issued</label>
                <select id="participantCertificate" name="certificate_issued">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Participant</button>
            </div>
        </form>
    `;

  showEditModal("Add Event Participant", formContent);

  document
    .getElementById("addParticipantForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await addParticipant(eventId, new FormData(e.target));
    });
}

async function addParticipant(eventId, formData) {
  try {
    showLoader("Adding participant...");

    const data = {
      participation_id: Date.now(), // Simple ID generation
      event_id: parseInt(eventId),
    };

    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(
      `${API_BASE_URL}/event-participation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (response.ok) {
      showNotification("Participant added successfully!", "success");
      closeEditModal();
      // Refresh the event view to show the new participant
      viewEvent(eventId);
    } else {
      throw new Error(result.error || "Failed to add participant");
    }
  } catch (error) {
    showNotification(`Error adding participant: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function removeParticipant(participationId, eventId) {
  const confirmed = confirm(
    "Are you sure you want to remove this participant?"
  );
  if (!confirmed) return;

  try {
    showLoader("Removing participant...");

    const response = await authenticatedFetch(
      `${API_BASE_URL}/event-participation/${participationId}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (response.ok) {
      showNotification("Participant removed successfully!", "success");
      // Refresh the event view to update the participants list
      viewEvent(eventId);
    } else {
      throw new Error(result.error || "Failed to remove participant");
    }
  } catch (error) {
    showNotification(`Error removing participant: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

// Continue with more view functions...
function viewRoom(id) {
  const room = globalData.rooms.find((r) => r.room_id == id);
  if (!room) return;

  const hostel = globalData.hostels.find((h) => h.hostel_id === room.hostel_id);

  const content = `
        <div class="detail-section">
            <h4>Room Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Room ID:</span>
                <span class="detail-value">${room.room_id}</span>
                <span class="detail-label">Hostel:</span>
                <span class="detail-value">${
                  hostel ? hostel.hostel_name : "N/A"
                }</span>
                <span class="detail-label">Room Number:</span>
                <span class="detail-value">${room.room_number}</span>
                <span class="detail-label">Capacity:</span>
                <span class="detail-value">${room.capacity}</span>
            </div>
        </div>
    `;

  showViewModal(`Room Details - ${room.room_number}`, content);
}

function viewMess(id) {
  const mess = globalData.mess.find((m) => m.mess_id == id);
  if (!mess) return;

  const incharge = globalData.staff.find(
    (s) => s.staff_id === mess.mess_incharge_id
  );

  const content = `
        <div class="detail-section">
            <h4>Mess Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Mess ID:</span>
                <span class="detail-value">${mess.mess_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${mess.mess_name}</span>
                <span class="detail-label">Incharge:</span>
                <span class="detail-value">${
                  incharge ? incharge.staff_name : "N/A"
                }</span>
            </div>
        </div>
    `;

  showViewModal(`Mess Details - ${mess.mess_name}`, content);
}

function viewOrganization(id) {
  showOrganizationDetails(id); // Use existing function
}

function viewPlacement(id) {
  const placement = globalData.placements.find((p) => p.placement_id == id);
  if (!placement) return;

  const student = globalData.students.find(
    (s) => s.student_id === placement.student_id
  );

  const content = `
        <div class="detail-section">
            <h4>Placement Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Placement ID:</span>
                <span class="detail-value">${placement.placement_id}</span>
                <span class="detail-label">Student:</span>
                <span class="detail-value">${
                  student ? student.student_name : "N/A"
                } (${placement.student_id})</span>
                <span class="detail-label">Company:</span>
                <span class="detail-value">${placement.company_name}</span>
                <span class="detail-label">Role:</span>
                <span class="detail-value">${placement.role_offered}</span>
                <span class="detail-label">Package:</span>
                <span class="detail-value">₹${
                  placement.package_offered
                    ? placement.package_offered.toLocaleString()
                    : "N/A"
                }</span>
                <span class="detail-label">Type:</span>
                <span class="detail-value">${placement.placement_type}</span>
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(
                  placement.placement_date
                ).toLocaleDateString()}</span>
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${placement.status.toLowerCase()}">${
    placement.status
  }</span></span>
            </div>
        </div>
    `;

  showViewModal(`Placement Details - ${placement.company_name}`, content);
}

function viewPayment(id) {
  const payment = globalData.payments.find((p) => p.payment_id == id);
  if (!payment) return;

  const student = globalData.students.find(
    (s) => s.student_id === payment.student_id
  );

  const content = `
        <div class="detail-section">
            <h4>Payment Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${payment.payment_id}</span>
                <span class="detail-label">Student:</span>
                <span class="detail-value">${
                  student ? student.student_name : "N/A"
                }</span>
                <span class="detail-label">Type:</span>
                <span class="detail-value">${payment.payment_type}</span>
                <span class="detail-label">Amount:</span>
                <span class="detail-value">₹${payment.amount.toLocaleString()}</span>
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(
                  payment.payment_date
                ).toLocaleDateString()}</span>
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${payment.payment_status.toLowerCase()}">${
    payment.payment_status
  }</span></span>
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payment.transaction_id}</span>
            </div>
        </div>
    `;

  showViewModal(`Payment Details - ${payment.transaction_id}`, content);
}

function viewFeedback(id) {
  const feedback = globalData.feedback.find((f) => f.feedback_id == id);
  if (!feedback) return;

  const student = globalData.students.find(
    (s) => s.student_id === feedback.student_id
  );

  const content = `
        <div class="detail-section">
            <h4>Feedback Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Feedback ID:</span>
                <span class="detail-value">${feedback.feedback_id}</span>
                <span class="detail-label">Student:</span>
                <span class="detail-value">${
                  student ? student.student_name : "N/A"
                }</span>
                <span class="detail-label">Category:</span>
                <span class="detail-value">${feedback.category}</span>
                <span class="detail-label">Rating:</span>
                <span class="detail-value"><span class="rating-stars">${"★".repeat(
                  feedback.rating
                )}${"☆".repeat(5 - feedback.rating)}</span> (${
    feedback.rating
  }/5)</span>
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(
                  feedback.feedback_date
                ).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Feedback</h4>
            <p>${feedback.feedback_text}</p>
        </div>
    `;

  showViewModal(`Feedback Details`, content);
}

function viewAlumni(id) {
  const alumni = globalData.alumni.find((a) => a.alumni_id == id);
  if (!alumni) return;

  const student = globalData.students.find(
    (s) => s.student_id === alumni.student_id
  );

  const content = `
        <div class="detail-section">
            <h4>Alumni Information</h4>
            <div class="detail-grid">
                <span class="detail-label">Alumni ID:</span>
                <span class="detail-value">${alumni.alumni_id}</span>
                <span class="detail-label">Name:</span>
                <span class="detail-value">${
                  student ? student.student_name : "N/A"
                }</span>
                <span class="detail-label">Graduation Year:</span>
                <span class="detail-value">${alumni.graduation_year}</span>
                <span class="detail-label">Current Position:</span>
                <span class="detail-value">${alumni.current_position}</span>
                <span class="detail-label">Company:</span>
                <span class="detail-value">${alumni.company_name}</span>
                <span class="detail-label">Location:</span>
                <span class="detail-value">${alumni.location}</span>
                <span class="detail-label">Email:</span>
                <span class="detail-value">${alumni.email}</span>
                <span class="detail-label">LinkedIn:</span>
                <span class="detail-value">${
                  alumni.linkedin_url
                    ? `<a href="${alumni.linkedin_url}" target="_blank">View Profile</a>`
                    : "N/A"
                }</span>
            </div>
        </div>
    `;

  showViewModal(
    `Alumni Details - ${student ? student.student_name : "Alumni"}`,
    content
  );
}

function viewDisciplinary(id) {
  const action = globalData.disciplinary.find((d) => d.action_id == id);
  if (!action) return;

  const student = globalData.students.find(
    (s) => s.student_id === action.student_id
  );

  const content = `
        <div class="detail-section">
            <h4>Disciplinary Action</h4>
            <div class="detail-grid">
                <span class="detail-label">Action ID:</span>
                <span class="detail-value">${action.action_id}</span>
                <span class="detail-label">Student:</span>
                <span class="detail-value">${
                  student ? student.student_name : "N/A"
                }</span>
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(
                  action.incident_date
                ).toLocaleDateString()}</span>
                <span class="detail-label">Severity:</span>
                <span class="detail-value"><span class="status-badge status-${action.severity.toLowerCase()}">${
    action.severity
  }</span></span>
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge status-${action.status.toLowerCase()}">${
    action.status
  }</span></span>
                <span class="detail-label">Fine Amount:</span>
                <span class="detail-value">₹${action.fine_amount}</span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Description</h4>
            <p>${action.description}</p>
        </div>
        <div class="detail-section">
            <h4>Action Taken</h4>
            <p>${action.action_taken}</p>
        </div>
    `;

  showViewModal(`Disciplinary Action Details`, content);
}

// Edit functions
async function editStudent(id) {
  const student = globalData.students.find((s) => s.student_id == id);
  if (!student) return;

  // Ensure required data is loaded before showing the form
  if (!globalData.mess || globalData.mess.length === 0) {
    await loadMess();
  }
  if (!globalData.departments || globalData.departments.length === 0) {
    await loadDepartments();
  }
  if (!globalData.hostels || globalData.hostels.length === 0) {
    await loadHostels();
  }

  // Generate department options
  const departmentOptions = globalData.departments
    .map(
      (d) =>
        `<option value="${d.department_id}" ${
          d.department_id === student.department_id ? "selected" : ""
        }>${d.department_name}</option>`
    )
    .join("");

  const hostelOptions = globalData.hostels
    .map(
      (h) =>
        `<option value="${h.hostel_id}" ${
          h.hostel_id === student.hostel_id ? "selected" : ""
        }>${h.hostel_name}</option>`
    )
    .join("");

  const messOptions = globalData.mess
    .map(
      (m) =>
        `<option value="${m.mess_id}" ${
          m.mess_id === student.mess_id ? "selected" : ""
        }>${m.mess_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editStudentForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentName">Student Name *</label>
                    <input type="text" id="editStudentName" name="student_name" value="${
                      student.student_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editStudentEmail">Email *</label>
                    <input type="email" id="editStudentEmail" name="email" value="${
                      student.email
                    }" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentContact">Contact Number</label>
                    <input type="text" id="editStudentContact" name="contact_number" value="${
                      student.contact_number || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editStudentGender">Gender *</label>
                    <select id="editStudentGender" name="gender" required>
                        <option value="Male" ${
                          student.gender === "Male" ? "selected" : ""
                        }>Male</option>
                        <option value="Female" ${
                          student.gender === "Female" ? "selected" : ""
                        }>Female</option>
                        <option value="Other" ${
                          student.gender === "Other" ? "selected" : ""
                        }>Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentDOB">Date of Birth</label>
                    <input type="date" id="editStudentDOB" name="date_of_birth" value="${
                      student.date_of_birth
                        ? student.date_of_birth.split("T")[0]
                        : ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editStudentDepartment">Department *</label>
                    <select id="editStudentDepartment" name="department_id" required>
                        <option value="">Select Department</option>
                        ${departmentOptions}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentAdmissionYear">Admission Year *</label>
                    <input type="number" id="editStudentAdmissionYear" name="admission_year" value="${
                      student.admission_year
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editStudentStatus">Status *</label>
                    <select id="editStudentStatus" name="status" required>
                        <option value="Active" ${
                          student.status === "Active" ? "selected" : ""
                        }>Active</option>
                        <option value="Inactive" ${
                          student.status === "Inactive" ? "selected" : ""
                        }>Inactive</option>
                        <option value="Graduated" ${
                          student.status === "Graduated" ? "selected" : ""
                        }>Graduated</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentHostel">Hostel</label>
                    <select id="editStudentHostel" name="hostel_id" onchange="loadRoomsForHostel(this.value, 'editStudentRoom')">
                        <option value="">Select Hostel</option>
                        ${hostelOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="editStudentRoom">Room</label>
                    <select id="editStudentRoom" name="room_id">
                        <option value="">Select Room (Choose hostel first)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStudentMess">Mess</label>
                    <select id="editStudentMess" name="mess_id">
                        <option value="">Select Mess</option>
                        ${messOptions}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editStudentAddress">Address</label>
                <textarea id="editStudentAddress" name="address" rows="2">${
                  student.address || ""
                }</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Student</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Student - ${student.student_name}`, formContent);

  // Load current room if student has hostel assigned
  if (student.hostel_id) {
    setTimeout(() => {
      loadRoomsForHostel(student.hostel_id, "editStudentRoom", student.room_id);
    }, 100);
  }

  // Add form submit handler
  document
    .getElementById("editStudentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateStudent(student.student_id, new FormData(e.target));
    });
}

function editDepartment(id) {
  const dept = globalData.departments.find((d) => d.department_id == id);
  if (!dept) return;

  const formContent = `
        <form id="editDepartmentForm" class="modal-form">
            <div class="form-group">
                <label for="editDeptName">Department Name *</label>
                <input type="text" id="editDeptName" name="department_name" value="${dept.department_name}" required>
            </div>
            <div class="form-group">
                <label for="editDeptCode">Department Code *</label>
                <input type="text" id="editDeptCode" name="department_code" value="${dept.department_code}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Department</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Department - ${dept.department_name}`, formContent);

  document
    .getElementById("editDepartmentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateDepartment(dept.department_id, new FormData(e.target));
    });
}

function editStaff(id) {
  const staff = globalData.staff.find((s) => s.staff_id == id);
  if (!staff) return;

  const departmentOptions = globalData.departments
    .map(
      (d) =>
        `<option value="${d.department_id}" ${
          d.department_id === staff.department_id ? "selected" : ""
        }>${d.department_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editStaffForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="editStaffName">Staff Name *</label>
                    <input type="text" id="editStaffName" name="staff_name" value="${staff.staff_name}" required>
                </div>
                <div class="form-group">
                    <label for="editStaffDesignation">Designation *</label>
                    <input type="text" id="editStaffDesignation" name="designation" value="${staff.designation}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editStaffEmail">Email *</label>
                    <input type="email" id="editStaffEmail" name="email" value="${staff.email}" required>
                </div>
                <div class="form-group">
                    <label for="editStaffContact">Contact Number *</label>
                    <input type="text" id="editStaffContact" name="contact_number" value="${staff.contact_number}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="editStaffDepartment">Department *</label>
                <select id="editStaffDepartment" name="department_id" required>
                    <option value="">Select Department</option>
                    ${departmentOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Staff</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Staff - ${staff.staff_name}`, formContent);

  document
    .getElementById("editStaffForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateStaff(staff.staff_id, new FormData(e.target));
    });
}

function editHostel(id) {
  const hostel = globalData.hostels.find((h) => h.hostel_id == id);
  if (!hostel) return;

  const wardenOptions = globalData.staff
    .map(
      (s) =>
        `<option value="${s.staff_id}" ${
          s.staff_id === hostel.warden_id ? "selected" : ""
        }>${s.staff_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editHostelForm" class="modal-form">
            <div class="form-group">
                <label for="editHostelName">Hostel Name *</label>
                <input type="text" id="editHostelName" name="hostel_name" value="${hostel.hostel_name}" required>
            </div>
            <div class="form-group">
                <label for="editHostelWarden">Warden</label>
                <select id="editHostelWarden" name="warden_id">
                    <option value="">Select Warden</option>
                    ${wardenOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Hostel</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Hostel - ${hostel.hostel_name}`, formContent);

  document
    .getElementById("editHostelForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateHostel(hostel.hostel_id, new FormData(e.target));
    });
}

function editEvent(id) {
  const event = globalData.events.find((e) => e.event_id == id);
  if (!event) return;

  const orgOptions = globalData.organizations
    .map(
      (o) =>
        `<option value="${o.org_id}" ${
          o.org_id === event.organizing_org_id ? "selected" : ""
        }>${o.org_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editEventForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="editEventName">Event Name *</label>
                    <input type="text" id="editEventName" name="event_name" value="${
                      event.event_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editEventType">Event Type *</label>
                    <select id="editEventType" name="event_type" required>
                        <option value="Cultural" ${
                          event.event_type === "Cultural" ? "selected" : ""
                        }>Cultural</option>
                        <option value="Technical" ${
                          event.event_type === "Technical" ? "selected" : ""
                        }>Technical</option>
                        <option value="Sports" ${
                          event.event_type === "Sports" ? "selected" : ""
                        }>Sports</option>
                        <option value="Academic" ${
                          event.event_type === "Academic" ? "selected" : ""
                        }>Academic</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editEventDate">Event Date *</label>
                    <input type="datetime-local" id="editEventDate" name="event_date" value="${
                      event.event_date ? event.event_date.slice(0, 16) : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editEventVenue">Venue *</label>
                    <input type="text" id="editEventVenue" name="venue" value="${
                      event.venue
                    }" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editEventLevel">Event Level *</label>
                    <select id="editEventLevel" name="event_level" required>
                        <option value="College" ${
                          event.event_level === "College" ? "selected" : ""
                        }>College</option>
                        <option value="Institute" ${
                          event.event_level === "Institute" ? "selected" : ""
                        }>Institute</option>
                        <option value="Inter-College" ${
                          event.event_level === "Inter-College"
                            ? "selected"
                            : ""
                        }>Inter-College</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editEventBudget">Budget</label>
                    <input type="number" id="editEventBudget" name="budget" value="${
                      event.budget || ""
                    }" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label for="editEventOrg">Organizing Organization</label>
                <select id="editEventOrg" name="organizing_org_id">
                    <option value="">Select Organization</option>
                    ${orgOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="editEventDescription">Description</label>
                <textarea id="editEventDescription" name="description" rows="3">${
                  event.description || ""
                }</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Event</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Event - ${event.event_name}`, formContent);

  document
    .getElementById("editEventForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateEvent(event.event_id, new FormData(e.target));
    });
}

function editRoom(id) {
  const room = globalData.rooms.find((r) => r.room_id == id);
  if (!room) return;

  const hostelOptions = globalData.hostels
    .map(
      (h) =>
        `<option value="${h.hostel_id}" ${
          h.hostel_id === room.hostel_id ? "selected" : ""
        }>${h.hostel_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editRoomForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="editRoomHostel">Hostel *</label>
                    <select id="editRoomHostel" name="hostel_id" required>
                        <option value="">Select Hostel</option>
                        ${hostelOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="editRoomNumber">Room Number *</label>
                    <input type="text" id="editRoomNumber" name="room_number" value="${room.room_number}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="editRoomCapacity">Capacity *</label>
                <input type="number" id="editRoomCapacity" name="capacity" value="${room.capacity}" required min="1">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Room</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Room - ${room.room_number}`, formContent);

  document
    .getElementById("editRoomForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateRoom(room.room_id, new FormData(e.target));
    });
}

function editMess(id) {
  const mess = globalData.mess.find((m) => m.mess_id == id);
  if (!mess) return;

  const inchargeOptions = globalData.staff
    .map(
      (s) =>
        `<option value="${s.staff_id}" ${
          s.staff_id === mess.mess_incharge_id ? "selected" : ""
        }>${s.staff_name}</option>`
    )
    .join("");

  const formContent = `
        <form id="editMessForm" class="modal-form">
            <div class="form-group">
                <label for="editMessName">Mess Name *</label>
                <input type="text" id="editMessName" name="mess_name" value="${mess.mess_name}" required>
            </div>
            <div class="form-group">
                <label for="editMessIncharge">Mess Incharge</label>
                <select id="editMessIncharge" name="mess_incharge_id">
                    <option value="">Select Incharge</option>
                    ${inchargeOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Mess</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Mess - ${mess.mess_name}`, formContent);

  document
    .getElementById("editMessForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateMess(mess.mess_id, new FormData(e.target));
    });
}

function editPlacement(id) {
  const placement = globalData.placements.find((p) => p.placement_id == id);
  if (!placement) return;

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}" ${
          s.student_id === placement.student_id ? "selected" : ""
        }>${s.student_name} (${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="editPlacementForm" class="modal-form">
            <div class="form-group">
                <label for="editPlacementStudent">Student *</label>
                <select id="editPlacementStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPlacementCompany">Company Name *</label>
                    <input type="text" id="editPlacementCompany" name="company_name" value="${
                      placement.company_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editPlacementRole">Role Offered *</label>
                    <input type="text" id="editPlacementRole" name="role_offered" value="${
                      placement.role_offered
                    }" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPlacementPackage">Package Offered</label>
                    <input type="number" id="editPlacementPackage" name="package_offered" value="${
                      placement.package_offered || ""
                    }" step="0.01">
                </div>
                <div class="form-group">
                    <label for="editPlacementType">Placement Type *</label>
                    <select id="editPlacementType" name="placement_type" required>
                        <option value="Full-time" ${
                          placement.placement_type === "Full-time"
                            ? "selected"
                            : ""
                        }>Full-time</option>
                        <option value="Internship" ${
                          placement.placement_type === "Internship"
                            ? "selected"
                            : ""
                        }>Internship</option>
                        <option value="Part-time" ${
                          placement.placement_type === "Part-time"
                            ? "selected"
                            : ""
                        }>Part-time</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPlacementDate">Placement Date *</label>
                    <input type="date" id="editPlacementDate" name="placement_date" value="${
                      placement.placement_date
                        ? placement.placement_date.split("T")[0]
                        : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editPlacementStatus">Status *</label>
                    <select id="editPlacementStatus" name="status" required>
                        <option value="Accepted" ${
                          placement.status === "Accepted" ? "selected" : ""
                        }>Accepted</option>
                        <option value="Pending" ${
                          placement.status === "Pending" ? "selected" : ""
                        }>Pending</option>
                        <option value="Rejected" ${
                          placement.status === "Rejected" ? "selected" : ""
                        }>Rejected</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Placement</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Placement - ${placement.company_name}`, formContent);

  document
    .getElementById("editPlacementForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updatePlacement(placement.placement_id, new FormData(e.target));
    });
}

function editPayment(id) {
  const payment = globalData.payments.find((p) => p.payment_id == id);
  if (!payment) return;

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}" ${
          s.student_id === payment.student_id ? "selected" : ""
        }>${s.student_name} (${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="editPaymentForm" class="modal-form">
            <div class="form-group">
                <label for="editPaymentStudent">Student *</label>
                <select id="editPaymentStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPaymentType">Payment Type *</label>
                    <select id="editPaymentType" name="payment_type" required>
                        <option value="Tuition Fee" ${
                          payment.payment_type === "Tuition Fee"
                            ? "selected"
                            : ""
                        }>Tuition Fee</option>
                        <option value="Hostel Fee" ${
                          payment.payment_type === "Hostel Fee"
                            ? "selected"
                            : ""
                        }>Hostel Fee</option>
                        <option value="Mess Fee" ${
                          payment.payment_type === "Mess Fee" ? "selected" : ""
                        }>Mess Fee</option>
                        <option value="Fine" ${
                          payment.payment_type === "Fine" ? "selected" : ""
                        }>Fine</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editPaymentAmount">Amount *</label>
                    <input type="number" id="editPaymentAmount" name="amount" value="${
                      payment.amount
                    }" required step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editPaymentDate">Payment Date *</label>
                    <input type="date" id="editPaymentDate" name="payment_date" value="${
                      payment.payment_date
                        ? payment.payment_date.split("T")[0]
                        : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editPaymentStatus">Payment Status *</label>
                    <select id="editPaymentStatus" name="payment_status" required>
                        <option value="Paid" ${
                          payment.payment_status === "Paid" ? "selected" : ""
                        }>Paid</option>
                        <option value="Pending" ${
                          payment.payment_status === "Pending" ? "selected" : ""
                        }>Pending</option>
                        <option value="Failed" ${
                          payment.payment_status === "Failed" ? "selected" : ""
                        }>Failed</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editPaymentTransactionId">Transaction ID</label>
                <input type="text" id="editPaymentTransactionId" name="transaction_id" value="${
                  payment.transaction_id || ""
                }">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Payment</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Payment - ${payment.transaction_id}`, formContent);

  document
    .getElementById("editPaymentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updatePayment(payment.payment_id, new FormData(e.target));
    });
}

function editFeedback(id) {
  const feedback = globalData.feedback.find((f) => f.feedback_id == id);
  if (!feedback) return;

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}" ${
          s.student_id === feedback.student_id ? "selected" : ""
        }>${s.student_name} (${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="editFeedbackForm" class="modal-form">
            <div class="form-group">
                <label for="editFeedbackStudent">Student *</label>
                <select id="editFeedbackStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editFeedbackCategory">Category *</label>
                    <select id="editFeedbackCategory" name="category" required>
                        <option value="Academic" ${
                          feedback.category === "Academic" ? "selected" : ""
                        }>Academic</option>
                        <option value="Hostel" ${
                          feedback.category === "Hostel" ? "selected" : ""
                        }>Hostel</option>
                        <option value="Mess" ${
                          feedback.category === "Mess" ? "selected" : ""
                        }>Mess</option>
                        <option value="Administration" ${
                          feedback.category === "Administration"
                            ? "selected"
                            : ""
                        }>Administration</option>
                        <option value="Other" ${
                          feedback.category === "Other" ? "selected" : ""
                        }>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editFeedbackRating">Rating *</label>
                    <select id="editFeedbackRating" name="rating" required>
                        <option value="1" ${
                          feedback.rating === 1 ? "selected" : ""
                        }>1 Star</option>
                        <option value="2" ${
                          feedback.rating === 2 ? "selected" : ""
                        }>2 Stars</option>
                        <option value="3" ${
                          feedback.rating === 3 ? "selected" : ""
                        }>3 Stars</option>
                        <option value="4" ${
                          feedback.rating === 4 ? "selected" : ""
                        }>4 Stars</option>
                        <option value="5" ${
                          feedback.rating === 5 ? "selected" : ""
                        }>5 Stars</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editFeedbackText">Feedback *</label>
                <textarea id="editFeedbackText" name="feedback_text" rows="4" required>${
                  feedback.feedback_text
                }</textarea>
            </div>
            <div class="form-group">
                <label for="editFeedbackDate">Date *</label>
                <input type="date" id="editFeedbackDate" name="feedback_date" value="${
                  feedback.feedback_date
                    ? feedback.feedback_date.split("T")[0]
                    : ""
                }" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Feedback</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Feedback`, formContent);

  document
    .getElementById("editFeedbackForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateFeedback(feedback.feedback_id, new FormData(e.target));
    });
}

function editAlumni(id) {
  const alumni = globalData.alumni.find((a) => a.alumni_id == id);
  if (!alumni) return;

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}" ${
          s.student_id === alumni.student_id ? "selected" : ""
        }>${s.student_name} (${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="editAlumniForm" class="modal-form">
            <div class="form-group">
                <label for="editAlumniStudent">Student *</label>
                <select id="editAlumniStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editAlumniGradYear">Graduation Year *</label>
                    <input type="number" id="editAlumniGradYear" name="graduation_year" value="${
                      alumni.graduation_year
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editAlumniPosition">Current Position</label>
                    <input type="text" id="editAlumniPosition" name="current_position" value="${
                      alumni.current_position || ""
                    }">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editAlumniCompany">Company</label>
                    <input type="text" id="editAlumniCompany" name="company_name" value="${
                      alumni.company_name || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editAlumniLocation">Location</label>
                    <input type="text" id="editAlumniLocation" name="location" value="${
                      alumni.location || ""
                    }">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editAlumniEmail">Email</label>
                    <input type="email" id="editAlumniEmail" name="email" value="${
                      alumni.email || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="editAlumniLinkedIn">LinkedIn URL</label>
                    <input type="url" id="editAlumniLinkedIn" name="linkedin_url" value="${
                      alumni.linkedin_url || ""
                    }">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Alumni</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Alumni Record`, formContent);

  document
    .getElementById("editAlumniForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateAlumni(alumni.alumni_id, new FormData(e.target));
    });
}

function editDisciplinary(id) {
  const action = globalData.disciplinary.find((d) => d.action_id == id);
  if (!action) return;

  const studentOptions = globalData.students
    .map(
      (s) =>
        `<option value="${s.student_id}" ${
          s.student_id === action.student_id ? "selected" : ""
        }>${s.student_name} (${s.student_id})</option>`
    )
    .join("");

  const formContent = `
        <form id="editDisciplinaryForm" class="modal-form">
            <div class="form-group">
                <label for="editDisciplinaryStudent">Student *</label>
                <select id="editDisciplinaryStudent" name="student_id" required>
                    <option value="">Select Student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editDisciplinaryDate">Incident Date *</label>
                    <input type="date" id="editDisciplinaryDate" name="incident_date" value="${
                      action.incident_date
                        ? action.incident_date.split("T")[0]
                        : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editDisciplinarySeverity">Severity *</label>
                    <select id="editDisciplinarySeverity" name="severity" required>
                        <option value="Low" ${
                          action.severity === "Low" ? "selected" : ""
                        }>Low</option>
                        <option value="Medium" ${
                          action.severity === "Medium" ? "selected" : ""
                        }>Medium</option>
                        <option value="High" ${
                          action.severity === "High" ? "selected" : ""
                        }>High</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editDisciplinaryStatus">Status *</label>
                    <select id="editDisciplinaryStatus" name="status" required>
                        <option value="Open" ${
                          action.status === "Open" ? "selected" : ""
                        }>Open</option>
                        <option value="Resolved" ${
                          action.status === "Resolved" ? "selected" : ""
                        }>Resolved</option>
                        <option value="Closed" ${
                          action.status === "Closed" ? "selected" : ""
                        }>Closed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editDisciplinaryFine">Fine Amount</label>
                    <input type="number" id="editDisciplinaryFine" name="fine_amount" value="${
                      action.fine_amount || 0
                    }" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label for="editDisciplinaryDescription">Description *</label>
                <textarea id="editDisciplinaryDescription" name="description" rows="3" required>${
                  action.description
                }</textarea>
            </div>
            <div class="form-group">
                <label for="editDisciplinaryAction">Action Taken</label>
                <textarea id="editDisciplinaryAction" name="action_taken" rows="3">${
                  action.action_taken || ""
                }</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Disciplinary Action</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Disciplinary Action`, formContent);

  document
    .getElementById("editDisciplinaryForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateDisciplinary(action.action_id, new FormData(e.target));
    });
}

function editOrganization(id) {
  const org = globalData.organizations.find((o) => o.org_id == id);
  if (!org) return;

  const formContent = `
        <form id="editOrganizationForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="editOrgName">Organization Name *</label>
                    <input type="text" id="editOrgName" name="org_name" value="${
                      org.org_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="editOrgType">Organization Type *</label>
                    <select id="editOrgType" name="org_type" required>
                        <option value="Student Club" ${
                          org.org_type === "Student Club" ? "selected" : ""
                        }>Student Club</option>
                        <option value="Committee" ${
                          org.org_type === "Committee" ? "selected" : ""
                        }>Committee</option>
                        <option value="Society" ${
                          org.org_type === "Society" ? "selected" : ""
                        }>Society</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editOrgBudget">Budget</label>
                    <input type="number" id="editOrgBudget" name="budget" value="${
                      org.budget || ""
                    }" step="0.01">
                </div>
                <div class="form-group">
                    <label for="editOrgStatus">Status *</label>
                    <select id="editOrgStatus" name="status" required>
                        <option value="Active" ${
                          org.status === "Active" ? "selected" : ""
                        }>Active</option>
                        <option value="Inactive" ${
                          org.status === "Inactive" ? "selected" : ""
                        }>Inactive</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editOrgDescription">Description</label>
                <textarea id="editOrgDescription" name="description" rows="3">${
                  org.description || ""
                }</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Organization</button>
            </div>
        </form>
    `;

  showEditModal(`Edit Organization - ${org.org_name}`, formContent);

  document
    .getElementById("editOrganizationForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateOrganization(org.org_id, new FormData(e.target));
    });
}

// Update functions
async function updateStudent(id, formData) {
  try {
    showLoader("Updating student...");

    const data = {};
    const roomId = formData.get("room_id");

    for (let [key, value] of formData.entries()) {
      if (key !== "room_id" && value !== "") {
        data[key] = value;
      }
    }

    console.log("Updating student with data:", data); // Debug log

    // Update student basic information
    const response = await authenticatedFetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Handle room allocation if room is selected
      if (roomId) {
        try {
          await updateRoomAllocation(id, roomId);
        } catch (roomError) {
          console.error("Room allocation error:", roomError);
          showNotification(
            "Student updated but room allocation failed",
            "warning"
          );
        }
      }

      const result = await response.json();
      console.log("Update response:", result); // Debug log
      showNotification("Student updated successfully!", "success");
      closeEditModal();
      await loadStudents(); // Refresh data
    } else {
      const error = await response.json();
      console.error("Update failed:", error); // Debug log
      throw new Error(error.error || error.message || "Update failed");
    }
  } catch (error) {
    console.error("Update error:", error); // Debug log
    showNotification(`Error updating student: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateRoomAllocation(studentId, roomId) {
  try {
    // First, check if student has existing room allocation
    const existingResponse = await authenticatedFetch(
      `/api/room-allocations/student/${studentId}`
    );
    const existingAllocations = await existingResponse.json();

    // End any existing active allocations
    if (existingAllocations && existingAllocations.length > 0) {
      for (const allocation of existingAllocations) {
        if (!allocation.end_date) {
          await authenticatedFetch(
            `/api/room-allocations/${allocation.allocation_id}/end`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                end_date: new Date().toISOString().split("T")[0],
              }),
            }
          );
        }
      }
    }

    // Create new room allocation
    const newAllocation = {
      student_id: parseInt(studentId),
      room_id: parseInt(roomId),
      start_date: new Date().toISOString().split("T")[0],
    };

    await authenticatedFetch("/api/room-allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAllocation),
    });

    console.log("Room allocation updated successfully");
  } catch (error) {
    console.error("Error updating room allocation:", error);
    throw error;
  }
}

async function updateDepartment(id, formData) {
  try {
    showLoader("Updating department...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Department updated successfully!", "success");
      closeEditModal();
      await loadDepartments();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating department: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateStaff(id, formData) {
  try {
    showLoader("Updating staff...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Staff updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating staff: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateHostel(id, formData) {
  try {
    showLoader("Updating hostel...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/hostels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Hostel updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating hostel: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateEvent(id, formData) {
  try {
    showLoader("Updating event...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Event updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating event: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateRoom(id, formData) {
  try {
    showLoader("Updating room...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Room updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating room: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateMess(id, formData) {
  try {
    showLoader("Updating mess...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/mess/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Mess updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating mess: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updatePlacement(id, formData) {
  try {
    showLoader("Updating placement...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/placements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Placement updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating placement: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updatePayment(id, formData) {
  try {
    showLoader("Updating payment...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Payment updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating payment: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateFeedback(id, formData) {
  try {
    showLoader("Updating feedback...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Feedback updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating feedback: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateAlumni(id, formData) {
  try {
    showLoader("Updating alumni record...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/alumni/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Alumni record updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating alumni record: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function updateDisciplinary(id, formData) {
  try {
    showLoader("Updating disciplinary action...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(
      `/api/disciplinary-actions/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (response.ok) {
      showNotification("Disciplinary action updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }
  } catch (error) {
    showNotification(
      `Error updating disciplinary action: ${error.message}`,
      "error"
    );
  } finally {
    hideLoader();
  }
}

async function updateOrganization(id, formData) {
  try {
    showLoader("Updating organization...");

    const data = {};
    for (let [key, value] of formData.entries()) {
      if (value) data[key] = value;
    }

    const response = await authenticatedFetch(`/api/organizations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Organization updated successfully!", "success");
      closeEditModal();
      await loadData();
    } else {
      throw new Error(result.error || result.message || "Update failed");
    }
  } catch (error) {
    showNotification(`Error updating organization: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

// Delete functions
function deleteStudent(id) {
  const student = globalData.students.find((s) => s.student_id == id);
  if (!student) return;

  showDeleteModal(
    `Are you sure you want to delete student "${student.student_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting student...");

        const response = await authenticatedFetch(`/api/students/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Student deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting student: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteDepartment(id) {
  const dept = globalData.departments.find((d) => d.department_id == id);
  if (!dept) return;

  showDeleteModal(
    `Are you sure you want to delete department "${dept.department_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting department...");

        const response = await authenticatedFetch(`/api/departments/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Department deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(
          `Error deleting department: ${error.message}`,
          "error"
        );
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteStaff(id) {
  const staff = globalData.staff.find((s) => s.staff_id == id);
  if (!staff) return;

  showDeleteModal(
    `Are you sure you want to delete staff member "${staff.staff_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting staff...");

        const response = await authenticatedFetch(`/api/staff/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Staff deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting staff: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteEvent(id) {
  const event = globalData.events.find((e) => e.event_id == id);
  if (!event) return;

  showDeleteModal(
    `Are you sure you want to delete event "${event.event_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting event...");

        const response = await authenticatedFetch(`/api/events/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Event deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting event: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteRoom(id) {
  const room = globalData.rooms.find((r) => r.room_id == id);
  if (!room) return;

  showDeleteModal(
    `Are you sure you want to delete room "${room.room_number}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting room...");

        const response = await authenticatedFetch(`/api/rooms/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Room deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting room: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteMess(id) {
  const mess = globalData.mess.find((m) => m.mess_id == id);
  if (!mess) return;

  showDeleteModal(
    `Are you sure you want to delete mess "${mess.mess_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting mess...");

        const response = await authenticatedFetch(`/api/mess/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Mess deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting mess: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteHostel(id) {
  const hostel = globalData.hostels.find((h) => h.hostel_id == id);
  if (!hostel) return;

  showDeleteModal(
    `Are you sure you want to delete hostel "${hostel.hostel_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting hostel...");

        const response = await authenticatedFetch(`/api/hostels/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Hostel deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting hostel: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deletePlacement(id) {
  const placement = globalData.placements.find((p) => p.placement_id == id);
  if (!placement) return;

  showDeleteModal(
    `Are you sure you want to delete placement record for "${placement.company_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting placement...");

        const response = await authenticatedFetch(`/api/placements/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Placement deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting placement: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deletePayment(id) {
  const payment = globalData.payments.find((p) => p.payment_id == id);
  if (!payment) return;

  showDeleteModal(
    `Are you sure you want to delete payment record "${payment.transaction_id}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting payment...");

        const response = await authenticatedFetch(`/api/payments/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Payment deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting payment: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteFeedback(id) {
  const feedback = globalData.feedback.find((f) => f.feedback_id == id);
  if (!feedback) return;

  showDeleteModal(
    `Are you sure you want to delete this feedback? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting feedback...");

        const response = await authenticatedFetch(`/api/feedback/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Feedback deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(`Error deleting feedback: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteAlumni(id) {
  const alumni = globalData.alumni.find((a) => a.alumni_id == id);
  if (!alumni) return;

  showDeleteModal(
    `Are you sure you want to delete this alumni record? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting alumni record...");

        const response = await authenticatedFetch(`/api/alumni/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Alumni record deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(
          `Error deleting alumni record: ${error.message}`,
          "error"
        );
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteDisciplinary(id) {
  const action = globalData.disciplinary.find((d) => d.action_id == id);
  if (!action) return;

  showDeleteModal(
    `Are you sure you want to delete this disciplinary action? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting disciplinary action...");

        const response = await authenticatedFetch(
          `/api/disciplinary-actions/${id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (response.ok) {
          showNotification(
            "Disciplinary action deleted successfully!",
            "success"
          );
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(
          `Error deleting disciplinary action: ${error.message}`,
          "error"
        );
      } finally {
        hideLoader();
      }
    }
  );
}

function deleteOrganization(id) {
  const org = globalData.organizations.find((o) => o.org_id == id);
  if (!org) return;

  showDeleteModal(
    `Are you sure you want to delete organization "${org.org_name}"? This action cannot be undone.`,
    async () => {
      try {
        showLoader("Deleting organization...");

        const response = await authenticatedFetch(`/api/organizations/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Organization deleted successfully!", "success");
          await loadData();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Update failed");
        }
      } catch (error) {
        showNotification(
          `Error deleting organization: ${error.message}`,
          "error"
        );
      } finally {
        hideLoader();
      }
    }
  );
}

// Form functions and event handlers
function showAddStudentForm() {
  document.getElementById("addStudentForm").style.display = "block";
  populateDepartmentDropdown("department_id");
  populateHostelDropdown("hostel_id");
  populateMessDropdown("mess_id");
}

function hideAddStudentForm() {
  document.getElementById("addStudentForm").style.display = "none";
  document.getElementById("studentForm").reset();
}

function showAddDepartmentForm() {
  document.getElementById("addDepartmentForm").style.display = "block";
}

function hideAddDepartmentForm() {
  document.getElementById("addDepartmentForm").style.display = "none";
  document.getElementById("departmentForm").reset();
}

function showAddStaffForm() {
  document.getElementById("addStaffForm").style.display = "block";
  populateDepartmentDropdown("staff_dept_id");
}

function hideAddStaffForm() {
  document.getElementById("addStaffForm").style.display = "none";
  document.getElementById("staffForm").reset();
}

function showAddOrganizationForm() {
  document.getElementById("addOrganizationForm").style.display = "block";
  populateStaffDropdown("faculty_coordinator_id");
}

function hideAddOrganizationForm() {
  document.getElementById("addOrganizationForm").style.display = "none";
  document.getElementById("organizationForm").reset();
}

function showAddEventForm() {
  document.getElementById("addEventForm").style.display = "block";
  populateOrganizationDropdown("organizing_org_id");
}

function hideAddEventForm() {
  document.getElementById("addEventForm").style.display = "none";
  document.getElementById("eventForm").reset();
}

function showAddHostelForm() {
  document.getElementById("addHostelForm").style.display = "block";
  populateStaffDropdown("warden_id");
}

function hideAddHostelForm() {
  document.getElementById("addHostelForm").style.display = "none";
  document.getElementById("hostelForm").reset();
}

function showAddMessForm() {
  document.getElementById("addMessForm").style.display = "block";
  populateStaffDropdown("mess_incharge_id");
}

function hideAddMessForm() {
  document.getElementById("addMessForm").style.display = "none";
  document.getElementById("messForm").reset();
}

// Additional filter functions
function filterStaffByDesignation() {
  const designation = document.getElementById("designationFilter").value;
  const filteredStaff = designation
    ? globalData.staff.filter((s) => s.designation === designation)
    : globalData.staff;
  displayStaff(filteredStaff);
}

function filterEventsByType() {
  const type = document.getElementById("eventTypeFilter").value;
  const filteredEvents = type
    ? globalData.events.filter((e) => e.event_type === type)
    : globalData.events;
  displayEvents(filteredEvents);
}

function filterEventsByLevel() {
  const level = document.getElementById("eventLevelFilter").value;
  const filteredEvents = level
    ? globalData.events.filter((e) => e.event_level === level)
    : globalData.events;
  displayEvents(filteredEvents);
}

function filterOrganizationsByType() {
  const type = document.getElementById("orgTypeFilter").value;
  const filteredOrgs = type
    ? globalData.organizations.filter((o) => o.org_type === type)
    : globalData.organizations;
  displayOrganizations(filteredOrgs);
}

function filterOrganizationsByCategory() {
  const category = document.getElementById("orgCategoryFilter").value;
  const filteredOrgs = category
    ? globalData.organizations.filter((o) => o.category === category)
    : globalData.organizations;
  displayOrganizations(filteredOrgs);
}

function filterPaymentsByStatus() {
  const status = document.getElementById("paymentStatusFilter").value;
  const filteredPayments = status
    ? globalData.payments.filter((p) => p.payment_status === status)
    : globalData.payments;
  displayPayments(filteredPayments);
}

function filterPaymentsByType() {
  const type = document.getElementById("paymentTypeFilter").value;
  const filteredPayments = type
    ? globalData.payments.filter((p) => p.payment_type === type)
    : globalData.payments;
  displayPayments(filteredPayments);
}

function filterFeedbackByCategory() {
  const category = document.getElementById("feedbackCategoryFilter").value;
  const filteredFeedback = category
    ? globalData.feedback.filter((f) => f.category === category)
    : globalData.feedback;
  displayFeedback(filteredFeedback);
}

function filterFeedbackByRating() {
  const rating = document.getElementById("feedbackRatingFilter").value;
  const filteredFeedback = rating
    ? globalData.feedback.filter((f) => f.rating == rating)
    : globalData.feedback;
  displayFeedback(filteredFeedback);
}

function filterAlumniByYear() {
  const year = document.getElementById("graduationYearFilter").value;
  const filteredAlumni = year
    ? globalData.alumni.filter((a) => a.graduation_year == year)
    : globalData.alumni;
  displayAlumni(filteredAlumni);
}

function filterDisciplinaryBySeverity() {
  const severity = document.getElementById("severityFilter").value;
  const filteredDisciplinary = severity
    ? globalData.disciplinary.filter((d) => d.severity === severity)
    : globalData.disciplinary;
  displayDisciplinary(filteredDisciplinary);
}

function filterDisciplinaryByStatus() {
  const status = document.getElementById("statusFilter").value;
  const filteredDisciplinary = status
    ? globalData.disciplinary.filter((d) => d.status === status)
    : globalData.disciplinary;
  displayDisciplinary(filteredDisciplinary);
}

// Populate dropdown functions
function populateDepartmentDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !globalData.departments.length) return;

  // Clear existing options
  select.innerHTML = '<option value="">Select Department</option>';

  globalData.departments.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept.department_id;
    option.textContent = dept.department_name;
    select.appendChild(option);
  });
}

function populateHostelDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !globalData.hostels.length) return;

  select.innerHTML = '<option value="">Select Hostel</option>';

  globalData.hostels.forEach((hostel) => {
    const option = document.createElement("option");
    option.value = hostel.hostel_id;
    option.textContent = hostel.hostel_name;
    select.appendChild(option);
  });
}

function populateMessDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !globalData.mess.length) return;

  select.innerHTML = '<option value="">Select Mess</option>';

  globalData.mess.forEach((mess) => {
    const option = document.createElement("option");
    option.value = mess.mess_id;
    option.textContent = mess.mess_name;
    select.appendChild(option);
  });
}

function populateStaffDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !globalData.staff.length) return;

  select.innerHTML = '<option value="">Select Staff</option>';

  globalData.staff.forEach((staff) => {
    const option = document.createElement("option");
    option.value = staff.staff_id;
    option.textContent = `${staff.staff_name} (${staff.designation})`;
    select.appendChild(option);
  });
}

function populateOrganizationDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !globalData.organizations.length) return;

  select.innerHTML = '<option value="">Select Organization</option>';

  globalData.organizations.forEach((org) => {
    const option = document.createElement("option");
    option.value = org.org_id;
    option.textContent = org.org_name;
    select.appendChild(option);
  });
}

// Form submission handlers
async function handleStudentFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const studentData = {
    student_id: formData.get("student_id"),
    student_name: formData.get("student_name"),
    department_id: formData.get("department_id"),
    hostel_id: formData.get("hostel_id"),
    mess_id: formData.get("mess_id"),
    contact_number: formData.get("contact_number"),
    email: formData.get("email"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    address: formData.get("address"),
    admission_year: formData.get("admission_year"),
    status: formData.get("status"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/students`, {
      method: "POST",
      body: JSON.stringify(studentData),
    });

    if (response.ok) {
      alert("Student added successfully!");
      hideAddStudentForm();
      loadStudents();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add student"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleDepartmentFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const deptData = {
    department_id: formData.get("dept_id"),
    department_name: formData.get("dept_name"),
    department_code: formData.get("dept_code"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/departments`, {
      method: "POST",
      body: JSON.stringify(deptData),
    });

    if (response.ok) {
      alert("Department added successfully!");
      hideAddDepartmentForm();
      loadDepartments();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add department"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleStaffFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const staffData = {
    staff_id: formData.get("staff_id"),
    staff_name: formData.get("staff_name"),
    designation: formData.get("designation"),
    department_id: formData.get("staff_dept_id"),
    email: formData.get("staff_email"),
    contact_number: formData.get("staff_contact"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/staff`, {
      method: "POST",
      body: JSON.stringify(staffData),
    });

    if (response.ok) {
      alert("Staff added successfully!");
      hideAddStaffForm();
      loadStaff();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add staff"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleOrganizationFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const orgData = {
    org_id: formData.get("org_id"),
    org_name: formData.get("org_name"),
    org_type: formData.get("org_type"),
    category: formData.get("org_category"),
    faculty_coordinator_id: formData.get("faculty_coordinator_id"),
    budget: formData.get("org_budget"),
    description: formData.get("org_description"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/organizations`, {
      method: "POST",
      body: JSON.stringify(orgData),
    });

    if (response.ok) {
      alert("Organization added successfully!");
      hideAddOrganizationForm();
      loadOrganizations();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add organization"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleEventFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const eventData = {
    event_id: formData.get("event_id"),
    event_name: formData.get("event_name"),
    event_type: formData.get("event_type"),
    organizing_org_id: formData.get("organizing_org_id"),
    event_date: formData.get("event_date"),
    venue: formData.get("venue"),
    event_level: formData.get("event_level"),
    budget: formData.get("event_budget"),
    description: formData.get("event_description"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/events`, {
      method: "POST",
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      alert("Event added successfully!");
      hideAddEventForm();
      loadEvents();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add event"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleHostelFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const hostelData = {
    hostel_id: formData.get("hostel_id"),
    hostel_name: formData.get("hostel_name"),
    warden_id: formData.get("warden_id"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/hostels`, {
      method: "POST",
      body: JSON.stringify(hostelData),
    });

    if (response.ok) {
      alert("Hostel added successfully!");
      hideAddHostelForm();
      loadHostels();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add hostel"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function handleMessFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const messData = {
    mess_id: formData.get("mess_id"),
    mess_name: formData.get("mess_name"),
    mess_incharge_id: formData.get("mess_incharge_id"),
  };

  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/mess`, {
      method: "POST",
      body: JSON.stringify(messData),
    });

    if (response.ok) {
      alert("Mess added successfully!");
      hideAddMessForm();
      loadMess();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to add mess"}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function showProfile() {
  alert("Profile functionality coming soon!");
}

function setupFormEventListeners() {
  // Student form
  const studentForm = document.getElementById("studentForm");
  if (studentForm) {
    studentForm.addEventListener("submit", handleStudentFormSubmit);
  }

  // Department form
  const departmentForm = document.getElementById("departmentForm");
  if (departmentForm) {
    departmentForm.addEventListener("submit", handleDepartmentFormSubmit);
  }

  // Staff form
  const staffForm = document.getElementById("staffForm");
  if (staffForm) {
    staffForm.addEventListener("submit", handleStaffFormSubmit);
  }

  // Organization form
  const organizationForm = document.getElementById("organizationForm");
  if (organizationForm) {
    organizationForm.addEventListener("submit", handleOrganizationFormSubmit);
  }

  // Event form
  const eventForm = document.getElementById("eventForm");
  if (eventForm) {
    eventForm.addEventListener("submit", handleEventFormSubmit);
  }

  // Hostel form
  const hostelForm = document.getElementById("hostelForm");
  if (hostelForm) {
    hostelForm.addEventListener("submit", handleHostelFormSubmit);
  }

  // Mess form
  const messForm = document.getElementById("messForm");
  if (messForm) {
    messForm.addEventListener("submit", handleMessFormSubmit);
  }
}

// Organization Membership Management Functions
let currentOrgId = null;

function showAddMemberModal(orgId) {
  console.log("showAddMemberModal called with orgId:", orgId);
  currentOrgId = orgId;

  // Populate student dropdown
  const studentSelect = document.getElementById("memberStudent");
  if (!studentSelect) {
    console.error("memberStudent element not found");
    return;
  }

  studentSelect.innerHTML = '<option value="">Select Student</option>';

  // Get students not already in this organization
  const existingMembers = globalData.memberships.filter(
    (m) => m.org_id === orgId
  );
  const existingStudentIds = existingMembers.map((m) => m.student_id);

  const availableStudents = globalData.students.filter(
    (s) => !existingStudentIds.includes(s.student_id)
  );

  console.log("Available students for org:", availableStudents.length);

  availableStudents.forEach((student) => {
    studentSelect.innerHTML += `<option value="${student.student_id}">${student.student_name} (${student.student_id})</option>`;
  });

  // Set default date to today
  const joinDateInput = document.getElementById("memberJoinDate");
  if (joinDateInput) {
    joinDateInput.value = new Date().toISOString().split("T")[0];
  }

  const modal = document.getElementById("addMemberModal");
  if (modal) {
    modal.style.display = "flex";
    console.log("Add member modal opened");
  } else {
    console.error("addMemberModal element not found");
  }
}

function closeAddMemberModal() {
  document.getElementById("addMemberModal").style.display = "none";
  document.getElementById("addMemberForm").reset();
  currentOrgId = null;
}

async function addMemberToOrganization(formData) {
  console.log("addMemberToOrganization called");
  try {
    showLoader("Adding member...");

    const data = {
      org_id: currentOrgId,
      student_id: parseInt(formData.get("student_id")),
      role: formData.get("role"),
      join_date: formData.get("join_date"),
    };

    console.log("Adding member with data:", data);
    console.log("Current org ID:", currentOrgId);

    if (!data.student_id || !data.role || !data.join_date) {
      throw new Error("Please fill in all required fields");
    }

    const response = await authenticatedFetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Add member response status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("Add member result:", result);
      showNotification("Member added successfully!", "success");
      closeAddMemberModal();
      await loadOrganizations(); // Refresh organizations data
      await loadMemberships(); // Refresh memberships data

      // Refresh the organization modal if it's open
      if (document.getElementById("orgModal")) {
        closeOrgModal();
        showOrganizationDetails(currentOrgId);
      }
    } else {
      const error = await response.json();
      console.error("Add member API error:", error);
      throw new Error(error.error || error.message || "Failed to add member");
    }
  } catch (error) {
    console.error("Add member error:", error);
    showNotification(`Error adding member: ${error.message}`, "error");
  } finally {
    hideLoader();
  }
}

async function removeMember(membershipId) {
  showDeleteModal(
    "Are you sure you want to remove this member from the organization?",
    async () => {
      try {
        showLoader("Removing member...");

        const response = await authenticatedFetch(
          `/api/memberships/${membershipId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          showNotification("Member removed successfully!", "success");
          await loadData(); // Refresh data

          // Refresh the organization modal if it's open
          if (document.getElementById("orgModal") && currentOrgId) {
            closeOrgModal();
            showOrganizationDetails(currentOrgId);
          }
        } else {
          const error = await response.json();
          throw new Error(
            error.error || error.message || "Failed to remove member"
          );
        }
      } catch (error) {
        console.error("Remove member error:", error);
        showNotification(`Error removing member: ${error.message}`, "error");
      } finally {
        hideLoader();
      }
    }
  );
}

// Initialize modal event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Close modals when clicking outside
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      if (e.target.id === "viewModal") closeViewModal();
      if (e.target.id === "editModal") closeEditModal();
      if (e.target.id === "deleteModal") closeDeleteModal();
      if (e.target.id === "addMemberModal") closeAddMemberModal();
    }
  });

  // Close modals with escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeViewModal();
      closeEditModal();
      closeDeleteModal();
      closeAddMemberModal();
    }
  });

  // Add click handlers for close buttons (if they exist)
  const closeViewBtn = document.getElementById("closeViewModal");
  if (closeViewBtn) closeViewBtn.addEventListener("click", closeViewModal);

  const closeEditBtn = document.getElementById("closeEditModal");
  if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);

  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  if (cancelDeleteBtn)
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  // Add member form submit handler - use event delegation since form might not exist yet
  document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "addMemberForm") {
      e.preventDefault();
      await addMemberToOrganization(new FormData(e.target));
    }
  });
});
