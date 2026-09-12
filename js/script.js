import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// DASHBOARD ELEMENTS
// ===============================

const logoutButton = document.querySelector("#logoutButton");
const welcomeMessage = document.querySelector("#welcomeMessage");

const addAccountButton = document.querySelector("#addAccountButton");

// ===============================
// TRANSACTION FORM ELEMENTS
// ===============================

const addTransactionButton =
    document.querySelector(
        "#addTransactionButton"
    );

const transactionFormContainer =
    document.querySelector(
        "#transactionFormContainer"
    );

// ===============================
// HIDE TRANSACTION FORM ON LOAD
// ===============================

if (transactionFormContainer) {
    transactionFormContainer.style.display = "none";
}

const cancelTransactionButton =
    document.querySelector(
        "#cancelTransactionButton"
    );

const transactionForm =
    document.querySelector(
        "#transactionForm"
    );


// ===============================
// OPEN TRANSACTION FORM
// ===============================

if (addTransactionButton) {

    addTransactionButton.addEventListener(
        "click",
        () => {

            if (transactionFormContainer) {

                transactionFormContainer.style.display =
                    "block";

            }

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

const accountFormContainer = document.querySelector("#accountFormContainer");
const cancelAccountButton = document.querySelector("#cancelAccountButton");
const accountForm = document.querySelector("#accountForm");

// ===============================
// UPDATE DASHBOARD SUMMARY
// ===============================

async function loadDashboardSummary() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }


        // ===============================
        // DASHBOARD ELEMENTS
        // ===============================

        const totalAssetsElement =
            document.querySelector(
                "#totalAssetsAmount"
            );


        const totalLiabilitiesElement =
            document.querySelector(
                "#totalLiabilitiesAmount"
            );


        const netWorthElement =
            document.querySelector(
                "#netWorthAmount"
            );


        // ===============================
        // LOAD ACCOUNTS
        // ===============================

        const accountsSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "accounts"
                )
            );

// =========================================
// ACCOUNTS SUMMARY CALCULATION
// =========================================

let bankCount = 0;
let cashCount = 0;
let creditCardCount = 0;
let cashbackCount = 0;

let bankBalance = 0;
let cashBalance = 0;
let creditCardBalance = 0;
let cashbackBalance = 0;


accountsSnapshot.forEach(
    (accountDoc) => {

        const account =
            accountDoc.data();

        const balance =
            Number(account.balance || 0);


        if (account.type === "bank") {

            bankCount++;

            bankBalance += balance;

        }

        else if (account.type === "cash") {

            cashCount++;

            cashBalance += balance;

        }

        else if (account.type === "credit_card") {

            creditCardCount++;

            creditCardBalance += balance;

        }

        else if (account.type === "cashback") {

            cashbackCount++;

            cashbackBalance += balance;

        }

    }
);


// =========================================
// SUMMARY TOTALS
// =========================================

const totalAccountAssets =
    bankBalance +
    cashBalance +
    cashbackBalance;


const netAccountPosition =
    totalAccountAssets -
    creditCardBalance;

// =========================================
// UPDATE SUMMARY UI
// =========================================

const summaryBankCount =
    document.querySelector(
        "#summaryBankCount"
    );

const summaryBankBalance =
    document.querySelector(
        "#summaryBankBalance"
    );

const summaryCashCount =
    document.querySelector(
        "#summaryCashCount"
    );

const summaryCashBalance =
    document.querySelector(
        "#summaryCashBalance"
    );

const summaryCreditCardCount =
    document.querySelector(
        "#summaryCreditCardCount"
    );

const summaryCreditCardBalance =
    document.querySelector(
        "#summaryCreditCardBalance"
    );

const summaryCashbackCount =
    document.querySelector(
        "#summaryCashbackCount"
    );

const summaryCashbackBalance =
    document.querySelector(
        "#summaryCashbackBalance"
    );

const summaryAccountAssets =
    document.querySelector(
        "#summaryAccountAssets"
    );

const summaryAccountNetPosition =
    document.querySelector(
        "#summaryAccountNetPosition"
    );


if (summaryBankCount) {

    summaryBankCount.textContent =
    `(${bankCount})`;
}


if (summaryBankBalance) {

    summaryBankBalance.textContent =
        `₹${bankBalance.toLocaleString("en-IN")}`;

}


if (summaryCashCount) {

    summaryCashCount.textContent =
    `(${cashCount})`;

}


if (summaryCashBalance) {

    summaryCashBalance.textContent =
        `₹${cashBalance.toLocaleString("en-IN")}`;

}


if (summaryCreditCardCount) {

    summaryCreditCardCount.textContent =
    `(${creditCardCount})`;

}


if (summaryCreditCardBalance) {

    summaryCreditCardBalance.textContent =
        `₹${creditCardBalance.toLocaleString("en-IN")}`;

}


if (summaryCashbackCount) {

    summaryCashbackCount.textContent =
        `(${cashbackCount})`;

}


if (summaryCashbackBalance) {

    summaryCashbackBalance.textContent =
        `₹${cashbackBalance.toLocaleString("en-IN")}`;

}


if (summaryAccountAssets) {

    summaryAccountAssets.textContent =
        `₹${totalAccountAssets.toLocaleString("en-IN")}`;

}


if (summaryAccountNetPosition) {

    summaryAccountNetPosition.textContent =
        `₹${netAccountPosition.toLocaleString("en-IN")}`;

}


console.log(
    "Accounts Summary:",
    {
        bankCount,
        bankBalance,
        cashCount,
        cashBalance,
        creditCardCount,
        creditCardBalance,
        cashbackCount,
        cashbackBalance,
        totalAccountAssets,
        netAccountPosition
    }
);

// =========================================
// CURRENT BALANCE / FUNDS AVAILABLE
// =========================================

// Dashboard total
const dashboardFundsAvailableValue =
    document.querySelector(
        "#dashboardFundsAvailableValue"
    );


// Module summary values
const availableBankBalance =
    document.querySelector(
        "#availableBankBalance"
    );

const availableCashBalance =
    document.querySelector(
        "#availableCashBalance"
    );

const availableWalletBalance =
    document.querySelector(
        "#availableWalletBalance"
    );

const totalAvailableFunds =
    document.querySelector(
        "#totalAvailableFunds"
    );


// Individual account containers
const availableBankAccountsList =
    document.querySelector(
        "#availableBankAccountsList"
    );

const availableCashAccountsList =
    document.querySelector(
        "#availableCashAccountsList"
    );

const availableWalletAccountsList =
    document.querySelector(
        "#availableWalletAccountsList"
    );


// =========================================
// UPDATE FUNDS AVAILABLE TOTAL
// =========================================

const totalAvailableFundsBottom =
    document.querySelector(
        "#totalAvailableFundsBottom"
    );


