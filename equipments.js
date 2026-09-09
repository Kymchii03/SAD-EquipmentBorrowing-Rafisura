import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    loadEquipment();

    const equipmentForm = document.getElementById("equipmentForm");

    if (equipmentForm) {
        equipmentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await addEquipment();
        });
    }

    // Search
    const search = document.getElementById("equipmentSearch");
    const filter = document.getElementById("availabilityFilter");

    if (search) {
        search.addEventListener("input", loadEquipment);
    }

    if (filter) {
        filter.addEventListener("change", loadEquipment);
    }
});


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
                    <td colspan="7">
                        Error loading equipment: ${error.message}
                    </td>
                </tr>
            `;
        }

        return;
    }

    let equipment = data || [];

    // Search
    const searchInput = document.getElementById("equipmentSearch");
    const filterInput = document.getElementById("availabilityFilter");

    const searchText = searchInput
        ? searchInput.value.toLowerCase()
        : "";

    const availability = filterInput
        ? filterInput.value
        : "";

    equipment = equipment.filter(item => {

        const matchesSearch =
            item.equipment_name.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText) ||
            item.asset_code.toLowerCase().includes(searchText);

        const matchesAvailability =
            !availability ||
            item.availability === availability;

        return matchesSearch && matchesAvailability;
    });


    // Equipment table
    if (tableBody) {
        tableBody.innerHTML = "";

        if (equipment.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No equipment found.</td>
                </tr>
            `;
        } else {

            equipment.forEach(item => {

                tableBody.innerHTML += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${escapeHtml(item.equipment_name)}</td>
                        <td>${escapeHtml(item.category)}</td>
                        <td>${escapeHtml(item.asset_code)}</td>
                        <td>${escapeHtml(item.condition || "Good")}</td>
                        <td>${escapeHtml(item.availability || "Available")}</td>
                        <td>
                            <button onclick="deleteEquipment(${item.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }


    // Dashboard table
    if (dashboardBody) {
        dashboardBody.innerHTML = "";

        equipment.slice(0, 5).forEach(item => {

            dashboardBody.innerHTML += `
                <tr>
                    <td>${escapeHtml(item.equipment_name)}</td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(item.asset_code)}</td>
                    <td>${escapeHtml(item.availability || "Available")}</td>
                </tr>
            `;
        });
    }


    // Update dashboard numbers
    updateEquipmentStats(data || []);

    // Update borrowing dropdown
    const borrowEquipment = document.getElementById("borrowEquipment");

    if (borrowEquipment) {

        const availableEquipment = (data || []).filter(
            item => item.availability === "Available"
        );

        borrowEquipment.innerHTML =
            `<option value="">Select equipment</option>`;

        availableEquipment.forEach(item => {

            borrowEquipment.innerHTML += `
                <option value="${item.id}">
                    ${escapeHtml(item.equipment_name)}
                    - ${escapeHtml(item.asset_code)}
                </option>
            `;
        });
    }
}


async function addEquipment() {

    const name = document.getElementById("equipmentName").value.trim();
    const category = document.getElementById("equipmentCategory").value.trim();
    const assetCode = document.getElementById("assetCode").value.trim();
    const condition = document.getElementById("equipmentCondition").value;

    const message = document.getElementById("equipmentMessage");


    // Check required fields
    if (!name || !category || !assetCode) {

        if (message) {
            message.textContent =
                "Please fill in all required fields.";
        }

        return;
    }


    // Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {

        if (message) {
            message.textContent =
                "You are not logged in.";
        }

        return;
    }


    // Insert equipment
    const { data, error } = await supabase
        .from("equipment")
        .insert([
            {
                equipment_name: name,
                category: category,
                asset_code: assetCode,
                condition: condition || "Good",
                availability: "Available"
            }
        ])
        .select();


    if (error) {

        console.error("ADD EQUIPMENT ERROR:", error);

        if (message) {
            message.textContent =
                "Failed to add equipment: " + error.message;
        }

        alert("Failed to add equipment:\n\n" + error.message);

        return;
    }


    console.log("Equipment added:", data);


    if (message) {
        message.textContent =
            "Equipment added successfully!";
    }


    alert("Equipment added successfully!");


    // Clear form
    document.getElementById("equipmentForm").reset();


    // Reload table
    await loadEquipment();
}


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

        console.error("Delete error:", error);

        alert(
            "Failed to delete equipment:\n\n" +
            error.message
        );

        return;
    }


    alert("Equipment deleted.");

    await loadEquipment();
}


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


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Make deleteEquipment available to HTML buttons
window.deleteEquipment = deleteEquipment;