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

        fdFormContainer.style.display = "block";

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
// ===============================

const fdForm =
    document.querySelector("#fdForm");


if (fdForm) {

    fdForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const user = auth.currentUser;

            if (!user) {

                alert("कृपया पहले Login करें।");
                return;

            }


            const fdName =
                document.querySelector("#fdName").value.trim();

            const fdBank =
                document.querySelector("#fdBank").value.trim();

            const fdAmount =
                Number(
                    document.querySelector("#fdAmount").value
                );

            const fdDepositDate =
                document.querySelector("#fdDepositDate").value;

            const fdMaturityDate =
                document.querySelector("#fdMaturityDate").value;

            const fdInterestRate =
                Number(
                    document.querySelector("#fdInterestRate").value
                );

            const fdCompounding =
                Number(
                    document.querySelector("#fdCompounding").value
                );

            const fdMaturityAmount =
                Number(
                    document.querySelector("#fdMaturityAmount").value
                );


            console.log(
                "Saving FD to Firestore..."
            );


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

                    createdAt: serverTimestamp()

                }

            );


            console.log(
                "FD saved successfully!"
            );


            alert(
                "Fixed Deposit successfully saved!"
            );


            fdForm.reset();

            fdFormContainer.style.display = "none";


        } catch (error) {

           console.error("FD Save Error:", error);
           console.error("FD Error Code:", error?.code);
           console.error("FD Error Message:", error?.message);
           console.error("FD Full Error:", JSON.stringify(error));

            alert(
                "FD save नहीं हो पाया। कृपया फिर कोशिश करें।"
            );

        }

    });

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