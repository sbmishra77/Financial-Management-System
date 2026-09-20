// =========================================
// VEHICLE MANAGEMENT MODULE
// =========================================

import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("🚗 vehicle.js loaded");


// =========================================
// ADD VEHICLE FORM
// =========================================

document.addEventListener("DOMContentLoaded", function () {


// =========================================
// VEHICLE SUB-VIEW DISPLAY HELPER
// =========================================

function hideVehicleElement(element) {

    if (element) {

        element.style.setProperty(
            "display",
            "none",
            "important"
        );

    }

}


function showVehicleElement(
    element,
    displayValue = "block"
) {

    if (element) {

        element.style.setProperty(
            "display",
            displayValue,
            "important"
        );

    }

}

// =========================================
// LOAD VEHICLE OPERATIONAL EXPENSES
// =========================================

async function loadVehicleOperationalExpenses() {
    console.log("🚗 OPERATIONAL EXPENSE FUNCTION STARTED");

    console.log("🚗 CURRENT USER:", auth.currentUser);
    if (!auth.currentUser) {
        console.log("User not logged in.");
        return;
    }

    try {

        const transactionsRef =
            collection(
                db,
                "users",
                auth.currentUser.uid,
                "transactions"
            );

            console.log("🚗 TRANSACTIONS COLLECTION READY:", 
                transactionsRef
            );
        const snapshot =
            await getDocs(transactionsRef);

            console.log(
    "🚗 TRANSACTIONS FOUND:",
    snapshot.size
);

snapshot.forEach((docSnapshot) => {

    console.log(
        "🚗 FIRESTORE TRANSACTION:",
        docSnapshot.id,
        docSnapshot.data()
    );

});

        const operationalCategories = [
            "Vehicle Fuel",
            "Vehicle Insurance",
            "Vehicle Maintenance",
            "Vehicle Challan",
            "Vehicle Other Expense"
        ];

        const vehicleExpenses = {};

        snapshot.forEach((docSnapshot) => {

            const transaction =
                docSnapshot.data();

            if (
                transaction.type !== "expense" ||
                !operationalCategories.includes(
                    transaction.category
                ) ||
                !transaction.vehicleId
            ) {
                return;
            }

            const amount =
                Number(transaction.amount || 0);

            if (!vehicleExpenses[transaction.vehicleId]) {
                vehicleExpenses[transaction.vehicleId] = 0;
            }

            vehicleExpenses[transaction.vehicleId] += amount;

        });

        console.log(
            "🚗 Vehicle Operational Expenses:",
            vehicleExpenses
        );

        const bikeExpenseElement =
    document.getElementById(
        "bikeOperationalExpense"
    );

if (bikeExpenseElement) {

    const vehicles =
        JSON.parse(
            localStorage.getItem(
                "financialERP_vehicles"
            ) || "[]"
        );

    const bikeVehicles =
        vehicles.filter(
            vehicle =>
                vehicle.vehicleType ===
                "Bike / Two Wheeler"
        );

    const totalBikeExpense =
        bikeVehicles.reduce(
            (total, vehicle) => {

                return (
                    total +
                    Number(
                        vehicleExpenses[
                            vehicle.id
                        ] || 0
                    )
                );

            },
            0
        );

    bikeExpenseElement.textContent =
        `₹${totalBikeExpense.toLocaleString("en-IN")}`;

}
        return vehicleExpenses;

    } catch (error) {

        console.error(
            "Error loading vehicle operational expenses:",
            error
        );

        return {};

    }
}

    const addVehicleButton =
        document.getElementById(
            "addVehicleButton"
        );

        const backToVehicleManagementButton =
    document.getElementById(
        "backToVehicleManagementButton"
    );

    const vehicleFormContainer =
        document.getElementById(
            "vehicleFormContainer"
        );

    const cancelVehicleButton =
        document.getElementById(
            "cancelVehicleButton"
        );


    // -----------------------------------------
    // ADD VEHICLE
    // -----------------------------------------

if (
    addVehicleButton &&
    vehicleFormContainer
) {

    addVehicleButton.addEventListener(
        "click",
        function () {

            resetVehiclePhoto();

            // =====================================
            // GET VEHICLE SCREEN ELEMENTS
            // =====================================

            const vehicleHeader =
                document.querySelector(
                    ".vehicles-section-header"
                );

            const vehicleSummary =
                document.getElementById(
                    "vehicleSummary"
                );

            const vehicleGrid =
                document.getElementById(
                    "vehicleTypeGrid"
                );

            const vehiclesList =
                document.getElementById(
                    "vehiclesListContainer"
                );


            // =====================================
            // HIDE ALL VEHICLE CARDS / VIEWS
            // =====================================

            hideVehicleElement(
                vehicleHeader
            );

            hideVehicleElement(
                vehicleSummary
            );

            hideVehicleElement(
                vehicleGrid
            );

            hideVehicleElement(
                vehiclesList
            );


            // =====================================
            // SHOW ADD VEHICLE FORM
            // =====================================

            showVehicleElement(
                vehicleFormContainer,
                "block"
            );


            if (backToVehicleManagementButton) {

    backToVehicleManagementButton.style.setProperty(
        "display",
        "inline-block",
        "important"
    );

}
            // =====================================
            // SCROLL TO FORM
            // =====================================

            vehicleFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            console.log(
                "➕ ADD NEW VEHICLE FORM OPENED"
            );

        }
    );

}

    // -----------------------------------------
    // CANCEL VEHICLE
    // -----------------------------------------

    if (
        cancelVehicleButton &&
        vehicleFormContainer
    ) {

        cancelVehicleButton.addEventListener(
            "click",
            function () {

                vehicleFormContainer.style.display =
                    "none";

                console.log(
                    "❌ ADD VEHICLE FORM CLOSED"
                );

            }
        );

    }
// =========================================
// SAVE / UPDATE VEHICLE
// =========================================

const saveVehicleButton =
    document.getElementById(
        "saveVehicleButton"
    );


if (saveVehicleButton) {

    saveVehicleButton.addEventListener(
        "click",
        function () {

            // =====================================
            // GET REQUIRED FIELD
            // =====================================

            const registrationNumber =
                document.getElementById(
                    "vehicleRegistrationNumber"
                )?.value.trim();


            const vehicleType =
                document.getElementById(
                    "vehicleType"
                )?.value;


            // =====================================
            // BASIC VALIDATION
            // =====================================

            if (!registrationNumber) {

                alert(
                    "Please enter Vehicle Registration Number."
                );

                document
                    .getElementById(
                        "vehicleRegistrationNumber"
                    )
                    ?.focus();

                return;

            }


            if (!vehicleType) {

                alert(
                    "Please select Vehicle Type."
                );

                document
                    .getElementById(
                        "vehicleType"
                    )
                    ?.focus();

                return;

            }


            // =====================================
            // GET EXISTING VEHICLES
            // =====================================

            let vehicles =
                JSON.parse(
                    localStorage.getItem(
                        "financialERP_vehicles"
                    ) || "[]"
                );


            // =====================================
            // CHECK EDIT MODE
            // =====================================

            const editingVehicleId =
                vehicleFormContainer.dataset
                    .editingVehicleId || "";


            const isEditMode =
                Boolean(
                    editingVehicleId
                );

// Vehicle photo
const existingVehicle = isEditMode
    ? vehicles.find(
        v => v.id === vehicleFormContainer.dataset.editingVehicleId
      )
    : null;

const pendingVehicleImage =
    vehicleFormContainer.dataset.pendingVehicleImage || "";

const vehicleImage =
    pendingVehicleImage ||
    existingVehicle?.imageUrl ||
    "";

            console.log(
                "🚗 VEHICLE SAVE MODE:",
                isEditMode
                    ? "UPDATE"
                    : "NEW"
            );


            // =====================================
            // DUPLICATE REGISTRATION CHECK
            // =====================================
            // In Edit mode, ignore the same vehicle
            // =====================================

            const duplicateVehicle =
                vehicles.some(
                    vehicle => {

                        const sameRegistration =
                            vehicle.registrationNumber
                                ?.toUpperCase() ===
                            registrationNumber
                                .toUpperCase();

                        const differentVehicle =
                            vehicle.id !==
                            editingVehicleId;

                        return (
                            sameRegistration &&
                            differentVehicle
                        );

                    }
                );


            if (duplicateVehicle) {

                alert(
                    "This vehicle registration number already exists."
                );

                return;

            }


            // =====================================
            // CREATE / UPDATE VEHICLE OBJECT
            // =====================================

            const vehicle = {

                // ---------------------------------
                // KEEP EXISTING ID DURING EDIT
                // ---------------------------------

                id:
                    isEditMode
                        ? editingVehicleId
                        : (
                            "VEH_" +
                            Date.now()
                        ),


                registrationNumber:
                    registrationNumber.toUpperCase(),


                vehicleType:
                    vehicleType,

imageUrl:
    vehicleFormContainer.dataset.pendingVehicleImage ||
    (
        isEditMode
            ? (
                vehicles.find(
                    item =>
                        item.id ===
                        editingVehicleId
                )?.imageUrl || ""
            )
            : ""
    ),


                manufacturer:
                    document.getElementById(
                        "vehicleManufacturer"
                    )?.value.trim() || "",


                model:
                    document.getElementById(
                        "vehicleModel"
                    )?.value.trim() || "",


                colour:
                    document.getElementById(
                        "vehicleColour"
                    )?.value.trim() || "",


                bodyType:
                    document.getElementById(
                        "vehicleBodyType"
                    )?.value.trim() || "",


                fuelType:
                    document.getElementById(
                        "vehicleFuelType"
                    )?.value.trim() || "",


                seatingCapacity:
                    document.getElementById(
                        "vehicleSeatingCapacity"
                    )?.value || "",


                cubicCapacity:
                    document.getElementById(
                        "vehicleCubicCapacity"
                    )?.value || "",


                power:
                    document.getElementById(
                        "vehiclePower"
                    )?.value.trim() || "",


                wheelBase:
                    document.getElementById(
                        "vehicleWheelBase"
                    )?.value || "",


                unladenWeight:
                    document.getElementById(
                        "vehicleUnladenWeight"
                    )?.value || "",


                cylinders:
                    document.getElementById(
                        "vehicleCylinders"
                    )?.value || "",


                manufacturingDate:
                    document.getElementById(
                        "vehicleManufacturingDate"
                    )?.value.trim() || "",


                // =================================
                // RC DETAILS
                // =================================

                registrationDate:
                    document.getElementById(
                        "vehicleRegistrationDate"
                    )?.value.trim() || "",


                rcValidTill:
                    document.getElementById(
                        "vehicleRcValidTill"
                    )?.value.trim() || "",


                chassisNumber:
                    document.getElementById(
                        "vehicleChassisNumber"
                    )?.value.trim() || "",


                engineNumber:
                    document.getElementById(
                        "vehicleEngineNumber"
                    )?.value.trim() || "",


                ownerName:
                    document.getElementById(
                        "vehicleOwnerName"
                    )?.value.trim() || "",


                ownerRelation:
                    document.getElementById(
                        "vehicleOwnerRelation"
                    )?.value.trim() || "",


                ownership:
                    document.getElementById(
                        "vehicleOwnership"
                    )?.value || "",


                emissionNorm:
                    document.getElementById(
                        "vehicleEmissionNorm"
                    )?.value.trim() || "",


                registrationAuthority:
                    document.getElementById(
                        "vehicleRegistrationAuthority"
                    )?.value.trim() || "",


                registeredAddress:
                    document.getElementById(
                        "vehicleRegisteredAddress"
                    )?.value.trim() || "",


                // =================================
                // PURCHASE DETAILS
                // =================================

                purchaseDate:
                    document.getElementById(
                        "vehiclePurchaseDate"
                    )?.value.trim() || "",


                purchasePrice:
                    document.getElementById(
                        "vehiclePurchasePrice"
                    )?.value || "",


                currentValue:
                    document.getElementById(
                        "vehicleCurrentValue"
                    )?.value || "",


                // =================================
                // INSURANCE DETAILS
                // =================================

                insuranceCompany:
                    document.getElementById(
                        "vehicleInsuranceCompany"
                    )?.value.trim() || "",


                insurancePolicyNumber:
                    document.getElementById(
                        "vehicleInsurancePolicyNumber"
                    )?.value.trim() || "",


                insuranceType:
                    document.getElementById(
                        "vehicleInsuranceType"
                    )?.value || "",


                insuranceStartDate:
                    document.getElementById(
                        "vehicleInsuranceStartDate"
                    )?.value.trim() || "",


                insuranceExpiryDate:
                    document.getElementById(
                        "vehicleInsuranceExpiryDate"
                    )?.value.trim() || "",


                insuranceIdv:
                    document.getElementById(
                        "vehicleInsuranceIdv"
                    )?.value || "",


                insurancePremium:
                    document.getElementById(
                        "vehicleInsurancePremium"
                    )?.value || "",


                thirdPartyExpiry:
                    document.getElementById(
                        "vehicleThirdPartyExpiry"
                    )?.value.trim() || "",


                // =================================
                // CREATED DATE
                // =================================

                createdAt:
                    isEditMode
                        ? (
                            vehicles.find(
                                item =>
                                    item.id ===
                                    editingVehicleId
                            )?.createdAt ||
                            new Date().toISOString()
                        )
                        : new Date().toISOString()

            };


            // =====================================
            // NEW VEHICLE OR UPDATE EXISTING
            // =====================================

            if (isEditMode) {

                const vehicleIndex =
                    vehicles.findIndex(
                        item =>
                            item.id ===
                            editingVehicleId
                    );


                if (vehicleIndex === -1) {

                    alert(
                        "Vehicle not found for update."
                    );

                    return;

                }


                // Replace existing vehicle

                vehicles[vehicleIndex] =
                    vehicle;


                console.log(
                    "✏️ VEHICLE UPDATED:",
                    vehicle
                );

            }
            else {

                // Add new vehicle

                vehicles.push(
                    vehicle
                );


                console.log(
                    "🚗 VEHICLE CREATED:",
                    vehicle
                );

            }


            // =====================================
            // SAVE TO LOCAL STORAGE
            // =====================================

            localStorage.setItem(
                "financialERP_vehicles",
                JSON.stringify(vehicles)
            );


            // =====================================
            // SUCCESS MESSAGE
            // =====================================

            alert(
                isEditMode
                    ? "✅ Vehicle updated successfully!"
                    : "✅ Vehicle saved successfully!"
            );


            console.log(
                "📦 TOTAL VEHICLES:",
                vehicles.length
            );


            // =====================================
            // CLOSE FORM
            // =====================================

            vehicleFormContainer.style.setProperty(
                "display",
                "none",
                "important"
            );


            // =====================================
            // RESTORE VEHICLE MANAGEMENT SCREEN
            // =====================================

            const vehicleHeader =
                document.querySelector(
                    ".vehicles-section-header"
                );


            if (vehicleHeader) {

                vehicleHeader.style.setProperty(
                    "display",
                    "flex",
                    "important"
                );

            }


            const vehicleGrid =
                document.getElementById(
                    "vehicleTypeGrid"
                );


            if (vehicleGrid) {

                vehicleGrid.style.setProperty(
                    "display",
                    "grid",
                    "important"
                );

            }


            // =====================================
            // HIDE VEHICLE MASTER
            // =====================================

            const vehiclesList =
                document.getElementById(
                    "vehiclesListContainer"
                );


            hideVehicleElement(
                vehiclesList
            );


            // =====================================
            // HIDE BACK BUTTON
            // =====================================

            const backButton =
                document.getElementById(
                    "backToVehicleManagementButton"
                );


            if (backButton) {

                backButton.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // =====================================
            // RESET EDIT MODE
            // =====================================

            delete vehicleFormContainer
                .dataset
                .editingVehicleId;

// =====================================
// RESET VEHICLE PHOTO
// =====================================

delete vehicleFormContainer
    .dataset
    .pendingVehicleImage;

const savedImageInput =
    document.getElementById("vehicleImageInput");

const savedImagePreview =
    document.getElementById("vehicleImagePreview");

if (savedImageInput) {

    savedImageInput.value = "";

}

if (savedImagePreview) {

    savedImagePreview.innerHTML = `
        <span>🚗</span>
        <p>No photo selected</p>
    `;

}

            // =====================================
            // RESTORE SAVE BUTTON TEXT
            // =====================================

            saveVehicleButton.textContent =
                "💾 Save Vehicle";


            // =====================================
            // RESTORE FORM HEADING
            // =====================================

            const formHeading =
                vehicleFormContainer.querySelector(
                    ".vehicle-form-header h3"
                );


            if (formHeading) {

                formHeading.textContent =
                    "➕ Add Vehicle";

            }


            // =====================================
            // RESET FORM
            // =====================================

            vehicleFormContainer
                .querySelectorAll(
                    "input, select, textarea"
                )
                .forEach(
                    field => {

                        field.value = "";

                    }
                );


            console.log(
                "🔄 VEHICLE FORM RESET"
            );

        }
    );

}

// =========================================
// FIREBASE AUTH STATE
// =========================================

auth.onAuthStateChanged((user) => {

    if (!user) {
        console.log("🚗 Firebase user not available yet.");
        return;
    }

    console.log(
        "🚗 Firebase user ready:",
        user.uid
    );

    loadVehicleOperationalExpenses();

});

// =========================================================
// VEHICLE PHOTO UPLOAD - PREVIEW
// =========================================================

const vehicleImageInput = document.getElementById("vehicleImageInput");
const vehicleImagePreview = document.getElementById("vehicleImagePreview");

// =========================================================
// VEHICLE PHOTO - COMPRESS + PREVIEW
// =========================================================

if (vehicleImageInput) {

    vehicleImageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        // Validate image
        if (!file.type.startsWith("image/")) {

            alert("❌ Please select a valid image file.");

            this.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                // Maximum image width
                const maxWidth = 1200;

                let width = img.width;
                let height = img.height;

                // Resize if image is too large
                if (width > maxWidth) {

                    height = Math.round(
                        height * (maxWidth / width)
                    );

                    width = maxWidth;
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                // Compress image
                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.75
                    );

                // Store temporarily for Save
                vehicleFormContainer.dataset.pendingVehicleImage =
                    compressedImage;

                // Show preview
                if (vehicleImagePreview) {

                    vehicleImagePreview.innerHTML = `
                        <img
                            src="${compressedImage}"
                            alt="Vehicle Photo Preview"
                        >
                    `;

                }

            };

            img.src = event.target.result;

        };

        reader.readAsDataURL(file);

    });

}