if (totalAvailableFundsBottom) {

    totalAvailableFundsBottom.textContent =
        `₹${totalAccountAssets.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


// =========================================
// UPDATE DASHBOARD CARD
// =========================================

if (dashboardFundsAvailableValue) {

    dashboardFundsAvailableValue.textContent =
        `₹${totalAccountAssets.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

// =========================================
// CLEAR OLD ACCOUNT LISTS
// =========================================

if (availableBankAccountsList) {

    availableBankAccountsList.innerHTML = "";

}


if (availableCashAccountsList) {

    availableCashAccountsList.innerHTML = "";

}


if (availableWalletAccountsList) {

    availableWalletAccountsList.innerHTML = "";

}


// =========================================
// LOAD EACH ACCOUNT INDIVIDUALLY
// =========================================

accountsSnapshot.forEach(
    (accountDoc) => {

        const account =
            accountDoc.data();

        const accountName =
            account.name ||
            "Unnamed Account";

        const balance =
            Number(account.balance || 0);


        // =================================
        // CREATE ACCOUNT ROW
        // =================================

        const accountRow =
            document.createElement("div");

        accountRow.style.display =
            "flex";

        accountRow.style.justifyContent =
            "space-between";

        accountRow.style.alignItems =
            "center";

        accountRow.style.padding =
            "10px 14px";

        accountRow.style.marginBottom =
            "8px";

        accountRow.style.border =
            "1px solid #ddd";

        accountRow.style.borderRadius =
            "8px";

        accountRow.style.background =
            "#ffffff";


        const nameElement =
            document.createElement("span");

        nameElement.textContent =
            accountName;


        const balanceElement =
            document.createElement("strong");

        balanceElement.textContent =
            `₹${balance.toLocaleString("en-IN")}`;


        accountRow.appendChild(
            nameElement
        );

        accountRow.appendChild(
            balanceElement
        );


        // =================================
        // PUT INTO CORRECT SECTION
        // =================================

        if (
            account.type === "bank" &&
            availableBankAccountsList
        ) {

            availableBankAccountsList.appendChild(
                accountRow
            );

        }

        else if (
            account.type === "cash" &&
            availableCashAccountsList
        ) {

            availableCashAccountsList.appendChild(
                accountRow
            );

        }


        else if (
            account.type === "cashback" &&
            availableWalletAccountsList
        ) {

            availableWalletAccountsList.appendChild(
                accountRow
            );

        }

    }
);

// =========================================
// LIVE FUNDS CHARTS
// =========================================

const fundsPieChart =
    document.querySelector(
        "#fundsPieChart"
    );

const fundsPieLegend =
    document.querySelector(
        "#fundsPieLegend"
    );

const fundsBarChart =
    document.querySelector(
        "#fundsBarChart"
    );


// =========================================
// TOTAL FOR PERCENTAGE
// =========================================

const fundsChartTotal =
    totalAccountAssets;


// =========================================
// CALCULATE PERCENTAGES
// =========================================

let fundsBankPercent = 0;
let fundsCashPercent = 0;
let fundsWalletPercent = 0;


if (fundsChartTotal > 0) {

    fundsBankPercent =
        (bankBalance / fundsChartTotal) * 100;

    fundsCashPercent =
        (cashBalance / fundsChartTotal) * 100;

    fundsWalletPercent =
        (cashbackBalance / fundsChartTotal) * 100;

}


// =========================================
// PIE CHART
// =========================================

if (fundsPieChart) {

    const bankEnd =
        fundsBankPercent;

    const cashEnd =
        bankEnd +
        fundsCashPercent;


    fundsPieChart.style.background =
        `conic-gradient(
            #1e88e5 0% ${bankEnd}%,
            #43a047 ${bankEnd}% ${cashEnd}%,
            #8e44ad ${cashEnd}% 100%
        )`;

}


// =========================================
// PIE LEGEND
// =========================================

if (fundsPieLegend) {

    fundsPieLegend.innerHTML = "";


    const chartLegendData = [

        {
            label: "🏦 Bank",
            percent: fundsBankPercent,
            amount: bankBalance,
            color: "#1e88e5"
        },

        {
            label: "💵 Cash",
            percent: fundsCashPercent,
            amount: cashBalance,
            color: "#43a047"
        },

        {
            label: "👛 Wallet",
            percent: fundsWalletPercent,
            amount: cashbackBalance,
            color: "#8e44ad"
        }

    ];


    chartLegendData.forEach(
        (item) => {

            const legendItem =
                document.createElement("div");


            legendItem.style.display =
                "flex";

            legendItem.style.alignItems =
                "center";

            legendItem.style.gap =
                "7px";


            const dot =
                document.createElement("span");


            dot.style.width =
                "13px";

            dot.style.height =
                "13px";

            dot.style.borderRadius =
                "50%";

            dot.style.background =
                item.color;

            dot.style.display =
                "inline-block";


            const text =
                document.createElement("span");


            text.textContent =
                `${item.label} — ${item.percent.toFixed(2)}%`;


            legendItem.appendChild(dot);

            legendItem.appendChild(text);


            fundsPieLegend.appendChild(
                legendItem
            );

        }
    );

}


// =========================================
// BAR CHART
// =========================================

if (fundsBarChart) {

    fundsBarChart.innerHTML = "";


    const chartBars = [

        {
            label: "🏦 Bank",
            amount: bankBalance,
            percent: fundsBankPercent,
            color: "#1e88e5"
        },

        {
            label: "💵 Cash",
            amount: cashBalance,
            percent: fundsCashPercent,
            color: "#43a047"
        },

        {
            label: "👛 Wallet",
            amount: cashbackBalance,
            percent: fundsWalletPercent,
            color: "#8e44ad"
        }

    ];


    const maxAmount =
        Math.max(
            bankBalance,
            cashBalance,
            cashbackBalance,
            1
        );


    chartBars.forEach(
        (item) => {

            const bar =
                document.createElement("div");


            bar.className =
                "funds-bar";


            const barHeight =
                Math.max(
                    (item.amount / maxAmount) * 240,
                    item.amount > 0 ? 18 : 8
                );


            bar.style.height =
                `${barHeight}px`;


            bar.style.background =
                `linear-gradient(
                    to right,
                    ${item.color},
                    rgba(255,255,255,0.45),
                    ${item.color}
                )`;


            const value =
                document.createElement("div");


            value.className =
                "funds-bar-value";


            value.innerHTML =
    `
    <div>
        ${item.percent.toFixed(2)}%
    </div>

    <div
        style="
            font-size: 13px;
            margin-top: 3px;
            font-weight: 800;
        "
    >
        ₹${item.amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}
    </div>
    `;


            const label =
                document.createElement("div");


            label.className =
                "funds-bar-label";


            label.textContent =
                item.label;


            bar.appendChild(value);

            bar.appendChild(label);


            fundsBarChart.appendChild(
                bar
            );

        }
    );

}

// =========================================
// PIE CHART - PERCENTAGE LABELS
// =========================================

if (fundsPieChart) {

    // Remove old labels
    fundsPieChart
        .querySelectorAll(
            ".funds-pie-percent-label"
        )
        .forEach(label => label.remove());


    const pieLabelData = [

        {
            label: "🏦",
            percent: fundsBankPercent,
            color: "#1e88e5"
        },

        {
            label: "💵",
            percent: fundsCashPercent,
            color: "#43a047"
        },

        {
            label: "👛",
            percent: fundsWalletPercent,
            color: "#8e44ad"
        }

    ];


    let runningPercent = 0;


    pieLabelData.forEach(
        (item) => {

            // Zero-value category को pie पर label नहीं देंगे
            if (item.percent <= 0) {
                return;
            }


            const middlePercent =
                runningPercent +
                (item.percent / 2);


            const angle =
                (middlePercent * 3.6) - 90;


            const radians =
                angle * Math.PI / 180;


            const radius = 92;


            const x =
                50 +
                (radius / 2.9) *
                Math.cos(radians);


            const y =
                50 +
                (radius / 2.9) *
                Math.sin(radians);


            const label =
                document.createElement("div");


            label.className =
                "funds-pie-percent-label";


            label.innerHTML =
                `
                <span class="pie-percent-icon">
                    ${item.label}
                </span>
                <span>
                    ${item.percent.toFixed(2)}%
                </span>
                `;


            label.style.left =
                `${x}%`;


            label.style.top =
                `${y}%`;


            label.style.borderColor =
                item.color;


            fundsPieChart.appendChild(
                label
            );


            runningPercent +=
                item.percent;

        }
    );

}

// =========================================
// EMPTY LIST MESSAGES
// =========================================

if (
    availableBankAccountsList &&
    availableBankAccountsList.children.length === 0
) {

    availableBankAccountsList.innerHTML =
        "<p>No Bank Accounts found.</p>";

}


if (
    availableCashAccountsList &&
    availableCashAccountsList.children.length === 0
) {

    availableCashAccountsList.innerHTML =
        "<p>No Cash Account found.</p>";

}


if (
    availableWalletAccountsList &&
    availableWalletAccountsList.children.length === 0
) {

    availableWalletAccountsList.innerHTML =
        "<p>No Wallet found.</p>";

}


console.log(
    "Funds Available Updated:",
    {
        bankBalance,
        cashBalance,
        cashbackBalance,
        totalAvailableFunds:
            totalAccountAssets
    }
);  

        let accountAssets = 0;
        let accountLiabilities = 0;


        accountsSnapshot.forEach(
            (accountDoc) => {

                const account =
                    accountDoc.data();


                const balance =
                    Number(
                        account.balance || 0
                    );


                if (
                    account.type ===
                    "credit_card"
                ) {

                    accountLiabilities +=
                        balance;

                }

                else {

                    accountAssets +=
                        balance;

                }

            }
        );

// =========================================
// UPDATE FUNDS TABLE HEADERS
// =========================================

const fundsBankCountEl =
    document.querySelector(
        "#availableBankCount"
    );

const fundsBankTotalEl =
    document.querySelector(
        "#availableBankTotal"
    );

const fundsCashCountEl =
    document.querySelector(
        "#availableCashCount"
    );

const fundsCashTotalEl =
    document.querySelector(
        "#availableCashTotal"
    );

const fundsWalletCountEl =
    document.querySelector(
        "#availableWalletCount"
    );

const fundsWalletTotalEl =
    document.querySelector(
        "#availableWalletTotal"
    );


// =========================================
// BANK
// =========================================

if (fundsBankCountEl) {

    fundsBankCountEl.textContent =
        bankCount;

}

if (fundsBankTotalEl) {

    fundsBankTotalEl.textContent =
        `₹${bankBalance.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


// =========================================
// CASH
// =========================================

if (fundsCashCountEl) {

    fundsCashCountEl.textContent =
        cashCount;

}

if (fundsCashTotalEl) {

    fundsCashTotalEl.textContent =
        `₹${cashBalance.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


// =========================================
// WALLET
// =========================================

if (fundsWalletCountEl) {

    fundsWalletCountEl.textContent =
        cashbackCount;

}

if (fundsWalletTotalEl) {

    fundsWalletTotalEl.textContent =
        `₹${cashbackBalance.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

        // ===============================
        // LOAD FIXED DEPOSITS
        // ===============================

        const fdSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "fixedDeposits"
                )
            );


        let totalFDPrincipal = 0;


        fdSnapshot.forEach(
            (fdDoc) => {

                const fd =
                    fdDoc.data();


                // Renewed FD को दोबारा
                // Asset में count नहीं करना

                if (
                    fd.status ===
                    "renewed"
                ) {

                    return;

                }


                totalFDPrincipal +=
                    Number(
                        fd.amount || 0
                    );

            }
        );


        // ===============================
        // LOAD INVESTMENTS
        // ===============================

        const investmentSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "investments"
                )
            );

// ===============================
// LOAD FIXED DEPOSITS FOR SUMMARY
// ===============================

const fixedDepositSnapshot =
    await getDocs(
        collection(
            db,
            "users",
            user.uid,
            "fixedDeposits"
        )
    );


let totalFixedDepositAmount = 0;

let activeFixedDepositCount = 0;

fixedDepositSnapshot.forEach(
    (fdDoc) => {

        const fd =
            fdDoc.data();


        // Renewed पुराने FD को दोबारा count नहीं करना
        if (fd.status === "renewed") {
            return;
        }

           activeFixedDepositCount++; 

        totalFixedDepositAmount +=
            Number(
                fd.amount || 0
            );

    }
);

console.log(
    "TOTAL FD SUMMARY:",
    totalFixedDepositAmount
);

console.log(
    "ACTIVE FD COUNT:",
    activeFixedDepositCount
);

const investmentFixedDepositCount =
    document.querySelector(
        "#investmentFixedDepositCount"
    );


if (investmentFixedDepositCount) {

    investmentFixedDepositCount.textContent =
        activeFixedDepositCount;

}

const investmentFixedDepositAmount =
    document.querySelector(
        "#investmentFixedDepositAmount"
    );


if (investmentFixedDepositAmount) {

    investmentFixedDepositAmount.textContent =
        "₹" +
        totalFixedDepositAmount.toLocaleString(
            "en-IN"
        );

}

        let totalInvestmentCurrentValue =
            0;


        investmentSnapshot.forEach(
            (investmentDoc) => {

                const investment =
                    investmentDoc.data();


                totalInvestmentCurrentValue +=
                    Number(
                        investment.currentValue || 0
                    );

            }
        );


        // ===============================
        // CALCULATE TOTAL ASSETS
        // ===============================

        const totalAssets =
            accountAssets +
            totalFDPrincipal +
            totalInvestmentCurrentValue;


        // ===============================
        // CALCULATE TOTAL LIABILITIES
        // ===============================

        const totalLiabilities =
            accountLiabilities;


        // ===============================
        // CALCULATE NET WORTH
        // ===============================

        const netWorth =
            totalAssets -
            totalLiabilities;


        // ===============================
        // UPDATE DASHBOARD
        // ===============================

        if (totalAssetsElement) {

            totalAssetsElement.textContent =
                "₹" +
                totalAssets.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        if (totalLiabilitiesElement) {

            totalLiabilitiesElement.textContent =
                "₹" +
                totalLiabilities.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        if (netWorthElement) {

            netWorthElement.textContent =
                "₹" +
                netWorth.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }


        console.log(
            "Dashboard Summary:",
            {
                accountAssets,
                totalFDPrincipal,
                totalInvestmentCurrentValue,
                totalAssets,
                totalLiabilities,
                netWorth
            }
        );


    } catch (error) {

        console.error(
            "Dashboard Summary Error:",
            error
        );

    }

}

// ===============================
// FIRESTORE DATA BACKUP
// ===============================

async function backupFirestoreData() {

    try {

        const user = auth.currentUser;

        if (!user) {

            alert(
                "कृपया पहले Login करें।"
            );

            return;
        }


        console.log(
            "Starting Firestore backup..."
        );


        const backupData = {

            backupVersion: "1.0",

            backupDate:
                new Date().toISOString(),

            userId:
                user.uid,

            userEmail:
                user.email || "",

            collections: {}

        };


        const collectionNames = [

            "accounts",

            "fixedDeposits",

            "insurance",

            "investments"

        ];


        for (
            const collectionName
            of collectionNames
        ) {

            console.log(
                "Backing up:",
                collectionName
            );


            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "users",
                        user.uid,
                        collectionName
                    )
                );


            backupData.collections[
                collectionName
            ] = [];


            snapshot.forEach(
                (documentSnapshot) => {

                    backupData.collections[
                        collectionName
                    ].push({

                        id:
                            documentSnapshot.id,

                        data:
                            documentSnapshot.data()

                    });

                }
            );


            console.log(
                collectionName +
                " backup:",
                snapshot.size,
                "documents"
            );

        }


        const jsonData =
            JSON.stringify(
                backupData,
                null,
                4
            );


        const blob =
            new Blob(
                [jsonData],
                {
                    type:
                        "application/json"
                }
            );


        const downloadUrl =
            URL.createObjectURL(
                blob
            );


        const downloadLink =
            document.createElement(
                "a"
            );


        downloadLink.href =
            downloadUrl;


        const date =
            new Date()
                .toISOString()
                .slice(0, 10);


        downloadLink.download =
            `SBM-Wealth-Manager-Firestore-Backup-${date}.json`;


        document.body.appendChild(
            downloadLink
        );


        downloadLink.click();


        document.body.removeChild(
            downloadLink
        );


        URL.revokeObjectURL(
            downloadUrl
        );


        console.log(
            "Firestore backup completed successfully."
        );


        alert(
            "Firestore data backup successfully downloaded!"
        );


    } catch (error) {

       console.error(
    "Firestore Backup Error:",
    error
);

console.error(
    "Error message:",
    error?.message
);

console.error(
    "Error code:",
    error?.code
);

console.error(
    "Error stack:",
    error?.stack
);


        alert(
            "Firestore backup नहीं बन पाया। Console में error देखें।"
        );

    }

}


// ===============================
// BACKUP BUTTON
// ===============================

const backupFirestoreButton =
    document.querySelector(
        "#backupFirestoreButton"
    );


if (backupFirestoreButton) {

    backupFirestoreButton.addEventListener(
        "click",
        () => {

            console.log(
                "Backup button clicked"
            );

            backupFirestoreData();

        }
    );

}

// ===============================
// PROTECT DASHBOARD
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    console.log(
        "Logged in user:",
        user
    );


    // =========================================
    // USER NAME + PROFILE PHOTO
    // =========================================

    if (user) {

        const fullName =
            (user.displayName || "User")
                .trim();


        const properName =
            fullName
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean)
                .map(
                    name =>
                        name.charAt(0).toUpperCase() +
                        name.slice(1)
                )
                .join(" ");


        const nameParts =
            properName.split(" ");


        let initials =
            "";


        if (nameParts.length >= 3) {

            initials =
                nameParts[0].charAt(0) +
                nameParts[1].charAt(0) +
                nameParts[nameParts.length - 1].charAt(0);

        }
        else if (nameParts.length === 2) {

            initials =
                nameParts[0].charAt(0) +
                nameParts[1].charAt(0);

        }
        else if (nameParts.length === 1) {

            initials =
                nameParts[0].charAt(0);

        }


        const wealthManagerTitle =
            document.querySelector(
                "#wealthManagerTitle"
            );


        if (wealthManagerTitle) {

            wealthManagerTitle.textContent =
                `${initials.toUpperCase()} Wealth Manager`;

        }


        if (welcomeMessage) {

            welcomeMessage.textContent =
                `Welcome ${properName}!`;

        }

        // ======================================================
// DASHBOARD PROFILE HEADER
// ======================================================

const dashboardWelcomeText =
    document.querySelector("#dashboardWelcomeText");

if (dashboardWelcomeText) {
    dashboardWelcomeText.textContent =
        `Welcome ${properName}!`;
}

const dashboardUserProfilePhoto =
    document.querySelector("#dashboardUserProfilePhoto");

if (dashboardUserProfilePhoto && user.photoURL) {
    dashboardUserProfilePhoto.src = user.photoURL;
}

const sidebarWelcomeMessage =
    document.querySelector("#sidebarWelcomeMessage");

if (sidebarWelcomeMessage) {
    sidebarWelcomeMessage.textContent =
        `Welcome ${properName}!`;
}

        const userProfilePhoto =
            document.querySelector(
                "#userProfilePhoto"
            );


        if (
            userProfilePhoto &&
            user.photoURL
        ) {

            userProfilePhoto.src =
                user.photoURL;

            userProfilePhoto.style.display =
                "block";

        }

    }


    loadAccounts();
    loadFixedDeposits();
    loadFDHistory();
    loadInsurance();
    loadInvestments();
    loadDashboardSummary();

});


// ===============================
// LOGOUT
// ===============================

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout Error:", error);

            alert(
                "Logout नहीं हो पाया। कृपया फिर कोशिश करें।"
            );

        }

    });

}


// ===============================
// OPEN ADD ACCOUNT FORM
// ===============================

if (addAccountButton) {

    addAccountButton.addEventListener("click", () => {

        if (accountFormContainer) {
            accountFormContainer.style.display = "block";
        }

        addAccountButton.style.display = "none";

    });

}


// ===============================
// CANCEL ADD ACCOUNT
// ===============================

if (cancelAccountButton) {

    cancelAccountButton.addEventListener("click", () => {

        if (accountFormContainer) {
            accountFormContainer.style.display = "none";
        }

        if (addAccountButton) {
            addAccountButton.style.display = "inline-block";
        }

    });

}


// ===============================
// SAVE ACCOUNT TO FIRESTORE
// ===============================

if (accountForm) {

    accountForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const user = auth.currentUser;

            if (!user) {

                alert("कृपया पहले Login करें।");

                return;
            }


            const accountName =
                document.querySelector("#accountName").value.trim();

            const accountType =
                document.querySelector("#accountType").value;

            const accountBalance =
                Number(
                    document.querySelector("#accountBalance").value
                );


            if (!accountName || !accountType) {

                alert(
                    "कृपया Account Name और Account Type भरें।"
                );

                return;
            }


            console.log("Saving account to Firestore...");


            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "accounts"
                ),
                {
                    name: accountName,
                    type: accountType,
                    balance: accountBalance,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                }
            );


            console.log("Account saved successfully!");


            alert("Account successfully saved!");


            // Reset form

            accountForm.reset();


            // Hide form

            if (accountFormContainer) {
                accountFormContainer.style.display = "none";
            }

            if (addAccountButton) {
                addAccountButton.style.display = "inline-block";
            }


        } catch (error) {

            console.error(
                "Account Save Error:",
                error
            );

            alert(
                "Account save नहीं हो पाया। कृपया फिर कोशिश करें।"
            );

        }

    });

}

// ===============================
// LOAD ACCOUNTS FROM FIRESTORE
// ===============================

async function loadAccounts() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }

        const accountsContainer =
            document.querySelector("#accountsContainer");

        const noAccountsMessage =
            document.querySelector("#noAccountsMessage");

        const accountsSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "accounts"
            )
        );

        const allAccountsCount =
    document.querySelector(
        "#allAccountsCount"
    );

        if (allAccountsCount) {
            allAccountsCount.textContent =
            accountsSnapshot.size;
}


        if (accountsSnapshot.empty) {

            if (noAccountsMessage) {
                noAccountsMessage.style.display = "block";
            }

            return;
        }


        if (noAccountsMessage) {
            noAccountsMessage.style.display = "none";
        }


        accountsContainer.innerHTML = "";

        const allAccountsContainer =
    document.querySelector(
        "#allAccountsContainer"
    );


const accountsTableBody =
    document.querySelector(
        "#accountsTableBody"
    );


if (accountsTableBody) {

    accountsTableBody.innerHTML = "";

}


        accountsSnapshot.forEach((accountDoc) => {

            const account = accountDoc.data();


            console.log(
                "Account loaded:",
                accountDoc.id,
                account
            );


            let icon = "🏦";
let typeName = "Bank Account";
let accountClass = "bank-default";
let brandName = "";

if (account.type === "cash") {

    icon = "💵";
    typeName = "Cash";
    accountClass = "account-cash";
    brandName = "CASH";

}

else if (account.type === "credit_card") {

    icon = "💳";
    typeName = "Credit Card";
    accountClass = "account-credit-card";
    brandName = "CARD";


    const creditCardName =
        (account.name || "").toLowerCase();


    if (creditCardName.includes("icici")) {

        brandName = "ICICI";
        accountClass = "account-icici";

    }

    else if (creditCardName.includes("kotak")) {

        brandName = "KOTAK";
        accountClass = "account-kotak";

    }

}

else if (account.type === "cashback") {

    icon = "🎁";
    typeName = "Cashback Wallet";
    accountClass = "account-cashback";
    brandName = "WALLET";

}

/* =============================== */
/* BANK BRAND DETECTION */
/* =============================== */

const accountNameForLogo =
    (account.name || "").toLowerCase();


if (account.type === "bank") {

    if (accountNameForLogo.includes("sbi")) {

        icon = "🔵";
        accountClass = "account-sbi";
        brandName = "SBI";

    }

    else if (accountNameForLogo.includes("pnb")) {

        icon = "🔴";
        accountClass = "account-pnb";
         brandName = "PNB";

    }

    else if (accountNameForLogo.includes("icici")) {

        icon = "🟠";
        accountClass = "account-icici";
        brandName = "ICICI";

    }

    else if (accountNameForLogo.includes("kotak")) {

        icon = "🔴";
        accountClass = "account-kotak";
        brandName = "KOTAK";

    }

}


            const accountName =
                account.name || "Unnamed Account";

            const accountBalance =
                Number(account.balance || 0);


            const accountCard =
                document.createElement("div");

            accountCard.className =
                `account-card ${accountClass}`;


            accountCard.innerHTML = `
            <div class="account-icon">
    <span class="account-brand-badge">
        ${brandName}
        ${
            account.type === "credit_card"
                ? `<small>CARD</small>`
                : ""
        }
    </span>
</div>

    <div class="account-info">

        <h3>${accountName}</h3>

        <p>${typeName}</p>

        <strong>
            ₹${accountBalance.toLocaleString("en-IN")}
        </strong>

    </div>

    <button class="edit-account-button"
            data-id="${accountDoc.id}">
        ✏️ Edit
    </button>
`;


            
// =========================================
// ALL ACCOUNTS TABLE ROW
// =========================================

const accountsTableBody =
    document.querySelector(
        "#accountsTableBody"
    );


if (accountsTableBody) {

    const tableRow =
        document.createElement("tr");


    let tableType =
        "🏦 Bank Account";


    if (account.type === "cash") {

        tableType = "💵 Cash";

    }

    else if (account.type === "credit_card") {

        tableType = "💳 Credit Card";

    }

    else if (account.type === "cashback") {

        tableType = "🎁 Cashback Wallet";

    }


    tableRow.innerHTML = `

        <td>
            ${accountName}
        </td>

        <td>
            ${tableType}
        </td>

        <td>
            ₹${accountBalance.toLocaleString("en-IN")}
        </td>

        <td>

            <button
                type="button"
                class="edit-account-button"
                data-id="${accountDoc.id}">

                ✏️ Edit

            </button>


            <button
                type="button"
                class="delete-account-button"
                data-id="${accountDoc.id}">

                🗑️ Delete

            </button>

        </td>

    `;


    accountsTableBody.appendChild(
        tableRow
    );

}
        });


        console.log(
            "Accounts loaded successfully:",
            accountsSnapshot.size
        );


    } catch (error) {

        console.error(
            "Load Accounts Error:",
            error
        );

    }

}

// =========================================
// ACCOUNTS SUMMARY TOGGLE
// =========================================

const accountSummaryButton =
    document.querySelector(
        "#accountSummaryButton"
    );

const accountSummary =
    document.querySelector(
        "#accountSummary"
    );


if (
    accountSummaryButton &&
    accountSummary
) {

    accountSummaryButton.addEventListener(
        "click",
        () => {

            if (
                accountSummary.style.display ===
                "none"
            ) {

                accountSummary.style.display =
                    "flex";

            }
            else {

                accountSummary.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// EDIT ACCOUNT
// ===============================

let selectedAccountId = null;

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("edit-account-button")) {
        return;
    }

    try {

        selectedAccountId =
            event.target.getAttribute("data-id");

        console.log(
            "Edit Account clicked:",
            selectedAccountId
        );


        const user = auth.currentUser;

        if (!user) {
            return;
        }


        // Get selected account from Firestore

        const accountRef = doc(
            db,
            "users",
            user.uid,
            "accounts",
            selectedAccountId
        );

        const accountSnapshot =
            await getDoc(accountRef);


        if (!accountSnapshot.exists()) {

            alert("Account नहीं मिला।");

            return;
        }


        const account =
            accountSnapshot.data();


        console.log(
            "Account data for edit:",
            account
        );


        // Fill Edit Form

        document.querySelector("#editAccountName").value =
            account.name || "";


        document.querySelector("#editAccountType").value =
            account.type || "bank";


        document.querySelector("#editAccountBalance").value =
            account.balance || 0;


        // Show Edit Form

        const editContainer =
            document.querySelector("#editAccountContainer");

        if (editContainer) {
            editContainer.style.display = "block";
        }


    } catch (error) {

        console.error(
            "Edit Account Error:",
            error
        );

        alert(
            "Account की जानकारी लोड नहीं हो पाई।"
        );

    }

});

// ===============================
// CANCEL EDIT ACCOUNT
// ===============================

const cancelEditButton =
    document.querySelector(
        "#cancelEditButton"
    );


if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        () => {

            const editContainer =
                document.querySelector(
                    "#editAccountContainer"
                );


            if (editContainer) {

                editContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// DELETE ACCOUNT
// ===============================

document.addEventListener(
    "click",
    async (event) => {

        if (
            !event.target.classList.contains(
                "delete-account-button"
            )
        ) {
            return;
        }


        const accountId =
            event.target.getAttribute(
                "data-id"
            );


        if (!accountId) {

            console.error(
                "Account ID not found."
            );

            return;

        }


        const confirmDelete =
            confirm(
                "क्या आप सच में इस Account को delete करना चाहते हैं?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "User login नहीं है।"
                );

                return;

            }


            const accountRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "accounts",
                    accountId
                );


            await deleteDoc(
                accountRef
            );


            console.log(
                "Account deleted successfully:",
                accountId
            );


            alert(
                "Account successfully deleted."
            );


            // Refresh Accounts

            await loadAccounts();


        }
        catch (error) {

            console.error(
                "Delete Account Error:",
                error
            );


            alert(
                "Account delete नहीं हो सका।"
            );

        }

    }
);

// ===============================
// SAVE EDITED ACCOUNT
// ===============================

const editAccountForm =
    document.querySelector("#editAccountForm");

if (editAccountForm) {

    editAccountForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const user = auth.currentUser;

            if (!user) {
                return;
            }


            if (!selectedAccountId) {

                alert("कृपया पहले Account चुनें।");

                return;
            }


            const updatedName =
                document.querySelector("#editAccountName").value.trim();

            const updatedType =
                document.querySelector("#editAccountType").value;

            const updatedBalance =
                Number(
                    document.querySelector("#editAccountBalance").value
                );


            const accountRef = doc(
                db,
                "users",
                user.uid,
                "accounts",
                selectedAccountId
            );


            await setDoc(
                accountRef,
                {
                    name: updatedName,
                    type: updatedType,
                    balance: updatedBalance,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            console.log(
                "Account updated successfully!"
            );


            alert(
                "Account successfully updated!"
            );


            // Hide edit form

            const editContainer =
                document.querySelector("#editAccountContainer");

            if (editContainer) {
                editContainer.style.display = "none";
            }


            // Reload accounts

            await loadAccounts();


            // Reset selected account

            selectedAccountId = null;


        } catch (error) {

            console.error(
                "Update Account Error:",
                error
            );

            alert(
                "Account update नहीं हो पाया। कृपया फिर कोशिश करें।"
            );

        }

    });

}

// ===============================
// ADD INVESTMENT FORM
// ===============================

const addInvestmentButton =
    document.querySelector(
        "#addInvestmentButton"
    );

const investmentFormContainer =
    document.querySelector(
        "#investmentFormContainer"
    );

const cancelInvestmentButton =
    document.querySelector(
        "#cancelInvestmentButton"
    );


if (addInvestmentButton) {

    addInvestmentButton.addEventListener(
        "click",
        () => {

            if (investmentFormContainer) {

                investmentFormContainer.style.display =
                    "block";

                investmentFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


if (cancelInvestmentButton) {

    cancelInvestmentButton.addEventListener(
        "click",
        () => {

            if (investmentFormContainer) {

                investmentFormContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// SAVE INVESTMENT
// ===============================

const investmentForm =
    document.querySelector(
        "#investmentForm"
    );


if (investmentForm) {

    investmentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            try {

                const user =
                    auth.currentUser;


                if (!user) {

                    alert(
                        "कृपया पहले Login करें।"
                    );

                    return;

                }


                // ===============================
                // GET FORM VALUES
                // ===============================

                const category =
                    document.querySelector(
                        "#investmentCategory"
                    ).value;

                const name =
                    document.querySelector(
                        "#investmentName"
                    ).value.trim();

                const amount =
                    Number(
                        document.querySelector(
                            "#investmentAmount"
                        ).value
                    );

                const investmentDate =
                    document.querySelector(
                        "#investmentDate"
                    ).value;

                const currentValue =
                    Number(
                        document.querySelector(
                            "#investmentCurrentValue"
                        ).value
                    );

                const notes =
                    document.querySelector(
                        "#investmentNotes"
                    ).value.trim();


                // ===============================
                // SAVE TO FIRESTORE
                // ===============================

 // ===============================
// ADD / UPDATE INVESTMENT
// ===============================

if (window.editingInvestmentId) {

    // ===============================
    // UPDATE EXISTING INVESTMENT
    // ===============================

    await updateDoc(
        doc(
            db,
            "users",
            user.uid,
            "investments",
            window.editingInvestmentId
        ),
        {

            category: category,

            name: name,

            amount: amount,

            investmentDate:
                investmentDate,

            currentValue:
                currentValue,

            notes: notes,

            updatedAt:
                serverTimestamp()

        }
    );


    console.log(
        "Investment updated:",
        window.editingInvestmentId
    );


    // Exit edit mode
    window.editingInvestmentId = null;


    alert(
        "Investment successfully updated!"
    );

}
else {

    // ===============================
    // ADD NEW INVESTMENT
    // ===============================

    await addDoc(
        collection(
            db,
            "users",
            user.uid,
            "investments"
        ),
        {

            category: category,

            name: name,

            amount: amount,

            investmentDate:
                investmentDate,

            currentValue:
                currentValue,

            notes: notes,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        }
    );


    console.log(
        "New Investment added"
    );


    alert(
        "Investment successfully saved!"
    );

}


                // ===============================
                // SUCCESS
                // ===============================

                alert(
                    "Investment successfully saved!"
                );


                // Reset form

                investmentForm.reset();


                // Hide form

                if (investmentFormContainer) {

                    investmentFormContainer.style.display =
                        "none";

                }


                console.log(
                    "Investment saved successfully."
                );


            }
            catch (error) {

                console.error(
                    "Save Investment Error:",
                    error
                );


                alert(
                    "Investment save नहीं हुआ। कृपया फिर कोशिश करें।"
                );

            }

        }
    );

}

// ===============================
// LOAD INVESTMENTS
// ===============================

async function loadInvestments() {

    try {

        const user =
            auth.currentUser;


        if (!user) {
            return;
        }


        const investmentSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "investments"
                )
            );


        let totalInvested = 0;

        let totalCurrentValue = 0;

        let investmentItemCount =
            investmentSnapshot.size;


// ===============================
// LOAD FD AMOUNT FOR INVESTMENT SUMMARY
// ===============================

let totalFixedDepositAmount = 0;

let totalFixedDepositCurrentValue = 0;


const fixedDepositSnapshot =
    await getDocs(
        collection(
            db,
            "users",
            user.uid,
            "fixedDeposits"
        )
    );

    
fixedDepositSnapshot.forEach(
    (fdDoc) => {

        const fd =
            fdDoc.data();


        // Renewed पुराने FD को दोबारा count नहीं करना
        if (fd.status === "renewed") {
            return;
        }


        // FD Principal
        totalFixedDepositAmount +=
            Number(
                fd.amount || 0
            );


        // FD Maturity Value
        totalFixedDepositCurrentValue +=
            Number(
                fd.maturityAmount || 0
            );

    }
);

        const investmentTableBody =
            document.querySelector(
                "#investmentTableBody"
            );


        const noInvestmentsMessage =
            document.querySelector(
                "#noInvestmentsMessage"
            );


        if (investmentTableBody) {

            investmentTableBody.innerHTML = "";

        }


        const investmentTypes =
            new Set();


        // ===============================
        // LOAD INVESTMENTS
        // ===============================

        investmentSnapshot.forEach(
            (investmentDoc) => {

                const investment =
                    investmentDoc.data();


                totalInvested +=
                    Number(
                        investment.amount || 0
                    );


                if (investment.category) {

                    investmentTypes.add(
                        investment.category
                    );

                }

// ===============================
// DELETE INVESTMENT
// ===============================

document.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-investment-button"
            );


        if (!deleteButton) {
            return;
        }


        const investmentId =
            deleteButton.dataset.id;


        if (!investmentId) {
            return;
        }


        const confirmDelete =
            confirm(
                "क्या आप इस Investment को delete करना चाहते हैं?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const user =
                auth.currentUser;


            if (!user) {
                return;
            }


            await deleteDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "investments",
                    investmentId
                )
            );


            console.log(
                "Investment deleted:",
                investmentId
            );


            // Reload investments
            await loadInvestments();


        }
        catch (error) {

            console.error(
                "Delete Investment Error:",
                error
            );


            alert(
                "Investment delete नहीं हुआ। कृपया फिर कोशिश करें।"
            );

        }

    }
);

// ===============================
// EDIT INVESTMENT
// ===============================

document.addEventListener(
    "click",
    async (event) => {

        const editButton =
            event.target.closest(
                ".edit-investment-button"
            );


        if (!editButton) {
            return;
        }


        const investmentId =
            editButton.dataset.id;


        if (!investmentId) {
            return;
        }


        try {

            const user =
                auth.currentUser;


            if (!user) {
                return;
            }


            const investmentRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "investments",
                    investmentId
                );


            const investmentSnapshot =
                await getDoc(
                    investmentRef
                );


            if (!investmentSnapshot.exists()) {

                alert(
                    "Investment नहीं मिला।"
                );

                return;

            }


            const investment =
                investmentSnapshot.data();


            // Store ID for update
            window.editingInvestmentId =
                investmentId;


            // Fill existing form
            document.querySelector(
                "#investmentCategory"
            ).value =
                investment.category || "";


            document.querySelector(
                "#investmentName"
            ).value =
                investment.name || "";


            document.querySelector(
                "#investmentAmount"
            ).value =
                investment.amount || "";


            document.querySelector(
                "#investmentDate"
            ).value =
                investment.investmentDate || "";


            document.querySelector(
                "#investmentCurrentValue"
            ).value =
                investment.currentValue || "";


            document.querySelector(
                "#investmentNotes"
            ).value =
                investment.notes || "";


            // Show investment form
            const investmentFormContainer =
                document.querySelector(
                    "#investmentFormContainer"
                );


            if (investmentFormContainer) {

                investmentFormContainer.style.display =
                    "block";

            }


            console.log(
                "Editing Investment:",
                investmentId
            );

        }
        catch (error) {

            console.error(
                "Edit Investment Error:",
                error
            );


            alert(
                "Investment load नहीं हुआ। कृपया फिर कोशिश करें।"
            );

        }

    }
);

                // ===============================
                // CREATE INVESTMENT TABLE ROW
                // ===============================

                const investmentRow =
                    document.createElement("tr");


                const categoryNames = {

                    sip: "📊 SIP / Mutual Fund",

                    shares: "📈 Shares / Stocks",

                    gold: "🥇 Gold",

                    silver: "🥈 Silver",

                    gold_etf: "🪙 Gold ETF",

                    silver_etf: "🪙 Silver ETF",

                    rd: "🏧 Recurring Deposit",

                    property: "🏠 Property",

                    bonds: "📜 Bonds",

                    ppf: "🧾 PPF",

                    nps: "🧾 NPS",

                    other: "💰 Other Investment"

                };


                const categoryLabel =
                    categoryNames[
                        investment.category
                    ] ||
                    investment.category ||
                    "-";


                const investedAmount =
                    Number(
                        investment.amount || 0
                    );


                const currentValue =
                    Number(
                        investment.currentValue || 0
                    );

                    totalCurrentValue += currentValue;

// ===============================
// CALCULATE PROFIT / LOSS
// ===============================

const profitLoss =
    currentValue - investedAmount;


let profitLossPercent = 0;


if (investedAmount > 0) {

    profitLossPercent =
        (
            profitLoss /
            investedAmount
        ) * 100;

}

// ===============================
// FORMAT INVESTMENT DATE
// ===============================

let formattedInvestmentDate = "-";

if (investment.investmentDate) {

    const dateParts =
        investment.investmentDate.split("-");

    if (dateParts.length === 3) {

        formattedInvestmentDate =
        dateParts[2].padStart(2, "0") +
        "-" +
        dateParts[1].padStart(2, "0") +
        "-" +
        dateParts[0];

    }

}

               investmentRow.innerHTML = `

    <td>
        ${investment.name || "-"}
    </td>

    <td>
        ${categoryLabel}
    </td>

    <td>
        ₹${investedAmount.toLocaleString("en-IN")}
    </td>

    <td>
        ₹${currentValue.toLocaleString("en-IN")}
    </td>

    <td class="${
    profitLoss > 0
        ? "investment-profit"
        : profitLoss < 0
            ? "investment-loss"
            : ""
}">

    ${
        profitLoss >= 0
            ? "+₹" +
              profitLoss.toLocaleString("en-IN")
            : "-₹" +
              Math.abs(
                  profitLoss
              ).toLocaleString("en-IN")
    }

</td>

    <td class="${
    profitLoss > 0
        ? "investment-profit"
        : profitLoss < 0
            ? "investment-loss"
            : ""
}">

    ${
        profitLoss >= 0
            ? "+" +
              profitLossPercent.toFixed(2) +
              "%"
            : profitLossPercent.toFixed(2) +
              "%"
    }

</td>

    <td>
        ${formattedInvestmentDate}
    </td>

<td>
    ${
        investment.updatedAt &&
        typeof investment.updatedAt.toDate === "function"
            ? (() => {

                const date =
                    investment.updatedAt.toDate();

                return (
                    String(date.getDate()).padStart(2, "0") +
                    "-" +
                    String(date.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    date.getFullYear()
                );

            })()
            : "-"
    }
</td>

<td>

    <button
        type="button"
        class="edit-investment-button"
        data-id="${investmentDoc.id}">

        ✏️ Edit

    </button>


    <button
        type="button"
        class="delete-investment-button"
        data-id="${investmentDoc.id}">

        🗑️ Delete

    </button>

</td>

`;

                if (investmentTableBody) {

                    investmentTableBody.appendChild(
                        investmentRow
                    );

                }

            }
        );

        // ===============================
        // UPDATE SUMMARY
        // ===============================

        const totalInvestmentAmount =
            document.querySelector(
                "#totalInvestmentAmount"
            );

const totalInvestmentCurrentValue =
    document.querySelector(
        "#totalInvestmentCurrentValue"
    );


// ===============================
// COMBINED INVESTMENT VALUES
// ===============================

const combinedInvestedValue =
    totalInvested +
    totalFixedDepositAmount;


const combinedCurrentValue =
    totalCurrentValue +
    totalFixedDepositCurrentValue;


// ===============================
// UPDATE CURRENT VALUE
// ===============================

if (totalInvestmentCurrentValue) {

    totalInvestmentCurrentValue.textContent =
        "₹" +
        combinedCurrentValue.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ===============================
// CALCULATE PROFIT / LOSS
// ===============================

const totalInvestmentProfitLoss =
    combinedCurrentValue -
    combinedInvestedValue;


let totalInvestmentReturnPercent = 0;


if (combinedInvestedValue > 0) {

    totalInvestmentReturnPercent =
        (
            totalInvestmentProfitLoss /
            combinedInvestedValue
        ) * 100;

}

// ===============================
// UPDATE TOTAL PROFIT / LOSS
// ===============================

const totalInvestmentProfitLossElement =
    document.querySelector(
        "#totalInvestmentProfitLoss"
    );


const totalInvestmentReturnPercentElement =
    document.querySelector(
        "#totalInvestmentReturnPercent"
    );


if (totalInvestmentProfitLossElement) {

    totalInvestmentProfitLossElement.textContent =
        (
            totalInvestmentProfitLoss >= 0
                ? "+₹"
                : "-₹"
        ) +
        Math.abs(
            totalInvestmentProfitLoss
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    totalInvestmentProfitLossElement.className =
        totalInvestmentProfitLoss > 0
            ? "investment-profit"
            : totalInvestmentProfitLoss < 0
                ? "investment-loss"
                : "";

}


if (totalInvestmentReturnPercentElement) {

    totalInvestmentReturnPercentElement.textContent =
        (
            totalInvestmentReturnPercent >= 0
                ? "+"
                : ""
        ) +
        totalInvestmentReturnPercent.toFixed(2) +
        "%";


    totalInvestmentReturnPercentElement.className =
        totalInvestmentReturnPercent > 0
            ? "investment-profit"
            : totalInvestmentReturnPercent < 0
                ? "investment-loss"
                : "";

}
        const investmentTypeCount =
            document.querySelector(
                "#investmentTypeCount"
            );


        const investmentItemCountElement =
            document.querySelector(
                "#investmentItemCount"
            );


     if (totalInvestmentAmount) {

    const combinedInvestmentTotal =
        totalInvested +
        totalFixedDepositAmount;

    totalInvestmentAmount.textContent =
        "₹" +
        combinedInvestmentTotal.toLocaleString(
            "en-IN"
        );

}

// ===============================
// UPDATE FIXED DEPOSIT SUMMARY
// ===============================

const investmentFixedDepositAmount =
    document.querySelector(
        "#investmentFixedDepositAmount"
    );

if (investmentFixedDepositAmount) {

    investmentFixedDepositAmount.textContent =
        "₹" +
        totalFixedDepositAmount.toLocaleString(
            "en-IN"
        );

}
        if (investmentTypeCount) {

            investmentTypeCount.textContent =
                investmentTypes.size;

        }


        if (investmentItemCountElement) {

            investmentItemCountElement.textContent =
                investmentItemCount;

        }


        if (noInvestmentsMessage) {

            noInvestmentsMessage.style.display =
                investmentItemCount === 0
                    ? "block"
                    : "none";

        }


        console.log(
            "Investments loaded successfully:",
            investmentItemCount
        );


    }
    catch (error) {

        console.error(
            "Load Investments Error:",
            error
        );

    }

}

// ===============================
// INVESTMENTS VIEW ALL / BACK
// ===============================

function setupInvestmentViewButtons() {

    const viewAllInvestmentsButton =
        document.querySelector(
            "#viewAllInvestmentsButton"
        );

    const backToInvestmentsDashboardButton =
        document.querySelector(
            "#backToInvestmentsDashboardButton"
        );

    const viewFixedDepositsFromInvestmentsButton =
        document.querySelector(
            "#viewFixedDepositsFromInvestmentsButton"
        );

    if (viewFixedDepositsFromInvestmentsButton) {

        viewFixedDepositsFromInvestmentsButton.addEventListener(
            "click",
            () => {

                const viewAllFDButton =
                    document.querySelector(
                        "#viewAllFDButton"
                    );

                if (viewAllFDButton) {

                    viewAllFDButton.click();

                }

            }
        );

    }

// ===============================
// ADD NEW FD FROM ALL FD VIEW
// ===============================

const addNewFDFromAllFDButton =
    document.querySelector(
        "#addNewFDFromAllFDButton"
    );


if (addNewFDFromAllFDButton) {

    addNewFDFromAllFDButton.addEventListener(
        "click",
        () => {

            const showFDFormButton =
                document.querySelector(
                    "#showFDFormButton"
                );


            const fdFormContainer =
                document.querySelector(
                    "#fdFormContainer"
                );


            if (showFDFormButton) {

                showFDFormButton.click();

            }


            if (fdFormContainer) {

                setTimeout(() => {

                    fdFormContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 100);

            }

        }
    );

}


    const viewFixedDepositsFromAllInvestmentsButton =
    document.querySelector(
        "#viewFixedDepositsFromAllInvestmentsButton"
    );


if (viewFixedDepositsFromAllInvestmentsButton) {

    viewFixedDepositsFromAllInvestmentsButton.addEventListener(
        "click",
        () => {

            const viewAllFDButton =
                document.querySelector(
                    "#viewAllFDButton"
                );


            if (viewAllFDButton) {

                viewAllFDButton.click();

            }

        }
    );

}

    const investmentTableWrapper =
        document.querySelector(
            "#investmentTableWrapper"
        );

    const investmentsSectionTitle =
        document.querySelector(
            "#investmentsSectionTitle"
        );

    const addInvestmentButton =
        document.querySelector(
            "#addInvestmentButton"
        );


    console.log(
        "Investment View Elements:",
        {
            viewAll: !!viewAllInvestmentsButton,
            back: !!backToInvestmentsDashboardButton,
            table: !!investmentTableWrapper,
            title: !!investmentsSectionTitle,
            add: !!addInvestmentButton
        }
    );


    // ===============================
    // VIEW ALL
    // ===============================

    if (viewAllInvestmentsButton) {

        viewAllInvestmentsButton.addEventListener(
            "click",
            () => {

                console.log(
                    "View All Investments clicked"
                );


                if (investmentTableWrapper) {

                    investmentTableWrapper.style.display =
                        "block";

                }


                if (investmentsSectionTitle) {

                    const countElement =
                        document.querySelector(
                            "#investmentItemCount"
                        );

                    const count =
                        countElement
                            ? countElement.textContent
                            : "0";


                    investmentsSectionTitle.textContent =
                        "📈 All Investments (" +
                        count +
                        ")";

                }


                if (addInvestmentButton) {

                    addInvestmentButton.style.display =
                        "none";

                }


                viewAllInvestmentsButton.style.display =
                    "none";


                if (backToInvestmentsDashboardButton) {

                    backToInvestmentsDashboardButton.style.display =
                        "inline-block";

                }

                
            }
        );

    }


    // ===============================
    // BACK TO DASHBOARD
    // ===============================

    if (backToInvestmentsDashboardButton) {

        backToInvestmentsDashboardButton.addEventListener(
            "click",
            () => {

                console.log(
                    "Back to Investments Dashboard clicked"
                );


                if (investmentTableWrapper) {

                    investmentTableWrapper.style.display =
                        "none";

                }


                if (investmentsSectionTitle) {

                    investmentsSectionTitle.textContent =
                        "📈 My Investments";

                }


                if (addInvestmentButton) {

                    addInvestmentButton.style.display =
                        "inline-block";

                }


                if (viewAllInvestmentsButton) {

                    viewAllInvestmentsButton.style.display =
                        "inline-block";

                }


                backToInvestmentsDashboardButton.style.display =
                    "none";

            }
        );

    }

}


// ===============================
// INITIALIZE
// ===============================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        setupInvestmentViewButtons
    );

}
else {

    setupInvestmentViewButtons();

}

// ===============================
// FIXED DEPOSIT FORM
// ===============================

const showFDFormButton =
    document.querySelector("#showFDFormButton");

const fdFormContainer =
    document.querySelector("#fdFormContainer");

const cancelFDButton =
    document.querySelector("#cancelFDButton");


if (showFDFormButton) {
    showFDFormButton.addEventListener("click", () => {

        if (fdFormContainer) {
            fdFormContainer.style.setProperty(
                "display",
                "block",
                "important"
            );
        }

    });
}

if (cancelFDButton) {

    cancelFDButton.addEventListener("click", () => {

        fdFormContainer.style.display = "none";

    });

}
// ===============================
// HIDE OLD FD DASHBOARD HEADER
// ===============================

const oldFixedDepositDashboardHeader =
    document.querySelector(
        "#oldFixedDepositDashboardHeader"
    );


if (oldFixedDepositDashboardHeader) {

    oldFixedDepositDashboardHeader.style.display =
        "none";

}

// ===============================
// SAVE FIXED DEPOSIT
// TRANSACTION-LINKED VERSION
// ===============================

const fdForm =
    document.querySelector("#fdForm");


// =========================================
// FD SAVE
// =========================================

if (fdForm) {

    fdForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            try {

                // =================================
                // LOGIN CHECK
                // =================================

                const user =
                    auth.currentUser;

                if (!user) {

                    alert(
                        "कृपया पहले Login करें।"
                    );

                    return;
                }


                // =================================
                // READ FD FORM
                // =================================

                const fdName =
                    document
                        .querySelector("#fdName")
                        .value
                        .trim();

                const fdBank =
                    document
                        .querySelector("#fdBank")
                        .value
                        .trim();

                const fdAmount =
                    Number(
                        document
                            .querySelector("#fdAmount")
                            .value
                    );

                const fdDepositDate =
                    document
                        .querySelector("#fdDepositDate")
                        .value;

                const fdMaturityDate =
                    document
                        .querySelector("#fdMaturityDate")
                        .value;

                const fdInterestRate =
                    Number(
                        document
                            .querySelector("#fdInterestRate")
                            .value
                    );

                const fdCompounding =
                    Number(
                        document
                            .querySelector("#fdCompounding")
                            .value
                    );

                const fdMaturityAmount =
                    Number(
                        document
                            .querySelector("#fdMaturityAmount")
                            .value
                    );


                // =================================
                // VALIDATION
                // =================================

                if (
                    !fdName ||
                    !fdBank ||
                    !fdAmount ||
                    !fdDepositDate ||
                    !fdMaturityDate ||
                    !fdInterestRate ||
                    !fdMaturityAmount
                ) {

                    alert(
                        "कृपया सभी FD details भरें।"
                    );

                    return;
                }


                console.log(
                    "Saving Fixed Deposit..."
                );


                // =================================
                // 1. SAVE FD
                // =================================

                const fdRef =
                    await addDoc(

                        collection(
                            db,
                            "users",
                            user.uid,
                            "fixedDeposits"
                        ),

                        {

                            name:
                                fdName,

                            bank:
                                fdBank,

                            amount:
                                fdAmount,

                            depositDate:
                                fdDepositDate,

                            maturityDate:
                                fdMaturityDate,

                            interestRate:
                                fdInterestRate,

                            compounding:
                                fdCompounding,

                            maturityAmount:
                                fdMaturityAmount,

                            status:
                                "active",

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }

                    );


                console.log(
                    "FD saved successfully:",
                    fdRef.id
                );

// =================================
// CHECK TRANSACTION LINK
// =================================

console.log(
    "FD TRANSACTION LINK CHECK:",
    {
        fdId: fdRef.id,

        pendingTransaction:
            window.pendingModuleTransaction || null,

        row:
            window.pendingModuleTransaction?.row || null
    }
);

// =================================
// FILL TRANSACTION ROW FROM FD
// =================================

const linkedTransaction =
    window.pendingModuleTransaction;


const transactionRow =
    linkedTransaction?.row;


if (
    linkedTransaction &&
    linkedTransaction.module ===
        "fixedDeposit" &&
    transactionRow
) {

    // =================================
    // PARTY / BANK
    // =================================

    const partyInput =
        transactionRow.querySelector(
            ".transaction-party"
        );


    if (partyInput) {

        partyInput.value =
            fdBank;

    }


    // =================================
    // INVESTMENT / ASSET
    // =================================

    const investmentInput =
        transactionRow.querySelector(
            ".transaction-investment"
        );


    if (investmentInput) {

        investmentInput.value =
            fdName;

    }


    // =================================
    // AMOUNT
    // =================================

    const amountInput =
        transactionRow.querySelector(
            ".transaction-amount"
        );


    if (amountInput) {

        amountInput.value =
            fdAmount;

    }


    // =================================
    // DATE
    // =================================

    const dateInput =
        transactionRow.querySelector(
            ".transaction-date"
        );


    if (dateInput) {

        dateInput.value =
            fdDepositDate;

    }


// =================================
// LINKED MODULE
// =================================

const linkedModuleSelect =
    transactionRow.querySelector(
        ".transaction-linked-module"
    );


if (linkedModuleSelect) {

    // पहले available options देखें
    console.log(
        "FD LINKED MODULE OPTIONS:",
        Array.from(
            linkedModuleSelect.options
        ).map(option => ({
            text: option.text,
            value: option.value
        }))
    );


    // Fixed Deposit वाला option खोजें
    const fdModuleOption =
        Array.from(
            linkedModuleSelect.options
        ).find(option =>
            option.text
                .trim()
                .toLowerCase()
                .includes("fixed deposit")
        );


    if (fdModuleOption) {

        linkedModuleSelect.value =
            fdModuleOption.value;

    }


    console.log(
        "FD LINKED MODULE SELECTED:",
        {
            text:
                linkedModuleSelect
                    .selectedOptions[0]
                    ?.text || "",

            value:
                linkedModuleSelect.value
        }
    );

}

    console.log(
        "FD TRANSACTION ROW UPDATED:",
        {
            party:
                partyInput?.value,

            investment:
                investmentInput?.value,

            amount:
                amountInput?.value,

            date:
                dateInput?.value,

            linkedModule:
                linkedModuleSelect?.value
        }
    );

}

                // =================================
                // 2. CHECK PENDING TRANSACTION
                // =================================

                const pendingTransaction =
                    window.pendingModuleTransaction;


                // =================================
                // 3. IF FD WAS OPENED FROM
                //    TRANSACTION ENTRY
                // =================================

                if (
                    pendingTransaction &&
                    pendingTransaction.row
                ) {

                    const row =
                        pendingTransaction.row;


                    // =================================
                    // READ TRANSACTION ROW
                    // =================================

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

                    const notesInput =
                        row.querySelector(
                            ".transaction-notes"
                        );


                    // =================================
                    // TRANSACTION VALUES
                    // =================================

                    const transactionDate =
                        dateInput
                            ? dateInput.value
                            : fdDepositDate;

                    const transactionType =
                        typeSelect
                            ? typeSelect.value
                            : "investment";

                    const transactionCategory =
                        categorySelect
                            ? categorySelect.value
                            : "Fixed Deposit";

                    const partyName =
                        partyInput
                            ? partyInput.value.trim()
                            : fdBank;

                    const amount =
                        amountInput &&
                        amountInput.value
                            ? Number(
                                amountInput.value
                            )
                            : fdAmount;

                    const fromAccountId =
                        fromAccountSelect
                            ? fromAccountSelect.value
                            : "";

                    const toAccountId =
                        toAccountSelect
                            ? toAccountSelect.value
                            : "";

                    const paymentMethod =
                        paymentMethodSelect
                            ? paymentMethodSelect.value
                            : "";

                    const notes =
                        notesInput
                            ? notesInput.value.trim()
                            : "";


                    // =================================
                    // 4. CREATE TRANSACTION
                    // =================================

                    const transactionData = {

                        date:
                            transactionDate,

                        type:
                            transactionType,

                        category:
                            transactionCategory,

                        partyId:
                            null,

                        partyName:
                            partyName,

                        investmentId:
                            fdRef.id,

                        investmentName:
                            fdName,

                        amount:
                            amount,

                        fromAccountId:
                            fromAccountId,

                        toAccountId:
                            toAccountId,

                        paymentMethod:
                            paymentMethod,

                        linkedModule:
                            "fixedDeposit",

                        linkedRecordId:
                            fdRef.id,

                        notes:
                            notes,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    };


                    // =================================
                    // 5. SAVE TRANSACTION HISTORY
                    // =================================

                    const transactionRef =
                        await addDoc(

                            collection(
                                db,
                                "users",
                                user.uid,
                                "transactions"
                            ),

                            transactionData

                        );


                    console.log(
                        "Linked Transaction saved:",
                        transactionRef.id
                    );


                    // =================================
                    // STORE TRANSACTION ID
                    // INSIDE FD DOCUMENT
                    // =================================

                    await updateDoc(

                        doc(
                            db,
                            "users",
                            user.uid,
                            "fixedDeposits",
                            fdRef.id
                        ),

                        {

                            transactionId:
                                transactionRef.id,

                            updatedAt:
                                serverTimestamp()

                        }

                    );


                    // =================================
                    // CLEAR PENDING TRANSACTION
                    // =================================

                    window.pendingModuleTransaction =
                        null;


                    console.log(
                        "FD ↔ Transaction linked successfully."
                    );

                }


                // =================================
                // SUCCESS
                // =================================

                alert(
                    "Fixed Deposit और Transaction History दोनों successfully save हो गए।"
                );


                // =================================
                // RESET FORM
                // =================================

                fdForm.reset();


                // =================================
                // CLOSE FD FORM
                // =================================

                if (fdFormContainer) {

                    fdFormContainer.style.display =
                        "none";

                }


                // =================================
                // REFRESH FD MODULE
                // =================================

                if (
                    typeof loadFixedDeposits ===
                    "function"
                ) {

                    await loadFixedDeposits();

                }


                // =================================
                // REFRESH TRANSACTION HISTORY
                // =================================

                if (
                    typeof loadSavedTransactions ===
                    "function"
                ) {

                    await loadSavedTransactions();

                }


            }
            catch (error) {

                console.error(
                    "FD Save Error:",
                    error
                );

                console.error(
                    "FD Error Code:",
                    error?.code
                );

                console.error(
                    "FD Error Message:",
                    error?.message
                );

                alert(
                    "FD save नहीं हो पाया। कृपया फिर कोशिश करें।"
                );

            }

        }

    );

}

// ===============================
// LOAD FIXED DEPOSITS
// ===============================

async function loadFixedDeposits() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }

        const fdContainer =
            document.querySelector("#fdContainer");
        const fdGoalCount =
            document.querySelector("#fdGoalCount");

        const allFDView =
            document.querySelector("#allFDView");

        const allFDTableBody =
            document.querySelector("#allFDTableBody");
        const fdTotalPrincipal =
            document.querySelector("#fdTotalPrincipal");

const fdExpectedMaturity =
    document.querySelector("#fdExpectedMaturity");

        const noFDMessage =
            document.querySelector("#noFDMessage");

        const fdSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "fixedDeposits"
            )
        );

// ===============================
// PREPARE FD DOCUMENTS FOR SORTING
// ===============================

const fdDocuments = [];

fdSnapshot.forEach((fdDoc) => {

    fdDocuments.push(fdDoc);

});

// ===============================
// SORT FD BY MATURITY DATE
// EARLIEST MATURITY FIRST
// ===============================

fdDocuments.sort((a, b) => {

    const fdA = a.data();
    const fdB = b.data();

    const dateA = fdA.maturityDate
        ? new Date(fdA.maturityDate + "T00:00:00")
        : new Date("9999-12-31");

    const dateB = fdB.maturityDate
        ? new Date(fdB.maturityDate + "T00:00:00")
        : new Date("9999-12-31");

    return dateA - dateB;

});

        // No FD found

        if (fdSnapshot.empty) {

            if (noFDMessage) {
                noFDMessage.style.display = "block";
            }

            return;
        }


        // FD found

        if (noFDMessage) {
            noFDMessage.style.display = "none";
        }


        const fdTableBody =
    document.querySelector("#fdTableBody");

if (fdTableBody) {
    fdTableBody.innerHTML = "";
}

if (allFDTableBody) {
    allFDTableBody.innerHTML = "";
}

if (allFDView) {
    allFDView.style.display = "none";
}

        let totalPrincipal = 0;
        let totalMaturity = 0;

        // Active FD count
        let fdCount = 0;

        // Renewed FD count
        let renewedFDCount = 0;

        const allFDCount =
        document.querySelector(
        "#allFDCount"
    );

        fdDocuments.forEach((fdDoc) => {

   const fd = fdDoc.data();



// ===============================
// RENEWED FD
// ===============================

if (fd.status === "renewed") {

    renewedFDCount++;

    return;

}


// ===============================
// ACTIVE FD COUNT
// ===============================

fdCount++;

    totalPrincipal +=
        Number(fd.amount || 0);

    totalMaturity +=
        Number(fd.maturityAmount || 0);


            console.log(
                "FD loaded:",
                fdDoc.id,
                fd
            );


            const fdName =
                fd.name || "Unnamed FD";

// ===============================
// FORMAT FD MATURITY DATE
// YYYY-MM-DD → DD-MM-YYYY
// ===============================

let formattedMaturityDate = "-";

if (fd.maturityDate) {

    const dateParts =
        fd.maturityDate.split("-");

    if (dateParts.length === 3) {

        formattedMaturityDate =
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    }

}

// ===============================
// FORMAT FD OPENING DATE
// YYYY-MM-DD → DD-MM-YYYY
// ===============================

let formattedOpeningDate = "-";

if (fd.depositDate) {

    const dateParts =
        fd.depositDate.split("-");

    if (dateParts.length === 3) {

        formattedOpeningDate =
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    }
}

            const fdBank =
                fd.bank || "Unknown Bank";

            const fdAmount =
                Number(fd.amount || 0);

            const fdMaturityAmount =
                Number(fd.maturityAmount || 0);

// ===============================
// FD MATURITY ALERT
// ===============================

let daysLeft = null;
let maturityAlert = "";

if (fd.maturityDate) {

    const today = new Date();

    const maturityDate =
        new Date(fd.maturityDate + "T00:00:00");

    const difference =
        maturityDate.getTime() - today.getTime();

    daysLeft =
        Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );


    if (daysLeft < 0) {

        maturityAlert =
            "⚫ Matured";

    }

    else if (daysLeft === 0) {

        maturityAlert =
            "🔴 Matures Today";

    }

    else if (daysLeft <= 30) {

        maturityAlert =
            `🔴 ${daysLeft} Days Left`;

    }

    else if (
        maturityDate.getMonth() === today.getMonth()
        &&
        maturityDate.getFullYear() === today.getFullYear()
    ) {

        maturityAlert =
            "🟠 Maturing This Month";

    }

    else {

        maturityAlert =
            `🟢 ${daysLeft} Days Left`;

    }

}

            const fdInterestRate =
                Number(fd.interestRate || 0);

            const fdTableBody =
    document.querySelector("#fdTableBody");


const fdRow =
    document.createElement("tr");


let daysClass = "fd-days-safe";

if (daysLeft !== null) {

    if (daysLeft <= 30) {

        daysClass = "fd-days-danger";

    }
    else if (daysLeft <= 90) {

        daysClass = "fd-days-warning";

    }

}


fdRow.innerHTML = `

    <td>

        <div class="fd-name">
            🏦 ${fdName}
        </div>

    </td>


    <td>
    ${fdBank}
</td>

<td>
    <span class="fd-amount">
        ₹${fdAmount.toLocaleString("en-IN")}
    </span>
</td>

<td>
    ${formattedOpeningDate}
</td>

<td>
    ${formattedMaturityDate}
</td>

    <td>

        <span class="${daysClass}">
            ⏳ ${maturityAlert}
        </span>

    </td>


    <td>
        ${fdInterestRate}%
    </td>


    <td>

        <strong>
            ₹${fdMaturityAmount.toLocaleString("en-IN")}
        </strong>

    </td>


    <td>

        <span class="fd-status-active">

            ${
                fd.status === "renewed"
                    ? "🔄 Renewed"
                    : "🟢 Active"
            }

        </span>

    </td>


    <td>

        <div class="fd-table-buttons">

            <button
                type="button"
                class="edit-fd-button"
                data-id="${fdDoc.id}">
                ✏️ Edit
            </button>


            <button
                type="button"
                class="renew-fd-button"
                data-id="${fdDoc.id}">
                🔄 Renew
            </button>


            <button
                type="button"
                class="delete-fd-button"
                data-id="${fdDoc.id}">
                🗑️ Delete
            </button>

        </div>

    </td>

`;


if (allFDTableBody) {

    fdTableBody.appendChild(fdRow);

}
        });

        if (allFDCount) {

        allFDCount.textContent =
            fdCount;

}
        if (fdGoalCount) {
            fdGoalCount.textContent =
            `${fdCount} / 100`;

}

if (fdTotalPrincipal) {

    fdTotalPrincipal.textContent =
        `₹${totalPrincipal.toLocaleString("en-IN")}`;

}

if (fdExpectedMaturity) {

    fdExpectedMaturity.textContent =
        `₹${totalMaturity.toLocaleString("en-IN")}`;

}


        console.log(
            "Fixed Deposits loaded successfully:",
            fdSnapshot.size
        );


    } catch (error) {

        console.error(
            "Load Fixed Deposits Error:",
            error
        );

    }

}



// ===============================
// VIEW ALL FIXED DEPOSITS
// ===============================

const viewAllFDButton =
    document.querySelector(
        "#viewAllFDButton"
    );

const backToFDDashboardButton =
    document.querySelector(
        "#backToFDDashboardButton"
    );

const fdContainer =
    document.querySelector(
        "#fdContainer"
    );


// ===============================
// FD RENEWAL HISTORY
// ===============================

const viewAllFDHistoryButton =
    document.querySelector(
        "#viewAllFDHistoryButton"
    );

const backToFDHistoryDashboardButton =
    document.querySelector(
        "#backToFDHistoryDashboardButton"
    );

const fdHistorySection =
    document.querySelector(
        "#fdHistorySection"
    );

const allFDHistoryView =
    document.querySelector(
        "#allFDHistoryView"
    );


// ===============================
// VIEW ALL FIXED DEPOSITS
// ===============================

if (viewAllFDButton) {

    viewAllFDButton.addEventListener(
        "click",
        () => {

            if (fdContainer) {

                fdContainer.style.display =
                    "block";

                fdContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


            // ===============================
            // SHOW FD RENEWAL HISTORY
            // ===============================

            if (fdHistorySection) {

                fdHistorySection.style.display =
                    "block";

            }

        }
    );

}


// ===============================
// BACK TO FD DASHBOARD
// ===============================

if (backToFDDashboardButton) {

    backToFDDashboardButton.addEventListener(
        "click",
        () => {

            if (fdContainer) {

                fdContainer.style.display =
                    "none";

            }


            if (fdHistorySection) {

                fdHistorySection.style.display =
                    "none";

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// ===============================
// VIEW ALL FD RENEWAL HISTORY
// ===============================

if (viewAllFDHistoryButton) {

    viewAllFDHistoryButton.addEventListener(
        "click",
        () => {

            if (fdHistorySection) {

                fdHistorySection.style.display =
                    "none";

            }


            if (allFDHistoryView) {

                allFDHistoryView.style.display =
                    "block";

                allFDHistoryView.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// ===============================
// BACK FROM FD HISTORY
// ===============================

if (backToFDHistoryDashboardButton) {

    backToFDHistoryDashboardButton.addEventListener(
        "click",
        () => {

            if (allFDHistoryView) {

                allFDHistoryView.style.display =
                    "none";

            }


            if (fdContainer) {

                fdContainer.style.display =
                    "block";

            }


            if (fdHistorySection) {

                fdHistorySection.style.display =
                    "block";

            }


            if (fdContainer) {

                fdContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}

// ===============================
// EDIT FD BUTTON
// ===============================

let selectedFDId = null;

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("edit-fd-button")) {
        return;
    }

    selectedFDId =
        event.target.getAttribute("data-id");

    console.log(
        "Edit FD clicked:",
        selectedFDId
    );


    try {

        const user = auth.currentUser;

        if (!user) {
            alert("कृपया पहले Login करें।");
            return;
        }


        const fdSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "fixedDeposits"
            )
        );


        let selectedFD = null;


        fdSnapshot.forEach((fdDoc) => {

            if (fdDoc.id === selectedFDId) {

                selectedFD = fdDoc.data();

            }

        });


        if (!selectedFD) {

            alert("FD नहीं मिली।");
            return;

        }


        // Fill Edit Form

        const editFDName =
    document.querySelector("#editFDName");

const editFDBank =
    document.querySelector("#editFDBank");

const editFDAmount =
    document.querySelector("#editFDAmount");

const editFDDepositDate =
    document.querySelector("#editFDDepositDate");

const editFDMaturityDate =
    document.querySelector("#editFDMaturityDate");

const editFDInterestRate =
    document.querySelector("#editFDInterestRate");

const editFDCompounding =
    document.querySelector("#editFDCompounding");

const editFDMaturityAmount =
    document.querySelector("#editFDMaturityAmount");


if (
    !editFDName ||
    !editFDBank ||
    !editFDAmount ||
    !editFDDepositDate ||
    !editFDMaturityDate ||
    !editFDInterestRate ||
    !editFDCompounding ||
    !editFDMaturityAmount
) {

    console.error(
        "Edit FD Form elements missing."
    );

    alert(
        "Edit FD form के कुछ fields नहीं मिले।"
    );

    return;

}


editFDName.value =
    selectedFD.name || "";

editFDBank.value =
    selectedFD.bank || "";

editFDAmount.value =
    selectedFD.amount || "";

editFDDepositDate.value =
    selectedFD.depositDate || "";

editFDMaturityDate.value =
    selectedFD.maturityDate || "";

editFDInterestRate.value =
    selectedFD.interestRate || "";

editFDCompounding.value =
    selectedFD.compounding || 4;

editFDMaturityAmount.value =
    selectedFD.maturityAmount || "";


        // Show Edit Form

        const editFDContainer =
            document.querySelector("#editFDContainer");

        if (editFDContainer) {

            editFDContainer.style.display = "block";

            editFDContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(
            "Edit FD Load Error:",
            error
        );

        alert(
            "FD details load नहीं हो पाईं।"
        );

    }

});

// ===============================
// SAVE EDITED FD
// ===============================

document.addEventListener("submit", async (event) => {

    if (event.target.id !== "editFDForm") {
        return;
    }

    event.preventDefault();


    if (!selectedFDId) {

        alert("कोई FD selected नहीं है।");
        return;

    }


    try {

        const user = auth.currentUser;

        if (!user) {

            alert("कृपया पहले Login करें।");
            return;

        }


        const fdName =
            document.querySelector("#editFDName").value.trim();

        const fdBank =
            document.querySelector("#editFDBank").value.trim();

        const fdAmount =
            Number(
                document.querySelector("#editFDAmount").value
            );

        const fdDepositDate =
            document.querySelector("#editFDDepositDate").value;

        const fdMaturityDate =
            document.querySelector("#editFDMaturityDate").value;

        const fdInterestRate =
            Number(
                document.querySelector("#editFDInterestRate").value
            );

        const fdCompounding =
            Number(
                document.querySelector("#editFDCompounding").value
            );

        const fdMaturityAmount =
            Number(
                document.querySelector("#editFDMaturityAmount").value
            );


        console.log(
            "Updating FD:",
            selectedFDId
        );


        await updateDoc(
            doc(
                db,
                "users",
                user.uid,
                "fixedDeposits",
                selectedFDId
            ),
            {

                name: fdName,

                bank: fdBank,

                amount: fdAmount,

                depositDate: fdDepositDate,

                maturityDate: fdMaturityDate,

                interestRate: fdInterestRate,

                compounding: fdCompounding,

                maturityAmount: fdMaturityAmount,

                updatedAt: serverTimestamp()

            }
        );


        alert(
            "Fixed Deposit successfully updated!"
        );


        const editFDContainer =
            document.querySelector("#editFDContainer");

        if (editFDContainer) {

            editFDContainer.style.display = "none";

        }


        selectedFDId = null;


        await loadFixedDeposits();


    } catch (error) {

        console.error(
            "Update FD Error:",
            error
        );

        alert(
            "FD update नहीं हो पाई। कृपया फिर कोशिश करें।"
        );

    }

});

// ===============================
// DELETE FD
// ===============================

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("delete-fd-button")) {
        return;
    }

    const fdId =
        event.target.getAttribute("data-id");

    console.log(
        "Delete FD clicked:",
        fdId
    );


    if (!fdId) {

        alert("FD ID नहीं मिली।");
        return;

    }


    const confirmDelete =
        confirm(
            "क्या आप इस Fixed Deposit को Delete करना चाहते हैं?"
        );


    if (!confirmDelete) {

        console.log(
            "FD delete cancelled."
        );

        return;

    }


    try {

        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "कृपया पहले Login करें।"
            );

            return;

        }


        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "fixedDeposits",
                fdId
            )
        );


        alert(
            "Fixed Deposit successfully deleted!"
        );


        await loadFixedDeposits();


    } catch (error) {

        console.error(
            "Delete FD Error:",
            error
        );


        alert(
            "FD delete नहीं हो पाई। कृपया फिर कोशिश करें।"
        );

    }

});
// ===============================
// CANCEL EDIT FD
// ===============================

document.addEventListener("click", (event) => {

    if (
        event.target.id !==
        "cancelEditFDButton"
    ) {
        return;
    }


    const editFDContainer =
        document.querySelector(
            "#editFDContainer"
        );


    if (editFDContainer) {

        editFDContainer.style.display =
            "none";

    }


    selectedFDId = null;


    console.log(
        "Edit FD cancelled."
    );

});
// ===============================
// RENEW FD BUTTON
// ===============================

let selectedRenewFDId = null;

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("renew-fd-button")) {
        return;
    }

    selectedRenewFDId =
        event.target.getAttribute("data-id");

    console.log(
        "Renew FD clicked:",
        selectedRenewFDId
    );


    if (!selectedRenewFDId) {

        alert("FD ID नहीं मिली।");
        return;

    }


    try {

        const user = auth.currentUser;

        if (!user) {

            alert("कृपया पहले Login करें।");
            return;

        }


        const fdSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "fixedDeposits"
            )
        );


        let selectedFD = null;


        fdSnapshot.forEach((fdDoc) => {

            if (fdDoc.id === selectedRenewFDId) {

                selectedFD = fdDoc.data();

            }

        });


        if (!selectedFD) {

            alert("FD नहीं मिली।");
            return;

        }


        // Fill Renewal Form

        document.querySelector("#renewFDName").value =
            selectedFD.name || "";

        document.querySelector("#renewFDBank").value =
            selectedFD.bank || "";

        document.querySelector("#renewFDAmount").value =
            selectedFD.maturityAmount ||
            selectedFD.amount ||
            "";

        document.querySelector("#renewFDDepositDate").value =
            selectedFD.maturityDate || "";

        document.querySelector("#renewFDMaturityDate").value =
            "";

        document.querySelector("#renewFDInterestRate").value =
            selectedFD.interestRate || "";

        document.querySelector("#renewFDCompounding").value =
            selectedFD.compounding || 4;

        document.querySelector("#renewFDMaturityAmount").value =
            "";


        // Show Renewal Form

        const renewFDContainer =
            document.querySelector(
                "#renewFDContainer"
            );


        if (renewFDContainer) {

            renewFDContainer.style.display =
                "block";

            renewFDContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(
            "Renew FD Load Error:",
            error
        );

        alert(
            "FD details load नहीं हो पाईं।"
        );

    }

});
// ===============================
// SAVE RENEWED FD
// ===============================

document.addEventListener("submit", async (event) => {

    if (event.target.id !== "renewFDForm") {
        return;
    }

    event.preventDefault();


    if (!selectedRenewFDId) {

        alert("कोई FD selected नहीं है।");
        return;

    }


    try {

        const user = auth.currentUser;

        if (!user) {

            alert("कृपया पहले Login करें।");
            return;

        }


        const fdName =
            document.querySelector(
                "#renewFDName"
            ).value.trim();

        const fdBank =
            document.querySelector(
                "#renewFDBank"
            ).value.trim();

        const fdAmount =
            Number(
                document.querySelector(
                    "#renewFDAmount"
                ).value
            );

        const fdDepositDate =
            document.querySelector(
                "#renewFDDepositDate"
            ).value;

        const fdMaturityDate =
            document.querySelector(
                "#renewFDMaturityDate"
            ).value;

        const fdInterestRate =
            Number(
                document.querySelector(
                    "#renewFDInterestRate"
                ).value
            );

        const fdCompounding =
            Number(
                document.querySelector(
                    "#renewFDCompounding"
                ).value
            );

        const fdMaturityAmount =
            Number(
                document.querySelector(
                    "#renewFDMaturityAmount"
                ).value
            );


        if (
            !fdName ||
            !fdBank ||
            !fdAmount ||
            !fdDepositDate ||
            !fdMaturityDate ||
            !fdInterestRate ||
            !fdMaturityAmount
        ) {

            alert(
                "कृपया सभी FD details भरें।"
            );

            return;

        }


        console.log(
            "Saving renewed FD..."
        );


        // ===============================
        // 1. CREATE NEW FD
        // ===============================

        const newFDRef =
            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "fixedDeposits"
                ),
                {

                    name: fdName,

                    bank: fdBank,

                    amount: fdAmount,

                    depositDate: fdDepositDate,

                    maturityDate: fdMaturityDate,

                    interestRate: fdInterestRate,

                    compounding: fdCompounding,

                    maturityAmount: fdMaturityAmount,

                    status: "active",

                    renewedFrom:
                        selectedRenewFDId,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


        console.log(
            "New renewed FD created:",
            newFDRef.id
        );


        // ===============================
        // 2. MARK OLD FD AS RENEWED
        // ===============================

        await updateDoc(
            doc(
                db,
                "users",
                user.uid,
                "fixedDeposits",
                selectedRenewFDId
            ),
            {

                status: "renewed",

                renewedTo:
                    newFDRef.id,

                renewedAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


        alert(
            "Fixed Deposit successfully renewed!"
        );


        // Hide Renewal Form

        const renewFDContainer =
            document.querySelector(
                "#renewFDContainer"
            );


        if (renewFDContainer) {

            renewFDContainer.style.display =
                "none";

        }


        selectedRenewFDId = null;


        // Reload FD Dashboard

        await loadFixedDeposits();


    } catch (error) {

        console.error(
            "Renew FD Save Error:",
            error
        );

        console.error(
            "Renew FD Error Code:",
            error.code
        );

        console.error(
            "Renew FD Error Message:",
            error.message
        );


        alert(
            "FD renewal save नहीं हो पाई। कृपया फिर कोशिश करें।"
        );

    }

});
// ===============================
// CANCEL RENEW FD
// ===============================

document.addEventListener("click", (event) => {

    if (
        event.target.id !==
        "cancelRenewFDButton"
    ) {
        return;
    }


    const renewFDContainer =
        document.querySelector(
            "#renewFDContainer"
        );


    if (renewFDContainer) {

        renewFDContainer.style.display =
            "none";

    }


    selectedRenewFDId = null;


    console.log(
        "FD renewal cancelled."
    );

});
// ===============================
// LOAD FD RENEWAL HISTORY
// ===============================

async function loadFDHistory() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }


        const historyTableBody =
            document.querySelector(
            "#fdHistoryTableBody"
            );

        const allFDHistoryCount =
            document.querySelector(
             "#allFDHistoryCount"
            );

        const noHistoryMessage =
            document.querySelector(
                "#noFDHistoryMessage"
            );

if (!historyTableBody) {

    console.error(
        "FD History table body not found."
    );

    return;

}


        const fdSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "fixedDeposits"
                )
            );


        if (historyTableBody) {
            historyTableBody.innerHTML = "";
            }

            let historyCount = 0;


        // Convert snapshot into array
        // ताकि renewedTo से दूसरी FD खोज सकें

        const fdList = [];

        fdSnapshot.forEach((fdDoc) => {

            fdList.push({

                id: fdDoc.id,

                data: fdDoc.data()

            });

        });


        // ===============================
        // FIND RENEWED FDs
        // ===============================

        fdList.forEach((oldFD) => {

            const fd = oldFD.data;


            // केवल Renewed FDs दिखाएँ

        if (fd.status !== "renewed") {

    return;

}


// अगर Renewed To मौजूद नहीं है,
// तो यह valid renewal history नहीं है

if (!fd.renewedTo) {

    return;

}

            const fdName =
                fd.name || "Unnamed FD";

            const fdBank =
                fd.bank || "Unknown Bank";

            const fdAmount =
                Number(fd.amount || 0);

            const maturityAmount =
                Number(
                    fd.maturityAmount || 0
                );




            // ===============================
            // FIND NEW FD
            // ===============================

            let renewedFD = null;


            if (fd.renewedTo) {

                renewedFD =
                    fdList.find(
                        (item) =>
                            item.id ===
                            fd.renewedTo
                    );

            }


            // ===============================
            // NEW FD DETAILS
            // ===============================

            let renewedFDName = "-";
            let renewedFDAmount = 0;
            let renewedFDMaturityDate = "-";


            if (renewedFD) {

                renewedFDName =
                    renewedFD.data.name ||
                    "-";

                renewedFDAmount =
                    Number(
                        renewedFD.data.amount ||
                        0
                    );

                renewedFDMaturityDate =
                    renewedFD.data.maturityDate ||
                    "-";

            }
// अगर नया FD delete हो चुका है,
// तो इस renewal history को न दिखाएँ

if (!renewedFD) {

    return;

}


historyCount++;

// ===============================
// CREATE HISTORY TABLE ROW
// ===============================

const historyRow =
    document.createElement("tr");


historyRow.innerHTML = `

    <td>
        ${fdName}
    </td>

    <td>
        ${fdBank}
    </td>

    <td>
        ₹${fdAmount.toLocaleString("en-IN")}
    </td>

    <td>
        ${fd.maturityDate || "-"}
    </td>

    <td>
        ₹${maturityAmount.toLocaleString("en-IN")}
    </td>

    <td>
        🔄 Renewed
    </td>

    <td>
        ${renewedFDName}
    </td>

    <td>
        ₹${renewedFDAmount.toLocaleString("en-IN")}
    </td>

    <td>
        ${renewedFDMaturityDate}
    </td>

`;


if (historyTableBody) {

    historyTableBody.appendChild(
        historyRow
    );

}
        });

// ===============================
// UPDATE HISTORY COUNT
// ===============================

if (allFDHistoryCount) {

    allFDHistoryCount.textContent =
        historyCount;

}

        // ===============================
        // NO HISTORY MESSAGE
        // ===============================

        if (historyCount === 0) {

            if (noHistoryMessage) {

                noHistoryMessage.style.display =
                    "block";

            }

        }
        else {

            if (noHistoryMessage) {

                noHistoryMessage.style.display =
                    "none";

            }

        }


        console.log(
            "FD Renewal History loaded:",
            historyCount
        );


    }
    catch (error) {

        console.error(
            "Load FD History Error:",
            error
        );

    }

}

// ===============================
// VIEW ALL ACCOUNTS
// ===============================

const viewAllAccountsButton =
    document.querySelector("#viewAllAccountsButton");

const backToDashboardButton =
    document.querySelector("#backToDashboardButton");

const accountsSection =
    document.querySelector("#accountsContainer");

const allAccountsView =
    document.querySelector("#allAccountsView");


if (viewAllAccountsButton) {

    viewAllAccountsButton.addEventListener(
        "click",
        () => {

            if (accountsSection) {
                accountsSection.style.display = "none";
            }

            if (allAccountsView) {
                allAccountsView.style.display = "block";

                allAccountsView.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }
    );

}


if (backToDashboardButton) {

    backToDashboardButton.addEventListener(
        "click",
        () => {

            if (allAccountsView) {
                allAccountsView.style.display = "none";
            }

            if (accountsSection) {
                accountsSection.style.display = "grid";
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}

// ===============================
// ADD INSURANCE FORM
// ===============================

const addInsuranceButton =
    document.querySelector("#addInsuranceButton");

const cancelInsuranceButton =
    document.querySelector("#cancelInsuranceButton");

const insuranceFormContainer =
    document.querySelector("#insuranceFormContainer");


if (addInsuranceButton) {

    addInsuranceButton.addEventListener(
        "click",
        () => {

            if (insuranceFormContainer) {

                insuranceFormContainer.style.display =
                    "block";

                insuranceFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


if (cancelInsuranceButton) {

    cancelInsuranceButton.addEventListener(
        "click",
        () => {

            if (insuranceFormContainer) {

                insuranceFormContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// SAVE INSURANCE POLICY
// ===============================

const insuranceForm =
    document.querySelector("#insuranceForm");


if (insuranceForm) {

    insuranceForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            try {

                const user =
                    auth.currentUser;


                if (!user) {

                    alert(
                        "कृपया पहले Login करें।"
                    );

                    return;

                }


                const policyName =
                    document
                        .querySelector(
                            "#insurancePolicyName"
                        )
                        .value
                        .trim();


                const insuranceCompany =
                    document
                        .querySelector(
                            "#insuranceCompany"
                        )
                        .value
                        .trim();


                const policyNumber =
                    document
                        .querySelector(
                            "#insurancePolicyNumber"
                        )
                        .value
                        .trim();


                const insuranceType =
                    document
                        .querySelector(
                            "#insuranceType"
                        )
                        .value;


                const premium =
                    Number(
                        document
                            .querySelector(
                                "#insurancePremium"
                            )
                            .value
                    );


                const frequency =
                    document
                        .querySelector(
                            "#insuranceFrequency"
                        )
                        .value;


                const startDate =
                    document
                        .querySelector(
                            "#insuranceStartDate"
                        )
                        .value;


                const renewalDate =
                    document
                        .querySelector(
                            "#insuranceRenewalDate"
                        )
                        .value;


                const maturityDate =
                    document
                        .querySelector(
                            "#insuranceMaturityDate"
                        )
                        .value;


                const sumAssured =
                    Number(
                        document
                            .querySelector(
                                "#insuranceSumAssured"
                            )
                            .value
                    );


                if (
                    !policyName ||
                    !insuranceCompany ||
                    !policyNumber ||
                    !insuranceType ||
                    !premium ||
                    !frequency ||
                    !startDate ||
                    !renewalDate ||
                    !sumAssured
                ) {

                    alert(
                        "कृपया सभी required insurance details भरें।"
                    );

                    return;

                }


                console.log(
                    "Saving Insurance Policy..."
                );


                await addDoc(

                    collection(
                        db,
                        "users",
                        user.uid,
                        "insurance"
                    ),

                    {

                        policyName:
                            policyName,

                        company:
                            insuranceCompany,

                        policyNumber:
                            policyNumber,

                        type:
                            insuranceType,

                        premium:
                            premium,

                        frequency:
                            frequency,

                        startDate:
                            startDate,

                        renewalDate:
                            renewalDate,

                        maturityDate:
                            maturityDate,

                        sumAssured:
                            sumAssured,

                        status:
                            "active",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


                console.log(
                    "Insurance Policy saved successfully!"
                );


                alert(
                    "Insurance Policy successfully saved!"
                );


                insuranceForm.reset();


                if (
                    insuranceFormContainer
                ) {

                    insuranceFormContainer.style.display =
                        "none";

                }


            }
            catch (error) {

                console.error(
                    "Insurance Save Error:",
                    error
                );

                console.error(
                    "Insurance Error Code:",
                    error?.code
                );

                console.error(
                    "Insurance Error Message:",
                    error?.message
                );


                alert(
                    "Insurance policy save नहीं हो पाई। कृपया फिर कोशिश करें।"
                );

            }

        }
    );

}

// ===============================
// LOAD INSURANCE POLICIES
// ===============================

async function loadInsurance() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }


        const insuranceContainer =
            document.querySelector("#insuranceContainer");

        const allInsuranceView =
            document.querySelector("#allInsuranceView");

        if (allInsuranceView) {
            allInsuranceView.style.display = "none";
            }

        const noInsuranceMessage =
            document.querySelector("#noInsuranceMessage");

        if (!insuranceContainer) {
            console.error(
                "Insurance container not found."
            );
            return;
        }


        const insuranceSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "insurance"
                )
            );

            const allInsuranceCount =
                document.querySelector(
                "#allInsuranceCount"
            );

        if (allInsuranceCount) {
            allInsuranceCount.textContent =
            insuranceSnapshot.size;
        }

        console.log(
            "Insurance Count:",
            insuranceSnapshot.size
        );

        if (insuranceSnapshot.empty) {

            if (noInsuranceMessage) {
                noInsuranceMessage.style.display =
                    "block";
            }

            return;
        }


            if (insuranceContainer) {
                insuranceContainer.style.display =
                "grid";
        }


        insuranceContainer.innerHTML = "";
// Clear All Insurance Table before reloading
const allInsuranceTableBody =
    document.querySelector("#allInsuranceTableBody");

if (allInsuranceTableBody) {
    allInsuranceTableBody.innerHTML = "";
}

        insuranceSnapshot.forEach(
            (insuranceDoc) => {

                const policy =
                    insuranceDoc.data();


                console.log(
                    "Insurance loaded:",
                    insuranceDoc.id,
                    policy
                );


                const policyName =
                    policy.policyName ||
                    "Unnamed Policy";


                const company =
                    policy.company ||
                    "Unknown Company";


                const policyNumber =
                    policy.policyNumber ||
                    "-";


                const premium =
                    Number(
                        policy.premium || 0
                    );


                const sumAssured =
                    Number(
                        policy.sumAssured || 0
                    );


                const type =
                    policy.type ||
                    "other";


                const typeNames = {

                    life:
                        "🧑 Life Insurance",

                    health:
                        "❤️ Health Insurance",

                    motor:
                        "🚗 Motor Insurance",

                    home:
                        "🏠 Home Insurance",

                    other:
                        "🛡️ Other Insurance"

                };


                const typeName =
                    typeNames[type] ||
                    "🛡️ Insurance";

// =========================================
// INSURANCE SUMMARY
// =========================================

const insuranceSummaryButton =
    document.querySelector("#insuranceSummaryButton");

const insuranceSummary =
    document.querySelector("#insuranceSummary");


// =========================================
// UPDATE INSURANCE SUMMARY
// =========================================

async function updateInsuranceSummary() {

    try {

        const user = auth.currentUser;

        if (!user) {
            return;
        }


        const insuranceSnapshot =
            await getDocs(
                collection(
                    db,
                    "users",
                    user.uid,
                    "insurance"
                )
            );


        let totalPremium = 0;
        let totalSumAssured = 0;

        let activePolicies = 0;
        let lifePolicies = 0;


        insuranceSnapshot.forEach(
            (insuranceDoc) => {

                const policy =
                    insuranceDoc.data();


                // -------------------------
                // PREMIUM
                // -------------------------

                totalPremium +=
                    Number(policy.premium || 0);


                // -------------------------
                // SUM ASSURED
                // -------------------------

                totalSumAssured +=
                    Number(policy.sumAssured || 0);


                // -------------------------
                // ACTIVE POLICIES
                // -------------------------

                if (
                    policy.status === "active"
                ) {

                    activePolicies++;

                }


                // -------------------------
                // LIFE POLICIES
                // -------------------------

                if (
                    policy.type === "life"
                ) {

                    lifePolicies++;

                }

            }
        );


        // =================================
        // UPDATE SUMMARY CARDS
        // =================================

        const policyCountElement =
            document.querySelector(
                "#insuranceSummaryPolicyCount"
            );


        const premiumElement =
            document.querySelector(
                "#insuranceSummaryPremium"
            );


        const sumAssuredElement =
            document.querySelector(
                "#insuranceSummarySumAssured"
            );


        const activeCountElement =
            document.querySelector(
                "#insuranceSummaryActiveCount"
            );


        const lifeCountElement =
            document.querySelector(
                "#insuranceSummaryLifeCount"
            );


        if (policyCountElement) {

            policyCountElement.textContent =
                insuranceSnapshot.size;

        }


        if (premiumElement) {

            premiumElement.textContent =
                "₹" +
                totalPremium.toLocaleString("en-IN");

        }


        if (sumAssuredElement) {

            sumAssuredElement.textContent =
                "₹" +
                totalSumAssured.toLocaleString("en-IN");

        }


        if (activeCountElement) {

            activeCountElement.textContent =
                activePolicies;

        }


        if (lifeCountElement) {

            lifeCountElement.textContent =
                lifePolicies;

        }


        console.log(
            "Insurance Summary Updated:",
            {
                policies: insuranceSnapshot.size,
                premium: totalPremium,
                sumAssured: totalSumAssured,
                active: activePolicies,
                life: lifePolicies
            }
        );


    }
    catch (error) {

        console.error(
            "Insurance Summary Error:",
            error
        );

    }

}


// =========================================
// INSURANCE SUMMARY TOGGLE
// FINAL VERSION
// =========================================

if (
    insuranceSummaryButton &&
    insuranceSummary
) {

    insuranceSummaryButton.onclick =
        async function () {

            const isHidden =
                window.getComputedStyle(
                    insuranceSummary
                ).display === "none";


            // =============================
            // SHOW SUMMARY
            // =============================

            if (isHidden) {

                await updateInsuranceSummary();

                insuranceSummary.style.display =
                    "flex";

                return;

            }


            // =============================
            // HIDE SUMMARY
            // =============================

            insuranceSummary.style.display =
                "none";

        };

}

// ===============================
// INSURANCE RENEWAL ALERT
// ===============================

let renewalAlert = "";
let renewalClass = "insurance-days-safe";

let insuranceStatus = "🟢 Active";
let insuranceStatusClass = "insurance-status-active";

if (policy.renewalDate) {

    const today = new Date();

    const renewalDate =
        new Date(
            policy.renewalDate + "T00:00:00"
        );

    const difference =
        renewalDate.getTime() -
        today.getTime();

    const daysLeft =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (daysLeft < 0) {

    renewalAlert =
        "⚫ Expired";

    renewalClass =
        "insurance-days-expired";

    insuranceStatus =
        "⚫ Expired";

    insuranceStatusClass =
        "insurance-status-expired";

}

    else if (daysLeft === 0) {

        renewalAlert =
            "🔴 Renew Today";

        renewalClass =
            "insurance-days-danger";

    }

    else if (daysLeft <= 30) {

    renewalAlert =
        `🔴 ${daysLeft} Days Left`;

    renewalClass =
        "insurance-days-danger";

    insuranceStatus =
        "🔴 Renewal Due Soon";

    insuranceStatusClass =
        "insurance-status-danger";

}

    else if (
    renewalDate.getMonth() ===
        today.getMonth()
    &&
    renewalDate.getFullYear() ===
        today.getFullYear()
) {

    renewalAlert =
        "🟠 Renewing This Month";

    renewalClass =
        "insurance-days-warning";

    insuranceStatus =
        "🟠 Renewing This Month";

    insuranceStatusClass =
        "insurance-status-warning";

}

    else {

        renewalAlert =
            `🟢 ${daysLeft} Days Left`;

        renewalClass =
            "insurance-days-safe";

    }

}


// ===============================
// CREATE INSURANCE TABLE ROW
// ===============================

const insuranceRow =
    document.createElement("tr");


insuranceRow.innerHTML = `

    <!-- INSURANCE -->

    <td>

        <strong>
            🛡️ ${policyName}
        </strong>

    </td>


    <!-- COMPANY -->

    <td>
        ${company}
    </td>


    <!-- TYPE -->

    <td>
        ${typeName}
    </td>


    <!-- POLICY NUMBER -->

    <td>
        ${policyNumber || "-"}
    </td>


    <!-- PREMIUM -->

    <td>

        ₹${premium.toLocaleString("en-IN")}

    </td>


    <!-- FREQUENCY -->

<td>
    ${policy.frequency || "-"}
</td>


<!-- START DATE -->

<td>
    ${policy.startDate || "-"}
</td>


<!-- RENEWAL DATE -->

<td>

        <div>
            ${policy.renewalDate || "-"}
        </div>

        <span class="${renewalClass}">
            ⏳ ${renewalAlert}
        </span>

    </td>


    <!-- SUM ASSURED -->

    <td>

        ₹${sumAssured.toLocaleString("en-IN")}

    </td>


    <!-- STATUS -->

    <td>

        <span class="${insuranceStatusClass}">
            ${insuranceStatus}
        </span>

    </td>


    <!-- ACTIONS -->

    <td>

        <div class="insurance-table-buttons">

            <button
                type="button"
                class="edit-insurance-button"
                data-id="${insuranceDoc.id}">

                ✏️ Edit

            </button>


            <button
                type="button"
                class="delete-insurance-button"
                data-id="${insuranceDoc.id}">

                🗑️ Delete

            </button>

        </div>

    </td>

`;


console.log(
    "EDIT BUTTON CHECK:",
    insuranceRow.querySelector(
        ".edit-insurance-button"
    )
);


// ===============================
// ADD ROW TO INSURANCE TABLE
// ===============================

const allInsuranceTableBody =
    document.querySelector(
        "#allInsuranceTableBody"
    );


if (allInsuranceTableBody) {

    allInsuranceTableBody.appendChild(
        insuranceRow
    );

}

}
);


        console.log(
            "Insurance loaded successfully:",
            insuranceSnapshot.size
        );


    }
    catch (error) {

        console.error(
            "Load Insurance Error:",
            error
        );

    }

}

// ===============================
// EDIT INSURANCE POLICY
// ===============================

let editingInsuranceId = null;

const editInsuranceFormContainer =
    document.querySelector(
        "#editInsuranceFormContainer"
    );

const editInsuranceForm =
    document.querySelector(
        "#editInsuranceForm"
    );

const cancelEditInsuranceButton =
    document.querySelector(
        "#cancelEditInsuranceButton"
    );


document.addEventListener(
    "click",
    async (event) => {

        const editButton =
            event.target.closest(
                ".edit-insurance-button"
            );

        if (!editButton) {
            return;
        }


        const insuranceId =
            editButton.dataset.id;

        if (!insuranceId) {
            console.error(
                "Insurance ID not found."
            );
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

            const insuranceDocRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "insurance",
                    insuranceId
                );


            const insuranceDocSnapshot =
                await getDoc(
                    insuranceDocRef
                );


            if (!insuranceDocSnapshot.exists()) {

                alert(
                    "Insurance policy नहीं मिली।"
                );

                return;
            }


            const policy =
                insuranceDocSnapshot.data();


            editingInsuranceId =
                insuranceId;


            document.querySelector(
                "#editInsurancePolicyName"
            ).value =
                policy.policyName || "";


            document.querySelector(
                "#editInsuranceCompany"
            ).value =
                policy.company || "";


            document.querySelector(
                "#editInsurancePolicyNumber"
            ).value =
                policy.policyNumber || "";


            document.querySelector(
                "#editInsuranceType"
            ).value =
                policy.type || "other";


            document.querySelector(
                "#editInsurancePremium"
            ).value =
                policy.premium || 0;


            document.querySelector(
                "#editInsuranceFrequency"
            ).value =
                policy.frequency || "yearly";


            document.querySelector(
                "#editInsuranceStartDate"
            ).value =
                policy.startDate || "";


            document.querySelector(
                "#editInsuranceRenewalDate"
            ).value =
                policy.renewalDate || "";


            document.querySelector(
                "#editInsuranceMaturityDate"
            ).value =
                policy.maturityDate || "";


            document.querySelector(
                "#editInsuranceSumAssured"
            ).value =
                policy.sumAssured || 0;


            if (
                editInsuranceFormContainer
            ) {

                editInsuranceFormContainer.style.display =
                    "block";

                editInsuranceFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


        }
        catch (error) {

            console.error(
                "Load Insurance For Edit Error:",
                error
            );

            alert(
                "Insurance policy की details load नहीं हो पाईं।"
            );

        }

    }
);


if (cancelEditInsuranceButton) {

    cancelEditInsuranceButton.addEventListener(
        "click",
        () => {

            editingInsuranceId = null;

            if (
                editInsuranceFormContainer
            ) {

                editInsuranceFormContainer.style.display =
                    "none";

            }

        }
    );

}

// ===============================
// UPDATE INSURANCE POLICY
// ===============================

if (editInsuranceForm) {

    editInsuranceForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!editingInsuranceId) {

                alert(
                    "कृपया पहले कोई Insurance policy चुनें।"
                );

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

                const updatedPolicy = {

                    policyName:
                        document.querySelector(
                            "#editInsurancePolicyName"
                        ).value.trim(),

                    company:
                        document.querySelector(
                            "#editInsuranceCompany"
                        ).value.trim(),

                    policyNumber:
                        document.querySelector(
                            "#editInsurancePolicyNumber"
                        ).value.trim(),

                    type:
                        document.querySelector(
                            "#editInsuranceType"
                        ).value,

                    premium:
                        Number(
                            document.querySelector(
                                "#editInsurancePremium"
                            ).value
                        ),

                    frequency:
                        document.querySelector(
                            "#editInsuranceFrequency"
                        ).value,

                    startDate:
                        document.querySelector(
                            "#editInsuranceStartDate"
                        ).value,

                    renewalDate:
                        document.querySelector(
                            "#editInsuranceRenewalDate"
                        ).value,

                    maturityDate:
                        document.querySelector(
                            "#editInsuranceMaturityDate"
                        ).value,

                    sumAssured:
                        Number(
                            document.querySelector(
                                "#editInsuranceSumAssured"
                            ).value
                        ),

                    updatedAt:
                        serverTimestamp()

                };


                const insuranceDocRef =
                    doc(
                        db,
                        "users",
                        user.uid,
                        "insurance",
                        editingInsuranceId
                    );


                await updateDoc(
                    insuranceDocRef,
                    updatedPolicy
                );


                console.log(
                    "Insurance Policy updated successfully:",
                    editingInsuranceId
                );


                alert(
                    "Insurance Policy successfully updated!"
                );


                editingInsuranceId = null;


                editInsuranceForm.reset();


                if (
                    editInsuranceFormContainer
                ) {

                    editInsuranceFormContainer.style.display =
                        "none";

                }


                await loadInsurance();


            }
            catch (error) {

                console.error(
                    "Update Insurance Error:",
                    error
                );

                console.error(
                    "Update Insurance Error Code:",
                    error?.code
                );

                console.error(
                    "Update Insurance Error Message:",
                    error?.message
                );


                alert(
                    "Insurance Policy update नहीं हो पाई। कृपया फिर कोशिश करें।"
                );

            }

        }
    );

}

// ===============================
// DELETE INSURANCE POLICY
// ===============================

document.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-insurance-button"
            );

        if (!deleteButton) {
            return;
        }


        const insuranceId =
            deleteButton.dataset.id;


        if (!insuranceId) {

            console.error(
                "Insurance ID not found."
            );

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


        const confirmDelete =
            confirm(
                "क्या आप इस Insurance Policy को delete करना चाहते हैं?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const insuranceDocRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "insurance",
                    insuranceId
                );


            await deleteDoc(
                insuranceDocRef
            );


            console.log(
                "Insurance Policy deleted:",
                insuranceId
            );


            alert(
                "Insurance Policy successfully deleted!"
            );


            await loadInsurance();


        }
        catch (error) {

            console.error(
                "Delete Insurance Error:",
                error
            );

            console.error(
                "Delete Insurance Error Code:",
                error?.code
            );

            console.error(
                "Delete Insurance Error Message:",
                error?.message
            );


            alert(
                "Insurance Policy delete नहीं हो पाई। कृपया फिर कोशिश करें।"
            );

        }

    }
);

// ===============================
// VIEW ALL INSURANCE
// ===============================

const viewAllInsuranceButton =
    document.querySelector(
        "#viewAllInsuranceButton"
    );

const backToInsuranceDashboardButton =
    document.querySelector(
        "#backToInsuranceDashboardButton"
    );

const insuranceSection =
    document.querySelector(
        "#insuranceContainer"
    );

const allInsuranceView =
    document.querySelector(
        "#allInsuranceView"
    );


if (viewAllInsuranceButton) {

    viewAllInsuranceButton.addEventListener(
        "click",
        () => {

            if (insuranceSection) {
                insuranceSection.style.display =
                    "none";
            }

            if (allInsuranceView) {

                allInsuranceView.style.display =
                    "block";

                allInsuranceView.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// ===============================
// BACK TO INSURANCE DASHBOARD
// ===============================

if (backToInsuranceDashboardButton) {

    backToInsuranceDashboardButton.addEventListener(
        "click",
        () => {

            if (allInsuranceView) {
                allInsuranceView.style.display =
                    "none";
            }

            if (insuranceSection) {
                insuranceSection.style.display =
                    "grid";
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}

// =========================================
// INVESTMENT SUMMARY TOGGLE
// =========================================

const investmentSummaryButton =
    document.querySelector(
        "#investmentSummaryButton"
    );

const investmentSummary =
    document.querySelector(
        "#investmentSummary"
    );


if (
    investmentSummaryButton &&
    investmentSummary
) {

    investmentSummaryButton.addEventListener(
        "click",
        () => {

            if (
                investmentSummary.style.display ===
                "none"
            ) {

                investmentSummary.style.display =
                    "flex";

            }
            else {

                investmentSummary.style.display =
                    "none";

            }

        }
    );

}

// =========================================
// HIDE OLD FIXED DEPOSIT DASHBOARD HEADER
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const oldFDHeader =
        document.querySelector(
            "#oldFixedDepositDashboardHeader"
        );

    if (oldFDHeader) {

        oldFDHeader.style.setProperty(
            "display",
            "none",
            "important"
        );

    }

});

// ======================================================
// SHARES HOLDINGS VIEW - STEP 4
// Existing Shares button को Shares Holdings page से जोड़ना
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const sharesButton =
        document.querySelector(
            "#viewSharesFromInvestmentsButton"
        );

    const sharesContainer =
        document.querySelector(
            "#sharesContainer"
        );

    const investmentTableWrapper =
        document.querySelector(
            "#investmentTableWrapper"
        );

    const investmentsSectionTitle =
        document.querySelector(
            "#investmentsSectionTitle"
        );

    const addInvestmentButton =
        document.querySelector(
            "#addInvestmentButton"
        );

    const viewAllInvestmentsButton =
        document.querySelector(
            "#viewAllInvestmentsButton"
        );

    const backToInvestmentsDashboardButton =
        document.querySelector(
            "#backToInvestmentsDashboardButton"
        );


    console.log(
        "Shares View Elements:",
        {
            sharesButton: !!sharesButton,
            sharesContainer: !!sharesContainer
        }
    );


    // ==================================================
    // SHARES BUTTON
    // ==================================================

    if (sharesButton) {

        sharesButton.addEventListener(
            "click",
            function () {

                console.log(
                    "Shares button clicked"
                );


                // Shares page दिखाओ
                if (sharesContainer) {

                    sharesContainer.style.display =
                        "block";
                }

                window.loadShares();

                if (window.loadShareTradingHistory) {
    window.loadShareTradingHistory();
}

                // Main Investment table छुपाओ
                if (investmentTableWrapper) {

                    investmentTableWrapper.style.display =
                        "none";
                }


                // Title बदलो
                if (investmentsSectionTitle) {

                    investmentsSectionTitle.textContent =
                        "📈 Share Holdings";
                }


                // Dashboard के buttons छुपाओ
                if (addInvestmentButton) {

                    addInvestmentButton.style.display =
                        "none";
                }


                if (viewAllInvestmentsButton) {

                    viewAllInvestmentsButton.style.display =
                        "none";
                }


                if (sharesButton) {

                    sharesButton.style.display =
                        "none";
                }


                // Back button दिखाओ
                if (backToInvestmentsDashboardButton) {

                    backToInvestmentsDashboardButton.style.display =
                        "inline-block";
                }

            }
        );

    }


    // ==================================================
    // BACK TO INVESTMENT DASHBOARD
    // ==================================================

    if (backToInvestmentsDashboardButton) {

        backToInvestmentsDashboardButton.addEventListener(
            "click",
            function () {

                console.log(
                    "Back to Investment Dashboard clicked"
                );


                // Shares page hide
                if (sharesContainer) {

                    sharesContainer.style.display =
                        "none";
                }


                // Investment table वापस दिखाओ
                if (investmentTableWrapper) {

                    investmentTableWrapper.style.display =
                        "block";
                }


                // Original title
                if (investmentsSectionTitle) {

                    investmentsSectionTitle.textContent =
                        "📈 My Investments";
                }


                // Original buttons वापस दिखाओ
                if (addInvestmentButton) {

                    addInvestmentButton.style.display =
                        "inline-block";
                }


                if (viewAllInvestmentsButton) {

                    viewAllInvestmentsButton.style.display =
                        "inline-block";
                }


                if (sharesButton) {

                    sharesButton.style.display =
                        "inline-block";
                }


                // Back button hide
                backToInvestmentsDashboardButton.style.display =
                    "none";

            }
        );

    }

});

document.getElementById("backToSharesDashboardButton")?.addEventListener("click", function () {
    const sharesContainer = document.getElementById("sharesContainer");
    const investmentTableWrapper = document.getElementById("investmentTableWrapper");
    const title = document.getElementById("investmentsSectionTitle");

    // Close Shares Holdings
    if (sharesContainer) {
        sharesContainer.style.display = "none";
    }

    // Keep Investment list hidden
    if (investmentTableWrapper) {
        investmentTableWrapper.style.display = "none";
    }

    // Restore Investment Dashboard title
    if (title) {
        title.textContent = "📈 My Investments";
    }

    // Restore dashboard buttons
    const addInvestmentButton = document.getElementById("addInvestmentButton");
    const viewAllInvestmentsButton = document.getElementById("viewAllInvestmentsButton");
    const viewFixedDepositsButton = document.getElementById("viewFixedDepositsFromInvestmentsButton");
    const viewSharesButton = document.getElementById("viewSharesFromInvestmentsButton");
    const viewMutualFundsButton = document.getElementById("viewMutualFundsFromInvestmentsButton");
    const viewOtherInvestmentsButton = document.getElementById("viewOtherInvestmentsFromInvestmentsButton");
    const backButton = document.getElementById("backToInvestmentsDashboardButton");

    if (addInvestmentButton) addInvestmentButton.style.display = "";
    if (viewAllInvestmentsButton) viewAllInvestmentsButton.style.display = "";
    if (viewFixedDepositsButton) viewFixedDepositsButton.style.display = "";
    if (viewSharesButton) viewSharesButton.style.display = "";
    if (viewMutualFundsButton) viewMutualFundsButton.style.display = "";
    if (viewOtherInvestmentsButton) viewOtherInvestmentsButton.style.display = "";

    if (backButton) {
        backButton.style.display = "none";
    }
});

// ==================================================
// LOAD SHARES FROM FIRESTORE — TEST + TABLE
// ==================================================

window.loadShares = async function () {

    const user = auth.currentUser;

    if (!user) {
        console.log("SHARES TEST: User not logged in");
        return;
    }

    try {

        const sharesSnapshot = await getDocs(
            collection(
                db,
                "users",
                user.uid,
                "shares"
            )
        );

        console.log(
            "SHARES FROM FIRESTORE:",
            sharesSnapshot.size
        );

        const tableBody =
            document.querySelector(
                "#sharesContainer #sharesTableBody"
            );

        if (!tableBody) {
            console.error("SHARES TABLE BODY NOT FOUND");
            return;
        }

        tableBody.innerHTML = "";

        let totalInvestment = 0;
let totalCurrentValue = 0;
let totalProfitLoss = 0;

        sharesSnapshot.forEach((shareDoc) => {

            const share = shareDoc.data();

            console.log(
                "SHARE:",
                shareDoc.id,
                share
            );

            const quantity = Number(share.quantity || 0);
            const buyPrice = Number(share.buyPrice || 0);
            const currentPrice = Number(share.currentPrice || 0);

            const invested =
                Number(share.totalAmount || 0) ||
                (quantity * buyPrice);

            const currentValue =
                quantity * currentPrice;

            const profitLoss =
                currentValue - invested;

                totalInvestment += invested;
totalCurrentValue += currentValue;
totalProfitLoss += profitLoss;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong>${share.companyName || "-"}</strong>
                    <br>
                    <small>${share.symbol || "-"}</small>
                </td>

                <td>${share.exchange || "-"}</td>

                <td>${quantity}</td>

                <td>₹${buyPrice.toFixed(2)}</td>

                <td>₹${invested.toFixed(2)}</td>
<td class="share-cmp-cell">₹${currentPrice.toFixed(2)}</td>
<td class="share-current-value-cell">₹${currentValue.toFixed(2)}</td>
<td class="share-pl-cell">₹${profitLoss.toFixed(2)}</td>

                <td>${share.broker || "-"}</td>

                <td>${share.date || "-"}</td>

    <td>
    <button
        type="button"
        class="share-sell-button"
        data-id="${shareDoc.id}">
        💰 Sell
    </button>

    <button
        type="button"
        class="share-edit-button"
        data-id="${shareDoc.id}">
        ✏️
    </button>

    <button
        type="button"
        class="share-delete-button"
        data-id="${shareDoc.id}">
        🗑️
    </button>
    </td>
            `;

            tableBody.appendChild(row);

            window.fetchShareCMP(share.symbol).then(async (cmp) => {

    if (cmp === null) return;

    const latestCurrentValue = quantity * cmp;
    const latestProfitLoss = latestCurrentValue - invested;

    // Update table
    row.cells[5].textContent =
    `₹${cmp.toFixed(2)}`;

row.cells[6].textContent =
    `₹${latestCurrentValue.toFixed(2)}`;

row.cells[7].textContent =
    `₹${latestProfitLoss.toFixed(2)}`;

    // Save latest CMP to Firestore
    try {

        await updateDoc(
            doc(
                db,
                "users",
                user.uid,
                "shares",
                shareDoc.id
            ),
            {
                currentPrice: cmp,
                updatedAt: serverTimestamp()
            }
        );

        console.log(
            "CMP UPDATED:",
            share.symbol,
            cmp
        );

    } catch (error) {

        console.error(
            "CMP FIRESTORE UPDATE ERROR:",
            error
        );
    }
});
        });

        const totalPLPercentage =
    totalInvestment > 0
        ? (totalProfitLoss / totalInvestment) * 100
        : 0;

const totalInvestmentElement =
    document.getElementById("sharesTotalInvestment");

const totalValueElement =
    document.getElementById("sharesTotalValue");

const totalPLElement =
    document.getElementById("sharesTotalPL");

if (totalInvestmentElement) {
    totalInvestmentElement.textContent =
        `₹${totalInvestment.toFixed(2)}`;
}

if (totalValueElement) {
    totalValueElement.textContent =
        `₹${totalCurrentValue.toFixed(2)}`;
}

if (totalPLElement) {
    totalPLElement.textContent =
        `₹${totalProfitLoss.toFixed(2)} ` +
        `(${totalPLPercentage.toFixed(2)}%)`;
}

        const countElement =
            document.getElementById("allSharesCount");

        if (countElement) {
            countElement.textContent =
                sharesSnapshot.size;
        }

        const noSharesMessage =
            document.querySelector(
                "#sharesContainer #noSharesMessage"
            );

        if (noSharesMessage) {
            noSharesMessage.style.display =
                sharesSnapshot.size === 0
                    ? ""
                    : "none";
        }

        console.log("SHARES TABLE RENDERED");

    } catch (error) {

        console.error(
            "LOAD SHARES TEST ERROR:",
            error
        );

    }
};

