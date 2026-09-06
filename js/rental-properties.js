// =========================================
// FIREBASE IMPORTS
// =========================================

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    writeBatch,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// Firebase configuration
import {
    db,
    auth
} from "./firebase.js";

// =========================================
// RENTAL PROPERTIES MODULE
// =========================================

console.log(
    "Rental Properties module loaded successfully."
);

// =========================================
// ADD PROPERTY FORM
// =========================================

const addPropertyButton =
    document.querySelector(
        "#addPropertyButton"
    );

const propertyFormContainer =
    document.querySelector(
        "#propertyFormContainer"
    );


if (
    addPropertyButton &&
    propertyFormContainer
) {

    addPropertyButton.addEventListener(
        "click",
        () => {

            propertyFormContainer.style.display =
                "block";

        }
    );

}

// =========================================
// CANCEL ADD PROPERTY FORM
// =========================================

const cancelPropertyButton =
    document.querySelector(
        "#cancelPropertyButton"
    );


if (
    cancelPropertyButton &&
    propertyFormContainer
) {

    cancelPropertyButton.addEventListener(
        "click",
        () => {

            propertyFormContainer.style.display =
                "none";


            const propertyForm =
                document.querySelector(
                    "#propertyForm"
                );


            if (propertyForm) {

                propertyForm.reset();

            }

        }
    );

}

// =========================================
// SAVE NEW PROPERTY TO FIRESTORE
// =========================================

const propertyForm =
    document.querySelector(
        "#propertyForm"
    );


if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =================================
            // LOGIN CHECK
            // =================================

            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "कृपया पहले login करें।"
                );

                return;

            }


            // =================================
            // GET FORM VALUES
            // =================================

            const propertyName =
                document.querySelector(
                    "#propertyName"
                )?.value.trim()
                || "";


            const propertyType =
                document.querySelector(
                    "#propertyType"
                )?.value
                || "";


            const ownership =
                document.querySelector(
                    "#propertyOwnership"
                )?.value
                || "";

                const ownerNames =
    document.querySelector(
        "#propertyOwnerNames"
    )?.value.trim()
    || "";


            const usage =
                document.querySelector(
                    "#propertyUsage"
                )?.value
                || "";


            const address =
                document.querySelector(
                    "#propertyAddress"
                )?.value.trim()
                || "";


            const purchaseDate =
                document.querySelector(
                    "#propertyPurchaseDate"
                )?.value
                || "";


            const purchaseValue =
                Number(
                    document.querySelector(
                        "#propertyPurchaseValue"
                    )?.value
                    || 0
                );


            const currentValue =
                Number(
                    document.querySelector(
                        "#propertyCurrentValue"
                    )?.value
                    || 0
                );


            const status =
                document.querySelector(
                    "#propertyStatus"
                )?.value
                || "active";


            // =================================
            // CREATE PROPERTY DATA
            // =================================

            const propertyData = {

                propertyName,

                propertyType,

                ownership,

                ownerNames,

                usage,

                address,

                purchaseDate,

                purchaseValue,

                currentValue,

                status,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            // =================================
            // SAVE TO FIRESTORE
            // =================================

            try {

                const propertyCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "properties"
                    );


                const propertyDoc =
                    await addDoc(
                        propertyCollection,
                        propertyData
                    );


                console.log(
                    "Property saved successfully:",
                    {
                        id:
                            propertyDoc.id,

                        ...propertyData
                    }
                );


                alert(
                    "Property successfully save हो गई।"
                );


                // =================================
                // RESET FORM
                // =================================

                propertyForm.reset();


                propertyFormContainer.style.display =
                    "none";

            }
            catch (error) {

    console.error(
        "Save Property Error:",
        error
    );

    console.log(
        "ERROR TYPE:",
        typeof error
    );

    console.log(
        "ERROR CODE:",
        error?.code
    );

    console.log(
        "ERROR MESSAGE:",
        error?.message
    );

    console.log(
        "ERROR NAME:",
        error?.name
    );

    console.log(
        "ERROR STACK:",
        error?.stack
    );

    alert(
        "Property save नहीं हो सकी। Console में error देखें।"
    );

}

        }
    );

}

// =========================================
// LOAD SAVED PROPERTIES
// =========================================

async function loadSavedProperties() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Properties cannot be loaded."
        );

        return;

    }


    const allPropertiesContainer =
        document.querySelector(
            "#allPropertiesContainer"
        );

        const propertiesTableBody =
    document.querySelector(
        "#propertiesTableBody"
    );


    const allPropertiesCount =
        document.querySelector(
            "#allPropertiesCount"
        );


    if (!allPropertiesContainer) {

        console.error(
            "All Properties container not found."
        );

        return;

    }

    if (!propertiesTableBody) {

    console.error(
        "Properties table body not found."
    );

    return;

}

    


    try {

        const propertyCollection =
            collection(
                db,
                "users",
                user.uid,
                "properties"
            );


        const propertySnapshot =
            await getDocs(
                propertyCollection
            );

// =========================================
// UPDATE PROPERTIES SUMMARY
// =========================================

let rentalCount = 0;
let selfOccupiedCount = 0;
let landCount = 0;

let totalPurchaseValue = 0;
let totalCurrentValue = 0;


propertySnapshot.forEach((propertyDoc) => {

    const property =
        propertyDoc.data();

    
    // ===============================
    // USAGE COUNT
    // ===============================

    if (property.usage === "rental") {

        rentalCount++;

    }


    if (property.usage === "self_occupied") {

        selfOccupiedCount++;

    }


    // ===============================
    // PLOT / LAND COUNT
    // ===============================

    if (
        property.propertyType === "plot" ||
        property.propertyType === "agricultural_land"
    ) {

        landCount++;

    }


    // ===============================
    // TOTAL VALUES
    // ===============================

    totalPurchaseValue +=
        Number(property.purchaseValue || 0);


    totalCurrentValue +=
        Number(property.currentValue || 0);

});

// =========================================
// MAKE PROPERTY LOADER AVAILABLE GLOBALLY
// =========================================

window.loadSavedProperties = loadSavedProperties;

// ===============================
// TOTAL PROPERTIES
// ===============================

const summaryPropertyCount =
    document.querySelector(
        "#summaryPropertyCount"
    );

if (summaryPropertyCount) {

    summaryPropertyCount.textContent =
        propertySnapshot.size;

}


// ===============================
// RENTAL PROPERTIES
// ===============================

const summaryRentalCount =
    document.querySelector(
        "#summaryRentalCount"
    );

if (summaryRentalCount) {

    summaryRentalCount.textContent =
        rentalCount;

}


// ===============================
// SELF OCCUPIED
// ===============================

const summarySelfOccupiedCount =
    document.querySelector(
        "#summarySelfOccupiedCount"
    );

if (summarySelfOccupiedCount) {

    summarySelfOccupiedCount.textContent =
        selfOccupiedCount;

}


// ===============================
// PLOTS / LAND
// ===============================

const summaryLandCount =
    document.querySelector(
        "#summaryLandCount"
    );

if (summaryLandCount) {

    summaryLandCount.textContent =
        landCount;

}


// ===============================
// PURCHASE VALUE
// ===============================

const summaryPurchaseValue =
    document.querySelector(
        "#summaryPurchaseValue"
    );

if (summaryPurchaseValue) {

    summaryPurchaseValue.textContent =
        "₹" +
        totalPurchaseValue.toLocaleString(
            "en-IN"
        );

}


// ===============================
// CURRENT VALUE
// ===============================

const summaryCurrentValue =
    document.querySelector(
        "#summaryCurrentValue"
    );

if (summaryCurrentValue) {

    summaryCurrentValue.textContent =
        "₹" +
        totalCurrentValue.toLocaleString(
            "en-IN"
        );

}

        propertiesTableBody.innerHTML =
        "";


        if (allPropertiesCount) {

            allPropertiesCount.textContent =
                propertySnapshot.size;

        }


        if (propertySnapshot.empty) {

    propertiesTableBody.innerHTML = `
        <tr>
            <td colspan="11">
                अभी कोई Property Saved नहीं है।
            </td>
        </tr>
    `;

            console.log(
                "Properties Loaded: 0"
            );

            return;

        }


 propertySnapshot.forEach(
    (propertyDoc) => {

        const property =
            propertyDoc.data();

// =================================
// FORMAT PURCHASE DATE
// =================================

let formattedPurchaseDate = "-";

if (property.purchaseDate) {

    const dateParts =
        property.purchaseDate.split("-");

    if (dateParts.length === 3) {

        formattedPurchaseDate =
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    }
}

        const propertyRow =
            document.createElement(
                "tr"
            );


        propertyRow.innerHTML = `

            <td>
                ${property.propertyName || "-"}
            </td>

            <td>
                ${property.propertyType || "-"}
            </td>

            <td>
                ${property.ownership || "-"}
            </td>

            <td>
                ${property.ownerNames || "-"}
            </td>

            <td>
                ${property.usage || "-"}
            </td>

            <td>
                ${property.address || "-"}
            </td>

            <td>
                ${formattedPurchaseDate}
            </td>
            
            <td>
                ₹${property.purchaseValue || 0}
            </td>

            <td>
                ₹${property.currentValue || 0}
            </td>

            <td>
                ${property.status || "-"}
            </td>

            <td>

                <button
                    type="button"
                    class="edit-property-button"
                    data-id="${propertyDoc.id}">
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="delete-property-button"
                    data-id="${propertyDoc.id}">
                    🗑️ Delete
                </button>

            </td>

        `;


        propertiesTableBody.appendChild(
            propertyRow
        );

    }
);


        console.log(
            "Properties History Loaded:",
            propertySnapshot.size
        );

    }
    catch (error) {

        console.error(
            "Load Properties Error:",
            error
        );

    }

}

// =========================================
// VIEW ALL PROPERTIES
// =========================================

const viewAllPropertiesButton =
    document.querySelector(
        "#viewAllPropertiesButton"
    );

const allPropertiesView =
    document.querySelector(
        "#allPropertiesView"
    );

// Hide All Properties view on dashboard load
if (allPropertiesView) {
    allPropertiesView.style.display = "none";
}

if (
    viewAllPropertiesButton &&
    allPropertiesView
) {

    viewAllPropertiesButton.addEventListener(
        "click",
        async () => {

            allPropertiesView.style.display =
                "block";


            await loadSavedProperties();

        }
        
    );

}

// =========================================
// PROPERTIES SUMMARY TOGGLE
// =========================================

if (
    propertySummaryButton &&
    propertySummary
) {

    propertySummaryButton.addEventListener(
        "click",
        async () => {

            if (
                propertySummary.style.display ===
                "none"
            ) {

                // Load latest property data
                await loadSavedProperties();

                // Show Summary
                propertySummary.style.display =
                    "flex";

            }
            else {

                // Hide Summary
                propertySummary.style.display =
                    "none";

            }

        }
    );

}

// =========================================
// BACK TO PROPERTIES DASHBOARD
// =========================================

const backToPropertiesDashboardButton =
    document.querySelector(
        "#backToPropertiesDashboardButton"
    );


