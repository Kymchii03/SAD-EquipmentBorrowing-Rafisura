
import { supabase } from "./supabase.js";

// ==========================================
// INITIALIZE EQUIPMENT PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadEquipment();

    // Add Equipment Form
    const equipmentForm = document.getElementById("equipmentForm");

    if (equipmentForm) {
        equipmentForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await addEquipment();
        });
    }

    // Search Equipment
    const search = document.getElementById("equipmentSearch");

    if (search) {
        search.addEventListener("input", loadEquipment);
    }

    // Filter Equipment
    const filter = document.getElementById("availabilityFilter");

    if (filter) {
        filter.addEventListener("change", loadEquipment);
    }

    // Refresh when borrowing or returning equipment
    window.addEventListener("equipmentChanged", loadEquipment);

});


// ==========================================
// LOAD EQUIPMENT FROM SUPABASE
// ==========================================

async function loadEquipment() {

    const tableBody = document.getElementById("equipmentTableBody");
    const dashboardBody = document.getElementById("dashboardEquipmentBody");

    const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error("Load equipment error:", error);

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Error loading equipment: ${escapeHtml(error.message)}
                    </td>
                </tr>
            `;
        }

        if (dashboardBody) {
            dashboardBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Error loading equipment: ${escapeHtml(error.message)}
                    </td>
                </tr>
            `;
        }

        return;
    }

    // Keep all equipment records
    const allEquipment = data || [];

    // ======================================
    // SEARCH AND FILTER
    // ======================================

    const searchInput = document.getElementById("equipmentSearch");
    const filterInput = document.getElementById("availabilityFilter");

    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const availability = filterInput
        ? filterInput.value
        : "All";

    // Filter only the Equipment page
    const filteredEquipment = allEquipment.filter(item => {

        const matchesSearch =
            String(item.equipment_name || "").toLowerCase().includes(searchText) ||
            String(item.category || "").toLowerCase().includes(searchText) ||
            String(item.asset_code || "").toLowerCase().includes(searchText);

        const matchesAvailability =
            !availability ||
            availability === "All" ||
            item.availability === availability;

        return matchesSearch && matchesAvailability;

    });


    // ======================================
    // DISPLAY EQUIPMENT TABLE
    // ======================================

    if (tableBody) {

        tableBody.innerHTML = "";

        if (filteredEquipment.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No equipment found.</td>
                </tr>
            `;

        } else {

            filteredEquipment.forEach(item => {

                tableBody.innerHTML += `
                    <tr>

                        <td>
                            ${escapeHtml(item.asset_code)}
                        </td>

                        <td>
                            ${escapeHtml(item.equipment_name)}
                        </td>

                        <td>
                            ${escapeHtml(item.category)}
                        </td>

                        <td>
                            ${escapeHtml(item.condition || "Good")}
                        </td>

                        <td>
                            ${escapeHtml(item.availability || "Available")}
                        </td>

                        <td>
                            <button
                                type="button"
                                onclick="deleteEquipment(${Number(item.id)})"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;

            });

        }

    }


    // ======================================
    // DISPLAY DASHBOARD RECENT EQUIPMENT
    // ======================================

    if (dashboardBody) {

        dashboardBody.innerHTML = "";

        // Always use ALL equipment records here.
        // Do not use filteredEquipment.

        if (allEquipment.length === 0) {

            dashboardBody.innerHTML = `
                <tr>
                    <td colspan="5">No equipment records yet.</td>
                </tr>
            `;

        } else {

            allEquipment.slice(0, 5).forEach(item => {

                dashboardBody.innerHTML += `
                    <tr>

                        <td>
                            ${escapeHtml(item.asset_code)}
                        </td>

                        <td>
                            ${escapeHtml(item.equipment_name)}
                        </td>

                        <td>
                            ${escapeHtml(item.category)}
                        </td>

                        <td>
                            ${escapeHtml(item.condition || "Good")}
                        </td>

                        <td>
                            ${escapeHtml(item.availability || "Available")}
                        </td>

                    </tr>
                `;

            });

        }

    }


    // ======================================
    // UPDATE DASHBOARD STATISTICS
    // ======================================

    updateEquipmentStats(allEquipment);

    await updateOverdueStats();


    // ======================================
    // UPDATE BORROWING DROPDOWN
    // ======================================

    const borrowEquipment = document.getElementById("borrowEquipment");

    if (borrowEquipment) {

        const availableEquipment = allEquipment.filter(
            item => item.availability === "Available"
        );

        borrowEquipment.innerHTML = `
            <option value="">Select Available Equipment</option>
        `;

        availableEquipment.forEach(item => {

            borrowEquipment.innerHTML += `
                <option value="${Number(item.id)}">
                    ${escapeHtml(item.equipment_name)}
                    - ${escapeHtml(item.asset_code)}
                </option>
            `;

        });

    }

}


