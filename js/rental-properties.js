// =========================================
// FIREBASE IMPORTS
// =========================================

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
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