// ==================================================
// SHARE EDIT BUTTON — OPEN EXISTING SHARE FORM
// ==================================================

document.addEventListener("click", async function (event) {

    const editButton = event.target.closest(".share-edit-button");

    if (!editButton) {
        return;
    }

    const shareId = editButton.dataset.id;

    console.log("EDIT SHARE CLICKED:", shareId);

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    try {

        const shareDocRef = doc(
            db,
            "users",
            user.uid,
            "shares",
            shareId
        );

        const shareSnapshot = await getDoc(shareDocRef);

        if (!shareSnapshot.exists()) {
            console.error("SHARE NOT FOUND:", shareId);
            return;
        }

        const share = shareSnapshot.data();

        console.log("EDIT SHARE DATA:", share);

        // Existing Share Form खोलें
        window.openShareForm(null);

        // Form fields में existing data भरें
        document.getElementById("shareTransactionType").value =
            share.transactionType || "";

        document.getElementById("shareDate").value =
            share.date || "";

        document.getElementById("shareStockSearch").value =
            `${share.symbol || ""} — ${share.companyName || ""}`;

        document.getElementById("shareStockName").value =
            share.companyName || "";

        document.getElementById("shareStockSymbol").value =
            share.symbol || "";

        document.getElementById("shareStockExchange").value =
            share.exchange || "";

        document.getElementById("shareExchange").value =
            share.exchange || "";

        document.getElementById("shareBroker").value =
            share.broker || "";

        document.getElementById("shareQuantity").value =
            share.quantity || 0;

        document.getElementById("sharePrice").value =
            share.buyPrice || 0;

        document.getElementById("shareCharges").value =
            share.charges || 0;

        document.getElementById("shareTotalAmount").value =
            share.totalAmount || 0;

        document.getElementById("shareCurrentPrice").value =
            share.currentPrice || 0;

        document.getElementById("shareRemarks").value =
            share.remarks || "";

        // Editing document याद रखें
        window.editingShareId = shareId;

        console.log(
            "SHARE FORM READY FOR EDIT:",
            shareId
        );

    } catch (error) {

        console.error(
            "EDIT SHARE ERROR:",
            error
        );

    }

});