// =========================================================
// RESET VEHICLE PHOTO
// =========================================================

function resetVehiclePhoto() {

    const imageInput = document.getElementById("vehicleImageInput");
    const imagePreview = document.getElementById("vehicleImagePreview");

    if (imageInput) {
        imageInput.value = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = `
            <span>🚗</span>
            <p>No photo selected</p>
        `;
    }

}

// =========================================
// VIEW ALL VEHICLES
// =========================================

const viewAllVehiclesButton =
    document.getElementById(
        "viewAllVehiclesButton"
    );

const vehiclesListContainer =
    document.getElementById(
        "vehiclesListContainer"
    );


function loadVehicleMaster() {

    const vehicles =
        JSON.parse(
            localStorage.getItem(
                "financialERP_vehicles"
            ) || "[]"
        );


    // =====================================
    // NO VEHICLES
    // =====================================

    if (vehicles.length === 0) {

        vehiclesListContainer.innerHTML = `

            <div class="vehicle-master-empty">

                <div class="vehicle-master-empty-icon">
                    🚗
                </div>

                <h4>
                    No Vehicles Added
                </h4>

                <p>
                    Add your first vehicle to create
                    your Vehicle Master.
                </p>

            </div>

        `;

        return;
    }


    // =====================================
    // VEHICLE CARDS
    // =====================================

    vehiclesListContainer.innerHTML = `

        <div class="vehicle-master-header">

            <div class="vehicle-master-title">

                <h3>
                    🚗 My Vehicles
                </h3>

                <p>
                    Vehicle Master •
                    ${vehicles.length}
                    vehicle${vehicles.length > 1 ? "s" : ""}
                </p>

            </div>

        </div>


        <div class="vehicle-master-grid">

            ${vehicles.map(vehicle => `

                <div class="vehicle-master-card">

                    <div class="vehicle-master-card-top">

                        <div class="vehicle-master-name">

                            <div class="vehicle-master-icon">
                                ${
                                    vehicle.vehicleType ===
                                    "Bike / Two Wheeler"
                                        ? "🏍️"
                                        : vehicle.vehicleType ===
                                          "SUV / MUV"
                                            ? "🚙"
                                            : vehicle.vehicleType ===
                                              "Commercial"
                                                ? "🚚"
                                                : "🚗"
                                }
                            </div>


                            <div>

                                <h4>
                                    ${
                                        vehicle.manufacturer ||
                                        "Vehicle"
                                    }
                                    ${
                                        vehicle.model
                                            ? " " +
                                              vehicle.model
                                            : ""
                                    }
                                </h4>

                                <span>
                                    ${
                                        vehicle.vehicleType ||
                                        "Vehicle"
                                    }
                                </span>

                            </div>

                        </div>


                        <div class="vehicle-registration-badge">

                            ${
                                vehicle.registrationNumber ||
                                "—"
                            }

                        </div>

                    </div>


                    <div class="vehicle-master-details">


                        <div class="vehicle-master-detail">

                            <label>
                                Fuel Type
                            </label>

                            <span>
                                ${
                                    vehicle.fuelType ||
                                    "—"
                                }
                            </span>

                        </div>


                        <div class="vehicle-master-detail">

                            <label>
                                Colour
                            </label>

                            <span>
                                ${
                                    vehicle.colour ||
                                    "—"
                                }
                            </span>

                        </div>


                        <div class="vehicle-master-detail">

                            <label>
                                Owner
                            </label>

                            <span>
                                ${
                                    vehicle.ownerName ||
                                    "—"
                                }
                            </span>

                        </div>


                        <div class="vehicle-master-detail">

                            <label>
                                RC Valid Till
                            </label>

                            <span>
                                ${
                                    vehicle.rcValidTill ||
                                    "—"
                                }
                            </span>

                        </div>


                        <div class="vehicle-master-detail">

                            <label>
                                Engine No.
                            </label>

                            <span>
                                ${
                                    vehicle.engineNumber ||
                                    "—"
                                }
                            </span>

                        </div>


                        <div class="vehicle-master-detail">

                            <label>
                                Chassis No.
                            </label>

                            <span>
                                ${
                                    vehicle.chassisNumber ||
                                    "—"
                                }
                            </span>

                        </div>

                    </div>


                    <div class="vehicle-master-status">


                        <div class="vehicle-document-status">

                            <label>
                                📄 RC
                            </label>

                            <span>
                                ${
                                    vehicle.rcValidTill
                                        ? "Available"
                                        : "Details Pending"
                                }
                            </span>

                        </div>


                        <div class="vehicle-document-status">

                            <label>
                                🛡️ Insurance
                            </label>

                            <span>
                                ${
                                    vehicle.insuranceCompany
                                        ? vehicle.insuranceCompany
                                        : "Details Pending"
                                }
                            </span>

                        </div>


                    </div>
<div class="vehicle-master-actions">

    <button
        type="button"
        class="vehicle-view-details-button"
        data-vehicle-id="${vehicle.id}">

        👁️ View Details

    </button>


    <button
        type="button"
        class="vehicle-edit-button"
        data-vehicle-id="${vehicle.id}">

        ✏️ Edit

    </button>


    <button
        type="button"
        class="vehicle-delete-button"
        data-vehicle-id="${vehicle.id}">

        🗑️ Delete

    </button>

</div>
                </div>

            `).join("")}

        </div>

    `;
}


