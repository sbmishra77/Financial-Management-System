console.log("MY LATEST REPORTS.JS LOADED");

// =========================================================
// SBM WEALTH MANAGER
// REPORTS MODULE
// STEP 3 — FIREBASE USER DETAILS
// =========================================================

import {
    auth,
    db
} from "../js/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =========================================================
// WAIT FOR PAGE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Financial Reports Module Loaded");


    // =====================================================
    // CURRENT USER
    // =====================================================

    let currentUser = null;


    // =====================================================
    // FIREBASE AUTH STATE
    // =====================================================

    onAuthStateChanged(auth, (user) => {

        currentUser = user;

        console.log(
            "Reports User:",
            user ? user.email : "No user logged in"
        );

    });


    // =====================================================
    // TRANSACTION REPORTS
    // =====================================================

    const transactionReports = [

        {
            number: 16,
            name: "All Transactions"
        },

        {
            number: 17,
            name: "Date-wise Transactions"
        },

        {
            number: 18,
            name: "Month-wise Transactions"
        },

        {
            number: 19,
            name: "Year-wise Transactions"
        },

        {
            number: 20,
            name: "Income Transactions"
        },

        {
            number: 21,
            name: "Expense Transactions"
        },

        {
            number: 22,
            name: "Investment Transactions"
        },

        {
            number: 23,
            name: "Transfer Transactions"
        },

        {
            number: 24,
            name: "Wallet Transactions"
        },

        {
            number: 25,
            name: "Cashback Transactions"
        },

        {
            number: 26,
            name: "Deleted Transactions"
        },

        {
            number: 27,
            name: "Edited Transactions"
        },

        {
            number: 28,
            name: "Recently Added Transactions"
        },

        {
            number: 29,
            name: "Transactions by Category"
        },

        {
            number: 30,
            name: "Transactions by Party"
        },

        {
            number: 31,
            name: "Transactions by Account"
        },

        {
            number: 32,
            name: "Transactions by Payment Method"
        },

        {
            number: 33,
            name: "Transactions by Linked Module"
        },

        {
            number: 34,
            name: "Transactions without Category"
        },

        {
            number: 35,
            name: "Transactions without Party"
        },

        {
            number: 36,
            name: "Transactions without Notes"
        },

        {
            number: 37,
            name: "High-value Transactions"
        },

        {
            number: 38,
            name: "Duplicate Transaction Detection"
        },

        {
            number: 39,
            name: "Transaction Audit Report"
        }

    ];


    // =====================================================
    // DOM ELEMENTS
    // =====================================================

    const reportWorkArea =
        document.getElementById("reportWorkArea");

    const reportSearch =
        document.getElementById("reportSearch");

        // =====================================================
// REPORT MODULE SCREEN NAVIGATION
// =====================================================

// -----------------------------------------------------
// HIDE REPORT MODULE STARTING PAGE
// -----------------------------------------------------

function hideReportModuleStartPage() {

    const startPageElements = [

        document.querySelector(".reports-header"),

        document.querySelector(".reports-search-section"),

        document.querySelector(".reports-categories-section")

    ];


    startPageElements.forEach(
        function (element) {

            if (element) {

                element.style.display = "none";

            }

        }
    );

}

// =====================================================
// GLOBAL DATE SORT — OLDEST FIRST / ASCENDING
// Supports YYYY-MM-DD and DD-MM-YYYY
// =====================================================

function sortTransactionsOldestFirst(transactions) {

    function getSortableDate(value) {

        if (!value) return "";

        const dateString = String(value).trim();

        // YYYY-MM-DD
        let match = dateString.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );

        if (match) {
            return (
                match[1] + "-" +
                match[2].padStart(2, "0") + "-" +
                match[3].padStart(2, "0")
            );
        }

        // DD-MM-YYYY or DD/MM/YYYY
        match = dateString.match(
            /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
        );

        if (match) {
            return (
                match[3] + "-" +
                match[2].padStart(2, "0") + "-" +
                match[1].padStart(2, "0")
            );
        }

        // Unknown date format: keep it after valid dates
        return "";
    }

    return transactions.sort(function (a, b) {

        const dateA = getSortableDate(a.date);
        const dateB = getSortableDate(b.date);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA.localeCompare(dateB);
    });
}

// -----------------------------------------------------
// SHOW REPORT MODULE STARTING PAGE
// -----------------------------------------------------

function showReportModuleStartPage() {

    const startPageElements = [

        document.querySelector(".reports-header"),

        document.querySelector(".reports-search-section"),

        document.querySelector(".reports-categories-section")

    ];


    startPageElements.forEach(
        function (element) {

            if (element) {

                element.style.display = "";

            }

        }
    );


    // Clear currently opened report/list

    reportWorkArea.innerHTML = `

        <div class="report-work-placeholder">

            <div class="placeholder-icon">
                📊
            </div>

            <h2>
                Select a Report
            </h2>

            <p>
                Choose a report category above to begin.
            </p>

        </div>

    `;

}

// =====================================================
// GLOBAL REPORT TOOLBAR OBSERVER
// =====================================================

const reportToolbarObserver =
    new MutationObserver(function () {

        injectReportToolbar();

    });


if (reportWorkArea) {

    reportToolbarObserver.observe(
        reportWorkArea,
        {
            childList: true,
            subtree: true
        }
    );

}


    // =====================================================
    // CATEGORY CARDS — NO PAGE RELOAD
    // =====================================================

// =====================================================
// REPORT CATEGORY TITLE NORMALIZER
// Keeps dashboard names user-friendly while preserving
// existing internal category logic.
// =====================================================

function getReportCategoryKey(card) {

    const rawTitle =
        card.querySelector(
            ".report-category-title"
        )?.textContent?.trim() || "";

    const cleanTitle =
        rawTitle
            .replace(/\s+Reports$/i, "")
            .trim();

    const aliases = {
        "Accounts & Banks": "Accounts"
    };

    return aliases[cleanTitle] || cleanTitle;
}

const categoryCards = document.querySelectorAll(
    ".report-category-card"
);

categoryCards.forEach(card => {

    card.addEventListener("click", () => {

 const title =
    getReportCategoryKey(card);

        if (title === "Transactions") {

            renderTransactionReports();

        }

if (title === "Accounts") {

    console.log("🏦 ACCOUNTS REPORTS SELECTED");

    hideReportModuleStartPage();

    if (reportWorkArea) {

        reportWorkArea.innerHTML = `
            <div class="transaction-reports-container">

                <div class="transaction-reports-header">

                    <div>
                        <h2>🏦 Accounts Reports</h2>

                        <p>
                            Select an Accounts report
                        </p>
                    </div>

                </div>

                <div
                    id="accountsReportsGrid"
                    class="transaction-reports-grid"
                >

                    <div
                        class="transaction-report-card"
                        data-report="all-accounts"
                    >
                        <div class="transaction-report-number">
                            1
                        </div>

                        <div class="transaction-report-content">
                            <h3>🏦 All Accounts</h3>

                            <p>
                                View all accounts
                            </p>
                        </div>
                    </div>


                    <div
                        class="transaction-report-card"
                        data-report="account-balances"
                    >
                        <div class="transaction-report-number">
                            2
                        </div>

                        <div class="transaction-report-content">
                            <h3>💰 Account Balances</h3>

                            <p>
                                View account balances
                            </p>
                        </div>
                    </div>


                    <div
                        class="transaction-report-card"
                        data-report="account-wise-transactions"
                    >
                        <div class="transaction-report-number">
                            3
                        </div>

                        <div class="transaction-report-content">
                            <h3>📊 Account-wise Transactions</h3>

                            <p>
                                View transactions by account
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        `;

const allAccountsReport =
    document.querySelector(
        '[data-report="all-accounts"]'
    );


    const accountBalancesReport =
    document.querySelector(
        '[data-report="account-balances"]'
    );

console.log(
    "🔎 ACCOUNT BALANCES CARD:",
    accountBalancesReport
);

if (accountBalancesReport) {

accountBalancesReport.addEventListener(
    "click",
    async () => {

        console.log(
            "💰 ACCOUNT BALANCES REPORT SELECTED"
        );

        window.activeTransactionReport = {
    number: 2,
    name: "Account Balances"
};

        if (reportWorkArea) {

            reportWorkArea.innerHTML = `
                <div class="transaction-reports-container">

                    <div class="transaction-reports-header">

                        <div>
                            <h2>💰 Account Balances</h2>

                            <p>
                                View opening and current balances for all accounts
                            </p>
                        </div>

                    </div>

                    <div
                        id="accountBalancesTable"
                        style="margin-top:20px;"
                    >

                        <div
                            style="
                                display:grid;
                                grid-template-columns:2fr 1fr 1fr;
                                padding:10px 16px;
                                background:#f1f5f9;
                                border-bottom:2px solid #cbd5e1;
                                font-weight:600;
                            "
                        >
                            <div>Account Name</div>

                            <div style="text-align:right;">
                                Opening Balance
                            </div>

                            <div style="text-align:right;">
                                Current Balance
                            </div>

                        </div>

                    </div>

                </div>
            `;

        }

        const user = auth.currentUser;

        if (!user) {

            console.log(
                "❌ ACCOUNT BALANCES: USER NOT FOUND"
            );

            return;

        }

        const accountsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "accounts"
                )
            );

        let totalOpeningBalance = 0;
        let totalCurrentBalance = 0;

        const accountBalancesTable =
            document.querySelector(
                "#accountBalancesTable"
            );

        if (accountBalancesTable) {

            accountsSnapshot.forEach(
                (accountDoc) => {

                    const account =
                        accountDoc.data();

                    const openingBalance =
                        Number(
                            account.openingBalance ?? 0
                        );

                    const currentBalance =
                        Number(
                            account.balance ?? 0
                        );

                    totalOpeningBalance +=
                        openingBalance;

                    totalCurrentBalance +=
                        currentBalance;

                    const row =
                        document.createElement("div");

                    row.style.display = "grid";

                    row.style.gridTemplateColumns =
                        "2fr 1fr 1fr";

                    row.style.alignItems =
                        "center";

                    row.style.padding =
                        "12px 16px";

                    row.style.borderBottom =
                        "1px solid #ddd";

                    row.style.fontSize =
                        "14px";

                    row.innerHTML = `
                        <div>
                            <strong>
                                ${account.name || "Unnamed Account"}
                            </strong>
                        </div>

                        <div style="text-align:right;">
                            ₹ ${openingBalance.toFixed(2)}
                        </div>

                        <div style="text-align:right;">
                            ₹ ${currentBalance.toFixed(2)}
                        </div>
                    `;

                    accountBalancesTable.appendChild(
                        row
                    );

                }
            );

            // TOTAL ROW

            const totalRow =
                document.createElement("div");

            totalRow.style.display = "grid";

            totalRow.style.gridTemplateColumns =
                "2fr 1fr 1fr";

            totalRow.style.alignItems =
                "center";

            totalRow.style.padding =
                "13px 16px";

            totalRow.style.marginTop =
                "2px";

            totalRow.style.background =
                "#eef2ff";

            totalRow.style.borderTop =
                "2px solid #94a3b8";

            totalRow.style.fontWeight =
                "700";

            totalRow.style.fontSize =
                "14px";

            totalRow.innerHTML = `
                <div>
                    Total
                </div>

                <div style="text-align:right;">
                    ₹ ${totalOpeningBalance.toFixed(2)}
                </div>

                <div style="text-align:right;">
                    ₹ ${totalCurrentBalance.toFixed(2)}
                </div>
            `;

            accountBalancesTable.appendChild(
                totalRow
            );
// =====================================================
// EXPORT TABLE — ACCOUNT BALANCES
// Creates a real HTML table for PDF / Excel / Print
// =====================================================

const exportTable = document.createElement("table");

exportTable.style.display = "none";
exportTable.className = "report-export-table";

exportTable.innerHTML = `
    <thead>
        <tr>
            <th>Account Name</th>
            <th>Opening Balance</th>
            <th>Current Balance</th>
        </tr>
    </thead>

    <tbody>
        ${accountsSnapshot.docs.map((accountDoc) => {

            const account = accountDoc.data();

            const openingBalance =
                Number(account.openingBalance ?? 0);

            const currentBalance =
                Number(account.balance ?? 0);

            return `
                <tr>
                    <td>
                        ${account.name || "Unnamed Account"}
                    </td>

                    <td>
                        ₹ ${openingBalance.toFixed(2)}
                    </td>

                    <td>
                        ₹ ${currentBalance.toFixed(2)}
                    </td>
                </tr>
            `;

        }).join("")}

        <tr>
            <td>
                <strong>Total</strong>
            </td>

            <td>
                <strong>
                    ₹ ${totalOpeningBalance.toFixed(2)}
                </strong>
            </td>

            <td>
                <strong>
                    ₹ ${totalCurrentBalance.toFixed(2)}
                </strong>
            </td>
        </tr>
    </tbody>
`;

reportWorkArea
    .querySelector(".transaction-reports-container")
    .appendChild(exportTable);

        }

    }
);

}

const accountWiseTransactionsReport =
    document.querySelector(
        '[data-report="account-wise-transactions"]'
    );

console.log(
    "🔎 ACCOUNT-WISE TRANSACTIONS CARD:",
    accountWiseTransactionsReport
);

if (accountWiseTransactionsReport) {

    accountWiseTransactionsReport.addEventListener(
    "click",
    async () => {

            console.log(
                "📊 ACCOUNT-WISE TRANSACTIONS REPORT SELECTED"
            );

            // SET ACTIVE REPORT FOR GLOBAL HEADER / TOOLBAR
window.activeTransactionReport = {
    number: 31,
    name: "Transactions by Account"
};

            if (reportWorkArea) {

                reportWorkArea.innerHTML = `

                    <div class="transaction-reports-container">

                        <div class="transaction-reports-header">

                            <div>

                                <h2>
                                    📊 Account-wise Transactions
                                </h2>

                                <p>
                                    View account transactions like a bank statement
                                </p>

                            </div>

                        </div>


                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                    2fr 1fr 1fr 1fr;
                                gap:16px;
                                align-items:end;
                                margin-top:20px;
                                padding:18px;
                                background:#f8fafc;
                                border:1px solid #e2e8f0;
                                border-radius:12px;
                            "
                        >

                            <div>

                                <label
                                    style="
                                        display:block;
                                        margin-bottom:6px;
                                        font-weight:600;
                                    "
                                >
                                    Account
                                </label>

                                <select
                                    id="statementAccount"
                                    style="
                                        width:100%;
                                        padding:10px 12px;
                                        border:1px solid #cbd5e1;
                                        border-radius:8px;
                                        background:white;
                                    "
                                >

                                    <option value="">
                                        Select Account
                                    </option>

                                </select>

                            </div>


                            <div>

                                <label
                                    style="
                                        display:block;
                                        margin-bottom:6px;
                                        font-weight:600;
                                    "
                                >
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    id="statementFromDate"
                                    style="
                                        width:100%;
                                        padding:10px 12px;
                                        border:1px solid #cbd5e1;
                                        border-radius:8px;
                                    "
                                >

                            </div>


                            <div>

                                <label
                                    style="
                                        display:block;
                                        margin-bottom:6px;
                                        font-weight:600;
                                    "
                                >
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    id="statementToDate"
                                    style="
                                        width:100%;
                                        padding:10px 12px;
                                        border:1px solid #cbd5e1;
                                        border-radius:8px;
                                    "
                                >

                            </div>


                            <div>

                                <label
                                    style="
                                        display:block;
                                        margin-bottom:6px;
                                        font-weight:600;
                                    "
                                >
                                    Transaction Type
                                </label>

                                <select
                                    id="statementType"
                                    style="
                                        width:100%;
                                        padding:10px 12px;
                                        border:1px solid #cbd5e1;
                                        border-radius:8px;
                                        background:white;
                                    "
                                >

                                    <option value="all">
                                        ALL
                                    </option>

                                    <option value="credit">
                                        CREDIT
                                    </option>

                                    <option value="debit">
                                        DEBIT
                                    </option>

                                </select>

                            </div>

                        </div>


<div
    id="accountStatementContainer"
    style="
        margin-top:20px;
        overflow-x:auto;
    "
>
    <div
        style="
            padding:20px;
            text-align:center;
            color:#64748b;
            background:#f8fafc;
            border:1px dashed #cbd5e1;
            border-radius:10px;
        "
    >
        Select account and date range
        to view transactions.
    </div>
</div>


                    </div>

                `;

                const statementAccount =
                    document.querySelector("#statementAccount");

statementAccount.addEventListener(
    "change",
    async () => {
        const selectedAccountId =
            statementAccount.value;

        console.log(
            "🏦 SELECTED ACCOUNT ID:",
            selectedAccountId
        );

        if (!selectedAccountId) return;

        const user = auth.currentUser;

        if (!user) {
            console.log(
                "❌ NO LOGGED-IN USER"
            );
            return;
        }

        // =========================================
        // LOAD TRANSACTIONS + ACCOUNTS
        // =========================================

        const [
            transactionsSnapshot,
            accountsSnapshot
        ] = await Promise.all([
            getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            ),

            getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "accounts"
                )
            )
        ]);

        console.log(
            "💳 TOTAL TRANSACTIONS:",
            transactionsSnapshot.size
        );

        console.log(
            "🏦 TOTAL ACCOUNTS:",
            accountsSnapshot.size
        );

        // =========================================
        // ACCOUNT NAME MAP
        // =========================================

        const accountNameMap = new Map();

        accountsSnapshot.forEach(
            (accountDoc) => {
                const account =
                    accountDoc.data();

                accountNameMap.set(
                    accountDoc.id,
                    account.name ||
                    account.accountName ||
                    "Unnamed Account"
                );
            }
        );

        // =========================================
        // DATE / TYPE FILTERS
        // =========================================

        const statementFromDate =
            document.querySelector(
                "#statementFromDate"
            );

        const statementToDate =
            document.querySelector(
                "#statementToDate"
            );

        const statementType =
            document.querySelector(
                "#statementType"
            );

        const fromDate =
            statementFromDate
                ? statementFromDate.value
                : "";

        const toDate =
            statementToDate
                ? statementToDate.value
                : "";

        const selectedType =
            statementType
                ? statementType.value
                : "all";

        const isAllAccounts =
            selectedAccountId === "all";

        console.log(
            "📅 STATEMENT DATE RANGE:",
            fromDate,
            "TO",
            toDate
        );

        console.log(
            "🔄 STATEMENT TYPE:",
            selectedType
        );

        console.log(
            "🏦 ALL ACCOUNTS MODE:",
            isAllAccounts
        );

        // =========================================
        // FILTERED / LEDGER TRANSACTIONS
        // =========================================

        const filteredTransactions = [];

        // =========================================
        // NORMALIZE ACCOUNT ID
        // =========================================

        function resolveAccountId(value) {
            if (!value) return "";

            if (
                typeof value === "object"
            ) {
                return String(
                    value.id ||
                    value.accountId ||
                    value.uid ||
                    ""
                );
            }

            return String(value);
        }

        // =========================================
        // ADD ONE ACCOUNT-SIDE LEDGER ROW
        // =========================================

        function addLedgerRow(
            transactionDoc,
            transaction,
            accountId,
            transactionType
        ) {
            if (!accountId) return;

            // CREDIT / DEBIT FILTER
            if (
                selectedType !== "all" &&
                transactionType !== selectedType
            ) {
                return;
            }

            filteredTransactions.push({
                id: transactionDoc.id,

                ...transaction,

                // IMPORTANT:
                // Account represented by this row
                statementAccountId:
                    accountId,

                statementAccountName:
                    accountNameMap.get(
                        accountId
                    ) ||
                    "Unknown Account",

                // CREDIT / DEBIT determined
                // ONLY from FROM / TO ACCOUNT
                transactionType
            });
        }

        // =========================================
        // PROCESS EVERY TRANSACTION
        // =========================================

        transactionsSnapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();

                // ---------------------------------
                // IGNORE SOFT DELETED TRANSACTIONS
                // ---------------------------------

                if (
                    transaction.deleted === true
                ) {
                    return;
                }

                // ---------------------------------
                // ACCOUNT IDS
                // ---------------------------------

                const fromAccountId =
                    resolveAccountId(
                        transaction.fromAccountId
                    );

                const toAccountId =
                    resolveAccountId(
                        transaction.toAccountId
                    );

                const transactionDate =
                    transaction.date || "";

                // ---------------------------------
                // DATE FILTER
                // ---------------------------------

                if (
                    fromDate &&
                    transactionDate < fromDate
                ) {
                    return;
                }

                if (
                    toDate &&
                    transactionDate > toDate
                ) {
                    return;
                }

                // =================================
                // ALL ACCOUNTS MODE
                // =================================

                if (isAllAccounts) {

                    // ---------------------------------
                    // TRANSFER:
                    // FROM ACCOUNT = DEBIT
                    // TO ACCOUNT   = CREDIT
                    // ---------------------------------

                    if (
                        fromAccountId &&
                        toAccountId &&
                        fromAccountId !==
                            toAccountId
                    ) {

                        addLedgerRow(
                            transactionDoc,
                            transaction,
                            fromAccountId,
                            "debit"
                        );

                        addLedgerRow(
                            transactionDoc,
                            transaction,
                            toAccountId,
                            "credit"
                        );

                        return;
                    }

                    // ---------------------------------
                    // ONLY FROM ACCOUNT
                    // = DEBIT
                    // ---------------------------------

                    if (fromAccountId) {

                        addLedgerRow(
                            transactionDoc,
                            transaction,
                            fromAccountId,
                            "debit"
                        );

                        return;
                    }

                    // ---------------------------------
                    // ONLY TO ACCOUNT
                    // = CREDIT
                    // ---------------------------------

                    if (toAccountId) {

                        addLedgerRow(
                            transactionDoc,
                            transaction,
                            toAccountId,
                            "credit"
                        );

                        return;
                    }

                    // No account attached
                    return;
                }

                // =================================
                // SINGLE ACCOUNT MODE
                // =================================

                const accountMatches =
                    fromAccountId ===
                        selectedAccountId ||
                    toAccountId ===
                        selectedAccountId;

                if (!accountMatches) {
                    return;
                }

                // ---------------------------------
                // CREDIT / DEBIT
                // BASED ONLY ON FROM / TO ACCOUNT
                // ---------------------------------

                let transactionType =
                    "neutral";

                if (
                    toAccountId ===
                        selectedAccountId &&
                    fromAccountId !==
                        selectedAccountId
                ) {
                    transactionType =
                        "credit";
                }

                if (
                    fromAccountId ===
                        selectedAccountId &&
                    toAccountId !==
                        selectedAccountId
                ) {
                    transactionType =
                        "debit";
                }

                // ---------------------------------
                // APPLY CREDIT / DEBIT FILTER
                // ---------------------------------

                if (
                    selectedType !== "all" &&
                    transactionType !==
                        selectedType
                ) {
                    return;
                }

                filteredTransactions.push({
                    id: transactionDoc.id,

                    ...transaction,

                    statementAccountId:
                        selectedAccountId,

                    statementAccountName:
                        accountNameMap.get(
                            selectedAccountId
                        ) ||
                        "Unknown Account",

                    transactionType
                });
            }
        );

        console.log(
            "📊 FILTERED ACCOUNT TRANSACTIONS:",
            filteredTransactions.length
        );

        console.log(
            "📋 FILTERED TRANSACTIONS DATA:",
            filteredTransactions
        );

        // =========================================
        // STATEMENT CONTAINER
        // =========================================

        const statementContainer =
            document.querySelector(
                "#accountStatementContainer"
            );

        if (!statementContainer) {

            console.log(
                "❌ ACCOUNT STATEMENT CONTAINER NOT FOUND"
            );

            return;
        }

        // =========================================
        // NO DATA
        // =========================================

        if (
            filteredTransactions.length === 0
        ) {

            statementContainer.innerHTML = `
                <div
                    style="
                        padding:20px;
                        text-align:center;
                        color:#777;
                    "
                >
                    No transactions found
                    for the selected filters.
                </div>
            `;

            return;
        }

        // =========================================
        // SORT BY DATE
        // =========================================

        filteredTransactions.sort(
            (a, b) =>
                String(a.date || "")
                    .localeCompare(
                        String(b.date || "")
                    )
        );

        // =========================================
        // RUNNING BALANCE PER ACCOUNT
        // =========================================

        const runningBalances =
            new Map();

        let rows = "";

        // =========================================
        // BUILD TABLE ROWS
        // =========================================

        filteredTransactions.forEach(
            (transaction) => {

                const amount =
                    Number(
                        transaction.amount ?? 0
                    );

                const isCredit =
                    transaction.transactionType ===
                    "credit";

                const isDebit =
                    transaction.transactionType ===
                    "debit";

                const accountId =
                    transaction.statementAccountId;

                // ---------------------------------
                // CURRENT ACCOUNT BALANCE
                // ---------------------------------

                let runningBalance =
                    runningBalances.get(
                        accountId
                    ) ?? 0;

                if (isCredit) {
                    runningBalance += amount;
                }

                if (isDebit) {
                    runningBalance -= amount;
                }

                runningBalances.set(
                    accountId,
                    runningBalance
                );

                // ---------------------------------
                // DESCRIPTION
                // ---------------------------------

                const description =
                    transaction.notes ||
                    transaction.category ||
                    transaction.partyName ||
                    transaction.investmentName ||
                    transaction.type ||
                    "-";

                // ---------------------------------
                // FORMAT AMOUNT
                // ---------------------------------

                const formattedAmount =
                    amount.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

                const formattedBalance =
                    runningBalance.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

                // ---------------------------------
                // TABLE ROW
                // ---------------------------------

                rows += `
                    <tr>

                        <td
                            style="
                                padding:10px;
                                border-bottom:1px solid #eee;
                            "
                        >
                            ${
                                transaction.date
                                    ? transaction.date
                                        .split("-")
                                        .reverse()
                                        .join("-")
                                    : "-"
                            }
                        </td>

                        <td
                            style="
                                padding:10px;
                                border-bottom:1px solid #eee;
                                font-weight:600;
                            "
                        >
                            ${
                                transaction.statementAccountName ||
                                "-"
                            }
                        </td>

                        <td
                            style="
                                padding:10px;
                                border-bottom:1px solid #eee;
                            "
                        >
                            ${description}
                        </td>

                        <td
                            style="
                                padding:10px;
                                border-bottom:1px solid #eee;
                            "
                        >
                            ${
                                transaction.type ||
                                "-"
                            }
                        </td>

                        <td
                            style="
                                padding:10px;
                                text-align:right;
                                border-bottom:1px solid #eee;
                                color:#b42318;
                                font-weight:600;
                            "
                        >
                            ${
                                isDebit
                                    ? "₹" +
                                      formattedAmount
                                    : "-"
                            }
                        </td>

                        <td
                            style="
                                padding:10px;
                                text-align:right;
                                border-bottom:1px solid #eee;
                                color:#067647;
                                font-weight:600;
                            "
                        >
                            ${
                                isCredit
                                    ? "₹" +
                                      formattedAmount
                                    : "-"
                            }
                        </td>

                        <td
                            style="
                                padding:10px;
                                text-align:right;
                                border-bottom:1px solid #eee;
                                font-weight:600;
                            "
                        >
                            ₹${formattedBalance}
                        </td>

                    </tr>
                `;
            }
        );

        // =========================================
        // FINAL TABLE
        // =========================================

        statementContainer.innerHTML = `
            <div
                style="
                    margin-top:20px;
                    overflow-x:auto;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        font-size:14px;
                        min-width:950px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#f5f5f5;
                            "
                        >

                            <th
                                style="
                                    padding:10px;
                                    text-align:left;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Date
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:left;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Account
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:left;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Description
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:left;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Type
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:right;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Debit
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:right;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Credit
                            </th>

                            <th
                                style="
                                    padding:10px;
                                    text-align:right;
                                    border-bottom:1px solid #ddd;
                                "
                            >
                                Balance
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>
        `;

        // =====================================================
// EXPORT TABLE — ACCOUNT-WISE TRANSACTIONS
// Creates a real HTML table for PDF / Excel / Print
// =====================================================

const exportTable = document.createElement("table");

exportTable.style.display = "none";
exportTable.className = "report-export-table";

exportTable.innerHTML = `
    <thead>
        <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Description</th>
            <th>Type</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
        </tr>
    </thead>

    <tbody>
        ${rows}
    </tbody>
`;

statementContainer
    .closest(".transaction-reports-container")
    .appendChild(exportTable);

    }
);

                const statementFromDate =
                    document.querySelector("#statementFromDate");

                const statementToDate =
                    document.querySelector("#statementToDate");

                if (statementFromDate) {

                    statementFromDate.addEventListener(
                        "change",
                        () => {

                            console.log(
                                "📅 FROM DATE CHANGED:",
                                statementFromDate.value
                            );

                            statementAccount.dispatchEvent(
                                new Event("change")
                            );

                        }
                    );

                }

                if (statementToDate) {

                    statementToDate.addEventListener(
                        "change",
                        () => {

                            console.log(
                                "📅 TO DATE CHANGED:",
                                statementToDate.value
                            );

                            statementAccount.dispatchEvent(
                                new Event("change")
                            );

                        }
                    );

                }

                const statementType =
    document.querySelector("#statementType");

if (statementType) {
    statementType.addEventListener(
        "change",
        () => {
            console.log(
                "🔄 TRANSACTION TYPE CHANGED:",
                statementType.value
            );

            if (!statementAccount?.value) return;

            statementAccount.dispatchEvent(
                new Event("change")
            );
        }
    );
}
                console.log(
                    "🔎 STATEMENT ACCOUNT SELECT:",
                    statementAccount
                );

                const user = auth.currentUser;

                if (user && statementAccount) {

                    const accountsSnapshot =
                        await getDocs(
                            collection(
                                db,
                                "users",
                                user.uid,
                                "accounts"
                            )
                        );

                    console.log(
                        "🏦 STATEMENT ACCOUNTS COUNT:",
                        accountsSnapshot.size
                    );

// ADD ALL ACCOUNTS OPTION
const allOption = document.createElement("option");
allOption.value = "all";
allOption.textContent = "ALL";
statementAccount.appendChild(allOption);

                    accountsSnapshot.forEach(
                        (accountDoc) => {

                            const account =
                                accountDoc.data();

                            console.log(
                                "🏦 STATEMENT ACCOUNT:",
                                accountDoc.id,
                                account
                            );

                            const option =
                                document.createElement("option");

                            option.value =
                                accountDoc.id;

                            option.textContent =
                                account.name ||
                                "Unnamed Account";

                            statementAccount.appendChild(
                                option
                            );

                        }
                    );

                }

            }

        }
    );

}
console.log(
    "🔎 ALL ACCOUNTS CARD:",
    allAccountsReport
);

