import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// MASTER TRANSACTIONS MODULE
// ===============================

console.log(
    "Transactions module loaded successfully."
);

// ===============================
// TRANSACTION FORM ELEMENTS
// ===============================

const transactionForm =
    document.querySelector(
        "#transactionForm"
    );

const transactionFormContainer =
    document.querySelector(
        "#transactionFormContainer"
    );

const addTransactionButton =
    document.querySelector(
        "#addTransactionButton"
    );

const cancelTransactionButton =
    document.querySelector(
        "#cancelTransactionButton"
    );

    

// ===============================
// ELEMENT CHECK
// ===============================

console.log(
    "Transaction elements:",
    {
        form: !!transactionForm,
        container: !!transactionFormContainer,
        addButton: !!addTransactionButton,
        cancelButton: !!cancelTransactionButton
    }
);

// ===============================
// TRANSACTION FORM HIDDEN BY DEFAULT
// ===============================

if (transactionFormContainer) {
    transactionFormContainer.style.display = "none";
}

// ===============================
// OPEN TRANSACTION FORM
// ===============================

if (addTransactionButton) {

    addTransactionButton.addEventListener(
        "click",
        async () => {

            if (transactionFormContainer) {

                transactionFormContainer.style.display =
                    "block";

            }


                    loadSavedTransactionCategories();

                    await loadTransactionAccounts();

                    loadTransactionParties();

                    await loadTransactionInvestments();

                    await loadCustomTransactionTypes();

                    console.log("🚗 ABOUT TO LOAD VEHICLES");

                    loadTransactionVehicleDropdowns();

                    loadSavedTransactions();

        }
    );

}

// ===============================
// CLOSE TRANSACTION FORM
// ===============================

if (cancelTransactionButton) {

    cancelTransactionButton.addEventListener(
        "click",
        () => {

            if (transactionFormContainer) {

                transactionFormContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// MASTER TRANSACTIONS MODULE
// ===============================

console.log(
    "Transactions module loaded successfully."
);

// ===============================
// TRANSACTION CATEGORY SYSTEM
// MULTI-ENTRY VERSION
// ===============================


// ===============================
// SAVED FIRESTORE CATEGORIES
// ===============================

let savedTransactionCategories = [];

// ===============================
// SAVED USER ACCOUNTS
// ===============================

let savedTransactionAccounts = [];

// =========================================
// SAVED FIRESTORE PARTIES
// =========================================

let savedTransactionParties = [];

// =========================================
// SAVED FIRESTORE INVESTMENTS
// =========================================

let savedTransactionInvestments = [];

// =========================================
// LOAD INVESTMENTS FOR TRANSACTIONS
// =========================================

async function loadTransactionInvestments() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Investments cannot be loaded."
        );

        return;

    }


    try {

        const investmentCollection =
            collection(
                db,
                "users",
                user.uid,
                "investments"
            );


        const snapshot =
            await getDocs(
                investmentCollection
            );


        savedTransactionInvestments = [];


        snapshot.forEach(
            (investmentDoc) => {

                const data =
                    investmentDoc.data();


                savedTransactionInvestments.push({

                    id:
                        investmentDoc.id,

                    name:
                        data.name || "",

                    category:
                        data.category || "",

                    amount:
                        Number(
                            data.amount || 0
                        ),

                    currentValue:
                        Number(
                            data.currentValue || 0
                        ),

                    investmentDate:
                        data.investmentDate || "",

                    notes:
                        data.notes || ""

                });

            }
        );


        console.log(
            "Transaction Investments Loaded:",
            savedTransactionInvestments
        );

    }
    catch (error) {

        console.error(
            "Load Transaction Investments Error:",
            error
        );

    }

}

// ===============================
// TEMPORARY / BUILT-IN CATEGORY LIST
// ===============================

const categoryOptions = {

    income: [
        "Salary",
        "Freelancing",
        "Interest",
        "Dividend",
        "Rental Income",
        "Other Income"
    ],

    expense: [
    "Food",
    "Grocery",
    "Mobile Recharge",
    "Electricity Bill",
    "Gas",
    "Shopping",
    "Clothing",
    "Medical",
    "Education",
    "Property Tax",
    "Home Loan EMI",
    "Principal Prepayment – Home Loan",

    "Vehicle Fuel",
    "Vehicle Insurance",
    "Vehicle Maintenance",
    "Vehicle Challan",
    "Vehicle Other Expense",

    "Other Expense"
],
    investment: [
        "Fixed Deposit",
        "Stock / Shares",
        "Mutual Fund / SIP",
        "Gold",
        "NPS - National Pension Scheme",
        "Other Investment"
    ],

    transfer: [
        "Bank Transfer",
        "Credit Card Bill Payment",
        "Account Transfer",
        "Other Transfer"
    ],

    wallet_payment: [
        "Mobile Recharge",
        "Electricity Bill",
        "Gas Bill",
        "Shopping",
        "Other Wallet Payment"
    ],

    cashback: [
        "Credit Card Cashback",
        "UPI Cashback",
        "Wallet Cashback",
        "Other Cashback"
    ]

};


// ===============================
// LOAD CATEGORY FOR ONE ROW
// ===============================

function loadTransactionCategoriesForRow(row) {
console.log("🔍 CATEGORY LOADER CALLED", row);
    if (!row) {
        return;
    }


    const transactionTypeSelect =
        row.querySelector(
            ".transaction-type"
        );


    const transactionCategorySelect =
        row.querySelector(
            ".transaction-category"
        );


    if (
        !transactionTypeSelect ||
        !transactionCategorySelect
    ) {
        return;
    }


    const selectedType =
    transactionTypeSelect.value;

// Remember currently selected category
const previousCategory =
    transactionCategorySelect.value;

transactionCategorySelect.innerHTML =
    "";

    const defaultOption =
        document.createElement("option");


    defaultOption.value =
        "";


    defaultOption.textContent =
        "Select Category";


    transactionCategorySelect.appendChild(
        defaultOption
    );


    if (!selectedType) {
        return;
    }


    // ===============================
    // CATEGORY NAME NORMALIZER
    // ===============================

    function normalizeCategoryName(name) {

        return (name || "")
            .toLowerCase()
            .trim()
            .replace(/[\s\-–—_]+/g, "");

    }


    // ===============================
    // TRACK CATEGORIES ALREADY ADDED
    // ===============================

    const addedCategories =
        new Set();


    // ===============================
    // BUILT-IN CATEGORIES
    // ===============================

    const categories =
        categoryOptions[selectedType] || [];


    categories.forEach(
        (category) => {

            const normalizedName =
                normalizeCategoryName(
                    category
                );


            if (
                !addedCategories.has(
                    normalizedName
                )
            ) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;


                option.textContent =
                    category;


                transactionCategorySelect
                    .appendChild(
                        option
                    );


                addedCategories.add(
                    normalizedName
                );

            }

        }
    );


    // ===============================
    // FIRESTORE CATEGORIES
    // ===============================

    savedTransactionCategories
        .filter(
            (category) => {

                // Normal existing types
                if (
                    category.type ===
                    selectedType
                ) {

                    return true;

                }


                // Custom transaction type
                if (
                    selectedType.startsWith(
                        "custom_"
                    )
                ) {

                    return (
                        category.type ===
                        selectedType
                    );

                }


                return false;

            }
        )
        .forEach(
            (category) => {

                const normalizedName =
                    normalizeCategoryName(
                        category.name
                    );


                if (
                    addedCategories.has(
                        normalizedName
                    )
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.name;


                option.textContent =
                    category.name;


                transactionCategorySelect
                    .appendChild(
                        option
                    );


                addedCategories.add(
                    normalizedName
                );

            }
        );

}

// ===============================
// LOAD CATEGORIES FOR ALL ROWS
// ===============================

function loadCategoriesForAllRows() {

    const rows =
        document.querySelectorAll(
            ".transaction-entry-row"
        );

    rows.forEach(
        (row) => {

            loadTransactionCategoriesForRow(
                row
            );

        }
    );


}


// ===============================
// TRANSACTION TYPE CHANGE
// ===============================

document.addEventListener(
    "change",
    (event) => {

        if (
            event.target.classList.contains(
                "transaction-type"
            )
        ) {

            const row =
                event.target.closest(
                    ".transaction-entry-row"
                );

            loadTransactionCategoriesForRow(
                row
            );

// =================================
// REFRESH ACCOUNT DROPDOWNS
// =================================

loadTransactionAccounts();

        }

    }
);

// =========================================
// OPEN FIXED DEPOSIT FORM
// WHEN CATEGORY = FIXED DEPOSIT
// =========================================

document.addEventListener(
    "change",
    (event) => {

        // सिर्फ Transaction Category को पकड़ें
        if (
            !event.target.classList.contains(
                "transaction-category"
            )
        ) {
            return;
        }


        // जिस Transaction Row में category बदली गई
        const row =
            event.target.closest(
                ".transaction-entry-row"
            );


        if (!row) {
            return;
        }


        // Type पढ़ें
        const typeSelect =
            row.querySelector(
                ".transaction-type"
            );


        // Category पढ़ें
        const categorySelect =
            row.querySelector(
                ".transaction-category"
            );


        if (
            !typeSelect ||
            !categorySelect
        ) {
            return;
        }


        const type =
            typeSelect.value;


        const category =
            categorySelect.value;


        // =================================
        // ONLY FOR FIXED DEPOSIT
        // =================================

        if (
            type === "investment" &&
            category === "Fixed Deposit"
        ) {

// =================================
// STORE TRANSACTION ROW
// FOR FD LINKING
// =================================

window.pendingModuleTransaction = {

    module:
        "fixedDeposit",

    row:
        row

};

// =================================
// AUTO-FILL FD FORM FROM TRANSACTION
// =================================

const transactionDate =
    row.querySelector(
        ".transaction-date"
    )?.value || "";


const transactionAmount =
    row.querySelector(
        ".transaction-amount"
    )?.value || "";


const fdDepositDateInput =
    document.querySelector(
        "#fdDepositDate"
    );


const fdAmountInput =
    document.querySelector(
        "#fdAmount"
    );


if (
    fdDepositDateInput &&
    transactionDate
) {

    fdDepositDateInput.value =
        transactionDate;

}


if (
    fdAmountInput &&
    transactionAmount
) {

    fdAmountInput.value =
        transactionAmount;

}


console.log(
    "FD FORM AUTO-FILL CHECK:",
    {
        transactionDate:
            transactionDate,

        transactionAmount:
            transactionAmount,

        fdDepositDate:
            fdDepositDateInput?.value,

        fdAmount:
            fdAmountInput?.value
    }
);

console.log(
    "FD TRANSACTION ROW STORED:",
    window.pendingModuleTransaction
);

            const fdFormContainer =
                document.querySelector(
                    "#fdFormContainer"
                );


            if (!fdFormContainer) {

                console.error(
                    "FD Form Container नहीं मिला।"
                );

                return;
            }


// =================================
// OPEN FD POPUP
// =================================

fdFormContainer.style.setProperty(
    "display",
    "block",
    "important"
);

console.log(
    "🎉 Fixed Deposit Popup opened from Transaction."
);

            console.log(
                "Fixed Deposit Form opened from Transaction."
            );

        }

    }
);

// =========================================
// RENTAL INCOME → OPEN RENT ENTRY FORM
// =========================================

document.addEventListener(
    "change",
    (event) => {

        // Only Transaction Category
        if (
            !event.target.classList.contains(
                "transaction-category"
            )
        ) {

            return;

        }


        const row =
            event.target.closest(
                ".transaction-entry-row"
            );


        if (!row) {

            return;

        }


        const typeSelect =
            row.querySelector(
                ".transaction-type"
            );


        const selectedType =
            typeSelect?.value || "";


        const selectedCategory =
            event.target.value || "";


        // =================================
        // CHECK RENTAL INCOME
        // =================================

        console.log(
    "RENTAL CATEGORY DEBUG:",
    {
        selectedType:
            selectedType,

        selectedCategory:
            selectedCategory,

        categoryText:
            event.target.options[
                event.target.selectedIndex
            ]?.textContent
    }
);

        if (
            selectedType === "income" &&
            selectedCategory === "Rental Income"
            ) {

                console.log(
                "RENTAL INCOME CONDITION MATCHED"
                );

                console.log(
                "ADD RENT BUTTON CHECK:",
                document.querySelector(
                "#addRentEntryButton"
            )
        );

            const addRentEntryButton =
                document.querySelector(
                    "#addRentEntryButton"
                );

                console.log(
    "ABOUT TO OPEN RENT FORM"
);

// =================================
// OPEN RENTAL MANAGEMENT VIEW
// =================================

const rentalManagementView =
    document.querySelector(
        "#rentalManagementView"
    );


if (rentalManagementView) {

    rentalManagementView.style.display =
        "block";

}

addRentEntryButton.click();

console.log(
    "RENT BUTTON CLICK SENT"
);

            if (!addRentEntryButton) {

                console.error(
                    "Add Monthly Rent Entry button not found."
                );

                return;

            }


            // =================================
            // MARK THIS ROW AS RENTAL LINKED
            // =================================

            row.dataset.rentalIncomeMode =
                "true";

// Store Transaction Row Reference
window.pendingRentalIncomeTransactionRow =
    row;

            // =================================
            // OPEN RENT ENTRY FORM
            // =================================

            addRentEntryButton.click();


            // =================================
            // SCROLL TO RENT FORM
            // =================================

            setTimeout(
                () => {

                    const rentFormContainer =
                        document.querySelector(
                            "#rentEntryFormContainer"
                        );


                    if (
                        rentFormContainer
                    ) {

                        rentFormContainer.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"
                        });

                    }

                },
                100
            );

                }

// =================================
// MUTUAL FUND / SIP → OPEN POPUP
// =================================

const mfSelectedOption =
    event.target.options[
        event.target.selectedIndex
    ];

const mfCategoryValue =
    event.target.value || "";

const mfCategoryText =
    mfSelectedOption?.textContent
        ?.trim() || "";

const isMutualFundCategory =
    mfCategoryValue === "Mutual Fund / SIP" ||
    mfCategoryValue === "sip" ||
    mfCategoryValue === "mutual_fund" ||
    mfCategoryValue === "mutualFund" ||
    mfCategoryText === "Mutual Fund / SIP";

if (
    selectedType === "investment" &&
    isMutualFundCategory
) {

    console.log(
        "✅ MUTUAL FUND / SIP DETECTED"
    );

    // ---------------------------------
    // SAVE CURRENT TRANSACTION ROW
    // ---------------------------------

    window.pendingMutualFundTransactionRow =
        row;


    // ---------------------------------
    // FUND NAME ← TRANSACTION ASSET
    // ---------------------------------

    const mfFundName =
        document.querySelector(
            "#mfFundName"
        );

    const transactionInvestment =
        row.querySelector(
            ".transaction-investment"
        );

    if (
        mfFundName &&
        transactionInvestment
    ) {
        mfFundName.value =
            transactionInvestment.value || "";
    }


    // ---------------------------------
    // AMOUNT ← TRANSACTION AMOUNT
    // ---------------------------------

    const mfAmount =
        document.querySelector(
            "#mfAmount"
        );

    const transactionAmount =
        row.querySelector(
            ".transaction-amount"
        );

    if (
        mfAmount &&
        transactionAmount
    ) {
        mfAmount.value =
            transactionAmount.value || "";
    }


    // ---------------------------------
    // DATE ← TRANSACTION DATE
    // ---------------------------------

    const mfDate =
        document.querySelector(
            "#mfInvestmentDate"
        );

    const transactionDate =
        row.querySelector(
            ".transaction-date"
        );

    if (
        mfDate &&
        transactionDate
    ) {
        mfDate.value =
            transactionDate.value || "";
    }


    // ---------------------------------
    // LINKED MODULE = SIP
    // ---------------------------------

    const linkedModule =
        row.querySelector(
            ".transaction-linked-module"
        );

    if (linkedModule) {
        linkedModule.value = "sip";
    }


    // ---------------------------------
    // OPEN POPUP
    // ---------------------------------

    const mfPopup =
        document.querySelector(
            "#mutualFundFormContainer"
        );

    if (!mfPopup) {

        console.error(
            "❌ #mutualFundFormContainer NOT FOUND"
        );

        return;
    }


    mfPopup.style.setProperty(
        "display",
        "block",
        "important"
    );

    console.log(
        "✅ MUTUAL FUND POPUP OPENED"
    );

    return;
}

    }
);

// ===============================
// CATEGORY FORM ELEMENTS
// ===============================

const addCategoryButton =
    document.querySelector(
        "#addCategoryButton"
    );

const categoryFormContainer =
    document.querySelector(
        "#categoryFormContainer"
    );

const cancelCategoryButton =
    document.querySelector(
        "#cancelCategoryButton"
    );


// ===============================
// OPEN CATEGORY FORM
// ===============================

if (addCategoryButton) {

    addCategoryButton.addEventListener(
        "click",
        () => {

            if (categoryFormContainer) {

                categoryFormContainer.style.display =
                    "block";

            }


            // =================================
            // LOAD CUSTOM TRANSACTION TYPES
            // INTO CATEGORY FORM
            // =================================

            loadCustomTypesIntoCategoryForm();

        }
    );

}

// ===============================
// CLOSE CATEGORY FORM
// ===============================

if (cancelCategoryButton) {

    cancelCategoryButton.addEventListener(
        "click",
        () => {

            if (categoryFormContainer) {

                categoryFormContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// SAVE CATEGORY
// ===============================

const saveCategoryButton =
    document.querySelector("#saveCategoryButton");

const newCategoryNameInput =
    document.querySelector("#newCategoryName");

const newCategoryTypeSelect =
    document.querySelector("#newCategoryType");


if (saveCategoryButton) {

    saveCategoryButton.addEventListener(
        "click",
        async function () {

            const categoryName =
                newCategoryNameInput.value.trim();

            const categoryType =
                newCategoryTypeSelect.value;


            // =================================
            // VALIDATE CATEGORY NAME
            // =================================

            if (!categoryName) {

                alert(
                    "कृपया Category Name डालें।"
                );

                newCategoryNameInput.focus();

                return;

            }


            // =================================
            // VALIDATE TRANSACTION TYPE
            // =================================

            if (!categoryType) {

                alert(
                    "कृपया Transaction Type चुनें।"
                );

                newCategoryTypeSelect.focus();

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

                console.log(
                    "Saving Category:",
                    {
                        name:
                            categoryName,

                        type:
                            categoryType
                    }
                );


                const categoryCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "transactionCategories"
                    );


                // =================================
                // SAVE CATEGORY TO FIRESTORE
                // =================================

                const categoryRef =
                    await addDoc(
                        categoryCollection,
                        {

                            name:
                                categoryName,

                            type:
                                categoryType,

                            createdAt:
                                serverTimestamp()

                        }
                    );


                console.log(
                    "Category saved successfully:",
                    {
                        id:
                            categoryRef.id,

                        name:
                            categoryName,

                        type:
                            categoryType
                    }
                );


                // =================================
                // ADD CATEGORY IMMEDIATELY
                // =================================

                savedTransactionCategories.push({

                    id:
                        categoryRef.id,

                    name:
                        categoryName,

                    type:
                        categoryType

                });


                // =================================
                // REFRESH ALL CATEGORY DROPDOWNS
                // =================================

                loadCategoriesForAllRows();


                // =================================
                // SUCCESS MESSAGE
                // =================================

                alert(
                    "Category successfully save हो गई।"
                );


                // =================================
                // CLEAR FORM
                // =================================

                newCategoryNameInput.value =
                    "";

                newCategoryTypeSelect.value =
                    "";


                if (categoryFormContainer) {

                    categoryFormContainer.style.display =
                        "none";

                }

            }
            catch (error) {

                console.error(
                    "Save Category Error:",
                    error
                );

                console.error(
                    "Error Code:",
                    error?.code
                );

                console.error(
                    "Error Message:",
                    error?.message
                );


                alert(
                    "Category save नहीं हो सकी। Console में error देखें।"
                );

            }

        }
    );

}

// ===============================
// LOAD SAVED CATEGORIES FROM FIRESTORE
// ===============================

async function loadSavedTransactionCategories() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Categories cannot be loaded."
        );

        return;

    }


    try {

        const categoryCollection =
            collection(
                db,
                "users",
                user.uid,
                "transactionCategories"
            );


        const snapshot =
            await getDocs(
                categoryCollection
            );


        savedTransactionCategories = [];


        snapshot.forEach(
            (categoryDoc) => {

                const data =
                    categoryDoc.data();


                savedTransactionCategories.push({

                    id:
                        categoryDoc.id,

                    name:
                        data.name,

                    type:
                        data.type

                });

            }
        );


        console.log(
            "Saved Transaction Categories:",
            savedTransactionCategories
        );


        // ===============================
        // REFRESH ALL TRANSACTION ROWS
        // ===============================

        loadCategoriesForAllRows();


    }
    catch (error) {

        console.error(
            "Load Categories Error:",
            error
        );

    }

}

// =========================================
// MULTI-ENTRY TRANSACTION ROW
// =========================================

const newTransactionEntryButton =
    document.querySelector(
        "#newTransactionEntryButton"
    );

const transactionEntryBody =
    document.querySelector(
        "#transactionEntryBody"
    );