if (backToPropertiesDashboardButton) {

    backToPropertiesDashboardButton.addEventListener(
        "click",
        () => {

            if (allPropertiesView) {

                allPropertiesView.style.display =
                    "none";

            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}

// =========================================
// EDIT PROPERTY FORM
// =========================================

const editPropertyFormContainer =
    document.querySelector(
        "#editPropertyFormContainer"
    );


document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "edit-property-button"
            )
        ) {
            return;
        }


        const propertyId =
            event.target.dataset.id;


        if (!propertyId) {

            console.error(
                "Property ID not found for Edit."
            );

            return;

        }


        console.log(
            "Edit Property requested:",
            propertyId
        );

        
// =========================================
// GET CURRENT USER
// =========================================

const user =
    auth.currentUser;


if (!user) {

    alert(
        "कृपया पहले login करें।"
    );

    return;

}


// =========================================
// GET PROPERTY DOCUMENT
// =========================================

try {

    const propertyRef =
        doc(
            db,
            "users",
            user.uid,
            "properties",
            propertyId
        );


    const propertySnapshot =
        await getDoc(
            propertyRef
        );


    if (!propertySnapshot.exists()) {

        console.error(
            "Property not found:",
            propertyId
        );

        alert(
            "Property नहीं मिली।"
        );

        return;

    }


    const property =
        propertySnapshot.data();


    console.log(
        "Property loaded for Edit:",
        {
            id: propertyId,
            ...property
        }
    );


    // =====================================
    // GET EDIT FORM FIELDS
    // =====================================

    const editPropertyName =
        document.querySelector(
            "#editPropertyName"
        );

    const editPropertyType =
        document.querySelector(
            "#editPropertyType"
        );

    const editPropertyOwnership =
        document.querySelector(
            "#editPropertyOwnership"
        );

        const editPropertyOwnerNames =
    document.querySelector(
        "#editPropertyOwnerNames"
    );

    const editPropertyUsage =
        document.querySelector(
            "#editPropertyUsage"
        );

    const editPropertyAddress =
        document.querySelector(
            "#editPropertyAddress"
        );

    const editPropertyPurchaseDate =
        document.querySelector(
            "#editPropertyPurchaseDate"
        );

    const editPropertyPurchaseValue =
        document.querySelector(
            "#editPropertyPurchaseValue"
        );

    const editPropertyCurrentValue =
        document.querySelector(
            "#editPropertyCurrentValue"
        );

    const editPropertyStatus =
        document.querySelector(
            "#editPropertyStatus"
        );


    // =====================================
    // RESTORE VALUES
    // =====================================

    if (editPropertyName) {

        editPropertyName.value =
            property.propertyName || "";

    }


    if (editPropertyType) {

        editPropertyType.value =
            property.propertyType || "";

    }


    if (editPropertyOwnership) {

        editPropertyOwnership.value =
            property.ownership || "";

    }

    if (editPropertyOwnerNames) {

    editPropertyOwnerNames.value =
        property.ownerNames || "";

    }

    if (editPropertyUsage) {

        editPropertyUsage.value =
            property.usage || "";

    }


    if (editPropertyAddress) {

        editPropertyAddress.value =
            property.address || "";

    }


    if (editPropertyPurchaseDate) {

        editPropertyPurchaseDate.value =
            property.purchaseDate || "";

    }


    if (editPropertyPurchaseValue) {

        editPropertyPurchaseValue.value =
            property.purchaseValue ?? "";

    }


    if (editPropertyCurrentValue) {

        editPropertyCurrentValue.value =
            property.currentValue ?? "";

    }


    if (editPropertyStatus) {

        editPropertyStatus.value =
            property.status || "active";

    }


    // =====================================
    // STORE EDITING PROPERTY ID
    // =====================================

    if (editPropertyFormContainer) {

        editPropertyFormContainer.dataset.editingPropertyId =
            propertyId;


        editPropertyFormContainer.style.display =
            "block";

    }


    console.log(
        "Property loaded into edit form:",
        {
            propertyId: propertyId,

            propertyName:
                property.propertyName,

            propertyType:
                property.propertyType,

            ownership:
                property.ownership,

            usage:
                property.usage,

            purchaseValue:
                property.purchaseValue,

            currentValue:
                property.currentValue
        }
    );

}
catch (error) {

    console.error(
        "Load Property For Edit Error:",
        error
    );

    alert(
        "Property load नहीं हो सकी। Console में error देखें।"
    );

}

    }
);

// =========================================
// UPDATE EXISTING PROPERTY
// =========================================

const editPropertyForm =
    document.querySelector(
        "#editPropertyForm"
    );


if (editPropertyForm) {

    editPropertyForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =================================
            // LOGIN CHECK
            // =================================

            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "कृपया पहले login करें।"
                );

                return;

            }


            // =================================
            // GET EDITING PROPERTY ID
            // =================================

            const editingPropertyId =
                editPropertyFormContainer
                    ?.dataset
                    .editingPropertyId;


            console.log(
                "EDIT PROPERTY ID AT SAVE TIME:",
                editingPropertyId
            );


            if (!editingPropertyId) {

                console.error(
                    "Editing Property ID not found."
                );

                alert(
                    "Property ID नहीं मिली।"
                );

                return;

            }


            // =================================
            // GET UPDATED FORM VALUES
            // =================================

            const propertyName =
                document.querySelector(
                    "#editPropertyName"
                )?.value.trim()
                || "";


            const propertyType =
                document.querySelector(
                    "#editPropertyType"
                )?.value
                || "";


            const ownership =
                document.querySelector(
                    "#editPropertyOwnership"
                )?.value
                || "";

            const ownerNames =
                document.querySelector(
                "#editPropertyOwnerNames"
                )?.value.trim()
                || "";

            const usage =
                document.querySelector(
                    "#editPropertyUsage"
                )?.value
                || "";


            const address =
                document.querySelector(
                    "#editPropertyAddress"
                )?.value.trim()
                || "";


            const purchaseDate =
                document.querySelector(
                    "#editPropertyPurchaseDate"
                )?.value
                || "";


            const purchaseValue =
                Number(
                    document.querySelector(
                        "#editPropertyPurchaseValue"
                    )?.value
                    || 0
                );


            const currentValue =
                Number(
                    document.querySelector(
                        "#editPropertyCurrentValue"
                    )?.value
                    || 0
                );


            const status =
                document.querySelector(
                    "#editPropertyStatus"
                )?.value
                || "active";


            // =================================
            // UPDATED PROPERTY DATA
            // =================================

            const updatedPropertyData = {

                propertyName,

                propertyType,

                ownership,

                ownerNames,

                usage,

                address,

                purchaseDate,

                purchaseValue,

                currentValue,

                status,

                updatedAt:
                    serverTimestamp()

            };


            // =================================
            // UPDATE FIRESTORE DOCUMENT
            // =================================

            try {

                const propertyRef =
                    doc(
                        db,
                        "users",
                        user.uid,
                        "properties",
                        editingPropertyId
                    );


                await updateDoc(
                    propertyRef,
                    updatedPropertyData
                );


                console.log(
                    "Property updated successfully:",
                    {
                        id:
                            editingPropertyId,

                        ...updatedPropertyData
                    }
                );


                alert(
                    "Property successfully update हो गई।"
                );


                // =================================
                // CLOSE EDIT FORM
                // =================================

                editPropertyFormContainer.style.display =
                    "none";


                editPropertyFormContainer
                    .removeAttribute(
                        "data-editing-property-id"
                    );


                editPropertyForm.reset();


                // =================================
                // RELOAD PROPERTIES TABLE
                // =================================

                await loadSavedProperties();

            }
            catch (error) {

                console.error(
                    "Update Property Error:",
                    error
                );

                alert(
                    "Property update नहीं हो सकी। Console में error देखें।"
                );

            }

        }
    );

}

// =========================================
// CANCEL EDIT PROPERTY
// =========================================

const cancelEditPropertyButton =
    document.querySelector(
        "#cancelEditPropertyButton"
    );


if (
    cancelEditPropertyButton &&
    editPropertyFormContainer
) {

    cancelEditPropertyButton.addEventListener(
        "click",
        () => {

            editPropertyFormContainer.style.display =
                "none";

            editPropertyFormContainer
                .removeAttribute(
                    "data-editing-property-id"
                );

        }
    );

}

// =========================================
// DELETE PROPERTY FROM HISTORY
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "delete-property-button"
            )
        ) {
            return;
        }


        const propertyId =
            event.target.dataset.id;


        if (!propertyId) {

            console.error(
                "Property ID not found for Delete."
            );

            return;

        }


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले login करें।"
            );

            return;

        }


        console.log(
            "Delete Property requested:",
            propertyId
        );


        // =================================
        // CONFIRM DELETE
        // =================================

        const confirmDelete =
            confirm(
                "क्या आप इस Property को Delete करना चाहते हैं?"
            );


        if (!confirmDelete) {

            console.log(
                "Property delete cancelled:",
                propertyId
            );

            return;

        }


        // =================================
        // DELETE FROM FIRESTORE
        // =================================

        try {

            const propertyRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "properties",
                    propertyId
                );


            await deleteDoc(
                propertyRef
            );


            console.log(
                "Property deleted successfully:",
                propertyId
            );


            alert(
                "Property successfully delete हो गई।"
            );


            // =================================
            // RELOAD PROPERTIES TABLE
            // =================================

            await loadSavedProperties();

        }
        catch (error) {

            console.error(
                "Delete Property Error:",
                error
            );


            alert(
                "Property delete नहीं हो सकी। Console में error देखें।"
            );

        }

    }
);

// =========================================
// RENTAL UNITS / TENANTS MODULE
// =========================================


// =========================================
// RENTAL ELEMENTS
// =========================================

const rentalUnitForm =
    document.querySelector(
        "#rentalUnitForm"
    );

const rentalUnitFormContainer =
    document.querySelector(
        "#rentalUnitFormContainer"
    );

const addRentalUnitButton =
    document.querySelector(
        "#addRentalUnitButton"
    );

const cancelRentalUnitButton =
    document.querySelector(
        "#cancelRentalUnitButton"
    );

const viewAllRentalUnitsButton =
    document.querySelector(
        "#viewAllRentalUnitsButton"
    );

const rentalUnitsTableWrapper =
    document.querySelector(
        "#rentalUnitsTableWrapper"
    );

const rentalUnitsTableBody =
    document.querySelector(
        "#rentalUnitsTableBody"
    );

const rentalUnitCount =
    document.querySelector(
        "#rentalUnitCount"
    );

const noRentalUnitsMessage =
    document.querySelector(
        "#noRentalUnitsMessage"
    );


// =========================================
// RENTAL FORM HEADING / SAVE BUTTON
// =========================================

const rentalFormHeading =
    rentalUnitFormContainer
        ?.querySelector("h3");

const saveRentalUnitButton =
    document.querySelector(
        "#saveRentalUnitButton"
    );


// =========================================
// LOAD PROPERTIES INTO RENTAL DROPDOWN
// =========================================