if (allAccountsReport) {

    console.log(
        "✅ ALL ACCOUNTS CARD FOUND"
    );

allAccountsReport.addEventListener(
    "click",
    async () => {

            console.log(
                "🏦 ALL ACCOUNTS REPORT SELECTED"
            );

            // SET ACTIVE REPORT FOR GLOBAL HEADER / TOOLBAR
window.activeTransactionReport = {
    number: 1,
    name: "All Accounts"
};

            const user = auth.currentUser;

console.log(
    "👤 REPORT USER:",
    user
);


if (user) {

    const accountsSnapshot =
        await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            )
        );

    console.log(
        "🏦 ACCOUNTS COUNT:",
        accountsSnapshot.size
    );

    const header = document.createElement("div");

header.style.display = "grid";
header.style.gridTemplateColumns = "2fr 1fr 1fr";
header.style.alignItems = "center";
header.style.padding = "10px 16px";
header.style.background = "#f1f5f9";
header.style.borderBottom = "2px solid #cbd5e1";
header.style.fontWeight = "600";
header.style.fontSize = "13px";

header.innerHTML = `
    <div>Account Name</div>
    <div>Account Type</div>
    <div style="text-align:right;">Balance</div>
`;

reportWorkArea.appendChild(header);
let totalBalance = 0;
    accountsSnapshot.forEach(
    (accountDoc) => {

        const account = accountDoc.data();

        console.log(
            "🏦 ACCOUNT:",
            accountDoc.id,
            account
        );

const row = document.createElement("div");

row.style.display = "grid";
row.style.gridTemplateColumns = "2fr 1fr 1fr";
row.style.alignItems = "center";
row.style.padding = "12px 16px";
row.style.borderBottom = "1px solid #ddd";
row.style.fontSize = "14px";

const numericBalance =
    Number(account.balance ?? 0);

totalBalance += numericBalance;

const balance =
    numericBalance.toFixed(2);

row.innerHTML = `
    <div>
        <strong>${account.name || "Unnamed Account"}</strong>
    </div>

    <div>
        ${account.type || "-"}
    </div>

    <div style="text-align:right;">
        ₹ ${balance}
    </div>
`;

reportWorkArea.appendChild(row);

    }
);

const totalRow = document.createElement("div");

totalRow.style.display = "grid";
totalRow.style.gridTemplateColumns = "2fr 1fr 1fr";
totalRow.style.alignItems = "center";
totalRow.style.padding = "13px 16px";
totalRow.style.marginTop = "2px";
totalRow.style.background = "#eef2ff";
totalRow.style.borderTop = "2px solid #94a3b8";
totalRow.style.fontWeight = "700";
totalRow.style.fontSize = "14px";

totalRow.innerHTML = `
    <div>Grand Total</div>

    <div></div>

    <div style="text-align:right;">
        ₹ ${totalBalance.toFixed(2)}
    </div>
`;

reportWorkArea.appendChild(totalRow);
// =====================================================
// EXPORT TABLE — ALL ACCOUNTS
// Creates a real HTML table for PDF / Excel / Print
// =====================================================

const exportTable = document.createElement("table");

exportTable.style.display = "none";
exportTable.className = "report-export-table";

exportTable.innerHTML = `
    <thead>
        <tr>
            <th>Account Name</th>
            <th>Account Type</th>
            <th>Balance</th>
        </tr>
    </thead>

    <tbody>
        ${accountsSnapshot.docs.map((accountDoc) => {

            const account = accountDoc.data();

            const balance =
                Number(account.balance ?? 0);

            return `
                <tr>
                    <td>
                        ${account.name || "Unnamed Account"}
                    </td>

                    <td>
                        ${account.type || "-"}
                    </td>

                    <td>
                        ₹ ${balance.toFixed(2)}
                    </td>
                </tr>
            `;

        }).join("")}

        <tr>
            <td><strong>Grand Total</strong></td>
            <td></td>
            <td>
                <strong>
                    ₹ ${totalBalance.toFixed(2)}
                </strong>
            </td>
        </tr>
    </tbody>
`;

reportWorkArea
    .querySelector(".transaction-reports-container")
    .appendChild(exportTable);

}

        }
    );


}

    }

}

    });

});

    // =====================================================
    // OPEN A CATEGORY DIRECTLY FROM AN ERP MODULE BUTTON
    // Transactions has the existing detailed report catalogue.
    // Other categories are selected and clearly indicate their
    // reports can be added without pretending they already exist.
    // =====================================================
    const requestedCategory = new URLSearchParams(window.location.search)
        .get("category");

    if (requestedCategory) {
        const categoryMap = {
            transactions: "Transactions",
            accounts: "Accounts",
            investments: "Investments",
            loans: "Loans & Borrowings",
            assets: "Assets",
            liabilities: "Liabilities",
            "net-worth": "Net Worth",
            "income-expenses": "Income & Expenses"
        };

        const requestedTitle = categoryMap[requestedCategory] || "Transactions";
const requestedCard = Array.from(categoryCards).find(
    card => getReportCategoryKey(card) === requestedTitle
);

        if (requestedCard) {
            requestedCard.classList.add("report-category-card-selected");

if (requestedTitle === "Transactions") {
    hideReportModuleStartPage();
    renderTransactionReports();
}


            else if (reportWorkArea) {
                reportWorkArea.innerHTML = `
                    <div class="transaction-reports-container">
                        <div class="transaction-reports-header">
                            <div>
                                <h2>${requestedTitle} Reports</h2>
                                <p>This category is selected. Detailed reports for this category can be added here next.</p>
                            </div>
                        </div>
                    </div>
                `;
                reportWorkArea.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }



const reportNumberFromUrl = Number(
    new URLSearchParams(window.location.search).get("report")
);

if (reportNumberFromUrl) {
    const reportToOpen = transactionReports.find(
        report => report.number === reportNumberFromUrl
    );

    if (reportToOpen) {
        const transactionsCategory = Array.from(categoryCards).find(
    card =>
        getReportCategoryKey(card) === "Transactions"
);

        if (transactionsCategory) {
            renderTransactionReports();
            hideReportModuleStartPage();
            renderSelectedReport(reportToOpen);
        }
    }
}


    // =====================================================
    // TRANSACTION REPORT LIST
    // =====================================================

    function renderTransactionReports() {

    hideReportModuleStartPage();

    reportWorkArea.style.display = "block";

    reportWorkArea.innerHTML = `

            <div class="transaction-reports-container">

                <div class="transaction-reports-header">

                    <div>

                        <h2>
                            Transaction Reports
                        </h2>

                        <p>
                            Complete transaction reporting
                            and analysis
                        </p>

                    </div>


                    <div class="transaction-report-count">
                        ${transactionReports.length}
                    </div>

                </div>


                <div
                    class="transaction-reports-grid"
                    id="transactionReportsGrid"
                >

                    ${transactionReports.map(report => `

                        <button
                            type="button"
                            class="transaction-report-card"
                            data-report-number="${report.number}"
                        >

                            <div class="transaction-report-number">
                                #${report.number}
                            </div>


                            <div class="transaction-report-info">

                                <div class="transaction-report-name">
                                    ${report.name}
                                </div>

                                <div class="transaction-report-status">
                                    Planned
                                </div>

                            </div>


                            <div class="transaction-report-arrow">
                                →
                            </div>

                        </button>

                    `).join("")}

                </div>

            </div>

        `;


        // =================================================
        // REPORT CARD EVENTS
        // =================================================

        const reportCards =
            document.querySelectorAll(
                ".transaction-report-card"
            );


        reportCards.forEach(card => {

            card.addEventListener("click", () => {

                const reportNumber =
                    Number(
                        card.dataset.reportNumber
                    );


                const selectedReport =
                    transactionReports.find(
                        report =>
                            report.number === reportNumber
                    );


               if (selectedReport) {

    // =========================================
    // OPEN REPORT AS A SEPARATE SCREEN
    // =========================================

    hideReportModuleStartPage();


    renderSelectedReport(
        selectedReport
    );

}

            });

        });

    }

    async function renderAllTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #16 All Transactions
                        </strong>

                        <span>
                            <strong>Reporting Period:</strong>
                            All Transactions
                        </span>

                    </div>

                </div>


                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="allTransactionsReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        ⏳ Loading transactions...
                    </div>

                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );

if (backButton) {
    backButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        hideReportModuleStartPage();
        renderTransactionReports();
    };
}

    // =====================================================
    // CHECK USER
    // =====================================================

    if (!currentUser) {

        const content =
            document.getElementById(
                "allTransactionsReportContent"
            );

        if (content) {

            content.innerHTML = `
                <div style="
                    padding:30px;
                    color:#b45309;
                ">
                    ⚠️ User is not logged in.
                </div>
            `;

        }

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
    (transactionDoc) => {

        const transaction =
            transactionDoc.data();


        // =========================================
        // IGNORE SOFT-DELETED TRANSACTIONS
        // =========================================

        if (transaction.deleted === true) {

            return;

        }


        transactions.push({

            id:
                transactionDoc.id,

            ...transaction

        });

    }
);

// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

transactions.sort(
    (a, b) =>
        String(
            a.date || ""
        ).localeCompare(
            String(
                b.date || ""
            )
        )
);


        const content =
            document.getElementById(
                "allTransactionsReportContent"
            );


        if (!content) return;


        if (!transactions.length) {

            content.innerHTML = `
                <div style="
                    padding:40px;
                    text-align:center;
                    color:#7b8ba1;
                ">
                    📭 No transactions found.
                </div>
            `;

            return;

        }


        // =================================================
        // REPORT TABLE
        // =================================================

        content.innerHTML = `

            <div style="
                overflow-x:auto;
                border:1px solid #dce5f0;
                border-radius:12px;
            ">

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th style="padding:11px;">
                                Date
                            </th>

                            <th style="padding:11px;">
                                Type
                            </th>

                            <th style="padding:11px;">
                                Category
                            </th>

                            <th style="padding:11px;">
                                Party
                            </th>

                            <th style="padding:11px;text-align:right;">
                                Amount
                            </th>

                            <th style="padding:11px;">
                                Payment Method
                            </th>

                            <th style="padding:11px;">
                                Linked Module
                            </th>

                            <th style="padding:11px;">
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            transactions
                                .map(
                                    (
                                        transaction
                                    ) => `

                                <tr
                                    style="
                                        border-bottom:1px solid #e5ebf3;
                                    "
                                >

                                    <td style="padding:10px;">
    ${
        formatReportDate(
            transaction.date
        )
    }
</td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.type
                                            || "—"
                                        }
                                    </td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.category
                                            || "—"
                                        }
                                    </td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.partyName
                                            || "—"
                                        }
                                    </td>

                                    <td
                                        style="
                                            padding:10px;
                                            text-align:right;
                                            font-weight:700;
                                        "
                                    >
                                        ₹${
                                            Number(
                                                transaction.amount
                                                || 0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits:2
                                                }
                                            )
                                        }
                                    </td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.paymentMethod
                                            || "—"
                                        }
                                    </td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.linkedModule
                                            || "—"
                                        }
                                    </td>

                                    <td style="padding:10px;">
                                        ${
                                            transaction.notes
                                            || "—"
                                        }
                                    </td>

                                </tr>

                            `
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>


            <div
    style="
        margin-top:16px;
        padding:14px 18px;
        border:1px solid #dce5f0;
        border-radius:10px;
        background:#f8fbff;
        display:flex;
        justify-content:flex-end;
        align-items:center;
        gap:25px;
        flex-wrap:wrap;
    "
>

    <div
        style="
            color:#64748b;
            font-size:12px;
        "
    >
        Total Transactions:
        <strong
            style="
                color:#173b70;
                margin-left:5px;
            "
        >
            ${transactions.length}
        </strong>
    </div>


    <div
        style="
            color:#173b70;
            font-size:14px;
            font-weight:700;
        "
    >
        Total Amount:

        <strong
            style="
                color:#087443;
                font-size:17px;
                margin-left:6px;
            "
        >
            ₹${
                transactions
                    .reduce(
                        (
                            total,
                            transaction
                        ) =>
                            total +
                            Number(
                                transaction.amount ||
                                0
                            ),
                        0
                    )
                    .toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )
            }
        </strong>

    </div>

</div>

        `;


    } catch (error) {

        console.error(
            "❌ All Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "allTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `
                <div style="
                    padding:30px;
                    color:#b00020;
                ">
                    ❌ Unable to load transactions.
                    <br>
                    Please check Console.
                </div>
            `;

        }

    }

}

async function renderDateWiseTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <!-- REPORT HEADER -->

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            gap:20px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <div>

                            <strong
                                style="
                                    font-size:22px;
                                "
                            >
                                #17 Date-wise Transactions
                            </strong>

                            <div
                                style="
                                    margin-top:5px;
                                    color:#7b8ba1;
                                    font-size:12px;
                                "
                            >
                                Select a date range to generate
                                the transaction report
                            </div>

                        </div>

                    </div>

                </div>


                <!-- DATE FILTER -->

                <div
                    style="
                        padding:20px 30px;
                        border-bottom:1px solid #e2e8f0;
                        background:#f8fbff;
                    "
                >

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                1fr 1fr auto auto;
                            gap:14px;
                            align-items:end;
                        "
                    >

                        <div>

                            <label
                                style="
                                    display:block;
                                    margin-bottom:6px;
                                    font-size:12px;
                                    font-weight:700;
                                    color:#475569;
                                "
                            >
                                From Date
                            </label>

                            <input
                                type="date"
                                id="dateWiseFromDate"
                                style="
                                    width:100%;
                                    min-height:40px;
                                    padding:8px 10px;
                                    border:1px solid #cbd5e1;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <div>

                            <label
                                style="
                                    display:block;
                                    margin-bottom:6px;
                                    font-size:12px;
                                    font-weight:700;
                                    color:#475569;
                                "
                            >
                                To Date
                            </label>

                            <input
                                type="date"
                                id="dateWiseToDate"
                                style="
                                    width:100%;
                                    min-height:40px;
                                    padding:8px 10px;
                                    border:1px solid #cbd5e1;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <button
                            type="button"
                            id="applyDateWiseReport"
                            style="
                                min-height:40px;
                                padding:8px 18px;
                                border:none;
                                border-radius:7px;
                                background:#2563eb;
                                color:#ffffff;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            📊 Apply Report
                        </button>


                        <button
                            type="button"
                            id="resetDateWiseReport"
                            style="
                                min-height:40px;
                                padding:8px 18px;
                                border:1px solid #94a3b8;
                                border-radius:7px;
                                background:#ffffff;
                                color:#475569;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            ↺ Reset
                        </button>

                    </div>

                </div>


                <!-- REPORT CONTENT -->

                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="dateWiseReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        📅 Select From Date and To Date
                    </div>

                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


