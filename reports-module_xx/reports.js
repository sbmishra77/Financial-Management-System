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
    // CATEGORY CARDS
    // =====================================================

    const categoryCards =
        document.querySelectorAll(
            ".report-category-card"
        );


    categoryCards.forEach(card => {

        card.addEventListener("click", () => {

            const title =
                card.querySelector(
                    ".report-category-title"
                )?.textContent?.trim();


            if (title === "Transactions") {

                renderTransactionReports();

            }

        });

    });


    // =====================================================
    // TRANSACTION REPORT LIST
    // =====================================================

    function renderTransactionReports() {

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

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

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
        // SORT — NEWEST FIRST
        // =================================================

        transactions.sort(
            (a, b) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
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

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

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

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

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

        backButton.addEventListener(
            "click",
            renderTransactionReports
        );

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
            ".selected-report-container"
        );


    if (!reportContainer) {

        return;

    }


    const report =
        window.activeTransactionReport;


    if (!report) {

        return;

    }


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


    const finalReportTitle =
        `Financial Report - ${report.name} — ${reportPeriod}`;


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
            ".selected-report-container"
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
// GLOBAL REPORT EXPORT — PDF
// EXPORT HEADER + DATA TABLE
// =====================================================

function exportCurrentReportPDF() {

    const reportContainer =
        reportWorkArea.querySelector(
            ".selected-report-container"
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


    doc.setFontSize(10);

    doc.text(
        "SBM Wealth Manager",
        148,
        10,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        51,
        65,
        85
    );


    doc.setFontSize(9);

    doc.text(
        userName,
        148,
        16,
        {
            align: "center"
        }
    );


    doc.setTextColor(
        23,
        59,
        112
    );


    doc.setFontSize(13);

    doc.text(
        reportTitle,
        148,
        23,
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
            ".selected-report-container"
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

            const excelData = [

                [
                    "SBM Wealth Manager"
                ],

                [
                    userName
                ],

                [
                    reportTitle
                ],

                [],

                ...rows

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
            ".selected-report-container"
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

function renderSelectedReport(report) {

        window.activeTransactionReport = report;

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
            renderTransactionReports
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