// --------------------------------------------------
// Shares Holdings → Delete Share
// --------------------------------------------------

document.addEventListener("click", async function (event) {

    const deleteButton = event.target.closest(".share-delete-button");

    if (!deleteButton) return;

    const shareId = deleteButton.dataset.id;

    console.log("DELETE SHARE CLICKED:", shareId);

    const user = auth.currentUser;

    if (!user) {
        alert("कृपया पहले login करें।");
        return;
    }

    const confirmDelete = confirm(
        "क्या आप यह Share holding delete करना चाहते हैं?"
    );

    if (!confirmDelete) return;

    try {

        const shareDocRef = doc(
            db,
            "users",
            user.uid,
            "shares",
            shareId
        );

        await deleteDoc(shareDocRef);

        console.log(
            "SHARE DELETED SUCCESSFULLY:",
            shareId
        );

        alert("Share successfully delete हो गया।");

        // Table refresh
        if (window.loadShares) {
            await window.loadShares();
        }

    } catch (error) {

        console.error("DELETE SHARE ERROR:", error);

        alert(
            "Share delete नहीं हो सका। Console में error देखें।"
        );

    }

});

// ======================================================
// GLOBAL MODULE UI RESET
// हर बार नया module खोलने पर उसकी पुरानी sub-view
// / form / summary state reset होगी
// ======================================================