// =========================================
// VIEW ALL BUTTON
// =========================================

if (viewAllVehiclesButton) {

    viewAllVehiclesButton.addEventListener(
        "click",
        function () {

            // =====================================
            // GET ALL VEHICLE SCREEN ELEMENTS
            // =====================================

            const vehicleHeader =
                document.querySelector(
                    ".vehicles-section-header"
                );

            const vehicleSummary =
                document.getElementById(
                    "vehicleSummary"
                );

            const vehicleGrid =
                document.getElementById(
                    "vehicleTypeGrid"
                );

            const vehicleForm =
                document.getElementById(
                    "vehicleFormContainer"
                );


            // =====================================
            // HIDE ALL OTHER VEHICLE VIEWS
            // =====================================

            hideVehicleElement(
                vehicleHeader
            );

            hideVehicleElement(
                vehicleSummary
            );

            hideVehicleElement(
                vehicleGrid
            );

            hideVehicleElement(
                vehicleForm
            );


            // =====================================
            // SHOW VEHICLE MASTER ONLY
            // =====================================

            if (backToVehicleManagementButton) {

    backToVehicleManagementButton.style.setProperty(
        "display",
        "inline-block",
        "important"
    );

}
            showVehicleElement(
                vehiclesListContainer,
                "block"
            );


            // =====================================
            // LOAD VEHICLES
            // =====================================

            loadVehicleMaster();


            // =====================================
            // SCROLL TO VEHICLE MASTER
            // =====================================

            vehiclesListContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            console.log(
                "🚗 VEHICLE MASTER OPENED"
            );

        }
    );

}