if (
    newTransactionEntryButton &&
    transactionEntryBody
) {

    newTransactionEntryButton.addEventListener(
        "click",
        () => {

            const firstRow =
                transactionEntryBody.querySelector(
                    ".transaction-entry-row"
                );


            if (!firstRow) {
                return;
            }


            const newRow =
                firstRow.cloneNode(true);


            // Clear all values
            newRow
    .querySelectorAll(
        "input, select"
    )
    .forEach(
        (element) => {

            element.value = "";

            // Clear stored Master IDs
            delete element.dataset.partyId;
            delete element.dataset.investmentId;

        }
    );


            // Copy previous date
            const previousDate =
                firstRow.querySelector(
                    ".transaction-date"
                );

            const newDate =
                newRow.querySelector(
                    ".transaction-date"
                );


            if (
                previousDate &&
                newDate
            ) {

                newDate.value =
                    previousDate.value;

            }


           transactionEntryBody.appendChild(
    newRow
);

loadCustomTransactionTypes();

updateTransactionRowBehavior(newRow);

loadTransactionVehicleDropdowns();

        }
    );

}

// =========================================
// DELETE UNSAVED TRANSACTION ROW
// =========================================

if (transactionEntryBody) {

    transactionEntryBody.addEventListener(
        "click",
        (event) => {

            const deleteButton =
                event.target.closest(
                    ".delete-transaction-button"
                );

            if (!deleteButton) {
                return;
            }


            const row =
                deleteButton.closest(
                    ".transaction-entry-row"
                );

            if (!row) {
                return;
            }


            const rows =
                transactionEntryBody.querySelectorAll(
                    ".transaction-entry-row"
                );


            // =================================
            // IF ONLY ONE ROW EXISTS
            // KEEP ONE EMPTY STARTING ROW
            // =================================

            if (rows.length === 1) {

                row
                    .querySelectorAll(
                        "input"
                    )
                    .forEach(
                        (input) => {

                            input.value = "";

                            delete input.dataset.partyId;

                            delete input.dataset.investmentId;

                        }
                    );


                row
                    .querySelectorAll(
                        "select"
                    )
                    .forEach(
                        (select) => {

                            select.selectedIndex = 0;

                        }
                    );


                if (
                    typeof updateTransactionRowBehavior ===
                    "function"
                ) {

                    updateTransactionRowBehavior(
                        row
                    );

                }

                return;
            }


            // =================================
            // REMOVE EXTRA ROW
            // =================================

            row.remove();

        }
    );

}

// =========================================
// LOAD ACCOUNTS FOR TRANSACTION FORM
// =========================================

async function loadTransactionAccounts() {

    const user = auth.currentUser;

    if (!user) {

        console.log(
            "User not logged in. Accounts cannot be loaded."
        );

        return;

    }


    try {

        const accountsCollection =
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            );


        const snapshot =
            await getDocs(accountsCollection);


        savedTransactionAccounts = [];


        snapshot.forEach(
            (accountDoc) => {

                const account =
                    accountDoc.data();


                savedTransactionAccounts.push({

                    id: accountDoc.id,

                    name:
                        account.name ||
                        "Unnamed Account",

                    type:
                        account.type ||
                        "other",

                    balance:
                        Number(
                            account.balance || 0
                        )

                });

            }
        );


        console.log(
            "Transaction Accounts Loaded:",
            savedTransactionAccounts
        );


        loadTransactionAccountDropdowns();

    }
    catch (error) {

        console.error(
            "Load Transaction Accounts Error:",
            error
        );

    }

}

// =========================================
// LOAD ACCOUNT DROPDOWNS
// =========================================

function loadTransactionAccountDropdowns() {

    const rows =
        document.querySelectorAll(
            ".transaction-entry-row"
        );


    rows.forEach(
        (row) => {

            const fromSelect =
                row.querySelector(
                    ".transaction-from-account"
                );


            const toSelect =
                row.querySelector(
                    ".transaction-to-account"
                );


            if (
                !fromSelect ||
                !toSelect
            ) {
                return;
            }

            // Remember existing selections
const previousFromAccount =
    fromSelect.value;

const previousToAccount =
    toSelect.value;

            // ===============================
            // FROM ACCOUNT
            // ===============================

            fromSelect.innerHTML = "";

            const fromDefault =
                document.createElement("option");

            fromDefault.value = "";

            fromDefault.textContent =
                "From Account";

            fromSelect.appendChild(
                fromDefault
            );


            // ===============================
            // TO ACCOUNT
            // ===============================

            toSelect.innerHTML = "";

            const toDefault =
                document.createElement("option");

            toDefault.value = "";

            toDefault.textContent =
                "To Account";

            toSelect.appendChild(
                toDefault
            );


            // ===============================
            // ADD ACCOUNTS
            // ===============================

            savedTransactionAccounts.forEach(
                (account) => {

                    const fromOption =
                        document.createElement(
                            "option"
                        );

                    fromOption.value =
                        account.id;

                    fromOption.textContent =
                        account.name;


                    fromSelect.appendChild(
                        fromOption
                    );


                    const toOption =
                        document.createElement(
                            "option"
                        );

                    toOption.value =
                        account.id;

                    toOption.textContent =
                        account.name;


                    toSelect.appendChild(
                        toOption
                    );

                }
            );

                        // =================================
            // RESTORE EXISTING ACCOUNT SELECTIONS
            // =================================

            if (
                previousFromAccount &&
                Array.from(
                    fromSelect.options
                ).some(
                    option =>
                        option.value ===
                        previousFromAccount
                )
            ) {
                fromSelect.value =
                    previousFromAccount;
            }

            if (
                previousToAccount &&
                Array.from(
                    toSelect.options
                ).some(
                    option =>
                        option.value ===
                        previousToAccount
                )
            ) {
                toSelect.value =
                    previousToAccount;
            }
        }
    );

}

// =========================================
// PARTY FORM - OPEN / CANCEL
// =========================================

const partyFormContainer =
    document.querySelector(
        "#partyFormContainer"
    );

// =========================================
// CURRENT PARTY TARGET ROW
// =========================================

let currentPartyRow = null;

const cancelPartyButton =
    document.querySelector(
        "#cancelPartyButton"
    );


// =========================================
// OPEN PARTY FORM
// =========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.classList.contains(
                "add-party-button"
            )
        ) {
            return;
        }

        const row =
    event.target.closest(
        ".transaction-entry-row"
    );

currentPartyRow = row;

        if (partyFormContainer) {

            partyFormContainer.style.display =
                "block";

        }

    }
);


// =========================================
// CLOSE PARTY FORM
// =========================================

if (cancelPartyButton) {

    cancelPartyButton.addEventListener(
        "click",
        () => {

            if (partyFormContainer) {

                partyFormContainer.style.display =
                    "none";

            }

        }
    );

}

// =========================================
// SAVE NEW PARTY
// =========================================

const savePartyButton =
    document.querySelector(
        "#savePartyButton"
    );

const newPartyNameInput =
    document.querySelector(
        "#newPartyName"
    );

const newPartyTypeSelect =
    document.querySelector(
        "#newPartyType"
    );

const newPartyNotesInput =
    document.querySelector(
        "#newPartyNotes"
    );


if (savePartyButton) {

    savePartyButton.addEventListener(
        "click",
        async () => {

            // =================================
            // PARTY NAME
            // =================================

            const partyName =
                newPartyNameInput.value.trim();


            // =================================
            // PARTY TYPE
            // =================================

            const partyType =
                newPartyTypeSelect.value;


            // =================================
            // VALIDATION
            // =================================

            if (!partyName) {

                alert(
                    "कृपया Party / Merchant / Person Name डालें।"
                );

                newPartyNameInput.focus();

                return;

            }


            if (!partyType) {

                alert(
                    "कृपया Party Type चुनें।"
                );

                newPartyTypeSelect.focus();

                return;

            }


            // =================================
            // CURRENT ROW CHECK
            // =================================

            if (!currentPartyRow) {

                alert(
                    "कृपया पहले किसी Transaction Row से Party जोड़ें।"
                );

                return;

            }


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
            // OPTIONAL NOTES
            // =================================

            const partyNotes =
                newPartyNotesInput.value.trim();


            // =================================
            // SAVE TO FIRESTORE
            // =================================

            try {

                const partyCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "parties"
                    );


                const partyDoc =
                    await addDoc(
                        partyCollection,
                        {
                            name: partyName,
                            type: partyType,
                            notes: partyNotes,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                // =================================
                // CONSOLE
                // =================================

                console.log(
                    "Party saved successfully:",
                    {
                        id: partyDoc.id,
                        name: partyName,
                        type: partyType
                    }
                );


                // =================================
                // PUT PARTY INTO SAME ROW
                // =================================

                const partyInput =
                    currentPartyRow.querySelector(
                        ".transaction-party"
                    );


                if (partyInput) {

                    partyInput.value =
                        partyName;

                }


                // =================================
                // SUCCESS MESSAGE
                // =================================

                alert(
                    "Party successfully save हो गई।"
                );


                // =================================
                // RESET FORM
                // =================================

                newPartyNameInput.value =
                    "";

                newPartyTypeSelect.value =
                    "";

                newPartyNotesInput.value =
                    "";


                // =================================
                // CLOSE PARTY FORM
                // =================================

                partyFormContainer.style.display =
                    "none";


                // =================================
                // CLEAR TARGET ROW
                // =================================

                currentPartyRow =
                    null;

            }
            catch (error) {

                console.error(
                    "Save Party Error:",
                    error
                );

                alert(
                    "Party save नहीं हो सकी। Console में error देखें।"
                );

            }

        }
    );

}

// =========================================
// LOAD PARTIES FROM FIRESTORE
// =========================================

async function loadTransactionParties() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Parties cannot be loaded."
        );

        return;

    }


    try {

        const partyCollection =
            collection(
                db,
                "users",
                user.uid,
                "parties"
            );


        const snapshot =
            await getDocs(
                partyCollection
            );


        savedTransactionParties = [];


        snapshot.forEach(
            (partyDoc) => {

                const data =
                    partyDoc.data();


                savedTransactionParties.push({

                    id:
                        partyDoc.id,

                    name:
                        data.name || "",

                    type:
                        data.type || "other",

                    notes:
                        data.notes || ""

                });

            }
        );


        console.log(
            "Transaction Parties Loaded:",
            savedTransactionParties
        );

    }
    catch (error) {

        console.error(
            "Load Transaction Parties Error:",
            error
        );

    }

}

// =========================================
// PARTY SEARCH / SUGGESTIONS
// =========================================

document.addEventListener(
    "input",
    (event) => {

        if (
            !event.target.classList.contains(
                "transaction-party"
            )
        ) {
            return;
        }


        const partyInput =
            event.target;


        const row =
            partyInput.closest(
                ".transaction-entry-row"
            );


        if (!row) {
            return;
        }


        const suggestionBox =
            row.querySelector(
                ".party-suggestions"
            );


        if (!suggestionBox) {
            return;
        }


        const searchText =
            partyInput.value
                .trim()
                .toLowerCase();


        suggestionBox.innerHTML = "";


        if (!searchText) {

            suggestionBox.style.display =
                "none";

            return;

        }


        const matchingParties =
            savedTransactionParties.filter(
                (party) =>
                    party.name
                        .toLowerCase()
                        .includes(searchText)
            );


        if (
            matchingParties.length === 0
        ) {

            suggestionBox.style.display =
                "none";

            return;

        }


        matchingParties.forEach(
            (party) => {

                const suggestion =
                    document.createElement(
                        "button"
                    );


                suggestion.type =
                    "button";


                suggestion.className =
                    "party-suggestion-item";


                suggestion.innerHTML = `
                    <strong>
                        ${party.name}
                    </strong>
                    <small>
                        ${party.type}
                    </small>
                `;


                suggestion.addEventListener(
                    "click",
                    () => {

                        partyInput.value =
                            party.name;


                        partyInput.dataset.partyId =
                            party.id;


                        suggestionBox.innerHTML =
                            "";

                        suggestionBox.style.display =
                            "none";

                    }
                );


                suggestionBox.appendChild(
                    suggestion
                );

            }
        );


        suggestionBox.style.display =
            "block";

    }
);

// =========================================
// LOAD VEHICLES FOR TRANSACTION DROPDOWN
// =========================================

function loadTransactionVehicleDropdowns() {
console.log("🚗 VEHICLE DROPDOWN LOADER CALLED");
    const vehicles =
        JSON.parse(
            localStorage.getItem(
                "financialERP_vehicles"
            ) || "[]"
        );


    const rows =
        document.querySelectorAll(
            ".transaction-entry-row"
        );


    rows.forEach(
        (row) => {

            const vehicleSelect =
                row.querySelector(
                    ".transaction-vehicle"
                );


            if (!vehicleSelect) {
                return;
            }


            // Remember currently selected vehicle
            const previousVehicle =
                vehicleSelect.value;


            // Clear existing options
            vehicleSelect.innerHTML = "";


            // Default option
            const defaultOption =
                document.createElement(
                    "option"
                );

            defaultOption.value = "";

            defaultOption.textContent =
                "🚗 Select Vehicle";

            vehicleSelect.appendChild(
                defaultOption
            );


            // No vehicles available
            if (!vehicles.length) {

                const noVehicleOption =
                    document.createElement(
                        "option"
                    );

                noVehicleOption.value = "";

                noVehicleOption.textContent =
                    "No Vehicle Added";

                noVehicleOption.disabled = true;

                vehicleSelect.appendChild(
                    noVehicleOption
                );

                return;
            }


            // Add all vehicles
            vehicles.forEach(
                (vehicle) => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        vehicle.id;


                    const vehicleName =
                        [
                            vehicle.manufacturer,
                            vehicle.model
                        ]
                        .filter(Boolean)
                        .join(" ");


                    const registration =
                        vehicle.registrationNumber ||
                        "";


                    option.textContent =
                        vehicleName
                            ? `${vehicleName} - ${registration}`
                            : registration;


                    vehicleSelect.appendChild(
                        option
                    );

                }
            );


            // Restore previous selection
            if (
                previousVehicle &&
                Array.from(
                    vehicleSelect.options
                ).some(
                    option =>
                        option.value ===
                        previousVehicle
                )
            ) {

                vehicleSelect.value =
                    previousVehicle;

            }

        }
    );

}

// =========================================
// SMART TRANSACTION ROW BEHAVIOR
// =========================================

function updateTransactionRowBehavior(row) {

    if (!row) {
        return;
    }


    const typeSelect =
        row.querySelector(
            ".transaction-type"
        );

    const partyInput =
        row.querySelector(
            ".transaction-party"
        );

    const investmentInput =
        row.querySelector(
        ".transaction-investment"
        );

    const fromAccount =
        row.querySelector(
            ".transaction-from-account"
        );

    const toAccount =
        row.querySelector(
            ".transaction-to-account"
        );


    if (!typeSelect) {
        return;
    }


    const selectedType =
        typeSelect.value;


    // =====================================
    // FIND CELLS
    // =====================================

    const partyCell =
        partyInput
            ? partyInput.closest("td")
            : null;

    const investmentCell =
        investmentInput
            ? investmentInput.closest("td")
            : null;

    const fromAccountCell =
        fromAccount
            ? fromAccount.closest("td")
            : null;


    const toAccountCell =
        toAccount
            ? toAccount.closest("td")
            : null;


    // =====================================
    // HELPER
    // Keep TD in place.
    // Only hide its contents.
    // =====================================

    function setCellVisible(
        cell,
        visible
    ) {

        if (!cell) {
            return;
        }


        cell.style.visibility =
            visible
                ? "visible"
                : "hidden";

    }


    // =====================================
    // RESET ALL CELLS
    // =====================================

    setCellVisible(
        partyCell,
        true
    );

    setCellVisible(
        investmentCell,
        true
    );

    setCellVisible(
        fromAccountCell,
        true
    );

    setCellVisible(
        toAccountCell,
        true
    );


    // =====================================
    // RESET PARTY PLACEHOLDER
    // =====================================

    if (partyInput) {

        partyInput.placeholder =
            "Party / Merchant / Person";

    }


    // =====================================
    // INCOME
    // =====================================

    if (selectedType === "income") {

        setCellVisible(
            fromAccountCell,
            false
        );

        setCellVisible(
    investmentCell,
    false
);

        setCellVisible(
            toAccountCell,
            true
        );


        if (partyInput) {

            partyInput.placeholder =
                "Source / Employer / Person";

        }

    }


    // =====================================
    // EXPENSE
    // =====================================

    else if (
        selectedType === "expense"
    ) {

        setCellVisible(
            fromAccountCell,
            true
        );


        setCellVisible(
            toAccountCell,
            false
        );

setCellVisible(
    investmentCell,
    false
);
        if (partyInput) {

            partyInput.placeholder =
                "Party / Merchant / Person";

        }

    }

// =====================================
// VEHICLE FIELD
// =====================================

const vehicleSelect =
    row.querySelector(
        ".transaction-vehicle"
    );

if (vehicleSelect) {

    const vehicleCategories = [
        "Vehicle Fuel",
        "Vehicle Insurance",
        "Vehicle Maintenance",
        "Vehicle Challan",
        "Vehicle Other Expense"
    ];

    const selectedCategory =
        row.querySelector(
            ".transaction-category"
        )?.value || "";

    if (
        selectedType === "expense" &&
        vehicleCategories.includes(
            selectedCategory
        )
    ) {

        vehicleSelect.style.display =
            "block";

    } else {

        vehicleSelect.style.display =
            "none";

        vehicleSelect.value = "";

    }

}

// =====================================
// TRANSFER
// =====================================

else if (
    selectedType === "transfer"
) {

    // Party / Recipient remains available
    setCellVisible(
        partyCell,
        true
    );


    // Investment / Asset is NOT required
    setCellVisible(
        investmentCell,
        false
    );


    // From Account remains available
    setCellVisible(
        fromAccountCell,
        true
    );


    // To Account remains available
    setCellVisible(
        toAccountCell,
        true
    );


    if (partyInput) {

        partyInput.placeholder =
            "Party / Recipient / Person";

    }

}
    
// =====================================
// INVESTMENT
// =====================================

else if (
    selectedType === "investment"
) {

    // From Account → Investment purchase
    setCellVisible(
        fromAccountCell,
        true
    );

    // To Account → Investment return / redemption
    setCellVisible(
        toAccountCell,
        true
    );

    if (partyInput) {

        partyInput.placeholder =
            "Institution / Broker / AMC";

    }

}

    // =====================================
    // WALLET PAYMENT
    // =====================================

    else if (
        selectedType === "wallet_payment"
    ) {

        setCellVisible(
            fromAccountCell,
            true
        );


        setCellVisible(
            toAccountCell,
            false
        );


        setCellVisible(
    investmentCell,
    false
);

        if (partyInput) {

            partyInput.placeholder =
                "Merchant / Service Provider";

        }

    }


    // =====================================
    // CASHBACK
    // =====================================

    else if (
        selectedType === "cashback"
    ) {

        setCellVisible(
            fromAccountCell,
            false
        );


        setCellVisible(
    investmentCell,
    false
);

        setCellVisible(
            toAccountCell,
            true
        );


        if (partyInput) {

            partyInput.placeholder =
                "Source / Merchant";

        }

    }

    // =====================================
    // CUSTOM TRANSACTION TYPES
    // =====================================

    else if (
        selectedType.startsWith(
            "custom_"
        )
    ) {

        // Party / Person available
        setCellVisible(
            partyCell,
            true
        );


        // Investment / Asset not required
        setCellVisible(
            investmentCell,
            false
        );


        // Keep From Account available
        setCellVisible(
            fromAccountCell,
            true
        );


        // Keep To Account available
        setCellVisible(
            toAccountCell,
            true
        );


        if (partyInput) {

            partyInput.placeholder =
                "Party / Merchant / Person";

        }

    }

}

// =========================================
// TRANSACTION TYPE CHANGE
// =========================================

document.addEventListener(
    "change",
    (event) => {

        if (
            !event.target.classList.contains(
                "transaction-type"
            )
        ) {

            return;

        }


        const row =
            event.target.closest(
                ".transaction-entry-row"
            );


        // =================================
        // ADD NEW TRANSACTION TYPE
        // =================================

        if (
            event.target.value ===
            "__add_new_transaction_type__"
        ) {

            console.log(
                "ADD NEW TRANSACTION TYPE SELECTED"
            );


            // =================================
            // FIND INLINE FORM
            // =================================

            const typeForm =
                row?.querySelector(
                    ".transaction-type-inline-form"
                );


            if (typeForm) {

                typeForm.style.display =
                    "block";


                // =================================
                // CLEAR OLD INPUT
                // =================================

                const typeInput =
                    typeForm.querySelector(
                        ".new-transaction-type-name"
                    );


                if (typeInput) {

                    typeInput.value = "";

                    typeInput.focus();

                }


                console.log(
                    "ADD NEW TRANSACTION TYPE FORM OPENED"
                );

            }
            else {

                console.error(
                    "Inline Transaction Type Form not found."
                );

            }


            // =================================
            // RESET DROPDOWN
            // =================================

            event.target.value = "";


            return;

        }


        // =================================
        // EXISTING TYPE BEHAVIOR
        // =================================

        updateTransactionRowBehavior(
            row
        );

// =========================================
// REFRESH ACCOUNT DROPDOWNS
// =========================================

loadTransactionAccountDropdowns();
    }
);

// =========================================
// INITIALIZE TRANSACTION ROWS
// =========================================