if (backButton) {
    backButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        hideReportModuleStartPage();
        renderTransactionReports();
    };
}

    // =====================================================
    // APPLY REPORT
    // =====================================================

    const applyButton =
        document.getElementById(
            "applyDateWiseReport"
        );


    if (applyButton) {

        applyButton.addEventListener(
            "click",
            async () => {

                const fromDate =
                    document.getElementById(
                        "dateWiseFromDate"
                    )?.value || "";


                const toDate =
                    document.getElementById(
                        "dateWiseToDate"
                    )?.value || "";


                const content =
                    document.getElementById(
                        "dateWiseReportContent"
                    );


                // -----------------------------------------
                // VALIDATION
                // -----------------------------------------

                if (!fromDate || !toDate) {

                    alert(
                        "Please select both From Date and To Date."
                    );

                    return;

                }


                if (
                    fromDate >
                    toDate
                ) {

                    alert(
                        "From Date cannot be later than To Date."
                    );

                    return;

                }


                if (content) {

                    content.innerHTML = `
                        <div
                            style="
                                padding:40px;
                                color:#7b8ba1;
                            "
                        >
                            ⏳ Loading transactions...
                        </div>
                    `;

                }


                try {

                    // -------------------------------------
                    // FIRESTORE
                    // -------------------------------------

                    const transactionsRef =
                        collection(
                            db,
                            "users",
                            currentUser.uid,
                            "transactions"
                        );


                    const snapshot =
                        await getDocs(
                            transactionsRef
                        );


                    const transactions = [];


                    snapshot.forEach(
    transactionDoc => {

        const transaction =
            transactionDoc.data();


        // =========================================
        // IGNORE SOFT-DELETED TRANSACTIONS
        // =========================================

        if (transaction.deleted === true) {

            return;

        }


        const transactionDate =
            String(
                transaction.date ||
                ""
            );


        if (
            transactionDate >=
                fromDate
            &&
            transactionDate <=
                toDate
        ) {

            transactions.push(
                {
                    id:
                        transactionDoc.id,

                    ...transaction
                }
            );

        }

    }
);
                    // -------------------------------------
                    // SORT
                    // -------------------------------------

                    transactions.sort(
                        (a, b) =>
                            String(
                                a.date || ""
                            ).localeCompare(
                                String(
                                    b.date || ""
                                )
                            )
                    );


                    if (!content) return;


                    if (!transactions.length) {

                        content.innerHTML = `
                            <div
                                style="
                                    padding:40px;
                                    text-align:center;
                                    color:#7b8ba1;
                                "
                            >
                                📭 No transactions found
                                for the selected date range.
                            </div>
                        `;

                        return;

                    }


                    // -------------------------------------
                    // TABLE
                    // -------------------------------------

                    content.innerHTML = `

                        <div
                            style="
                                margin-bottom:14px;
                                color:#475569;
                                font-size:13px;
                            "
                        >

                            <strong>
                                Reporting Period:
                            </strong>

                            ${formatReportDate(fromDate)}
                            &nbsp; to &nbsp;
                            ${formatReportDate(toDate)}

                            <span
                                style="
                                    margin-left:15px;
                                    color:#2563eb;
                                    font-weight:700;
                                "
                            >
                                ${transactions.length}
                                Transactions
                            </span>

                        </div>


                        <div
                            style="
                                overflow-x:auto;
                                border:1px solid #dce5f0;
                                border-radius:12px;
                            "
                        >

                            <table
                                style="
                                    width:100%;
                                    border-collapse:collapse;
                                    background:#ffffff;
                                    font-size:13px;
                                "
                            >

                                <thead>

                                    <tr
                                        style="
                                            background:#173b70;
                                            color:#ffffff;
                                        "
                                    >

                                        <th style="padding:11px;">
                                            Date
                                        </th>

                                        <th style="padding:11px;">
                                            Type
                                        </th>

                                        <th style="padding:11px;">
                                            Category
                                        </th>

                                        <th style="padding:11px;">
                                            Party
                                        </th>

                                        <th
                                            style="
                                                padding:11px;
                                                text-align:right;
                                            "
                                        >
                                            Amount
                                        </th>

                                        <th style="padding:11px;">
                                            Payment Method
                                        </th>

                                        <th style="padding:11px;">
                                            Linked Module
                                        </th>

                                        <th style="padding:11px;">
                                            Notes
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${
                                        transactions
                                            .map(
                                                transaction => `

                                            <tr
                                                style="
                                                    border-bottom:
                                                        1px solid
                                                        #e5ebf3;
                                                "
                                            >

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        formatReportDate(
                                                            transaction.date
                                                        )
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.type
                                                        || "—"
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.category
                                                        || "—"
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.partyName
                                                        || "—"
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                        text-align:right;
                                                        font-weight:700;
                                                    "
                                                >
                                                    ₹${
                                                        Number(
                                                            transaction.amount
                                                            || 0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits:2
                                                            }
                                                        )
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.paymentMethod
                                                        || "—"
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.linkedModule
                                                        || "—"
                                                    }
                                                </td>

                                                <td
                                                    style="
                                                        padding:10px;
                                                    "
                                                >
                                                    ${
                                                        transaction.notes
                                                        || "—"
                                                    }
                                                </td>

                                            </tr>

                                        `
                                            )
                                            .join("")
                                    }

                                </tbody>

                                                </table>

                </div>


                <!-- =========================================
                     REPORT TOTAL
                ========================================== -->

                <div
                    style="
                        margin-top:16px;
                        padding:14px 18px;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                        display:flex;
                        justify-content:flex-end;
                        align-items:center;
                        gap:25px;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        style="
                            color:#64748b;
                            font-size:12px;
                        "
                    >
                        Total Transactions:

                        <strong
                            style="
                                color:#173b70;
                                margin-left:5px;
                            "
                        >
                            ${transactions.length}
                        </strong>
                    </div>


                    <div
                        style="
                            color:#173b70;
                            font-size:14px;
                            font-weight:700;
                        "
                    >
                        Total Amount:

                        <strong
                            style="
                                color:#087443;
                                font-size:17px;
                                margin-left:6px;
                            "
                        >
                            ₹${
                                transactions
                                    .reduce(
                                        (
                                            total,
                                            transaction
                                        ) =>
                                            total +
                                            Number(
                                                transaction.amount ||
                                                0
                                            ),
                                        0
                                    )
                                    .toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )
                            }
                        </strong>

                    </div>

                </div>


            `;

                } catch (error) {

                    console.error(
                        "❌ Date-wise Report Error:",
                        error
                    );


                    if (content) {

                        content.innerHTML = `
                            <div
                                style="
                                    padding:30px;
                                    color:#b00020;
                                "
                            >
                                ❌ Unable to load
                                transactions.
                                <br>
                                Please check Console.
                            </div>
                        `;

                    }

                }

            }
        );

    }


    // =====================================================
    // RESET
    // =====================================================

    const resetButton =
        document.getElementById(
            "resetDateWiseReport"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "dateWiseFromDate"
                ).value = "";


                document.getElementById(
                    "dateWiseToDate"
                ).value = "";


                document.getElementById(
                    "dateWiseReportContent"
                ).innerHTML = `
                    <div
                        style="
                            padding:40px;
                            text-align:center;
                            color:#7b8ba1;
                        "
                    >
                        📅 Select From Date and To Date
                    </div>
                `;

            }
        );

    }

}

// =========================================================
// #18 MONTH-WISE TRANSACTIONS
// =========================================================

async function renderMonthWiseTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <!-- =====================================
                     REPORT TITLE
                ====================================== -->

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #18 Month-wise Transactions
                        </strong>

                    </div>

                </div>


                <!-- =====================================
                     FILTER AREA
                ====================================== -->

                <div
                    style="
                        padding:20px 30px;
                        background:#f8fbff;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:end;
                            gap:16px;
                            flex-wrap:wrap;
                        "
                    >

                        <div>

                            <label
                                style="
                                    display:block;
                                    margin-bottom:6px;
                                    font-size:12px;
                                    font-weight:700;
                                    color:#173b70;
                                "
                            >
                                Select Year
                            </label>

                            <select
                                id="monthWiseYear"
                                style="
                                    min-width:170px;
                                    padding:10px 12px;
                                    border:1px solid #cbd5e1;
                                    border-radius:8px;
                                    background:white;
                                    font-size:13px;
                                "
                            ></select>

                        </div>


                        <button
                            type="button"
                            id="applyMonthWiseReport"
                            style="
                                padding:10px 20px;
                                border:none;
                                border-radius:8px;
                                background:#173b70;
                                color:white;
                                font-size:13px;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            Apply Report
                        </button>


                        <button
                            type="button"
                            id="resetMonthWiseReport"
                            style="
                                padding:10px 20px;
                                border:1px solid #cbd5e1;
                                border-radius:8px;
                                background:white;
                                color:#173b70;
                                font-size:13px;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            Reset
                        </button>

                    </div>

                </div>


                <!-- =====================================
                     REPORT CONTENT
                ====================================== -->

                <div
                    id="monthWiseReportContent"
                    style="
                        padding:25px 30px;
                        min-height:420px;
                    "
                >

                    <div
                        style="
                            text-align:center;
                            padding:60px 20px;
                            color:#64748b;
                        "
                    >
                        Select a year and click
                        <strong>Apply Report</strong>.
                    </div>

                </div>


                <!-- =====================================
                     GENERATED DATE
                ====================================== -->

                <div
                    style="
                        padding:8px 30px;
                        border-top:1px solid #d9e1ec;
                        text-align:right;
                        font-size:10px;
                        color:#7a8798;
                    "
                >
                    Generated:
                    ${formatToday()}
                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


if (backButton) {
    backButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        hideReportModuleStartPage();
        renderTransactionReports();
    };
}



    // =====================================================
    // YEAR DROPDOWN
    // =====================================================

    const yearSelect =
        document.getElementById(
            "monthWiseYear"
        );


    const currentYear =
        new Date().getFullYear();


    for (
        let year = currentYear;
        year >= currentYear - 10;
        year--
    ) {

        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;

        if (year === currentYear) {

            option.selected = true;

        }

        yearSelect.appendChild(option);

    }


    // =====================================================
    // BUTTONS
    // =====================================================

    document
        .getElementById("applyMonthWiseReport")
        ?.addEventListener(
            "click",
            loadMonthWiseReport
        );


    document
        .getElementById("resetMonthWiseReport")
        ?.addEventListener(
            "click",
            () => {

                yearSelect.value =
                    currentYear;

                loadMonthWiseReport();

            }
        );


    // =====================================================
    // LOAD REPORT
    // =====================================================

    async function loadMonthWiseReport() {

        const selectedYear =
            Number(yearSelect.value);


        const content =
            document.getElementById(
                "monthWiseReportContent"
            );


        if (!content) return;


        content.innerHTML = `
            <div
                style="
                    padding:50px;
                    text-align:center;
                    color:#64748b;
                    font-size:13px;
                "
            >
                Loading report...
            </div>
        `;


        try {

            if (!currentUser) {

                throw new Error(
                    "User is not logged in."
                );

            }


            // =============================================
            // FIRESTORE TRANSACTIONS
            // =============================================

            const transactionsRef =
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "transactions"
                );


            const snapshot =
                await getDocs(
                    transactionsRef
                );


            const transactions = [];


            snapshot.forEach(doc => {

    const transaction =
        doc.data();


    // =========================================
    // IGNORE SOFT-DELETED TRANSACTIONS
    // =========================================

    if (transaction.deleted === true) {

        return;

    }


    transactions.push(transaction);

});

            // =============================================
            // MONTH TOTALS
            // =============================================

            const monthTotals = {};

            for (
                let month = 1;
                month <= 12;
                month++
            ) {

                monthTotals[month] = {

                    count: 0,

                    amount: 0

                };

            }


            // =============================================
            // FILTER + GROUP
            // =============================================

            transactions.forEach(
                transaction => {

                    const rawDate =
                        transaction.date;

                    if (!rawDate) return;


                    let dateObject = null;


                    // YYYY-MM-DD
                    if (
                        /^\d{4}-\d{2}-\d{2}$/
                            .test(rawDate)
                    ) {

                        const parts =
                            rawDate.split("-");

                        dateObject =
                            new Date(
                                Number(parts[0]),
                                Number(parts[1]) - 1,
                                Number(parts[2])
                            );

                    }


                    // DD-MM-YYYY
                    else if (
                        /^\d{2}-\d{2}-\d{4}$/
                            .test(rawDate)
                    ) {

                        const parts =
                            rawDate.split("-");

                        dateObject =
                            new Date(
                                Number(parts[2]),
                                Number(parts[1]) - 1,
                                Number(parts[0])
                            );

                    }


                    else {

                        const parsed =
                            new Date(rawDate);

                        if (
                            !isNaN(parsed.getTime())
                        ) {

                            dateObject = parsed;

                        }

                    }


                    if (!dateObject) return;


                    const transactionYear =
                        dateObject.getFullYear();


                    if (
                        transactionYear !==
                        selectedYear
                    ) {

                        return;

                    }


                    const monthNumber =
                        dateObject.getMonth() + 1;


                    monthTotals[
                        monthNumber
                    ].count += 1;


                    monthTotals[
                        monthNumber
                    ].amount +=
                        Number(
                            transaction.amount || 0
                        );

                }
            );


            // =============================================
            // MONTH NAMES
            // =============================================

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


            // =============================================
            // REPORT TABLE
            // =============================================

            let totalTransactions = 0;

            let totalAmount = 0;


            const rows =
                monthNames.map(
                    (monthName, index) => {

                        const monthNumber =
                            index + 1;

                        const monthData =
                            monthTotals[
                                monthNumber
                            ];


                        totalTransactions +=
                            monthData.count;


                        totalAmount +=
                            monthData.amount;


                        return `

                            <tr>

                                <td>
                                    ${monthName}
                                    ${selectedYear}
                                </td>

                                <td
                                    style="
                                        text-align:center;
                                    "
                                >
                                    ${monthData.count}
                                </td>

                                <td
                                    style="
                                        text-align:right;
                                        font-weight:700;
                                        color:#087443;
                                    "
                                >
                                    ₹${monthData.amount.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                ).join("");


            content.innerHTML = `

                <div
                    style="
                        margin-bottom:18px;
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >
                    Month-wise Transaction Report —
                    ${selectedYear}
                </div>


                <div
                    style="
                        overflow-x:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            border-collapse:collapse;
                            font-size:13px;
                        "
                    >

                        <thead>

                            <tr
                                style="
                                    background:#173b70;
                                    color:white;
                                "
                            >

                                <th
                                    style="
                                        padding:11px;
                                        text-align:left;
                                    "
                                >
                                    Month
                                </th>

                                <th
                                    style="
                                        padding:11px;
                                        text-align:center;
                                    "
                                >
                                    Transactions
                                </th>

                                <th
                                    style="
                                        padding:11px;
                                        text-align:right;
                                    "
                                >
                                    Amount
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>


                <!-- =====================================
                     REPORT TOTAL
                ====================================== -->

                <div
                    style="
                        margin-top:16px;
                        padding:14px 18px;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                        display:flex;
                        justify-content:flex-end;
                        align-items:center;
                        gap:25px;
                        flex-wrap:wrap;
                    "
                >

                    <div
                        style="
                            color:#64748b;
                            font-size:12px;
                        "
                    >
                        Total Transactions:

                        <strong
                            style="
                                color:#173b70;
                                margin-left:5px;
                            "
                        >
                            ${totalTransactions}
                        </strong>

                    </div>


                    <div
                        style="
                            color:#173b70;
                            font-size:14px;
                            font-weight:700;
                        "
                    >
                        Total Amount:

                        <strong
                            style="
                                color:#087443;
                                font-size:17px;
                                margin-left:6px;
                            "
                        >
                            ₹${totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )}
                        </strong>

                    </div>

                </div>

            `;

        }

        catch (error) {

            console.error(
                "Month-wise Transactions Report Error:",
                error
            );


            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#b91c1c;
                    "
                >

                    Unable to load report.

                    <br><br>

                    ${escapeHtml(
                        error.message
                    )}

                </div>

            `;

        }

    }


    // =====================================================
    // AUTO LOAD CURRENT YEAR
    // =====================================================

    loadMonthWiseReport();

}

// =========================================================
// #19 YEAR-WISE TRANSACTIONS
// =========================================================

async function renderYearWiseTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <!-- =====================================
                     REPORT TITLE
                ====================================== -->

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #19 Year-wise Transactions
                        </strong>

                    </div>

                </div>


                <!-- =====================================
                     REPORT CONTENT
                ====================================== -->

                <div
                    id="yearWiseReportContent"
                    style="
                        padding:25px 30px;
                        min-height:420px;
                    "
                >

                    <div
                        style="
                            text-align:center;
                            padding:60px 20px;
                            color:#64748b;
                        "
                    >

                        Loading report...

                    </div>

                </div>


                <!-- =====================================
                     GENERATED DATE
                ====================================== -->

                <div
                    style="
                        padding:8px 30px;
                        border-top:1px solid #d9e1ec;
                        text-align:right;
                        font-size:10px;
                        color:#7a8798;
                    "
                >

                    Generated:
                    ${formatToday()}

                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );



if (backButton) {
    backButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        hideReportModuleStartPage();
        renderTransactionReports();
    };
}

    // =====================================================
    // REPORT CONTENT
    // =====================================================

    const content =
        document.getElementById(
            "yearWiseReportContent"
        );


    if (!content) {

        return;

    }


    // =====================================================
    // CHECK USER
    // =====================================================

    if (!currentUser) {

        content.innerHTML = `

            <div
                style="
                    padding:30px;
                    text-align:center;
                    color:#b45309;
                "
            >

                ⚠️ User is not logged in.

            </div>

        `;

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
            doc => {

                transactions.push(
                    doc.data()
                );

            }
        );


        // =================================================
        // YEAR TOTALS
        // =================================================

        const yearTotals = {};


        // =================================================
        // PROCESS TRANSACTIONS
        // =================================================

        transactions.forEach(
            transaction => {

                // =========================================
// IGNORE SOFT-DELETED TRANSACTIONS
// =========================================

if (transaction.deleted === true) {

    return;

}
                const rawDate =
                    transaction.date;


                if (!rawDate) {

                    return;

                }


                let dateObject = null;


                // -----------------------------------------
                // YYYY-MM-DD
                // -----------------------------------------

                if (
                    /^\d{4}-\d{2}-\d{2}$/
                        .test(rawDate)
                ) {

                    const parts =
                        rawDate.split("-");


                    dateObject =
                        new Date(
                            Number(parts[0]),
                            Number(parts[1]) - 1,
                            Number(parts[2])
                        );

                }


                // -----------------------------------------
                // DD-MM-YYYY
                // -----------------------------------------

                else if (
                    /^\d{2}-\d{2}-\d{4}$/
                        .test(rawDate)
                ) {

                    const parts =
                        rawDate.split("-");


                    dateObject =
                        new Date(
                            Number(parts[2]),
                            Number(parts[1]) - 1,
                            Number(parts[0])
                        );

                }


                // -----------------------------------------
                // OTHER VALID DATE FORMAT
                // -----------------------------------------

                else {

                    const parsed =
                        new Date(rawDate);


                    if (
                        !isNaN(
                            parsed.getTime()
                        )
                    ) {

                        dateObject =
                            parsed;

                    }

                }


                if (!dateObject) {

                    return;

                }


                const year =
                    dateObject.getFullYear();


                // -----------------------------------------
                // CREATE YEAR ENTRY
                // -----------------------------------------

                if (!yearTotals[year]) {

                    yearTotals[year] = {

                        count: 0,

                        amount: 0

                    };

                }


                // -----------------------------------------
                // ADD TRANSACTION
                // -----------------------------------------

                yearTotals[year].count += 1;


                yearTotals[year].amount +=
                    Number(
                        transaction.amount || 0
                    );

            }
        );


        // =================================================
        // CHECK DATA
        // =================================================

        const years =
            Object.keys(
                yearTotals
            )
            .map(
                year =>
                    Number(year)
            )
            .sort(
                (a, b) =>
                    b - a
            );


        if (!years.length) {

            content.innerHTML = `

                <div
                    style="
                        padding:50px;
                        text-align:center;
                        color:#64748b;
                    "
                >

                    📭 No transactions with valid dates found.

                </div>

            `;

            return;

        }


        // =================================================
        // CALCULATE TOTALS
        // =================================================

        let totalTransactions = 0;

        let totalAmount = 0;


        // =================================================
        // CREATE TABLE ROWS
        // =================================================

        const rows =
            years
                .map(
                    year => {

                        const yearData =
                            yearTotals[year];


                        totalTransactions +=
                            yearData.count;


                        totalAmount +=
                            yearData.amount;


                        return `

                            <tr
                                style="
                                    border-bottom:1px solid #e5ebf3;
                                "
                            >

                                <td
                                    style="
                                        padding:11px;
                                        font-weight:700;
                                        color:#173b70;
                                    "
                                >
                                    ${year}
                                </td>


                                <td
                                    style="
                                        padding:11px;
                                        text-align:center;
                                    "
                                >
                                    ${yearData.count}
                                </td>


                                <td
                                    style="
                                        padding:11px;
                                        text-align:right;
                                        font-weight:700;
                                        color:#087443;
                                    "
                                >
                                    ₹${yearData.amount.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");


        // =================================================
        // RENDER REPORT
        // =================================================

        content.innerHTML = `

            <div
                style="
                    margin-bottom:18px;
                    color:#173b70;
                    font-size:14px;
                    font-weight:700;
                "
            >

                Year-wise Transaction Report

            </div>


            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Year
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:center;
                                "
                            >
                                Transactions
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 REPORT TOTAL
            ====================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Years:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${years.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${totalTransactions}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Amount:

                    <strong
                        style="
                            color:#087443;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >

                        ₹${totalAmount.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits:2,
                                maximumFractionDigits:2
                            }
                        )}

                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Year-wise Transactions Report Error:",
            error
        );


        content.innerHTML = `

            <div
                style="
                    padding:30px;
                    text-align:center;
                    color:#b91c1c;
                "
            >

                ❌ Unable to load report.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}

// =====================================================
// GLOBAL REPORT HEADER
// =====================================================

function injectUniversalReportHeader() {

    const reportContainer =
    reportWorkArea.querySelector(
        ".selected-report-container, .transaction-reports-container"
    );


    if (!reportContainer) {

        return;

    }


    const report =
    window.activeTransactionReport || null;

    const userDetails =
        getCurrentUserDetails();


    // =================================================
    // REPORT PERIOD
    // =================================================

    let reportPeriod =
        "All Financial Years";


    // -----------------------------------------------
    // REPORT #16
    // -----------------------------------------------

    if (report.number === 16) {

        reportPeriod =
            "All Transactions";

    }


    // -----------------------------------------------
    // REPORT #17
    // -----------------------------------------------

    else if (report.number === 17) {

        const fromDate =
            document.getElementById(
                "dateWiseFromDate"
            )?.value || "";


        const toDate =
            document.getElementById(
                "dateWiseToDate"
            )?.value || "";


        if (fromDate && toDate) {

            reportPeriod =
                `${formatReportDate(fromDate)} to ${formatReportDate(toDate)}`;

        }

        else {

            reportPeriod =
                "Date Range Not Selected";

        }

    }


    // -----------------------------------------------
    // REPORT #18
    // -----------------------------------------------

    else if (report.number === 18) {

        const selectedYear =
            document.getElementById(
                "monthWiseYear"
            )?.value || "";


        if (selectedYear) {

            reportPeriod =
                `Year ${selectedYear}`;

        }

        else {

            reportPeriod =
                "Year Not Selected";

        }

    }


    // -----------------------------------------------
// REPORT #19
// -----------------------------------------------

else if (report.number === 19) {

    reportPeriod =
        "All Available Financial Years";

}

else if (report.number === 20) {

    reportPeriod =
        "All Income Transactions";

}

else if (report.number === 21) {

    reportPeriod =
        "All Expense Transactions";

}

else if (report.number === 22) {

    reportPeriod =
        "All Investment Transactions";

}

else if (report.number === 23) {

    reportPeriod =
        "All Transfer Transactions";

}



    // =================================================
    // CREATE HEADER
    // =================================================

    let header =
        reportContainer.querySelector(
            ".universal-report-header"
        );


    if (!header) {

        header =
            document.createElement("div");


        header.className =
            "universal-report-header";


        header.innerHTML = `

            <!-- =====================================
                 LINE 1 — SBM WEALTH MANAGER
                 ===================================== -->

            <div
                class="universal-report-brand"
            >

                <div
                    class="universal-report-coins"
                >

                    <span
                        class="universal-coin"
                    >
                        $
                    </span>

                    <span
                        class="universal-coin coin-bitcoin"
                    >
                        ₿
                    </span>

                    <span
                        class="universal-coin coin-money"
                    >
                        M
                    </span>

                </div>


                <span>
                    Wealth Manager
                </span>

            </div>


            <!-- =====================================
                 LINE 2 — USER NAME
                 ===================================== -->

            <div
                class="universal-report-user"
            ></div>


            <!-- =====================================
                 LINE 3 — REPORT TITLE
                 ===================================== -->

            <div
                class="universal-report-title"
            ></div>

        `;


        reportContainer.prepend(header);

    }


    // =================================================
    // UPDATE HEADER DATA
    // =================================================

    const userName =
        header.querySelector(
            ".universal-report-user"
        );


    const reportTitle =
        header.querySelector(
            ".universal-report-title"
        );


    const finalUserName =
        String(
            userDetails.name || "USER"
        ).toUpperCase();


    let fallbackReportName = "";

if (!report) {
    const reportHeading =
        reportContainer.querySelector(
            ".report-document-header strong"
        );

    if (reportHeading) {
        fallbackReportName =
            reportHeading.textContent
                .trim()
                .replace(/^#\d+\s*/, "");
    }
}

const finalReportTitle =
    report
        ? `Financial Report - ${report.name} — ${reportPeriod}`
        : `Financial Report - ${
              fallbackReportName ||
              "Financial Report"
          }`;


    if (
        userName &&
        userName.textContent !== finalUserName
    ) {

        userName.textContent =
            finalUserName;

    }


    if (
        reportTitle &&
        reportTitle.textContent !== finalReportTitle
    ) {

        reportTitle.textContent =
            finalReportTitle;

    }


    // =================================================
    // GLOBAL PRINT CSS
    // =================================================

    if (
        !document.getElementById(
            "universalReportStyles"
        )
    ) {

        const style =
            document.createElement("style");


        style.id =
            "universalReportStyles";


        style.textContent = `

            /* =========================================
               SCREEN HEADER
               ========================================= */

            .universal-report-header {

                width:100%;

                box-sizing:border-box;

                padding:10px 20px 12px;

                background:#ffffff;

                border-bottom:1px solid #d9e1ec;

                text-align:center;

                font-family:Arial, sans-serif;

            }


            /* -----------------------------------------
               LINE 1
               ----------------------------------------- */

            .universal-report-brand {

                display:flex;

                align-items:center;

                gap:8px;

                font-size:13px;

                font-weight:600;

                color:#173b70;

                line-height:1;

                margin-bottom:5px;

            }


            /* -----------------------------------------
               COINS
               ----------------------------------------- */

            .universal-report-coins {

                display:flex;

                align-items:center;

                height:24px;

            }


            .universal-coin {

                width:23px;

                height:23px;

                border-radius:50%;

                display:flex;

                align-items:center;

                justify-content:center;

                margin-left:-5px;

                background:
                    linear-gradient(
                        145deg,
                        #fff4a8,
                        #d99b00
                    );

                border:1.5px solid #d69b00;

                color:white;

                font-size:9px;

                font-weight:900;

                box-shadow:
                    0 2px 4px
                    rgba(0,0,0,0.20);

            }


            .universal-coin:first-child {

                margin-left:0;

            }


            /* -----------------------------------------
               LINE 2
               ----------------------------------------- */

            .universal-report-user {

                font-size:11px;

                font-weight:700;

                letter-spacing:0.4px;

                color:#334155;

                line-height:1.3;

                margin-bottom:3px;

            }


            /* -----------------------------------------
               LINE 3
               ----------------------------------------- */

            .universal-report-title {

                font-size:16px;

                font-weight:500;

                color:#173b70;

                line-height:1.4;

            }


            /* =========================================
               PRINT AREA
               ========================================= */

            .report-print-area {

                width:100%;

                box-sizing:border-box;

                background:white;

                font-family:Arial, sans-serif;

            }


            .report-print-area table {

                width:100% !important;

                border-collapse:collapse !important;

                font-size:10px !important;

                margin-top:12px;

            }


            .report-print-area th,
            .report-print-area td {

                border:1px solid #444 !important;

                padding:5px 6px !important;

                color:#000 !important;

            }


            .report-print-area th {

                font-weight:700 !important;

                background:#f1f1f1 !important;

            }


            .report-print-area thead {

                display:table-header-group;

            }


            .report-print-area tr {

                page-break-inside:avoid;

            }


            /* =========================================
               ACTUAL PRINT
               ========================================= */

            @media print {

                body * {

                    visibility:hidden !important;

                }


                body.report-printing
                .report-print-area,

                body.report-printing
                .report-print-area * {

                    visibility:visible !important;

                }


                body.report-printing
                .report-print-area {

                    position:absolute !important;

                    left:0 !important;

                    top:0 !important;

                    width:100% !important;

                    padding:10mm !important;

                    box-sizing:border-box !important;

                    background:white !important;

                }


                body.report-printing
                .universal-report-header {

                    display:block !important;

                    border-bottom:1px solid #333 !important;

                    margin-bottom:10px !important;

                    padding:0 0 8px 0 !important;

                }


                body.report-printing
                .universal-report-brand {

                    font-size:10px !important;

                    margin-bottom:3px !important;

                }


                body.report-printing
                .universal-coin {

                    width:17px !important;

                    height:17px !important;

                    font-size:7px !important;

                    border-width:1px !important;

                }


                body.report-printing
                .universal-report-user {

                    font-size:9px !important;

                    margin-bottom:2px !important;

                }


                body.report-printing
                .universal-report-title {

                    font-size:13px !important;

                    font-weight:500 !important;

                }

            }

        `;


        document.head.appendChild(style);

    }

}

// =====================================================
// GLOBAL REPORT ACTION TOOLBAR
// =====================================================

function injectReportToolbar() {

    injectUniversalReportHeader();

    // -------------------------------------------------
    // Find currently opened report
    // -------------------------------------------------

   const reportContainer =
    reportWorkArea.querySelector(
        ".selected-report-container, .transaction-reports-container"
    );


    // No report currently open
    if (!reportContainer) {

        return;

    }


    // -------------------------------------------------
    // Prevent duplicate toolbar
    // -------------------------------------------------

    if (
        reportContainer.querySelector(
            ".report-action-toolbar"
        )
    ) {

        return;

    }


    // -------------------------------------------------
    // Create toolbar
    // -------------------------------------------------

    const toolbar =
        document.createElement("div");


    toolbar.className =
        "report-action-toolbar";


    // -------------------------------------------------
    // Toolbar styling
    // -------------------------------------------------

    toolbar.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
        margin: 10px 0 15px 0;
        padding: 8px 0;
        flex-wrap: nowrap;
        white-space: nowrap;
        overflow-x: auto;
    `;


    // -------------------------------------------------
    // Toolbar buttons
    // -------------------------------------------------

    toolbar.innerHTML = `

        <button
            type="button"
            data-report-action="pdf"
            style="
                padding: 8px 14px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
            "
        >
            📄 Export PDF
        </button>


        <button
            type="button"
            data-report-action="excel"
            style="
                padding: 8px 14px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
            "
        >
            📊 Export Excel
        </button>


        <button
            type="button"
            data-report-action="print"
            style="
                padding: 8px 14px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
            "
        >
            🖨️ Print
        </button>


        <button
            type="button"
            data-report-action="close"
            style="
                padding: 8px 14px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: #fff;
                cursor: pointer;
                font-weight: 600;
                white-space: nowrap;
            "
        >
            ✖️ Close
        </button>

    `;


    // -------------------------------------------------
    // Insert toolbar before report document
    // -------------------------------------------------

    const reportHeader =
        reportContainer.querySelector(
            ".report-document-header"
        );


    if (reportHeader) {

        reportHeader.before(toolbar);

    } else {

        reportContainer.prepend(toolbar);

    }


    // =================================================
    // CLOSE
    // =================================================

    const closeButton =
        toolbar.querySelector(
            '[data-report-action="close"]'
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                renderTransactionReports();

            }
        );

    }


    // =================================================
    // PRINT
    // =================================================

    const printButton =
        toolbar.querySelector(
            '[data-report-action="print"]'
        );


    if (printButton) {

        printButton.addEventListener(
    "click",
    function () {

        printCurrentReport();

    }
);

    }


    // =================================================
    // PDF
    // =================================================

    const pdfButton =
        toolbar.querySelector(
            '[data-report-action="pdf"]'
        );


    if (pdfButton) {

    pdfButton.addEventListener(
        "click",
        function () {

            exportCurrentReportPDF();

        }
    );

}


    // =================================================
    // EXCEL
    // =================================================

    const excelButton =
        toolbar.querySelector(
            '[data-report-action="excel"]'
        );


    if (excelButton) {

    excelButton.addEventListener(
        "click",
        function () {

            exportCurrentReportExcel();

        }
    );

}

}

// =====================================================
// GLOBAL REPORT TOTALS
// READ TOTALS FROM CURRENT REPORT
// =====================================================

function getReportTotalsForExport(
    reportContainer
) {

    const totals = [];


    // -----------------------------------------------
    // Find strong elements used inside Total blocks
    // -----------------------------------------------

    const strongElements =
        Array.from(
            reportContainer.querySelectorAll(
                "strong"
            )
        );


    strongElements.forEach(
        function (strong) {

            const parent =
                strong.parentElement;


            if (!parent) {
                return;
            }


            const parentText =
                parent.innerText
                    ?.trim()
                    || "";


            // ---------------------------------------
            // Only capture elements containing Total
            // ---------------------------------------

            if (
                !/^Total\b/i.test(
                    parentText
                )
            ) {

                return;

            }


            if (
                !totals.some(
                    item =>
                        item === parentText
                )
            ) {

                totals.push(
                    parentText
                );

            }

        }
    );


    return totals;

}

// =====================================================
// GLOBAL REPORT EXPORT — PDF
// EXPORT HEADER + DATA TABLE
// =====================================================

function exportCurrentReportPDF() {

const reportContainer =
    reportWorkArea.querySelector(
        ".selected-report-container, .transaction-reports-container"
    );

    if (!reportContainer) {

        alert(
            "Please open a report first."
        );

        return;

    }


    // =================================================
    // FIND DATA TABLES
    // =================================================

    const tables =
        Array.from(
            reportContainer.querySelectorAll(
                "table"
            )
        );


    if (tables.length === 0) {

        alert(
            "No report data table is available to export."
        );

        return;

    }


    // =================================================
    // CHECK PDF LIBRARY
    // =================================================

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF library could not be loaded. Please refresh the page and try again."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    // =================================================
    // CREATE PDF
    // =================================================

    const doc =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });


    // =================================================
    // UNIVERSAL HEADER
    // =================================================

    const reportHeader =
        reportContainer.querySelector(
            ".universal-report-header"
        );


    let userName =
        "USER";

    let reportTitle =
        "Financial Report";


    if (reportHeader) {

        userName =
            reportHeader
                .querySelector(
                    ".universal-report-user"
                )
                ?.textContent
                ?.trim()
                || "USER";


        reportTitle =
            reportHeader
                .querySelector(
                    ".universal-report-title"
                )
                ?.textContent
                ?.trim()
                || "Financial Report";

    }


    // =================================================
    // PDF HEADER
    // =================================================

    doc.setTextColor(
        23,
        59,
        112
    );


// =================================================
// PDF HEADER
// =================================================

// -------------------------------------------------
// SBM WEALTH MANAGER BRANDING
// -------------------------------------------------

// Coin 1
doc.setFillColor(
    244,
    189,
    45
);

doc.circle(
    137,
    10,
    4,
    "F"
);


// Coin 2
doc.setFillColor(
    255,
    204,
    55
);

doc.circle(
    144,
    10,
    4,
    "F"
);


// Coin 3
doc.setFillColor(
    235,
    174,
    35
);

doc.circle(
    151,
    10,
    4,
    "F"
);


// -------------------------------------------------
// SBM LETTERS INSIDE COINS
// -------------------------------------------------

doc.setTextColor(
    255,
    255,
    255
);

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(
    10
);


// $
doc.text(
    "$",
    137,
    13,
    {
        align: "center"
    }
);


// ₿
doc.text(
    "B",
    144,
    13,
    {
        align: "center"
    }
);


// M
doc.text(
    "M",
    151,
    13,
    {
        align: "center"
    }
);


// -------------------------------------------------
// WEALTH MANAGER
// -------------------------------------------------

doc.setTextColor(
    23,
    59,
    112
);

doc.setFont(
    "helvetica",
    "normal"
);

doc.setFontSize(
    10
);

doc.text(
    "Wealth Manager",
    158,
    12.5,
    {
        align: "left"
    }
);


// -------------------------------------------------
// USER NAME
// -------------------------------------------------

doc.setTextColor(
    51,
    65,
    85
);

doc.setFontSize(
    9
);

doc.text(
    userName,
    148,
    18,
    {
        align: "center"
    }
);


// -------------------------------------------------
// REPORT TITLE
// -------------------------------------------------

doc.setTextColor(
    23,
    59,
    112
);

doc.setFontSize(
    13
);

doc.text(
    reportTitle,
    148,
    25,
    {
        align: "center"
    }
);

    // =================================================
    // REPORT TABLES
    // =================================================

    let startY = 30;


    tables.forEach(
        function (table, index) {

            // -----------------------------------------
            // CREATE SAFE TABLE COPY
            // -----------------------------------------

            const tableCopy =
                table.cloneNode(true);


            // jsPDF standard fonts may not support
            // Indian Rupee and some Unicode symbols.
            // Convert them safely for PDF.

            tableCopy
                .querySelectorAll(
                    "td, th"
                )
                .forEach(
                    function (cell) {

                        cell.innerHTML =
                            cell.innerHTML
                                .replaceAll(
                                    "₹",
                                    "Rs. "
                                )
                                .replaceAll(
                                    "—",
                                    "-"
                                );

                    }
                );


            // -----------------------------------------
            // ADD TABLE
            // -----------------------------------------

            if (
                typeof doc.autoTable !==
                "function"
            ) {

                alert(
                    "PDF table library could not be loaded. Please refresh the page and try again."
                );

                return;

            }


            doc.autoTable({

                html: tableCopy,

                startY: startY,

                margin: {
                    left: 10,
                    right: 10
                },

                theme: "grid",

                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    textColor: [
                        0,
                        0,
                        0
                    ]
                },

                headStyles: {
                    fillColor: [
                        23,
                        59,
                        112
                    ],
                    textColor: [
                        255,
                        255,
                        255
                    ],
                    fontStyle: "bold"
                },

                alternateRowStyles: {
                    fillColor: [
                        248,
                        250,
                        252
                    ]
                }

            });


            // -----------------------------------------
            // NEXT TABLE POSITION
            // -----------------------------------------

            if (
                doc.lastAutoTable
            ) {

                startY =
                    doc.lastAutoTable.finalY
                    + 8;

            }


            // -----------------------------------------
            // NEW PAGE IF REQUIRED
            // -----------------------------------------

            if (
                index <
                    tables.length - 1 &&
                startY > 180
            ) {

                doc.addPage();

                startY = 15;

            }

        }
    );


    // =================================================
// ADD REPORT TOTALS TO PDF
// =================================================

const reportTotals =
    getReportTotalsForExport(
        reportContainer
    );


if (
    reportTotals.length > 0
) {

    let totalY =
        (
            doc.lastAutoTable &&
            doc.lastAutoTable.finalY
        )
        || 30;


    totalY += 10;


    doc.setTextColor(
        23,
        59,
        112
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        10
    );


    reportTotals.forEach(
    function (totalText) {

        // =========================================
        // CLEAN PDF TOTAL TEXT
        // =========================================

        let cleanTotal =
            String(
                totalText || ""
            );


        // Remove excessive spaces
        cleanTotal =
            cleanTotal.replace(
                /\s+/g,
                " "
            ).trim();


        // Remove spacing before colon
        cleanTotal =
            cleanTotal.replace(
                /\s+:/g,
                ":"
            );


        // Replace ₹ because standard PDF font
        // does not reliably support this symbol
        cleanTotal =
            cleanTotal.replace(
                /₹\s*/g,
                "Rs. "
            );


        // =========================================
        // PDF FONT
        // =========================================

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            10
        );

        doc.setTextColor(
            23,
            59,
            112
        );


        // =========================================
        // WRITE TOTAL
        // =========================================

        doc.text(
            cleanTotal,
            20,
            totalY
        );


        totalY += 6;

    }
);

}

    // =================================================
    // FILE NAME
    // =================================================

    const report =
        window.activeTransactionReport;


    let fileName =
        report?.name
        || "Financial Report";


    fileName =
        fileName
            .replace(
                /[<>:"/\\|?*]+/g,
                "_"
            )
            .replace(
                /\s+/g,
                "_"
            );


    // =================================================
    // SAVE PDF
    // =================================================

    doc.save(
        `${fileName}.pdf`
    );

}


// =====================================================
// GLOBAL REPORT EXPORT — EXCEL
// EXPORT HEADER + DATA TABLE
// =====================================================

function exportCurrentReportExcel() {

const reportContainer =
    reportWorkArea.querySelector(
        ".selected-report-container, .transaction-reports-container"
    );

    if (!reportContainer) {

        alert(
            "Please open a report first."
        );

        return;

    }


    // =================================================
    // FIND DATA TABLES
    // =================================================

    const tables =
        Array.from(
            reportContainer.querySelectorAll(
                "table"
            )
        );


    if (tables.length === 0) {

        alert(
            "No report data table is available to export."
        );

        return;

    }


    // =================================================
    // CHECK EXCEL LIBRARY
    // =================================================

    if (!window.XLSX) {

        alert(
            "Excel library could not be loaded. Please refresh the page and try again."
        );

        return;

    }


    // =================================================
    // CREATE WORKBOOK
    // =================================================

    const workbook =
        XLSX.utils.book_new();


    // =================================================
    // UNIVERSAL HEADER
    // =================================================

    const reportHeader =
        reportContainer.querySelector(
            ".universal-report-header"
        );


    let userName =
        "USER";

    let reportTitle =
        "Financial Report";


    if (reportHeader) {

        userName =
            reportHeader
                .querySelector(
                    ".universal-report-user"
                )
                ?.textContent
                ?.trim()
                || "USER";


        reportTitle =
            reportHeader
                .querySelector(
                    ".universal-report-title"
                )
                ?.textContent
                ?.trim()
                || "Financial Report";

    }


    // =================================================
    // CREATE SHEETS
    // =================================================

    tables.forEach(
        function (table, index) {

            const rows =
                Array.from(
                    table.rows
                ).map(
                    function (row) {

                        return Array.from(
                            row.cells
                        ).map(
                            function (cell) {

                                return cell
                                    .innerText
                                    .trim();

                            }
                        );

                    }
                );


 // -----------------------------------------
// HEADER ROWS
// -----------------------------------------

// -----------------------------------------
// REPORT TOTALS
// -----------------------------------------

const reportTotals =
    getReportTotalsForExport(
        reportContainer
    );


// -----------------------------------------
// HEADER + DATA + TOTALS
// -----------------------------------------

const excelData = [

    [
        "●$   ●₿   ●M   Wealth Manager"
    ],

    [
        userName
    ],

    [
        reportTitle
    ],

    [],

    ...rows,

    [],

    ...reportTotals.map(
        function (totalText) {

            return [
                totalText
            ];

        }
    )

];
            // -----------------------------------------
            // CREATE WORKSHEET
            // -----------------------------------------

            const worksheet =
                XLSX.utils.aoa_to_sheet(
                    excelData
                );


            // -----------------------------------------
            // COLUMN WIDTHS
            // -----------------------------------------

            const columnCount =
                rows.length > 0
                    ? rows[0].length
                    : 8;


            worksheet["!cols"] =
                Array.from(
                    {
                        length:
                            columnCount
                    },
                    function () {

                        return {
                            wch: 18
                        };

                    }
                );


            // -----------------------------------------
            // FIRST COLUMN
            // -----------------------------------------

            if (
                worksheet["!cols"][0]
            ) {

                worksheet["!cols"][0]
                    .wch = 18;

            }


            // -----------------------------------------
            // SHEET NAME
            // -----------------------------------------

            let sheetName =
                index === 0
                    ? "Report"
                    : `Report_${index + 1}`;


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                sheetName
            );

        }
    );


    // =================================================
    // FILE NAME
    // =================================================

    const report =
        window.activeTransactionReport;


    let fileName =
        report?.name
        || "Financial Report";


    fileName =
        fileName
            .replace(
                /[<>:"/\\|?*]+/g,
                "_"
            )
            .replace(
                /\s+/g,
                "_"
            );


    // =================================================
    // SAVE EXCEL
    // =================================================

    XLSX.writeFile(
        workbook,
        `${fileName}.xlsx`
    );

}


// =====================================================
// GLOBAL REPORT PRINT FUNCTION
// PRINT ONLY HEADER + DATA TABLE
// =====================================================

function printCurrentReport() {

const reportContainer =
    reportWorkArea.querySelector(
        ".selected-report-container, .transaction-reports-container"
    );


    if (!reportContainer) {

        alert(
            "Please open a report first."
        );

        return;

    }


    // =================================================
    // FIND ACTUAL DATA TABLES
    // =================================================

    const tables =
        Array.from(
            reportContainer.querySelectorAll(
                "table"
            )
        );


    if (tables.length === 0) {

        alert(
            "No report data table is available to print."
        );

        return;

    }


    // =================================================
    // REMOVE OLD PRINT AREA
    // =================================================

    const oldPrintArea =
        document.querySelector(
            ".report-print-area"
        );


    if (oldPrintArea) {

        oldPrintArea.remove();

    }


    // =================================================
    // CREATE PRINT AREA
    // =================================================

    const printArea =
        document.createElement("div");


    printArea.className =
        "report-print-area";


    // =================================================
    // COPY UNIVERSAL HEADER
    // =================================================

    const reportHeader =
        reportContainer.querySelector(
            ".universal-report-header"
        );


    if (reportHeader) {

        printArea.appendChild(
            reportHeader.cloneNode(true)
        );

    }


    // =================================================
    // COPY ONLY TABLES
    // =================================================

    tables.forEach(
        function (table) {

            const tableClone =
                table.cloneNode(true);


            printArea.appendChild(
                tableClone
            );

        }
    );


    // =================================================
    // ADD TO BODY
    // =================================================

    document.body.appendChild(
        printArea
    );


    // =================================================
    // PRINT MODE
    // =================================================

    document.body.classList.add(
        "report-printing"
    );


    // =================================================
    // CLEANUP
    // =================================================

    const cleanup =
        function () {

            document.body.classList.remove(
                "report-printing"
            );


            if (printArea) {

                printArea.remove();

            }


            window.onafterprint =
                null;

        };


    window.onafterprint =
        cleanup;


    // =================================================
    // OPEN PRINT
    // =================================================

    setTimeout(
        function () {

            window.print();

        },
        150
    );

}

// =========================================================
// #20 INCOME TRANSACTIONS
// =========================================================