// =========================================
// BACK TO VEHICLE MANAGEMENT
// =========================================

if (backToVehicleManagementButton) {

    backToVehicleManagementButton.addEventListener(
        "click",
        function () {

            // =====================================
            // HIDE SUB-VIEWS
            // =====================================

            const vehicleForm =
                document.getElementById(
                    "vehicleFormContainer"
                );

            const vehiclesList =
                document.getElementById(
                    "vehiclesListContainer"
                );

            const vehicleSummary =
                document.getElementById(
                    "vehicleSummary"
                );


            hideVehicleElement(
                vehicleForm
            );

            hideVehicleElement(
                vehiclesList
            );

            hideVehicleElement(
                vehicleSummary
            );


            // =====================================
            // SHOW MAIN VEHICLE SCREEN
            // =====================================

            const vehicleHeader =
                document.querySelector(
                    ".vehicles-section-header"
                );

            const vehicleGrid =
                document.getElementById(
                    "vehicleTypeGrid"
                );


            if (vehicleHeader) {

                vehicleHeader.style.setProperty(
                    "display",
                    "flex",
                    "important"
                );

            }


            if (vehicleGrid) {

                vehicleGrid.style.setProperty(
                    "display",
                    "grid",
                    "important"
                );

            }


            // =====================================
            // HIDE BACK TO VEHICLE BUTTON
            // =====================================

            backToVehicleManagementButton.style.setProperty(
                "display",
                "none",
                "important"
            );


            console.log(
                "🚗 BACK TO VEHICLE MANAGEMENT"
            );

        }
    );

}