function initializeTransactionRows() {

    const rows =
        document.querySelectorAll(
            ".transaction-entry-row"
        );


    rows.forEach(
        (row) => {

            updateTransactionRowBehavior(
                row
            );

        }
    );

    
    // =====================================
    // LOAD CUSTOM TRANSACTION TYPES
    // =====================================
console.log(
    "CUSTOM TYPE LOAD CALLING NOW"
);

    loadCustomTransactionTypes();

}

// =========================================
// TRANSACTION MASTER DATA INITIALIZATION
// =========================================

async function initializeTransactionMasterData() {

    await loadSavedTransactionCategories();

    await loadCustomTransactionTypes();

}

window.initializeTransactionMasterData =
    initializeTransactionMasterData;

// =========================================
// INVESTMENT SEARCH / SUGGESTIONS
// =========================================

document.addEventListener(
    "input",
    async (event) => {

        if (
            !event.target.classList.contains(
                "transaction-investment"
            )
        ) {
            return;
        }


        const investmentInput =
            event.target;


        const row =
            investmentInput.closest(
                ".transaction-entry-row"
            );


        if (!row) {
            return;
        }


        const suggestionBox =
            row.querySelector(
                ".investment-suggestions"
            );


        if (!suggestionBox) {
            return;
        }


        const searchText =
            investmentInput.value
                .trim()
                .toLowerCase();

                if (
    savedTransactionInvestments.length === 0
) {
    await loadTransactionInvestments();
}

        // =====================================
        // CLEAR OLD SUGGESTIONS
        // =====================================

        suggestionBox.innerHTML = "";


        // =====================================
        // EMPTY SEARCH
        // =====================================

        if (!searchText) {

            suggestionBox.style.display =
                "none";

            return;

        }


        // =====================================
        // FIND MATCHING INVESTMENTS
        // =====================================

        console.log(
    "Investment Search Text:",
    searchText
);

console.log(
    "Available Investments:",
    savedTransactionInvestments
);

console.log(
    "FIRST INVESTMENT OBJECT:",
    savedTransactionInvestments[0]
);

console.log(
    "FIRST INVESTMENT NAME:",
    savedTransactionInvestments[0]?.name
);

        const matchingInvestments =
            savedTransactionInvestments.filter(
                (investment) =>
                    investment.name
                        .toLowerCase()
                        .includes(searchText)
            );


console.log(
    "Investment search matches:",
    matchingInvestments
);

        // =====================================
        // NO MATCH
        // =====================================

        if (
            matchingInvestments.length === 0
        ) {

            suggestionBox.style.display =
                "none";

            return;

        }


        // =====================================
        // CREATE SUGGESTIONS
        // =====================================

        matchingInvestments.forEach(
            (investment) => {

                const suggestion =
                    document.createElement(
                        "button"
                    );


                suggestion.type =
                    "button";


                suggestion.className =
                    "investment-suggestion-item";


                suggestion.innerHTML = `
                    <strong>
                        ${investment.name}
                    </strong>

                    <small>
                        ${
                            investment.category
                        }
                        &nbsp; | &nbsp;
                        Invested: ₹${
                            investment.amount
                                .toLocaleString("en-IN")
                        }
                    </small>
                `;


                // =================================
                // SELECT INVESTMENT
                // =================================

                suggestion.addEventListener(
                    "click",
                    () => {

console.log(
    "INVESTMENT SUGGESTION CLICKED"
);

                        investmentInput.value =
                            investment.name;


                        // Store Investment ID
                        investmentInput.dataset.investmentId =
                            investment.id;

console.log(
    "Investment ID stored:",
    investmentInput.dataset.investmentId
);

                        // Hide suggestions
                        suggestionBox.innerHTML =
                            "";

                        suggestionBox.style.display =
                            "none";

                        console.log(
                            "Investment selected:",
                            {
                                id:
                                    investment.id,

                                name:
                                    investment.name,

                                category:
                                    investment.category
                            }
                        );

                    }
                );


                suggestionBox.appendChild(
                    suggestion
                );

            }
        );


        suggestionBox.style.display =
            "block";

    }
);

// ==========================================
// MIGRATE ACCOUNT OPENING BALANCES
// ONE-TIME SETUP
// ==========================================

async function migrateAccountOpeningBalances() {

    const user = auth.currentUser;

    if (!user) {

        alert(
            "कृपया पहले login करें।"
        );

        return;
    }

    try {

        const accountsRef =
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            );


        const accountsSnapshot =
            await getDocs(accountsRef);


        const openingBalances = {

            "PNB-Punjab National Bank":
                8632.62,

            "SBI-State Bank of India":
                9747.35,

            "KMB-Kotak Mahindra Bank":
                10846.87,

            "Amazon Pay Wallet":
                335.30,

            "ICICI Amazon Pay Credit Card":
                -44560.25,

            "Cred Wallet Balance":
                23,

            "Kotak Mahindra Credit Card":
                -13711,

            "Cash":
                280,

            "Navi Wallet":
                5

        };


        let updatedCount = 0;


        for (
            const accountDoc
            of accountsSnapshot.docs
        ) {

            const account =
                accountDoc.data();


            const accountName =
                account.name || "";


            if (
                Object.prototype.hasOwnProperty.call(
                    openingBalances,
                    accountName
                )
            ) {

                const openingBalance =
                    openingBalances[
                        accountName
                    ];


                await updateDoc(
                    accountDoc.ref,
                    {
                        openingBalance:
                            openingBalance,

                        updatedAt:
                            serverTimestamp()
                    }
                );


                updatedCount++;


                console.log(
                    "OPENING BALANCE UPDATED:",
                    {
                        account:
                            accountName,

                        openingBalance:
                            openingBalance
                    }
                );

            }

        }


        console.log(
            "======================================"
        );


        console.log(
            "ACCOUNT OPENING BALANCE MIGRATION DONE"
        );


        console.log(
            "Accounts updated:",
            updatedCount
        );


        console.log(
            "======================================"
        );


        alert(
            "All account opening balances updated successfully."
        );

    }
    catch (error) {

        console.error(
            "OPENING BALANCE MIGRATION ERROR:",
            error
        );


        alert(
            "Opening balances update नहीं हो सके। Console देखें।"
        );

    }
}

window.migrateAccountOpeningBalances =
    migrateAccountOpeningBalances;

// ======================================================
// SEPTEMBER 2026 BANK BALANCE REBUILD ENGINE
// ======================================================

async function rebuildSeptemberBankBalances() {

    const user = auth.currentUser;

    if (!user) {
        console.log(
            "User not logged in. Bank balances cannot be rebuilt."
        );
        return;
    }

    try {

// ==================================================
// SEPTEMBER OPENING BALANCES
// READ DIRECTLY FROM ACCOUNT MASTER
// ==================================================

const openingBalances = {};


// ==================================================
// LOAD ALL ACCOUNTS
// ==================================================

const accountsSnapshot =
    await getDocs(
        collection(
            db,
            "users",
            user.uid,
            "accounts"
        )
    );


accountsSnapshot.forEach(
    (accountDoc) => {

        const account =
            accountDoc.data();

        const accountName =
            account.name || "";


        if (
            account.openingBalance !== undefined
        ) {

            openingBalances[
                accountName
            ] =
                Number(
                    account.openingBalance || 0
                );

        }

    }
);


console.log(
    "DYNAMIC OPENING BALANCES:",
    openingBalances
);

console.log(
    "ALL ACCOUNT TYPES:",
    accountsSnapshot.docs.map(
        (accountDoc) => {

            const account =
                accountDoc.data();

            return {
                name:
                    account.name,

                type:
                    account.type,

                openingBalance:
                    account.openingBalance
            };
        }
    )
);

// ==================================================
// LOAD ACCOUNTS
// USE DYNAMIC OPENING BALANCES
// ==================================================

const bankAccounts = {};

accountsSnapshot.forEach(
    (accountDoc) => {

        const account =
            accountDoc.data();

        const accountName =
            account.name || "";


        // ==========================================
        // INCLUDE ANY BANK ACCOUNT
        // THAT HAS AN OPENING BALANCE
        // ==========================================

        if (
    (
    account.type === "bank" ||
    account.type === "cash" ||
    account.type === "cashback"
) &&
    Object.prototype.hasOwnProperty.call(
        openingBalances,
        accountName
    )
) {

            bankAccounts[
                accountDoc.id
            ] = {

                id:
                    accountDoc.id,

                name:
                    accountName,

                opening:
                    Number(
                        openingBalances[
                            accountName
                        ]
                    ),

                movement:
                    0

            };

        }

    }
);

        // ==================================================
        // LOAD ALL TRANSACTIONS
        // ==================================================

        const transactionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            );


        // ==================================================
        // PROCESS SEPTEMBER TRANSACTIONS
        // ==================================================

        transactionsSnapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();

        // ==========================================
        // IGNORE SOFT-DELETED TRANSACTIONS
        // ==========================================

        if (transaction.deleted === true) {
            return;
        }

                const date =
                    transaction.date || "";


                // ------------------------------------------
                // ONLY SEPTEMBER 2026
                // ------------------------------------------

                if (
                    date < "2026-09-01" ||
                    date > "2026-09-30"
                ) {
                    return;
                }


                const amount =
                    Number(
                        transaction.amount || 0
                    );


                if (
                    amount <= 0
                ) {
                    return;
                }


                const type =
                    transaction.type || "";


                const category =
                    transaction.category || "";


                const partyName =
                    (
                        transaction.partyName ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const fromAccountId =
                    transaction.fromAccountId ||
                    null;


                const toAccountId =
                    transaction.toAccountId ||
                    null;


                // ==================================================
                // IMPORTANT:
                // OPENING BALANCE ENTRIES ALREADY EXIST
                // IN ERP ACCOUNT OPENING BALANCES.
                // DO NOT COUNT THEM AGAIN.
                // ==================================================

                if (
                    date === "2026-09-01" &&
                    partyName.startsWith(
                        "balance with "
                    )
                ) {

                    console.log(
                        "OPENING BALANCE SKIPPED:",
                        transaction
                    );

                    return;

                }


                // ==================================================
                // INCOME
                // TO ACCOUNT = MONEY IN
                // ==================================================

                if (
                    type === "income" &&
                    toAccountId &&
                    bankAccounts[toAccountId]
                ) {

                    bankAccounts[
                        toAccountId
                    ].movement += amount;

                    return;

                }


                // ==================================================
                // EXPENSE
                // FROM ACCOUNT = MONEY OUT
                // ==================================================

                if (
                    type === "expense" &&
                    fromAccountId &&
                    bankAccounts[fromAccountId]
                ) {

                    bankAccounts[
                        fromAccountId
                    ].movement -= amount;

                    return;

                }


                // ==================================================
                // INVESTMENT
                // FROM = MONEY OUT
                // TO = MONEY IN
                // ==================================================

                if (
                    type === "investment"
                ) {

                    if (
                        fromAccountId &&
                        bankAccounts[fromAccountId]
                    ) {

                        bankAccounts[
                            fromAccountId
                        ].movement -= amount;

                    }


                    if (
                        toAccountId &&
                        bankAccounts[toAccountId]
                    ) {

                        bankAccounts[
                            toAccountId
                        ].movement += amount;

                    }

                    return;

                }


                // ==================================================
                // TRANSFER
                // FROM = MONEY OUT
                // TO = MONEY IN
                // ==================================================

                if (
                    type === "transfer"
                ) {

                    if (
                        fromAccountId &&
                        bankAccounts[fromAccountId]
                    ) {

                        bankAccounts[
                            fromAccountId
                        ].movement -= amount;

                    }


                    if (
                        toAccountId &&
                        bankAccounts[toAccountId]
                    ) {

                        bankAccounts[
                            toAccountId
                        ].movement += amount;

                    }

                    return;

                }


                // ==================================================
                // CASHBACK
                // TO ACCOUNT = MONEY IN
                // ==================================================

                if (
                    type === "cashback" &&
                    toAccountId &&
                    bankAccounts[toAccountId]
                ) {

                    bankAccounts[
                        toAccountId
                    ].movement += amount;

                    return;

                }


                // ==================================================
                // WALLET PAYMENT
                // FROM = MONEY OUT
                // TO = MONEY IN
                // ==================================================

                if (
                    type === "wallet_payment"
                ) {

                    if (
                        fromAccountId &&
                        bankAccounts[fromAccountId]
                    ) {

                        bankAccounts[
                            fromAccountId
                        ].movement -= amount;

                    }


                    if (
                        toAccountId &&
                        bankAccounts[toAccountId]
                    ) {

                        bankAccounts[
                            toAccountId
                        ].movement += amount;

                    }

                    return;

                }

            }
        );


        // ==================================================
        // WRITE FINAL BALANCES
        // ==================================================

        const result = {};


        for (
            const accountId
            of Object.keys(bankAccounts)
        ) {

            const account =
                bankAccounts[
                    accountId
                ];


            const finalBalance =
                Number(
                    (
                        account.opening +
                        account.movement
                    ).toFixed(2)
                );


            const accountRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    accountId
                );


            await updateDoc(
                accountRef,
                {

                    balance:
                        finalBalance,

                    updatedAt:
                        serverTimestamp()

                }
            );


            result[
                account.name
            ] = finalBalance;


            console.log(
                "SEPTEMBER BANK BALANCE:",
                {
                    account:
                        account.name,

                    opening:
                        account.opening,

                    movement:
                        account.movement,

                    final:
                        finalBalance

                }
            );

        }


        console.log(
            "======================================"
        );

        console.log(
            "SEPTEMBER BANK BALANCES REBUILT"
        );

        console.log(
            result
        );

        console.log(
            "======================================"
        );


    }

    catch (error) {

        console.error(
            "SEPTEMBER BANK BALANCE REBUILD ERROR:",
            error
        );

    }

}

window.rebuildSeptemberBankBalances = rebuildSeptemberBankBalances;

// ======================================================
// KOTAK SEPTEMBER BALANCE DIAGNOSTIC
// READ ONLY - DOES NOT CHANGE ANY DATA
// ======================================================

async function diagnoseSeptemberKotakBalance() {

    const user = auth.currentUser;

    if (!user) {
        console.log("User not logged in.");
        return;
    }

    try {

        // ==================================================
        // FIND KOTAK BANK ACCOUNT
        // ==================================================

        const accountsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "accounts"
                )
            );

        let kotakAccountId = null;

        accountsSnapshot.forEach((accountDoc) => {

            const account =
                accountDoc.data();

            if (
                account.name ===
                "KMB-Kotak Mahindra Bank"
            ) {

                kotakAccountId =
                    accountDoc.id;

            }

        });


        if (!kotakAccountId) {

            console.log(
                "KOTAK ACCOUNT NOT FOUND"
            );

            return;

        }


        console.log(
            "KOTAK ACCOUNT ID:",
            kotakAccountId
        );


        // ==================================================
        // LOAD TRANSACTIONS
        // ==================================================

        const transactionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            );


        const rows = [];


        transactionsSnapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();


                const date =
                    transaction.date || "";


                // September 2026 only

                if (
                    date < "2026-09-01" ||
                    date > "2026-09-30"
                ) {

                    return;

                }


                const amount =
                    Number(
                        transaction.amount || 0
                    );


                if (amount <= 0) {
                    return;
                }


                const type =
                    transaction.type || "";


                const category =
                    transaction.category || "";


                const partyName =
                    transaction.partyName || "";


                const investmentName =
                    transaction.investmentName || "";


                const fromAccountId =
                    transaction.fromAccountId ||
                    "";


                const toAccountId =
                    transaction.toAccountId ||
                    "";


                let effect = 0;


                // ==================================================
                // OPENING BALANCE - SKIP
                // ==================================================

                if (
                    date === "2026-09-01" &&
                    partyName
                        .trim()
                        .toLowerCase()
                        .startsWith(
                            "balance with "
                        )
                ) {

                    return;

                }


                // ==================================================
                // INCOME
                // ==================================================

                if (
                    type === "income" &&
                    toAccountId === kotakAccountId
                ) {

                    effect = amount;

                }


                // ==================================================
                // EXPENSE
                // ==================================================

                else if (
                    type === "expense" &&
                    fromAccountId === kotakAccountId
                ) {

                    effect = -amount;

                }


                // ==================================================
                // INVESTMENT
                // ==================================================

                else if (
                    type === "investment"
                ) {

                    if (
                        fromAccountId ===
                        kotakAccountId
                    ) {

                        effect -= amount;

                    }

                    if (
                        toAccountId ===
                        kotakAccountId
                    ) {

                        effect += amount;

                    }

                }


                // ==================================================
                // TRANSFER
                // ==================================================

                else if (
                    type === "transfer"
                ) {

                    if (
                        fromAccountId ===
                        kotakAccountId
                    ) {

                        effect -= amount;

                    }

                    if (
                        toAccountId ===
                        kotakAccountId
                    ) {

                        effect += amount;

                    }

                }


                // ==================================================
                // CASHBACK
                // ==================================================

                else if (
                    type === "cashback" &&
                    toAccountId === kotakAccountId
                ) {

                    effect = amount;

                }


                // ==================================================
                // WALLET PAYMENT
                // ==================================================

                else if (
                    type === "wallet_payment"
                ) {

                    if (
                        fromAccountId ===
                        kotakAccountId
                    ) {

                        effect -= amount;

                    }

                    if (
                        toAccountId ===
                        kotakAccountId
                    ) {

                        effect += amount;

                    }

                }


                // ==================================================
                // ONLY SHOW TRANSACTIONS
                // THAT ACTUALLY AFFECT KOTAK
                // ==================================================

                if (effect !== 0) {

                    rows.push({

                        date:
                            date,

                        type:
                            type,

                        category:
                            category,

                        party:
                            partyName,

                        investment:
                            investmentName,

                        amount:
                            amount,

                        effect:
                            effect,

                        from:
                            fromAccountId,

                        to:
                            toAccountId,

                        transactionId:
                            transactionDoc.id

                    });

                }

            }
        );


        // ==================================================
        // SORT BY DATE
        // ==================================================

        rows.sort(
            (a, b) =>
                a.date.localeCompare(b.date)
        );


        // ==================================================
        // DISPLAY
        // ==================================================

        console.log(
            "=========================================="
        );

        console.log(
            "KOTAK SEPTEMBER TRANSACTION DIAGNOSTIC"
        );

        console.log(
            "=========================================="
        );


        console.table(rows);


        const totalMovement =
            rows.reduce(
                (sum, row) =>
                    sum + row.effect,
                0
            );


        console.log(
            "KOTAK TOTAL MOVEMENT:",
            totalMovement
        );


        console.log(
            "KOTAK OPENING BALANCE:",
            10846.87
        );


        console.log(
            "KOTAK CALCULATED BALANCE:",
            Number(
                (
                    10846.87 +
                    totalMovement
                ).toFixed(2)
            )
        );


        console.log(
            "=========================================="
        );


    }

    catch (error) {

        console.error(
            "KOTAK DIAGNOSTIC ERROR:",
            error
        );

    }

}


// Make diagnostic function available in Browser Console

window.diagnoseSeptemberKotakBalance =
    diagnoseSeptemberKotakBalance;

// =========================================
// TRANSACTION SAVE PROTECTION
// =========================================

let transactionSaveInProgress = false;

// =========================================
// SAVE ALL TRANSACTIONS
// =========================================

