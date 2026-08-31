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
    updateDoc
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

            loadTransactionAccounts();

            loadTransactionParties();

            loadTransactionInvestments();


            // =================================
            // LOAD CUSTOM TRANSACTION TYPES
            // =================================

            await loadCustomTransactionTypes();


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


            // FD Form खोलें
            fdFormContainer.style.display =
                "block";


            // FD Form तक scroll करें
            fdFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


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

        setCellVisible(
            fromAccountCell,
            true
        );


        setCellVisible(
            toAccountCell,
            false
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
// INVESTMENT SEARCH / SUGGESTIONS
// =========================================

document.addEventListener(
    "input",
    (event) => {

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

// =========================================
// SAVE ALL TRANSACTIONS
// =========================================

if (transactionForm) {

    transactionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


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
                    // INVESTMENT VALIDATION
                    // =================================

                    if (
                        type === "investment" &&
                        !investmentId
                    ) {

                        alert(
                            "कृपया Investment / Asset Master से Investment select करें।"
                        );

                        return;

                    }


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

                        linkedModule:
                            linkedModule,

                        notes:
                            notes,

                        createdAt:
                            serverTimestamp()

                    };


     // =================================
// SAVE OR UPDATE TO FIRESTORE
// =================================

const editingTransactionId =
    row.dataset.editingTransactionId || null;


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

                    return;

                }


                // =================================
                // SUCCESS
                // =================================

                alert(
                    savedCount +
                    " Transaction successfully save हो गई।"
                );


                console.log(
                    "All transactions saved successfully:",
                    savedCount
                );


                // =================================
                // RESET FORM
                // =================================

                transactionEntryBody.innerHTML = "";


                // =================================
                // CREATE ONE FRESH ROW
                // =================================

                const firstRow =
                    document.createElement("tr");


                firstRow.className =
                    "transaction-entry-row";


                // =================================
                // RELOAD PAGE / FORM
                // =================================

                location.reload();

            }
            catch (error) {

                console.error(
                    "Save Transactions Error:",
                    error
                );


                alert(
                    "Transaction save नहीं हो सकी। Console में error देखें।"
                );

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


        transactionCount++;


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
            // DELETE FROM FIRESTORE
            // =================================

            await deleteDoc(
                transactionRef
            );

            console.log(
                "Transaction deleted successfully:",
                transactionId
            );

            alert(
                "Transaction successfully delete हो गई।"
            );

            // =================================
            // REFRESH HISTORY
            // =================================

            await loadSavedTransactions();

        }
        catch (error) {

            console.error(
                "Delete Transaction Error:",
                error
            );

            alert(
                "Transaction delete नहीं हो सकी। Console में error देखें।"
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


        if (!input) {

            console.error(
                "New Transaction Type input not found."
            );

            return;

        }


        const typeName =
            input.value.trim();


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
                            type.name.trim()

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