async function loadRentalPropertyOptions() {

    const user =
        auth.currentUser;

    const propertySelect =
        document.querySelector(
            "#rentalPropertyId"
        );


    if (!user || !propertySelect) {

        return;

    }


    try {

        const propertyCollection =
            collection(
                db,
                "users",
                user.uid,
                "properties"
            );


        const propertySnapshot =
            await getDocs(
                propertyCollection
            );


        propertySelect.innerHTML = `
            <option value="">
                -- Select Property --
            </option>
        `;


        propertySnapshot.forEach(
            (propertyDoc) => {

                const property =
                    propertyDoc.data();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    propertyDoc.id;


                option.textContent =
                    property.propertyName ||
                    "Unnamed Property";


                propertySelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Rental property options loaded:",
            propertySnapshot.size
        );

    }
    catch (error) {

        console.error(
            "Load Rental Property Options Error:",
            error
        );

    }

}


// =========================================
// OPEN ADD RENTAL FORM
// =========================================

if (
    addRentalUnitButton &&
    rentalUnitFormContainer
) {

    addRentalUnitButton.addEventListener(
        "click",
        async () => {

            rentalUnitForm?.reset();


            rentalUnitFormContainer
                .removeAttribute(
                    "data-editing-rental-id"
                );


            if (rentalFormHeading) {

                rentalFormHeading.textContent =
                    "➕ Add New Rental Unit / Tenant";

            }


            if (saveRentalUnitButton) {

                saveRentalUnitButton.textContent =
                    "💾 Save Rental Unit";

            }


            await loadRentalPropertyOptions();


            rentalUnitFormContainer.style.display =
                "block";


            rentalUnitFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


// =========================================
// CANCEL RENTAL FORM
// =========================================

if (
    cancelRentalUnitButton &&
    rentalUnitFormContainer
) {

    cancelRentalUnitButton.addEventListener(
        "click",
        () => {

            rentalUnitForm?.reset();


            rentalUnitFormContainer
                .removeAttribute(
                    "data-editing-rental-id"
                );


            if (rentalFormHeading) {

                rentalFormHeading.textContent =
                    "➕ Add New Rental Unit / Tenant";

            }


            if (saveRentalUnitButton) {

                saveRentalUnitButton.textContent =
                    "💾 Save Rental Unit";

            }


            rentalUnitFormContainer.style.display =
                "none";

        }
    );

}


// =========================================
// GET RENTAL FORM DATA
// =========================================

function getRentalFormData() {

    return {

        rentalPropertyId:
            document.querySelector(
                "#rentalPropertyId"
            )?.value || "",


        rentalUnitName:
            document.querySelector(
                "#rentalUnitName"
            )?.value.trim() || "",


        rentalUnitFloor:
            document.querySelector(
                "#rentalUnitFloor"
            )?.value.trim() || "",


        rentalUnitType:
            document.querySelector(
                "#rentalUnitType"
            )?.value || "",


        rentalUnitArea:
            Number(
                document.querySelector(
                    "#rentalUnitArea"
                )?.value || 0
            ),


        tenantName:
            document.querySelector(
                "#tenantName"
            )?.value.trim() || "",


        tenantMobile:
            document.querySelector(
                "#tenantMobile"
            )?.value.trim() || "",


        tenantAddress:
            document.querySelector(
                "#tenantAddress"
            )?.value.trim() || "",


        tenantIdType:
            document.querySelector(
                "#tenantIdType"
            )?.value || "",


        tenantIdNumber:
            document.querySelector(
                "#tenantIdNumber"
            )?.value.trim() || "",


        tenancyStartDate:
            document.querySelector(
                "#tenancyStartDate"
            )?.value || "",


        tenancyEndDate:
            document.querySelector(
                "#tenancyEndDate"
            )?.value || "",


        monthlyRent:
            Number(
                document.querySelector(
                    "#monthlyRent"
                )?.value || 0
            ),


        securityDeposit:
            Number(
                document.querySelector(
                    "#securityDeposit"
                )?.value || 0
            ),


        tenancyStatus:
            document.querySelector(
                "#tenancyStatus"
            )?.value || "active",


        meterNumber:
            document.querySelector(
                "#meterNumber"
            )?.value.trim() || "",


        previousMeterReading:
            Number(
                document.querySelector(
                    "#previousMeterReading"
                )?.value || 0
            ),


        currentMeterReading:
            Number(
                document.querySelector(
                    "#currentMeterReading"
                )?.value || 0
            )

    };

}


// =========================================
// SAVE / UPDATE RENTAL UNIT
// =========================================

if (rentalUnitForm) {

    rentalUnitForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "कृपया पहले login करें।"
                );

                return;

            }


            const rentalData =
                getRentalFormData();


            // =================================
            // BASIC VALIDATION
            // =================================

            if (
                !rentalData.rentalPropertyId ||
                !rentalData.rentalUnitName ||
                !rentalData.rentalUnitType ||
                !rentalData.tenantName ||
                !rentalData.tenancyStartDate ||
                rentalData.monthlyRent <= 0
            ) {

                alert(
                    "कृपया सभी जरूरी Rental / Tenant details भरें।"
                );

                return;

            }


            // =================================
            // GET PROPERTY NAME
            // =================================

            let propertyName = "";


            try {

                const propertyRef =
                    doc(
                        db,
                        "users",
                        user.uid,
                        "properties",
                        rentalData.rentalPropertyId
                    );


                const propertySnapshot =
                    await getDoc(
                        propertyRef
                    );


                if (
                    propertySnapshot.exists()
                ) {

                    propertyName =
                        propertySnapshot.data()
                            .propertyName || "";

                }

            }
            catch (error) {

                console.error(
                    "Get Property Name Error:",
                    error
                );

            }


            const editingRentalId =
                rentalUnitFormContainer
                    ?.dataset
                    .editingRentalId;


            try {

                // =================================
                // UPDATE EXISTING RENTAL
                // =================================

                if (editingRentalId) {

                    const rentalRef =
                        doc(
                            db,
                            "users",
                            user.uid,
                            "rentalUnits",
                            editingRentalId
                        );


                    await updateDoc(
                        rentalRef,
                        {

                            ...rentalData,

                            propertyName,

                            updatedAt:
                                serverTimestamp()

                        }
                    );


                    console.log(
                        "Rental Unit updated successfully:",
                        editingRentalId
                    );


                    alert(
                        "Rental Unit successfully update हो गई।"
                    );

                }


                // =================================
                // CREATE NEW RENTAL
                // =================================

                else {

                    const rentalCollection =
                        collection(
                            db,
                            "users",
                            user.uid,
                            "rentalUnits"
                        );


                    const rentalDoc =
                        await addDoc(
                            rentalCollection,
                            {

                                ...rentalData,

                                propertyName,

                                createdAt:
                                    serverTimestamp(),

                                updatedAt:
                                    serverTimestamp()

                            }
                        );


                    console.log(
                        "Rental Unit saved successfully:",
                        rentalDoc.id
                    );


                    alert(
                        "Rental Unit successfully save हो गई।"
                    );

                }


                // =================================
                // RESET FORM
                // =================================

                rentalUnitForm.reset();


                rentalUnitFormContainer
                    .removeAttribute(
                        "data-editing-rental-id"
                    );


                rentalUnitFormContainer.style.display =
                    "none";


                if (rentalFormHeading) {

                    rentalFormHeading.textContent =
                        "➕ Add New Rental Unit / Tenant";

                }


                if (saveRentalUnitButton) {

                    saveRentalUnitButton.textContent =
                        "💾 Save Rental Unit";

                }


                // =================================
                // REFRESH TABLE
                // =================================

                await loadRentalUnits();


                if (rentalUnitsTableWrapper) {

                    rentalUnitsTableWrapper.style.display =
                        "block";

                }

            }
            catch (error) {

                console.error(
                    "Save / Update Rental Unit Error:",
                    error
                );


                console.error(
                    "ERROR CODE:",
                    error?.code
                );


                console.error(
                    "ERROR MESSAGE:",
                    error?.message
                );


                alert(
                    "Rental Unit save/update नहीं हो सकी। Console में error देखें।"
                );

            }

        }
    );

}


// =========================================
// LOAD ALL RENTAL UNITS
// =========================================

async function loadRentalUnits() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "कृपया पहले login करें।"
        );

        return;

    }


    if (!rentalUnitsTableBody) {

        console.error(
            "Rental Units table body not found."
        );

        return;

    }


    try {

        const rentalCollection =
            collection(
                db,
                "users",
                user.uid,
                "rentalUnits"
            );


        const rentalSnapshot =
            await getDocs(
                rentalCollection
            );


        rentalUnitsTableBody.innerHTML =
            "";


        if (rentalUnitCount) {

            rentalUnitCount.textContent =
                rentalSnapshot.size;

        }


        if (rentalSnapshot.empty) {

            if (noRentalUnitsMessage) {

                noRentalUnitsMessage.style.display =
                    "block";

            }


            return;

        }


        if (noRentalUnitsMessage) {

            noRentalUnitsMessage.style.display =
                "none";

        }


        rentalSnapshot.forEach(
            (rentalDoc) => {

                const rental =
                    rentalDoc.data();


                const rentalRow =
                    document.createElement(
                        "tr"
                    );


                rentalRow.innerHTML = `

                    <td>
                        ${rental.propertyName || "-"}
                    </td>

                    <td>
                        ${rental.rentalUnitName || "-"}
                    </td>

                    <td>
                        ${rental.tenantName || "-"}
                    </td>

                    <td>
                        ${rental.tenantMobile || "-"}
                    </td>

                    <td>
                        ₹${Number(
                            rental.monthlyRent || 0
                        ).toLocaleString("en-IN")}
                    </td>

                    <td>
                        ${formatRentalDate(
                            rental.tenancyStartDate
                        )}
                    </td>

                    <td>
                        ${rental.tenancyStatus || "-"}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="edit-rental-unit-button"
                            data-id="${rentalDoc.id}">

                            ✏️ Edit

                        </button>


                        <button
                            type="button"
                            class="delete-rental-unit-button"
                            data-id="${rentalDoc.id}">

                            🗑️ Delete

                        </button>

                    </td>

                `;


                rentalUnitsTableBody.appendChild(
                    rentalRow
                );

            }
        );


        console.log(
            "Rental Units Loaded:",
            rentalSnapshot.size
        );

    }
    catch (error) {

        console.error(
            "Load Rental Units Error:",
            error
        );


        alert(
            "Rental Units load नहीं हो सकीं। Console में error देखें।"
        );

    }

}


// =========================================
// FORMAT RENTAL DATE
// =========================================

function formatRentalDate(
    dateValue
) {

    if (!dateValue) {

        return "-";

    }


    const parts =
        dateValue.split("-");


    if (parts.length !== 3) {

        return dateValue;

    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}


// =========================================
// VIEW ALL RENTAL UNITS
// =========================================

if (viewAllRentalUnitsButton) {

    viewAllRentalUnitsButton.addEventListener(
        "click",
        async () => {

            if (rentalUnitFormContainer) {

                rentalUnitFormContainer.style.display =
                    "none";

            }


            if (rentalUnitsTableWrapper) {

                rentalUnitsTableWrapper.style.display =
                    "block";


                await loadRentalUnits();


                rentalUnitsTableWrapper.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// =========================================
// EDIT RENTAL UNIT
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "edit-rental-unit-button"
            )
        ) {

            return;

        }


        const rentalId =
            event.target.dataset.id;


        if (!rentalId) {

            console.error(
                "Rental Unit ID not found."
            );

            return;

        }


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले login करें।"
            );

            return;

        }


        try {

            const rentalRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "rentalUnits",
                    rentalId
                );


            const rentalSnapshot =
                await getDoc(
                    rentalRef
                );


            if (
                !rentalSnapshot.exists()
            ) {

                alert(
                    "Rental Unit नहीं मिली।"
                );

                return;

            }


            const rental =
                rentalSnapshot.data();


            await loadRentalPropertyOptions();


            // =================================
            // RESTORE FORM VALUES
            // =================================

            document.querySelector(
                "#rentalPropertyId"
            ).value =
                rental.rentalPropertyId || "";


            document.querySelector(
                "#rentalUnitName"
            ).value =
                rental.rentalUnitName || "";


            document.querySelector(
                "#rentalUnitFloor"
            ).value =
                rental.rentalUnitFloor || "";


            document.querySelector(
                "#rentalUnitType"
            ).value =
                rental.rentalUnitType || "";


            document.querySelector(
                "#rentalUnitArea"
            ).value =
                rental.rentalUnitArea ?? "";


            document.querySelector(
                "#tenantName"
            ).value =
                rental.tenantName || "";


            document.querySelector(
                "#tenantMobile"
            ).value =
                rental.tenantMobile || "";


            document.querySelector(
                "#tenantAddress"
            ).value =
                rental.tenantAddress || "";


            document.querySelector(
                "#tenantIdType"
            ).value =
                rental.tenantIdType || "";


            document.querySelector(
                "#tenantIdNumber"
            ).value =
                rental.tenantIdNumber || "";


            document.querySelector(
                "#tenancyStartDate"
            ).value =
                rental.tenancyStartDate || "";


            document.querySelector(
                "#tenancyEndDate"
            ).value =
                rental.tenancyEndDate || "";


            document.querySelector(
                "#monthlyRent"
            ).value =
                rental.monthlyRent ?? "";


            document.querySelector(
                "#securityDeposit"
            ).value =
                rental.securityDeposit ?? "";


            document.querySelector(
                "#tenancyStatus"
            ).value =
                rental.tenancyStatus || "active";


            document.querySelector(
                "#meterNumber"
            ).value =
                rental.meterNumber || "";


            document.querySelector(
                "#previousMeterReading"
            ).value =
                rental.previousMeterReading ?? "";


            document.querySelector(
                "#currentMeterReading"
            ).value =
                rental.currentMeterReading ?? "";


            // =================================
            // SET EDIT MODE
            // =================================

            rentalUnitFormContainer.dataset.editingRentalId =
                rentalId;


            if (rentalFormHeading) {

                rentalFormHeading.textContent =
                    "✏️ Edit Rental Unit / Tenant";

            }


            if (saveRentalUnitButton) {

                saveRentalUnitButton.textContent =
                    "💾 Update Rental Unit";

            }


            rentalUnitsTableWrapper.style.display =
                "none";


            rentalUnitFormContainer.style.display =
                "block";


            rentalUnitFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
        catch (error) {

            console.error(
                "Load Rental Unit For Edit Error:",
                error
            );


            alert(
                "Rental Unit edit के लिए load नहीं हो सकी।"
            );

        }

    }
);