// =========================================
// VIEW VEHICLE DETAILS
// =========================================

// =========================================
// VIEW VEHICLE DETAILS
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const viewButton =
            event.target.closest(
                ".vehicle-view-details-button"
            );


        if (!viewButton) {

            return;

        }


        const vehicleId =
            viewButton.dataset.vehicleId;


        if (!vehicleId) {

            console.error(
                "❌ Vehicle ID not found"
            );

            return;

        }


        const vehicles =
            JSON.parse(
                localStorage.getItem(
                    "financialERP_vehicles"
                ) || "[]"
            );


        const vehicle =
            vehicles.find(
                item =>
                    item.id === vehicleId
            );


        if (!vehicle) {

            alert(
                "Vehicle not found."
            );

            return;

        }


        console.log(
            "👁️ VEHICLE DETAILS:",
            vehicle
        );


        // =====================================
        // HELPER
        // =====================================

        const displayValue =
            value =>
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
                    ? value
                    : "—";


        const vehicleIcon =
            vehicle.vehicleType ===
            "Bike / Two Wheeler"
                ? "🏍️"
                : vehicle.vehicleType ===
                  "SUV / MUV"
                    ? "🚙"
                    : vehicle.vehicleType ===
                      "Commercial"
                        ? "🚚"
                        : "🚗";


        // =====================================
        // VEHICLE IMAGE
        // =====================================

        const vehicleImage =
    vehicle.imageUrl ||
    "https://cdn.bikedekho.com/processedimages/honda/honda-activa/source/activa-5g-dlx_white_1523890426.jpg?impolicy=resize&imwidth=890";

        const imageHTML =
            vehicleImage
                ? `
                    <img
                        src="${vehicleImage}"
                        alt="${displayValue(
                            vehicle.manufacturer
                        )} ${displayValue(
                            vehicle.model
                        )}"
                        class="vehicle-details-image"
                    >
                  `
                : `
                    <div class="vehicle-image-placeholder">

                        <div class="vehicle-image-placeholder-icon">
                            ${vehicleIcon}
                        </div>

                        <div class="vehicle-image-placeholder-text">
                            Vehicle Image
                        </div>

                    </div>
                  `;


        // =====================================
        // HIDE OTHER VEHICLE VIEWS
        // =====================================

        const vehicleHeader =
            document.querySelector(
                ".vehicles-section-header"
            );

        const vehicleSummary =
            document.getElementById(
                "vehicleSummary"
            );

        const vehicleGrid =
            document.getElementById(
                "vehicleTypeGrid"
            );

        const vehicleForm =
            document.getElementById(
                "vehicleFormContainer"
            );


        hideVehicleElement(
            vehicleHeader
        );

        hideVehicleElement(
            vehicleSummary
        );

        hideVehicleElement(
            vehicleGrid
        );

        hideVehicleElement(
            vehicleForm
        );


        // =====================================
        // SHOW VEHICLE LIST CONTAINER
        // =====================================

        showVehicleElement(
            vehiclesListContainer,
            "block"
        );


        // =====================================
        // BUILD DETAILS SCREEN
        // =====================================

        vehiclesListContainer.innerHTML = `

            <div class="vehicle-details-page">


                <!-- =================================
                     TOP HEADER
                     ================================= -->

                <div class="vehicle-details-top">

                    <div class="vehicle-details-identity">

                        <div class="vehicle-details-mini-icon">

                            ${vehicleIcon}

                        </div>


                        <div>

                            <h1>

                                ${displayValue(
                                    vehicle.manufacturer
                                )}

                                ${displayValue(
                                    vehicle.model
                                )}

                            </h1>


                            <div class="vehicle-details-registration">

                                ${displayValue(
                                    vehicle.registrationNumber
                                )}

                            </div>


                            <div class="vehicle-details-badges">

                                <span class="vehicle-details-badge vehicle-badge-type">

                                    ${displayValue(
                                        vehicle.vehicleType
                                    )}

                                </span>


                                <span class="vehicle-details-badge vehicle-badge-fuel">

                                    🟢 ${displayValue(
                                        vehicle.fuelType
                                    )}

                                </span>


                                <span class="vehicle-details-badge vehicle-badge-active">

                                    ✓ Active

                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="vehicle-details-actions">

                        <button
                            type="button"
                            class="vehicle-details-action-button vehicle-details-edit"
                            data-vehicle-id="${vehicle.id}">

                            ✏️ Edit

                        </button>


                        <button
                            type="button"
                            class="vehicle-details-action-button vehicle-details-delete"
                            data-vehicle-id="${vehicle.id}">

                            🗑️ Delete

                        </button>


                        <button
                            type="button"
                            class="vehicle-details-action-button vehicle-details-print"
                            onclick="window.print()">

                            🖨️ Print

                        </button>

                    </div>

                </div>


                <!-- =================================
                     MAIN DETAILS
                     ================================= -->

                <div class="vehicle-details-main">


    <!-- =================================
         VEHICLE IMAGE
         ================================= -->

    <div class="vehicle-details-image-card">

        ${imageHTML}

    </div>


    <!-- =================================
         VEHICLE INFORMATION + PURCHASE
         ================================= -->

    <div class="vehicle-details-column">


        <!-- VEHICLE INFORMATION -->

        <div class="vehicle-details-card">

            <div class="vehicle-details-card-header vehicle-info-header">

                🚗 Vehicle Information

            </div>


            <div class="vehicle-details-card-body">


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Manufacturer
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.manufacturer)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Model
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.model)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Vehicle Type
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.vehicleType)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Fuel Type
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.fuelType)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Colour
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.colour)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Body Type
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.bodyType)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Seating Capacity
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.seatingCapacity)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Cubic Capacity
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.cubicCapacity)} cc
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Power
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.power)}
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Wheel Base
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.wheelBase)} mm
                    </span>
                </div>


                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">
                        Unladen Weight
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.unladenWeight)} kg
                    </span>
                </div>


            </div>

        </div>


        <!-- =================================
             PURCHASE INFORMATION
             ================================= -->

        <div class="vehicle-details-card">

            <div class="vehicle-details-card-header vehicle-purchase-header">

                💰 Purchase Information

            </div>


            <div class="vehicle-details-card-body">


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Purchase Date
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.purchaseDate)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Purchase Price
                    </span>

                    <span class="vehicle-info-value">
                        ₹${displayValue(vehicle.purchasePrice)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Current Value
                    </span>

                    <span class="vehicle-info-value">
                        ₹${displayValue(vehicle.currentValue)}
                    </span>

                </div>


            </div>

        </div>


    </div>


    <!-- =================================
         RC + INSURANCE
         ================================= -->

    <div class="vehicle-details-column">


        <!-- RC INFORMATION -->

        <div class="vehicle-details-card">

            <div class="vehicle-details-card-header vehicle-rc-header">

                📄 RC Information

            </div>


            <div class="vehicle-details-card-body">


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Registration Number
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.registrationNumber)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Registration Date
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.registrationDate)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        RC Valid Till
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.rcValidTill)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Chassis Number
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.chassisNumber)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Engine Number
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.engineNumber)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Owner Name
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.ownerName)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Ownership
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.ownership)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Emission Norm
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.emissionNorm)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Registration Authority
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.registrationAuthority)}
                    </span>

                </div>


            </div>

        </div>


        <!-- =================================
             INSURANCE INFORMATION
             ================================= -->

        <div class="vehicle-details-card">

            <div class="vehicle-details-card-header vehicle-insurance-header">

                🛡️ Insurance Information

            </div>


            <div class="vehicle-details-card-body">


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Insurance Company
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.insuranceCompany)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Policy Number
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.insurancePolicyNumber)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Policy Type
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.insuranceType)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Policy Start
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.insuranceStartDate)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Policy Expiry
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.insuranceExpiryDate)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        IDV
                    </span>

                    <span class="vehicle-info-value">
                        ₹${displayValue(vehicle.insuranceIdv)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Premium
                    </span>

                    <span class="vehicle-info-value">
                        ₹${displayValue(vehicle.insurancePremium)}
                    </span>

                </div>


                <div class="vehicle-info-row">

                    <span class="vehicle-info-label">
                        Third Party Expiry
                    </span>

                    <span class="vehicle-info-value">
                        ${displayValue(vehicle.thirdPartyExpiry)}
                    </span>

                </div>


            </div>

        </div>


    </div>

</div>


                <!-- =================================
                     IMPORTANT DATES
                     ================================= -->

                <div class="vehicle-important-dates">

                    <div class="vehicle-important-dates-header">

                        📅 Important Dates

                    </div>


                    <div class="vehicle-date-grid">


                        <div class="vehicle-date-box">

                            <span class="vehicle-date-label">
                                Registration Date
                            </span>

                            <span class="vehicle-date-value">
                                ${displayValue(
                                    vehicle.registrationDate
                                )}
                            </span>

                            <span class="vehicle-date-status vehicle-date-valid">
                                Completed
                            </span>

                        </div>


                        <div class="vehicle-date-box">

                            <span class="vehicle-date-label">
                                RC Valid Till
                            </span>

                            <span class="vehicle-date-value">
                                ${displayValue(
                                    vehicle.rcValidTill
                                )}
                            </span>

                            <span class="vehicle-date-status vehicle-date-valid">
                                Valid
                            </span>

                        </div>


                        <div class="vehicle-date-box">

                            <span class="vehicle-date-label">
                                Insurance Expiry
                            </span>

                            <span class="vehicle-date-value">
                                ${displayValue(
                                    vehicle.insuranceExpiryDate
                                )}
                            </span>

                            <span class="vehicle-date-status vehicle-date-valid">
                                Active
                            </span>

                        </div>


                    </div>

                </div>


                <!-- =================================
                     NOTES
                     ================================= -->

                <div class="vehicle-details-notes">

                    <h3>
                        📝 Notes
                    </h3>

                    <div class="vehicle-details-notes-content">

                        ${
                            displayValue(
                                vehicle.notes
                            )
                        }

                    </div>

                </div>


                <!-- =================================
                     FOOTER
                     ================================= -->

                <div class="vehicle-details-footer">

                    <span>
                        Created:
                        ${displayValue(
                            vehicle.createdAt
                        )}
                    </span>


                    <span>
                        Vehicle ID:
                        ${displayValue(
                            vehicle.id
                        )}
                    </span>

                </div>

            </div>

        `;


        // =====================================
        // EDIT FROM DETAILS PAGE
        // =====================================

        const detailsEditButton =
            vehiclesListContainer.querySelector(
                ".vehicle-details-edit"
            );


        if (detailsEditButton) {

            detailsEditButton.addEventListener(
                "click",
                function () {

                    const originalEditButton =
                        document.createElement(
                            "button"
                        );

                    originalEditButton.className =
                        "vehicle-edit-button";

                    originalEditButton.dataset.vehicleId =
                        vehicle.id;

                    originalEditButton.click();

                }
            );

        }


        // =====================================
        // DELETE FROM DETAILS PAGE
        // =====================================

        const detailsDeleteButton =
            vehiclesListContainer.querySelector(
                ".vehicle-details-delete"
            );


        if (detailsDeleteButton) {

            detailsDeleteButton.addEventListener(
                "click",
                function () {

                    const originalDeleteButton =
                        document.createElement(
                            "button"
                        );

                    originalDeleteButton.className =
                        "vehicle-delete-button";

                    originalDeleteButton.dataset.vehicleId =
                        vehicle.id;

                    originalDeleteButton.click();

                }
            );

        }


        console.log(
            "📋 VEHICLE DETAILS SCREEN OPENED:",
            vehicle.registrationNumber
        );


        vehiclesListContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);

