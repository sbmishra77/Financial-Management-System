// =========================================================
// SBM WEALTH MANAGER
// REPORTS MODULE
// STEP 3 — FIREBASE USER DETAILS
// =========================================================

import {
    auth
} from "../js/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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


function renderSelectedReport(report) {

    const userDetails = getCurrentUserDetails();

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