// =========================================
// DELETE RENTAL UNIT
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "delete-rental-unit-button"
            )
        ) {

            return;

        }


        const rentalId =
            event.target.dataset.id;


        if (!rentalId) {

            return;

        }


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले login करें।"
            );

            return;

        }


        const confirmDelete =
            confirm(
                "क्या आप इस Rental Unit / Tenant को Delete करना चाहते हैं?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const rentalRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "rentalUnits",
                    rentalId
                );


            await deleteDoc(
                rentalRef
            );


            console.log(
                "Rental Unit deleted successfully:",
                rentalId
            );


            alert(
                "Rental Unit successfully delete हो गई।"
            );


            await loadRentalUnits();

        }
        catch (error) {

            console.error(
                "Delete Rental Unit Error:",
                error
            );


            alert(
                "Rental Unit delete नहीं हो सकी। Console में error देखें।"
            );

        }

    }
);


// =========================================
// INITIAL RENTAL PROPERTY OPTIONS
// =========================================

loadRentalPropertyOptions();

// =========================================
// MONTHLY RENT REGISTER — STEP 1
// BASIC SAVE / VIEW
// =========================================

const rentRegisterSection =
    document.querySelector(
        "#rentRegisterSection"
    );

const addRentEntryButton =
    document.querySelector(
        "#addRentEntryButton"
    );

const viewAllRentEntriesButton =
    document.querySelector(
        "#viewAllRentEntriesButton"
    );

const rentEntryFormContainer =
    document.querySelector(
        "#rentEntryFormContainer"
    );

const rentEntryForm =
    document.querySelector(
        "#rentEntryForm"
    );

const cancelRentEntryButton =
    document.querySelector(
        "#cancelRentEntryButton"
    );

const rentRegisterRentalId =
    document.querySelector(
        "#rentRegisterRentalId"
    );

const rentMonth =
    document.querySelector(
        "#rentMonth"
    );

    // =========================================
// DEFAULT RENT MONTH = CURRENT MONTH
// =========================================

if (rentMonth) {

    const today =
        new Date();


    const currentYear =
        today.getFullYear();


    const currentMonth =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    rentMonth.value =
        `${currentYear}-${currentMonth}`;

}

const rentDueDate =
    document.querySelector(
        "#rentDueDate"
    );


// =========================================
// AUTO RENT DUE DATE
// CURRENT MONTH ADVANCE RENT
// BASED ON TENANCY START DAY
// =========================================

async function calculateRentDueDate() {

    const rentalId =
        rentRegisterRentalId?.value || "";


    const selectedRentMonth =
        rentMonth?.value || "";


    if (
        !rentalId ||
        !selectedRentMonth ||
        !rentDueDate
    ) {

        if (rentDueDate) {

            rentDueDate.value =
                "";

        }

        return;

    }


    try {

        const user =
            auth.currentUser;


        if (!user) {

            return;

        }


        // =====================================
        // GET RENTAL UNIT
        // =====================================

        const rentalUnitReference =
            doc(
                db,
                "users",
                user.uid,
                "rentalUnits",
                rentalId
            );


        const rentalUnitSnapshot =
            await getDoc(
                rentalUnitReference
            );


        if (
            !rentalUnitSnapshot.exists()
        ) {

            console.log(
                "Rental Unit not found."
            );

            return;

        }


        const rentalUnit =
            rentalUnitSnapshot.data();


        const tenancyStartDate =
            rentalUnit.tenancyStartDate;


        if (!tenancyStartDate) {

            console.log(
                "Tenancy Start Date not found."
            );

            return;

        }


        // =====================================
        // TENANCY START DAY
        // =====================================

        const startDate =
            new Date(
                `${tenancyStartDate}T00:00:00`
            );


        const startDay =
            startDate.getDate();


        // =====================================
        // SELECTED RENT MONTH
        // YYYY-MM
        // =====================================

        const [year, month] =
            selectedRentMonth
                .split("-")
                .map(Number);


        // =====================================
        // CURRENT MONTH DUE DATE
        // SAME DAY AS TENANCY START
        // =====================================

        let dueDay =
            startDay;


        // =====================================
        // HANDLE 29 / 30 / 31 DATE CASES
        // =====================================

        const lastDayOfMonth =
            new Date(
                year,
                month,
                0
            ).getDate();


        if (
            dueDay >
            lastDayOfMonth
        ) {

            dueDay =
                lastDayOfMonth;

        }


        const yyyy =
            year;


        const mm =
            String(
                month
            ).padStart(
                2,
                "0"
            );


        const dd =
            String(
                dueDay
            ).padStart(
                2,
                "0"
            );


        rentDueDate.value =
            `${yyyy}-${mm}-${dd}`;


        console.log(
            "Automatic Rent Due Date:",
            rentDueDate.value
        );

    }
    catch (error) {

        console.error(
            "Calculate Rent Due Date Error:",
            error
        );

    }

}

// =========================================
// OPEN RENT ENTRY FORM
// =========================================