// =========================================
// EDIT VEHICLE
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const editButton =
            event.target.closest(
                ".vehicle-edit-button"
            );


        // -------------------------------------
        // NOT VEHICLE EDIT BUTTON
        // -------------------------------------

        if (!editButton) {

            return;

        }


        // -------------------------------------
        // GET VEHICLE ID
        // -------------------------------------

        const vehicleId =
            editButton.dataset.vehicleId;


        if (!vehicleId) {

            console.error(
                "❌ Vehicle ID not found for Edit"
            );

            return;

        }


        // -------------------------------------
        // GET SAVED VEHICLES
        // -------------------------------------

        const vehicles =
            JSON.parse(
                localStorage.getItem(
                    "financialERP_vehicles"
                ) || "[]"
            );


        // -------------------------------------
        // FIND SELECTED VEHICLE
        // -------------------------------------

        const vehicle =
            vehicles.find(
                item =>
                    item.id === vehicleId
            );


        if (!vehicle) {

            alert(
                "Vehicle not found."
            );

            return;

        }


        console.log(
            "✏️ EDIT VEHICLE:",
            vehicle
        );


        // =====================================
        // GET FORM CONTAINER
        // =====================================

        const vehicleFormContainer =
            document.getElementById(
                "vehicleFormContainer"
            );


        if (!vehicleFormContainer) {

            console.error(
                "❌ Vehicle form container not found."
            );

            return;

        }


        // =====================================
        // STORE EDITING VEHICLE ID
        // =====================================

        vehicleFormContainer.dataset.editingVehicleId =
            String(vehicleId);


        // =====================================
        // FILL BASIC VEHICLE DETAILS
        // =====================================

        document.getElementById(
            "vehicleRegistrationNumber"
        ).value =
            vehicle.registrationNumber || "";


        document.getElementById(
            "vehicleType"
        ).value =
            vehicle.vehicleType || "";


        document.getElementById(
            "vehicleManufacturer"
        ).value =
            vehicle.manufacturer || "";


        document.getElementById(
            "vehicleModel"
        ).value =
            vehicle.model || "";


        document.getElementById(
            "vehicleColour"
        ).value =
            vehicle.colour || "";


        document.getElementById(
            "vehicleBodyType"
        ).value =
            vehicle.bodyType || "";


        document.getElementById(
            "vehicleFuelType"
        ).value =
            vehicle.fuelType || "";


        document.getElementById(
            "vehicleSeatingCapacity"
        ).value =
            vehicle.seatingCapacity || "";


        document.getElementById(
            "vehicleCubicCapacity"
        ).value =
            vehicle.cubicCapacity || "";


        document.getElementById(
            "vehiclePower"
        ).value =
            vehicle.power || "";


        document.getElementById(
            "vehicleWheelBase"
        ).value =
            vehicle.wheelBase || "";


        document.getElementById(
            "vehicleUnladenWeight"
        ).value =
            vehicle.unladenWeight || "";


        document.getElementById(
            "vehicleCylinders"
        ).value =
            vehicle.cylinders || "";


        document.getElementById(
            "vehicleManufacturingDate"
        ).value =
            vehicle.manufacturingDate || "";


        // =====================================
        // FILL RC DETAILS
        // =====================================

        document.getElementById(
            "vehicleRegistrationDate"
        ).value =
            vehicle.registrationDate || "";


        document.getElementById(
            "vehicleRcValidTill"
        ).value =
            vehicle.rcValidTill || "";


        document.getElementById(
            "vehicleChassisNumber"
        ).value =
            vehicle.chassisNumber || "";


        document.getElementById(
            "vehicleEngineNumber"
        ).value =
            vehicle.engineNumber || "";


        document.getElementById(
            "vehicleOwnerName"
        ).value =
            vehicle.ownerName || "";


        document.getElementById(
            "vehicleOwnerRelation"
        ).value =
            vehicle.ownerRelation || "";


        document.getElementById(
            "vehicleOwnership"
        ).value =
            vehicle.ownership || "";


        document.getElementById(
            "vehicleEmissionNorm"
        ).value =
            vehicle.emissionNorm || "";


        document.getElementById(
            "vehicleRegistrationAuthority"
        ).value =
            vehicle.registrationAuthority || "";


        document.getElementById(
            "vehicleRegisteredAddress"
        ).value =
            vehicle.registeredAddress || "";


        // =====================================
        // FILL PURCHASE DETAILS
        // =====================================

        document.getElementById(
            "vehiclePurchaseDate"
        ).value =
            vehicle.purchaseDate || "";


        document.getElementById(
            "vehiclePurchasePrice"
        ).value =
            vehicle.purchasePrice || "";


        document.getElementById(
            "vehicleCurrentValue"
        ).value =
            vehicle.currentValue || "";


        // =====================================
        // FILL INSURANCE DETAILS
        // =====================================

        document.getElementById(
            "vehicleInsuranceCompany"
        ).value =
            vehicle.insuranceCompany || "";


        document.getElementById(
            "vehicleInsurancePolicyNumber"
        ).value =
            vehicle.insurancePolicyNumber || "";


        document.getElementById(
            "vehicleInsuranceType"
        ).value =
            vehicle.insuranceType || "";


        document.getElementById(
            "vehicleInsuranceStartDate"
        ).value =
            vehicle.insuranceStartDate || "";


        document.getElementById(
            "vehicleInsuranceExpiryDate"
        ).value =
            vehicle.insuranceExpiryDate || "";


        document.getElementById(
            "vehicleInsuranceIdv"
        ).value =
            vehicle.insuranceIdv || "";


        document.getElementById(
            "vehicleInsurancePremium"
        ).value =
            vehicle.insurancePremium || "";


        document.getElementById(
            "vehicleThirdPartyExpiry"
        ).value =
            vehicle.thirdPartyExpiry || "";


        // =====================================
        // HIDE VEHICLE MASTER SCREEN
        // =====================================

        const vehicleHeader =
            document.querySelector(
                ".vehicles-section-header"
            );

        const vehicleSummary =
            document.getElementById(
                "vehicleSummary"
            );

        const vehicleGrid =
            document.getElementById(
                "vehicleTypeGrid"
            );

        const vehiclesList =
            document.getElementById(
                "vehiclesListContainer"
            );


        hideVehicleElement(
            vehicleHeader
        );

        hideVehicleElement(
            vehicleSummary
        );

        hideVehicleElement(
            vehicleGrid
        );

        hideVehicleElement(
            vehiclesList
        );


        // =====================================
        // SHOW EDIT FORM
        // =====================================

        showVehicleElement(
            vehicleFormContainer,
            "block"
        );


        // =====================================
        // CHANGE FORM HEADING
        // =====================================

        const formHeading =
            vehicleFormContainer.querySelector(
                ".vehicle-form-header h3"
            );


        if (formHeading) {

            formHeading.textContent =
                "✏️ Edit Vehicle";

        }


        // =====================================
        // CHANGE SAVE BUTTON TEXT
        // =====================================

        const saveButton =
            document.getElementById(
                "saveVehicleButton"
            );


        if (saveButton) {

            saveButton.textContent =
                "💾 Update Vehicle";

        }


        // =====================================
        // SHOW BACK BUTTON
        // =====================================

        const backButton =
            document.getElementById(
                "backToVehicleManagementButton"
            );


        if (backButton) {

            backButton.style.setProperty(
                "display",
                "inline-block",
                "important"
            );

        }


        // =====================================
        // SCROLL TO FORM
        // =====================================

        vehicleFormContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        console.log(
            "✏️ VEHICLE EDIT FORM OPENED:",
            vehicle.registrationNumber
        );

    }
);