if (transactionForm) {

    transactionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

// =========================================
// DUPLICATE SAVE PROTECTION
// =========================================

if (transactionSaveInProgress) {

    alert("Transaction save पहले से चल रहा है। कृपया थोड़ा इंतजार करें।");

    return;

}

transactionSaveInProgress = true;

            // =========================================
            // LOGIN CHECK
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
            // GET ALL TRANSACTION ROWS
            // =========================================

            const rows =
                transactionEntryBody
                    ? transactionEntryBody.querySelectorAll(
                        ".transaction-entry-row"
                    )
                    : [];


            if (!rows.length) {

                alert(
                    "कोई Transaction Row नहीं मिली।"
                );

                return;

            }


            // =========================================
            // FIRESTORE TRANSACTION COLLECTION
            // =========================================

            const transactionCollection =
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                );

                console.log(
    "💾 TRANSACTION SAVE USER UID:",
    user.uid
);

            let savedCount = 0;


            try {

                // =====================================
                // SAVE EACH ROW
                // =====================================

                for (const row of rows) {

                    const dateInput =
                        row.querySelector(
                            ".transaction-date"
                        );

                    const typeSelect =
                        row.querySelector(
                            ".transaction-type"
                        );

                    const categorySelect =
                        row.querySelector(
                            ".transaction-category"
                        );

                    const partyInput =
                        row.querySelector(
                            ".transaction-party"
                        );

                    const investmentInput =
                        row.querySelector(
                            ".transaction-investment"
                        );

                    const amountInput =
                        row.querySelector(
                            ".transaction-amount"
                        );

                    const fromAccountSelect =
                        row.querySelector(
                            ".transaction-from-account"
                        );

                    const toAccountSelect =
                        row.querySelector(
                            ".transaction-to-account"
                        );

                    const paymentMethodSelect =
                        row.querySelector(
                            ".transaction-payment-method"
                        );

                    const linkedModuleSelect =
                        row.querySelector(
                            ".transaction-linked-module"
                        );

                    const notesInput =
                        row.querySelector(
                            ".transaction-notes"
                        );


                    // =================================
                    // READ VALUES
                    // =================================

                    const date =
                        dateInput
                            ? dateInput.value
                            : "";


                    const type =
                        typeSelect
                            ? typeSelect.value
                            : "";


                    const category =
                        categorySelect
                            ? categorySelect.value
                            : "";


                    const partyName =
                        partyInput
                            ? partyInput.value.trim()
                            : "";


                    const partyId =
                        partyInput?.dataset.partyId
                            || null;


                    const investmentName =
                        investmentInput
                            ? investmentInput.value.trim()
                            : "";


                    const investmentId =
                        investmentInput?.dataset.investmentId
                            || null;


                    const amount =
                        Number(
                            amountInput?.value || 0
                        );


                    const fromAccountId =
                        fromAccountSelect?.value
                            || null;


                    const toAccountId =
                        toAccountSelect?.value
                            || null;


                    const paymentMethod =
                        paymentMethodSelect?.value
                            || "";

// =================================
// VEHICLE INFORMATION
// =================================

const vehicleSelect =
    row.querySelector(
        ".transaction-vehicle"
    );

const vehicleId =
    vehicleSelect?.value || null;

const selectedVehicle =
    vehicleId
        ? JSON.parse(
            localStorage.getItem(
                "financialERP_vehicles"
            ) || "[]"
        ).find(
            vehicle =>
                vehicle.id === vehicleId
        )
        : null;

const vehicleName =
    selectedVehicle
        ? [
            selectedVehicle.manufacturer,
            selectedVehicle.model
        ]
            .filter(Boolean)
            .join(" ")
        : "";

const vehicleRegistrationNumber =
    selectedVehicle?.registrationNumber
        || "";

                    const linkedModule =
                        linkedModuleSelect?.value
                            || "";


                    const notes =
                        notesInput
                            ? notesInput.value.trim()
                            : "";


                    // =================================
                    // SKIP COMPLETELY EMPTY ROW
                    // =================================

                    if (
                        !date &&
                        !type &&
                        !category &&
                        !partyName &&
                        !investmentName &&
                        amount === 0 &&
                        !fromAccountId &&
                        !toAccountId &&
                        !paymentMethod &&
                        !linkedModule &&
                        !notes
                    ) {

                        continue;

                    }


                    // =================================
                    // BASIC VALIDATION
                    // =================================

                    if (!date) {

                        alert(
                            "कृपया Transaction Date चुनें।"
                        );

                        return;

                    }


                    if (!type) {

                        alert(
                            "कृपया Transaction Type चुनें।"
                        );

                        return;

                    }


                    if (!category) {

                        alert(
                            "कृपया Category चुनें।"
                        );

                        return;

                    }


                    if (
                        !amount ||
                        amount <= 0
                    ) {

                        alert(
                            "कृपया सही Transaction Amount डालें।"
                        );

                        return;

                    }


// =================================
// GET TRANSACTION BEHAVIOR
// =================================

const selectedTypeOption =
    row.querySelector(
        ".transaction-type option:checked"
    );

let transactionBehavior =
    selectedTypeOption?.dataset.behavior || "";

// =================================
// CREDIT CARD BILL PAYMENT
// =================================

if (
    type === "expense" &&
    (
        category === "Credit Card Bill ICICI Amazon" ||
        category === "Credit Card Bill Kotak"
    )
) {
    transactionBehavior =
        "money_out_non_expense";
}

console.log(
    "TRANSACTION BEHAVIOR:",
    {
        type: type,
        category: category,
        behavior: transactionBehavior
    }
);
                    // =================================
                    // CREATE TRANSACTION DATA
                    // =================================

                    const transactionData = {

                        date: date,

                        type: type,

                        category: category,

                        partyId: partyId,

                        partyName: partyName,

                        investmentId:
                            type === "investment"
                                ? investmentId
                                : null,

                        investmentName:
                            type === "investment"
                                ? investmentName
                                : "",

                        amount: amount,

                        fromAccountId:
                            fromAccountId,

                        toAccountId:
                            toAccountId,

                        paymentMethod:
                            paymentMethod,

vehicleId:
    vehicleId,

vehicleName:
    vehicleName,

vehicleRegistrationNumber:
    vehicleRegistrationNumber,

                        linkedModule:
                            linkedModule,

                        notes:
                            notes,  

                            behavior: transactionBehavior,
                        createdAt:
                            serverTimestamp()

                    };


// =================================
// SAVE OR UPDATE TO FIRESTORE
// =================================

const editingTransactionId =
    row.dataset.editingTransactionId || null;

if (
    editingTransactionId &&
    !(await getDoc(
        doc(
            db,
            "users",
            user.uid,
            "transactions",
            editingTransactionId
        )
    )).exists()
) {
    row.dataset.editingTransactionId = "";
}

// =================================
// EDIT EXISTING TRANSACTION
// =================================

if (editingTransactionId) {

    const transactionRef =
        doc(
            db,
            "users",
            user.uid,
            "transactions",
            editingTransactionId
        );


// =================================
// EDIT TRANSACTION
// REVERSE OLD + APPLY NEW BALANCE
// =================================

const oldTransactionSnapshot =
    await getDoc(transactionRef);

if (oldTransactionSnapshot.exists()) {

    const oldTransaction =
        oldTransactionSnapshot.data();

    const isOldCreditCardPayment =
    oldTransaction.behavior ===
        "money_out_non_expense" &&
    oldTransaction.type === "expense" &&
    (
        oldTransaction.category ===
            "Credit Card Bill ICICI Amazon" ||
        oldTransaction.category ===
            "Credit Card Bill Kotak"
    );

    // =================================
    // 1. REVERSE OLD CREDIT CARD PAYMENT
    // =================================

    if (isOldCreditCardPayment) {

        const oldAmount =
            Number(oldTransaction.amount || 0);

        // Restore old From Account
        if (oldTransaction.fromAccountId) {

            const oldFromAccountRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    oldTransaction.fromAccountId
                );

            const oldFromSnapshot =
                await getDoc(oldFromAccountRef);

            if (oldFromSnapshot.exists()) {

                const oldBalance =
                    Number(
                        oldFromSnapshot.data()
                            .balance || 0
                    );

                await updateDoc(
                    oldFromAccountRef,
                    {
                        balance:
                            oldBalance + oldAmount,
                        updatedAt:
                            serverTimestamp()
                    }
                );
            }
        }

        // Restore old Credit Card
        const accountsCollection =
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            );

        const accountsSnapshot =
            await getDocs(
                accountsCollection
            );

        let oldCreditCardId = null;

        accountsSnapshot.forEach(
            (accountDoc) => {

                const account =
                    accountDoc.data();

                if (
                    account.type ===
                    "credit_card"
                ) {

                    if (
                        oldTransaction.category ===
                            "Credit Card Bill ICICI Amazon" &&
                        account.name
                            ?.toLowerCase()
                            .includes("icici amazon")
                    ) {
                        oldCreditCardId =
                            accountDoc.id;
                    }

                    if (
                        oldTransaction.category ===
                            "Credit Card Bill Kotak" &&
                        account.name
                            ?.toLowerCase()
                            .includes("kotak")
                    ) {
                        oldCreditCardId =
                            accountDoc.id;
                    }
                }
            }
        );

        if (oldCreditCardId) {

            const oldCardRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    oldCreditCardId
                );

            const oldCardSnapshot =
                await getDoc(oldCardRef);

            if (oldCardSnapshot.exists()) {

                const oldCardBalance =
                    Number(
                        oldCardSnapshot.data()
                            .balance || 0
                    );

                await updateDoc(
                    oldCardRef,
                    {
                        balance:
                            oldCardBalance + oldAmount,
                        updatedAt:
                            serverTimestamp()
                    }
                );
            }
        }
    }

    // =================================
    // 2. APPLY NEW CREDIT CARD PAYMENT
    // =================================

    const isNewCreditCardPayment =
        transactionBehavior ===
            "money_out_non_expense" &&
        type === "expense" &&
        (
            category ===
                "Credit Card Bill ICICI Amazon" ||
            category ===
                "Credit Card Bill Kotak"
        );

    if (isNewCreditCardPayment) {

        // ---------------------------------
        // NEW FROM ACCOUNT
        // ---------------------------------

        if (fromAccountId) {

            const newFromAccountRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    fromAccountId
                );

            const newFromSnapshot =
                await getDoc(newFromAccountRef);

            if (newFromSnapshot.exists()) {

                const newBalance =
                    Number(
                        newFromSnapshot.data()
                            .balance || 0
                    );

                await updateDoc(
                    newFromAccountRef,
                    {
                        balance:
                            newBalance - amount,
                        updatedAt:
                            serverTimestamp()
                    }
                );
            }
        }

        // ---------------------------------
        // FIND NEW CREDIT CARD
        // ---------------------------------

        const newAccountsCollection =
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            );

        const newAccountsSnapshot =
            await getDocs(
                newAccountsCollection
            );

        let newCreditCardId = null;

        newAccountsSnapshot.forEach(
            (accountDoc) => {

                const account =
                    accountDoc.data();

                if (
                    account.type ===
                    "credit_card"
                ) {

                    if (
                        category ===
                            "Credit Card Bill ICICI Amazon" &&
                        account.name
                            ?.toLowerCase()
                            .includes("icici amazon")
                    ) {
                        newCreditCardId =
                            accountDoc.id;
                    }

                    if (
                        category ===
                            "Credit Card Bill Kotak" &&
                        account.name
                            ?.toLowerCase()
                            .includes("kotak")
                    ) {
                        newCreditCardId =
                            accountDoc.id;
                    }
                }
            }
        );

        // ---------------------------------
        // APPLY NEW CREDIT CARD PAYMENT
        // ---------------------------------

        if (newCreditCardId) {

            const newCardRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    newCreditCardId
                );

            const newCardSnapshot =
                await getDoc(newCardRef);

            if (newCardSnapshot.exists()) {

                const newCardBalance =
                    Number(
                        newCardSnapshot.data()
                            .balance || 0
                    );

                await updateDoc(
                    newCardRef,
                    {
                        balance:
                            Math.max(
                                0,
                                newCardBalance - amount
                            ),
                        updatedAt:
                            serverTimestamp()
                    }
                );
            }
        }
    }
}

// =================================
// REVERSE OLD + APPLY NEW
// BANK ACCOUNT BALANCE
// =================================

if (oldTransactionSnapshot.exists()) {

    const oldTransaction =
        oldTransactionSnapshot.data();

    // Credit Card Bill Payment को यहाँ ignore करेंगे
    // क्योंकि उसका अलग balance logic है
    const isOldCreditCardBill =
        oldTransaction.category ===
            "Credit Card Bill ICICI Amazon" ||
        oldTransaction.category ===
            "Credit Card Bill Kotak";

    const isNewCreditCardBill =
        category ===
            "Credit Card Bill ICICI Amazon" ||
        category ===
            "Credit Card Bill Kotak";

    try {

        // =================================
        // COMMON BANK BALANCE FUNCTION
        // =================================

        const updateBankBalance =
            async (accountId, changeAmount) => {

                if (!accountId) return;

                const accountRef =
                    doc(
                        db,
                        "users",
                        user.uid,
                        "accounts",
                        accountId
                    );

                const accountSnapshot =
                    await getDoc(accountRef);

                if (!accountSnapshot.exists()) return;

                const account =
                    accountSnapshot.data();

                if (
    account.type !== "bank" &&
    account.type !== "cash" &&
    account.type !== "cashback"
) return;

                const currentBalance =
                    Number(account.balance || 0);

                await updateDoc(
                    accountRef,
                    {
                        balance:
                            currentBalance +
                            changeAmount,
                        updatedAt:
                            serverTimestamp()
                    }
                );
            };


        // =================================
        // 1. REVERSE OLD INCOME
        // =================================

        if (
            oldTransaction.type === "income" &&
            oldTransaction.toAccountId &&
            !isOldCreditCardBill
        ) {

            await updateBankBalance(
                oldTransaction.toAccountId,
                -Number(
                    oldTransaction.amount || 0
                )
            );
        }


        // =================================
        // 2. REVERSE OLD EXPENSE
        // =================================

        if (
            oldTransaction.type === "expense" &&
            oldTransaction.fromAccountId &&
            !isOldCreditCardBill
        ) {

            await updateBankBalance(
                oldTransaction.fromAccountId,
                Number(
                    oldTransaction.amount || 0
                )
            );
        }


        // =================================
        // 3. REVERSE OLD INVESTMENT
        // =================================

        if (
            oldTransaction.type === "investment"
        ) {

            // Old From → पैसा वापस
            if (
                oldTransaction.fromAccountId
            ) {

                await updateBankBalance(
                    oldTransaction.fromAccountId,
                    Number(
                        oldTransaction.amount || 0
                    )
                );
            }

            // Old To → पैसा वापस निकालें
            if (
                oldTransaction.toAccountId
            ) {

                await updateBankBalance(
                    oldTransaction.toAccountId,
                    -Number(
                        oldTransaction.amount || 0
                    )
                );
            }
        }

// =================================
// CASHBACK EDIT
// REVERSE OLD + APPLY NEW
// =================================

// REVERSE OLD CASHBACK
if (
    oldTransaction.type === "cashback" &&
    oldTransaction.toAccountId
) {

    await updateBankBalance(
        oldTransaction.toAccountId,
        -Number(
            oldTransaction.amount || 0
        )
    );
}


// APPLY NEW CASHBACK
if (
    type === "cashback" &&
    toAccountId
) {

    await updateBankBalance(
        toAccountId,
        amount
    );
}

// =================================
// TRANSFER EDIT
// REVERSE OLD + APPLY NEW
// =================================

// REVERSE OLD TRANSFER
if (
    oldTransaction.type === "transfer" &&
    oldTransaction.fromAccountId &&
    oldTransaction.toAccountId
) {

    const oldAmount =
        Number(
            oldTransaction.amount || 0
        );

    // Old FROM → पैसा वापस
    await updateBankBalance(
        oldTransaction.fromAccountId,
        oldAmount
    );

    // Old TO → पैसा वापस निकालें
    await updateBankBalance(
        oldTransaction.toAccountId,
        -oldAmount
    );
}


// APPLY NEW TRANSFER
if (
    type === "transfer" &&
    fromAccountId &&
    toAccountId
) {

    // New FROM → पैसा कम
    await updateBankBalance(
        fromAccountId,
        -amount
    );

    // New TO → पैसा बढ़े
    await updateBankBalance(
        toAccountId,
        amount
    );
}   

        // =================================
        // 4. APPLY NEW INCOME
        // =================================

        if (
            type === "income" &&
            toAccountId &&
            !isNewCreditCardBill
        ) {

            await updateBankBalance(
                toAccountId,
                amount
            );
        }


        // =================================
        // 5. APPLY NEW EXPENSE
        // =================================

        if (
            type === "expense" &&
            fromAccountId &&
            !isNewCreditCardBill
        ) {

            await updateBankBalance(
                fromAccountId,
                -amount
            );
        }


        // =================================
        // 6. APPLY NEW INVESTMENT
        // =================================

        if (
            type === "investment"
        ) {

            // New From → Bank से पैसा कम
            if (fromAccountId) {

                await updateBankBalance(
                    fromAccountId,
                    -amount
                );
            }

            // New To → Bank में पैसा बढ़े
            if (toAccountId) {

                await updateBankBalance(
                    toAccountId,
                    amount
                );
            }
        }


        console.log(
            "BANK BALANCE UPDATED AFTER TRANSACTION EDIT",
            {
                oldType:
                    oldTransaction.type,

                oldAmount:
                    oldTransaction.amount,

                newType:
                    type,

                newAmount:
                    amount,

                oldFromAccountId:
                    oldTransaction.fromAccountId,

                oldToAccountId:
                    oldTransaction.toAccountId,

                newFromAccountId:
                    fromAccountId,

                newToAccountId:
                    toAccountId
            }
        );

    }
    catch (bankEditError) {

        console.error(
            "BANK BALANCE EDIT ERROR:",
            bankEditError
        );

    }
}

// =================================
// NOW UPDATE TRANSACTION
// =================================

await updateDoc(
    transactionRef,
    {
        ...transactionData,
        updatedAt:
            serverTimestamp()
    }
);

    console.log(
        "Transaction updated successfully:",
        {
            id:
                editingTransactionId,

            ...transactionData
        }
    );

}


// =================================
// NEW TRANSACTION
// =================================

else {

    const transactionDoc =
        await addDoc(
            transactionCollection,
            transactionData
        );

    console.log(
        "Transaction saved successfully:",
        {
            id:
                transactionDoc.id,
            ...transactionData
            
        }
    );


// =================================
// CASHBACK → TO ACCOUNT
// FULL AMOUNT SHOULD BE ADDED
// =================================

if (
    type === "cashback" &&
    toAccountId
) {

    const cashbackAccountRef =
        doc(
            db,
            "users",
            user.uid,
            "accounts",
            toAccountId
        );

    const cashbackAccountSnapshot =
        await getDoc(cashbackAccountRef);

    if (cashbackAccountSnapshot.exists()) {

        const account =
            cashbackAccountSnapshot.data();

        if (
    account.type === "bank" ||
    account.type === "cash" ||
    account.type === "cashback"
) {
    console.log(
    "🔎 CASHBACK BALANCE DEBUG:",
    {
        accountId:
            toAccountId,
        accountName:
            account.name,
        accountType:
            account.type,
        oldBalance:
            account.balance,
        cashbackAmount:
            amount
    }
);

            const currentBalance =
                Number(account.balance || 0);

            await updateDoc(
                cashbackAccountRef,
                {
                    balance:
                        currentBalance + amount,
                    updatedAt:
                        serverTimestamp()
                }
            );

            console.log(
                "CASHBACK BANK BALANCE INCREASED:",
                {
                    account: account.name,
                    amount: amount
                }
            );
        }
    }
}

// =================================
// UPDATE BANK ACCOUNT BALANCE
// INCOME → TO ACCOUNT = ADD
// EXPENSE → FROM ACCOUNT = SUBTRACT
// =================================

try {

    // INCOME → TO ACCOUNT
    if (
        type === "income" &&
        toAccountId
    ) {

        const toAccountRef =
            doc(
                db,
                "users",
                user.uid,
                "accounts",
                toAccountId
            );

        const toAccountSnapshot =
            await getDoc(toAccountRef);

        if (toAccountSnapshot.exists()) {

            const account =
                toAccountSnapshot.data();

            if (
    account.type === "bank" ||
    account.type === "cash" ||
    account.type === "cashback"
) {
                const currentBalance =
                    Number(account.balance || 0);

                await updateDoc(
                    toAccountRef,
                    {
                        balance:
                            currentBalance + amount,
                        updatedAt:
                            serverTimestamp()
                    }
                );

                console.log(
                    "BANK BALANCE INCREASED:",
                    {
                        account:
                            account.name,
                        amount: amount
                    }
                );
            }
        }
    }

    // EXPENSE → FROM ACCOUNT
if (
    type === "expense" &&
    fromAccountId &&
    category !== "Credit Card Bill ICICI Amazon" &&
    category !== "Credit Card Bill Kotak"
) {

        const fromAccountRef =
            doc(
                db,
                "users",
                user.uid,
                "accounts",
                fromAccountId
            );

        const fromAccountSnapshot =
            await getDoc(fromAccountRef);

        if (fromAccountSnapshot.exists()) {

            const account =
                fromAccountSnapshot.data();

          if (
    account.type === "bank" ||
    account.type === "cash" ||
    account.type === "cashback"
) {

                const currentBalance =
                    Number(account.balance || 0);

                await updateDoc(
                    fromAccountRef,
                    {
                        balance:
                            currentBalance - amount,
                        updatedAt:
                            serverTimestamp()
                    }
                );

                console.log(
                    "BANK BALANCE DECREASED:",
                    {
                        account:
                            account.name,
                        amount: amount
                    }
                );
            }

// =================================
// CREDIT CARD → EXPENSE
// EXPENSE increases outstanding balance
// =================================

if (account.type === "credit_card") {

     account.type === "cashback_wallet" 
    const currentBalance =
        Number(account.balance || 0);

    await updateDoc(
        fromAccountRef,
        {
            balance:
                currentBalance + amount,
            updatedAt:
                serverTimestamp()
        }
    );

    console.log(
        "CREDIT CARD BALANCE INCREASED:",
        {
            account:
                account.name,
            amount:
                amount
        }
    );
}
        }
    }

}



catch (bankBalanceError) {

    console.error(
        "BANK BALANCE UPDATE ERROR:",
        bankBalanceError
    );

}


// =================================
// TRANSFER → COMMON ACCOUNT BALANCE
// ANY ACCOUNT → ANY ACCOUNT
// =================================

if (
    type === "transfer" &&
    fromAccountId &&
    toAccountId
) {

    try {

        // =================================
        // FROM ACCOUNT → MONEY OUT
        // =================================

        const transferFromRef =
            doc(
                db,
                "users",
                user.uid,
                "accounts",
                fromAccountId
            );

        const transferFromSnapshot =
            await getDoc(
                transferFromRef
            );

        if (
            transferFromSnapshot.exists()
        ) {

            const fromAccount =
                transferFromSnapshot.data();

const currentFromBalance =
    Number(
        fromAccount.balance || 0
    );

const newFromBalance =
    fromAccount.type === "credit_card"
        ? currentFromBalance + amount
        : currentFromBalance - amount;

await updateDoc(
    transferFromRef,
    {
        balance:
            newFromBalance,

        updatedAt:
            serverTimestamp()
    }
);
            console.log(
                "TRANSFER FROM ACCOUNT UPDATED:",
                {
                    account:
                        fromAccount.name,

                    accountType:
                        fromAccount.type,

                    oldBalance:
                        currentFromBalance,

                    amount:
                        amount,

                    newBalance:
                        currentFromBalance - amount
                }
            );

        }


        // =================================
        // TO ACCOUNT → MONEY IN
        // =================================

        const transferToRef =
            doc(
                db,
                "users",
                user.uid,
                "accounts",
                toAccountId
            );

        const transferToSnapshot =
            await getDoc(
                transferToRef
            );

        if (
            transferToSnapshot.exists()
        ) {

            const toAccount =
                transferToSnapshot.data();

            const currentToBalance =
                Number(
                    toAccount.balance || 0
                );

            await updateDoc(
                transferToRef,
                {
                    balance:
    toAccount.type === "credit_card"
        ? currentToBalance - amount
        : currentToBalance + amount,

updatedAt:
    serverTimestamp()
                }
            );

const newToBalance =
    toAccount.type === "credit_card"
        ? currentToBalance - amount
        : currentToBalance + amount;

console.log(
    "TRANSFER TO ACCOUNT UPDATED:",
    {
        account:
            toAccount.name,

        accountType:
            toAccount.type,

        oldBalance:
            currentToBalance,

        amount:
            amount,

        newBalance:
            newToBalance
    }
);
        }


        console.log(
            "✅ COMMON TRANSFER BALANCE UPDATED:",
            {
                fromAccountId:
                    fromAccountId,

                toAccountId:
                    toAccountId,

                amount:
                    amount
            }
        );

    }
    catch (transferBalanceError) {

        console.error(
            "❌ TRANSFER BALANCE UPDATE ERROR:",
            transferBalanceError
        );

    }

}

// =================================
// UPDATE ACCOUNT BALANCES
// CREDIT CARD BILL PAYMENT
// =================================

if (
    transactionBehavior === "money_out_non_expense" &&
    type === "expense" &&
    (
        category === "Credit Card Bill ICICI Amazon" ||
        category === "Credit Card Bill Kotak"
    )
) {
    try {

        const accountsCollection =
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            );

        const accountsSnapshot =
            await getDocs(
                accountsCollection
            );

        let creditCardAccountId = null;

        accountsSnapshot.forEach(
            (accountDoc) => {

                const account =
                    accountDoc.data();

                if (
                    account.type === "credit_card"
                ) {

                    if (
                        category ===
                        "Credit Card Bill ICICI Amazon" &&
                        account.name
                            ?.toLowerCase()
                            .includes("icici amazon")
                    ) {
                        creditCardAccountId =
                            accountDoc.id;
                    }

                    if (
                        category ===
                        "Credit Card Bill Kotak" &&
                        account.name
                            ?.toLowerCase()
                            .includes("kotak")
                    ) {
                        creditCardAccountId =
                            accountDoc.id;
                    }

                }

            }
        );

// ---------------------------------
// FROM ACCOUNT → MONEY OUT
// BANK / CASH / WALLET
// ---------------------------------

if (fromAccountId) {

    const fromAccountRef =
        doc(
            db,
            "users",
            user.uid,
            "accounts",
            fromAccountId
        );

    const fromAccountSnapshot =
        await getDoc(
            fromAccountRef
        );

    if (fromAccountSnapshot.exists()) {

        const fromAccount =
            fromAccountSnapshot.data();

        const currentBalance =
            Number(
                fromAccount.balance || 0
            );

        const newBalance =
            currentBalance - amount;

        await updateDoc(
            fromAccountRef,
            {
                balance:
                    newBalance,
                updatedAt:
                    serverTimestamp()
            }
        );

        console.log(
            "CREDIT CARD BILL → FROM ACCOUNT UPDATED:",
            {
                account:
                    fromAccount.name,
                accountType:
                    fromAccount.type,
                oldBalance:
                    currentBalance,
                amount:
                    amount,
                newBalance:
                    newBalance
            }
        );
    }
}
        // ---------------------------------
        // CREDIT CARD LIABILITY REDUCED
        // ---------------------------------

        if (creditCardAccountId) {

            const creditCardRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    creditCardAccountId
                );

            const creditCardSnapshot =
                await getDoc(
                    creditCardRef
                );

            if (
                creditCardSnapshot.exists()
            ) {

                const currentCardBalance =
                    Number(
                        creditCardSnapshot.data()
                            .balance || 0
                    );

                await updateDoc(
                    creditCardRef,
                    {
                        balance:
                            Math.max(
                                0,
                                currentCardBalance - amount
                            ),
                        updatedAt:
                            serverTimestamp()
                    }
                );

            }
        }

        console.log(
            "CREDIT CARD PAYMENT ACCOUNT BALANCES UPDATED",
            {
                category,
                amount,
                fromAccountId,
                creditCardAccountId
            }
        );

    }
    catch (balanceError) {

        console.error(
            "ACCOUNT BALANCE UPDATE ERROR:",
            balanceError
        );

    }
}
}