if (
    addRentEntryButton &&
    rentEntryFormContainer
) {

    addRentEntryButton.addEventListener(
        "click",
        async () => {

            console.log(
    "ADD RENT BUTTON CLICK HANDLER FIRED"
);

console.log(
    "RENT FORM CONTAINER BEFORE OPEN:",
    rentEntryFormContainer
);

console.log(
    "RENT FORM DISPLAY BEFORE OPEN:",
    rentEntryFormContainer?.style.display
);

console.log(
    "RENT FORM RECT:",
    rentEntryFormContainer?.getBoundingClientRect()
);

console.log(
    "RENT FORM PARENT:",
    rentEntryFormContainer?.parentElement
);

console.log(
    "RENT FORM VISIBILITY:",
    getComputedStyle(
        rentEntryFormContainer
    ).visibility
);

console.log(
    "RENT FORM Z-INDEX:",
    getComputedStyle(
        rentEntryFormContainer
    ).zIndex
);

console.log(
    "RENT REGISTER SECTION:",
    document.querySelector(
        "#rentRegisterSection"
    )
);

console.log(
    "RENT REGISTER SECTION DISPLAY:",
    getComputedStyle(
        document.querySelector(
            "#rentRegisterSection"
        )
    ).display
);

console.log(
    "RENT REGISTER SECTION RECT:",
    document.querySelector(
        "#rentRegisterSection"
    )?.getBoundingClientRect()
);

const rentSection =
    document.querySelector(
        "#rentRegisterSection"
    );

console.log(
    "RENT SECTION PARENT:",
    rentSection?.parentElement
);

console.log(
    "RENT SECTION PARENT DISPLAY:",
    rentSection?.parentElement
        ? getComputedStyle(
            rentSection.parentElement
        ).display
        : null
);

console.log(
    "RENT SECTION PARENT RECT:",
    rentSection?.parentElement
        ?.getBoundingClientRect()
);

            // =====================================
            // OPEN FORM
            // =====================================

            rentEntryFormContainer.style.display =
                "block";


            // =====================================
            // RESET FORM FOR NEW RENT ENTRY
            // =====================================

            if (rentEntryForm) {

                rentEntryForm.reset();

            }


            // =====================================
            // SET CURRENT RENT MONTH
            // =====================================

            const today =
                new Date();


            const currentYear =
                today.getFullYear();


            const currentMonth =
                String(
                    today.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            if (rentMonth) {

                rentMonth.value =
                    `${currentYear}-${currentMonth}`;

            }


            // =====================================
            // RESET NEW-ENTRY FIELDS
            // =====================================

            if (rentDeductionAdjustment) {

                rentDeductionAdjustment.value =
                    "0";

            }


            if (rentDeductionRemark) {

                rentDeductionRemark.value =
                    "";

            }


            if (rentCurrentMeterReading) {

                rentCurrentMeterReading.value =
                    "";

            }


            if (rentUnitsConsumed) {

                rentUnitsConsumed.value =
                    "0";

            }


            if (rentBillableUnits) {

                rentBillableUnits.value =
                    "0";

            }


            if (rentElectricityCharge) {

                rentElectricityCharge.value =
                    "0.00";

            }


            if (rentWaterCharge) {

                rentWaterCharge.value =
                    "0";

            }


            if (rentPropertyTaxCharge) {

                rentPropertyTaxCharge.value =
                    "0";

            }


            if (rentGarbageCharge) {

                rentGarbageCharge.value =
                    "0";

            }


            if (rentOtherCharge) {

                rentOtherCharge.value =
                    "0";

            }


            if (rentPaidAmount) {

                rentPaidAmount.value =
                    "0";

            }


            if (rentPendingAmount) {

                rentPendingAmount.value =
                    "0.00";

            }


            if (rentPaymentDate) {

    const today =
        new Date();

    const yyyy =
        today.getFullYear();

    const mm =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dd =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    rentPaymentDate.value =
        `${yyyy}-${mm}-${dd}`;

}


 if (rentPaymentMode) {

    rentPaymentMode.value =
        "upi";

}


            if (rentPaymentStatus) {

                rentPaymentStatus.value =
                    "pending";

            }


            // =====================================
            // LOAD RENTAL UNITS
            // =====================================

            await loadRentalUnitsForRentRegister();


            // =====================================
            // RESET RENTAL SELECTION
            // =====================================

            if (rentRegisterRentalId) {

                rentRegisterRentalId.value =
                    "";

            }


            // =====================================
            // RESET RENT DUE DATE
            // =====================================

            if (rentDueDate) {

                rentDueDate.value =
                    "";

            }


            // =====================================
            // RESET RENT AMOUNT
            // =====================================

            if (rentAmount) {

                rentAmount.value =
                    "";

            }


            // =====================================
            // RESET PREVIOUS READING
            // =====================================

            if (rentPreviousMeterReading) {

                rentPreviousMeterReading.value =
                    "";

            }


            // =====================================
            // RESET COMMON USE WAIVER
            // =====================================

            if (rentCommonUseWaiver) {

                rentCommonUseWaiver.value =
                    "0";

            }


            // =====================================
            // RECALCULATE TOTAL
            // =====================================

            calculateRentTotal();


            // =====================================
            // SCROLL TO FORM
            // =====================================

            rentEntryFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


// =========================================
// CANCEL RENT ENTRY FORM
// =========================================

if (
    cancelRentEntryButton &&
    rentEntryFormContainer &&
    rentEntryForm
) {

    cancelRentEntryButton.addEventListener(
        "click",
        () => {

            rentEntryForm.reset();

            rentEntryFormContainer.style.display =
                "none";

        }
    );

}


// =========================================
// LOAD RENTAL UNITS INTO RENT REGISTER
// =========================================

async function loadRentalUnitsForRentRegister() {

    const user =
        auth.currentUser;

    if (!user) {

        console.log(
            "User not logged in. Rental units cannot be loaded."
        );

        return;

    }


    if (!rentRegisterRentalId) {

        console.error(
            "Rent Register rental selector not found."
        );

        return;

    }


    try {

        const rentalCollection =
            collection(
                db,
                "users",
                user.uid,
                "rentalUnits"
            );


        const rentalSnapshot =
            await getDocs(
                rentalCollection
            );


        rentRegisterRentalId.innerHTML =
            `
            <option value="">
                -- Select Rental Unit / Tenant --
            </option>
            `;


        rentalSnapshot.forEach(
            (rentalDoc) => {

                const rental =
                    rentalDoc.data();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    rentalDoc.id;


                option.textContent =
                    `${rental.tenantName || "Tenant"} — ${rental.rentalUnitName || "Unit"}`;


                option.dataset.rent =
                    Number(
                        rental.monthlyRent || 0
                    );


                option.dataset.property =
                    rental.propertyName || "";


                option.dataset.unit =
                    rental.rentalUnitName || "";


                option.dataset.tenant =
                    rental.tenantName || "";


                rentRegisterRentalId.appendChild(
                    option
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Load Rental Units For Rent Register Error:",
            error
        );

        alert(
            "Rental Units load नहीं हो सके। Console में error देखें।"
        );

    }

}


// =========================================
// AUTO-FILL MONTHLY RENT
// =========================================

if (rentRegisterRentalId) {

    rentRegisterRentalId.addEventListener(
        "change",
        async () => {

            const selectedOption =
                rentRegisterRentalId
                    .selectedOptions[0];


            if (!selectedOption) {

                return;

            }


            const monthlyRent =
                Number(
                    selectedOption.dataset.rent || 0
                );


            if (rentAmount) {

                rentAmount.value =
                    monthlyRent;

            }


            // =================================
            // LOAD PREVIOUS METER READING
            // =================================

            await loadPreviousMeterReadingForRent();

            await calculateRentDueDate();

        }
    );

}

// =========================================
// RENT MONTH CHANGE
// RECALCULATE DUE DATE
// LOAD EXISTING RENT ENTRY IF AVAILABLE
// =========================================

if (rentMonth) {

    rentMonth.addEventListener(
        "change",
        async () => {

            // =================================
            // RECALCULATE DUE DATE
            // =================================

            await calculateRentDueDate();


            // =================================
            // CHECK TENANT SELECTION
            // =================================

            const rentalId =
                rentRegisterRentalId?.value || "";


            const selectedRentMonth =
                rentMonth?.value || "";


            if (
                !rentalId ||
                !selectedRentMonth
            ) {

                return;

            }


            // =================================
            // GET CURRENT USER
            // =================================

            const user =
                auth.currentUser;


            if (!user) {

                return;

            }


            try {

                // =================================
                // GET RENT REGISTER
                // =================================

                const rentCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "rentRegister"
                    );


                const rentSnapshot =
                    await getDocs(
                        rentCollection
                    );


                let existingRent =
                    null;


                let existingRentId =
                    "";


                // =================================
                // FIND TENANT + MONTH ENTRY
                // =================================

                rentSnapshot.forEach(
                    (rentDoc) => {

                        const rent =
                            rentDoc.data();


                        if (
                            rent.rentalId === rentalId &&
                            rent.rentMonth === selectedRentMonth
                        ) {

                            existingRent =
                                rent;

                            existingRentId =
                                rentDoc.id;

                        }

                    }
                );


                // =================================
                // NO EXISTING ENTRY
                // =================================

                if (!existingRent) {

                    console.log(
                        "No existing Rent Entry found for:",
                        rentalId,
                        selectedRentMonth
                    );

                    return;

                }


                // =================================
                // EXISTING ENTRY FOUND
                // =================================

                console.log(
                    "Existing Rent Entry found:",
                    existingRentId
                );


                // =================================
                // LOAD RENT AMOUNT
                // =================================

                if (rentAmount) {

                    rentAmount.value =
                        Number(
                            existingRent.rentAmount || 0
                        );

                }


                // =================================
                // LOAD DEDUCTION
                // =================================

                if (rentDeductionAdjustment) {

                    rentDeductionAdjustment.value =
                        Number(
                            existingRent.deductionAdjustment || 0
                        );

                }


                // =================================
                // LOAD DEDUCTION REMARK
                // =================================

                if (rentDeductionRemark) {

                    rentDeductionRemark.value =
                        existingRent.deductionRemark || "";

                }


                // =================================
                // LOAD NET PAYABLE RENT
                // =================================

                if (rentNetPayableRent) {

                    rentNetPayableRent.value =
                        Number(
                            existingRent.netPayableRent || 0
                        ).toFixed(2);

                }


                // =================================
                // LOAD PREVIOUS READING
                // =================================

                if (rentPreviousMeterReading) {

                    rentPreviousMeterReading.value =
                        Number(
                            existingRent.previousMeterReading || 0
                        );

                }


                // =================================
                // LOAD CURRENT READING
                // =================================

                if (rentCurrentMeterReading) {

                    rentCurrentMeterReading.value =
                        Number(
                            existingRent.currentMeterReading || 0
                        );

                }


                // =================================
                // LOAD UNITS
                // =================================

                if (rentUnitsConsumed) {

                    rentUnitsConsumed.value =
                        Number(
                            existingRent.unitsConsumed || 0
                        );

                }


                // =================================
                // LOAD COMMON USE WAIVER
                // =================================

                if (rentCommonUseWaiver) {

                    rentCommonUseWaiver.value =
                        Number(
                            existingRent.commonUseWaiver || 0
                        );

                }


                // =================================
                // LOAD BILLABLE UNITS
                // =================================

                if (rentBillableUnits) {

                    rentBillableUnits.value =
                        Number(
                            existingRent.billableUnits || 0
                        );

                }


                // =================================
                // LOAD ELECTRICITY RATE
                // =================================

                if (rentElectricityRate) {

                    rentElectricityRate.value =
                        Number(
                            existingRent.electricityRate || 0
                        );

                }


                // =================================
                // LOAD ELECTRICITY CHARGE
                // =================================

                if (rentElectricityCharge) {

                    rentElectricityCharge.value =
                        Number(
                            existingRent.electricityCharge || 0
                        ).toFixed(2);

                }


                // =================================
                // LOAD WATER
                // =================================

                if (rentWaterCharge) {

                    rentWaterCharge.value =
                        Number(
                            existingRent.waterCharge || 0
                        );

                }


                // =================================
                // LOAD PROPERTY TAX
                // =================================

                if (rentPropertyTaxCharge) {

                    rentPropertyTaxCharge.value =
                        Number(
                            existingRent.propertyTaxCharge || 0
                        );

                }


                // =================================
                // LOAD GARBAGE
                // =================================

                if (rentGarbageCharge) {

                    rentGarbageCharge.value =
                        Number(
                            existingRent.garbageCharge || 0
                        );

                }


                // =================================
                // LOAD OTHER CHARGE
                // =================================

                if (rentOtherCharge) {

                    rentOtherCharge.value =
                        Number(
                            existingRent.otherCharge || 0
                        );

                }


                // =================================
                // LOAD PAID AMOUNT
                // =================================

                if (rentPaidAmount) {

                    rentPaidAmount.value =
                        Number(
                            existingRent.paidAmount || 0
                        ).toFixed(2);


                    rentPaidAmount.dataset.manualEdited =
                        "true";

                }


                // =================================
                // LOAD PAYMENT DATE
                // =================================

                if (rentPaymentDate) {

                    rentPaymentDate.value =
                        existingRent.paymentDate || "";

                }


                // =================================
                // LOAD PAYMENT MODE
                // =================================

                if (rentPaymentMode) {

                    rentPaymentMode.value =
                        existingRent.paymentMode || "upi";

                }


                // =================================
                // LOAD PAYMENT STATUS
                // =================================

                if (rentPaymentStatus) {

                    rentPaymentStatus.value =
                        existingRent.paymentStatus || "pending";

                }


                // =================================
                // LOAD REMARKS
                // =================================

                const remarksField =
                    document.querySelector(
                        "#rentRemarks"
                    );


                if (remarksField) {

                    remarksField.value =
                        existingRent.remarks || "";

                }


                // =================================
                // RECALCULATE
                // =================================

                calculateRentElectricity();

                calculateRentTotal();


                console.log(
                    "Existing Rent Entry loaded successfully."
                );


            }
            catch (error) {

                console.error(
                    "Load Existing Rent Entry Error:",
                    error
                );

            }

        }
    );

}

// =========================================
// CURRENT RENT ENTRY BEING EDITED
// =========================================

let editingRentEntryId = "";

// =========================================
// SAVE RENT ENTRY
// =========================================

if (rentEntryForm) {

    rentEntryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "कृपया पहले login करें।"
                );

                return;

            }


            const rentalId =
                rentRegisterRentalId?.value || "";


            if (!rentalId) {

                alert(
                    "कृपया Rental Unit / Tenant select करें।"
                );

                return;

            }


            const selectedOption =
                rentRegisterRentalId
                    .selectedOptions[0];


            const propertyName =
                selectedOption?.dataset.property || "";


            const rentalUnitName =
                selectedOption?.dataset.unit || "";


            const tenantName =
                selectedOption?.dataset.tenant || "";


 const selectedRent =
    Number(
        rentAmount?.value || 0
    );


const deductionAdjustment =
    Number(
        rentDeductionAdjustment?.value || 0
    );


const deductionRemark =
    rentDeductionRemark?.value.trim() || "";


const netPayableRent =
    Number(
        rentNetPayableRent?.value || 0
    );


const rentMonthValue =
    rentMonth?.value || "";


const rentDueDateValue =
    rentDueDate?.value || "";


if (!rentMonthValue) {

    alert(
        "कृपया Rent Month select करें।"
    );

    return;

}



if (!rentDueDateValue) {

    alert(
        "कृपया Rent Due Date select करें।"
    );

    return;

}


if (selectedRent < 0) {

    alert(
        "Rent Amount सही भरें।"
    );

    return;

}


if (deductionAdjustment < 0) {

    alert(
        "Deduction / Adjustment सही भरें।"
    );

    return;

}


if (deductionAdjustment > selectedRent) {

    alert(
        "Deduction / Adjustment, Agreed Rent से अधिक नहीं हो सकता।"
    );

    return;

}


const previousMeterReading =
    Number(
        rentPreviousMeterReading?.value || 0
    );


const currentMeterReading =
    Number(
        rentCurrentMeterReading?.value || 0
    );


const unitsConsumed =
    Number(
        rentUnitsConsumed?.value || 0
    );


const electricityRate =
    Number(
        rentElectricityRate?.value || 0
    );


const electricityCharge =
    Number(
        rentElectricityCharge?.value || 0
    );


const waterCharge =
    Number(
        rentWaterCharge?.value || 0
    );


const propertyTaxCharge =
    Number(
        rentPropertyTaxCharge?.value || 0
    );


const garbageCharge =
    Number(
        rentGarbageCharge?.value || 0
    );


const otherCharge =
    Number(
        rentOtherCharge?.value || 0
    );


const totalDue =
    Number(
        rentTotalDue?.value || 0
    );


const paidAmount =
    Number(
        rentPaidAmount?.value || 0
    );


const pendingAmount =
    Number(
        rentPendingAmount?.value || 0
    );


const paymentDate =
    document.querySelector(
        "#rentPaymentDate"
    )?.value || "";


const paymentMode =
    document.querySelector(
        "#rentPaymentMode"
    )?.value || "";


const paymentStatus =
    rentPaymentStatus?.value ||
    "pending";

    // =========================================
// RENTAL TRANSACTION LINK DEBUG
// =========================================

console.log(
    "RENTAL TRANSACTION DATA CHECK:",
    {
        linkedRow:
            window.pendingRentalIncomeTransactionRow,

        rentMonth:
            rentMonthValue,

        tenantName:
            tenantName,

        rentAmount:
            selectedRent,

        paidAmount:
            paidAmount,

        paymentStatus:
            paymentStatus,

        paymentDate:
            paymentDate,

        paymentMode:
            paymentMode
    }
);

const remarks =
    document.querySelector(
        "#rentRemarks"
    )?.value.trim() || "";

// =====================================
// AUTO PAYMENT REMARK
// =====================================

const remarksField =
    document.querySelector(
        "#rentRemarks"
    );


if (
    remarksField &&
    !remarksField.value.trim()
) {

    remarksField.value =
        `${rentMonthValue} | Paid: ₹${paidAmount.toLocaleString(
            "en-IN"
        )} | Date: ${paymentDate} | Mode: ${
            paymentMode
                ? paymentMode.toUpperCase()
                : "UPI"
        }`;

}

const rentData = {

    rentalId,

    propertyName,

    rentalUnitName,

    tenantName,

    rentMonth:
        rentMonthValue,

    rentDueDate:
        rentDueDateValue,

    rentAmount:
        selectedRent,

deductionAdjustment,

deductionRemark,

netPayableRent,

    // =================================
    // ELECTRICITY
    // =================================

previousMeterReading,

currentMeterReading,

    commonUseWaiverUnits:
        Number(
            document.querySelector(
                "#commonUseWaiverUnits"
            )?.value || 0
        ),
        
unitsConsumed,

commonUseWaiver:

    Number(
        rentCommonUseWaiver?.value || 0
    ),

billableUnits:

    Number(
        rentBillableUnits?.value || 0
    ),

electricityRate,

electricityCharge,

    // =================================
    // OTHER CHARGES
    // =================================

    waterCharge,

    propertyTaxCharge,

    garbageCharge,

    otherCharge,


    // =================================
    // TOTAL
    // =================================

    totalDue,

    paidAmount,

    pendingAmount,


    // =================================
    // PAYMENT
    // =================================

    paymentDate,

    paymentMode,

    paymentStatus,


    remarks,


    createdAt:
        serverTimestamp(),

    updatedAt:
        serverTimestamp()

};

            try {

                const rentCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "rentRegister"
                    );

// =====================================
// PREVENT DUPLICATE TENANT + RENT MONTH
// =====================================

const duplicateQuery =
    query(
        rentCollection,
        where(
            "rentalId",
            "==",
            rentalId
        ),
        where(
            "rentMonth",
            "==",
            rentMonthValue
        )
    );


const duplicateSnapshot =
    await getDocs(
        duplicateQuery
    );


const duplicateEntry =
    duplicateSnapshot.docs.find(
        (docSnapshot) =>
            docSnapshot.id !==
            editingRentEntryId
    );


if (duplicateEntry) {

    alert(
        "इस Tenant के लिए इस Rent Month की Entry पहले से मौजूद है। Duplicate Entry नहीं बनाई जा सकती।"
    );

    return;

}


// =====================================
// ADD NEW OR UPDATE EXISTING RENT ENTRY
// =====================================

let rentDocId = "";
let linkedTransactionId = "";


if (editingRentEntryId) {

    // =================================
    // UPDATE EXISTING ENTRY
    // =================================

    const rentRef =
        doc(
            db,
            "users",
            user.uid,
            "rentRegister",
            editingRentEntryId
        );


    await updateDoc(
        rentRef,
        {
            ...rentData,

            // Keep original createdAt
            updatedAt:
                serverTimestamp()
        }
    );


    rentDocId =
        editingRentEntryId;


    console.log(
        "Rent Entry updated successfully:",
        {
            id:
                rentDocId,

            ...rentData
        }
    );


    alert(
        "Monthly Rent Entry successfully update हो गई।"
    );

}
else {

    // =================================
    // ADD NEW RENT ENTRY
    // =================================
    
    const rentDoc =
        await addDoc(
            rentCollection,
            rentData
        );


    rentDocId =
        rentDoc.id;


    console.log(
        "Rent Entry saved successfully:",
        {
            id:
                rentDoc.id,

            ...rentData
        }
    );


    // =================================
    // CHECK RENTAL INCOME LINK
    // =================================

    if (
    window.pendingRentalIncomeTransactionRow &&
    Number(paidAmount || 0) > 0
) {

        const transactionCollection =
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            );


        const transactionRef =
            doc(
                transactionCollection
            );


        const transactionData = {

            date:
                window.pendingRentalIncomeTransactionRow
                    .querySelector(
                        ".transaction-date"
                    )?.value
                ||
                paymentDate
                ||
                new Date()
                    .toISOString()
                    .slice(0, 10),


            type:
                "income",


            category:
                "Rental Income",


            partyId:
                null,


            partyName:
                tenantName,


            amount:
                Number(
                    paidAmount || 0
                ),


            fromAccountId:
                null,


            toAccountId:
                window.pendingRentalIncomeTransactionRow
                    .querySelector(
                        ".transaction-to-account"
                    )?.value
                || null,


            paymentMethod:
                paymentMode || "",


            linkedModule:
                "rentRegister",


            rentEntryId:
                rentDoc.id,


            propertyName:
                propertyName,


            rentalUnitName:
                rentalUnitName,


            tenantName:
                tenantName,


            rentMonth:
                rentMonthValue,


            notes:
                remarks || "",


            createdAt:
                serverTimestamp(),


            updatedAt:
                serverTimestamp()

        };


        // =================================
        // SAVE TRANSACTION
        // =================================

        await addDoc(
            transactionCollection,
            transactionData
        );


        console.log(
            "Rental Income Transaction saved successfully."
        );

    }


    // =================================
    // SUCCESS
    // =================================

    alert(
        "Monthly Rent Entry successfully save हो गई।"
    );

}

                rentEntryForm.reset();


                rentEntryFormContainer.style.display =
                    "none";


                await loadRentRegisterEntries();

            }
            catch (error) {

                console.error(
                    "Save Rent Entry Error:",
                    error
                );

                console.log(
                    "ERROR CODE:",
                    error?.code
                );

                console.log(
                    "ERROR MESSAGE:",
                    error?.message
                );


                alert(
                    "Rent Entry save नहीं हो सकी। Console में error देखें।"
                );

            }

        }
    );

}