async function renderIncomeTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <!-- =====================================
                     REPORT TITLE
                ====================================== -->

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #20 Income Transactions
                        </strong>

                    </div>

                </div>


                <!-- =====================================
                     REPORT CONTENT
                ====================================== -->

                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="incomeTransactionsReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        ⏳ Loading income transactions...
                    </div>

                </div>

            </div>

        </div>

    `;


    // =================================================
    // BACK BUTTON
    // =================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

    }


    // =================================================
    // CHECK USER
    // =================================================

    if (!currentUser) {

        const content =
            document.getElementById(
                "incomeTransactionsReportContent"
            );

        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b45309;
                    "
                >
                    ⚠️ User is not logged in.
                </div>

            `;

        }

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();


                // =========================================
                // IGNORE SOFT-DELETED TRANSACTIONS
                // =========================================

                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                // =========================================
                // ONLY INCOME TRANSACTIONS
                // =========================================

                if (
                    String(
                        transaction.type || ""
                    ).toLowerCase() !== "income"
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

transactions.sort(
    (a, b) =>
        String(
            a.date || ""
        ).localeCompare(
            String(
                b.date || ""
            )
        )
);


        const content =
            document.getElementById(
                "incomeTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // NO DATA
        // =================================================

        if (!transactions.length) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px;
                        text-align:center;
                        color:#7b8ba1;
                    "
                >
                    📭 No income transactions found.
                </div>

            `;

            return;

        }


        // =================================================
        // CREATE TABLE ROWS
        // =================================================

        const rows =
            transactions
                .map(
                    (transaction) => `

                        <tr
                            style="
                                border-bottom:1px solid #e5ebf3;
                            "
                        >

                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    formatReportDate(
                                        transaction.date
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.type
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.category
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.partyName
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${
                                    Number(
                                        transaction.amount
                                        || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.paymentMethod
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.linkedModule
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.notes
                                    || "—"
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");


        // =================================================
        // TOTAL
        // =================================================

        const totalAmount =
            transactions.reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


        // =================================================
        // REPORT HTML
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:12px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Date
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Type
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Category
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Party
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Payment Method
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Linked Module
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 REPORT TOTAL
            ====================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Income Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${transactions.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Income:

                    <strong
                        style="
                            color:#087443;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >
                        ₹${
                            totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )
                        }
                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "❌ Income Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "incomeTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                    "
                >

                    ❌ Unable to load income transactions.

                    <br><br>

                    Please check Console.

                </div>

            `;

        }

    }

}

// =========================================================
// #21 EXPENSE TRANSACTIONS
// =========================================================

async function renderExpenseTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #21 Expense Transactions
                        </strong>

                    </div>

                </div>


                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="expenseTransactionsReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        ⏳ Loading expense transactions...
                    </div>

                </div>

            </div>

        </div>

    `;


    // =================================================
    // BACK BUTTON
    // =================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

    }


    // =================================================
    // CHECK USER
    // =================================================

    if (!currentUser) {

        const content =
            document.getElementById(
                "expenseTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b45309;
                    "
                >
                    ⚠️ User is not logged in.
                </div>

            `;

        }

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();


                // =========================================
                // IGNORE SOFT-DELETED TRANSACTIONS
                // =========================================

                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                // =========================================
                // ONLY EXPENSE TRANSACTIONS
                // =========================================

                if (
                    String(
                        transaction.type || ""
                    ).toLowerCase() !== "expense"
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


        // =================================================
        // SORT — OLDEST FIRST / ASCENDING
        // =================================================

        transactions.sort(
            (a, b) =>
                String(
                    a.date || ""
                ).localeCompare(
                    String(
                        b.date || ""
                    )
                )
        );


        const content =
            document.getElementById(
                "expenseTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // NO DATA
        // =================================================

        if (!transactions.length) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px;
                        text-align:center;
                        color:#7b8ba1;
                    "
                >
                    📭 No expense transactions found.
                </div>

            `;

            return;

        }


        // =================================================
        // CREATE TABLE ROWS
        // =================================================

        const rows =
            transactions
                .map(
                    (transaction) => `

                        <tr
                            style="
                                border-bottom:1px solid #e5ebf3;
                            "
                        >

                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    formatReportDate(
                                        transaction.date
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.type
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.category
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.partyName
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${
                                    Number(
                                        transaction.amount
                                        || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.paymentMethod
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.linkedModule
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.notes
                                    || "—"
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");


        // =================================================
        // TOTAL EXPENSE
        // =================================================

        const totalAmount =
            transactions.reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


        // =================================================
        // REPORT HTML
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:12px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Date
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Type
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Category
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Party
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Payment Method
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Linked Module
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 REPORT TOTAL
            ====================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Expense Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${transactions.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Expense:

                    <strong
                        style="
                            color:#b91c1c;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >
                        ₹${
                            totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )
                        }
                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "❌ Expense Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "expenseTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                    "
                >

                    ❌ Unable to load expense transactions.

                    <br><br>

                    Please check Console.

                </div>

            `;

        }

    }

}

// =========================================================
// #22 INVESTMENT TRANSACTIONS
// =========================================================

async function renderInvestmentTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #22 Investment Transactions
                        </strong>

                    </div>

                </div>


                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="investmentTransactionsReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        ⏳ Loading investment transactions...
                    </div>

                </div>

            </div>

        </div>

    `;


    // =================================================
    // BACK BUTTON
    // =================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

    }


    // =================================================
    // CHECK USER
    // =================================================

    if (!currentUser) {

        const content =
            document.getElementById(
                "investmentTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b45309;
                    "
                >
                    ⚠️ User is not logged in.
                </div>

            `;

        }

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();


                // =========================================
                // IGNORE SOFT-DELETED TRANSACTIONS
                // =========================================

                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                // =========================================
                // ONLY INVESTMENT TRANSACTIONS
                // =========================================

                if (
                    String(
                        transaction.type || ""
                    ).toLowerCase() !== "investment"
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


        // =================================================
        // SORT — OLDEST FIRST / ASCENDING
        // =================================================

        transactions.sort(
            (a, b) =>
                String(
                    a.date || ""
                ).localeCompare(
                    String(
                        b.date || ""
                    )
                )
        );


        const content =
            document.getElementById(
                "investmentTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // NO DATA
        // =================================================

        if (!transactions.length) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px;
                        text-align:center;
                        color:#7b8ba1;
                    "
                >
                    📭 No investment transactions found.
                </div>

            `;

            return;

        }


        // =================================================
        // CREATE TABLE ROWS
        // =================================================

        const rows =
            transactions
                .map(
                    (transaction) => `

                        <tr
                            style="
                                border-bottom:1px solid #e5ebf3;
                            "
                        >

                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    formatReportDate(
                                        transaction.date
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.type
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.category
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.partyName
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${
                                    Number(
                                        transaction.amount
                                        || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.paymentMethod
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.linkedModule
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.notes
                                    || "—"
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");


        // =================================================
        // TOTAL INVESTMENT
        // =================================================

        const totalAmount =
            transactions.reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


        // =================================================
        // REPORT HTML
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:12px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Date
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Type
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Category
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Party
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Payment Method
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Linked Module
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 REPORT TOTAL
            ====================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Investment Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${transactions.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Investment:

                    <strong
                        style="
                            color:#087443;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >
                        ₹${
                            totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )
                        }
                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "❌ Investment Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "investmentTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                    "
                >

                    ❌ Unable to load investment transactions.

                    <br><br>

                    Please check Console.

                </div>

            `;

        }

    }

}

// =========================================================
// #23 TRANSFER TRANSACTIONS
// =========================================================

async function renderTransferTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #23 Transfer Transactions
                        </strong>

                    </div>

                </div>


                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        id="transferTransactionsReportContent"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#7b8ba1;
                        "
                    >
                        ⏳ Loading transfer transactions...
                    </div>

                </div>

            </div>

        </div>

    `;


    // =================================================
    // BACK BUTTON
    // =================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

    }


    // =================================================
    // CHECK USER
    // =================================================

    if (!currentUser) {

        const content =
            document.getElementById(
                "transferTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b45309;
                    "
                >
                    ⚠️ User is not logged in.
                </div>

            `;

        }

        return;

    }


    try {

        // =================================================
        // FIRESTORE TRANSACTIONS
        // =================================================

        const transactionsRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "transactions"
            );


        const snapshot =
            await getDocs(
                transactionsRef
            );


        const transactions = [];


        snapshot.forEach(
            (transactionDoc) => {

                const transaction =
                    transactionDoc.data();


                // =========================================
                // IGNORE SOFT-DELETED TRANSACTIONS
                // =========================================

                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                // =========================================
                // ONLY TRANSFER TRANSACTIONS
                // =========================================

                if (
                    String(
                        transaction.type || ""
                    ).toLowerCase() !== "transfer"
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


        // =================================================
        // SORT — OLDEST FIRST / ASCENDING
        // =================================================

        transactions.sort(
            (a, b) =>
                String(
                    a.date || ""
                ).localeCompare(
                    String(
                        b.date || ""
                    )
                )
        );


        const content =
            document.getElementById(
                "transferTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // NO DATA
        // =================================================

        if (!transactions.length) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px;
                        text-align:center;
                        color:#7b8ba1;
                    "
                >
                    📭 No transfer transactions found.
                </div>

            `;

            return;

        }


        // =================================================
        // CREATE TABLE ROWS
        // =================================================

        const rows =
            transactions
                .map(
                    (transaction) => `

                        <tr
                            style="
                                border-bottom:1px solid #e5ebf3;
                            "
                        >

                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    formatReportDate(
                                        transaction.date
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.type
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.category
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.partyName
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${
                                    Number(
                                        transaction.amount
                                        || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:2,
                                            maximumFractionDigits:2
                                        }
                                    )
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.paymentMethod
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.linkedModule
                                    || "—"
                                }
                            </td>


                            <td
                                style="
                                    padding:10px;
                                "
                            >
                                ${
                                    transaction.notes
                                    || "—"
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");


        // =================================================
        // TOTAL TRANSFER
        // =================================================

        const totalAmount =
            transactions.reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


        // =================================================
        // REPORT HTML
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:12px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:#ffffff;
                        font-size:13px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Date
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Type
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Category
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Party
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Payment Method
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Linked Module
                            </th>


                            <th
                                style="
                                    padding:11px;
                                "
                            >
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =====================================
                 REPORT TOTAL
            ====================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Transfer Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${transactions.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Transfer:

                    <strong
                        style="
                            color:#173b70;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >
                        ₹${
                            totalAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:2,
                                    maximumFractionDigits:2
                                }
                            )
                        }
                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "❌ Transfer Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "transferTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                    "
                >

                    ❌ Unable to load transfer transactions.

                    <br><br>

                    Please check Console.

                </div>

            `;

        }

    }

}

// =========================================================
// #24 WALLET TRANSACTIONS
// =========================================================

async function renderWalletTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #24 Wallet Transactions
                        </strong>


                        <span>
                            <strong>Reporting Period:</strong>
                            All Wallet Transactions
                        </span>

                    </div>

                </div>


                <div
                    style="
                        padding:20px 30px;
                    "
                >

                    <div
                        class="wallet-transactions-summary"
                        style="
                            display:flex;
                            gap:18px;
                            flex-wrap:wrap;
                        "
                    >

                        <div
                            style="
                                flex:1;
                                min-width:190px;
                                padding:16px 18px;
                                border:1px solid #dce5f0;
                                border-radius:10px;
                                background:#f8fbff;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    margin-bottom:5px;
                                "
                            >
                                Wallet Transactions
                            </div>

                            <strong
                                id="walletTransactionCount"
                                style="
                                    color:#173b70;
                                    font-size:21px;
                                "
                            >
                                0
                            </strong>

                        </div>


                        <div
                            style="
                                flex:1;
                                min-width:190px;
                                padding:16px 18px;
                                border:1px solid #dce5f0;
                                border-radius:10px;
                                background:#f8fbff;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    margin-bottom:5px;
                                "
                            >
                                Total Wallet Amount
                            </div>

                            <strong
                                id="walletTransactionTotal"
                                style="
                                    color:#087443;
                                    font-size:21px;
                                "
                            >
                                ₹0.00
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <div
                id="walletTransactionsReportContent"
                style="
                    padding:0 30px 30px;
                "
            >

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#64748b;
                    "
                >
                    Loading wallet transactions...
                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                renderTransactionReports();

            }
        );

    }


    // =====================================================
    // FIREBASE USER
    // =====================================================

    const user =
        auth.currentUser;


    if (!user) {

        const content =
            document.getElementById(
                "walletTransactionsReportContent"
            );

        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                        text-align:center;
                    "
                >
                    ❌ Please login first to view
                    Wallet Transactions.
                </div>

            `;

        }

        return;

    }


    try {

        // =================================================
        // LOAD TRANSACTIONS
        // =================================================

        const transactionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            );


        const transactions = [];

// =================================================
// LOAD ACCOUNT NAMES
// =================================================

const accountNameMap = new Map();

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
    function (accountDoc) {

        const account =
            accountDoc.data();

        accountNameMap.set(
            accountDoc.id,
            account.name ||
                "Unnamed Account"
        );

    }
);

        transactionsSnapshot.forEach(
            function (transactionDoc) {

                const transaction =
                    transactionDoc.data();


 // =========================================
// WALLET TRANSACTIONS
// =========================================
// 1. Wallet Payment
// 2. Cashback linked to Wallet
// =========================================

const isWalletTransaction =
    transaction.type === "wallet_payment" ||
    (
        transaction.type === "cashback" &&
        transaction.category === "Wallet Cashback"
    );

if (!isWalletTransaction) {

    return;

}


                // =========================================
                // EXCLUDE DELETED TRANSACTIONS
                // =========================================

                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

transactions.sort(
    function (a, b) {

        return String(
            a.date || ""
        ).localeCompare(
            String(
                b.date || ""
            )
        );

    }
);
        // =================================================
        // TOTAL
        // =================================================

        const totalAmount =
            transactions.reduce(
                function (sum, transaction) {

                    return (
                        sum +
                        Number(
                            transaction.amount || 0
                        )
                    );

                },
                0
            );


        // =================================================
        // UPDATE SUMMARY
        // =================================================

        const countElement =
            document.getElementById(
                "walletTransactionCount"
            );


        const totalElement =
            document.getElementById(
                "walletTransactionTotal"
            );


        if (countElement) {

            countElement.textContent =
                transactions.length;

        }


        if (totalElement) {

            totalElement.textContent =
                "₹" +
                totalAmount.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        // =================================================
        // REPORT CONTENT
        // =================================================

        const content =
            document.getElementById(
                "walletTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // EMPTY REPORT
        // =================================================

        if (transactions.length === 0) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px 20px;
                        text-align:center;
                        color:#64748b;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                    "
                >

                    <div
                        style="
                            font-size:28px;
                            margin-bottom:10px;
                        "
                    >
                        👛
                    </div>

                    No Wallet Transactions found.

                </div>

            `;

            return;

        }


        // =================================================
        // BUILD TABLE ROWS
        // =================================================

        const rows =
            transactions.map(
                function (transaction) {

                    // -------------------------------------
                    // DATE
                    // -------------------------------------

                    let formattedDate = "-";


                    if (transaction.date) {

                        const parts =
                            String(
                                transaction.date
                            ).split("-");


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
                        else {

                            formattedDate =
                                transaction.date;

                        }

                    }


                    // -------------------------------------
                    // AMOUNT
                    // -------------------------------------

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


                    // -------------------------------------
// FROM ACCOUNT
// -------------------------------------

const fromAccount =
    transaction.fromAccountId
        ? (
            accountNameMap.get(
                transaction.fromAccountId
            ) ||
            transaction.fromAccountId
        )
        : "-";


// -------------------------------------
// TO ACCOUNT
// -------------------------------------

const toAccount =
    transaction.toAccountId
        ? (
            accountNameMap.get(
                transaction.toAccountId
            ) ||
            transaction.toAccountId
        )
        : "-";


                    return `

                        <tr>

                            <td>
                                ${formattedDate}
                            </td>


                            <td>
                                👛 Wallet Payment
                            </td>


                            <td>
                                ${transaction.category || "-"}
                            </td>


                            <td>
                                ${transaction.partyName || "-"}
                            </td>


                            <td
                                style="
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${formattedAmount}
                            </td>


                            <td>
                                ${fromAccount}
                            </td>


                            <td>
                                ${toAccount}
                            </td>


                            <td>
                                ${transaction.paymentMethod || "-"}
                            </td>


                            <td>
                                ${transaction.linkedModule || "-"}
                            </td>


                            <td>
                                ${transaction.notes || "-"}
                            </td>

                        </tr>

                    `;

                }
            ).join("");


        // =================================================
        // RENDER TABLE
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    width:100%;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        min-width:1100px;
                        background:#ffffff;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173b70;
                                color:#ffffff;
                            "
                        >

                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Date
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Type
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Category
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Party
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:right;
                                "
                            >
                                Amount
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                From Account
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                To Account
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Payment Method
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Linked Module
                            </th>


                            <th
                                style="
                                    padding:11px;
                                    text-align:left;
                                "
                            >
                                Notes
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <!-- =========================================
                 REPORT TOTAL
            ========================================== -->

            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    display:flex;
                    justify-content:flex-end;
                    align-items:center;
                    gap:25px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:12px;
                    "
                >

                    Total Wallet Transactions:

                    <strong
                        style="
                            color:#173b70;
                            margin-left:5px;
                        "
                    >
                        ${transactions.length}
                    </strong>

                </div>


                <div
                    style="
                        color:#173b70;
                        font-size:14px;
                        font-weight:700;
                    "
                >

                    Total Wallet Amount:

                    <strong
                        style="
                            color:#087443;
                            font-size:17px;
                            margin-left:6px;
                        "
                    >

                        ₹${totalAmount.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </strong>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "❌ Wallet Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "walletTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        color:#b00020;
                    "
                >

                    ❌ Unable to load Wallet Transactions.

                    <br><br>

                    Please check Console.

                </div>

            `;

        }

    }

}

// =========================================================
// #25 CASHBACK TRANSACTIONS
// =========================================================

async function renderCashbackTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #25 Cashback Transactions
                        </strong>

                        <span>
                            <strong>Reporting Period:</strong>
                            All Cashback Transactions
                        </span>

                    </div>

                </div>


                <div style="padding:20px 30px;">

                    <div
                        style="
                            display:flex;
                            gap:18px;
                            flex-wrap:wrap;
                        "
                    >

                        <div
                            style="
                                flex:1;
                                min-width:190px;
                                padding:16px 18px;
                                border:1px solid #dce5f0;
                                border-radius:10px;
                                background:#f8fbff;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    margin-bottom:5px;
                                "
                            >
                                Cashback Transactions
                            </div>

                            <strong
                                id="cashbackTransactionCount"
                                style="
                                    color:#173b70;
                                    font-size:21px;
                                "
                            >
                                0
                            </strong>

                        </div>


                        <div
                            style="
                                flex:1;
                                min-width:190px;
                                padding:16px 18px;
                                border:1px solid #dce5f0;
                                border-radius:10px;
                                background:#f8fbff;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    margin-bottom:5px;
                                "
                            >
                                Total Cashback Amount
                            </div>

                            <strong
                                id="cashbackTransactionTotal"
                                style="
                                    color:#087443;
                                    font-size:21px;
                                "
                            >
                                ₹0.00
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <div
                id="cashbackTransactionsReportContent"
                style="padding:0 30px 30px;"
            >

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#64748b;
                    "
                >
                    Loading cashback transactions...
                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                renderTransactionReports();

            }
        );

    }


    // =====================================================
    // FIREBASE USER
    // =====================================================

    const user =
        auth.currentUser;


    if (!user) {

        return;

    }


    try {

        // =================================================
        // LOAD TRANSACTIONS
        // =================================================

        const transactionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            );


        const transactions = [];


        // =================================================
        // LOAD ACCOUNT NAMES
        // =================================================

        const accountNameMap = new Map();


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
            function (accountDoc) {

                const account =
                    accountDoc.data();

                accountNameMap.set(
                    accountDoc.id,
                    account.name ||
                        "Unnamed Account"
                );

            }
        );


        // =================================================
        // ONLY CASHBACK TRANSACTIONS
        // =================================================

        transactionsSnapshot.forEach(
            function (transactionDoc) {

                const transaction =
                    transactionDoc.data();


                if (
                    transaction.deleted === true
                ) {

                    return;

                }


                if (
                    transaction.type !==
                    "cashback"
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );



// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

sortTransactionsOldestFirst(transactions);


        // =================================================
        // TOTAL
        // =================================================

        const totalAmount =
            transactions.reduce(
                function (sum, transaction) {

                    return (
                        sum +
                        Number(
                            transaction.amount || 0
                        )
                    );

                },
                0
            );


        // =================================================
        // UPDATE SUMMARY
        // =================================================

        const countElement =
            document.getElementById(
                "cashbackTransactionCount"
            );


        const totalElement =
            document.getElementById(
                "cashbackTransactionTotal"
            );


        if (countElement) {

            countElement.textContent =
                transactions.length;

        }


        if (totalElement) {

            totalElement.textContent =
                "₹" +
                totalAmount.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        // =================================================
        // CONTENT
        // =================================================

        const content =
            document.getElementById(
                "cashbackTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // EMPTY REPORT
        // =================================================

        if (transactions.length === 0) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px 20px;
                        text-align:center;
                        color:#64748b;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                    "
                >

                    <div
                        style="
                            font-size:28px;
                            margin-bottom:10px;
                        "
                    >
                        🎁
                    </div>

                    No Cashback Transactions found.

                </div>

            `;

            return;

        }


        // =================================================
        // BUILD TABLE ROWS
        // =================================================

        const rows =
            transactions.map(
                function (transaction) {

                    let formattedDate = "-";


                    if (transaction.date) {

                        const parts =
                            String(
                                transaction.date
                            ).split("-");


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
                        else {

                            formattedDate =
                                transaction.date;

                        }

                    }


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


                    const fromAccount =
                        transaction.fromAccountId
                            ? (
                                accountNameMap.get(
                                    transaction.fromAccountId
                                ) ||
                                transaction.fromAccountId
                            )
                            : "-";


                    const toAccount =
                        transaction.toAccountId
                            ? (
                                accountNameMap.get(
                                    transaction.toAccountId
                                ) ||
                                transaction.toAccountId
                            )
                            : "-";


                    return `

                        <tr>

                            <td>
                                ${formattedDate}
                            </td>


                            <td>
                                🎁 Cashback
                            </td>


                            <td>
                                ${transaction.category || "-"}
                            </td>


                            <td>
                                ${transaction.partyName || "-"}
                            </td>


                            <td
                                style="
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${formattedAmount}
                            </td>


                            <td>
                                ${fromAccount}
                            </td>


                            <td>
                                ${toAccount}
                            </td>


                            <td>
                                ${transaction.paymentMethod || "-"}
                            </td>


                            <td>
                                ${transaction.linkedModule || "-"}
                            </td>


                            <td>
                                ${transaction.notes || "-"}
                            </td>

                        </tr>

                    `;

                }
            ).join("");


        // =================================================
        // FINAL TABLE
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        min-width:1100px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173f78;
                                color:white;
                            "
                        >

                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Party</th>
                            <th>Amount</th>
                            <th>From Account</th>
                            <th>To Account</th>
                            <th>Payment Method</th>
                            <th>Linked Module</th>
                            <th>Notes</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>


                    <tfoot>

                        <tr
                            style="
                                font-weight:700;
                                background:#f8fbff;
                            "
                        >

                            <td
                                colspan="4"
                                style="text-align:right;"
                            >
                                Total Cashback:
                            </td>

                            <td
                                style="
                                    text-align:right;
                                    color:#087443;
                                "
                            >
                                ₹${totalAmount.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits:2,
                                        maximumFractionDigits:2
                                    }
                                )}
                            </td>

                            <td colspan="5"></td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Cashback Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "cashbackTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#b00020;
                    "
                >
                    ❌ Unable to load Cashback Transactions.
                </div>

            `;

        }

    }

}

// =========================================================
// #26 DELETED TRANSACTIONS
// =========================================================

async function renderDeletedTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <div class="report-document-header">

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            #26 Deleted Transactions
                        </strong>

                        <span>
                            <strong>Reporting Period:</strong>
                            All Deleted Transactions
                        </span>

                    </div>

                </div>


                <div style="padding:20px 30px;">

                    <div
                        style="
                            display:flex;
                            gap:18px;
                            flex-wrap:wrap;
                        "
                    >

                        <div
                            style="
                                flex:1;
                                min-width:190px;
                                padding:16px 18px;
                                border:1px solid #dce5f0;
                                border-radius:10px;
                                background:#f8fbff;
                            "
                        >

                            <div
                                style="
                                    color:#64748b;
                                    font-size:12px;
                                    margin-bottom:5px;
                                "
                            >
                                Deleted Transactions
                            </div>

                            <strong
                                id="deletedTransactionCount"
                                style="
                                    color:#173b70;
                                    font-size:21px;
                                "
                            >
                                0
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <div
                id="deletedTransactionsReportContent"
                style="padding:0 30px 30px;"
            >

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#64748b;
                    "
                >
                    Loading deleted transactions...
                </div>

            </div>

        </div>

    `;


    // =====================================================
    // BACK BUTTON
    // =====================================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                renderTransactionReports();

            }
        );

    }


    // =====================================================
    // FIREBASE USER
    // =====================================================

    const user =
        auth.currentUser;


    if (!user) {

        return;

    }


    try {

        // =================================================
        // LOAD TRANSACTIONS
        // =================================================

        const transactionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "transactions"
                )
            );


        const transactions = [];


        // =================================================
        // LOAD ACCOUNT NAMES
        // =================================================

        const accountNameMap = new Map();


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
            function (accountDoc) {

                const account =
                    accountDoc.data();

                accountNameMap.set(
                    accountDoc.id,
                    account.name ||
                        "Unnamed Account"
                );

            }
        );


        // =================================================
        // ONLY DELETED TRANSACTIONS
        // =================================================

        transactionsSnapshot.forEach(
            function (transactionDoc) {

                const transaction =
                    transactionDoc.data();


                if (
                    transaction.deleted !== true
                ) {

                    return;

                }


                transactions.push({

                    id:
                        transactionDoc.id,

                    ...transaction

                });

            }
        );


// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

sortTransactionsOldestFirst(transactions);

        // =================================================
        // UPDATE COUNT
        // =================================================

        const countElement =
            document.getElementById(
                "deletedTransactionCount"
            );


        if (countElement) {

            countElement.textContent =
                transactions.length;

        }


        // =================================================
        // CONTENT
        // =================================================

        const content =
            document.getElementById(
                "deletedTransactionsReportContent"
            );


        if (!content) {

            return;

        }


        // =================================================
        // NO DATA
        // =================================================

        if (transactions.length === 0) {

            content.innerHTML = `

                <div
                    style="
                        padding:40px 20px;
                        text-align:center;
                        color:#64748b;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                    "
                >

                    <div
                        style="
                            font-size:28px;
                            margin-bottom:10px;
                        "
                    >
                        🗑️
                    </div>

                    No Deleted Transactions found.

                </div>

            `;

            return;

        }


        // =================================================
        // BUILD TABLE ROWS
        // =================================================

        const rows =
            transactions.map(
                function (transaction) {

                    let formattedDate = "-";


                    if (transaction.date) {

                        const parts =
                            String(
                                transaction.date
                            ).split("-");


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
                        else {

                            formattedDate =
                                transaction.date;

                        }

                    }


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


                    const fromAccount =
                        transaction.fromAccountId
                            ? (
                                accountNameMap.get(
                                    transaction.fromAccountId
                                ) ||
                                transaction.fromAccountId
                            )
                            : "-";


                    const toAccount =
                        transaction.toAccountId
                            ? (
                                accountNameMap.get(
                                    transaction.toAccountId
                                ) ||
                                transaction.toAccountId
                            )
                            : "-";


                    return `

                        <tr>

                            <td>
                                ${formattedDate}
                            </td>


                            <td>
                                ${transaction.type || "-"}
                            </td>


                            <td>
                                ${transaction.category || "-"}
                            </td>


                            <td>
                                ${transaction.partyName || "-"}
                            </td>


                            <td
                                style="
                                    text-align:right;
                                    font-weight:700;
                                "
                            >
                                ₹${formattedAmount}
                            </td>


                            <td>
                                ${fromAccount}
                            </td>


                            <td>
                                ${toAccount}
                            </td>


                            <td>
                                ${transaction.paymentMethod || "-"}
                            </td>


                            <td>
                                ${transaction.linkedModule || "-"}
                            </td>


                            <td>
                                ${transaction.notes || "-"}
                            </td>

                        </tr>

                    `;

                }
            ).join("");


        // =================================================
        // FINAL TABLE
        // =================================================

        content.innerHTML = `

            <div
                style="
                    overflow-x:auto;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        min-width:1100px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#173f78;
                                color:white;
                            "
                        >

                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Party</th>
                            <th>Amount</th>
                            <th>From Account</th>
                            <th>To Account</th>
                            <th>Payment Method</th>
                            <th>Linked Module</th>
                            <th>Notes</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


            <div
                style="
                    margin-top:16px;
                    padding:14px 18px;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                    text-align:right;
                "
            >

                <strong
                    style="
                        color:#173b70;
                    "
                >
                    Total Deleted Transactions:
                </strong>

                <strong
                    style="
                        color:#b00020;
                        margin-left:6px;
                    "
                >
                    ${transactions.length}
                </strong>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Deleted Transactions Report Error:",
            error
        );


        const content =
            document.getElementById(
                "deletedTransactionsReportContent"
            );


        if (content) {

            content.innerHTML = `

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#b00020;
                    "
                >
                    ❌ Unable to load Deleted Transactions.
                </div>

            `;

        }

    }

}



 // =========================================================
 // #27 EDITED TRANSACTIONS
 // =========================================================

async function renderEditedTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">

                <div style="
                    padding:24px 30px 18px;
                    border-bottom:1px solid #d9e1ec;
                ">

                    <strong style="
                        font-size:22px;
                        color:#173b70;
                    ">
                        #27 Edited Transactions
                    </strong>

                    <p>
                        Reporting Period: All Edited Transactions
                    </p>

                </div>

                <div style="padding:20px 30px;">

                    <div style="
                        padding:16px 18px;
                        border:1px solid #dce5f0;
                        border-radius:10px;
                        background:#f8fbff;
                    ">

                        <div style="color:#64748b;font-size:12px;">
                            Edited Transactions
                        </div>

                        <strong
                            id="editedTransactionCount"
                            style="color:#173b70;font-size:21px;"
                        >
                            0
                        </strong>

                    </div>

                </div>

            </div>

            <div
                id="editedTransactionsReportContent"
                style="padding:0 30px 30px;"
            >
                <div style="padding:30px;text-align:center;">
                    Loading edited transactions...
                </div>
            </div>

        </div>

    `;

    const backButton =
        document.getElementById("backToTransactionReports");

    if (backButton) {
        backButton.addEventListener("click", function () {
            renderTransactionReports();
        });
    }

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    try {

        const transactionsSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            )
        );

        const accountNameMap = new Map();

        const accountsSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            )
        );

        accountsSnapshot.forEach(function (accountDoc) {

            const account = accountDoc.data();

            accountNameMap.set(
                accountDoc.id,
                account.name || "Unnamed Account"
            );

        });

        const transactions = [];

        transactionsSnapshot.forEach(function (transactionDoc) {

            const transaction = transactionDoc.data();

            // Exclude deleted transactions
            if (transaction.deleted === true) {
                return;
            }

            // Existing edit logic saves updatedAt
            if (!transaction.updatedAt) {
                return;
            }

            transactions.push({
                id: transactionDoc.id,
                ...transaction
            });

        });

// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

sortTransactionsOldestFirst(transactions);

        const countElement =
            document.getElementById("editedTransactionCount");

        if (countElement) {
            countElement.textContent = transactions.length;
        }

        const content =
            document.getElementById(
                "editedTransactionsReportContent"
            );

        if (!content) {
            return;
        }

        if (transactions.length === 0) {

            content.innerHTML = `
                <div style="
                    padding:40px 20px;
                    text-align:center;
                    color:#64748b;
                    border:1px solid #dce5f0;
                    border-radius:10px;
                    background:#f8fbff;
                ">
                    <div style="font-size:28px;margin-bottom:10px;">
                        ✏️
                    </div>

                    No Edited Transactions found.
                </div>
            `;

            return;
        }

        const rows = transactions.map(function (transaction) {

            let formattedDate = "-";

            if (transaction.date) {

                const parts =
                    String(transaction.date).split("-");

                formattedDate =
                    parts.length === 3
                        ? `${parts[2]}-${parts[1]}-${parts[0]}`
                        : transaction.date;

            }

            let editedOn = "-";

            if (transaction.updatedAt?.toDate) {

                editedOn =
                    transaction.updatedAt
                        .toDate()
                        .toLocaleString("en-IN");

            }

            const formattedAmount =
                Number(transaction.amount || 0).toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

            const fromAccount =
                transaction.fromAccountId
                    ? (
                        accountNameMap.get(
                            transaction.fromAccountId
                        ) || transaction.fromAccountId
                    )
                    : "-";

            const toAccount =
                transaction.toAccountId
                    ? (
                        accountNameMap.get(
                            transaction.toAccountId
                        ) || transaction.toAccountId
                    )
                    : "-";

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${editedOn}</td>
                    <td>${transaction.type || "-"}</td>
                    <td>${transaction.category || "-"}</td>
                    <td>${transaction.partyName || "-"}</td>

                    <td style="text-align:right;font-weight:700;">
                        ₹${formattedAmount}
                    </td>

                    <td>${fromAccount}</td>
                    <td>${toAccount}</td>
                    <td>${transaction.paymentMethod || "-"}</td>
                    <td>${transaction.linkedModule || "-"}</td>
                    <td>${transaction.notes || "-"}</td>
                </tr>
            `;

        }).join("");

        content.innerHTML = `

            <div style="
                overflow-x:auto;
                border:1px solid #dce5f0;
                border-radius:10px;
            ">

                <table style="
                    width:100%;
                    border-collapse:collapse;
                    min-width:1250px;
                ">

                    <thead>
                        <tr style="background:#173f78;color:white;">
                            <th>Date</th>
                            <th>Edited On</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Party</th>
                            <th>Amount</th>
                            <th>From Account</th>
                            <th>To Account</th>
                            <th>Payment Method</th>
                            <th>Linked Module</th>
                            <th>Notes</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

            <div style="
                margin-top:16px;
                padding:14px 18px;
                border:1px solid #dce5f0;
                border-radius:10px;
                background:#f8fbff;
                text-align:right;
            ">
                <strong style="color:#173b70;">
                    Total Edited Transactions:
                </strong>

                <strong style="margin-left:6px;">
                    ${transactions.length}
                </strong>
            </div>

        `;

    }
    catch (error) {

        console.error(
            "Edited Transactions Report Error:",
            error
        );

        const content =
            document.getElementById(
                "editedTransactionsReportContent"
            );

        if (content) {

            content.innerHTML = `
                <div style="
                    padding:30px;
                    text-align:center;
                    color:#b00020;
                ">
                    Unable to load Edited Transactions.
                    Please check the console.
                </div>
            `;

        }

    }

}

// =====================================================
// REPORT #28 — RECENTLY ADDED TRANSACTIONS
// =====================================================

async function renderRecentlyAddedTransactionsReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">

                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">

                    <div style="display:flex; align-items:center; gap:28px; flex-wrap:wrap; color:#173b70;">

                        <strong style="font-size:22px; color:#173b70;">
                            #28 Recently Added Transactions
                        </strong>

                        <span>
                            <strong>Reporting Period:</strong>
                            All Transactions, Oldest First
                        </span>

                    </div>

                </div>

                <div style="padding:20px 30px;">

                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">

                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Recently Added Transactions
                        </div>

                        <strong
                            id="recentTransactionCount"
                            style="color:#173b70; font-size:21px;"
                        >
                            0
                        </strong>

                    </div>

                </div>

            </div>

            <div id="recentTransactionsReportContent" style="padding:0 30px 30px;">

                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading recently added transactions...
                </div>

            </div>

        </div>

    `;


    const backButton = document.getElementById(
        "backToTransactionReports"
    );

    if (backButton) {

        backButton.addEventListener("click", function () {

            renderTransactionReports();

        });

    }


    const user = auth.currentUser;

    if (!user) {
        return;
    }


    try {

        const transactionsSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            )
        );


        const accountNameMap = new Map();

        const accountsSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            )
        );

        accountsSnapshot.forEach(function (accountDoc) {

            const account = accountDoc.data();

            accountNameMap.set(
                accountDoc.id,
                account.name || "Unnamed Account"
            );

        });


        const transactions = [];

        transactionsSnapshot.forEach(function (transactionDoc) {

            const transaction = transactionDoc.data();

            if (
                transaction.deleted === true ||
                !transaction.createdAt
            ) {
                return;
            }

            transactions.push({
                id: transactionDoc.id,
                ...transaction
            });

        });


// =================================================
// SORT — OLDEST FIRST / ASCENDING
// =================================================

sortTransactionsOldestFirst(transactions);

        const countElement = document.getElementById(
            "recentTransactionCount"
        );

        if (countElement) {
            countElement.textContent = transactions.length;
        }


        const content = document.getElementById(
            "recentTransactionsReportContent"
        );

        if (!content) {
            return;
        }


        if (transactions.length === 0) {

            content.innerHTML = `

                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">

                    No Recently Added Transactions found.

                </div>

            `;

            return;

        }


        const rows = transactions.map(function (transaction) {

            let transactionDate = "-";

            if (transaction.date) {

                const parts = String(transaction.date).split("-");

                transactionDate = parts.length === 3
                    ? `${parts[2]}-${parts[1]}-${parts[0]}`
                    : transaction.date;

            }


            let addedOn = "-";

            if (transaction.createdAt?.toDate) {

                addedOn = transaction.createdAt
                    .toDate()
                    .toLocaleString("en-IN");

            } else if (transaction.createdAt) {

                const parsedDate = new Date(transaction.createdAt);

                if (!isNaN(parsedDate.getTime())) {
                    addedOn = parsedDate.toLocaleString("en-IN");
                }

            }


            const amount = Number(
                transaction.amount || 0
            ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });


            const fromAccount = transaction.fromAccountId
                ? (
                    accountNameMap.get(transaction.fromAccountId) ||
                    transaction.fromAccountId
                )
                : "-";


            const toAccount = transaction.toAccountId
                ? (
                    accountNameMap.get(transaction.toAccountId) ||
                    transaction.toAccountId
                )
                : "-";


            return `

                <tr>

                    <td>${transactionDate}</td>

                    <td>${transaction.type || "-"}</td>

                    <td>${transaction.category || "-"}</td>

                    <td>${transaction.partyName || "-"}</td>

                    <td style="text-align:right; font-weight:700;">
                        ₹${amount}
                    </td>

                    <td>${fromAccount}</td>

                    <td>${toAccount}</td>

                    <td>${transaction.paymentMethod || "-"}</td>

                    <td>${transaction.linkedModule || "-"}</td>

                    <td>${transaction.notes || "-"}</td>

                    <td>${addedOn}</td>

                </tr>

            `;

        }).join("");


        content.innerHTML = `

            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">

                <table style="width:100%; border-collapse:collapse; min-width:1200px;">

                    <thead>

                        <tr style="background:#173f78; color:white;">

                            <th>Added On</th>
                            <th>Transaction Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Party</th>
                            <th>Amount</th>
                            <th>From Account</th>
                            <th>To Account</th>
                            <th>Payment Method</th>
                            <th>Linked Module</th>
                            <th>Notes</th>

                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

            <div style="margin-top:16px; padding:14px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff; text-align:right;">

                <strong style="color:#173b70;">
                    Total Recently Added Transactions:
                </strong>

                <strong style="color:#173b70; margin-left:6px;">
                    ${transactions.length}
                </strong>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Recently Added Transactions Report Error:",
            error
        );

        const content = document.getElementById(
            "recentTransactionsReportContent"
        );

        if (content) {

            content.innerHTML = `

                <div style="padding:30px; text-align:center; color:#b00020;">

                    ❌ Unable to load Recently Added Transactions.

                </div>

            `;

        }

    }

}


// =====================================================
// REPORT #29 — TRANSACTIONS BY CATEGORY
// =====================================================

async function renderTransactionsByCategoryReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">

                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">

                    <strong style="font-size:22px; color:#173b70;">
                        #29 Transactions by Category
                    </strong>

                    <p style="color:#64748b;">
                        Transaction count and amount grouped by category
                    </p>

                </div>

                <div style="padding:20px 30px;">

                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">

                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Total Categories
                        </div>

                        <strong
                            id="categoryReportCount"
                            style="color:#173b70; font-size:21px;"
                        >
                            0
                        </strong>

                    </div>

                </div>

            </div>

            <div id="categoryTransactionsReportContent" style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading category report...
                </div>
            </div>

        </div>

    `;


    const backButton = document.getElementById(
        "backToTransactionReports"
    );

    if (backButton) {
        backButton.addEventListener("click", function () {
            renderTransactionReports();
        });
    }


    const user = auth.currentUser;

    if (!user) {
        return;
    }


    try {

        const snapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "transactions"
            )
        );


        const categoryMap = new Map();


        snapshot.forEach(function (transactionDoc) {

            const transaction = transactionDoc.data();

            if (transaction.deleted === true) {
                return;
            }

            const category = transaction.category || "Uncategorized";
            const amount = Number(transaction.amount || 0);

            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    count: 0,
                    total: 0
                });
            }

            const item = categoryMap.get(category);

            item.count += 1;
            item.total += amount;

        });


        const categories = Array.from(
            categoryMap.entries()
        ).sort(function (a, b) {
            return b[1].total - a[1].total;
        });


        const countElement = document.getElementById(
            "categoryReportCount"
        );

        if (countElement) {
            countElement.textContent = categories.length;
        }


        const content = document.getElementById(
            "categoryTransactionsReportContent"
        );

        if (!content) {
            return;
        }


        if (categories.length === 0) {

            content.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    No Transactions found.
                </div>
            `;

            return;

        }


        const rows = categories.map(function (entry) {

            const category = entry[0];
            const data = entry[1];

            const total = data.total.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

            return `
                <tr>
                    <td>${category}</td>
                    <td style="text-align:right;">${data.count}</td>
                    <td style="text-align:right; font-weight:700;">
                        ₹${total}
                    </td>
                </tr>
            `;

        }).join("");


        const grandTotal = categories.reduce(
            function (sum, entry) {
                return sum + entry[1].total;
            },
            0
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });


        const transactionCount = categories.reduce(
            function (sum, entry) {
                return sum + entry[1].count;
            },
            0
        );


        content.innerHTML = `

            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">

                <table style="width:100%; border-collapse:collapse; min-width:600px;">

                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th>Category</th>
                            <th style="text-align:right;">Transactions</th>
                            <th style="text-align:right;">Total Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td>Grand Total</td>
                            <td style="text-align:right;">${transactionCount}</td>
                            <td style="text-align:right;">₹${grandTotal}</td>
                        </tr>
                    </tfoot>

                </table>

            </div>

        `;

    }
    catch (error) {

        console.error(
            "Transactions by Category Report Error:",
            error
        );

        const content = document.getElementById(
            "categoryTransactionsReportContent"
        );

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    ❌ Unable to load Transactions by Category.
                </div>
            `;
        }

    }

}


 // =====================================================
// REPORT #30 — TRANSACTIONS BY PARTY
// =====================================================

async function renderTransactionsByPartyReport() {

    reportWorkArea.innerHTML = `

        <div class="selected-report-container">

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">

                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">

                    <strong style="font-size:22px; color:#173b70;">
                        #30 Transactions by Party
                    </strong>

                    <p style="color:#64748b;">
                        Transaction count and amount grouped by party
                    </p>

                </div>

                <div style="padding:20px 30px;">

                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">

                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Total Parties
                        </div>

                        <strong
                            id="partyReportCount"
                            style="color:#173b70; font-size:21px;"
                        >
                            0
                        </strong>

                    </div>

                </div>

            </div>

            <div id="partyTransactionsReportContent" style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading party report...
                </div>
            </div>

        </div>

    `;

    const backButton = document.getElementById("backToTransactionReports");


if (backButton) {
    backButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();

        console.log("BACK BUTTON CLICKED - REPORT #16");

        document.querySelector(".reports-header").style.display = "none";
        document.querySelector(".reports-search-section").style.display = "none";
        document.querySelector(".reports-categories-section").style.display = "none";

        renderTransactionReports();

        console.log("TRANSACTION REPORTS RENDERED");
    };
}

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    try {

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const partyMap = new Map();

        snapshot.forEach(function (transactionDoc) {

            const transaction = transactionDoc.data();

            if (transaction.deleted === true) {
                return;
            }

            const party = String(
                transaction.party || transaction.partyName || "Unspecified"
            ).trim() || "Unspecified";

            const amount = Number(transaction.amount || 0);

            if (!partyMap.has(party)) {
                partyMap.set(party, {
                    count: 0,
                    total: 0
                });
            }

            const item = partyMap.get(party);

            item.count += 1;
            item.total += amount;

        });

        const parties = Array.from(partyMap.entries()).sort(
            function (a, b) {
                return b[1].total - a[1].total;
            }
        );

        const countElement = document.getElementById("partyReportCount");

        if (countElement) {
            countElement.textContent = parties.length;
        }

        const content = document.getElementById(
            "partyTransactionsReportContent"
        );

        if (!content) {
            return;
        }

        if (parties.length === 0) {

            content.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    No Transactions found.
                </div>
            `;

            return;
        }

        const rows = parties.map(function (entry) {

            const party = entry[0];
            const data = entry[1];

            const safeParty = party.replace(/[&<>"']/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[char];
            });

            const total = data.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            return `
                <tr>
                    <td>${safeParty}</td>
                    <td style="text-align:right;">${data.count}</td>
                    <td style="text-align:right; font-weight:700;">₹${total}</td>
                </tr>
            `;

        }).join("");

        const grandTotal = parties.reduce(
            function (sum, entry) {
                return sum + entry[1].total;
            },
            0
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const transactionCount = parties.reduce(
            function (sum, entry) {
                return sum + entry[1].count;
            },
            0
        );

        content.innerHTML = `

            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">

                <table style="width:100%; border-collapse:collapse; min-width:600px;">

                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th style="text-align:left;">Party</th>
                            <th style="text-align:right;">Transactions</th>
                            <th style="text-align:right;">Total Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td>Grand Total</td>
                            <td style="text-align:right;">${transactionCount}</td>
                            <td style="text-align:right;">₹${grandTotal}</td>
                        </tr>
                    </tfoot>

                </table>

            </div>

        `;

    } catch (error) {

        console.error("Transactions by Party Report Error:", error);

        const content = document.getElementById(
            "partyTransactionsReportContent"
        );

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    Unable to load Transactions by Party.
                </div>
            `;
        }

    }

}


 // =====================================================
// REPORT #31 — TRANSACTIONS BY ACCOUNT
// =====================================================