// =========================================
// LOAD EXISTING VEHICLE PHOTO
// =========================================

const editVehicleImagePreview =
    document.getElementById("vehicleImagePreview");

const editVehicleImageInput =
    document.getElementById("vehicleImageInput");

if (vehicle.imageUrl) {

    // Keep existing photo for update
    vehicleFormContainer.dataset.pendingVehicleImage =
        vehicle.imageUrl;

    // Show existing photo
    if (editVehicleImagePreview) {

        editVehicleImagePreview.innerHTML = `
            <img
                src="${vehicle.imageUrl}"
                alt="Vehicle Photo"
            >
        `;

    }

}
else {

    // No saved photo
    delete vehicleFormContainer
        .dataset
        .pendingVehicleImage;

    if (editVehicleImagePreview) {

        editVehicleImagePreview.innerHTML = `
            <span>🚗</span>
            <p>No photo selected</p>
        `;

    }

}

// Clear file input
if (editVehicleImageInput) {
    editVehicleImageInput.value = "";
}

// =========================================
// DELETE VEHICLE
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const deleteButton =
            event.target.closest(
                ".vehicle-delete-button"
            );


        // -------------------------------------
        // NOT A DELETE BUTTON
        // -------------------------------------

        if (!deleteButton) {

            return;

        }


        // -------------------------------------
        // GET VEHICLE ID
        // -------------------------------------

        const vehicleId =
            deleteButton.dataset.vehicleId;


        if (!vehicleId) {

            console.error(
                "❌ Vehicle ID not found"
            );

            return;

        }


        // -------------------------------------
        // GET VEHICLES
        // -------------------------------------

        let vehicles =
            JSON.parse(
                localStorage.getItem(
                    "financialERP_vehicles"
                ) || "[]"
            );


        // -------------------------------------
        // FIND VEHICLE
        // -------------------------------------

        const vehicle =
            vehicles.find(
                item =>
                    item.id === vehicleId
            );


        if (!vehicle) {

            alert(
                "Vehicle not found."
            );

            return;

        }


        // -------------------------------------
        // CONFIRM DELETE
        // -------------------------------------

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this vehicle?\n\n" +
                "Vehicle: " +
                (
                    vehicle.manufacturer ||
                    "Vehicle"
                ) +
                (
                    vehicle.model
                        ? " " + vehicle.model
                        : ""
                ) +
                "\nRegistration: " +
                (
                    vehicle.registrationNumber ||
                    "—"
                ) +
                "\n\nThis action cannot be undone."
            );


        if (!confirmDelete) {

            return;

        }


        // -------------------------------------
        // REMOVE VEHICLE
        // -------------------------------------

        vehicles =
            vehicles.filter(
                item =>
                    item.id !== vehicleId
            );


        // -------------------------------------
        // SAVE UPDATED VEHICLE LIST
        // -------------------------------------

        localStorage.setItem(
            "financialERP_vehicles",
            JSON.stringify(vehicles)
        );


        // -------------------------------------
        // REFRESH VEHICLE MASTER
        // -------------------------------------

        loadVehicleMaster();


        console.log(
            "🗑️ VEHICLE DELETED:",
            vehicleId
        );

    }
);

});

// =========================================
// DELETE VEHICLE FROM VEHICLE MASTER
// =========================================

document.addEventListener(
    "click",
    function (event) {

        const deleteButton =
            event.target.closest(
                ".vehicle-delete-button"
            );

        if (!deleteButton) {
            return;
        }

        const vehicleId =
            deleteButton.dataset.vehicleId;

        if (!vehicleId) {
            return;
        }

        const confirmDelete =
            confirm(
                "क्या आप इस Vehicle को delete करना चाहते हैं?"
            );

        if (!confirmDelete) {
            return;
        }

        let vehicles =
            JSON.parse(
                localStorage.getItem(
                    "financialERP_vehicles"
                ) || "[]"
            );

        vehicles =
            vehicles.filter(
                vehicle =>
                    vehicle.id !== vehicleId
            );

        localStorage.setItem(
            "financialERP_vehicles",
            JSON.stringify(vehicles)
        );

        // Refresh Vehicle Master
        loadVehicleMaster();

        alert(
            "✅ Vehicle successfully deleted."
        );

    }
    
);