// =========================================
// VIEW ALL RENT ENTRIES
// =========================================

if (viewAllRentEntriesButton) {

    viewAllRentEntriesButton.addEventListener(
        "click",
        async () => {

            if (rentRegisterTableWrapper) {

                rentRegisterTableWrapper.style.display =
                    "block";

            }


            await loadRentRegisterEntries();


            if (rentRegisterTableWrapper) {

                rentRegisterTableWrapper.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// =========================================
// LOAD RENT REGISTER
// =========================================

async function loadRentRegisterEntries() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Rent Register cannot be loaded."
        );

        return;

    }


    if (!rentRegisterTableBody) {

        console.error(
            "Rent Register table body not found."
        );

        return;

    }


    try {

        const rentCollection =
            collection(
                db,
                "users",
                user.uid,
                "rentRegister"
            );


        const rentSnapshot =
            await getDocs(
                rentCollection
            );


        rentRegisterTableBody.innerHTML =
            "";


        if (rentRegisterCount) {

            rentRegisterCount.textContent =
                rentSnapshot.size;

        }


        if (
            noRentEntriesMessage
        ) {

            noRentEntriesMessage.style.display =
                rentSnapshot.empty
                    ? "block"
                    : "none";

        }


        if (rentSnapshot.empty) {

            return;

        }

        // =====================================
// SORT RENT ENTRIES
// TENANT → RENT MONTH
// =====================================

const sortedRentEntries =
    [...rentSnapshot.docs].sort(
        (a, b) => {

            const rentA =
                a.data();

            const rentB =
                b.data();


            // =================================
            // TENANT NAME — A TO Z
            // =================================

            const tenantA =
                (
                    rentA.tenantName ||
                    ""
                ).toLowerCase();


            const tenantB =
                (
                    rentB.tenantName ||
                    ""
                ).toLowerCase();


            const tenantCompare =
                tenantA.localeCompare(
                    tenantB,
                    "en",
                    {
                        sensitivity:
                            "base"
                    }
                );


            if (
                tenantCompare !== 0
            ) {

                return tenantCompare;

            }


            // =================================
            // SAME TENANT
            // MONTH — NEWEST FIRST
            // =================================

            const monthA =
                rentA.rentMonth ||
                "";


            const monthB =
                rentB.rentMonth ||
                "";


            return monthB.localeCompare(
                monthA
            );

        }
    );

 sortedRentEntries.forEach(
    (rentDoc) => {

                const rent =
                    rentDoc.data();


                const row =
    document.createElement(
        "tr"
    );


// =====================================
// CALCULATE RENT REGISTER VALUES
// =====================================

const electricityCharge =
    Number(
        rent.electricityCharge || 0
    );


const waterCharge =
    Number(
        rent.waterCharge || 0
    );


const propertyTaxCharge =
    Number(
        rent.propertyTaxCharge || 0
    );


const garbageCharge =
    Number(
        rent.garbageCharge || 0
    );


const otherCharge =
    Number(
        rent.otherCharge || 0
    );


const otherChargesTotal =
    waterCharge +
    propertyTaxCharge +
    garbageCharge +
    otherCharge;


// =====================================
// RENT + DEDUCTION + NET PAYABLE RENT
// =====================================

const agreedRent =
    Number(
        rent.rentAmount || 0
    );


const deductionAdjustment =
    Number(
        rent.deductionAdjustment || 0
    );


const netPayableRent =
    Number(
        rent.netPayableRent ??
        Math.max(
            agreedRent -
            deductionAdjustment,
            0
        )
    );


// =====================================
// TOTAL DUE
// =====================================

const totalDue =
    Number(
        rent.totalDue ??
        (
            netPayableRent +
            electricityCharge +
            otherChargesTotal
        )
    );

// =====================================
// PAID
// =====================================

const paidAmount =
    Number(
        rent.paidAmount || 0
    );


// =====================================
// PENDING
// =====================================

const pendingAmount =
    Math.max(
        totalDue - paidAmount,
        0
    );


// =====================================
// STATUS
// =====================================

let statusText =
    "🔴 Pending";


if (
    totalDue > 0 &&
    paidAmount >= totalDue
) {

    statusText =
        "🟢 Paid";

}
else if (
    paidAmount > 0 &&
    paidAmount < totalDue
) {

    statusText =
        "🟡 Partial";

}

// =====================================
// CHECK SITA KUSHWAH APRIL-2026 DUPLICATE
// =====================================

if (
    rent.tenantName === "SITA KUSHWAH" &&
    rent.rentMonth === "2026-04"
) {

    console.log(
        "SITA KUSHWAH APRIL-2026 RENT ENTRY:",
        {
            rentEntryId:
                rentDoc.id,

            tenantName:
                rent.tenantName,

            rentMonth:
                rent.rentMonth,

            rentAmount:
                rent.rentAmount,

            totalDue:
                totalDue,

            paidAmount:
                paidAmount,

            otherCharges:
                otherChargesTotal,

            paymentDate:
                rent.paymentDate,

            linkedTransactionId:
                rent.linkedTransactionId ||
                null
        }
    );

}

// =====================================
// TABLE ROW
// =====================================

row.innerHTML =
    `

    <td>
        ${formatRentMonth(rent.rentMonth)}
    </td>

    <td>
        ${rent.propertyName || "-"}
    </td>

    <td>
        ${rent.tenantName || "-"}
    </td>

    <td>
        ₹${Number(
            rent.rentAmount || 0
        ).toLocaleString("en-IN")}
    </td>

    <td>
        ₹${electricityCharge.toLocaleString(
            "en-IN"
        )}
    </td>

    <td>
        ₹${otherChargesTotal.toLocaleString(
            "en-IN"
        )}
    </td>

    <td>
        ₹${totalDue.toLocaleString(
            "en-IN"
        )}
    </td>

    <td>
        ₹${paidAmount.toLocaleString(
            "en-IN"
        )}
    </td>

    <td>
        ₹${pendingAmount.toLocaleString(
            "en-IN"
        )}
    </td>

    <td>
        ${statusText}
    </td>

    <td>
         ${formatPaymentDate(rent.paymentDate)}
    </td>

    <td>

        <button
            type="button"
            class="edit-rent-entry-button"
            data-id="${rentDoc.id}">

            ✏️ Edit

        </button>


        <button
            type="button"
            class="delete-rent-entry-button"
            data-id="${rentDoc.id}">

            🗑️ Delete

        </button>

    </td>

    `;


                rentRegisterTableBody.appendChild(
                    row
                );

            }
        );


        // =====================================
        // UPDATE SUMMARY
        // =====================================

        updateBasicRentSummary(
            rentSnapshot
        );


    }
    catch (error) {

        console.error(
            "Load Rent Register Error:",
            error
        );

        console.log(
            "ERROR CODE:",
            error?.code
        );

        console.log(
            "ERROR MESSAGE:",
            error?.message
        );

    }

}

// =========================================
// EDIT MONTHLY RENT ENTRY
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        // =====================================
        // CHECK EDIT BUTTON
        // =====================================

        if (
            !event.target.classList.contains(
                "edit-rent-entry-button"
            )
        ) {

            return;

        }


        // =====================================
        // GET RENT ENTRY ID
        // =====================================

        const rentEntryId =
            event.target.dataset.id;


        if (!rentEntryId) {

            console.error(
                "Rent Entry ID not found."
            );

            return;

        }


        // =====================================
        // CHECK USER
        // =====================================

        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले login करें।"
            );

            return;

        }


        try {

            // =================================
            // GET RENT ENTRY
            // =================================

            const rentRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "rentRegister",
                    rentEntryId
                );


            const rentSnapshot =
                await getDoc(
                    rentRef
                );


            if (
                !rentSnapshot.exists()
            ) {

                alert(
                    "Rent Entry नहीं मिली।"
                );

                return;

            }


            const rent =
                rentSnapshot.data();


            // =================================
            // SET EDITING ID
            // =================================

            editingRentEntryId =
                rentEntryId;


            // =================================
            // LOAD RENTAL UNITS
            // =================================

            await loadRentalUnitsForRentRegister();


            // =================================
            // SELECT TENANT / RENTAL UNIT
            // =================================

            if (rentRegisterRentalId) {

                rentRegisterRentalId.value =
                    rent.rentalId || "";

            }


            // =================================
            // RENT MONTH
            // =================================

            if (rentMonth) {

                rentMonth.value =
                    rent.rentMonth || "";

            }


            // =================================
            // RENT DUE DATE
            // =================================

            if (rentDueDate) {

                rentDueDate.value =
                    rent.rentDueDate || "";

            }


            // =================================
            // AGREED RENT
            // =================================

            if (rentAmount) {

                rentAmount.value =
                    rent.rentAmount ?? 0;

            }


            // =================================
            // DEDUCTION / ADJUSTMENT
            // =================================

            if (rentDeductionAdjustment) {

                rentDeductionAdjustment.value =
                    rent.deductionAdjustment ?? 0;

            }


            // =================================
            // DEDUCTION REMARK
            // =================================

            if (rentDeductionRemark) {

                rentDeductionRemark.value =
                    rent.deductionRemark || "";

            }


            // =================================
            // NET PAYABLE RENT
            // =================================

            if (rentNetPayableRent) {

                rentNetPayableRent.value =
                    rent.netPayableRent ?? 0;

            }


            // =================================
            // PREVIOUS METER READING
            // =================================

            if (rentPreviousMeterReading) {

                rentPreviousMeterReading.value =
                    rent.previousMeterReading ?? 0;

            }


            // =================================
            // CURRENT METER READING
            // =================================

            if (rentCurrentMeterReading) {

                rentCurrentMeterReading.value =
                    rent.currentMeterReading ?? 0;

            }


            // =================================
            // COMMON USE / WAIVER
            // =================================

            if (rentCommonUseWaiver) {

                rentCommonUseWaiver.value =
                    rent.commonUseWaiver ?? 0;

            }


            // =================================
            // BILLABLE UNITS
            // =================================

            if (rentBillableUnits) {

                rentBillableUnits.value =
                    rent.billableUnits ?? 0;

            }


            // =================================
            // ELECTRICITY RATE
            // =================================

            if (rentElectricityRate) {

                rentElectricityRate.value =
                    rent.electricityRate ?? 0;

            }


            // =================================
            // ELECTRICITY CHARGE
            // =================================

            if (rentElectricityCharge) {

                rentElectricityCharge.value =
                    rent.electricityCharge ?? 0;

            }


            // =================================
            // WATER CHARGE
            // =================================

            if (rentWaterCharge) {

                rentWaterCharge.value =
                    rent.waterCharge ?? 0;

            }


            // =================================
            // PROPERTY TAX
            // =================================

            if (rentPropertyTaxCharge) {

                rentPropertyTaxCharge.value =
                    rent.propertyTaxCharge ?? 0;

            }


            // =================================
            // GARBAGE CHARGE
            // =================================

            if (rentGarbageCharge) {

                rentGarbageCharge.value =
                    rent.garbageCharge ?? 0;

            }


            // =================================
            // OTHER CHARGE
            // =================================

            if (rentOtherCharge) {

                rentOtherCharge.value =
                    rent.otherCharge ?? 0;

            }


            // =================================
            // TOTAL DUE
            // =================================

            if (rentTotalDue) {

                rentTotalDue.value =
                    rent.totalDue ?? 0;

            }


            // =================================
            // PAID AMOUNT
            // =================================

            if (rentPaidAmount) {

                rentPaidAmount.value =
                    rent.paidAmount ?? 0;

                rentPaidAmount.dataset.manualEdited =
                    "true";

            }


            // =================================
            // PENDING AMOUNT
            // =================================

            if (rentPendingAmount) {

                rentPendingAmount.value =
                    rent.pendingAmount ?? 0;

            }


            // =================================
            // PAYMENT DATE
            // =================================

            if (rentPaymentDate) {

                rentPaymentDate.value =
                    rent.paymentDate || "";

            }


            // =================================
            // PAYMENT MODE
            // =================================

            if (rentPaymentMode) {

                rentPaymentMode.value =
                    rent.paymentMode || "upi";

            }


            // =================================
            // PAYMENT STATUS
            // =================================

            if (rentPaymentStatus) {

                rentPaymentStatus.value =
                    rent.paymentStatus || "pending";

            }


            // =================================
            // DEDUCTION / PAYMENT REMARKS
            // =================================

            if (rentRemarks) {

                rentRemarks.value =
                    rent.remarks || "";

            }


            // =================================
            // RECALCULATE ELECTRICITY
            // =================================

            calculateRentElectricity();


            // =================================
            // RECALCULATE TOTAL
            // =================================

            calculateRentTotal();


            // =================================
            // SHOW EDIT FORM
            // =================================

            if (rentEntryFormHeading) {

                rentEntryFormHeading.textContent =
                    "✏️ Edit Monthly Rent Entry";

            }


            if (saveRentEntryButton) {

                saveRentEntryButton.textContent =
                    "💾 Update Rent Entry";

            }


            if (rentEntryFormContainer) {

                rentEntryFormContainer.style.display =
                    "block";

            }


            // =================================
            // HIDE REGISTER TABLE
            // =================================

            if (rentRegisterTableWrapper) {

                rentRegisterTableWrapper.style.display =
                    "none";

            }


            // =================================
            // SCROLL TO FORM
            // =================================

            if (rentEntryFormContainer) {

                rentEntryFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


        }
        catch (error) {

            console.error(
                "Load Rent Entry For Edit Error:",
                error
            );


            console.log(
                "ERROR CODE:",
                error?.code
            );


            console.log(
                "ERROR MESSAGE:",
                error?.message
            );


            alert(
                "Rent Entry edit के लिए load नहीं हो सकी।"
            );

        }

    }
);