async function renderTransactionsByAccountReport() {

    reportWorkArea.innerHTML = `
        <div class="selected-report-container">
            <button type="button" class="back-to-reports-button"
                id="backToTransactionReports">
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">
                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                    <strong style="font-size:22px; color:#173b70;">
                        #31 Transactions by Account
                    </strong>
                    <p style="color:#64748b;">
                        Transactions grouped by account, including transfer accounts
                    </p>
                </div>

                <div style="padding:20px 30px;">
                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Total Accounts
                        </div>
                        <strong id="accountReportCount" style="color:#173b70; font-size:21px;">0</strong>
                    </div>
                </div>
            </div>

            <div id="accountTransactionsReportContent" style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading account report...
                </div>
            </div>
        </div>
    `;

    document.getElementById("backToTransactionReports")
        ?.addEventListener("click", showReportModuleStartPage);

    const user = auth.currentUser;
    if (!user) return;

    try {
        const [transactionSnapshot, accountSnapshot] = await Promise.all([
            getDocs(collection(db, "users", user.uid, "transactions")),
            getDocs(collection(db, "users", user.uid, "accounts"))
        ]);

        const accountMap = new Map();

        accountSnapshot.forEach(function (docSnap) {
            const account = docSnap.data();

            accountMap.set(docSnap.id, {
                name: account.name || account.accountName || docSnap.id,
                count: 0,
                total: 0
            });
        });

        function resolveAccountId(value) {
            if (!value) return "";

            if (typeof value === "object") {
                return String(value.id || value.accountId || value.uid || "");
            }

            return String(value);
        }

        function addTransactionToAccount(accountId, amount) {
            if (!accountId) return;

            if (!accountMap.has(accountId)) {
                accountMap.set(accountId, {
                    name: accountId,
                    count: 0,
                    total: 0
                });
            }

            const account = accountMap.get(accountId);
            account.count += 1;
            account.total += amount;
        }

        transactionSnapshot.forEach(function (docSnap) {
            const transaction = docSnap.data();

            if (transaction.deleted === true) return;

            const amount = Number(transaction.amount) || 0;

            const fromId = resolveAccountId(transaction.fromAccountId);
            const toId = resolveAccountId(transaction.toAccountId);

            if (fromId || toId) {
                if (fromId) addTransactionToAccount(fromId, amount);
                if (toId && toId !== fromId) addTransactionToAccount(toId, amount);
                return;
            }

            const singleAccountId = resolveAccountId(
                transaction.accountId ||
                transaction.account ||
                transaction.accountName
            );

            if (singleAccountId) {
                addTransactionToAccount(singleAccountId, amount);
            }
        });

        const accounts = Array.from(accountMap.values())
            .sort((a, b) => b.total - a.total);

        document.getElementById("accountReportCount").textContent = accounts.length;

        const content = document.getElementById("accountTransactionsReportContent");
        if (!content) return;

        const escapeText = value => String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

        const formatAmount = amount => Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const totalTransactions = accounts.reduce((sum, account) => sum + account.count, 0);
        const totalAmount = accounts.reduce((sum, account) => sum + account.total, 0);

        content.innerHTML = `
            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; min-width:600px;">
                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th style="text-align:left; padding:11px;">Account</th>
                            <th style="text-align:right; padding:11px;">Transactions</th>
                            <th style="text-align:right; padding:11px;">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${accounts.map(account => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${escapeText(account.name)}</td>
                                <td style="text-align:right; padding:10px;">${account.count}</td>
                                <td style="text-align:right; padding:10px; font-weight:700;">
                                    ₹${formatAmount(account.total)}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td style="padding:10px;">Grand Total</td>
                            <td style="text-align:right; padding:10px;">${totalTransactions}</td>
                            <td style="text-align:right; padding:10px;">₹${formatAmount(totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <p style="margin-top:12px; color:#64748b; font-size:12px;">
                Transfer transactions are counted under both From Account and To Account.
                Therefore, the account-wise totals may include the transfer amount twice.
            </p>
        `;

    } catch (error) {
        console.error("Transactions by Account Report Error:", error);

        const content = document.getElementById("accountTransactionsReportContent");

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    Unable to load Transactions by Account. Check the browser console.
                </div>
            `;
        }
    }
}

// =====================================================
// REPORT #32 — TRANSACTIONS BY PAYMENT METHOD
// =====================================================

async function renderTransactionsByPaymentMethodReport() {

    reportWorkArea.innerHTML = `
        <div class="selected-report-container">
            <button type="button" class="back-to-reports-button"
                id="backToTransactionReports">
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">
                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                    <strong style="font-size:22px; color:#173b70;">
                        #32 Transactions by Payment Method
                    </strong>
                    <p style="color:#64748b;">
                        Transaction count and amount grouped by payment method
                    </p>
                </div>

                <div style="padding:20px 30px;">
                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Total Payment Methods
                        </div>
                        <strong id="paymentMethodReportCount"
                            style="color:#173b70; font-size:21px;">0</strong>
                    </div>
                </div>
            </div>

            <div id="paymentMethodReportContent" style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading payment method report...
                </div>
            </div>
        </div>
    `;

    document.getElementById("backToTransactionReports")
        ?.addEventListener("click", function () {
            renderTransactionReports();
        });

    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const methodMap = new Map();


        snapshot.forEach(function (docSnap) {
            const transaction = docSnap.data();

            if (transaction.deleted === true) return;

            const method = String(
                transaction.paymentMethod ||
                transaction.paymentMode ||
                transaction.method ||
                "Unspecified"
            ).trim() || "Unspecified";

            const amount = Number(transaction.amount) || 0;

            if (!methodMap.has(method)) {
                methodMap.set(method, { count: 0, total: 0 });
            }

            const item = methodMap.get(method);
            item.count += 1;
            item.total += amount;
        });

        const methods = Array.from(methodMap.entries()).sort(
            (a, b) => b[1].total - a[1].total
        );

        document.getElementById("paymentMethodReportCount").textContent =
            methods.length;

        const content = document.getElementById("paymentMethodReportContent");
        if (!content) return;

        const formatAmount = amount => Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const escapeText = value => String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

        const transactionCount = methods.reduce(
            (sum, entry) => sum + entry[1].count, 0
        );

        const grandTotal = methods.reduce(
            (sum, entry) => sum + entry[1].total, 0
        );

        if (methods.length === 0) {
            content.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    No Transactions found.
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; min-width:600px;">
                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th style="text-align:left; padding:11px;">Payment Method</th>
                            <th style="text-align:right; padding:11px;">Transactions</th>
                            <th style="text-align:right; padding:11px;">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${methods.map(([method, data]) => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${escapeText(method)}</td>
                                <td style="text-align:right; padding:10px;">${data.count}</td>
                                <td style="text-align:right; padding:10px; font-weight:700;">
                                    ₹${formatAmount(data.total)}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td style="padding:10px;">Grand Total</td>
                            <td style="text-align:right; padding:10px;">${transactionCount}</td>
                            <td style="text-align:right; padding:10px;">₹${formatAmount(grandTotal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Transactions by Payment Method Report Error:", error);

        const content = document.getElementById("paymentMethodReportContent");

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    Unable to load Transactions by Payment Method. Check the browser console.
                </div>
            `;
        }
    }
}



 // =====================================================
 // REPORT #33 — TRANSACTIONS BY LINKED MODULE
 // =====================================================