savedCount++;
                                    }


                // =================================
                // NOTHING TO SAVE
                // =================================

                if (savedCount === 0) {

                    alert(
                        "Save करने के लिए कोई Transaction नहीं है।"
                    );

                    transactionSaveInProgress = false;

                    return;

                }


                // =================================
                // SUCCESS
                // =================================

                transactionSaveInProgress = false;

                alert(
                    savedCount +
                    " Transaction successfully save हो गई।"
                );

// =========================================
// NOTIFY VEHICLE MODULE
// =========================================

window.dispatchEvent(
    new CustomEvent("vehicleTransactionUpdated")
);
                console.log(
                    "All transactions saved successfully:",
                    savedCount
                );


                // =================================
// RESET FORM
// =================================

const oldFirstRow =
    transactionEntryBody.querySelector(
        ".transaction-entry-row"
    );


// =================================
// CREATE ONE FRESH ROW
// =================================

let firstRow = null;

if (oldFirstRow) {

    firstRow =
        oldFirstRow.cloneNode(true);

    // Clear all fields
    firstRow
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(
            (element) => {

                element.value = "";

                delete element.dataset.partyId;

                delete element.dataset.investmentId;

                delete element.dataset.editingTransactionId;

            }
        );

}
else {

    console.error(
        "❌ Existing transaction row template not found."
    );

}


// =================================
// CLEAR OLD ROWS
// =================================

transactionEntryBody.innerHTML = "";


// =================================
// ADD FRESH ROW BACK
// =================================

if (firstRow) {

    transactionEntryBody.appendChild(
        firstRow
    );

}


// =================================
// RELOAD TRANSACTION DROPDOWNS
// =================================

if (firstRow) {

    updateTransactionRowBehavior(
        firstRow
    );

    loadTransactionCategoriesForRow(
        firstRow
    );

}

                // =================================
                // RELOAD PAGE / FORM
                // =================================

                await loadSavedTransactions();

            }
            catch (error) {

                console.error(
    "Save Transactions Error:",
    error?.message || error
);

alert(
    "ERROR: " +
    (error?.message || error)
);


                alert(
                    "Transaction save नहीं हो सकी। Console में error देखें।"
                );

                transactionSaveInProgress = false;
            }

        }
    );

}

// =========================================
// LOAD SAVED TRANSACTIONS
// =========================================

async function loadSavedTransactions() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Transactions cannot be loaded."
        );

        return;

    }


    const transactionHistoryBody =
        document.querySelector(
            "#transactionHistoryBody"
        );

        
// =========================================
// LOAD ACCOUNT NAMES FOR TRANSACTION HISTORY
// =========================================

const accountNameMap = new Map();

const accountsCollection =
    collection(
        db,
        "users",
        user.uid,
        "accounts"
    );

const accountsSnapshot =
    await getDocs(
        accountsCollection
    );


accountsSnapshot.forEach(
    (accountDoc) => {

        const account =
            accountDoc.data();

        accountNameMap.set(
            accountDoc.id,
            account.name ||
                "Unnamed Account"
        );

    }
);

    const transactionHistoryCount =
        document.querySelector(
            "#transactionHistoryCount"
        );

    const noTransactionHistoryMessage =
        document.querySelector(
            "#noTransactionHistoryMessage"
        );


    if (!transactionHistoryBody) {

        console.log(
            "Transaction History Body not found."
        );

        return;

    }


    try {

        // =====================================
        // FIRESTORE TRANSACTIONS COLLECTION
        // =====================================

        const transactionCollection =
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionCollection
            );


        // =====================================
        // CLEAR OLD HISTORY
        // =====================================

        transactionHistoryBody.innerHTML =
            "";


        let transactionCount =
            0;

let dashboardTransactionTotals = {};
let dashboardTransactionTotal = 0;

const currentMonth =
    new Date().toISOString().slice(0, 7);

// =====================================
// LOAD EACH TRANSACTION
// LATEST DATE FIRST
// =====================================

const sortedTransactionDocs =
    [...snapshot.docs].sort(
        (a, b) => {

            const dateA =
                a.data().date || "";

            const dateB =
                b.data().date || "";


            return dateB.localeCompare(
                dateA
            );

        }
    );


sortedTransactionDocs.forEach(
    (transactionDoc) => {

        const transaction =
            transactionDoc.data();

        // ==========================================
        // IGNORE SOFT-DELETED TRANSACTIONS
        // ==========================================

        if (transaction.deleted === true) {
            return;
        }

        transactionCount++;

if (
    transaction.date &&
    transaction.date.startsWith(currentMonth)
) {
    const transactionType =
        transaction.type || "other";

    const transactionAmount =
        Number(transaction.amount || 0);

    dashboardTransactionTotals[transactionType] =
        (dashboardTransactionTotals[transactionType] || 0) +
        transactionAmount;

    dashboardTransactionTotal +=
        transactionAmount;
}

console.log(
    "CURRENT MONTH TRANSACTION TOTALS:",
    dashboardTransactionTotals
);

        const row =
            document.createElement("tr");

// =================================
// STORE FIRESTORE TRANSACTION ID
// =================================

row.dataset.transactionId =
    transactionDoc.id;

                // =================================
                // DATE
                // =================================

                let formattedDate =
                    "-";


                if (transaction.date) {

                    const parts =
                        transaction.date.split("-");


                    if (
                        parts.length === 3
                    ) {

                        formattedDate =
                            parts[2] +
                            "-" +
                            parts[1] +
                            "-" +
                            parts[0];

                    }

                }


 // =================================
// TYPE
// =================================

let typeLabel =
    transaction.type || "-";


// =================================
// BUILT-IN TRANSACTION TYPES
// =================================

if (
    transaction.type ===
    "income"
) {

    typeLabel =
        "💵 Income";

}

else if (
    transaction.type ===
    "expense"
) {

    typeLabel =
        "🛒 Expense";

}

else if (
    transaction.type ===
    "investment"
) {

    typeLabel =
        "📈 Investment";

}

else if (
    transaction.type ===
    "transfer"
) {

    typeLabel =
        "🔄 Transfer";

}

else if (
    transaction.type ===
    "wallet_payment"
) {

    typeLabel =
        "👛 Wallet Payment";

}

else if (
    transaction.type ===
    "cashback"
) {

    typeLabel =
        "🎁 Cashback";

}


// =================================
// CUSTOM TRANSACTION TYPE
// =================================

else if (
    transaction.type &&
    transaction.type.startsWith(
        "custom_"
    )
) {

    const customTypeOption =
        document.querySelector(
            `.transaction-type option[value="${transaction.type}"]`
        );


    if (customTypeOption) {

        typeLabel =
            customTypeOption.textContent.trim();

    }
    else {

        typeLabel =
            transaction.type;

    }

}

                // =================================
                // INVESTMENT / ASSET
                // =================================

                const investmentDisplay =
                    transaction.investmentName
                        ? transaction.investmentName
                        : "-";


                // =================================
                // AMOUNT
                // =================================

                const formattedAmount =
                    Number(
                        transaction.amount || 0
                    ).toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


                // =================================
                // CREATE HISTORY ROW
                // =================================

                row.innerHTML = `

                    <td>
                        ${formattedDate}
                    </td>


                    <td>
                        ${typeLabel}
                    </td>


                    <td>
                        ${transaction.category || "-"}
                    </td>


                    <td>
                        ${transaction.partyName || "-"}
                    </td>


                    <td>
                        ${investmentDisplay}
                    </td>


                    <td>
                        ₹${formattedAmount}
                    </td>


                    <td>
    ${
        accountNameMap.get(
            transaction.fromAccountId
        ) ||
        transaction.fromAccountId ||
        "-"
    }
</td>


                    <td>
                        ${
                        accountNameMap.get(
                        transaction.toAccountId
                        ) ||
                        transaction.toAccountId ||
                        "-"
    }
                    </td>


                    <td>
                        ${transaction.paymentMethod || "-"}
                    </td>


                    <td>
    ${transaction.linkedModule || "-"}
</td>


<!-- NOTES -->

<td>
    ${transaction.notes || "-"}
</td>


<!-- ACTION -->

<td>

    <button
        type="button"
        class="edit-history-transaction-button"
        data-id="${transactionDoc.id}">

        ✏️ Edit

    </button>


    <button
        type="button"
        class="delete-history-transaction-button"
        data-id="${transactionDoc.id}">

        🗑️ Delete

    </button>

</td>

                `;


                transactionHistoryBody.appendChild(
                    row
                );

            }
        );


        // =====================================
        // UPDATE COUNT
        // =====================================

        if (transactionHistoryCount) {

            transactionHistoryCount.textContent =
                transactionCount +
                (
                    transactionCount === 1
                        ? " Transaction"
                        : " Transactions"
                );

        }


        // =====================================
        // EMPTY MESSAGE
        // =====================================

        if (noTransactionHistoryMessage) {

            noTransactionHistoryMessage.style.display =
                transactionCount === 0
                    ? "block"
                    : "none";

        }

// =====================================
// UPDATE TRANSACTIONS DASHBOARD CARD
// =====================================

const dashboardTransactionsCompact =
    document.querySelector(
        "#dashboardTransactionsCompactValue"
    );

if (dashboardTransactionsCompact) {

    // =====================================
    // LOAD CUSTOM TRANSACTION TYPE NAMES
    // =====================================

    const customTypeNameMap = {};

    try {

        const customTypeCollection =
            collection(
                db,
                "users",
                user.uid,
                "transactionTypes"
            );

        const customTypeSnapshot =
            await getDocs(
                customTypeCollection
            );

        customTypeSnapshot.forEach(
            (typeDoc) => {

                const customType =
                    typeDoc.data();

                if (
                    customType.name &&
                    customType.name.trim()
                ) {

                    customTypeNameMap[
                        "custom_" +
                        typeDoc.id
                    ] =
                        customType.name.trim();

                }

            }
        );

    }
    catch (customTypeError) {

        console.error(
            "CUSTOM TYPE NAME LOAD ERROR:",
            customTypeError
        );

    }


    const typeNames = {

        income:
            "INCOME",

        expense:
            "EXPENSE",

        transfer:
            "TRANSFER",

        investment:
            "INVESTMENT",

        wallet_payment:
            "WALLET PAYMENT",

        cashback:
            "CASHBACK"

    };


    const summaryParts =
        Object.entries(
            dashboardTransactionTotals
        ).map(
            ([type, amount]) => {

                let label =
                    typeNames[type];


                if (!label) {

                    const customOption =
                        document.querySelector(
                            `.transaction-type option[value="${type}"]`
                        );


                    label =
                        customOption
                            ? customOption.textContent.trim()
                            : customTypeNameMap[type]
                                ? customTypeNameMap[type]
                                : type.replace(
                                    "custom_",
                                    ""
                                ).toUpperCase();

                }


                return (
                    label +
                    " ₹" +
                    Number(
                        amount
                    ).toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits:
                                2,

                            maximumFractionDigits:
                                2
                        }
                    )
                );

            }
        );


    dashboardTransactionsCompact.textContent =
        summaryParts.join(" + ");

}

// =========================================
// UPDATE DASHBOARD FINANCIAL SUMMARY CARDS
// =========================================

const monthlyIncomeAmount =
    document.querySelector("#monthlyIncomeAmount");

const monthlyExpensesAmount =
    document.querySelector("#monthlyExpensesAmount");

const rentalIncomeAmount =
    document.querySelector("#rentalIncomeAmount");

const monthlyIncome =
    Number(
        dashboardTransactionTotals["income"] || 0
    );

const monthlyExpense =
    Number(
        dashboardTransactionTotals["expense"] || 0
    );

// Calculate Rental Income separately
let monthlyRentalIncome = 0;

sortedTransactionDocs.forEach(
    (transactionDoc) => {

        const transaction =
            transactionDoc.data();

        if (
            transaction.date &&
            transaction.date.startsWith(currentMonth) &&
            transaction.type === "income" &&
            transaction.category === "Rental Income"
        ) {

            monthlyRentalIncome +=
                Number(
                    transaction.amount || 0
                );

        }

    }
);

// MONTHLY INCOME
if (monthlyIncomeAmount) {

    monthlyIncomeAmount.textContent =
        "₹ " +
        monthlyIncome.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}

// MONTHLY EXPENSE
if (monthlyExpensesAmount) {

    monthlyExpensesAmount.textContent =
        "₹ " +
        monthlyExpense.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}

// RENTAL INCOME
if (rentalIncomeAmount) {

    rentalIncomeAmount.textContent =
        "₹ " +
        monthlyRentalIncome.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}

console.log(
    "DASHBOARD FINANCIAL SUMMARY:",
    {
        monthlyIncome,
        monthlyExpense,
        monthlyRentalIncome
    }
);

const dashboardTransactionsValue =
    document.querySelector(
        "#dashboardTransactionsValue"
    );

    console.log(
    "DASHBOARD TRANSACTION TOTAL:",
    dashboardTransactionTotal
);

if (dashboardTransactionsValue) {
    dashboardTransactionsValue.textContent =
        "₹" +
        dashboardTransactionTotal.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

        console.log(
            "Transactions History Loaded:",
            transactionCount
        );


    }
    catch (error) {

        console.error(
            "Load Transactions History Error:",
            error
        );

    }

}

// =========================================
// MAKE TRANSACTION LOADER AVAILABLE GLOBALLY
// =========================================

window.loadSavedTransactions = loadSavedTransactions;

// =========================================
// DELETE TRANSACTION FROM HISTORY
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "delete-history-transaction-button"
            )
        ) {
            return;
        }

        const transactionId =
            event.target.dataset.id;

        if (!transactionId) {

            console.error(
                "Transaction ID not found."
            );

            return;
        }

        const confirmDelete =
            confirm(
                "क्या आप इस Transaction को delete करना चाहते हैं?"
            );

        if (!confirmDelete) {
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

            // =================================
            // TRANSACTION DOCUMENT REFERENCE
            // =================================

            const transactionRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "transactions",
                    transactionId
                );


            // =================================
            // CHECK TRANSACTION
            // =================================

            const transactionSnapshot =
                await getDoc(transactionRef);


            if (!transactionSnapshot.exists()) {

                alert(
                    "यह Transaction नहीं मिला।"
                );

                return;
            }


            const transaction =
                transactionSnapshot.data();


            // =================================
            // PREVENT DOUBLE DELETE
            // =================================

            if (transaction.deleted === true) {

                alert(
                    "यह Transaction पहले ही delete हो चुका है।"
                );

                return;
            }


            // =================================
            // SOFT DELETE TRANSACTION
            // =================================

            await updateDoc(
                transactionRef,
                {
                    deleted: true,

                    deletedAt:
                        serverTimestamp(),

                    deletedBy:
                        user.uid,

                    updatedAt:
                        serverTimestamp()
                }
            );


            console.log(
                "TRANSACTION SOFT DELETED:",
                {
                    transactionId:
                        transactionId
                }
            );


            // =================================
            // REBUILD ALL SEPTEMBER BALANCES
            // =================================

            await rebuildSeptemberBankBalances();


            console.log(
                "BALANCES REBUILT AFTER TRANSACTION DELETE"
            );


            // =================================
            // RELOAD TRANSACTION HISTORY
            // =================================

            await loadSavedTransactions();


            alert(
                "Transaction successfully deleted."
            );

        }
        catch (error) {

            console.error(
                "DELETE TRANSACTION ERROR:",
                error
            );

            alert(
                "Transaction delete करने में समस्या हुई। कृपया Console देखें।"
            );

        }

    }
);