// =========================================
// DELETE MONTHLY RENT ENTRY
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        // =====================================
        // CHECK DELETE BUTTON
        // =====================================

        if (
            !event.target.classList.contains(
                "delete-rent-entry-button"
            )
        ) {

            return;

        }


        // =====================================
        // GET RENT ENTRY ID
        // =====================================

        const rentEntryId =
            event.target.dataset.id;


        if (!rentEntryId) {

            console.error(
                "Rent Entry ID not found."
            );

            return;

        }


        // =====================================
        // PREVENT MULTIPLE CLICKS
        // =====================================

        const deleteButton =
            event.target;


        if (
            deleteButton.dataset.deleting ===
            "true"
        ) {

            return;

        }


        // =====================================
        // CONFIRM DELETE
        // =====================================

        const confirmDelete =
            confirm(
                "क्या आप इस Monthly Rent Entry को delete करना चाहते हैं?\n\nयह कार्रवाई वापस नहीं की जा सकती।"
            );


        if (!confirmDelete) {

            return;

        }


        // =====================================
        // LOCK BUTTON
        // =====================================

        deleteButton.dataset.deleting =
            "true";

        deleteButton.disabled =
            true;

        deleteButton.textContent =
            "⏳ Deleting...";


        // =====================================
        // CHECK USER
        // =====================================

        const user =
            auth.currentUser;


        if (!user) {

            deleteButton.disabled =
                false;

            deleteButton.dataset.deleting =
                "false";

            deleteButton.textContent =
                "🗑️ Delete";

            alert(
                "कृपया पहले login करें।"
            );

            return;

        }


        try {

            // =================================
            // RENT ENTRY REFERENCE
            // =================================

            const rentRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "rentRegister",
                    rentEntryId
                );


            // =================================
            // DELETE FROM FIRESTORE
            // =================================

            await deleteDoc(
                rentRef
            );


            console.log(
                "Rent Entry deleted successfully:",
                rentEntryId
            );


            // =================================
            // REMOVE ROW IMMEDIATELY
            // =================================

            const deletedRow =
                deleteButton.closest("tr");


            if (deletedRow) {

                deletedRow.remove();

            }


            // =================================
            // UPDATE COUNT
            // =================================

            if (rentRegisterCount) {

                const currentCount =
                    Number(
                        rentRegisterCount.textContent ||
                        0
                    );


                rentRegisterCount.textContent =
                    Math.max(
                        currentCount - 1,
                        0
                    );

            }


            // =================================
            // SUCCESS MESSAGE
            // =================================

            alert(
                "Monthly Rent Entry successfully delete हो गई।"
            );


            // =================================
            // RESET BUTTON STATE
            // =================================

            deleteButton.dataset.deleting =
                "false";


        }
        catch (error) {

            console.error(
                "Delete Rent Entry Error:",
                error
            );


            console.log(
                "ERROR CODE:",
                error?.code
            );


            console.log(
                "ERROR MESSAGE:",
                error?.message
            );


            // =================================
            // RESTORE BUTTON
            // =================================

            deleteButton.disabled =
                false;

            deleteButton.dataset.deleting =
                "false";

            deleteButton.textContent =
                "🗑️ Delete";


            alert(
                "Rent Entry delete नहीं हो सकी। Console में error देखें।"
            );

        }

    }
);

// =========================================
// BASIC RENT SUMMARY
// =========================================

function updateBasicRentSummary(
    rentSnapshot
) {

    let totalDue =
        0;


    let totalReceived =
        0;


    let totalPending =
        0;


    let paidCount =
        0;


    let pendingCount =
        0;


    rentSnapshot.forEach(
        (rentDoc) => {

            const rent =
                rentDoc.data();


            // =================================
            // TOTAL DUE
            // =================================

            const due =
                Number(
                    rent.totalDue ??
                    (
                        Number(
                            rent.rentAmount || 0
                        ) +
                        Number(
                            rent.electricityCharge || 0
                        ) +
                        Number(
                            rent.waterCharge || 0
                        ) +
                        Number(
                            rent.propertyTaxCharge || 0
                        ) +
                        Number(
                            rent.garbageCharge || 0
                        ) +
                        Number(
                            rent.otherCharge || 0
                        )
                    )
                );


            // =================================
            // PAID / RECEIVED
            // =================================

            const paid =
                Number(
                    rent.paidAmount || 0
                );


            // =================================
            // PENDING
            // =================================

            const pending =
                Math.max(
                    due - paid,
                    0
                );


            // =================================
            // SUMMARY TOTALS
            // =================================

            totalDue +=
                due;


            totalReceived +=
                paid;


            totalPending +=
                pending;


            // =================================
            // STATUS COUNTS
            // =================================

            if (
                due > 0 &&
                paid >= due
            ) {

                paidCount++;

            }
            else {

                pendingCount++;

            }

        }
    );


    // =========================================
    // SUMMARY ELEMENTS
    // =========================================

    const totalDueElement =
        document.querySelector(
            "#rentSummaryTotalDue"
        );


    const totalReceivedElement =
        document.querySelector(
            "#rentSummaryTotalReceived"
        );


    const totalPendingElement =
        document.querySelector(
            "#rentSummaryTotalPending"
        );


    const entryCountElement =
        document.querySelector(
            "#rentSummaryEntryCount"
        );


    const paidCountElement =
        document.querySelector(
            "#rentSummaryPaidCount"
        );


    const pendingCountElement =
        document.querySelector(
            "#rentSummaryPendingCount"
        );


    // =========================================
    // UPDATE SUMMARY
    // =========================================

    if (totalDueElement) {

        totalDueElement.textContent =
            `₹${totalDue.toLocaleString(
                "en-IN"
            )}`;

    }


    if (totalReceivedElement) {

        totalReceivedElement.textContent =
            `₹${totalReceived.toLocaleString(
                "en-IN"
            )}`;

    }


    if (totalPendingElement) {

        totalPendingElement.textContent =
            `₹${totalPending.toLocaleString(
                "en-IN"
            )}`;

    }


    if (entryCountElement) {

        entryCountElement.textContent =
            rentSnapshot.size;

    }


    if (paidCountElement) {

        paidCountElement.textContent =
            paidCount;

    }


    if (pendingCountElement) {

        pendingCountElement.textContent =
            pendingCount;

    }


    // =========================================
    // SHOW / HIDE SUMMARY
    // =========================================

    const summary =
        document.querySelector(
            "#rentRegisterSummary"
        );


    if (summary) {

        summary.style.display =
            rentSnapshot.empty
                ? "none"
                : "grid";

    }

}