// ==========================================
// ADD EQUIPMENT
// ==========================================

async function addEquipment() {

    const name = document.getElementById("equipmentName").value.trim();

    const category = document.getElementById("equipmentCategory").value;

    const assetCode = document.getElementById("assetCode").value.trim();

    const condition = document.getElementById("equipmentCondition").value;

    const message = document.getElementById("equipmentMessage");

    // Validate required fields
    if (!name || !category || !assetCode) {

        showMessage(
            message,
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    // Check authenticated user
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {

        showMessage(
            message,
            "You are not logged in. Please log in again.",
            "error"
        );

        return;
    }


    // Insert equipment into Supabase
    const { data, error } = await supabase
        .from("equipment")
        .insert({
            equipment_name: name,
            category: category,
            asset_code: assetCode,
            condition: condition || "Good",
            availability: "Available"
        })
        .select()
        .single();


    if (error) {

        console.error("ADD EQUIPMENT ERROR:", error);

        showMessage(
            message,
            "Failed to add equipment: " + error.message,
            "error"
        );

        return;
    }


    console.log("Equipment added successfully:", data);

    showMessage(
        message,
        "Equipment added successfully!",
        "success"
    );


    // Clear form
    document.getElementById("equipmentForm").reset();


    // Reload equipment and dashboard
    await loadEquipment();

    alert("Equipment added successfully!");

}


// ==========================================
// DELETE EQUIPMENT
// ==========================================

async function deleteEquipment(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this equipment?"
    );

    if (!confirmDelete) {
        return;
    }


    const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);


    if (error) {

        console.error("DELETE EQUIPMENT ERROR:", error);

        alert(
            "Failed to delete equipment: " + error.message
        );

        return;
    }


    alert("Equipment deleted successfully!");

    await loadEquipment();

}


// ==========================================
// UPDATE EQUIPMENT STATISTICS
// ==========================================

function updateEquipmentStats(equipment) {

    const total = equipment.length;

    const available = equipment.filter(
        item => item.availability === "Available"
    ).length;

    const borrowed = equipment.filter(
        item => item.availability === "Borrowed"
    ).length;


    const totalElement = document.getElementById("totalEquipment");

    const availableElement = document.getElementById("availableEquipment");

    const borrowedElement = document.getElementById("borrowedEquipment");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (availableElement) {
        availableElement.textContent = available;
    }

    if (borrowedElement) {
        borrowedElement.textContent = borrowed;
    }

}


// ==========================================
// UPDATE OVERDUE STATISTICS
// ==========================================

async function updateOverdueStats() {

    const overdueElement = document.getElementById("overdueEquipment");

    if (!overdueElement) {
        return;
    }

    const { data, error } = await supabase
        .from("borrow_transactions")
        .select("id, due_date, date_returned, status");

    if (error) {

        console.error("Overdue statistics error:", error);

        return;
    }

    // Get today's local date
    const today = getLocalDate();

    const overdue = (data || []).filter(transaction => {

        return (
            !transaction.date_returned &&
            transaction.status !== "Returned" &&
            transaction.due_date < today
        );

    }).length;

    overdueElement.textContent = overdue;

}


// ==========================================
// GET LOCAL DATE
// ==========================================

function getLocalDate() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function showMessage(element, text, type) {

    if (!element) {
        return;
    }

    element.textContent = text;

    element.className = "message " + type;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// MAKE DELETE FUNCTION AVAILABLE TO HTML
// ==========================================

window.deleteEquipment = deleteEquipment;