function resetAllModuleUI() {

    const resetToNone = [
        "#transactionFormContainer",

        "#investmentSummary",
        "#investmentFormContainer",
        "#allInvestmentsView",
        "#investmentTableWrapper",
        "#fixedDepositsInvestmentView",

        "#fdContainer",
        "#fdHistorySection",
        "#allFDHistoryView",

        "#sharesInvestmentView",
        "#otherInvestmentsInvestmentView",
        "#mutualFundsInvestmentView",

        "#sharesContainer",

        "#allInsuranceView",

"#insuranceSummary",
"#insuranceContainer",
"#insuranceFormContainer",
"#editInsuranceFormContainer",

        "#accountFormContainer",

        "#accountSummary",

        "#allAccountsView",

        "#loanFormContainer",

        "#loanFormContainer",

"#propertySummary",
"#propertyFormContainer",
"#editPropertyFormContainer",
"#allPropertiesView",

"#rentalManagementView",
"#rentalUnitFormContainer",
"#rentalUnitsTableWrapper",
"#rentEntryFormContainer",
"#rentRegisterTableWrapper",
"#rentRegisterSummary",


        ".insurance-section",
    ];

    resetToNone.forEach(selector => {

        const element =
            document.querySelector(selector);

        if (element) {
            element.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

    });



    // ------------------------------------------
    // RESET COMMON FORMS
    // ------------------------------------------

    document
        .querySelectorAll(
            ".transaction-type-inline-form, " +
            ".transaction-category-inline-form"
        )
        .forEach(form => {

            form.style.setProperty(
                "display",
                "none",
                "important"
            );

        });

// ------------------------------------------
// RESET TRANSACTION EXTRA ROWS
// ------------------------------------------

const transactionEntryBody =
    document.getElementById("transactionEntryBody");

if (transactionEntryBody) {

    const transactionRows =
        transactionEntryBody.querySelectorAll(
            ".transaction-entry-row"
        );

    transactionRows.forEach((row, index) => {

        if (index > 0) {
            row.remove();
        }

    });

}

// ------------------------------------------
// RESET ADD NEW CATEGORY FORM
// ------------------------------------------

const categoryForm =
    document.getElementById(
        "categoryFormContainer"
    );

if (categoryForm) {

    categoryForm.style.setProperty(
        "display",
        "none",
        "important"
    );

}

// ------------------------------------------
// RESET ADD ACCOUNT BUTTON
// ------------------------------------------

const addAccountButton =
    document.getElementById(
        "addAccountButton"
    );

if (addAccountButton) {

    addAccountButton.style.setProperty(
        "display",
        "inline-block",
        "important"
    );

}

// ------------------------------------------
// RESET INVESTMENTS BUTTONS
// ------------------------------------------

const addInvestmentButton =
    document.getElementById(
        "addInvestmentButton"
    );

const viewAllInvestmentsButton =
    document.getElementById(
        "viewAllInvestmentsButton"
    );

const backToInvestmentsDashboardButton =
    document.getElementById(
        "backToInvestmentsDashboardButton"
    );

if (addInvestmentButton) {
    addInvestmentButton.style.setProperty(
        "display",
        "inline-block",
        "important"
    );
}

if (viewAllInvestmentsButton) {
    viewAllInvestmentsButton.style.setProperty(
        "display",
        "inline-block",
        "important"
    );
}

if (backToInvestmentsDashboardButton) {
    backToInvestmentsDashboardButton.style.setProperty(
        "display",
        "none",
        "important"
    );
}

    // ------------------------------------------
    // RESET SCROLL POSITION
    // ------------------------------------------

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    console.log(
        "✅ ALL MODULE UI STATES RESET"
    );
}

// ======================================================
// SBM MASTER VIEW CONTROLLER
// Dashboard OR ONE MODULE ONLY
// ======================================================

function showMasterView(view) {
    console.log("MASTER VIEW:", view);
// Hide old page-level Logout button
document.querySelectorAll("button").forEach(button => {

    const text = button.textContent.trim();

    if (
        text === "Logout" &&
        !button.classList.contains("sidebar-menu-item")
    ) {
        button.style.display = "none";
    }

});

    // ----------------------------------------------
    // DASHBOARD
    // ----------------------------------------------

    const dashboard =
        document.getElementById("masterDashboard");


    // ----------------------------------------------
// ALL MODULES
// ----------------------------------------------

const modules = {

    transactions:
        document.getElementById("transactionsSection"),

    accounts:
        document.getElementById("accountsSection"),

    loans:
        document.getElementById("loansSection"),

    investments:
        document.getElementById("investmentsSection"),

    properties:
        document.getElementById("propertiesSection"),

    insurance:
        document.querySelector(".insurance-section"),

    financialGoals:
        document.getElementById("financialGoalsSection"),

    fundsAvailable:
        document.getElementById("fundsAvailableSection")

};
    // ----------------------------------------------
    // FIRST HIDE DASHBOARD
    // ----------------------------------------------

    if (dashboard) {

        dashboard.style.display =
            "none";
    }


    // ----------------------------------------------
    // HIDE AVAILABLE MODULES
    // ----------------------------------------------

    Object.entries(modules).forEach(
        ([name, element]) => {

            if (element) {

                element.style.display =
                    "none";

            }

        }
    );


    // ----------------------------------------------
    // SHOW DASHBOARD
    // ----------------------------------------------

    if (view === "dashboard") {

        if (dashboard) {

            dashboard.style.display =
                "block";
        }

        return;
    }

    
// ----------------------------------------------
// SHOW SELECTED MODULE ONLY
// ----------------------------------------------

const selectedModule =
    modules[view];

if (selectedModule) {

    selectedModule.style.display =
        "block";

    selectedModule.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

} else {

    console.warn(
        "MASTER MODULE NOT FOUND:",
        view
    );
}

}

// ======================================================
// MASTER SIDEBAR NAVIGATION — STEP 1
// Dashboard + Transactions
// ======================================================

document.addEventListener("click", function (event) {

    // ==================================================
    // DASHBOARD QUICK MODULE CARD
    // ==================================================

    const quickCard =
    event.target.closest(
        ".quick-module-card, .master-module-card"
    );

if (quickCard) {

    const section =
        quickCard.dataset.section;

    console.log(
        "MODULE CARD CLICK:",
        section
    );

    const sidebarMenu =
    document.querySelector(
        `.sidebar-menu-item[data-section="${section}"]`
    );

if (sidebarMenu) {

    // Highlight selected sidebar item
    document
        .querySelectorAll(".sidebar-menu-item")
        .forEach(button => {
            button.classList.remove("active");
        });

    sidebarMenu.classList.add("active");

    // Run the existing sidebar navigation
    sidebarMenu.click();

} else {

    console.warn(
        "Sidebar button not found for:",
        section
    );

}

    return;
}

    // ==================================================
    // SIDEBAR MENU BUTTON
    // ==================================================

    const menuButton =
        event.target.closest(".sidebar-menu-item");

    if (!menuButton) {
        return;
    }

    const section =
        menuButton.dataset.section;

// ==========================================
// RESET PREVIOUS MODULE STATE
// ==========================================

resetAllModuleUI();

// ==================================================
// MY FINANCIAL GOALS
// ==================================================

if (section === "financialGoals") {

    console.log(
        "🎯 FINANCIAL GOALS SIDEBAR CLICKED"
    );

    showMasterView(
        "financialGoals"
    );

    return;
}


// ==================================================
// CURRENT BALANCE / FUNDS AVAILABLE
// ==================================================

if (section === "fundsAvailable") {

    console.log(
        "💰 FUNDS AVAILABLE SIDEBAR CLICKED"
    );

    showMasterView(
        "fundsAvailable"
    );

    return;
}

// ==================================================
// SIDEBAR LOGOUT
// ==================================================

if (section === "logout") {

    console.log("🚪 LOGOUT CLICKED");

    signOut(auth)
        .then(() => {

            console.log("✅ LOGOUT SUCCESS");

            window.location.reload();

        })
        .catch((error) => {

            console.error("❌ LOGOUT ERROR:", error);

            alert("Logout failed. Please try again.");

        });

    return;
}


// ==================================================
// LOANS & BORROWINGS — MASTER VIEW
// ==================================================

if (section === "loans") {

    // Highlight Loans & Borrowings
    document
        .querySelectorAll(".sidebar-menu-item")
        .forEach(button => {
            button.classList.remove("active");
        });

    menuButton.classList.add("active");

    // ==========================================
// BACK TO DASHBOARD — ALL MODULES
// ==========================================

if (section !== "dashboard") {
    document.querySelectorAll(".back-to-dashboard-button")
        .forEach(button => {
            button.onclick = () => {

                showMasterView("dashboard");

                document
                    .querySelectorAll(".sidebar-menu-item")
                    .forEach(item => {
                        item.classList.remove("active");
                    });

                const dashboardButton =
                    document.querySelector(
                        '.sidebar-menu-item[data-section="dashboard"]'
                    );

                if (dashboardButton) {
                    dashboardButton.classList.add("active");
                }

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            };
        });
}

    // Open Loans Module
    showMasterView("loans");

    return;
}

    // ==================================================
    // ACTIVE MENU
    // ==================================================

    document
        .querySelectorAll(".sidebar-menu-item")
        .forEach(button => {

            button.classList.remove("active");

        });

    menuButton.classList.add("active");

// ==================================================
// MY INSURANCE — SIDEBAR
// ==================================================

if (section === "insurance") {

    const dashboard =
        document.getElementById("masterDashboard");

    const insuranceSection =
        document.querySelector(".insurance-section");

    // Hide Dashboard
    if (dashboard) {
        dashboard.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    // Hide other modules
    document.querySelectorAll(
    "#transactionsSection, #accountsSection, #loansSection, #investmentsSection, #propertiesSection, #insuranceSection, #mutualFundsInvestmentView"
).forEach(element => {

        element.style.setProperty(
            "display",
            "none",
            "important"
        );
    });

    // Show Insurance
    if (insuranceSection) {

        insuranceSection.style.setProperty(
            "display",
            "block",
            "important"
        );

        insuranceSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (typeof refreshModuleData === "function") {
    refreshModuleData("insurance");
}

        console.log("✅ INSURANCE MODULE OPENED");

    } else {

        console.error("❌ .insurance-section NOT FOUND");

    }

    return;
}

    // ==================================================
    // DASHBOARD
    // ==================================================

    if (section === "dashboard") {

    showMasterView("dashboard");

    return;
}

// ==================================================
// TRANSACTIONS — MASTER VIEW
// ==================================================

if (section === "transactions") {

    showMasterView("transactions");

    if (typeof refreshModuleData === "function") {
    refreshModuleData("transactions");
}

// Hide Investment UI inside Transactions
const investmentsSection =
    document.getElementById("investmentsSection");

const mutualFundsView =
    document.getElementById("mutualFundsInvestmentView");

if (investmentsSection) {
    investmentsSection.style.setProperty(
        "display",
        "none",
        "important"
    );
}

if (mutualFundsView) {
    mutualFundsView.style.setProperty(
        "display",
        "none",
        "important"
    );
}

    const transactionForm =
        document.getElementById("transactionFormContainer");

    if (transactionForm) {
        transactionForm.style.display = "block";
    }

    if (typeof loadSavedTransactions === "function") {
        loadSavedTransactions();
    }
setTimeout(() => {

    const investmentsSection =
        document.getElementById("investmentsSection");

    const mutualFundsView =
        document.getElementById("mutualFundsInvestmentView");

    if (investmentsSection) {
        investmentsSection.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    if (mutualFundsView) {
        mutualFundsView.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

}, 300);

    return;
}

// ==================================================
// PROPERTIES & RENTALS — MASTER VIEW
// ==================================================

if (section === "properties") {

    console.log("🔥 PROPERTIES SIDEBAR CLICKED");

    // Hide Dashboard
    const dashboard =
        document.getElementById("masterDashboard");

    if (dashboard) {
        dashboard.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    // Hide ALL modules
    document.querySelectorAll(
        "#transactionsSection, " +
        "#accountsSection, " +
        "#loansSection, " +
        "#investmentsSection, " +
        "#propertiesSection, " +
        "#insuranceSection"
    ).forEach(element => {

        element.style.setProperty(
            "display",
            "none",
            "important"
        );

    });

    // Show Properties
    const propertiesSection =
        document.getElementById(
            "propertiesSection"
        );

    if (propertiesSection) {

        propertiesSection.style.setProperty(
            "display",
            "block",
            "important"
        );

        propertiesSection.style.setProperty(
            "visibility",
            "visible",
            "important"
        );

        propertiesSection.style.setProperty(
            "opacity",
            "1",
            "important"
        );

        propertiesSection.style.setProperty(
            "height",
            "auto",
            "important"
        );

        propertiesSection.style.setProperty(
            "min-height",
            "500px",
            "important"
        );

        console.log(
            "🔥 PROPERTIES OPENED:",
            propertiesSection
        );

        propertiesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (typeof refreshModuleData === "function") {
    refreshModuleData("properties");
}

    } else {

        console.error(
            "❌ propertiesSection NOT FOUND"
        );

    }

    return;
}

// ==================================================
// MY ACCOUNTS — MASTER VIEW
// ==================================================

if (section === "accounts") {

    showMasterView("accounts");

if (typeof refreshModuleData === "function") {
    refreshModuleData("accounts");
}

    return;
}

// ==================================================
// INVESTMENTS — MASTER VIEW
// ==================================================

if (section === "investments") {

    showMasterView("investments");

if (typeof refreshModuleData === "function") {
    refreshModuleData("investments");
}
    return;
}
});

// ==================================================
// MY FINANCIAL GOALS — ADD / CANCEL FORM
// ==================================================

document.addEventListener(
    "click",
    function (event) {

        // =========================================
        // ADD FINANCIAL GOAL
        // =========================================

        const addButton =
            event.target.closest(
                "#addFinancialGoalButton"
            );

        if (addButton) {

            const formContainer =
                document.querySelector(
                    "#financialGoalFormContainer"
                );

            if (formContainer) {

                formContainer.style.setProperty(
                    "display",
                    "block",
                    "important"
                );

                formContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            addButton.style.setProperty(
                "display",
                "none",
                "important"
            );

            return;
        }


        // =========================================
        // CANCEL FINANCIAL GOAL
        // =========================================

        const cancelButton =
            event.target.closest(
                "#cancelFinancialGoalButton"
            );

        if (cancelButton) {

            const formContainer =
                document.querySelector(
                    "#financialGoalFormContainer"
                );

            const addButton =
                document.querySelector(
                    "#addFinancialGoalButton"
                );


            if (formContainer) {

                formContainer.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (addButton) {

                addButton.style.setProperty(
                    "display",
                    "inline-block",
                    "important"
                );

            }

        }

    }
);

// ==========================================
// BACK TO DASHBOARD BUTTON — GLOBAL
// ==========================================

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".back-to-dashboard-button");

    if (!button) return;

    console.log("← BACK TO DASHBOARD CLICKED");

    showMasterView("dashboard");

    document
        .querySelectorAll(".sidebar-menu-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    const dashboardButton =
        document.querySelector(
            '.sidebar-menu-item[data-section="dashboard"]'
        );

    if (dashboardButton) {
        dashboardButton.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// ==================================================
// MUTUAL FUNDS / SIP - OPEN ONLY MF VIEW
// ==================================================

document.addEventListener("click", function (event) {

    const button = event.target.closest(
        "#viewMutualFundsFromInvestmentsButton"
    );

    if (!button) return;

    console.log("📊 OPENING MUTUAL FUND VIEW");

    // ------------------------------------------
    // HIDE NORMAL INVESTMENT CONTENT
    // ------------------------------------------

    const investmentSummary =
        document.getElementById("investmentSummary");

    const investmentTable =
        document.getElementById("investmentTableWrapper");

    const sharesContainer =
        document.getElementById("sharesContainer");

    const sharesView =
        document.getElementById("sharesInvestmentView");

    if (investmentSummary) {
        investmentSummary.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    if (investmentTable) {
        investmentTable.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    if (sharesContainer) {
        sharesContainer.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    if (sharesView) {
        sharesView.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    // ------------------------------------------
    // SHOW MUTUAL FUND VIEW
    // ------------------------------------------

    const mfView =
        document.getElementById(
            "mutualFundsInvestmentView"
        );

    if (!mfView) {
        console.error(
            "❌ mutualFundsInvestmentView NOT FOUND"
        );
        return;
    }

    mfView.style.setProperty(
        "display",
        "block",
        "important"
    );

    // ------------------------------------------
    // MOVE MF FORM ABOVE MF HISTORY TABLE
    // ------------------------------------------

    const mfForm =
        document.getElementById(
            "mutualFundFormContainer"
        );

    const mfTableBody =
        document.getElementById(
            "mutualFundTableBody"
        );

    if (mfForm && mfTableBody) {

        const mfTable =
            mfTableBody.closest("table");

        if (mfTable) {

            const tableWrapper =
                mfTable.parentElement;

            if (tableWrapper) {

                tableWrapper.parentElement.insertBefore(
                    mfForm,
                    tableWrapper
                );

            }
        }
    }

    // ------------------------------------------
    // OPEN FORM
    // ------------------------------------------

    if (mfForm) {

        mfForm.style.setProperty(
            "display",
            "block",
            "important"
        );

        mfForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    console.log(
        "✅ ONLY MUTUAL FUND VIEW OPENED"
    );

});


// ==================================================
// MUTUAL FUND VIEW — NAVIGATION RESET
// ==================================================

document.addEventListener("click", function (event) {

    // ------------------------------------------
    // INVESTMENTS BUTTON / CARD
    // ------------------------------------------

    const investmentTrigger =
        event.target.closest(
            '.sidebar-menu-item[data-section="investments"], .master-module-card[data-section="investments"]'
        );

    if (investmentTrigger) {

        const mfView =
            document.getElementById(
                "mutualFundsInvestmentView"
            );

        const mfForm =
            document.getElementById(
                "mutualFundFormContainer"
            );

        const investmentsSection =
            document.getElementById(
                "investmentsSection"
            );

        // Hide MF section
        if (mfView) {
            mfView.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        // Hide MF form
        if (mfForm) {
            mfForm.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        // Show normal Investments
        if (investmentsSection) {
            investmentsSection.style.setProperty(
                "display",
                "block",
                "important"
            );
        }

        console.log(
            "✅ INVESTMENTS RESET — MF VIEW CLOSED"
        );

        return;
    }


    // ------------------------------------------
    // BACK TO INVESTMENTS FROM MF
    // ------------------------------------------

    const backButton =
        event.target.closest(
            "#mutualFundsInvestmentView button"
        );

    if (
        backButton &&
        backButton.textContent
            .toLowerCase()
            .includes("back to investments")
    ) {

        const mfView =
            document.getElementById(
                "mutualFundsInvestmentView"
            );

        const mfForm =
            document.getElementById(
                "mutualFundFormContainer"
            );

        const investmentsSection =
            document.getElementById(
                "investmentsSection"
            );

        // Hide MF
        if (mfView) {
            mfView.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        // Hide MF Form
        if (mfForm) {
            mfForm.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        // Show Investments
        if (investmentsSection) {
            investmentsSection.style.setProperty(
                "display",
                "block",
                "important"
            );
        }

        // Keep Investment Summary closed
        const investmentSummary =
            document.getElementById(
                "investmentSummary"
            );

        if (investmentSummary) {
            investmentSummary.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        console.log(
            "✅ BACK TO INVESTMENTS"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

});

// ==================================================
// MUTUAL FUND / SIP - SAVE + HISTORY
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    const mfForm =
        document.getElementById("mutualFundForm");

    const mfFormContainer =
        document.getElementById(
            "mutualFundFormContainer"
        );

    const cancelButton =
        document.getElementById(
            "cancelMutualFundButton"
        );

    if (!mfForm) {
        console.error("❌ Mutual Fund Form NOT FOUND");
        return;
    }


    // ==========================================
    // CANCEL
    // ==========================================

    cancelButton?.addEventListener(
    "click",
    function (event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        mfForm.reset();

        if (mfFormContainer) {
            mfFormContainer.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

    },
    true
);


    // ==========================================
    // SAVE MUTUAL FUND
    // ==========================================

    mfForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            alert("कृपया पहले Login करें।");
            return;
        }


        // ==========================================
        // READ FORM DATA
        // ==========================================

        const fundName =
            document.getElementById(
                "mfFundName"
            )?.value.trim() || "";

        const amc =
            document.getElementById(
                "mfAMC"
            )?.value.trim() || "";

        const investmentType =
            document.getElementById(
                "mfInvestmentType"
            )?.value || "";

        const folioNumber =
            document.getElementById(
                "mfFolioNumber"
            )?.value.trim() || "";

        const investmentDate =
            document.getElementById(
                "mfInvestmentDate"
            )?.value || "";

        const amount =
            Number(
                document.getElementById(
                    "mfAmount"
                )?.value || 0
            );

        const units =
            Number(
                document.getElementById(
                    "mfUnits"
                )?.value || 0
            );

        const purchaseNAV =
            Number(
                document.getElementById(
                    "mfNAV"
                )?.value || 0
            );

        const sipAmount =
            Number(
                document.getElementById(
                    "mfSIPAmount"
                )?.value || 0
            );

        const sipDate =
            Number(
                document.getElementById(
                    "mfSIPDate"
                )?.value || 0
            );

        const notes =
            document.getElementById(
                "mfNotes"
            )?.value.trim() || "";


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !fundName ||
            !amc ||
            !investmentType ||
            !investmentDate ||
            amount <= 0 ||
            units <= 0 ||
            purchaseNAV <= 0
        ) {

            alert(
                "कृपया सभी जरूरी Mutual Fund details भरें।"
            );

            return;
        }


        try {

            console.log(
                "💾 Saving Mutual Fund:",
                {
                    fundName,
                    amc,
                    investmentType,
                    amount,
                    units,
                    purchaseNAV
                }
            );


            // ==========================================
            // MUTUAL FUNDS COLLECTION
            // ==========================================

            const mfCollection =
                collection(
                    db,
                    "users",
                    user.uid,
                    "mutualFunds"
                );


            const mfData = {

                fundName,

                amc,

                investmentType,

                folioNumber,

                investmentDate,

                totalInvested: amount,

                totalUnits: units,

                averageNAV: purchaseNAV,

                latestNAV: purchaseNAV,

                currentValue:
                    units * purchaseNAV,

                profitLoss: 0,

                profitLossPercent: 0,

                sipAmount,

                sipDate,

                notes,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            // ==========================================
            // SAVE MUTUAL FUND
            // ==========================================

            const mfDoc =
                await addDoc(
                    mfCollection,
                    mfData
                );


            // ==========================================
            // ALSO SAVE IN INVESTMENTS MASTER
            // ==========================================

            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "investments"
                ),
                {

                    category: "sip",

                    name: fundName,

                    amount: amount,

                    investmentDate:
                        investmentDate,

                    currentValue:
                        units * purchaseNAV,

                    notes: notes,

                    mutualFundId:
                        mfDoc.id,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            console.log(
                "✅ MUTUAL FUND SAVED:",
                mfDoc.id
            );


            alert(
                "✅ Mutual Fund / SIP successfully save हो गया।"
            );


            // ==========================================
            // RESET FORM
            // ==========================================

            mfForm.reset();

            if (mfFormContainer) {
    mfFormContainer.style.setProperty(
        "display",
        "none",
        "important"
    );
}


            // ==========================================
            // REFRESH HISTORY
            // ==========================================

            if (
                typeof window.loadMutualFunds ===
                "function"
            ) {

                await window.loadMutualFunds();

            }

            // Refresh Investments master
            if (
                typeof loadInvestments ===
                "function"
            ) {

                await loadInvestments();

            }

            if (
                typeof loadDashboardSummary ===
                "function"
            ) {

                await loadDashboardSummary();

            }


        }
        catch (error) {

            console.error(
                "❌ MUTUAL FUND SAVE ERROR:",
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
                "Mutual Fund save नहीं हो सका। Console में error देखें।"
            );

        }

    });

});

// ==================================================
// MUTUAL FUNDS / SIP - LOAD DATA
// ==================================================

async function loadMutualFunds() {

    try {

        const user = auth.currentUser;

        if (!user) {
            console.warn("⚠️ User not logged in");
            return;
        }

        const mutualFundsRef = collection(
            db,
            "users",
            user.uid,
            "mutualFunds"
        );

        const snapshot = await getDocs(mutualFundsRef);

        const tableBody =
            document.getElementById("mutualFundTableBody");

        const noMessage =
            document.getElementById("noMutualFundsMessage");

        if (!tableBody) {
            console.error("❌ mutualFundTableBody not found");
            return;
        }

        tableBody.innerHTML = "";

        let totalInvested = 0;
        let currentValue = 0;
        let totalPL = 0;
        let totalFunds = 0;

        if (snapshot.empty) {

            if (noMessage) {
                noMessage.style.display = "block";
            }

        } else {

            if (noMessage) {
                noMessage.style.display = "none";
            }

            snapshot.forEach((docSnap) => {

                const data = docSnap.data();

                const invested =
                    Number(data.totalInvested) || 0;

                const units =
                    Number(data.totalUnits) || 0;

                const avgNAV =
                    Number(data.averageNAV) || 0;

                const latestNAV =
                    Number(data.latestNAV) || avgNAV;

                const value =
                    units * latestNAV;

                const pl =
                    value - invested;

                const plPercent =
                    invested > 0
                        ? (pl / invested) * 100
                        : 0;

                totalInvested += invested;
                currentValue += value;
                totalPL += pl;
                totalFunds++;

                const row =
                    document.createElement("tr");

                row.innerHTML = `
                    <td>${data.fundName || "-"}</td>

                    <td>${data.amc || "-"}</td>

                    <td>${data.investmentType || "-"}</td>

                    <td>₹${invested.toFixed(2)}</td>

                    <td>${units.toFixed(4)}</td>

                    <td>₹${avgNAV.toFixed(4)}</td>

                    <td>₹${latestNAV.toFixed(4)}</td>

                    <td>₹${value.toFixed(2)}</td>

                    <td>
                        ₹${pl.toFixed(2)}
                    </td>

                    <td>
                        ${plPercent.toFixed(2)}%
                    </td>

                    <td>
                        <button
                            type="button"
                            class="mf-edit-button"
                            data-id="${docSnap.id}">
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            class="mf-delete-button"
                            data-id="${docSnap.id}">
                            🗑️ Delete
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);

            });
        }

        // ==========================================
        // UPDATE SUMMARY
        // ==========================================

        const totalInvestedElement =
            document.getElementById("mfTotalInvested");

        const currentValueElement =
            document.getElementById("mfCurrentValue");

        const totalPLElement =
            document.getElementById("mfTotalPL");

        const totalFundsElement =
            document.getElementById("mfTotalFunds");

        if (totalInvestedElement) {
            totalInvestedElement.textContent =
                `₹${totalInvested.toFixed(2)}`;
        }

        if (currentValueElement) {
            currentValueElement.textContent =
                `₹${currentValue.toFixed(2)}`;
        }

        if (totalPLElement) {
            totalPLElement.textContent =
                `₹${totalPL.toFixed(2)}`;
        }

        if (totalFundsElement) {
            totalFundsElement.textContent =
                totalFunds;
        }

        console.log(
            `✅ Mutual Funds loaded: ${totalFunds}`
        );

    } catch (error) {

        console.error(
            "❌ MUTUAL FUND LOAD ERROR:",
            error
        );

    }
}


// Make available to other modules
window.loadMutualFunds = loadMutualFunds;

// =====================================================
// SBM GLOBAL UI REFRESH
// Refresh dashboard cards + active module data
// after Save / Update / Delete / Back to Dashboard
// =====================================================

window.refreshWealthManagerUI = async function () {

    try {

        console.log("🔄 GLOBAL UI REFRESH STARTED");

        // Dashboard summary/cards
        if (typeof loadDashboardSummary === "function") {
            await loadDashboardSummary();
        }

        // Main modules
        if (typeof loadAccounts === "function") {
            await loadAccounts();
        }

        if (typeof loadFixedDeposits === "function") {
            await loadFixedDeposits();
        }

        if (typeof loadFDHistory === "function") {
            await loadFDHistory();
        }

        if (typeof loadInsurance === "function") {
            await loadInsurance();
        }

        if (typeof loadInvestments === "function") {
            await loadInvestments();
        }

        // Shares
        if (window.loadShares) {
            await window.loadShares();
        }

        if (window.loadShareTradingHistory) {
            await window.loadShareTradingHistory();
        }

        // Mutual Funds
        if (typeof loadMutualFunds === "function") {
            await loadMutualFunds();
        }

        console.log("✅ GLOBAL UI REFRESH COMPLETED");

    } catch (error) {

        console.error(
            "❌ GLOBAL UI REFRESH ERROR:",
            error
        );

    }

};


// =====================================================
// AUTO REFRESH AFTER USER ACTION
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }

        const text =
            button.textContent
                .trim()
                .toLowerCase();

        const shouldRefresh =
            text.includes("save") ||
            text.includes("update") ||
            text.includes("delete") ||
            text.includes("back to dashboard") ||
            text.includes("dashboard");

        if (!shouldRefresh) {
            return;
        }

        // Wait for the module's Firestore operation
        // to finish before refreshing the UI.
        setTimeout(
            function () {

                if (
                    window.refreshWealthManagerUI
                ) {
                    window.refreshWealthManagerUI();
                }

            },
            1200
        );

    },
    true
);

// ==================================================
// MY FINANCIAL GOALS — SAVE GOAL
// ==================================================

document.addEventListener(
    "submit",
    async function (event) {

        const form =
            event.target.closest(
                "#financialGoalForm"
            );

        if (!form) {
            return;
        }


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
        // GET FORM VALUES
        // =========================================

        const goalName =
            document.querySelector(
                "#financialGoalName"
            )?.value.trim() || "";


        const targetAmount =
            Number(
                document.querySelector(
                    "#financialGoalTargetAmount"
                )?.value || 0
            );


        const savedAmount =
            Number(
                document.querySelector(
                    "#financialGoalSavedAmount"
                )?.value || 0
            );


        const monthlyPlannedSaving =
            Number(
                document.querySelector(
                    "#financialGoalMonthlySaving"
                )?.value || 0
            );


        const targetDate =
            document.querySelector(
                "#financialGoalTargetDate"
            )?.value || "";


        const priority =
            document.querySelector(
                "#financialGoalPriority"
            )?.value || "";


        const notes =
            document.querySelector(
                "#financialGoalNotes"
            )?.value.trim() || "";


        // =========================================
        // VALIDATION
        // =========================================

        if (!goalName) {

            alert(
                "कृपया Goal Name भरें।"
            );

            return;

        }


        if (targetAmount <= 0) {

            alert(
                "कृपया Target Amount भरें।"
            );

            return;

        }


        if (savedAmount < 0) {

            alert(
                "Saved Amount गलत है।"
            );

            return;

        }


        if (savedAmount > targetAmount) {

            alert(
                "Already Saved Amount Target Amount से ज्यादा नहीं हो सकता।"
            );

            return;

        }


        // =========================================
        // CALCULATE REMAINING
        // =========================================

        const remainingAmount =
            Math.max(
                targetAmount - savedAmount,
                0
            );


        // =========================================
        // CALCULATE REMAINING MONTHS
        // =========================================

        let remainingMonths = 0;


        if (targetDate) {

            const today =
                new Date();

            const target =
                new Date(
                    targetDate + "T00:00:00"
                );


            if (target > today) {

                const yearDifference =
                    target.getFullYear() -
                    today.getFullYear();

                const monthDifference =
                    target.getMonth() -
                    today.getMonth();

                remainingMonths =
                    (
                        yearDifference * 12
                    ) +
                    monthDifference;

                if (
                    target.getDate() >
                    today.getDate()
                ) {

                    remainingMonths++;

                }

                remainingMonths =
                    Math.max(
                        remainingMonths,
                        1
                    );

            }

        }


        // =========================================
        // REQUIRED MONTHLY SAVING
        // =========================================

        let requiredMonthlySaving = 0;


        if (
            remainingAmount > 0 &&
            remainingMonths > 0
        ) {

            requiredMonthlySaving =
                remainingAmount /
                remainingMonths;

        }


        // =========================================
        // GOAL STATUS
        // =========================================

        let goalStatus =
            "No Target Date";


        if (targetDate) {

            if (
                remainingAmount <= 0
            ) {

                goalStatus =
                    "Completed";

            }

            else if (
                monthlyPlannedSaving >=
                requiredMonthlySaving
            ) {

                goalStatus =
                    "On Track";

            }

            else {

                goalStatus =
                    "Needs Attention";

            }

        }


        // =========================================
        // SAVE TO FIRESTORE
        // =========================================

        try {

            const goalCollection =
                collection(
                    db,
                    "users",
                    user.uid,
                    "financialGoals"
                );


            const goalData = {

                name:
                    goalName,

                targetAmount:
                    targetAmount,

                savedAmount:
                    savedAmount,

                remainingAmount:
                    remainingAmount,

                monthlyPlannedSaving:
                    monthlyPlannedSaving,

                requiredMonthlySaving:
                    requiredMonthlySaving,

                remainingMonths:
                    remainingMonths,

                targetDate:
                    targetDate,

                priority:
                    priority,

                notes:
                    notes,

                status:
                    goalStatus,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            const goalDoc =
                await addDoc(
                    goalCollection,
                    goalData
                );


            console.log(
                "Financial Goal saved successfully:",
                {
                    id:
                        goalDoc.id,
                    ...goalData
                }
            );


            alert(
                "🎯 Financial Goal successfully save हो गया।"
            );


            // =========================================
            // RESET FORM
            // =========================================

            form.reset();


            const savedAmountInput =
                document.querySelector(
                    "#financialGoalSavedAmount"
                );

            if (savedAmountInput) {

                savedAmountInput.value =
                    "0";

            }


            const monthlySavingInput =
                document.querySelector(
                    "#financialGoalMonthlySaving"
                );

            if (monthlySavingInput) {

                monthlySavingInput.value =
                    "0";

            }


            // =========================================
            // HIDE FORM
            // =========================================

            const formContainer =
                document.querySelector(
                    "#financialGoalFormContainer"
                );


            const addButton =
                document.querySelector(
                    "#addFinancialGoalButton"
                );


            if (formContainer) {

                formContainer.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (addButton) {

                addButton.style.setProperty(
                    "display",
                    "inline-block",
                    "important"
                );

            }

        }
        catch (error) {

            console.error(
                "Save Financial Goal Error:",
                error
            );


            alert(
                "Financial Goal save नहीं हो पाया। Console में error देखें।"
            );

        }

    }
);

// ==================================================
// MY FINANCIAL GOALS — VIEW ALL / BACK
// ==================================================

document.addEventListener(
    "click",
    async function (event) {

        // ==================================================
        // VIEW ALL GOALS
        // ==================================================

        const viewAllButton =
            event.target.closest(
                "#viewAllFinancialGoalsButton"
            );

        if (viewAllButton) {

            const allGoalsView =
                document.querySelector(
                    "#allFinancialGoalsView"
                );

            const goalsContainer =
                document.querySelector(
                    "#financialGoalsContainer"
                );

            const goalsCount =
                document.querySelector(
                    "#financialGoalsCount"
                );

            const addGoalButton =
                document.querySelector(
                    "#addFinancialGoalButton"
                );

            if (!allGoalsView || !goalsContainer) {
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

                // =========================================
                // LOAD GOALS FROM FIRESTORE
                // =========================================

                const goalsCollection =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "financialGoals"
                    );


                const snapshot =
                    await getDocs(
                        goalsCollection
                    );


                // =========================================
                // CLEAR OLD GOALS
                // =========================================

                goalsContainer.innerHTML = "";


                // =========================================
                // COUNT
                // =========================================

                if (goalsCount) {

                    goalsCount.textContent =
                        snapshot.size;

                }


                // =========================================
                // NO GOALS
                // =========================================

                if (snapshot.empty) {

                    const noGoals =
                        document.createElement(
                            "p"
                        );

                    noGoals.textContent =
                        "No Financial Goals added yet.";

                    noGoals.style.textAlign =
                        "center";

                    noGoals.style.fontSize =
                        "20px";

                    noGoals.style.fontWeight =
                        "700";

                    goalsContainer.appendChild(
                        noGoals
                    );

                }


                // =========================================
                // LOAD EACH GOAL
                // =========================================

                snapshot.forEach(
                    (goalDoc) => {

                        const goal =
                            goalDoc.data();


                        const targetAmount =
                            Number(
                                goal.targetAmount || 0
                            );


                       // =========================================
// CURRENT SAVED AMOUNT
// INITIAL SAVED + MONTHLY ACTUAL SAVINGS
// =========================================

const initialSavedAmount =
    Number(
        goal.savedAmount || 0
    );


const monthlyPlans =
    Array.isArray(
        goal.monthlyPlans
    )
        ? goal.monthlyPlans
        : [];


const monthlyActualSavings =
    monthlyPlans.reduce(
        (
            total,
            plan
        ) => {

            return total +
                Number(
                    plan.actual || 0
                );

        },
        0
    );


const savedAmount =
    Math.min(
        initialSavedAmount +
        monthlyActualSavings,
        targetAmount
    );


const remainingAmount =
    Math.max(
        targetAmount -
        savedAmount,
        0
    );

                        const requiredMonthlySaving =
                            Number(
                                goal.requiredMonthlySaving ||
                                0
                            );


                        const monthlyPlannedSaving =
                            Number(
                                goal.monthlyPlannedSaving ||
                                0
                            );


                        const progress =
                            targetAmount > 0
                                ? Math.min(
                                    (
                                        savedAmount /
                                        targetAmount
                                    ) * 100,
                                    100
                                )
                                : 0;


// =========================================
// SMART GOAL HEALTH / STATUS
// =========================================

let calculatedGoalStatus =
    "No Plan";


if (progress >= 100) {

    calculatedGoalStatus =
        "✅ Completed";

}
else if (monthlyPlans.length > 0) {

    const currentMonthKey =
        new Date()
            .toISOString()
            .slice(0, 7);


    let plannedToDate = 0;

    let actualToDate = 0;


    monthlyPlans.forEach(
        (plan) => {

            const planMonth =
                plan.month || "";


            if (
                planMonth <=
                currentMonthKey
            ) {

                plannedToDate +=
                    Number(
                        plan.planned || 0
                    );


                actualToDate +=
                    Number(
                        plan.actual || 0
                    );

            }

        }
    );


    if (
        plannedToDate > 0
    ) {

        const achievementRatio =
            (
                actualToDate /
                plannedToDate
            ) * 100;


        if (
            achievementRatio >=
            110
        ) {

            calculatedGoalStatus =
                "🚀 Ahead of Plan";

        }

        else if (
            achievementRatio >=
            90
        ) {

            calculatedGoalStatus =
                "🟢 On Track";

        }

        else if (
            achievementRatio >=
            70
        ) {

            calculatedGoalStatus =
                "🟡 Needs Attention";

        }

        else {

            calculatedGoalStatus =
                "🔴 At Risk";

        }

    }

}

                        // =================================
                        // GOAL CARD
                        // =================================

                        const card =
                            document.createElement(
                                "div"
                            );


                        card.style.background =
                            "linear-gradient(145deg, #ffffff, #f4f8fc)";

                        card.style.border =
                            "1px solid #d8e3ed";

                        card.style.borderRadius =
                            "18px";

                        card.style.padding =
                            "24px";

                        card.style.marginBottom =
                            "20px";

                        card.style.boxShadow =
                            "0 8px 20px rgba(0,0,0,0.10)";


                        // =================================
// TITLE
// =================================

const title =
    document.createElement(
        "h3"
    );

title.textContent =
    "🎯 " +
    (
        goal.name ||
        "Unnamed Goal"
    );

title.style.margin =
    "0 0 18px";

title.style.fontSize =
    "24px";

title.style.color =
    "#173f6f";

card.appendChild(
    title
);

// =================================
// GOAL ACTION BUTTONS
// =================================

const goalActions =
    document.createElement("span");

goalActions.style.display =
    "inline-flex";

goalActions.style.gap =
    "8px";

goalActions.style.marginLeft =
    "10px";


// Edit Button
const editGoalButton =
    document.createElement("button");

editGoalButton.type =
    "button";

    editGoalButton.className =
    "financial-goal-edit-button";
    
editGoalButton.textContent =
    "✏️ Edit Goal";

editGoalButton.dataset.goalId =
    goalDoc.id;

editGoalButton.style.padding =
    "6px 10px";

editGoalButton.style.border =
    "none";

editGoalButton.style.borderRadius =
    "7px";

editGoalButton.style.background =
    "#f59e0b";

editGoalButton.style.color =
    "#ffffff";

editGoalButton.style.fontWeight =
    "800";

editGoalButton.style.cursor =
    "pointer";


// Delete Button
const deleteGoalButton =
    document.createElement("button");

deleteGoalButton.type =
    "button";

deleteGoalButton.textContent =
    "🗑️ Delete Goal";

deleteGoalButton.dataset.goalId =
    goalDoc.id;

deleteGoalButton.style.padding =
    "6px 10px";

deleteGoalButton.style.border =
    "none";

deleteGoalButton.style.borderRadius =
    "7px";

deleteGoalButton.style.background =
    "#dc2626";

deleteGoalButton.style.color =
    "#ffffff";

deleteGoalButton.style.fontWeight =
    "800";

deleteGoalButton.style.cursor =
    "pointer";


goalActions.appendChild(
    editGoalButton
);

goalActions.appendChild(
    deleteGoalButton
);


// Put buttons beside Goal Title
title.appendChild(
    goalActions
);

// =================================
// DETAILS
// =================================
                        const details =
                            document.createElement(
                                "div"
                            );


                        details.style.display =
                            "grid";

                        details.style.gridTemplateColumns =
                            "repeat(2, minmax(0, 1fr))";

                        details.style.gap =
                            "12px";

// =========================================
// PLANNED vs ACTUAL SAVING TO DATE
// =========================================

let goalPlannedToDate = 0;
let goalActualToDate = 0;


const currentMonthKey =
    new Date()
        .toISOString()
        .slice(0, 7);


monthlyPlans.forEach(
    (plan) => {

        const planMonth =
            plan.month || "";


        if (
            planMonth <=
            currentMonthKey
        ) {

            goalPlannedToDate +=
                Number(
                    plan.planned || 0
                );


            goalActualToDate +=
                Number(
                    plan.actual || 0
                );

        }

    }
);

// =========================================
// SMART REVISED MONTHLY SAVING
// =========================================

const remainingMonths =
    Number(
        goal.remainingMonths || 0
    );

const revisedCurrentMonthKey =
    new Date()
        .toISOString()
        .slice(0, 7);

const currentMonthPlan =
    monthlyPlans.find(
        (plan) =>
            plan.month === revisedCurrentMonthKey
    );

const currentMonthActual =
    currentMonthPlan
        ? Number(
            currentMonthPlan.actual || 0
          )
        : 0;


const monthlyShortfall =
    Math.max(
        requiredMonthlySaving -
        currentMonthActual,
        0
    );


const monthlyExtraSaving =
    Math.max(
        currentMonthActual -
        requiredMonthlySaving,
        0
    );


const revisedMonthlySaving =
    remainingMonths > 0
        ? Math.max(
            requiredMonthlySaving +
            (
                monthlyShortfall /
                remainingMonths
            ) -
            (
                monthlyExtraSaving /
                remainingMonths
            ),
            0
        )
        : requiredMonthlySaving;


// =========================================
// EXPECTED TARGET DATE
// =========================================

let expectedTargetDate =
    goal.targetDate || "Not Set";


if (
    goal.targetDate &&
    currentMonthActual !==
    requiredMonthlySaving
) {

    const differenceAmount =
        currentMonthActual -
        requiredMonthlySaving;


    const dailySavingRate =
        requiredMonthlySaving /
        30;


    if (
        dailySavingRate > 0
    ) {

        const dateAdjustmentDays =
            Math.round(
                differenceAmount /
                dailySavingRate
            );


        const expectedDate =
            new Date(
                goal.targetDate
            );


        expectedDate.setDate(
            expectedDate.getDate() -
            dateAdjustmentDays
        );


        const day =
    String(
        expectedDate.getDate()
    ).padStart(2, "0");

const month =
    String(
        expectedDate.getMonth() + 1
    ).padStart(2, "0");

const year =
    expectedDate.getFullYear();

expectedTargetDate =
    `${day}-${month}-${year}`;
    }

}

                        const detailItems = [

                            [
                                "💰 Target Amount",
                                targetAmount
                            ],

                            [
                                "💵 Saved Amount",
                                savedAmount
                            ],

                            [
                                "📉 Remaining Amount",
                                remainingAmount
                            ],

                            [
    "💸 Required Monthly Saving",
    requiredMonthlySaving,
    revisedMonthlySaving
],

                            [
    "📋 Planned Till Now",
    goalPlannedToDate
],

[
    "✅ Actual Till Now",
    goalActualToDate
],

                            [
                                "📅 Monthly Planned Saving",
                                monthlyPlannedSaving
                            ],

[
    "📆 Target Date",
    goal.targetDate
        ? (() => {
            const parts =
                goal.targetDate.split("-");

            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        })()
        : "Not Set",

    goal.targetDate &&
    expectedTargetDate !==
        `${goal.targetDate.split("-")[2]}-${goal.targetDate.split("-")[1]}-${goal.targetDate.split("-")[0]}`
        ? "Expected: " + expectedTargetDate
        : ""
],

                            [
                                "⭐ Priority",
                                goal.priority || "Not Set"
                            ],

                            [
    "📊 Status",
    calculatedGoalStatus
]

                        ];


                        detailItems.forEach(
                            (item) => {

                                const box =
                                    document.createElement(
                                        "div"
                                    );


                                box.style.background =
                                    "#ffffff";

                                box.style.border =
                                    "1px solid #e1e8ef";

                                box.style.borderRadius =
                                    "10px";

                                box.style.padding =
                                    "12px";


                                const label =
                                    document.createElement(
                                        "div"
                                    );


                                label.textContent =
                                    item[0];

                                label.style.fontSize =
                                    "14px";

                                label.style.fontWeight =
                                    "700";

                                label.style.color =
                                    "#64748b";


                                const value =
                                    document.createElement(
                                        "strong"
                                    );


                                if (
                                    typeof item[1] ===
                                    "number"
                                ) {

                                    value.textContent =
                                        `₹${item[1].toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )}`;

                                }
                                else {

                                    value.textContent =
                                        item[1];

                                }

// =========================================
// SHOW REVISED MONTHLY SAVING
// =========================================

if (
    item[2] !== undefined &&
    typeof item[2] === "number"
) {

    const revisedLabel =
        document.createElement("span");


    revisedLabel.textContent =
        ` (Revised: ₹${item[2].toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}/month)`;


    revisedLabel.style.color =
        "#dc2626";


    revisedLabel.style.fontSize =
        "15px";


    revisedLabel.style.fontWeight =
        "900";


    revisedLabel.style.marginLeft =
        "6px";


    value.appendChild(
        revisedLabel
    );

}

// =========================================
// SHOW EXPECTED TARGET DATE
// =========================================

if (
    item[2] !== undefined &&
    typeof item[2] === "string" &&
    item[2].startsWith("Expected:")
) {

    const expectedDateLabel =
        document.createElement("span");


    expectedDateLabel.textContent =
        ` (${item[2]})`;


    expectedDateLabel.style.color =
        "#dc2626";


    expectedDateLabel.style.fontSize =
        "15px";


    expectedDateLabel.style.fontWeight =
        "900";


    expectedDateLabel.style.marginLeft =
        "6px";


    value.appendChild(
        expectedDateLabel
    );

}

                                value.style.display =
                                    "block";

                                value.style.marginTop =
                                    "4px";

                                value.style.fontSize =
                                    "18px";

                                value.style.color =
                                    "#173f6f";


                                box.appendChild(
                                    label
                                );

                                box.appendChild(
                                    value
                                );


                                details.appendChild(
                                    box
                                );

                            }
                        );


                        card.appendChild(
                            details
                        );


                        // =================================
                        // PROGRESS
                        // =================================

                        const progressWrapper =
                            document.createElement(
                                "div"
                            );


                        progressWrapper.style.marginTop =
                            "22px";


                        const progressLabel =
                            document.createElement(
                                "div"
                            );


                        progressLabel.textContent =
                            `Progress — ${progress.toFixed(2)}%`;

                        progressLabel.style.fontSize =
                            "18px";

                        progressLabel.style.fontWeight =
                            "900";

                        progressLabel.style.color =
                            "#173f6f";


                        const progressBackground =
                            document.createElement(
                                "div"
                            );


                        progressBackground.style.width =
                            "100%";

                        progressBackground.style.height =
                            "18px";

                        progressBackground.style.background =
                            "#e2e8f0";

                        progressBackground.style.borderRadius =
                            "20px";

                        progressBackground.style.overflow =
                            "hidden";

                        progressBackground.style.marginTop =
                            "8px";


                        const progressBar =
                            document.createElement(
                                "div"
                            );


                        progressBar.style.width =
                            `${progress}%`;

                        progressBar.style.height =
                            "100%";

                        progressBar.style.background =
                            "linear-gradient(90deg, #1e88e5, #43a047)";

                        progressBar.style.borderRadius =
                            "20px";


                        progressBackground.appendChild(
                            progressBar
                        );


                        progressWrapper.appendChild(
                            progressLabel
                        );

                        progressWrapper.appendChild(
                            progressBackground
                        );


                        card.appendChild(
                            progressWrapper
                        );


// =================================
// MONTHLY PLANNER BUTTON
// =================================

const monthlyPlannerButton =
    document.createElement(
        "button"
    );

monthlyPlannerButton.type =
    "button";

    monthlyPlannerButton.className =
    "financial-goal-monthly-planner";

monthlyPlannerButton.textContent =
    "📅 Monthly Planner";

monthlyPlannerButton.style.marginTop =
    "18px";

monthlyPlannerButton.style.padding =
    "11px 18px";

monthlyPlannerButton.style.border =
    "none";

monthlyPlannerButton.style.borderRadius =
    "10px";

monthlyPlannerButton.style.background =
    "linear-gradient(135deg, #173f6f, #1e88e5)";

monthlyPlannerButton.style.color =
    "#ffffff";

monthlyPlannerButton.style.fontSize =
    "16px";

monthlyPlannerButton.style.fontWeight =
    "800";

monthlyPlannerButton.style.cursor =
    "pointer";

monthlyPlannerButton.style.boxShadow =
    "0 4px 10px rgba(0,0,0,0.15)";


// Store Goal ID
monthlyPlannerButton.dataset.goalId =
    goalDoc.id;


card.appendChild(
    monthlyPlannerButton
);

                        // =================================
                        // NOTES
                        // =================================

                        if (goal.notes) {

                            const notes =
                                document.createElement(
                                    "div"
                                );


                            notes.textContent =
                                "📝 " +
                                goal.notes;


                            notes.style.marginTop =
                                "16px";

                            notes.style.padding =
                                "12px";

                            notes.style.background =
                                "#f8fafc";

                            notes.style.borderRadius =
                                "10px";

                            notes.style.fontSize =
                                "15px";


                            card.appendChild(
                                notes
                            );

                        }


                        goalsContainer.appendChild(
                            card
                        );

                    }
                );


                // =========================================
                // SHOW ALL GOALS VIEW
                // =========================================

                allGoalsView.style.setProperty(
                    "display",
                    "block",
                    "important"
                );


                viewAllButton.style.setProperty(
                    "display",
                    "none",
                    "important"
                );


                if (addGoalButton) {

                    addGoalButton.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }


                allGoalsView.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


                console.log(
                    "✅ Financial Goals loaded:",
                    snapshot.size
                );

            }
            catch (error) {

                console.error(
                    "Load Financial Goals Error:",
                    error
                );

                alert(
                    "Financial Goals load नहीं हो सके। Console में error देखें।"
                );

            }

            return;
        }


        // ==================================================
        // BACK TO GOALS
        // ==================================================

        const backButton =
            event.target.closest(
                "#backToFinancialGoalsDashboardButton"
            );

        if (backButton) {

            const allGoalsView =
                document.querySelector(
                    "#allFinancialGoalsView"
                );

            const viewAllButton =
                document.querySelector(
                    "#viewAllFinancialGoalsButton"
                );

            const addGoalButton =
                document.querySelector(
                    "#addFinancialGoalButton"
                );


            if (allGoalsView) {

                allGoalsView.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (viewAllButton) {

                viewAllButton.style.setProperty(
                    "display",
                    "inline-block",
                    "important"
                );

            }


            if (addGoalButton) {

                addGoalButton.style.setProperty(
                    "display",
                    "inline-block",
                    "important"
                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            console.log(
                "← Back to Financial Goals Dashboard"
            );

        }

    }
);

// =========================================
// FINANCIAL GOAL — EDIT BUTTON
// =========================================

document.addEventListener(
    "click",
    async function (event) {

        const editButton =
            event.target.closest(
                ".financial-goal-edit-button"
            );

            console.log(
    "✏️ EDIT BUTTON CLICKED",
    editButton
);

        if (!editButton) {
            return;
        }

        const goalId =
            editButton.dataset.goalId;

        const user =
            auth.currentUser;

        if (!user) {
            alert(
                "कृपया पहले login करें।"
            );
            return;
        }

        try {

            const goalRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "financialGoals",
                    goalId
                );

            const goalSnapshot =
                await getDoc(
                    goalRef
                );

console.log(
    "✏️ EDIT GOAL DATA:",
    goalSnapshot.exists()
        ? goalSnapshot.data()
        : "GOAL NOT FOUND"
);

            if (
                !goalSnapshot.exists()
            ) {
                alert(
                    "Financial Goal नहीं मिला।"
                );
                return;
            }

            const goal =
                goalSnapshot.data();

            // =================================
            // FILL EXISTING FORM
            // =================================

            document.querySelector(
                "#financialGoalName"
            ).value =
                goal.name || "";

            document.querySelector(
                "#financialGoalTargetAmount"
            ).value =
                Number(
                    goal.targetAmount || 0
                );

            document.querySelector(
                "#financialGoalSavedAmount"
            ).value =
                Number(
                    goal.savedAmount || 0
                );

            document.querySelector(
                "#financialGoalTargetDate"
            ).value =
                goal.targetDate || "";

            document.querySelector(
                "#financialGoalMonthlySaving"
            ).value =
                Number(
                    goal.monthlyPlannedSaving || 0
                );

            document.querySelector(
                "#financialGoalPriority"
            ).value =
                goal.priority || "";

            document.querySelector(
                "#financialGoalNotes"
            ).value =
                goal.notes || "";


            // Store Editing Goal ID
            const form =
                document.querySelector(
                    "#financialGoalForm"
                );

            form.dataset.editingGoalId =
                goalId;


            // Change form heading
            const formHeading =
                document.querySelector(
                    "#financialGoalFormContainer h3"
                );

            if (formHeading) {

                formHeading.textContent =
                    "✏️ Edit Financial Goal";
            }


            // Change Save button text
            const saveButton =
                document.querySelector(
                    "#saveFinancialGoalButton"
                );

            if (saveButton) {

                saveButton.textContent =
                    "💾 Update Goal";
            }


            // Show form
            const formContainer =
                document.querySelector(
                    "#financialGoalFormContainer"
                );

            if (formContainer) {

                formContainer.style.setProperty(
                    "display",
                    "block",
                    "important"
                );

                formContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }
        catch (error) {

            console.error(
                "Edit Financial Goal Error:",
                error
            );

            alert(
                "Financial Goal edit form load नहीं हो पाया।"
            );
        }
    }
);

// ==================================================
// MY FINANCIAL GOALS — MONTHLY PLANNER VIEW
// ==================================================

document.addEventListener(
    "click",
    async function (event) {

        const plannerButton =
            event.target.closest(
                ".financial-goal-monthly-planner"
            );

        if (!plannerButton) {
            return;
        }


        const goalId =
            plannerButton.dataset.goalId;

        if (!goalId) {
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

            // =========================================
            // LOAD GOAL
            // =========================================

            const goalRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "financialGoals",
                    goalId
                );

            const goalSnapshot =
                await getDoc(
                    goalRef
                );


            if (!goalSnapshot.exists()) {

                alert(
                    "Financial Goal नहीं मिला।"
                );

                return;
            }


            const goal =
                goalSnapshot.data();


            const targetAmount =
                Number(
                    goal.targetAmount || 0
                );


            const savedAmount =
                Number(
                    goal.savedAmount || 0
                );


            const remainingAmount =
                Number(
                    goal.remainingAmount ??
                    Math.max(
                        targetAmount -
                        savedAmount,
                        0
                    )
                );


            const monthlyPlannedSaving =
                Number(
                    goal.monthlyPlannedSaving ||
                    0
                );


            const requiredMonthlySaving =
                Number(
                    goal.requiredMonthlySaving ||
                    0
                );


            const monthlyPlanAmount =
                monthlyPlannedSaving > 0
                    ? monthlyPlannedSaving
                    : requiredMonthlySaving;

// =========================================
// SAVED MONTHLY PLANS
// =========================================

const savedMonthlyPlans =
    Array.isArray(goal.monthlyPlans)
        ? goal.monthlyPlans
        : [];

            const remainingMonths =
                Number(
                    goal.remainingMonths || 0
                );


            // =========================================
            // GET VIEWS
            // =========================================

            const allGoalsView =
                document.querySelector(
                    "#allFinancialGoalsView"
                );


            let plannerView =
                document.querySelector(
                    "#financialGoalPlannerView"
                );


            // =========================================
            // CREATE PLANNER VIEW
            // =========================================

            if (!plannerView) {

                plannerView =
                    document.createElement(
                        "div"
                    );

                plannerView.id =
                    "financialGoalPlannerView";

                plannerView.style.marginTop =
                    "24px";

                plannerView.style.padding =
                    "24px";

                plannerView.style.background =
                    "linear-gradient(145deg, #ffffff, #f4f8fc)";

                plannerView.style.border =
                    "1px solid #d8e3ed";

                plannerView.style.borderRadius =
                    "20px";

                plannerView.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.10)";


                const goalsSection =
                    document.querySelector(
                        "#financialGoalsSection"
                    );

                if (goalsSection) {

                    goalsSection.appendChild(
                        plannerView
                    );

                }

            }


            plannerView.innerHTML = "";


            // =========================================
            // HEADER
            // =========================================

            const header =
                document.createElement(
                    "div"
                );

            header.style.display =
                "flex";

            header.style.justifyContent =
                "space-between";

            header.style.alignItems =
                "center";

            header.style.gap =
                "15px";

            header.style.flexWrap =
                "wrap";


            const title =
                document.createElement(
                    "h2"
                );

            title.textContent =
                "📅 " +
                (
                    goal.name ||
                    "Financial Goal"
                ) +
                " — Monthly Planner";

            title.style.margin =
                "0";

            title.style.color =
                "#173f6f";

            title.style.fontSize =
                "25px";


            const backPlannerButton =
                document.createElement(
                    "button"
                );

            backPlannerButton.type =
                "button";

            backPlannerButton.textContent =
                "← Back to Goals";

            backPlannerButton.style.padding =
                "10px 16px";

            backPlannerButton.style.border =
                "none";

            backPlannerButton.style.borderRadius =
                "9px";

            backPlannerButton.style.background =
                "#173f6f";

            backPlannerButton.style.color =
                "#ffffff";

            backPlannerButton.style.fontWeight =
                "800";

            backPlannerButton.style.cursor =
                "pointer";


            header.appendChild(
                title
            );

            header.appendChild(
                backPlannerButton
            );

            plannerView.appendChild(
                header
            );


            // =========================================
            // SUMMARY
            // =========================================

            const summary =
                document.createElement(
                    "div"
                );

            summary.style.display =
                "grid";

            summary.style.gridTemplateColumns =
                "repeat(4, minmax(0, 1fr))";

            summary.style.gap =
                "12px";

            summary.style.marginTop =
                "22px";


            const summaryData = [

                [
                    "💰 Target",
                    targetAmount
                ],

                [
                    "💵 Saved",
                    savedAmount
                ],

                [
                    "📉 Remaining",
                    remainingAmount
                ],

                [
                    "💸 Required / Month",
                    requiredMonthlySaving
                ]

            ];


            summaryData.forEach(
                (item) => {

                    const box =
                        document.createElement(
                            "div"
                        );

                    box.style.padding =
                        "15px";

                    box.style.background =
                        "#ffffff";

                    box.style.border =
                        "1px solid #e1e8ef";

                    box.style.borderRadius =
                        "12px";

                    box.style.textAlign =
                        "center";


                    const label =
                        document.createElement(
                            "div"
                        );

                    label.textContent =
                        item[0];

                    label.style.fontSize =
                        "14px";

                    label.style.fontWeight =
                        "700";

                    label.style.color =
                        "#64748b";


                    const value =
                        document.createElement(
                            "strong"
                        );

                    value.textContent =
                        `₹${Number(
                            item[1]
                        ).toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}`;

                    value.style.display =
                        "block";

                    value.style.marginTop =
                        "5px";

                    value.style.fontSize =
                        "20px";

                    value.style.color =
                        "#173f6f";


                    box.appendChild(
                        label
                    );

                    box.appendChild(
                        value
                    );


                    summary.appendChild(
                        box
                    );

                }
            );


            plannerView.appendChild(
                summary
            );


            // =========================================
            // TABLE WRAPPER
            // =========================================

            const tableWrapper =
                document.createElement(
                    "div"
                );

            tableWrapper.style.marginTop =
                "25px";

            tableWrapper.style.overflowX =
                "auto";


            const table =
                document.createElement(
                    "table"
                );

            table.style.width =
                "100%";

            table.style.borderCollapse =
                "collapse";


            // =========================================
            // TABLE HEADER
            // =========================================

            const thead =
                document.createElement(
                    "thead"
                );

            const headerRow =
                document.createElement(
                    "tr"
                );


            [
                "MONTH",
                "PLANNED SAVING",
                "ACTUAL SAVING",
                "DIFFERENCE",
                "STATUS"
            ]
            .forEach(
                (text) => {

                    const th =
                        document.createElement(
                            "th"
                        );

                    th.textContent =
                        text;

                    th.style.padding =
                        "14px";

                    th.style.background =
                        "#173f6f";

                    th.style.color =
                        "#ffffff";

                    th.style.fontSize =
                        "15px";

                    th.style.fontWeight =
                        "900";

                    th.style.border =
                        "1px solid #ffffff";


                    headerRow.appendChild(
                        th
                    );

                }
            );


            thead.appendChild(
                headerRow
            );

            table.appendChild(
                thead
            );


            const tbody =
                document.createElement(
                    "tbody"
                );


            // =========================================
            // GENERATE MONTHLY PLAN
            // =========================================

            let planRemaining =
                remainingAmount;


            const totalMonths =
                remainingMonths > 0
                    ? remainingMonths
                    : 1;


            for (
                let monthIndex = 0;
                monthIndex < totalMonths;
                monthIndex++
            ) {

                const currentDate =
                    new Date();

                currentDate.setDate(
                    1
                );

                currentDate.setMonth(
                    currentDate.getMonth() +
                    monthIndex
                );


                const monthName =
                    currentDate.toLocaleDateString(
                        "en-IN",
                        {
                            month: "short",
                            year: "numeric"
                        }
                    );

                    const monthKey =
    currentDate.toISOString().slice(0, 7);

                let plannedAmount =
                    monthlyPlanAmount;


                // Last month adjustment
                if (
                    monthIndex ===
                    totalMonths - 1
                ) {

                    plannedAmount =
                        planRemaining;

                }

                else {

                    plannedAmount =
                        Math.min(
                            plannedAmount,
                            planRemaining
                        );

                }


                plannedAmount =
                    Math.max(
                        plannedAmount,
                        0
                    );


                planRemaining -=
                    plannedAmount;


                const row =
                    document.createElement(
                        "tr"
                    );

                    row.dataset.month =
    monthKey;

row.dataset.plannedAmount =
    plannedAmount;

                row.style.borderBottom =
                    "1px solid #e2e8f0";


                const monthCell =
                    document.createElement(
                        "td"
                    );

                monthCell.textContent =
                    monthName;


                const plannedCell =
                    document.createElement(
                        "td"
                    );

                plannedCell.textContent =
                    `₹${plannedAmount.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}`;


                const actualCell =
                    document.createElement(
                        "td"
                    );


                const actualInput =
                    document.createElement(
                        "input"
                    );

                actualInput.type =
                    "number";

                actualInput.min =
                    "0";

                actualInput.step =
                    "0.01";

                const savedMonthlyPlan =
    savedMonthlyPlans.find(
        (plan) =>
            plan.month === monthKey
    );


actualInput.value =
    savedMonthlyPlan
        ? Number(
            savedMonthlyPlan.actual || 0
          )
        : 0;

                actualInput.style.width =
                    "130px";

                actualInput.style.padding =
                    "9px";

                actualInput.style.border =
                    "1px solid #cbd5e1";

                actualInput.style.borderRadius =
                    "8px";

                actualInput.style.fontSize =
                    "15px";


                const differenceCell =
                    document.createElement(
                        "td"
                    );

                differenceCell.textContent =
                    `₹${plannedAmount.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}`;


                const statusCell =
                    document.createElement(
                        "td"
                    );

                statusCell.textContent =
                    "⏳ Pending";


                actualInput.addEventListener(
                    "input",
                    () => {

                        const actual =
                            Number(
                                actualInput.value ||
                                0
                            );


                        const difference =
                            actual -
                            plannedAmount;


                        differenceCell.textContent =
                            `₹${difference.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}`;


                        if (
                            actual >=
                            plannedAmount
                        ) {

                            statusCell.textContent =
                                "🟢 On Track";

                        }

                        else if (
                            actual > 0
                        ) {

                            statusCell.textContent =
                                "🟡 Behind";

                        }

                        else {

                            statusCell.textContent =
                                "⏳ Pending";

                        }

                    }
                );

// =========================================
// RESTORE SAVED DIFFERENCE / STATUS
// =========================================

const restoredActual =
    Number(
        actualInput.value || 0
    );


const restoredDifference =
    restoredActual -
    plannedAmount;


differenceCell.textContent =
    `₹${restoredDifference.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;


if (
    restoredActual >=
    plannedAmount
) {

    statusCell.textContent =
        "🟢 On Track";

}

else if (
    restoredActual > 0
) {

    statusCell.textContent =
        "🟡 Behind";

}

else {

    statusCell.textContent =
        "⏳ Pending";

}

                actualCell.appendChild(
                    actualInput
                );


                [
                    monthCell,
                    plannedCell,
                    actualCell,
                    differenceCell,
                    statusCell
                ]
                .forEach(
                    (cell) => {

                        cell.style.padding =
                            "13px";

                        cell.style.fontSize =
                            "16px";

                        cell.style.fontWeight =
                            "700";

                        cell.style.textAlign =
                            "center";

                        cell.style.border =
                            "1px solid #e2e8f0";

                    }
                );


                row.appendChild(
                    monthCell
                );

                row.appendChild(
                    plannedCell
                );

                row.appendChild(
                    actualCell
                );

                row.appendChild(
                    differenceCell
                );

                row.appendChild(
                    statusCell
                );


                tbody.appendChild(
                    row
                );

            }


            table.appendChild(
                tbody
            );

            tableWrapper.appendChild(
                table
            );

            plannerView.appendChild(
                tableWrapper
            );

// =========================================
// SAVE MONTHLY PLAN BUTTON
// =========================================

const saveMonthlyPlanButton =
    document.createElement(
        "button"
    );


saveMonthlyPlanButton.type =
    "button";


saveMonthlyPlanButton.textContent =
    "💾 Save Monthly Plan";


saveMonthlyPlanButton.style.display =
    "block";


saveMonthlyPlanButton.style.margin =
    "24px auto 0";


saveMonthlyPlanButton.style.padding =
    "13px 24px";


saveMonthlyPlanButton.style.border =
    "none";


saveMonthlyPlanButton.style.borderRadius =
    "10px";


saveMonthlyPlanButton.style.background =
    "linear-gradient(135deg, #173f6f, #1e88e5)";


saveMonthlyPlanButton.style.color =
    "#ffffff";


saveMonthlyPlanButton.style.fontSize =
    "17px";


saveMonthlyPlanButton.style.fontWeight =
    "900";


saveMonthlyPlanButton.style.cursor =
    "pointer";


saveMonthlyPlanButton.style.boxShadow =
    "0 5px 12px rgba(0,0,0,0.15)";


plannerView.appendChild(
    saveMonthlyPlanButton
);


// =========================================
// SAVE MONTHLY PLAN TO FIRESTORE
// =========================================

saveMonthlyPlanButton.addEventListener(
    "click",
    async () => {

        try {

            const monthlyPlans = [];


            const rows =
                tbody.querySelectorAll(
                    "tr"
                );


            rows.forEach(
                (row) => {

                    const actualInput =
                        row.querySelector(
                            "input[type='number']"
                        );


                    if (!actualInput) {
                        return;
                    }


                    const planned =
                        Number(
                            row.dataset.plannedAmount ||
                            0
                        );


                    const actual =
                        Number(
                            actualInput.value ||
                            0
                        );


                    const difference =
                        actual -
                        planned;


                    let status =
                        "Pending";


                    if (
                        actual >=
                        planned
                    ) {

                        status =
                            "On Track";

                    }

                    else if (
                        actual > 0
                    ) {

                        status =
                            "Behind";

                    }


                    monthlyPlans.push({

                        month:
                            row.dataset.month,

                        planned:
                            planned,

                        actual:
                            actual,

                        difference:
                            difference,

                        status:
                            status

                    });

                }
            );


            await updateDoc(
                goalRef,
                {

                    monthlyPlans:
                        monthlyPlans,

                    updatedAt:
                        serverTimestamp()

                }
            );


            console.log(
                "Monthly Plan saved successfully:",
                monthlyPlans
            );


            alert(
                "📅 Monthly Plan successfully save हो गया।"
            );


        }
        catch (error) {

            console.error(
                "Save Monthly Plan Error:",
                error
            );


            alert(
                "Monthly Plan save नहीं हो पाया। Console में error देखें।"
            );

        }

    }
);
            // =========================================
            // SHOW PLANNER
            // =========================================

            if (allGoalsView) {

                allGoalsView.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            plannerView.style.setProperty(
                "display",
                "block",
                "important"
            );


            plannerView.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            // =========================================
            // BACK BUTTON
            // =========================================

            backPlannerButton.addEventListener(
                "click",
                () => {

                    plannerView.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );


                    if (allGoalsView) {

                        allGoalsView.style.setProperty(
                            "display",
                            "block",
                            "important"
                        );


                        allGoalsView.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }
        catch (error) {

            console.error(
                "Monthly Planner Error:",
                error
            );

            alert(
                "Monthly Planner खुल नहीं पाया। Console में error देखें।"
            );

        }

    }
);