// =========================================
// EDIT TRANSACTION FROM HISTORY
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "edit-history-transaction-button"
            )
        ) {
            return;
        }


        const transactionId =
            event.target.dataset.id;


        if (!transactionId) {

            console.error(
                "Transaction ID not found for Edit."
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
            "Edit Transaction requested:",
            transactionId
        );


        try {

            // =================================
            // GET TRANSACTION DOCUMENT
            // =================================

            const transactionRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "transactions",
                    transactionId
                );


            const transactionSnapshot =
                await getDoc(
                    transactionRef
                );


            if (!transactionSnapshot.exists()) {

                console.error(
                    "Transaction not found:",
                    transactionId
                );

                alert(
                    "Transaction नहीं मिली।"
                );

                return;

            }


            const transaction =
                transactionSnapshot.data();


            console.log(
                "Transaction loaded for Edit:",
                {
                    id: transactionId,
                    ...transaction
                }
            );


            // =================================
            // GET EDIT ROW
            // =================================

            const editRow =
                transactionEntryBody
                    ? transactionEntryBody.querySelector(
                        ".transaction-entry-row"
                    )
                    : null;


            if (!editRow) {

                alert(
                    "Transaction Entry Row नहीं मिली।"
                );

                return;

            }


            // =================================
            // GET ROW FIELDS
            // =================================

            const dateInput =
                editRow.querySelector(
                    ".transaction-date"
                );

            const typeSelect =
                editRow.querySelector(
                    ".transaction-type"
                );

            const categorySelect =
                editRow.querySelector(
                    ".transaction-category"
                );

            const partyInput =
                editRow.querySelector(
                    ".transaction-party"
                );

            const investmentInput =
                editRow.querySelector(
                    ".transaction-investment"
                );

            const amountInput =
                editRow.querySelector(
                    ".transaction-amount"
                );

            const fromAccountSelect =
                editRow.querySelector(
                    ".transaction-from-account"
                );

            const toAccountSelect =
                editRow.querySelector(
                    ".transaction-to-account"
                );

            const paymentMethodSelect =
                editRow.querySelector(
                    ".transaction-payment-method"
                );

            const linkedModuleSelect =
                editRow.querySelector(
                    ".transaction-linked-module"
                );

            const notesInput =
                editRow.querySelector(
                    ".transaction-notes"
                );


            // =================================
            // SET BASIC VALUES
            // =================================

            if (dateInput) {

                dateInput.value =
                    transaction.date || "";

            }


            if (typeSelect) {

                typeSelect.value =
                    transaction.type || "";

            }


            // =================================
            // UPDATE ROW BEHAVIOR
            // =================================

            updateTransactionRowBehavior(
                editRow
            );


            // =================================
            // LOAD CATEGORY FOR SELECTED TYPE
            // =================================

            loadTransactionCategoriesForRow(
                editRow
            );


            // =================================
            // RESTORE CATEGORY
            // =================================

            if (categorySelect) {

                categorySelect.value =
                    transaction.category || "";

            }


            // =================================
            // RESTORE PARTY
            // =================================

            if (partyInput) {

                partyInput.value =
                    transaction.partyName || "";

                delete partyInput.dataset.partyId;


                if (transaction.partyId) {

                    partyInput.dataset.partyId =
                        transaction.partyId;

                }

            }


            // =================================
            // RESTORE INVESTMENT
            // =================================

            if (investmentInput) {

                investmentInput.value =
                    transaction.investmentName || "";

                delete investmentInput.dataset.investmentId;


                if (transaction.investmentId) {

                    investmentInput.dataset.investmentId =
                        transaction.investmentId;

                }

            }


            // =================================
            // RESTORE AMOUNT
            // =================================

            if (amountInput) {

                amountInput.value =
                    transaction.amount ?? "";

            }


            // =================================
            // RESTORE FROM ACCOUNT
            // =================================

            if (fromAccountSelect) {

                fromAccountSelect.value =
                    transaction.fromAccountId || "";

            }


            // =================================
            // RESTORE TO ACCOUNT
            // =================================

            if (toAccountSelect) {

                toAccountSelect.value =
                    transaction.toAccountId || "";

            }


            // =================================
            // RESTORE PAYMENT METHOD
            // =================================

            if (paymentMethodSelect) {

                paymentMethodSelect.value =
                    transaction.paymentMethod || "";

            }


            // =================================
            // RESTORE LINKED MODULE
            // =================================

            if (linkedModuleSelect) {

                linkedModuleSelect.value =
                    transaction.linkedModule || "";

            }


            // =================================
            // RESTORE NOTES
            // =================================

            if (notesInput) {

                notesInput.value =
                    transaction.notes || "";

            }


            // =================================
            // STORE EDITING TRANSACTION ID
            // =================================

            editRow.dataset.editingTransactionId =
                transactionId;


            console.log(
                "Transaction loaded into edit row:",
                {
                    transactionId:
                        transactionId,

                    category:
                        transaction.category,

                    partyId:
                        transaction.partyId,

                    investmentId:
                        transaction.investmentId,

                    amount:
                        transaction.amount,

                    fromAccountId:
                        transaction.fromAccountId,

                    toAccountId:
                        transaction.toAccountId
                }
            );

        }
        catch (error) {

            console.error(
                "Load Transaction For Edit Error:",
                error
            );

            alert(
                "Transaction load नहीं हो सकी। Console में error देखें।"
            );

        }

    }
);

// =========================================
// SAVE NEW TRANSACTION TYPE
// =========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "save-inline-transaction-type"
            )
        ) {

            return;

        }


        const form =
            event.target.closest(
                ".transaction-type-inline-form"
            );


        if (!form) {

            console.error(
                "Transaction Type form not found."
            );

            return;

        }


        const input =
            form.querySelector(
                ".new-transaction-type-name"
            );


            const behaviorSelect =
    form.querySelector(
        ".new-transaction-type-behavior"
    );

        if (!input) {

            console.error(
                "New Transaction Type input not found."
            );

            return;

        }


        const typeName =
            input.value.trim();

const behavior =
    behaviorSelect
        ? behaviorSelect.value
        : "";
  
// =================================
// VALIDATE BEHAVIOR
// =================================

if (!behavior) {

    alert(
        "कृपया Transaction Type का Behavior चुनें।"
    );

    if (behaviorSelect) {

        behaviorSelect.focus();

    }

    return;

}

        // =================================
        // VALIDATION
        // =================================

        if (!typeName) {

            alert(
                "कृपया Transaction Type का नाम लिखें।"
            );

            input.focus();

            return;

        }


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले Login करें।"
            );

            return;

        }


        try {

            console.log(
                "Saving New Transaction Type:",
                typeName
            );


            // =================================
            // SAVE TO FIRESTORE
            // =================================

            const typeRef =
                await addDoc(

                    collection(
                        db,
                        "users",
                        user.uid,
                        "transactionTypes"
                    ),

                    {

                        name:
                            typeName,

                        behavior: 
                            behavior,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


            console.log(
                "New Transaction Type saved:",
                typeRef.id
            );

// =================================
// ADD NEW TYPE IMMEDIATELY
// =================================

const newCustomType = {

    id:
        typeRef.id,

    name:
        typeName,

    behavior:
        behavior

};


console.log(
    "Adding New Transaction Type Immediately:",
    newCustomType
);


// =================================
// UPDATE ALL TRANSACTION TYPE DROPDOWNS
// =================================

const typeSelects =
    document.querySelectorAll(
        ".transaction-type"
    );


typeSelects.forEach(
    (typeSelect) => {

        // -----------------------------
        // FIND ADD NEW TYPE OPTION
        // -----------------------------

        const addNewOption =
            typeSelect.querySelector(
                "option[value='__add_new_transaction_type__']"
            );


        // -----------------------------
        // CHECK DUPLICATE
        // -----------------------------

        const existingOption =
            typeSelect.querySelector(
                `option[value="custom_${typeRef.id}"]`
            );


        if (existingOption) {

            return;

        }


        // -----------------------------
        // CREATE NEW OPTION
        // -----------------------------

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "custom_" +
            typeRef.id;


        option.textContent =
            typeName;


        option.dataset.customTransactionType =
            "true";


        option.dataset.behavior =
            behavior;


        // -----------------------------
        // INSERT BEFORE ADD NEW TYPE
        // -----------------------------

        if (addNewOption) {

            typeSelect.insertBefore(
                option,
                addNewOption
            );

        }
        else {

            typeSelect.appendChild(
                option
            );

        }

    }
);

            alert(
                "New Transaction Type successfully saved."
            );

            // =================================
            // CLEAR INPUT
            // =================================

            input.value = "";


            // =================================
            // CLOSE FORM
            // =================================

            form.style.display =
                "none";


        }
        catch (error) {

            console.error(
                "Save Transaction Type Error:",
                error
            );

            console.error(
                "Error Code:",
                error?.code
            );

            console.error(
                "Error Message:",
                error?.message
            );


            alert(
                "Transaction Type save नहीं हो पाया।"
            );

        }

    }
);


// =========================================
// CANCEL NEW TRANSACTION TYPE
// =========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.classList.contains(
                "cancel-inline-transaction-type"
            )
        ) {

            return;

        }


        const form =
            event.target.closest(
                ".transaction-type-inline-form"
            );


        if (!form) {

            console.error(
                "Transaction Type inline form not found."
            );

            return;

        }


        // =================================
        // CLEAR INPUT
        // =================================

        const input =
            form.querySelector(
                ".new-transaction-type-name"
            );


        if (input) {

            input.value = "";

        }


        // =================================
        // CLOSE FORM
        // =================================

        form.style.display =
            "none";


        // =================================
        // RESET TRANSACTION TYPE
        // =================================

        const row =
            form.closest(
                ".transaction-entry-row"
            );


        const typeSelect =
            row?.querySelector(
                ".transaction-type"
            );


        if (typeSelect) {

            typeSelect.value = "";

            updateTransactionRowBehavior(
                row
            );

        }


        console.log(
            "NEW TRANSACTION TYPE FORM CANCELLED"
        );

    }
);


// =========================================
// LOAD CUSTOM TRANSACTION TYPES
// =========================================

async function loadCustomTransactionTypes() {

    const user =
        auth.currentUser;


    if (!user) {

        console.log(
            "User not logged in. Custom Transaction Types cannot be loaded."
        );

        return;

    }


    try {

        console.log(
            "Loading Custom Transaction Types..."
        );


        const typeCollection =
            collection(
                db,
                "users",
                user.uid,
                "transactionTypes"
            );


        const snapshot =
            await getDocs(
                typeCollection
            );


        const customTypes = [];


        snapshot.forEach(
            (typeDoc) => {

                const type =
                    typeDoc.data();


                if (
                    type.name &&
                    type.name.trim()
                ) {

                    customTypes.push({

    id:
        typeDoc.id,

    name:
        type.name.trim(),

    behavior:
        type.behavior || ""

});

                }

            }
        );


        console.log(
            "Custom Transaction Types Loaded:",
            customTypes
        );


        // =====================================
        // ADD CUSTOM TYPES TO ALL DROPDOWNS
        // =====================================

        const typeSelects =
            document.querySelectorAll(
                ".transaction-type"
            );


        typeSelects.forEach(
            (typeSelect) => {

                // -----------------------------
                // Remove old custom types
                // -----------------------------

                typeSelect
                    .querySelectorAll(
                        "option[data-custom-transaction-type='true']"
                    )
                    .forEach(
                        (option) => {

                            option.remove();

                        }
                    );


                // -----------------------------
                // Find Add New Type option
                // -----------------------------

                const addNewOption =
                    typeSelect.querySelector(
                        "option[value='__add_new_transaction_type__']"
                    );


                // -----------------------------
                // Add custom types
                // -----------------------------

                customTypes.forEach(
                    (customType) => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            "custom_" +
                            customType.id;


                        option.textContent =
                            customType.name;


                        option.dataset.customTransactionType =
                            "true";

                        option.dataset.behavior =
                            customType.behavior || "";

                        if (addNewOption) {

                            typeSelect.insertBefore(
                                option,
                                addNewOption
                            );

                        }
                        else {

                            typeSelect.appendChild(
                                option
                            );

                        }

                    }
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Load Custom Transaction Types Error:",
            error
        );

    }

}

// =========================================
// LOAD CUSTOM TYPES INTO CATEGORY FORM
// =========================================

function loadCustomTypesIntoCategoryForm() {

    const categoryTypeSelect =
        document.querySelector(
            "#newCategoryType"
        );


    if (!categoryTypeSelect) {

        console.log(
            "Category Transaction Type dropdown not found."
        );

        return;

    }


    // =====================================
    // REMOVE OLD CUSTOM TYPES
    // =====================================

    categoryTypeSelect
        .querySelectorAll(
            "option[data-custom-category-type='true']"
        )
        .forEach(
            (option) => {

                option.remove();

            }
        );


    // =====================================
    // FIND CUSTOM TYPES
    // =====================================

    const customTypeOptions =
        document.querySelectorAll(
            ".transaction-type option[data-custom-transaction-type='true']"
        );


    customTypeOptions.forEach(
        (sourceOption) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                sourceOption.value;


            option.textContent =
                sourceOption.textContent;


            option.dataset.customCategoryType =
                "true";


            categoryTypeSelect.appendChild(
                option
            );

        }
    );


    console.log(
        "Custom Types added to Category Form:",
        customTypeOptions.length
    );

}

// ======================================================
// SHARE / STOCK INVESTMENT FORM - STEP 1
// सिर्फ FORM OPEN करने के लिए
// ======================================================

(function () {

    // --------------------------------------------------
    // 1. Share Form बनाना
    // --------------------------------------------------

    function createShareForm() {

        // अगर form पहले से बना हुआ है तो दोबारा मत बनाओ
        if (document.getElementById("shareFormContainer")) {
            return;
        }

        const container = document.createElement("div");

        container.id = "shareFormContainer";

        container.style.cssText = `
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 99999;
            overflow-y: auto;
            padding: 30px 15px;
        `;

        container.innerHTML = `
            <div style="
                max-width: 700px;
                margin: 20px auto;
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:20px;
                ">

                    <h2 style="margin:0;">
                        📈 Stock / Shares Investment
                    </h2>

                    <button
                        type="button"
                        id="closeShareFormButton"
                        style="
                            border:none;
                            background:#eee;
                            width:35px;
                            height:35px;
                            border-radius:50%;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>


                <div style="display:grid; gap:15px;">

                    <div>
                        <label>Transaction</label>

                        <select
                            id="shareTransactionType"
                            style="width:100%; padding:10px;"
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                            <option value="dividend">Dividend</option>
                        </select>
                    </div>


                    <div>
                        <label>Date</label>

                        <input
                            type="date"
                            id="shareDate"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                  <div style="position:relative;">
    <label>🔎 Search Stock</label>

    <input
        type="text"
        id="shareStockSearch"
        placeholder="Search company or stock symbol..."
        autocomplete="off"
        style="width:100%; padding:10px;"
    >

    <div
        id="shareStockSearchResults"
        style="
            display:none;
            position:absolute;
            left:0;
            right:0;
            top:100%;
            background:white;
            border:1px solid #ccc;
            border-radius:6px;
            max-height:220px;
            overflow-y:auto;
            z-index:100000;
        "
    ></div>

    <!-- Selected stock का actual name यहाँ रहेगा -->
    <input
        type="hidden"
        id="shareStockName"
    >

    <!-- आगे CMP/API के लिए काम आएगा -->
    <input
        type="hidden"
        id="shareStockSymbol"
    >

    <input
        type="hidden"
        id="shareStockExchange"
    >
</div>


                    <div>
                        <label>Exchange</label>

                        <select
                            id="shareExchange"
                            style="width:100%; padding:10px;"
                        >
                            <option value="">Select Exchange</option>
                            <option value="NSE">NSE</option>
                            <option value="BSE">BSE</option>
                        </select>
                    </div>


                    <div>
                        <label>Broker</label>

                        <input
                            type="text"
                            id="shareBroker"
                            placeholder="e.g. Zerodha"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                    <div>
                        <label>Quantity</label>

                        <input
                            type="number"
                            id="shareQuantity"
                            min="0"
                            step="any"
                            placeholder="0"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                    <div>
                        <label>Price per Share</label>

                        <input
                            type="number"
                            id="sharePrice"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                    <div>
                        <label>Charges</label>

                        <input
                            type="number"
                            id="shareCharges"
                            min="0"
                            step="any"
                            value="0"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                    <div>
                        <label>Total Investment Amount</label>

                        <input
                            type="number"
                            id="shareTotalAmount"
                            readonly
                            style="
                                width:100%;
                                padding:10px;
                                background:#f3f3f3;
                            "
                        >
                    </div>


                    <div>
                        <label>Current Market Price</label>

                        <input
                            type="number"
                            id="shareCurrentPrice"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            style="width:100%; padding:10px;"
                        >
                    </div>


                    <div>
                        <label>Remarks</label>

                        <textarea
                            id="shareRemarks"
                            rows="3"
                            placeholder="Optional"
                            style="width:100%; padding:10px;"
                        ></textarea>
                    </div>

                </div>


                <div style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    margin-top:25px;
                ">

                    <button
                        type="button"
                        id="cancelShareFormButton"
                        style="
                            padding:10px 18px;
                            border:1px solid #ccc;
                            background:white;
                            border-radius:6px;
                            cursor:pointer;
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveShareFormButton"
                        style="
                            padding:10px 18px;
                            border:none;
                            background:#2563eb;
                            color:white;
                            border-radius:6px;
                            cursor:pointer;
                        "
                    >
                        Save
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(container);

// --------------------------------------------------
// STEP 3 — Stock Search Dropdown
// --------------------------------------------------

const stockSearchInput =
    document.getElementById("shareStockSearch");

const stockSearchResults =
    document.getElementById("shareStockSearchResults");


stockSearchInput?.addEventListener(
    "input",
    function () {

        const search =
            this.value.trim().toLowerCase();

        stockSearchResults.innerHTML = "";

        if (!search) {
            stockSearchResults.style.display = "none";
            return;
        }

console.log("STOCK MASTER:", window.stockMaster);

        const matches =
    (window.stockMaster || []).filter(stock =>
        (stock.name || "").toLowerCase().includes(search) ||
        (stock.symbol || "").toLowerCase().includes(search) ||
        (stock.isin || "").toLowerCase().includes(search)
    );

console.log("STOCK SEARCH MATCHES:", matches);

        if (matches.length === 0) {

            stockSearchResults.innerHTML =
                `<div style="padding:10px;">
                    No matching stock found
                </div>`;

            stockSearchResults.style.display = "block";
            return;
        }


        matches.forEach(stock => {

            const item =
                document.createElement("div");

            item.textContent =
                `${stock.symbol} — ${stock.name} — ${stock.exchange}`;

            item.style.cssText = `
                padding:10px;
                cursor:pointer;
                border-bottom:1px solid #eee;
            `;


            item.addEventListener(
                "click",
                async function () {

                    stockSearchInput.value =
                        `${stock.symbol} — ${stock.name}`;

                    document.getElementById(
                        "shareStockName"
                    ).value = stock.name;

                    document.getElementById(
                        "shareStockSymbol"
                    ).value = stock.symbol;

                   document.getElementById(
    "shareStockExchange"
).value = stock.exchange;

document.getElementById(
    "shareExchange"
).value = stock.exchange;

let isinInput = document.getElementById("shareStockISIN");

if (!isinInput) {
    isinInput = document.createElement("input");
    isinInput.type = "hidden";
    isinInput.id = "shareStockISIN";
    document.getElementById("shareFormContainer").appendChild(isinInput);
}

isinInput.value = stock.isin || "";

const cmp = await window.fetchShareCMP(
    stock.symbol
);

if (cmp !== null) {

    const currentPriceInput =
        document.getElementById("shareCurrentPrice");

    if (currentPriceInput) {

        currentPriceInput.value =
            cmp.toFixed(2);

        console.log(
            "CURRENT PRICE AUTO-FILLED:",
            stock.symbol,
            cmp
        );
    }
}

stockSearchResults.style.display =
    "none";

                    console.log(
                        "SELECTED STOCK:",
                        stock
                    );
                }
            );


            stockSearchResults.appendChild(item);
        });


        stockSearchResults.style.display =
            "block";
    }
);
        // --------------------------------------------------
        // Default Date = Today
        // --------------------------------------------------

        const dateInput =
            document.getElementById("shareDate");

        if (dateInput) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            dateInput.value = today;
        }


        // --------------------------------------------------
        // Close buttons
        // --------------------------------------------------

        document
            .getElementById("closeShareFormButton")
            ?.addEventListener("click", closeShareForm);

        document
            .getElementById("cancelShareFormButton")
            ?.addEventListener("click", closeShareForm);


        // --------------------------------------------------
        // Quantity × Price + Charges
        // --------------------------------------------------

        const quantityInput =
            document.getElementById("shareQuantity");

        const priceInput =
            document.getElementById("sharePrice");

        const chargesInput =
            document.getElementById("shareCharges");

        function calculateShareTotal() {

            const quantity =
                Number(quantityInput?.value || 0);

            const price =
                Number(priceInput?.value || 0);

            const charges =
                Number(chargesInput?.value || 0);

            const total =
                (quantity * price) + charges;

            const totalInput =
                document.getElementById(
                    "shareTotalAmount"
                );

            if (totalInput) {
                totalInput.value =
                    total.toFixed(2);
            }
        }


        quantityInput?.addEventListener(
            "input",
            calculateShareTotal
        );

        priceInput?.addEventListener(
            "input",
            calculateShareTotal
        );

        chargesInput?.addEventListener(
            "input",
            calculateShareTotal
        );


        // --------------------------------------------------
        // STEP 1 में Save सिर्फ test करेगा
        // Firebase में अभी कुछ save नहीं होगा
        // --------------------------------------------------

        document
    .getElementById("saveShareFormButton")
    ?.addEventListener("click", async function () {

        const shareData = {
            transactionType: document.getElementById("shareTransactionType")?.value || "",
            date: document.getElementById("shareDate")?.value || "",
            companyName: document.getElementById("shareStockName")?.value || "",
            symbol: document.getElementById("shareStockSymbol")?.value || "",
            exchange: document.getElementById("shareStockExchange")?.value || "",
            isin: document.getElementById("shareStockISIN")?.value || "",
            quantity: Number(document.getElementById("shareQuantity")?.value || 0),
            buyPrice: Number(document.getElementById("sharePrice")?.value || 0),
            charges: Number(document.getElementById("shareCharges")?.value || 0),
            totalAmount: Number(document.getElementById("shareTotalAmount")?.value || 0),
            currentPrice: Number(document.getElementById("shareCurrentPrice")?.value || 0),
            broker: document.getElementById("shareBroker")?.value || "",
            remarks: document.getElementById("shareRemarks")?.value || ""
        };

        console.log("SAVE BUTTON CLICKED:", shareData);

        const user = auth.currentUser;

if (!user) {
    alert("कृपया पहले login करें।");
    return;
}

try {

    const sharesCollection = collection(
        db,
        "users",
        user.uid,
        "shares"
    );

let shareDoc;

if (window.editingShareId) {

    const shareDocRef = doc(
        db,
        "users",
        user.uid,
        "shares",
        window.editingShareId
    );

    await updateDoc(
        shareDocRef,
        {
            ...shareData,
            updatedAt: serverTimestamp()
        }
    );

    shareDoc = {
        id: window.editingShareId
    };

    console.log(
        "SHARE UPDATED SUCCESSFULLY:",
        {
            id: shareDoc.id,
            ...shareData
        }
    );

    window.editingShareId = null;

    alert("Share successfully update हो गया।");

} else {

    shareDoc = await addDoc(
        sharesCollection,
        {
            ...shareData,
            createdAt: serverTimestamp()
        }
    );

    console.log(
        "SHARE SAVED SUCCESSFULLY:",
        {
            id: shareDoc.id,
            ...shareData
        }
    );

    alert("Share successfully save हो गया।");
}

} catch (error) {

console.error("SAVE SHARE ERROR OBJECT:", error);
console.error("SAVE SHARE ERROR CODE:", error?.code);
console.error("SAVE SHARE ERROR MESSAGE:", error?.message);

    alert(
        "Share save नहीं हो सका। Console में error देखें।"
    );

}

    });
    }


    // --------------------------------------------------
    // 2. Form Open
    // --------------------------------------------------

    function openShareForm(row) {

        createShareForm();

        const container =
            document.getElementById(
                "shareFormContainer"
            );

        if (!container) {
            return;
        }


        // Transaction row को याद रखेंगे
        window.pendingShareTransaction = {
            row: row
        };


        // Transaction Date → Share Date
        const transactionDate =
            row?.querySelector(
                ".transaction-date"
            )?.value || "";


        const shareDate =
            document.getElementById(
                "shareDate"
            );

        if (
            shareDate &&
            transactionDate
        ) {
            shareDate.value =
                transactionDate;
        }


        // Transaction Amount → Quantity/Price
        // अभी सिर्फ console में check करेंगे
        const transactionAmount =
            row?.querySelector(
                ".transaction-amount"
            )?.value || "";


        console.log(
            "SHARE FORM OPENED",
            {
                transactionDate:
                    transactionDate,

                transactionAmount:
                    transactionAmount,

                row:
                    row
            }
        );


        container.style.display =
            "block";
    }


    // --------------------------------------------------
    // 3. Form Close
    // --------------------------------------------------

    function closeShareForm() {

        const container =
            document.getElementById(
                "shareFormContainer"
            );

        if (container) {

            container.style.display =
                "none";
        }

        window.pendingShareTransaction =
            null;
    }


    // --------------------------------------------------
    // 4. Transaction Category Change
    // --------------------------------------------------

    document.addEventListener(
        "change",
        function (event) {

            // केवल Transaction Category
            if (
                !event.target.classList.contains(
                    "transaction-category"
                )
            ) {
                return;
            }


            const row =
                event.target.closest(
                    ".transaction-entry-row"
                );

            if (!row) {
                return;
            }


            const typeSelect =
                row.querySelector(
                    ".transaction-type"
                );

            const categorySelect =
                row.querySelector(
                    ".transaction-category"
                );

            if (
                !typeSelect ||
                !categorySelect
            ) {
                return;
            }


            const type =
                typeSelect.value;


            const categoryValue =
                categorySelect.value;


            const selectedOption =
                categorySelect.options[
                    categorySelect.selectedIndex
                ];


            const categoryText =
                selectedOption
                    ?.textContent
                    ?.trim() || "";


            console.log(
                "TRANSACTION CATEGORY CHANGED:",
                {
                    type: type,
                    categoryValue:
                        categoryValue,
                    categoryText:
                        categoryText
                }
            );

// =================================
// MUTUAL FUND / SIP
// SAME LISTENER AS SHARES
// =================================

const isMutualFundCategory =
    categoryValue === "Mutual Fund / SIP"
    ||
    categoryValue === "sip"
    ||
    categoryText === "Mutual Fund / SIP";


if (
    type === "investment" &&
    isMutualFundCategory
) {

    console.log(
        "✅ MUTUAL FUND / SIP SELECTED FROM TRANSACTION"
    );


    // Save current transaction row
    window.pendingMutualFundTransactionRow =
        row;


    // ---------------------------------
    // Fund Name ← Investment / Asset
    // ---------------------------------

    const mfFundName =
        document.getElementById(
            "mfFundName"
        );

    const transactionInvestment =
        row.querySelector(
            ".transaction-investment"
        );

    if (
        mfFundName &&
        transactionInvestment
    ) {

        mfFundName.value =
            transactionInvestment.value || "";

    }


    // ---------------------------------
    // Amount ← Transaction Amount
    // ---------------------------------

    const mfAmount =
        document.getElementById(
            "mfAmount"
        );

    const transactionAmount =
        row.querySelector(
            ".transaction-amount"
        );

    if (
        mfAmount &&
        transactionAmount
    ) {

        mfAmount.value =
            transactionAmount.value || "";

    }


    // ---------------------------------
    // Date ← Transaction Date
    // ---------------------------------

    const mfInvestmentDate =
        document.getElementById(
            "mfInvestmentDate"
        );

    const transactionDate =
        row.querySelector(
            ".transaction-date"
        );

    if (
        mfInvestmentDate &&
        transactionDate
    ) {

        mfInvestmentDate.value =
            transactionDate.value || "";

    }


    // ---------------------------------
    // Linked Module = SIP
    // ---------------------------------

    const linkedModule =
        row.querySelector(
            ".transaction-linked-module"
        );

    if (linkedModule) {

        linkedModule.value = "sip";

    }


    // ---------------------------------
    // OPEN SAME MF POPUP
    // ---------------------------------

    const mfPopup =
        document.getElementById(
            "mutualFundFormContainer"
        );

    if (!mfPopup) {

        console.error(
            "❌ mutualFundFormContainer NOT FOUND"
        );

        return;

    }


    mfPopup.style.setProperty(
        "display",
        "block",
        "important"
    );


    console.log(
        "✅ MUTUAL FUND POPUP OPENED"
    );

    return;
}

// --------------------------------------------------
// Stock / Shares detect
// Value OR visible text दोनों check करेंगे
// --------------------------------------------------

const isShareCategory =
    categoryValue === "Stock / Shares"
    ||
    categoryText === "Stock / Shares";


if (
    type === "investment" &&
    isShareCategory
) {

    openShareForm(row);

}

    }
);

    // --------------------------------------------------
    // Shares Holdings → Add New Share
    // Same Share Form open होगा
    // --------------------------------------------------

    document
        .getElementById("addNewShareFromAllSharesButton")
        ?.addEventListener("click", function () {

            openShareForm(null);

        });

       window.openShareForm = openShareForm;
})();

// --------------------------------------------------
// Share CMP / LTP Fetch
// --------------------------------------------------

window.fetchShareCMP = async function (nseSymbol) {

    if (!nseSymbol) {
        console.log("CMP: No NSE symbol");
        return null;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/cmp?symbol=${encodeURIComponent(nseSymbol)}`
        );

        if (!response.ok) {
            throw new Error(`CMP server HTTP ${response.status}`);
        }

        const data = await response.json();

        if (typeof data.cmp !== "number") {
            throw new Error("CMP not available");
        }

        console.log(
            "CMP FROM LOCAL SERVER:",
            nseSymbol,
            data.cmp
        );

        return data.cmp;

    } catch (error) {

        console.error(
            "CMP SERVER ERROR:",
            nseSymbol,
            error
        );

        return null;
    }
};