async function renderTransactionsByLinkedModuleReport() {

    reportWorkArea.innerHTML = `
        <div class="selected-report-container">

            <button type="button"
                class="back-to-reports-button"
                id="backToLinkedModuleReport">
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">
                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                    <strong style="font-size:22px; color:#173b70;">
                        #33 Transactions by Linked Module
                    </strong>

                    <p style="color:#64748b;">
                        Transaction count and amount grouped by linked module
                    </p>
                </div>

                <div style="padding:20px 30px;">
                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Total Linked Modules
                        </div>
                        <strong id="linkedModuleReportCount"
                            style="color:#173b70; font-size:21px;">0</strong>
                    </div>
                </div>
            </div>

            <div id="linkedModuleReportContent"
                style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading linked module report...
                </div>
            </div>

        </div>
    `;

    document.getElementById("backToLinkedModuleReport")
        ?.addEventListener("click", function () {
            renderTransactionReports();
        });

    const user = auth.currentUser;

    if (!user) {
        document.getElementById("linkedModuleReportContent").innerHTML = `
            <div style="padding:25px; color:#b00020;">
                Please log in to view this report.
            </div>
        `;
        return;
    }

    try {

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const moduleMap = new Map();

        const moduleLabels = {
            home_loan: "Home Loan",
            fixed_deposit: "Fixed Deposit",
            shares: "Shares",
            sip: "SIP / Mutual Fund",
            rental: "Rental",
            credit_card: "Credit Card"
        };

        snapshot.forEach(function (docSnap) {

            const transaction = docSnap.data();

            if (transaction.deleted === true) return;

            const linkedModule = String(
                transaction.linkedModule || ""
            ).trim();

            if (!linkedModule) return;

            const label = moduleLabels[linkedModule] || linkedModule;
            const amount = Number(transaction.amount) || 0;

            if (!moduleMap.has(label)) {
                moduleMap.set(label, {
                    count: 0,
                    total: 0
                });
            }

            const item = moduleMap.get(label);
            item.count += 1;
            item.total += amount;

        });

        const modules = Array.from(moduleMap.entries()).sort(
            (a, b) => b[1].total - a[1].total
        );

        document.getElementById("linkedModuleReportCount").textContent =
            modules.length;

        const content = document.getElementById("linkedModuleReportContent");

        if (!content) return;

        const formatAmount = amount =>
            Number(amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        const escapeText = value => String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

        const transactionCount = modules.reduce(
            (sum, entry) => sum + entry[1].count, 0
        );

        const grandTotal = modules.reduce(
            (sum, entry) => sum + entry[1].total, 0
        );

        if (modules.length === 0) {
            content.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    No linked-module transactions found.
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; min-width:600px;">
                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th style="text-align:left; padding:11px;">Linked Module</th>
                            <th style="text-align:right; padding:11px;">Transactions</th>
                            <th style="text-align:right; padding:11px;">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${modules.map(([module, data]) => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${escapeText(module)}</td>
                                <td style="text-align:right; padding:10px;">${data.count}</td>
                                <td style="text-align:right; padding:10px; font-weight:700;">
                                    ₹${formatAmount(data.total)}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td style="padding:10px;">Grand Total</td>
                            <td style="text-align:right; padding:10px;">${transactionCount}</td>
                            <td style="text-align:right; padding:10px;">₹${formatAmount(grandTotal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

    } catch (error) {

        console.error("Transactions by Linked Module Report Error:", error);

        const content = document.getElementById("linkedModuleReportContent");

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    Unable to load Transactions by Linked Module.
                    Check the browser console.
                </div>
            `;
        }
    }
}


 // =====================================================
 // REPORT #34 — TRANSACTIONS WITHOUT CATEGORY
 // =====================================================

async function renderTransactionsWithoutCategoryReport() {

    reportWorkArea.innerHTML = `
        <div class="selected-report-container">

            <button type="button"
                class="back-to-reports-button"
                id="backToNoCategoryReport">
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">
                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                    <strong style="font-size:22px; color:#173b70;">
                        #34 Transactions without Category
                    </strong>
                    <p style="color:#64748b;">
                        Transactions with a missing category
                    </p>
                </div>

                <div style="padding:20px 30px;">
                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Transactions without Category
                        </div>
                        <strong id="noCategoryCount"
                            style="color:#173b70; font-size:21px;">0</strong>
                    </div>
                </div>
            </div>

            <div id="noCategoryContent" style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading transactions...
                </div>
            </div>

        </div>
    `;

    document.getElementById("backToNoCategoryReport")
        ?.addEventListener("click", function () {
            renderTransactionReports();
        });

    const user = auth.currentUser;

    if (!user) {
        document.getElementById("noCategoryContent").innerHTML = `
            <div style="padding:25px; color:#b00020;">
                Please log in to view this report.
            </div>
        `;
        return;
    }

    try {

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const transactions = [];

        snapshot.forEach(function (docSnap) {

            const transaction = docSnap.data();

            if (transaction.deleted === true) return;

            const category = String(
                transaction.category ?? ""
            ).trim();

            if (!category) {
                transactions.push({
                    id: docSnap.id,
                    date: transaction.date || "",
                    type: transaction.type || "",
                    amount: Number(transaction.amount) || 0,
                    partyName: transaction.partyName || "",
                    notes: transaction.notes || ""
                });
            }

        });

        transactions.sort((a, b) =>
            String(b.date).localeCompare(String(a.date))
        );

        document.getElementById("noCategoryCount").textContent =
            transactions.length;

        const content = document.getElementById("noCategoryContent");

        if (!content) return;

        const formatAmount = amount =>
            Number(amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        const escapeText = value => String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

        const totalAmount = transactions.reduce(
            (sum, transaction) => sum + transaction.amount, 0
        );

        if (transactions.length === 0) {
            content.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:#64748b; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    Great! No transactions without a category were found.
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; min-width:750px;">
                    <thead>
                        <tr style="background:#173f78; color:white;">
                            <th style="text-align:left; padding:11px;">Date</th>
                            <th style="text-align:left; padding:11px;">Type</th>
                            <th style="text-align:left; padding:11px;">Party / Merchant</th>
                            <th style="text-align:left; padding:11px;">Notes</th>
                            <th style="text-align:right; padding:11px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${escapeText(transaction.date)}</td>
                                <td style="padding:10px;">${escapeText(transaction.type)}</td>
                                <td style="padding:10px;">${escapeText(transaction.partyName || "-")}</td>
                                <td style="padding:10px;">${escapeText(transaction.notes || "-")}</td>
                                <td style="text-align:right; padding:10px; font-weight:700;">
                                    ₹${formatAmount(transaction.amount)}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fbff; font-weight:700;">
                            <td colspan="4" style="padding:10px;">Grand Total</td>
                            <td style="text-align:right; padding:10px;">
                                ₹${formatAmount(totalAmount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

    } catch (error) {

        console.error("Transactions without Category Report Error:", error);

        const content = document.getElementById("noCategoryContent");

        if (content) {
            content.innerHTML = `
                <div style="padding:30px; text-align:center; color:#b00020;">
                    Unable to load Transactions without Category.
                    Check the browser console.
                </div>
            `;
        }
    }
}



async function renderTransactionsWithoutPartyReport() {

reportWorkArea.innerHTML = `
    <div class="selected-report-container">

        <button type="button"
            class="back-to-reports-button"
            id="backToNoPartyReport">
            ← Back to Transaction Reports
        </button>

        <div class="report-document-header">

            <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                <strong style="font-size:22px; color:#173b70;">
                    #35 Transactions without Party
                </strong>
                <p style="color:#64748b;">
                    Transactions where the party name is missing
                </p>
            </div>

            <div style="padding:20px 30px;">
                <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                    <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                        Transactions without Party
                    </div>
                    <strong id="noPartyCount"
                        style="color:#173b70; font-size:21px;">0</strong>
                </div>
            </div>

        </div>

        <div id="transactionsWithoutPartyContent"
             style="padding:0 30px 30px;">
            <div style="padding:30px; text-align:center; color:#64748b;">
                Loading transactions...
            </div>
        </div>

    </div>
`;

document.getElementById("backToNoPartyReport")
    ?.addEventListener("click", function () {
        renderTransactionReports();
    });


    const content = document.getElementById("transactionsWithoutPartyContent");

    try {
        if (!currentUser) {
    content.innerHTML = `<p>Please log in to view this report.</p>`;
    return;
}

const snapshot = await getDocs(
    collection(db, "users", currentUser.uid, "transactions")
);

        const transactions = [];

        snapshot.forEach((docSnap) => {
            const transaction = docSnap.data();

            if (transaction.deleted === true) return;

            const partyName = String(
                transaction.partyName ?? ""
            ).trim();

            if (!partyName) {
                transactions.push({
                    id: docSnap.id,
                    ...transaction
                });
            }
        });

        document.getElementById("noPartyCount").textContent =
    transactions.length;

        if (transactions.length === 0) {
            content.innerHTML = `
                <p>No transactions found without a party name.</p>
            `;
            return;
        }

        const totalAmount = transactions.reduce(
            (sum, transaction) =>
                sum + (Number(transaction.amount) || 0),
            0
        );

        content.innerHTML = `
            <div class="report-summary">
                <div class="summary-card">
                    <h4>Transactions without Party</h4>
                    <p>${transactions.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Total Amount</h4>
                    <p>₹${totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</p>
                </div>
            </div>

            <div class="table-responsive">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Notes</th>
                            <th>Transaction ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>

<td>${formatTransactionDate(transaction.date)}</td>
                                <td>${transaction.type || "-"}</td>
                                <td>₹${(
                                    Number(transaction.amount) || 0
                                ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td>${transaction.category || "-"}</td>
                                <td>${transaction.notes || "-"}</td>
                                <td>${transaction.id}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error(
            "Error generating Transactions without Party report:",
            error
        );

        content.innerHTML = `
            <p>Unable to load report. Please check the console for errors.</p>
        `;
    }
}



async function renderTransactionsWithoutNotesReport() {

    console.log("REPORT #36 FUNCTION STARTED");

    reportWorkArea.innerHTML = `
        <div class="selected-report-container">

            <button type="button"
                class="back-to-reports-button"
                id="backToNoNotesReport">
                ← Back to Transaction Reports
            </button>

            <div class="report-document-header">

                <div style="padding:24px 30px 18px; border-bottom:1px solid #d9e1ec;">
                    <strong style="font-size:22px; color:#173b70;">
                        #36 Transactions without Notes
                    </strong>
                    <p style="color:#64748b;">
                        Transactions where notes or descriptions are missing
                    </p>
                </div>

                <div style="padding:20px 30px;">
                    <div style="padding:16px 18px; border:1px solid #dce5f0; border-radius:10px; background:#f8fbff;">
                        <div style="color:#64748b; font-size:12px; margin-bottom:5px;">
                            Transactions without Notes
                        </div>
                        <strong id="noNotesCount"
                            style="color:#173b70; font-size:21px;">0</strong>
                    </div>
                </div>

            </div>

            <div id="transactionsWithoutNotesContent"
                 style="padding:0 30px 30px;">
                <div style="padding:30px; text-align:center; color:#64748b;">
                    Loading transactions...
                </div>
            </div>

        </div>
    `;

    document.getElementById("backToNoNotesReport")
        ?.addEventListener("click", function () {
            renderTransactionReports();
        });

    const content = document.getElementById(
        "transactionsWithoutNotesContent"
    );


    try {
       const user = auth.currentUser;

if (!user) {
    content.innerHTML = `
        <div style="padding:25px; color:#b00020;">
            Please log in to view this report.
        </div>
    `;
    return;
}

const snapshot = await getDocs(
    collection(db, "users", user.uid, "transactions")
);

        const transactions = [];

        snapshot.forEach((docSnap) => {
            const transaction = docSnap.data();


console.log("REPORT #36 CHECK:", {
    id: docSnap.id,
    date: transaction.date,
    category: transaction.category,
    amount: transaction.amount,
    notes: transaction.notes,
    deleted: transaction.deleted
});

            if (transaction.deleted === true) return;

const notes = String(
    transaction.notes ?? ""
).trim();

if (!notes || notes === "-" || notes === "—") {

                transactions.push({
                    id: docSnap.id,
                    ...transaction
                });
            }


        });


// Oldest First — ascending transaction date
sortTransactionsOldestFirst(transactions);

        if (transactions.length === 0) {
            content.innerHTML = `
                <p>No transactions found without notes.</p>
            `;
            return;
        }

        const totalAmount = transactions.reduce(
            (sum, transaction) =>
                sum + (Number(transaction.amount) || 0),
            0
        );


document.getElementById("noNotesCount").textContent =
    transactions.length;

const formatAmount = amount =>
    (Number(amount) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const escapeText = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

content.innerHTML = `
    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:20px;">
        <div class="summary-card" style="flex:1; min-width:200px;">
            <h4>Transactions without Notes</h4>
            <p>${transactions.length}</p>
        </div>

        <div class="summary-card" style="flex:1; min-width:200px;">
            <h4>Total Amount</h4>
            <p>₹${formatAmount(totalAmount)}</p>
        </div>
    </div>

    <div style="overflow-x:auto; border:1px solid #dce5f0; border-radius:10px;">
        <table style="width:100%; min-width:850px; border-collapse:collapse;">
            <thead>
                <tr style="background:#173f78; color:white;">
                    <th style="text-align:left; padding:12px;">Date</th>
                    <th style="text-align:left; padding:12px;">Type</th>
                    <th style="text-align:right; padding:12px;">Amount</th>
                    <th style="text-align:left; padding:12px;">Category</th>
                    <th style="text-align:left; padding:12px;">Party</th>
                    <th style="text-align:left; padding:12px;">Transaction ID</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(transaction => `
                    <tr style="border-bottom:1px solid #e5ebf3;">
                        <td style="padding:11px;">${escapeText(transaction.date || "-")}</td>
                        <td style="padding:11px;">${escapeText(transaction.type || "-")}</td>
                        <td style="padding:11px; text-align:right; white-space:nowrap;">
                            ₹${formatAmount(transaction.amount)}
                        </td>
                        <td style="padding:11px;">${escapeText(transaction.category || "-")}</td>
                        <td style="padding:11px;">${escapeText(transaction.partyName || "-")}</td>
                        <td style="padding:11px; white-space:nowrap;">${escapeText(transaction.id)}</td>
                    </tr>
                `).join("")}
            </tbody>
            <tfoot>
                <tr style="background:#f8fbff; font-weight:700;">
                    <td colspan="2" style="padding:12px;">Grand Total</td>
                    <td style="padding:12px; text-align:right; white-space:nowrap;">
                        ₹${formatAmount(totalAmount)}
                    </td>
                    <td colspan="3"></td>
                </tr>
            </tfoot>
        </table>
    </div>
`;

    } catch (error) {
        console.error(
            "Error generating Transactions without Notes report:",
            error
        );

        content.innerHTML = `
            <p>Unable to load report. Please check the console for errors.</p>
        `;
    }
}


function renderSelectedReport(report) {

        // SET ACTIVE REPORT FOR GLOBAL HEADER & TOOLBAR
    window.activeTransactionReport = report;

async function renderHighValueTransactionsReport() {
    reportWorkArea.innerHTML = `
<div class="selected-report-container">
    <button type="button" class="back-to-reports-button"
        id="backFromReport37"
        style="margin:10px 0 16px;">
        ← Back to Transaction Reports
    </button>

    <div class="report-document-header">


    <div style="padding:24px 30px;">
                    <strong style="font-size:22px;color:#173b70;">
                        #37 High-value Transactions
                    </strong>
                    <p style="color:#64748b;">
                        Transactions equal to or above the selected amount
                    </p>
                </div>
            </div>
            <div style="padding:20px 30px;">
                <label for="highValueThreshold">Minimum Amount (₹)</label>
                <input id="highValueThreshold" type="number"
                    min="0" value="50000"
                    style="padding:10px;border:1px solid #cbd5e1;border-radius:6px;margin:8px;">
                <button id="applyHighValueFilter" type="button"
                    style="padding:10px 16px;cursor:pointer;">
                    Apply Filter
                </button>
                <div id="highValueContent" style="margin-top:20px;">
                    Loading transactions...
                </div>
            </div>

        </div>`;

        document.getElementById("backFromReport37")
    .addEventListener("click", () => renderTransactionReports());

    const content = document.getElementById("highValueContent");

    try {
        const user = auth.currentUser;
        if (!user) {
            content.textContent = "Please log in to view this report.";
            return;
        }

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const transactions = [];
        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            if (t.deleted === true) return;
            transactions.push({ id: docSnap.id, ...t });
        });

        const formatAmount = amount =>
            (Number(amount) || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        const esc = value => String(value ?? "-").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[c]);


const formatDate = value => {
    if (!value) return "-";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return String(value);
};


        function display() {
            const threshold = Math.max(
                0,
                Number(document.getElementById("highValueThreshold").value) || 0
            );

            const filtered = transactions
                .filter(t => (Number(t.amount) || 0) >= threshold)
                .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));

            const total = filtered.reduce(
                (sum, t) => sum + (Number(t.amount) || 0), 0
            );

            content.innerHTML = `
                <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
                    <div class="summary-card" style="flex:1;min-width:180px;">
                        <h4>Matching Transactions</h4><p>${filtered.length}</p>
                    </div>
                    <div class="summary-card" style="flex:1;min-width:180px;">
                        <h4>Total Amount</h4><p>₹${formatAmount(total)}</p>
                    </div>
                </div>
                <div style="overflow-x:auto;border:1px solid #dce5f0;border-radius:10px;">
                    <table style="width:100%;min-width:750px;border-collapse:collapse;">
                        <thead><tr style="background:#173f78;color:white;">
                            <th style="padding:12px;text-align:left;">Date</th>
                            <th style="padding:12px;text-align:left;">Type</th>
                            <th style="padding:12px;text-align:left;">Category</th>
                            <th style="padding:12px;text-align:left;">Party</th>
                            <th style="padding:12px;text-align:right;">Amount</th>
                        </tr></thead>
                        <tbody>${filtered.map(t => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${esc(formatDate(t.date))}</td>
                                <td style="padding:10px;">${esc(t.type)}</td>
                                <td style="padding:10px;">${esc(t.category)}</td>
                                <td style="padding:10px;">${esc(t.partyName)}</td>
                                <td style="padding:10px;text-align:right;white-space:nowrap;">
                                    ₹${formatAmount(t.amount)}
                                </td>
                            </tr>`).join("") || `
                            <tr><td colspan="5" style="padding:20px;text-align:center;">
                                No matching transactions found.
                            </td></tr>`}
                        </tbody>
                        <tfoot><tr style="background:#f8fbff;font-weight:700;">
                            <td colspan="4" style="padding:12px;">Grand Total</td>
                            <td style="padding:12px;text-align:right;">₹${formatAmount(total)}</td>
                        </tr></tfoot>
                    </table>
                </div>`;
        }

        document.getElementById("applyHighValueFilter")
            .addEventListener("click", display);
        display();
    } catch (error) {
        console.error("Report #37 error:", error);
        content.textContent = "Unable to load this report. Check the console.";
    }
}


async function renderDuplicateTransactionReport() {
    reportWorkArea.innerHTML = `

<div class="selected-report-container">
    <button type="button" class="back-to-reports-button"
        id="backFromReport38"
        style="margin:10px 0 16px;">
        ← Back to Transaction Reports
    </button>

    <div class="report-document-header">


                <div style="padding:24px 30px;">
                    <strong style="font-size:22px;color:#173b70;">
                        #38 Duplicate Transaction Detection
                    </strong>
                    <p style="color:#64748b;">
                        Possible duplicates with matching date, amount, type, category and party
                    </p>
                </div>
            </div>
            <div id="duplicateTransactionsContent" style="padding:20px 30px;">
                Loading transactions...
            </div>
        </div>`;

        document.getElementById("backFromReport38")
    .addEventListener("click", () => renderTransactionReports());

    const content = document.getElementById("duplicateTransactionsContent");

    try {
        const user = auth.currentUser;
        if (!user) {
            content.textContent = "Please log in to view this report.";
            return;
        }

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const groups = new Map();

        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            if (t.deleted === true) return;

            const key = [
                t.date ?? "",
                Number(t.amount) || 0,
                String(t.type ?? "").trim().toLowerCase(),
                String(t.category ?? "").trim().toLowerCase(),
                String(t.partyName ?? "").trim().toLowerCase()
            ].join("|");

            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push({ id: docSnap.id, ...t });
        });

        const duplicates = [...groups.values()].filter(group => group.length > 1);
        const formatAmount = amount =>
            (Number(amount) || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        const esc = value => String(value ?? "-").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[c]);


const formatDate = value => {
    if (!value) return "-";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return String(value);
};

        const duplicateCount = duplicates.reduce(
            (sum, group) => sum + group.length, 0
        );

        content.innerHTML = `
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
                <div class="summary-card" style="flex:1;min-width:180px;">
                    <h4>Possible Duplicate Groups</h4><p>${duplicates.length}</p>
                </div>
                <div class="summary-card" style="flex:1;min-width:180px;">
                    <h4>Transactions in Groups</h4><p>${duplicateCount}</p>
                </div>
            </div>
            ${duplicates.length ? duplicates.map((group, index) => `
                <div style="margin-bottom:20px;overflow-x:auto;border:1px solid #dce5f0;border-radius:10px;">
                    <div style="padding:12px;background:#f8fbff;font-weight:700;">
                        Possible Duplicate Group ${index + 1} — ${group.length} entries
                    </div>
                    <table style="width:100%;min-width:750px;border-collapse:collapse;">
                        <thead><tr style="background:#173f78;color:white;">
                            <th style="padding:10px;text-align:left;">Date</th>
                            <th style="padding:10px;text-align:left;">Type</th>
                            <th style="padding:10px;text-align:left;">Category</th>
                            <th style="padding:10px;text-align:left;">Party</th>
                            <th style="padding:10px;text-align:right;">Amount</th>
                            <th style="padding:10px;text-align:left;">Transaction ID</th>
                        </tr></thead>
                        <tbody>${group.map(t => `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${esc(formatDate(t.date))}</td>
                                <td style="padding:10px;">${esc(t.type)}</td>
                                <td style="padding:10px;">${esc(t.category)}</td>
                                <td style="padding:10px;">${esc(t.partyName)}</td>
                                <td style="padding:10px;text-align:right;">₹${formatAmount(t.amount)}</td>
                                <td style="padding:10px;">${esc(t.id)}</td>
                            </tr>`).join("")}
                        </tbody>
                    </table>
                </div>`).join("") : `
                <div style="padding:30px;text-align:center;color:#64748b;border:1px solid #dce5f0;border-radius:10px;">
                    No possible duplicate transactions found.
                </div>`}
        `;
    } catch (error) {
        console.error("Report #38 error:", error);
        content.textContent = "Unable to load this report. Check the console.";
    }
}


async function renderTransactionAuditReport() {
    reportWorkArea.innerHTML = `

<div class="selected-report-container">
    <button type="button" class="back-to-reports-button"
        id="backFromReport39"
        style="margin:10px 0 16px;">
        ← Back to Transaction Reports
    </button>

    <div class="report-document-header">

    <div style="padding:24px 30px;">
                    <strong style="font-size:22px;color:#173b70;">
                        #39 Transaction Audit Report
                    </strong>
                    <p style="color:#64748b;">
                        Review transaction records and identify missing details
                    </p>
                </div>
            </div>
            <div id="transactionAuditContent" style="padding:20px 30px;">
                Loading transactions...
            </div>
        </div>`;

        document.getElementById("backFromReport39")
    .addEventListener("click", () => renderTransactionReports());

    const content = document.getElementById("transactionAuditContent");

    try {
        const user = auth.currentUser;
        if (!user) {
            content.textContent = "Please log in to view this report.";
            return;
        }

        const snapshot = await getDocs(
            collection(db, "users", user.uid, "transactions")
        );

        const transactions = [];
        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            if (t.deleted === true) return;
            transactions.push({ id: docSnap.id, ...t });
        });

        transactions.sort((a, b) =>
            String(b.date ?? "").localeCompare(String(a.date ?? ""))
        );

        const esc = value => String(value ?? "-").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[c]);

const formatDate = value => {
    if (!value) return "-";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return String(value);
};

        const formatAmount = amount =>
            (Number(amount) || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        const missingDetails = t => {
            const missing = [];
            if (!String(t.date ?? "").trim()) missing.push("Date");
            if (!String(t.type ?? "").trim()) missing.push("Type");
            if (t.amount === undefined || t.amount === null || t.amount === "") {
                missing.push("Amount");
            }
            if (!String(t.category ?? "").trim()) missing.push("Category");
            if (!String(t.partyName ?? "").trim()) missing.push("Party");
            if (!String(t.notes ?? "").trim() || String(t.notes).trim() === "-") {
                missing.push("Notes");
            }
            return missing;
        };

        const flagged = transactions.filter(t => missingDetails(t).length > 0);

        content.innerHTML = `
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;">
                <div class="summary-card" style="flex:1;min-width:180px;">
                    <h4>Total Transactions Reviewed</h4><p>${transactions.length}</p>
                </div>
                <div class="summary-card" style="flex:1;min-width:180px;">
                    <h4>Transactions with Missing Details</h4><p>${flagged.length}</p>
                </div>
            </div>
            <div style="overflow-x:auto;border:1px solid #dce5f0;border-radius:10px;">
                <table style="width:100%;min-width:900px;border-collapse:collapse;">
                    <thead><tr style="background:#173f78;color:white;">
                        <th style="padding:11px;text-align:left;">Date</th>
                        <th style="padding:11px;text-align:left;">Type</th>
                        <th style="padding:11px;text-align:left;">Category</th>
                        <th style="padding:11px;text-align:left;">Party</th>
                        <th style="padding:11px;text-align:right;">Amount</th>
                        <th style="padding:11px;text-align:left;">Notes</th>
                        <th style="padding:11px;text-align:left;">Audit Status</th>
                        <th style="padding:11px;text-align:left;">Transaction ID</th>
                    </tr></thead>
                    <tbody>${transactions.map(t => {
                        const missing = missingDetails(t);
                        return `
                            <tr style="border-bottom:1px solid #e5ebf3;">
                                <td style="padding:10px;">${esc(formatDate(t.date))}</td>
                                <td style="padding:10px;">${esc(t.type)}</td>
                                <td style="padding:10px;">${esc(t.category)}</td>
                                <td style="padding:10px;">${esc(t.partyName)}</td>
                                <td style="padding:10px;text-align:right;white-space:nowrap;">₹${formatAmount(t.amount)}</td>
                                <td style="padding:10px;">${esc(t.notes || "-")}</td>
                                <td style="padding:10px;color:${missing.length ? "#b45309" : "#15803d"};">
                                    ${missing.length ? "Review: " + esc(missing.join(", ")) : "Complete"}
                                </td>
                                <td style="padding:10px;">${esc(t.id)}</td>
                            </tr>`;
                    }).join("") || `
                        <tr><td colspan="8" style="padding:20px;text-align:center;">
                            No transactions found.
                        </td></tr>`}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        console.error("Report #39 error:", error);
        content.textContent = "Unable to load this report. Check the console.";
    }
}

const userDetails = getCurrentUserDetails();

    // =====================================================
    // REPORT #16 — ALL TRANSACTIONS
    // =====================================================

    if (report.number === 16) {

        renderAllTransactionsReport();

        return;

    }

    if (report.number === 17) {

    renderDateWiseTransactionsReport();

    return;

}

if (report.number === 18) {

    renderMonthWiseTransactionsReport();

    return;

}

// =====================================================
// REPORT #19 — YEAR-WISE TRANSACTIONS
// =====================================================

if (report.number === 19) {

    renderYearWiseTransactionsReport();

    return;

}

// =====================================================
// REPORT #20 — INCOME TRANSACTIONS
// =====================================================

if (report.number === 20) {

    renderIncomeTransactionsReport();

    return;

}

// =====================================================
// REPORT #21 — EXPENSE TRANSACTIONS
// =====================================================

if (report.number === 21) {

    renderExpenseTransactionsReport();

    return;

}

// =====================================================
// REPORT #22 — INVESTMENT TRANSACTIONS
// =====================================================

if (report.number === 22) {

    renderInvestmentTransactionsReport();

    return;

}

// =====================================================
// REPORT #23 — TRANSFER TRANSACTIONS
// =====================================================

if (report.number === 23) {

    renderTransferTransactionsReport();

    return;

}


// =====================================================
// REPORT #24 — WALLET TRANSACTIONS
// =====================================================

if (report.number === 24) {

    renderWalletTransactionsReport();

    return;

}

// =====================================================
// REPORT #25 — CASHBACK TRANSACTIONS
// =====================================================

if (report.number === 25) {

    renderCashbackTransactionsReport();

    return;

}

// =====================================================
// REPORT #26 — DELETED TRANSACTIONS
// =====================================================

if (report.number === 26) {

    renderDeletedTransactionsReport();

    return;

}



 // =====================================================
 // REPORT #27 — EDITED TRANSACTIONS
 // =====================================================

if (report.number === 27) {

    renderEditedTransactionsReport();

    return;

}


// =====================================================
// REPORT #28 — RECENTLY ADDED TRANSACTIONS
// =====================================================

if (report.number === 28) {

    renderRecentlyAddedTransactionsReport();

    return;

}


// =====================================================
// REPORT #29 — TRANSACTIONS BY CATEGORY
// =====================================================

if (report.number === 29) {

    renderTransactionsByCategoryReport();

    return;

}

// =====================================================
// REPORT #30 — TRANSACTIONS BY PARTY
// =====================================================

if (report.number === 30) {
    renderTransactionsByPartyReport();
    return;
}

if (report.number === 31) {
    renderTransactionsByAccountReport();
    return;
}


if (report.number === 32) {
    renderTransactionsByPaymentMethodReport();
    return;
}


if (report.number === 33) {
    renderTransactionsByLinkedModuleReport();
    return;
}


if (report.number === 34) {
    renderTransactionsWithoutCategoryReport();
    return;
}


if (report.number === 35) {
    renderTransactionsWithoutPartyReport();
    return;
}


if (report.number === 36) {
    renderTransactionsWithoutNotesReport();
    return;
}


if (report.number === 37) {
    renderHighValueTransactionsReport();
    return;
}

if (report.number === 38) {
    renderDuplicateTransactionReport();
    return;
}

if (report.number === 39) {
    renderTransactionAuditReport();
    return;
}



    reportWorkArea.innerHTML = `

        <!-- =========================================
             SBM WEALTH MANAGER REPORT HEADER
        ========================================== -->

        <div
            class="report-main-header"
            style="
                width:100%;
                min-height:70px;
                box-sizing:border-box;
                display:flex;
                align-items:center;
                justify-content:space-between;
                padding:8px 28px;
                background:
                    linear-gradient(
                        110deg,
                        #dceaff 0%,
                        #eee7ff 35%,
                        #e9f8ed 70%,
                        #fff8d9 100%
                    );
                border-bottom:1px solid #c7d4e5;
                box-shadow:0 4px 15px rgba(23,59,112,0.12);
                overflow:hidden;
            "
        >

            <!-- LEFT SPACER -->
            <div
                style="
                    width:22%;
                    min-width:180px;
                "
            ></div>


            <!-- CENTER BRAND -->
            <div
                style="
                    flex:1;
                    text-align:center;
                    color:#173b70;
                "
            >

                <!-- SBM COINS + WEALTH MANAGER -->

                <div
                    style="
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        gap:0;
                        margin-bottom:4px;
                    "
                >

                    <div
                        class="sbm-coin sbm-s-coin"
                        style="
                            width:58px;
                            height:58px;
                            border-radius:50%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:linear-gradient(145deg,#fff4a8,#d99b00);
                            border:3px solid #d69b00;
                            box-shadow:0 3px 8px rgba(0,0,0,0.25);
                            font-size:18px;
                            font-weight:900;
                            color:white;
                            z-index:3;
                        "
                    >
                        $
                    </div>

                    <div
                        class="sbm-coin sbm-b-coin"
                        style="
                            width:58px;
                            height:58px;
                            margin-left:-16px;
                            border-radius:50%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:linear-gradient(145deg,#fff4a8,#d99b00);
                            border:3px solid #d69b00;
                            box-shadow:0 3px 8px rgba(0,0,0,0.25);
                            font-size:18px;
                            font-weight:900;
                            color:white;
                            z-index:2;
                        "
                    >
                        ₿
                    </div>

                    <div
                        class="sbm-coin sbm-m-coin"
                        style="
                            width:58px;
                            height:58px;
                            margin-left:-16px;
                            border-radius:50%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:linear-gradient(145deg,#fff4a8,#d99b00);
                            border:3px solid #d69b00;
                            box-shadow:0 3px 8px rgba(0,0,0,0.25);
                            font-size:18px;
                            font-weight:900;
                            color:white;
                            z-index:1;
                        "
                    >
                        M
                    </div>

                    <span
                        style="
                            margin-left:20px;
                            font-size:20px;
                            font-weight:800;
                            color:#e5a400;
                            font-family:Georgia,serif;
                            text-shadow:
                                1px 1px 2px #8d6500;
                        "
                    >
                        Wealth Manager
                    </span>

                </div>


                <!-- WELCOME USER -->

                <div
                    style="
                        font-size:14px;
                        font-weight:800;
                        color:#1671d9;
                        text-shadow:1px 1px 1px rgba(0,0,0,0.15);
                    "
                >
                    Welcome ${escapeHtml(
                        userDetails.name
                    )}!
                </div>


                <!-- TAGLINE -->

                <div
                    style="
                        margin-top:7px;
                        font-size:9px;
                        font-weight:800;
                        letter-spacing:4px;
                        color:#173b70;
                    "
                >
                    YOUR PERSONAL FINANCIAL MANAGEMENT SYSTEM
                </div>

            </div>


            <!-- RIGHT FINANCIAL GRAPHIC -->

            <div
                style="
                    width:22%;
                    min-width:180px;
                    height:72px;
                    position:relative;
                    display:flex;
                    justify-content:flex-end;
                    align-items:flex-end;
                "
            >

                <div
                    style="
                        position:absolute;
                        right:135px;
                        bottom:35px;
                        width:58px;
                        height:58px;
                        border-radius:50%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:linear-gradient(145deg,#fff4a8,#d99b00);
                        border:3px solid #d69b00;
                        box-shadow:0 3px 8px rgba(0,0,0,0.25);
                        color:white;
                        font-size:28px;
                        font-weight:900;
                    "
                >
                    ₹
                </div>


                <div
                    style="
                        display:flex;
                        align-items:flex-end;
                        gap:8px;
                        height:68px;
                        margin-right:10px;
                    "
                >

                    <span style="
                        width:17px;
                        height:38px;
                        background:#0874d1;
                        border-radius:8px 8px 0 0;
                    "></span>

                    <span style="
                        width:17px;
                        height:68px;
                        background:#0874d1;
                        border-radius:8px 8px 0 0;
                    "></span>

                    <span style="
                        width:17px;
                        height:95px;
                        background:#0874d1;
                        border-radius:8px 8px 0 0;
                    "></span>

                    <span style="
                        width:17px;
                        height:60px;
                        background:#0874d1;
                        border-radius:8px 8px 0 0;
                    "></span>

                </div>

            </div>

        </div>


        <!-- =========================================
             REPORT AREA
        ========================================== -->

        <div class="selected-report-container">


            <!-- BACK BUTTON -->

            <button
                type="button"
                class="back-to-reports-button"
                id="backToTransactionReports"
            >
                ← Back to Transaction Reports
            </button>


            <!-- REPORT DOCUMENT -->

            <div class="report-document-header">


                <!-- REPORT INFORMATION -->

                <div
                    style="
                        padding:24px 30px 18px;
                        border-bottom:1px solid #d9e1ec;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:28px;
                            flex-wrap:wrap;
                            color:#173b70;
                        "
                    >

                        <strong
                            style="
                                font-size:22px;
                                color:#173b70;
                            "
                        >
                            Transaction Reports
                        </strong>


                        <span>
                            <strong>Reporting Period:</strong>
                            From <span>—</span>
                            to <span>—</span>
                        </span>


                        <span>
                            <strong>Financial Year:</strong>
                            <span>All Financial Years</span>
                        </span>

                    </div>

                </div>


                <!-- =================================
                     REPORT BODY
                ================================= -->

                <div
                    class="selected-report-placeholder"
                    style="
                        min-height:420px;
                    "
                >

                    <div class="placeholder-icon">
                        📊
                    </div>

                    <h3>
                        Report Data
                    </h3>

                    <p>
                        Actual financial transaction data
                        will appear here.
                    </p>

                </div>


                <!-- =================================
                     REPORT FOOTER
                ================================= -->

                <div
                    style="
                        padding:8px 30px;
                        border-top:1px solid #d9e1ec;
                        text-align:right;
                        font-size:10px;
                        color:#7a8798;
                    "
                >
                    Generated:
                    ${formatToday()}
                </div>


            </div>

        </div>

    `;


    // =========================================
    // BACK BUTTON
    // =========================================

    const backButton =
        document.getElementById(
            "backToTransactionReports"
        );


    if (backButton) {

        backButton.addEventListener(
    "click",
    showReportModuleStartPage
);

    }

}

    // =====================================================
    // GET CURRENT USER DETAILS
    // =====================================================

    function getCurrentUserDetails() {

        if (!currentUser) {

            return {

                name: "User",
                email: "Not Available",
                uid: "Not Available"

            };

        }


        return {

            name:
                currentUser.displayName ||
                currentUser.email ||
                "User",

            email:
                currentUser.email ||
                "Not Available",

            uid:
                currentUser.uid ||
                "Not Available"

        };

    }

// =====================================================
// REPORT DATE FORMATTER
// ALL REPORT DATES → DD-MM-YYYY
// =====================================================

function formatReportDate(value) {

    if (!value) {
        return "—";
    }


    const dateString =
        String(value).trim();


    // Already DD-MM-YYYY
    if (
        /^\d{2}-\d{2}-\d{4}$/
            .test(dateString)
    ) {

        return dateString;

    }


    // YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(dateString)
    ) {

        const parts =
            dateString.split("-");

        return (
            `${parts[2]}-${parts[1]}-${parts[0]}`
        );

    }


    // Try normal Date
    const date =
        new Date(value);


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const year =
            date.getFullYear();


        return (
            `${day}-${month}-${year}`
        );

    }


    return dateString;

}

    // =====================================================
    // TODAY — DD-MM-YYYY
    // =====================================================

    function formatToday() {

        const today =
            new Date();


        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");


        const year =
            today.getFullYear();


        return `${day}-${month}-${year}`;

    }


    // =====================================================
    // HTML SAFETY
    // =====================================================

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // REPORT SEARCH
    // =====================================================

    if (reportSearch) {

        reportSearch.addEventListener(
            "input",
            handleReportSearch
        );

    }


    function handleReportSearch() {

        const searchText =
            reportSearch.value
                .trim()
                .toLowerCase();


        const existingCards =
            document.querySelectorAll(
                ".transaction-report-card"
            );


        existingCards.forEach(card => {

            const reportName =
                card.querySelector(
                    ".transaction-report-name"
                )?.textContent
                ?.toLowerCase() || "";


            card.style.display =
                reportName.includes(searchText)
                    ? ""
                    : "none";

        });

    }

});


document.getElementById("backToDashboardButton")?.addEventListener("click", () => {
    try {
        if (window.self !== window.top) {
            window.parent.location.href = "../index.html";
        } else {
            window.location.href = "../index.html";
        }
    } catch (error) {
        window.location.href = "../index.html";
    }
});