// =========================================
// RENT REGISTER — ELECTRICITY CALCULATION
// =========================================

const rentPreviousMeterReading =
    document.querySelector(
        "#rentPreviousMeterReading"
    );

const rentCurrentMeterReading =
    document.querySelector(
        "#rentCurrentMeterReading"
    );

const rentUnitsConsumed =
    document.querySelector(
        "#rentUnitsConsumed"
    );

const rentElectricityRate =
    document.querySelector(
        "#rentElectricityRate"
    );

    const rentCommonUseWaiver =
    document.querySelector(
        "#rentCommonUseWaiver"
    );

const rentBillableUnits =
    document.querySelector(
        "#rentBillableUnits"
    );

const rentElectricityCharge =
    document.querySelector(
        "#rentElectricityCharge"
    );

const rentDeductionAdjustment =
    document.querySelector(
        "#rentDeductionAdjustment"
    );

const rentDeductionRemark =
    document.querySelector(
        "#rentDeductionRemark"
    );

const rentNetPayableRent =
    document.querySelector(
        "#rentNetPayableRent"
    );

const rentWaterCharge =
    document.querySelector(
        "#rentWaterCharge"
    );

const rentPropertyTaxCharge =
    document.querySelector(
        "#rentPropertyTaxCharge"
    );

const rentGarbageCharge =
    document.querySelector(
        "#rentGarbageCharge"
    );

const rentOtherCharge =
    document.querySelector(
        "#rentOtherCharge"
    );

const rentTotalDue =
    document.querySelector(
        "#rentTotalDue"
    );

const rentPaidAmount =
    document.querySelector(
        "#rentPaidAmount"
    );

const rentPendingAmount =
    document.querySelector(
        "#rentPendingAmount"
    );

const rentPaymentStatus =
    document.querySelector(
        "#rentPaymentStatus"
    );


// =========================================
// CALCULATE ELECTRICITY
// =========================================

function calculateRentElectricity() {

    const previous =
        Number(
            rentPreviousMeterReading?.value || 0
        );

    const current =
        Number(
            rentCurrentMeterReading?.value || 0
        );

    const rate =
        Number(
            rentElectricityRate?.value || 0
        );


    let units =
        current - previous;


    // Reading cannot go backwards
    if (units < 0) {

        units = 0;

    }


    const waiver =
    Number(
        rentCommonUseWaiver?.value || 0
    );


let billableUnits =
    units - waiver;


if (billableUnits < 0) {

    billableUnits = 0;

}


const electricityCharge =
    billableUnits * rate;

    if (rentUnitsConsumed) {

        rentUnitsConsumed.value =
            units;

    }


    if (rentBillableUnits) {

    rentBillableUnits.value =
        billableUnits;

}

    if (rentElectricityCharge) {

        rentElectricityCharge.value =
            electricityCharge.toFixed(2);

    }


    calculateRentTotal();

}

// =========================================
// DISPLAY FORMAT HELPERS
// =========================================

function formatRentMonth(monthValue) {

    if (!monthValue) {

        return "—";

    }


    const parts =
        monthValue.split("-");


    if (parts.length !== 2) {

        return monthValue;

    }


    const year =
        parts[0];

    const monthNumber =
        Number(parts[1]);


    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    return (
        monthNames[monthNumber - 1] ||
        parts[1]
    ) + "-" + year;

}


function formatPaymentDate(dateValue) {

    if (!dateValue) {

        return "—";

    }


    const parts =
        dateValue.split("-");


    if (parts.length !== 3) {

        return dateValue;

    }


    const year =
        parts[0];

    const monthNumber =
        Number(parts[1]);

    const day =
        parts[2];


    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    const monthName =
        monthNames[monthNumber - 1] ||
        parts[1];


    return (
        `${day}-${monthName}-${year}`
    );

}

// =========================================
// CALCULATE TOTAL RENT + CHARGES
// =========================================

function calculateRentTotal() {

    const rent =
        Number(
            rentAmount?.value || 0
        );


    const deduction =
        Number(
            rentDeductionAdjustment?.value || 0
        );


    // =====================================
    // CALCULATE NET PAYABLE RENT
    // =====================================

    let netPayableRent =
        rent - deduction;


    if (netPayableRent < 0) {

        netPayableRent = 0;

    }


    if (rentNetPayableRent) {

        rentNetPayableRent.value =
            netPayableRent.toFixed(2);

    }


    // =====================================
    // OTHER CHARGES
    // =====================================

    const electricity =
        Number(
            rentElectricityCharge?.value || 0
        );


    const water =
        Number(
            rentWaterCharge?.value || 0
        );


    const propertyTax =
        Number(
            rentPropertyTaxCharge?.value || 0
        );


    const garbage =
        Number(
            rentGarbageCharge?.value || 0
        );


    const other =
        Number(
            rentOtherCharge?.value || 0
        );


    // =====================================
    // TOTAL DUE
    // =====================================

    const total =
        netPayableRent +
        electricity +
        water +
        propertyTax +
        garbage +
        other;


    // =====================================
    // DISPLAY TOTAL
    // =====================================

    if (rentTotalDue) {

        rentTotalDue.value =
            total.toFixed(2);

    }

// =====================================
// AUTO-FILL PAID AMOUNT
// =====================================

if (
    rentPaidAmount &&
    rentPaidAmount.dataset.manualEdited !== "true"
) {

    rentPaidAmount.value =
        total.toFixed(2);

}


// =====================================
// AUTO-FILL PAYMENT REMARK
// =====================================

const remarksField =
    document.querySelector(
        "#rentRemarks"
    );


if (
    remarksField &&
    !remarksField.dataset.manualEdited
) {

    const paid =
        Number(
            rentPaidAmount?.value || 0
        );


    const paymentDate =
        rentPaymentDate?.value || "";


    const paymentMode =
        rentPaymentMode?.value || "upi";


    remarksField.value =
    `${formatRentMonth(
        rentMonth?.value || ""
    )} | Paid: ₹${paid.toLocaleString(
        "en-IN"
    )} | Date: ${formatPaymentDate(
        paymentDate
    )} | Mode: ${paymentMode.toUpperCase()}`;

}

    // =====================================
    // PAID AMOUNT
    // AUTO-FILL WITH TOTAL DUE
    // USER CAN EDIT
    // =====================================

    if (
        rentPaidAmount &&
        rentPaidAmount.dataset.manualEdited !== "true"
    ) {

        rentPaidAmount.value =
            total.toFixed(2);

    }


    const paid =
        Number(
            rentPaidAmount?.value || 0
        );


    // =====================================
    // PENDING AMOUNT
    // =====================================

    let pending =
        total - paid;


    if (pending < 0) {

        pending = 0;

    }


    if (rentPendingAmount) {

        rentPendingAmount.value =
            pending.toFixed(2);

    }


    // =====================================
    // AUTO PAYMENT STATUS
    // =====================================

    if (rentPaymentStatus) {

        if (paid <= 0) {

            rentPaymentStatus.value =
                "pending";

        }
        else if (paid < total) {

            rentPaymentStatus.value =
                "partial";

        }
        else {

            rentPaymentStatus.value =
                "paid";

        }

    }

}

// =========================================
// RENT DEDUCTION / ADJUSTMENT EVENTS
// =========================================

if (rentAmount) {

    rentAmount.addEventListener(
        "input",
        calculateRentTotal
    );

}


if (rentDeductionAdjustment) {

    rentDeductionAdjustment.addEventListener(
        "input",
        calculateRentTotal
    );

}


if (rentPaidAmount) {

    rentPaidAmount.addEventListener(
        "input",
        () => {

            rentPaidAmount.dataset.manualEdited =
                "true";

            calculateRentTotal();

        }
    );

}
    
// =========================================
// ELECTRICITY INPUT EVENTS
// =========================================

if (rentCurrentMeterReading) {

    rentCurrentMeterReading.addEventListener(
        "input",
        calculateRentElectricity
    );

}


if (rentElectricityRate) {

    rentElectricityRate.addEventListener(
        "input",
        calculateRentElectricity
    );

}

if (rentCommonUseWaiver) {

    rentCommonUseWaiver.addEventListener(
        "input",
        calculateRentElectricity
    );

}


// =========================================
// OTHER CHARGES EVENTS
// =========================================

[
    rentWaterCharge,
    rentPropertyTaxCharge,
    rentGarbageCharge,
    rentOtherCharge
].forEach(
    (element) => {

        if (element) {

            element.addEventListener(
                "input",
                calculateRentTotal
            );

        }

    }
);


// =========================================
// PAID AMOUNT EVENT
// =========================================

if (rentPaidAmount) {

    rentPaidAmount.addEventListener(
        "input",
        calculateRentTotal
    );

}

// =========================================
// LOAD PREVIOUS METER READING
// =========================================

async function loadPreviousMeterReadingForRent() {

    const user =
        auth.currentUser;


    const rentalId =
        rentRegisterRentalId?.value || "";


    if (!user || !rentalId) {

        if (rentPreviousMeterReading) {

            rentPreviousMeterReading.value =
                "";

        }

        return;

    }


    try {

        // =====================================
        // STEP 1
        // FIND LATEST RENT REGISTER ENTRY
        // =====================================

        const rentCollection =
            collection(
                db,
                "users",
                user.uid,
                "rentRegister"
            );


        const rentSnapshot =
            await getDocs(
                rentCollection
            );


        let latestEntry =
            null;


        rentSnapshot.forEach(
            (rentDoc) => {

                const rent =
                    rentDoc.data();


                if (
                    rent.rentalId !==
                    rentalId
                ) {

                    return;

                }


                // Current reading must actually exist
                if (
                    rent.currentMeterReading ===
                    undefined ||
                    rent.currentMeterReading ===
                    null
                ) {

                    return;

                }


                if (!latestEntry) {

                    latestEntry = {
                        ...rent,
                        id: rentDoc.id
                    };

                    return;

                }


                if (
                    (rent.rentMonth || "") >
                    (latestEntry.rentMonth || "")
                ) {

                    latestEntry = {
                        ...rent,
                        id: rentDoc.id
                    };

                }

            }
        );


        // =====================================
        // STEP 2
        // IF PREVIOUS RENT ENTRY EXISTS
        // =====================================

        if (
            latestEntry &&
            rentPreviousMeterReading
        ) {

            rentPreviousMeterReading.value =
                Number(
                    latestEntry.currentMeterReading || 0
                );


            calculateRentElectricity();

            return;

        }


        // =====================================
        // STEP 3
        // NO RENT REGISTER ENTRY
        // USE RENTAL UNIT DATA
        // =====================================

        const rentalUnitReference =
            doc(
                db,
                "users",
                user.uid,
                "rentalUnits",
                rentalId
            );


        const rentalUnitSnapshot =
            await getDoc(
                rentalUnitReference
            );


        if (
            rentalUnitSnapshot.exists()
        ) {

            const rentalUnit =
                rentalUnitSnapshot.data();


            const rentalUnitPreviousReading =
                Number(
                    rentalUnit.previousMeterReading || 0
                );


            const rentalUnitCurrentReading =
                Number(
                    rentalUnit.currentMeterReading || 0
                );


            // =================================
            // PREFERRED READING
            // =================================

            let startingReading =
                rentalUnitPreviousReading;


            // If previous reading is not available
            // but current reading exists, use current.
            if (
                startingReading <= 0 &&
                rentalUnitCurrentReading > 0
            ) {

                startingReading =
                    rentalUnitCurrentReading;

            }


            if (rentPreviousMeterReading) {

                rentPreviousMeterReading.value =
                    startingReading;

            }

        }
        else {

            if (rentPreviousMeterReading) {

                rentPreviousMeterReading.value =
                    0;

            }

        }


        calculateRentElectricity();

    }
    catch (error) {

        console.error(
            "Load Previous Meter Reading Error:",
            error
        );

        console.log(
            "ERROR CODE:",
            error?.code
        );

        console.log(
            "ERROR MESSAGE:",
            error?.message
        );

    }

}