// ======================================================
// SHARE SELL FORM — STEP 1
// ======================================================

(function () {

    function createShareSellForm() {

        // Form पहले से बना है तो दोबारा मत बनाओ
        if (document.getElementById("shareSellFormContainer")) {
            return;
        }

        const container = document.createElement("div");

        container.id = "shareSellFormContainer";

        container.style.cssText = `
            display:none;
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.55);
            z-index:99999;
            overflow-y:auto;
            padding:30px 15px;
        `;

        container.innerHTML = `
            <div style="
                max-width:700px;
                margin:20px auto;
                background:white;
                border-radius:12px;
                padding:25px;
                box-shadow:0 10px 40px rgba(0,0,0,0.25);
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:20px;
                ">

                    <h2 style="margin:0;">
                        💰 Sell Stock / Shares
                    </h2>

                    <button
                        type="button"
                        id="closeShareSellFormButton"
                        style="
                            border:none;
                            background:#eee;
                            width:35px;
                            height:35px;
                            border-radius:50%;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

                <div style="display:grid; gap:15px;">

                    <div>
                        <label>Company / Stock</label>

                        <input
                            type="text"
                            id="sellShareCompany"
                            readonly
                            style="
                                width:100%;
                                padding:10px;
                                background:#f3f4f6;
                            "
                        >
                    </div>

                    <div>
                        <label>Symbol</label>

                        <input
                            type="text"
                            id="sellShareSymbol"
                            readonly
                            style="
                                width:100%;
                                padding:10px;
                                background:#f3f4f6;
                            "
                        >
                    </div>

                    <div>
                        <label>Available Quantity</label>

                        <input
                            type="number"
                            id="sellShareAvailableQuantity"
                            readonly
                            style="
                                width:100%;
                                padding:10px;
                                background:#f3f4f6;
                            "
                        >
                    </div>

                    <div>
                        <label>Quantity to Sell</label>

                        <input
                            type="number"
                            id="sellShareQuantity"
                            min="0"
                            step="any"
                            placeholder="Enter quantity"
                            style="width:100%; padding:10px;"
                        >
                    </div>

                    <div>
                        <label>Sell Price</label>

                        <input
                            type="number"
                            id="sellSharePrice"
                            min="0"
                            step="any"
                            placeholder="Enter sell price"
                            style="width:100%; padding:10px;"
                        >
                    </div>

                    <div>
                        <label>Sell Date</label>

                        <input
                            type="date"
                            id="sellShareDate"
                            style="width:100%; padding:10px;"
                        >
                    </div>

                    <div>
                        <label>Broker</label>

                        <input
                            type="text"
                            id="sellShareBroker"
                            readonly
                            style="
                                width:100%;
                                padding:10px;
                                background:#f3f4f6;
                            "
                        >
                    </div>

                    <div>
                        <label>Charges</label>

                        <input
                            type="number"
                            id="sellShareCharges"
                            min="0"
                            step="any"
                            value="0"
                            style="width:100%; padding:10px;"
                        >
                    </div>

                    <div>
    <label>Net Sell Amount</label>

    <input
        type="number"
        id="sellShareNetAmount"
        readonly
        style="
            width:100%;
            padding:10px;
            background:#f3f4f6;
            font-weight:bold;
        "
    >
</div>

                    <div>
                        <label>Remarks</label>

                        <textarea
                            id="sellShareRemarks"
                            rows="3"
                            placeholder="Optional remarks"
                            style="
                                width:100%;
                                padding:10px;
                                resize:vertical;
                            "
                        ></textarea>
                    </div>

                    <div style="
                        display:flex;
                        gap:10px;
                        justify-content:flex-end;
                        margin-top:10px;
                    ">

                        <button
                            type="button"
                            id="cancelShareSellFormButton"
                            style="
                                padding:10px 18px;
                                border:1px solid #ccc;
                                background:#eee;
                                border-radius:6px;
                                cursor:pointer;
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            id="confirmShareSellButton"
                            style="
                                padding:10px 18px;
                                border:none;
                                background:#dc2626;
                                color:white;
                                border-radius:6px;
                                cursor:pointer;
                            "
                        >
                            💰 Confirm Sell
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(container);
    }


    // ==================================================
    // OPEN SELL FORM
    // ==================================================

    async function openShareSellForm(shareId) {

        createShareSellForm();

        const user = auth.currentUser;

        if (!user) {
            alert("कृपया पहले login करें।");
            return;
        }

        try {

            const shareRef = doc(
                db,
                "users",
                user.uid,
                "shares",
                shareId
            );

            const shareSnapshot =
                await getDoc(shareRef);

            if (!shareSnapshot.exists()) {
                alert("Share holding नहीं मिली।");
                return;
            }

            const share = shareSnapshot.data();

            document.getElementById(
                "sellShareCompany"
            ).value =
                share.companyName || "";

            document.getElementById(
                "sellShareSymbol"
            ).value =
                share.symbol || "";

            document.getElementById(
                "sellShareAvailableQuantity"
            ).value =
                Number(share.quantity || 0);

            document.getElementById(
                "sellShareBroker"
            ).value =
                share.broker || "";

            // आज की date
            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            document.getElementById(
                "sellShareDate"
            ).value = today;

            // Holding ID याद रखेंगे
            window.currentSellingShareId =
                shareId;

            // Form खोलें
            document.getElementById(
                "shareSellFormContainer"
            ).style.display = "block";

            console.log(
                "SHARE SELL FORM OPENED:",
                {
                    id: shareId,
                    share: share
                }
            );

        } catch (error) {

            console.error(
                "OPEN SHARE SELL FORM ERROR:",
                error
            );

            alert(
                "Sell Form खोलते समय error आया।"
            );
        }
    }


    // ==================================================
    // SELL BUTTON CLICK
    // ==================================================

    document.addEventListener(
        "click",
        function (event) {

            const sellButton =
                event.target.closest(
                    ".share-sell-button"
                );

            if (!sellButton) {
                return;
            }

            const shareId =
                sellButton.dataset.id;

            console.log(
                "SELL BUTTON CLICKED:",
                shareId
            );

            openShareSellForm(shareId);
        }
    );


    // ==================================================
    // CLOSE SELL FORM
    // ==================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.id ===
                    "closeShareSellFormButton" ||
                event.target.id ===
                    "cancelShareSellFormButton"
            ) {

                const container =
                    document.getElementById(
                        "shareSellFormContainer"
                    );

                if (container) {
                    container.style.display =
                        "none";
                }

            }

        }
    );

})();

// ======================================================
// SELL AMOUNT CALCULATION
// ======================================================

document.addEventListener("input", function (event) {

    if (
        event.target.id !== "sellShareQuantity" &&
        event.target.id !== "sellSharePrice" &&
        event.target.id !== "sellShareCharges"
    ) {
        return;
    }

    const quantity =
        Number(
            document.getElementById("sellShareQuantity")?.value || 0
        );

    const price =
        Number(
            document.getElementById("sellSharePrice")?.value || 0
        );

    const charges =
        Number(
            document.getElementById("sellShareCharges")?.value || 0
        );

    const grossAmount =
        quantity * price;

    const netAmount =
        Math.max(0, grossAmount - charges);

    const netAmountInput =
        document.getElementById("sellShareNetAmount");

    if (netAmountInput) {
        netAmountInput.value =
            netAmount.toFixed(2);
    }

});

// ======================================================
// SELL QUANTITY VALIDATION
// ======================================================

document.addEventListener("click", function (event) {

    if (
        event.target.id !== "confirmShareSellButton"
    ) {
        return;
    }

    const availableQuantity =
        Number(
            document.getElementById(
                "sellShareAvailableQuantity"
            )?.value || 0
        );

    const sellQuantity =
        Number(
            document.getElementById(
                "sellShareQuantity"
            )?.value || 0
        );

    if (sellQuantity <= 0) {
        alert("कृपया Sell Quantity डालें।");
        return;
    }

    if (sellQuantity > availableQuantity) {
        alert(
            `आपके पास केवल ${availableQuantity} shares उपलब्ध हैं।`
        );
        return;
    }

    console.log(
        "SELL QUANTITY VALID:",
        {
            availableQuantity,
            sellQuantity
        }
    );

    alert("Quantity valid है।");
});

// ======================================================
// ACTUAL SHARE SELL PROCESS
// ======================================================

document.addEventListener("click", async function (event) {

    if (event.target.id !== "confirmShareSellButton") {
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    const shareId = window.currentSellingShareId;

    if (!shareId) {
        alert("Selling Share select नहीं है।");
        return;
    }

    const sellQuantity = Number(
        document.getElementById("sellShareQuantity")?.value || 0
    );

    const sellPrice = Number(
        document.getElementById("sellSharePrice")?.value || 0
    );

    const sellDate =
        document.getElementById("sellShareDate")?.value || "";

    const charges = Number(
        document.getElementById("sellShareCharges")?.value || 0
    );

    const remarks =
        document.getElementById("sellShareRemarks")?.value || "";

    if (sellQuantity <= 0) {
        alert("कृपया Sell Quantity डालें।");
        return;
    }

    if (sellPrice <= 0) {
        alert("कृपया Sell Price डालें।");
        return;
    }

    if (!sellDate) {
        alert("कृपया Sell Date डालें।");
        return;
    }

    try {

        const shareRef = doc(
            db,
            "users",
            user.uid,
            "shares",
            shareId
        );

        const shareSnapshot = await getDoc(shareRef);

        if (!shareSnapshot.exists()) {
            alert("Share holding नहीं मिली।");
            return;
        }

        const share = shareSnapshot.data();

        const availableQuantity =
            Number(share.quantity || 0);

        if (sellQuantity > availableQuantity) {
            alert(
                `आपके पास केवल ${availableQuantity} shares उपलब्ध हैं।`
            );
            return;
        }

        // ----------------------------------------------
        // SELL CALCULATION
        // ----------------------------------------------

        const grossSellAmount =
            sellQuantity * sellPrice;

        const netSellAmount =
            Math.max(0, grossSellAmount - charges);

        const buyPrice =
            Number(share.buyPrice || 0);

        const costOfSoldShares =
            sellQuantity * buyPrice;

        const realizedProfitLoss =
            netSellAmount - costOfSoldShares;

        const remainingQuantity =
            availableQuantity - sellQuantity;

        console.log("SELL CALCULATION:", {
            availableQuantity,
            sellQuantity,
            sellPrice,
            grossSellAmount,
            charges,
            netSellAmount,
            costOfSoldShares,
            realizedProfitLoss,
            remainingQuantity
        });

        // ----------------------------------------------
        // SAVE SELL TRANSACTION HISTORY
        // ----------------------------------------------

        const sellHistoryData = {
            transactionType: "SELL",
            holdingId: shareId,

            date: sellDate,

            companyName:
                share.companyName || "",

            symbol:
                share.symbol || "",

            exchange:
                share.exchange || "",

            isin:
                share.isin || "",

            quantity: sellQuantity,

            sellPrice: sellPrice,

            buyPrice: buyPrice,

            grossSellAmount:
                grossSellAmount,

            charges:
                charges,

            netSellAmount:
                netSellAmount,

            costOfSoldShares:
                costOfSoldShares,

            realizedProfitLoss:
                realizedProfitLoss,

            broker:
                share.broker || "",

            remarks:
                remarks,

            createdAt:
                serverTimestamp()
        };

        await addDoc(
            collection(
                db,
                "users",
                user.uid,
                "shareTradingHistory"
            ),
            sellHistoryData
        );

        // ----------------------------------------------
        // UPDATE / REMOVE HOLDING
        // ----------------------------------------------

        if (remainingQuantity === 0) {

            await deleteDoc(shareRef);

            console.log(
                "SHARE HOLDING FULLY SOLD:",
                shareId
            );

        } else {

            const originalTotalAmount =
                Number(share.totalAmount || 0);

            const remainingTotalAmount =
                originalTotalAmount *
                (remainingQuantity / availableQuantity);

            await updateDoc(
                shareRef,
                {
                    quantity:
                        remainingQuantity,

                    totalAmount:
                        remainingTotalAmount,

                    updatedAt:
                        serverTimestamp()
                }
            );

            console.log(
                "SHARE HOLDING QUANTITY UPDATED:",
                {
                    oldQuantity: availableQuantity,
                    soldQuantity: sellQuantity,
                    remainingQuantity
                }
            );
        }

        // ----------------------------------------------
        // CLOSE FORM
        // ----------------------------------------------

        document.getElementById(
            "shareSellFormContainer"
        ).style.display = "none";

        window.currentSellingShareId = null;

        alert(
            `Share successfully sell हो गया।\n\n` +
            `Net Sell Amount: ₹${netSellAmount.toFixed(2)}\n` +
            `Realized P/L: ₹${realizedProfitLoss.toFixed(2)}`
        );

        // ----------------------------------------------
        // REFRESH HOLDINGS
        // ----------------------------------------------

        if (window.loadShares) {
            await window.loadShares();
        }

    } catch (error) {

        console.error(
            "ACTUAL SHARE SELL ERROR:",
            error
        );

        alert(
            "Share sell नहीं हो सका। Console में error देखें।"
        );
    }

});

// ======================================================
// SHARE TRADING HISTORY — LOAD & DISPLAY
// ======================================================

window.loadShareTradingHistory = async function () {

    const user = auth.currentUser;

    if (!user) {
        console.log("SHARE HISTORY: User not logged in");
        return;
    }

    const historyContainer =
        document.getElementById(
            "shareTradingHistoryContainer"
        );

    const tableBody =
        document.getElementById(
            "shareTradingHistoryTableBody"
        );

    const countElement =
        document.getElementById(
            "shareTradingHistoryCount"
        );

    const noHistoryMessage =
        document.getElementById(
            "noShareTradingHistoryMessage"
        );

    if (!tableBody) {
        console.error(
            "SHARE HISTORY TABLE BODY NOT FOUND"
        );
        return;
    }

    try {

        const historySnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "shareTradingHistory"
            )
        );

        console.log(
            "SHARE TRADING HISTORY COUNT:",
            historySnapshot.size
        );

        tableBody.innerHTML = "";

        let totalSell = 0;
let totalCost = 0;
let totalRealizedPL = 0;

        const historyDocs =
            [...historySnapshot.docs].sort(
                (a, b) => {

                    const dateA =
                        a.data().date || "";

                    const dateB =
                        b.data().date || "";

                    return dateB.localeCompare(dateA);
                }
            );

        historyDocs.forEach((historyDoc) => {

            const history =
                historyDoc.data();

            const row =
                document.createElement("tr");

            const quantity =
                Number(history.quantity || 0);

            const price =
                Number(
                    history.sellPrice ||
                    history.price ||
                    0
                );

            const grossAmount =
                Number(
                    history.grossSellAmount || 0
                );

            const charges =
                Number(
                    history.charges || 0
                );

            const netAmount =
                Number(
                    history.netSellAmount || 0
                );

            const cost =
                Number(
                    history.costOfSoldShares || 0
                );

            const realizedPL =
                Number(
                    history.realizedProfitLoss || 0
                );

                totalSell += netAmount;
totalCost += cost;
totalRealizedPL += realizedPL;

            row.innerHTML = `

                <td>
                    ${history.date || "-"}
                </td>

                <td>
                    <strong>
                        ${history.companyName || "-"}
                    </strong>
                </td>

                <td>
                    ${history.symbol || "-"}
                </td>

                <td>
                    ${history.transactionType || "-"}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    ₹${price.toFixed(2)}
                </td>

                <td>
                    ₹${grossAmount.toFixed(2)}
                </td>

                <td>
                    ₹${charges.toFixed(2)}
                </td>

                <td>
                    ₹${netAmount.toFixed(2)}
                </td>

                <td>
                    ₹${cost.toFixed(2)}
                </td>

                <td>
                    ₹${realizedPL.toFixed(2)}
                </td>

               <td>
    ${history.broker || "-"}
</td>

<td style="white-space: nowrap;">

    <button
        type="button"
        class="share-history-edit-button"
        data-id="${historyDoc.id}">
        ✏️
    </button>

    <button
        type="button"
        class="share-history-delete-button"
        data-id="${historyDoc.id}">
        🗑️
    </button>

</td>

            `;

            tableBody.appendChild(row);
        });

        const realizedPLPercentage =
    totalCost > 0
        ? (totalRealizedPL / totalCost) * 100
        : 0;

const totalSellElement =
    document.getElementById("historyTotalSell");

const totalCostElement =
    document.getElementById("historyTotalCost");

const realizedPLElement =
    document.getElementById("historyRealizedPL");

if (totalSellElement) {
    totalSellElement.textContent =
        `₹${totalSell.toFixed(2)}`;
}

if (totalCostElement) {
    totalCostElement.textContent =
        `₹${totalCost.toFixed(2)}`;
}

if (realizedPLElement) {
    const sign =
        totalRealizedPL > 0 ? "+" : "";

    realizedPLElement.textContent =
        `₹${totalRealizedPL.toFixed(2)} ` +
        `(${sign}${realizedPLPercentage.toFixed(2)}%)`;
}

        if (countElement) {
            countElement.textContent =
                historySnapshot.size;
        }

        if (noHistoryMessage) {
            noHistoryMessage.style.display =
                historySnapshot.size === 0
                    ? "block"
                    : "none";
        }

        if (historyContainer) {
            historyContainer.style.display =
                "block";
        }

        console.log(
            "SHARE TRADING HISTORY TABLE RENDERED"
        );

    } catch (error) {

        console.error(
            "LOAD SHARE TRADING HISTORY ERROR:",
            error
        );

    }
};  

// ======================================================
// SHARE DATA REFRESH BUTTON
// ======================================================

document.addEventListener("click", async function (event) {

    if (event.target.id !== "refreshShareDataButton") {
        return;
    }

    const refreshButton =
        document.getElementById("refreshShareDataButton");

    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = "⏳ Refreshing...";
    }

    try {

        if (window.loadShares) {
    await window.loadShares();
}

    } catch (error) {

        console.error("SHARE REFRESH ERROR:", error);

    } finally {

        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = "🔄 Refresh";
        }

    }

});

// ======================================================
// SHARE TRADING HISTORY — DELETE
// ======================================================

document.addEventListener("click", async function (event) {

    const deleteButton =
        event.target.closest(".share-history-delete-button");

    if (!deleteButton) return;

    const historyId = deleteButton.dataset.id;

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    const confirmDelete = confirm(
        "क्या आप यह Trading History delete करना चाहते हैं?"
    );

    if (!confirmDelete) return;

    try {

        const historyRef = doc(
            db,
            "users",
            user.uid,
            "shareTradingHistory",
            historyId
        );

        await deleteDoc(historyRef);

        console.log(
            "SHARE TRADING HISTORY DELETED:",
            historyId
        );

        alert(
            "Trading History successfully delete हो गई।"
        );

        if (window.loadShareTradingHistory) {
            await window.loadShareTradingHistory();
        }

    } catch (error) {

        console.error(
            "DELETE SHARE TRADING HISTORY ERROR:",
            error
        );

        alert(
            "Trading History delete नहीं हो सकी। Console में error देखें।"
        );

    }

});

// ======================================================
// SHARE TRADING HISTORY — EDIT FORM OPEN
// ======================================================

document.addEventListener("click", async function (event) {

    const editButton =
        event.target.closest(".share-history-edit-button");

    if (!editButton) return;

    const historyId = editButton.dataset.id;

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    console.log(
        "SHARE HISTORY EDIT CLICKED:",
        historyId
    );

    try {

        const historyRef = doc(
            db,
            "users",
            user.uid,
            "shareTradingHistory",
            historyId
        );

        const historySnapshot =
            await getDoc(historyRef);

        if (!historySnapshot.exists()) {
            alert("Trading History नहीं मिली।");
            return;
        }

        const history =
            historySnapshot.data();

        console.log(
            "SHARE HISTORY TO EDIT:",
            history
        );

       const editContainer =
    document.getElementById("shareHistoryEditFormContainer");

if (!editContainer) {

    const form = document.createElement("div");

    form.id = "shareHistoryEditFormContainer";

    form.style.cssText = `
        display:none;
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.55);
        z-index:99999;
        overflow-y:auto;
        padding:30px 15px;
    `;

    form.innerHTML = `
        <div style="
            max-width:650px;
            margin:20px auto;
            background:white;
            border-radius:12px;
            padding:25px;
        ">

            <h2>✏️ Edit Share Trading History</h2>

            <div style="display:grid; gap:15px;">

                <div>
                    <label>Company</label>
                    <input id="editHistoryCompany"
                        readonly
                        style="width:100%;padding:10px;background:#f3f4f6;">
                </div>

                <div>
                    <label>Symbol</label>
                    <input id="editHistorySymbol"
                        readonly
                        style="width:100%;padding:10px;background:#f3f4f6;">
                </div>

                <div>
                    <label>Quantity</label>
                    <input type="number"
                        id="editHistoryQuantity"
                        min="0"
                        step="any"
                        style="width:100%;padding:10px;">
                </div>

                <div>
                    <label>Sell Price</label>
                    <input type="number"
                        id="editHistoryPrice"
                        min="0"
                        step="any"
                        style="width:100%;padding:10px;">
                </div>

                <div>
                    <label>Sell Date</label>
                    <input type="date"
                        id="editHistoryDate"
                        style="width:100%;padding:10px;">
                </div>

                <div>
                    <label>Charges</label>
                    <input type="number"
                        id="editHistoryCharges"
                        min="0"
                        step="any"
                        style="width:100%;padding:10px;">
                </div>

                <div>
                    <label>Remarks</label>
                    <textarea
                        id="editHistoryRemarks"
                        rows="3"
                        style="width:100%;padding:10px;"></textarea>
                </div>

                <div style="
                    display:flex;
                    gap:10px;
                    justify-content:flex-end;
                ">

                    <button
                        type="button"
                        id="cancelHistoryEditButton">
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveHistoryEditButton">
                        💾 Save Changes
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(form);
}

const editForm =
    document.getElementById("shareHistoryEditFormContainer");

document.getElementById("editHistoryCompany").value =
    history.companyName || "";

document.getElementById("editHistorySymbol").value =
    history.symbol || "";

document.getElementById("editHistoryQuantity").value =
    Number(history.quantity || 0);

document.getElementById("editHistoryPrice").value =
    Number(history.sellPrice || 0);

document.getElementById("editHistoryDate").value =
    history.date || "";

document.getElementById("editHistoryCharges").value =
    Number(history.charges || 0);

document.getElementById("editHistoryRemarks").value =
    history.remarks || "";

window.editingShareHistoryId = historyId;

editForm.style.display = "block";

console.log(
    "SHARE HISTORY EDIT FORM OPENED:",
    historyId
);

    } catch (error) {

        console.error(
            "OPEN SHARE HISTORY EDIT ERROR:",
            error
        );

        alert(
            "Trading History खोलते समय error आया।"
        );

    }

});

// ======================================================
// SHARE TRADING HISTORY — EDIT FORM CLOSE
// ======================================================

document.addEventListener("click", function (event) {

    if (
        event.target.id !== "cancelHistoryEditButton"
    ) {
        return;
    }

    const editForm =
        document.getElementById(
            "shareHistoryEditFormContainer"
        );

    if (editForm) {
        editForm.style.display = "none";
    }

    window.editingShareHistoryId = null;

});

// ======================================================
// SHARE TRADING HISTORY — SAVE EDIT
// ======================================================

document.addEventListener("click", async function (event) {

    if (event.target.id !== "saveHistoryEditButton") {
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    const historyId =
        window.editingShareHistoryId;

    if (!historyId) {
        alert("Edit History select नहीं है।");
        return;
    }

    const quantity =
        Number(
            document.getElementById(
                "editHistoryQuantity"
            )?.value || 0
        );

    const sellPrice =
        Number(
            document.getElementById(
                "editHistoryPrice"
            )?.value || 0
        );

    const sellDate =
        document.getElementById(
            "editHistoryDate"
        )?.value || "";

    const charges =
        Number(
            document.getElementById(
                "editHistoryCharges"
            )?.value || 0
        );

    const remarks =
        document.getElementById(
            "editHistoryRemarks"
        )?.value || "";

    if (quantity <= 0) {
        alert("कृपया Quantity डालें।");
        return;
    }

    if (sellPrice <= 0) {
        alert("कृपया Sell Price डालें।");
        return;
    }

    if (!sellDate) {
        alert("कृपया Date डालें।");
        return;
    }

    try {

        const historyRef = doc(
            db,
            "users",
            user.uid,
            "shareTradingHistory",
            historyId
        );

        const historySnapshot =
            await getDoc(historyRef);

        if (!historySnapshot.exists()) {
            alert("Trading History नहीं मिली।");
            return;
        }

        const history =
            historySnapshot.data();

        const buyPrice =
            Number(history.buyPrice || 0);

        const grossSellAmount =
            quantity * sellPrice;

        const netSellAmount =
            Math.max(
                0,
                grossSellAmount - charges
            );

        const costOfSoldShares =
            quantity * buyPrice;

        const realizedProfitLoss =
            netSellAmount -
            costOfSoldShares;

        await updateDoc(
            historyRef,
            {
                quantity: quantity,
                sellPrice: sellPrice,
                date: sellDate,
                charges: charges,
                grossSellAmount: grossSellAmount,
                netSellAmount: netSellAmount,
                costOfSoldShares: costOfSoldShares,
                realizedProfitLoss: realizedProfitLoss,
                remarks: remarks,
                updatedAt: serverTimestamp()
            }
        );

        console.log(
            "SHARE TRADING HISTORY UPDATED:",
            historyId
        );

        alert(
            "Trading History successfully update हो गई।"
        );

        const editForm =
            document.getElementById(
                "shareHistoryEditFormContainer"
            );

        if (editForm) {
            editForm.style.display = "none";
        }

        window.editingShareHistoryId = null;

        if (window.loadShareTradingHistory) {
            await window.loadShareTradingHistory();
        }

    } catch (error) {

        console.error(
            "UPDATE SHARE TRADING HISTORY ERROR:",
            error
        );

        alert(
            "Trading History update नहीं हो सकी। Console में error देखें।"
        );

    }

});

// =========================================
// EXPOSE TRANSACTION LOADERS
// =========================================

window.loadTransactionInvestments =
    loadTransactionInvestments;

window.loadTransactionAccounts =
    loadTransactionAccounts;

    window.getTransactionInvestments = () => savedTransactionInvestments;

// =====================================================
// MUTUAL FUND / SIP - FINAL POPUP TRIGGER
// =====================================================

document.addEventListener(
    "change",
    function (event) {

        const categorySelect = event.target;

        if (
            !categorySelect.matches(
                ".transaction-category"
            )
        ) {
            return;
        }

        const row =
            categorySelect.closest(
                ".transaction-entry-row"
            );

        if (!row) {
            return;
        }

        const typeSelect =
            row.querySelector(
                ".transaction-type"
            );

        const selectedType =
            typeSelect?.value
                ?.trim()
                ?.toLowerCase() || "";

        const selectedCategory =
            categorySelect.value
                ?.trim()
                ?.toLowerCase() || "";

        const selectedCategoryText =
            categorySelect.options[
                categorySelect.selectedIndex
            ]
                ?.textContent
                ?.trim()
                ?.toLowerCase() || "";

        // ==========================================
        // MUTUAL FUND / SIP DETECTION
        // ==========================================

        const isMutualFund =
            selectedCategory.includes(
                "mutual fund"
            ) ||
            selectedCategoryText.includes(
                "mutual fund"
            );

        if (
            selectedType !== "investment" ||
            !isMutualFund
        ) {
            return;
        }

        console.log(
            "✅ MUTUAL FUND / SIP DETECTED"
        );

        // ==========================================
        // STORE TRANSACTION ROW
        // ==========================================

        window.pendingMutualFundTransactionRow =
            row;

        // ==========================================
        // GET POPUP
        // ==========================================

        const mfFormContainer =
            document.getElementById(
                "mutualFundFormContainer"
            );

        if (!mfFormContainer) {

            console.error(
                "❌ mutualFundFormContainer NOT FOUND"
            );

            return;
        }

        // ==========================================
        // COPY FUND NAME
        // ==========================================

        const mfFundNameInput =
            document.getElementById(
                "mfFundName"
            );

        const transactionInvestmentInput =
            row.querySelector(
                ".transaction-investment"
            );

        if (
            mfFundNameInput &&
            transactionInvestmentInput
        ) {

            mfFundNameInput.value =
                transactionInvestmentInput.value || "";

        }

        // ==========================================
        // COPY AMOUNT
        // ==========================================

        const mfAmountInput =
            document.getElementById(
                "mfAmount"
            );

        const transactionAmountInput =
            row.querySelector(
                ".transaction-amount"
            );

        if (
            mfAmountInput &&
            transactionAmountInput
        ) {

            mfAmountInput.value =
                transactionAmountInput.value || "";

        }

        // ==========================================
        // FORCE POPUP
        // ==========================================

        mfFormContainer.style.setProperty(
            "display",
            "block",
            "important"
        );

        mfFormContainer.style.setProperty(
            "position",
            "fixed",
            "important"
        );

        mfFormContainer.style.setProperty(
            "z-index",
            "999999",
            "important"
        );

        console.log(
            "🎯 MUTUAL FUND POPUP OPENED"
        );

    },
    true
);

// =========================================
// TEMPORARY DELETE ALL TRANSACTION HISTORY
// =========================================

const deleteAllTransactionsButton =
    document.querySelector(
        "#deleteAllTransactionsButton"
    );

if (deleteAllTransactionsButton) {

    deleteAllTransactionsButton.addEventListener(
        "click",
        async () => {

            const user = auth.currentUser;

            if (!user) {
                alert("पहले login करें।");
                return;
            }

            const confirmed = confirm(
                "⚠️ WARNING\n\n" +
                "क्या आप सभी Transaction History entries delete करना चाहते हैं?\n\n" +
                "सिर्फ Transactions delete होंगी।\n" +
                "Accounts, Investments, Properties, Insurance, Loans आदि को touch नहीं किया जाएगा.\n\n" +
                "यह action वापस नहीं किया जा सकता।\n\n" +
                "Continue?"
            );

            if (!confirmed) {
                return;
            }

            try {

                const transactionsCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "transactions"
                    );

                const snapshot =
                    await getDocs(
                        transactionsCollection
                    );

                let deletedCount = 0;

                for (
                    const transactionDoc
                    of snapshot.docs
                ) {

                    await deleteDoc(
                        transactionDoc.ref
                    );

                    deletedCount++;

                }

                await loadSavedTransactions();

                alert(
                    deletedCount +
                    " Transaction History entries deleted successfully."
                );

            }
            catch (error) {

                console.error(
                    "DELETE ALL TRANSACTIONS ERROR:",
                    error
                );

                alert(
                    "Transaction History delete नहीं हो सकी.\n\n" +
                    (error?.message || error)
                );

            }

        }
    );

}

// =========================================
// VEHICLE FIELD — CATEGORY CHANGE
// =========================================

document.addEventListener(
    "change",
    (event) => {

        if (
            !event.target.classList.contains(
                "transaction-category"
            )
        ) {
            return;
        }

        const row =
            event.target.closest(
                ".transaction-entry-row"
            );

        if (!row) {
            return;
        }

        const type =
            row.querySelector(
                ".transaction-type"
            )?.value || "";

        const category =
            event.target.value || "";

        const vehicleSelect =
            row.querySelector(
                ".transaction-vehicle"
            );

        if (!vehicleSelect) {
            return;
        }

        const vehicleCategories = [
            "Vehicle Fuel",
            "Vehicle Insurance",
            "Vehicle Maintenance",
            "Vehicle Challan",
            "Vehicle Other Expense"
        ];

        if (
            type === "expense" &&
            vehicleCategories.includes(category)
        ) {

            vehicleSelect.style.display =
                "block";

                loadTransactionVehicleDropdowns();

        } else {

            vehicleSelect.style.display =
                "none";

            vehicleSelect.value = "";

        }

    }
);

// ======================================================
// CHECK DELETED ₹44 GEHU PISAI TRANSACTION
// READ ONLY - DOES NOT CHANGE ANY DATA
// ======================================================

async function checkDeletedGehuTransaction() {

    const user = auth.currentUser;

    if (!user) {
        console.log("User not logged in.");
        return;
    }

    try {

        const transactionsRef =
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            );

        const snapshot =
            await getDocs(
                transactionsRef
            );

        let found = false;

        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();

                if (
                    Number(transaction.amount) === 44 &&
                    (
                        transaction.category || ""
                    )
                        .toLowerCase()
                        .includes("gehu")
                ) {

                    found = true;

                    console.log(
                        "₹44 GEHU PISAI TRANSACTION FOUND:",
                        {
                            transactionId:
                                transactionDoc.id,

                            date:
                                transaction.date,

                            type:
                                transaction.type,

                            category:
                                transaction.category,

                            amount:
                                transaction.amount,

                            fromAccountId:
                                transaction.fromAccountId,

                            deleted:
                                transaction.deleted,

                            deletedAt:
                                transaction.deletedAt,

                            deletedBy:
                                transaction.deletedBy
                        }
                    );

                }

            }
        );

        if (!found) {

            console.log(
                "₹44 GEHU PISAI TRANSACTION NOT FOUND"
            );

        }

    }
    catch (error) {

        console.error(
            "CHECK DELETED GEHU TRANSACTION ERROR:",
            error
        );

    }

}

window.checkDeletedGehuTransaction =
    checkDeletedGehuTransaction;

    // ======================================================
// FIND ALL ₹44 TRANSACTIONS
// READ ONLY - DOES NOT CHANGE ANY DATA
// ======================================================

async function findAll44Transactions() {

    const user = auth.currentUser;

    if (!user) {
        console.log("User not logged in.");
        return;
    }

    try {

        const transactionsRef =
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            );

        const snapshot =
            await getDocs(transactionsRef);

        let count = 0;

        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();

                if (
                    Number(transaction.amount) === 44
                ) {

                    count++;

                    console.log(
                        "₹44 TRANSACTION FOUND:",
                        {
                            transactionId:
                                transactionDoc.id,

                            date:
                                transaction.date,

                            type:
                                transaction.type,

                            category:
                                transaction.category,

                            amount:
                                transaction.amount,

                            fromAccountId:
                                transaction.fromAccountId,

                            toAccountId:
                                transaction.toAccountId,

                            partyName:
                                transaction.partyName,

                            notes:
                                transaction.notes,

                            deleted:
                                transaction.deleted,

                            deletedAt:
                                transaction.deletedAt
                        }
                    );

                }

            }
        );

        console.log(
            "TOTAL ₹44 TRANSACTIONS FOUND:",
            count
        );

    }
    catch (error) {

        console.error(
            "FIND ₹44 TRANSACTIONS ERROR:",
            error
        );

    }

}

window.findAll44Transactions =
    findAll44Transactions;