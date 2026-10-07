import {
    auth,
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// LOANS MODULE
// ===============================

const LOANS_COLLECTION = "loans";

function getLoansCollectionRef() {

    if (!auth.currentUser) {
        throw new Error("User is not logged in");
    }

    return collection(
        db,
        "users",
        auth.currentUser.uid,
        LOANS_COLLECTION
    );
}

console.log("Loans module loaded successfully");

const addLoanButton = document.getElementById("addLoanButton");

if (addLoanButton) {

    addLoanButton.addEventListener("click", function () {

        const loanForm =
            document.getElementById("loanFormContainer");

        const loanSummary =
            document.getElementById("loanSummary");

        const loansList =
            document.getElementById("loansListContainer");

        const loanCards =
            document.querySelector(".loan-type-grid");

        /* Hide other Loan views */
        if (loanSummary) {
            loanSummary.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        // Hide Loan Repayment Dashboard
const loanRepaymentSection =
    document.getElementById(
        "loanRepaymentSection"
    );

if (loanRepaymentSection) {

    loanRepaymentSection.style.setProperty(
        "display",
        "none",
        "important"
    );

}

        if (loansList) {
            loansList.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        if (loanCards) {
            loanCards.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        /* Show Loan Form */
        if (loanForm) {
            loanForm.style.setProperty(
                "display",
                "block",
                "important"
            );

            loadLoanPaymentAccounts();
            loadSavedLoans();

            loanForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

}

const cancelLoanButton =
    document.getElementById("cancelLoanButton");

if (cancelLoanButton) {

    cancelLoanButton.addEventListener("click", function () {

        const loanForm =
            document.getElementById("loanFormContainer");

        const loanCards =
            document.querySelector(".loan-type-grid");

        const loanSummary =
            document.getElementById("loanSummary");

        const loansList =
            document.getElementById("loansListContainer");

        /* Hide Form */
        if (loanForm) {
            loanForm.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        /* Show Loan Cards */
        if (loanCards) {
            loanCards.style.setProperty(
                "display",
                "grid",
                "important"
            );
        }

        /* Keep Summary and List closed */
        if (loanSummary) {
            loanSummary.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        if (loansList) {
            loansList.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        document
            .getElementById("loansSection")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    });

}

async function loadLoanPaymentAccounts() {

    const paymentAccountSelect =
        document.getElementById("loanPaymentAccount");

    if (!paymentAccountSelect) return;

    paymentAccountSelect.innerHTML =
        '<option value="">-- Select Account --</option>';

    if (!auth.currentUser) return;

    try {

        const accountsRef = collection(
            db,
            "users",
            auth.currentUser.uid,
            "accounts"
        );

        const accountsSnapshot =
            await getDocs(accountsRef);

        accountsSnapshot.forEach((accountDoc) => {

            const account = accountDoc.data();

            const option =
                document.createElement("option");

                if (account.type !== "bank") {
    return;
}
            option.value = accountDoc.id;

            option.textContent =
                `${account.name || "Unnamed Account"} — ₹${Number(
                    account.balance || 0
                ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;

            paymentAccountSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error loading loan payment accounts:",
            error
        );

    }
}

document.addEventListener("click", async function (event) {

    const saveButton = event.target.closest("#saveLoanButton");

    if (!saveButton) return;

    try {

        if (!auth.currentUser) {
            alert("Please login first.");
            return;
        }

        const loanData = {

            loanType:
                document.getElementById("loanType").value,

            loanName:
                document.getElementById("loanName").value.trim(),

            lender:
                document.getElementById("loanLender").value.trim(),

            accountNumber:
                document.getElementById("loanAccountNumber").value.trim(),

            originalAmount:
                Number(
                    document.getElementById("loanOriginalAmount").value || 0
                ),

            outstandingBalance:
                Number(
                    document.getElementById("loanOutstandingBalance").value || 0
                ),

            interestRate:
                Number(
                    document.getElementById("loanInterestRate").value || 0
                ),

            emi:
                Number(
                    document.getElementById("loanEMI").value || 0
                ),

            startDate:
                document.getElementById("loanStartDate").value,

            originalTenure:
                Number(
                    document.getElementById("loanOriginalTenure").value || 0
                ),

            remainingTenure:
                Number(
                    document.getElementById("loanRemainingTenure").value || 0
                ),

            emiDay:
                Number(
                    document.getElementById("loanEMIDay").value || 0
                ),

            extraPrincipal:
                Number(
                    document.getElementById("loanExtraPrincipal").value || 0
                ),

            paymentType:
                document.getElementById("loanPaymentType").value,

            paymentAccount:
                document.getElementById("loanPaymentAccount").value,

            status:
                document.getElementById("loanStatus").value,

            notes:
                document.getElementById("loanNotes").value.trim(),

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        };


        /* ===============================
           VALIDATION
        =============================== */

        if (!loanData.loanType) {
            alert("Please select Loan Type.");
            return;
        }

        if (!loanData.loanName) {
            alert("Please enter Loan Name.");
            return;
        }

        if (loanData.originalAmount <= 0) {
            alert("Please enter Original Loan Amount.");
            return;
        }

        if (loanData.outstandingBalance < 0) {
            alert("Outstanding Balance cannot be negative.");
            return;
        }

        if (!loanData.paymentAccount) {
            alert("Please select EMI Paid From Bank Account.");
            return;
        }


        /* ===============================
           SAVE
        =============================== */

        saveButton.disabled = true;
        saveButton.textContent = "⏳ Saving...";

        const loansRef =
            getLoansCollectionRef();

        await addDoc(
            loansRef,
            loanData
        );


        alert("Loan saved successfully.");

        saveButton.disabled = false;
        saveButton.textContent = "💾 Save Loan";


        /* ===============================
           CLOSE FORM
        =============================== */

        const loanForm =
            document.getElementById("loanFormContainer");

        const loanCards =
            document.querySelector(".loan-type-grid");

        if (loanForm) {
            loanForm.style.setProperty(
                "display",
                "none",
                "important"
            );
        }

        if (loanCards) {
            loanCards.style.setProperty(
                "display",
                "grid",
                "important"
            );
        }

        console.log(
            "Loan saved successfully:",
            loanData
        );

    } catch (error) {

        console.error(
            "Error saving loan:",
            error
        );

        alert(
            "Unable to save loan. Please check Console."
        );

        saveButton.disabled = false;
        saveButton.textContent = "💾 Save Loan";
    }

});

async function loadSavedLoans() {

    if (!auth.currentUser) return;

    try {

        const loansRef =
            getLoansCollectionRef();

        const loansSnapshot =
            await getDocs(loansRef);

            const dashboardLoansValue =
    document.getElementById("dashboardLoansValue");

let dashboardTotalOutstanding = 0;

loansSnapshot.forEach((loanDoc) => {

    const loan = loanDoc.data();

    dashboardTotalOutstanding +=
        Number(loan.outstandingBalance || 0);

});

if (dashboardLoansValue) {

    dashboardLoansValue.textContent =
        `₹${dashboardTotalOutstanding.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

}

        /* ===============================
           RESET ALL LOAN CARDS
        =============================== */

        document.querySelectorAll(".loan-type-card").forEach(card => {

            const countElement =
                card.querySelector(".loan-active-count");

            if (countElement) {
                countElement.textContent = "0 Active";
            }

            const oldBalance =
                card.querySelector(".loan-card-outstanding");

            if (oldBalance) {
                oldBalance.remove();
            }

        });


        /* ===============================
           LOAD SAVED LOANS
        =============================== */

        const loanDataByType = {};

        const loanDistributionTotals = {};

        let totalLoansAmount = 0;
let outstandingLoansAmount = 0;
let monthlyLoanEMI = 0;
let activeLoansCount = 0;
let totalPrincipalPaid = 0;
let totalExtraPrincipal = 0;
let totalMonthlyOutflow = 0;
let largestLoanName = "—";
let largestLoanAmount = 0;

        loansSnapshot.forEach((loanDoc) => {

            const loan = loanDoc.data();

            const loanType =
                loan.loanType;

                const loanOutstanding =
    Number(loan.outstandingBalance || 0);

if (loanOutstanding > largestLoanAmount) {
    largestLoanAmount = loanOutstanding;
    largestLoanName = loan.loanName || loan.loanType || "—";
}

                if (loan.status === "active") {

    const outstanding =
        Number(loan.outstandingBalance || 0);

    loanDistributionTotals[loanType] =
        (loanDistributionTotals[loanType] || 0) +
        outstanding;

}

                totalLoansAmount +=
                Number(loan.originalAmount || 0);

                outstandingLoansAmount +=
                Number(loan.outstandingBalance || 0);

           if (loan.status === "active") {

    activeLoansCount++;

    const loanEMI =
        Number(loan.emi || 0);

    const loanExtraPrincipal =
        Number(loan.extraPrincipal || 0);

    monthlyLoanEMI +=
        loanEMI;

    totalExtraPrincipal +=
        loanExtraPrincipal;

    totalMonthlyOutflow +=
        loanEMI + loanExtraPrincipal;

}

            if (!loanDataByType[loanType]) {

                loanDataByType[loanType] = {
                    activeCount: 0,
                    outstanding: 0
                };

            }

            if (loan.status === "active") {

                loanDataByType[loanType].activeCount++;

                loanDataByType[loanType].outstanding +=
                    Number(loan.outstandingBalance || 0);

            }

        });


const distributionTotal =
    Object.values(loanDistributionTotals)
        .reduce((sum, value) => sum + value, 0);

const distributionDonut =
    document.getElementById("loanDistributionDonut");

const distributionTotalElement =
    document.getElementById("loanDistributionTotal");

const distributionLegend =
    document.getElementById("loanDistributionLegend");


if (distributionTotalElement) {

    distributionTotalElement.textContent =
        `₹${distributionTotal.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


if (distributionLegend) {

    distributionLegend.innerHTML = "";

    const colors = [
        "#3989e8",
        "#e85d8e",
        "#42a86b",
        "#e8ad3d",
        "#8a63d2",
        "#38a5a5",
        "#e2763d",
        "#64748b"
    ];

    let currentDegree = 0;

    Object.entries(loanDistributionTotals)
        .forEach(([type, amount], index) => {

            const percentage =
                distributionTotal > 0
                    ? (amount / distributionTotal) * 100
                    : 0;

            const degree =
                percentage * 3.6;

            const item =
                document.createElement("div");

            item.className =
                "loan-distribution-item";

            item.innerHTML = `
                <div class="loan-distribution-label">

                    <span
                        class="loan-distribution-dot"
                        style="background:${colors[index % colors.length]}">
                    </span>

                    <span>${type}</span>

                </div>

                <strong>
                    ₹${amount.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                    (${percentage.toFixed(1)}%)
                </strong>
            `;

            distributionLegend.appendChild(item);

            currentDegree += degree;

        });


    if (distributionDonut && distributionTotal > 0) {

        let gradientParts = [];
        let startDegree = 0;

        Object.entries(loanDistributionTotals)
            .forEach(([type, amount], index) => {

                const percentage =
                    (amount / distributionTotal) * 100;

                const degree =
                    percentage * 3.6;

                const endDegree =
                    startDegree + degree;

                gradientParts.push(
                    `${colors[index % colors.length]} ${startDegree}deg ${endDegree}deg`
                );

                startDegree = endDegree;

            });

        distributionDonut.style.background =
            `conic-gradient(${gradientParts.join(", ")})`;

    }

}


        totalPrincipalPaid =
    totalLoansAmount - outstandingLoansAmount;

const totalLoansElement =
    document.getElementById("totalLoansAmount");

const outstandingElement =
    document.getElementById("outstandingLoansAmount");

const monthlyEMIElement =
    document.getElementById("monthlyLoanEMI");

const activeLoansElement =
    document.getElementById("activeLoansCount");

const principalPaidElement =
    document.getElementById("loanInsightPrincipalPaid");

const extraPrincipalElement =
    document.getElementById("loanInsightExtraPrincipal");

const monthlyOutflowElement =
    document.getElementById("loanInsightMonthlyOutflow");

    if (principalPaidElement) {

    principalPaidElement.textContent =
        `₹${totalPrincipalPaid.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

if (extraPrincipalElement) {

    extraPrincipalElement.textContent =
        `₹${totalExtraPrincipal.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

if (monthlyOutflowElement) {

    monthlyOutflowElement.textContent =
        `₹${totalMonthlyOutflow.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

const largestLoanNameElement =
    document.getElementById("largestLoanName");

const largestLoanAmountElement =
    document.getElementById("largestLoanAmount");

const outstandingPercentage =
    totalLoansAmount > 0
        ? (outstandingLoansAmount / totalLoansAmount) * 100
        : 0;

const outstandingPercentageElement =
    document.getElementById("loanInsightOutstandingPercentage");

const insightEMIElement =
    document.getElementById("loanInsightEMI");

const insightActiveLoansElement =
    document.getElementById("loanInsightActiveLoans");


if (largestLoanNameElement) {
    largestLoanNameElement.textContent =
        largestLoanName;
}

if (largestLoanAmountElement) {
    largestLoanAmountElement.textContent =
        `₹${largestLoanAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
}

if (outstandingPercentageElement) {
    outstandingPercentageElement.textContent =
        `${outstandingPercentage.toFixed(1)}%`;
}

if (insightEMIElement) {
    insightEMIElement.textContent =
        `₹${monthlyLoanEMI.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
}

if (insightActiveLoansElement) {
    insightActiveLoansElement.textContent =
        activeLoansCount;
}

if (totalLoansElement) {

    totalLoansElement.textContent =
        `₹${totalLoansAmount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

if (outstandingElement) {

    outstandingElement.textContent =
        `₹${outstandingLoansAmount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

if (monthlyEMIElement) {

    monthlyEMIElement.textContent =
        `₹${monthlyLoanEMI.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}

if (activeLoansElement) {

    activeLoansElement.textContent =
        activeLoansCount;

}
        /* ===============================
           UPDATE CARDS
        =============================== */

        document.querySelectorAll(".loan-type-card").forEach(card => {

            const loanType =
                card.dataset.loanType;

            const data =
                loanDataByType[loanType];

            if (!data) return;


            const countElement =
                card.querySelector(".loan-active-count");

            if (countElement) {

                countElement.textContent =
                    `${data.activeCount} Active`;

            }


            const outstandingElement =
                document.createElement("span");

            outstandingElement.className =
                "loan-card-outstanding";

            outstandingElement.textContent =
                `Outstanding: ₹${data.outstanding.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}`;


            const infoElement =
                card.querySelector(".loan-type-info");

            if (infoElement) {

                infoElement.appendChild(
                    outstandingElement
                );

            }

        });


        console.log(
            "Saved Loans:",
            loansSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        );

    } catch (error) {

        console.error(
            "Error loading saved loans:",
            error
        );

    }
}

const loansSection =
    document.getElementById("loansSection");

if (loansSection) {

    const loanObserver =
        new MutationObserver(function () {

            const isLoansVisible =
                getComputedStyle(loansSection).display !== "none";

           if (isLoansVisible) {
    loadSavedLoans();
    loadHomeLoanRepaymentDashboard();
}
        });

    loanObserver.observe(
        loansSection,
        {
            attributes: true,
            attributeFilter: ["style", "class"]
        }
    );

}

// =========================================================
// LOAN SUMMARY BUTTON
// OLD 8 LOAN CARDS ARE PERMANENTLY DISABLED
// =========================================================

const loanSummaryButton =
    document.getElementById("loanSummaryButton");

if (loanSummaryButton) {

    loanSummaryButton.addEventListener(
        "click",
        async function () {

            const loanSummary =
                document.getElementById("loanSummary");

            const loanForm =
                document.getElementById("loanFormContainer");

            const loansList =
                document.getElementById("loansListContainer");

            const loanCards =
                document.querySelector(".loan-type-grid");

            const repaymentSection =
                document.getElementById("loanRepaymentSection");


            // =================================================
            // OLD 8 LOAN CARDS - ALWAYS HIDDEN
            // =================================================

            if (loanCards) {

                loanCards.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // =================================================
            // HIDE OTHER LOAN VIEWS
            // =================================================

            if (loanForm) {

                loanForm.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }

            if (loansList) {

                loansList.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }

            if (repaymentSection) {

                repaymentSection.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // =================================================
            // REFRESH LOAN DATA
            // =================================================

            await loadSavedLoans();


            // =================================================
            // SUMMARY TOGGLE
            // =================================================

            if (loanSummary) {

                const currentDisplay =
                    getComputedStyle(
                        loanSummary
                    ).display;


                if (currentDisplay === "none") {

                    loanSummary.style.setProperty(
                        "display",
                        "grid",
                        "important"
                    );

                } else {

                    loanSummary.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }

            }

        }
    );

}

// =========================================================
// LOAN REPAYMENT CARD SELECTION
// =========================================================

document.addEventListener("click", async function (event) {

    const loanCard =
        event.target.closest(".loan-repayment-select-card");

    if (!loanCard) return;

    const selectedLoanType =
        loanCard.dataset.loanType;

    if (!selectedLoanType) return;

    console.log(
        "Selected Repayment Loan:",
        selectedLoanType
    );


// =====================================================
// RESET ALL LOAN CARDS TO NORMAL SIZE
// =====================================================

document
    .querySelectorAll(".loan-repayment-select-card")
    .forEach(card => {

        // Normal size for every unselected card
        card.style.setProperty(
            "height",
            "62px",
            "important"
        );

        card.style.setProperty(
            "min-height",
            "62px",
            "important"
        );

        card.style.setProperty(
            "max-height",
            "62px",
            "important"
        );

        card.style.setProperty(
            "padding",
            "14px 16px",
            "important"
        );

        card.style.setProperty(
            "overflow",
            "hidden",
            "important"
        );

        card.style.setProperty(
            "border",
            "1px solid #dbe3ef",
            "important"
        );

        card.style.setProperty(
            "box-shadow",
            "none",
            "important"
        );

        card.style.setProperty(
            "background",
            "#ffffff",
            "important"
        );

    });


// =====================================================
// MAKE ONLY SELECTED CARD BIGGER
// =====================================================

loanCard.style.setProperty(
    "height",
    "120px",
    "important"
);

loanCard.style.setProperty(
    "min-height",
    "120px",
    "important"
);

loanCard.style.setProperty(
    "max-height",
    "120px",
    "important"
);

loanCard.style.setProperty(
    "padding",
    "16px",
    "important"
);

loanCard.style.setProperty(
    "overflow",
    "visible",
    "important"
);

loanCard.style.setProperty(
    "border",
    "2px solid #2563b8",
    "important"
);

loanCard.style.setProperty(
    "box-shadow",
    "0 5px 15px rgba(37,99,184,0.12)",
    "important"
);

loanCard.style.setProperty(
    "background",
    "linear-gradient(135deg,#ffffff,#eef5ff)",
    "important"
);

    // =====================================================
    // DEFAULT VALUES
    // =====================================================

    let selectedLoan = null;


    // =====================================================
    // LOAD LOAN FROM FIRESTORE
    // =====================================================

    if (auth.currentUser) {

        try {

            const loansRef =
                getLoansCollectionRef();

            const loansSnapshot =
                await getDocs(loansRef);


            loansSnapshot.forEach(loanDoc => {

                const loan =
                    loanDoc.data();

                if (
                    !selectedLoan &&
                    loan.loanType === selectedLoanType &&
                    loan.status === "active"
                ) {

                    selectedLoan = {
                        id: loanDoc.id,
                        ...loan
                    };

                }

            });


        } catch (error) {

            console.error(
                "Error loading selected loan:",
                error
            );

        }

    }


    // =====================================================
    // VALUES
    // =====================================================

    const outstanding =
        Number(
            selectedLoan?.outstandingBalance || 0
        );

    const emi =
        Number(
            selectedLoan?.emi || 0
        );

    const interestRate =
        Number(
            selectedLoan?.interestRate || 0
        );


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatLoanAmount(amount) {

        return (
            "₹" +
            Number(amount || 0).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            )
        );

    }


    // =====================================================
    // UPDATE TOP SUMMARY CARDS
    // =====================================================

    const balanceElement =
        document.getElementById(
            "repaymentCurrentBalance"
        );

    const emiElement =
        document.getElementById(
            "repaymentCurrentEMI"
        );

    const rateElement =
        document.getElementById(
            "repaymentCurrentRate"
        );


    if (balanceElement) {

        balanceElement.textContent =
            formatLoanAmount(outstanding);

    }


    if (emiElement) {

        emiElement.textContent =
            formatLoanAmount(emi);

    }


    if (rateElement) {

        rateElement.textContent =
            interestRate > 0
                ? `${interestRate.toFixed(2)}%`
                : "—";

    }


    // =====================================================
    // UPDATE REPAYMENT LOAN DROPDOWN
    // =====================================================

    const repaymentLoanSelect =
        document.getElementById(
            "repaymentLoan"
        );

    if (repaymentLoanSelect) {

        const option =
            Array.from(
                repaymentLoanSelect.options
            ).find(
                item =>
                    item.value === selectedLoanType ||
                    item.textContent.trim() === selectedLoanType
            );

        if (option) {

            repaymentLoanSelect.value =
                option.value;

        }

    }


    // =====================================================
    // UPDATE OPENING PRINCIPAL
    // =====================================================

    const openingPrincipalElement =
        document.getElementById(
            "repaymentOpeningPrincipal"
        );

    if (openingPrincipalElement) {

        openingPrincipalElement.textContent =
            formatLoanAmount(outstanding);

    }


    // =====================================================
    // UPDATE LEFT HOME LOAN CARD
    // =====================================================

    if (selectedLoanType === "Home Loan") {

        const homeBalance =
            document.getElementById(
                "repaymentHomeLoanBalance"
            );

        const homeEMI =
            document.getElementById(
                "repaymentHomeLoanEMI"
            );

        if (homeBalance) {

            homeBalance.textContent =
                formatLoanAmount(outstanding);

        }

        if (homeEMI) {

            homeEMI.textContent =
                formatLoanAmount(emi);

        }

    }


    // =====================================================
    // NEXT EMI DATE
    // =====================================================

    const nextEMIElement =
        document.getElementById(
            "repaymentNextEMIDate"
        );

    if (nextEMIElement) {

        if (
            selectedLoan &&
            selectedLoan.emiDay
        ) {

            const today =
                new Date();

            let year =
                today.getFullYear();

            let month =
                today.getMonth();

            let dueDate =
                new Date(
                    year,
                    month,
                    Number(selectedLoan.emiDay)
                );


            if (dueDate <= today) {

                dueDate =
                    new Date(
                        year,
                        month + 1,
                        Number(selectedLoan.emiDay)
                    );

            }


            const day =
                String(
                    dueDate.getDate()
                ).padStart(2, "0");

            const monthNumber =
                String(
                    dueDate.getMonth() + 1
                ).padStart(2, "0");

            const dueYear =
                dueDate.getFullYear();


            nextEMIElement.textContent =
                `${day}-${monthNumber}-${dueYear}`;

        } else {

            nextEMIElement.textContent =
                "—";

        }

    }


    // =====================================================
    // CONSOLE TEST
    // =====================================================

    console.log(
        "REPAYMENT DASHBOARD UPDATED:",
        {
            loanType: selectedLoanType,
            loanId: selectedLoan?.id || null,
            outstanding: outstanding,
            emi: emi,
            interestRate: interestRate
        }
    );

});

// =========================================================
// TEST - HOME LOAN EXTRA PRINCIPAL CALCULATION
// =========================================================

async function testHomeLoanExtraPrincipal() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    try {

        const loansRef =
            getLoansCollectionRef();

        const loansSnapshot =
            await getDocs(loansRef);

        let homeLoan = null;

        loansSnapshot.forEach((loanDoc) => {

            const loan = loanDoc.data();

            if (
                loan.loanType === "Home Loan" &&
                loan.status === "active"
            ) {

                homeLoan = {
                    id: loanDoc.id,
                    ...loan
                };

            }

        });

        if (!homeLoan) {

            console.log(
                "❌ Active Home Loan नहीं मिला"
            );

            return;

        }

        // =========================================
        // CURRENT LOAN BALANCE
        // =========================================

        const openingPrincipal =
            Number(
                homeLoan.outstandingBalance || 0
            );


        // =========================================
        // SEPTEMBER EXTRA PRINCIPAL
        // 15-09 = ₹15,000
        // 25-09 = ₹5,000
        // TOTAL = ₹20,000
        // =========================================

        const extraPrincipal =
            15000 + 5000;


        // =========================================
        // CALCULATE NEW OUTSTANDING
        // =========================================

        const closingPrincipal =
            openingPrincipal -
            extraPrincipal;


        // =========================================
        // BALANCE TENURE
        // =========================================

        const balanceTenure =
            Number(
                homeLoan.remainingTenure || 0
            );


        // =========================================
        // TEST OUTPUT
        // =========================================

        console.log(
            "🏦 HOME LOAN EXTRA PRINCIPAL TEST"
        );

        console.log(
            "Loan ID:",
            homeLoan.id
        );

        console.log(
            "Opening Principal:",
            openingPrincipal
        );

        console.log(
            "15-09-2026 Extra Principal:",
            15000
        );

        console.log(
            "25-09-2026 Extra Principal:",
            5000
        );

        console.log(
            "Total Extra Principal:",
            extraPrincipal
        );

        console.log(
            "Balance Tenure:",
            balanceTenure,
            "months"
        );

        console.log(
            "Closing Principal After Extra Payment:",
            closingPrincipal
        );

    } catch (error) {

        console.error(
            "❌ Extra Principal Test Error:",
            error
        );

    }

}


// =========================================================
// EXPOSE TEST FUNCTION
// =========================================================

window.testHomeLoanExtraPrincipal =
    testHomeLoanExtraPrincipal;

async function verifyLoanTransactionAccountNames() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const transactionsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "transactions"
    );

    const accountsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "accounts"
    );

    const [transactionSnapshot, accountSnapshot] =
        await Promise.all([
            getDocs(transactionsRef),
            getDocs(accountsRef)
        ]);

    const accountMap = {};

    accountSnapshot.forEach((accountDoc) => {

        const a = accountDoc.data();

        accountMap[accountDoc.id] =
            a.name ||
            a.accountName ||
            "(Unknown Account)";
    });

    console.log("======================================");
    console.log("🔎 18 & 25 SEPTEMBER ACCOUNT CHECK");
    console.log("======================================");

    transactionSnapshot.forEach((transactionDoc) => {

        const t = transactionDoc.data();

        if (
            t.date !== "2026-09-18" &&
            t.date !== "2026-09-25"
        ) {
            return;
        }

        const amount = Number(t.amount || 0);

        if (
            amount !== 5000 &&
            amount !== 10000 &&
            amount !== 15000
        ) {
            return;
        }

        console.log("--------------------------------------");
        console.log("ID:", transactionDoc.id);
        console.log("Date:", t.date);
        console.log("Amount:", amount);
        console.log("Type:", t.type);
        console.log("Category:", t.category);

        console.log(
            "FROM:",
            accountMap[t.fromAccountId] || "(blank)"
        );

        console.log(
            "TO:",
            accountMap[t.toAccountId] || "(blank)"
        );

        console.log("Party:", t.partyName || "");
        console.log("Notes:", t.notes || "");
    });

    console.log("======================================");
    console.log("✅ ACCOUNT CHECK COMPLETE");
    console.log("======================================");
}

window.verifyLoanTransactionAccountNames =
    verifyLoanTransactionAccountNames;

    // =========================================================
// TEST HOME LOAN EXTRA PRINCIPAL LINKAGE
// =========================================================

async function testHomeLoanExtraPrincipalLinkage() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const transactionsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "transactions"
    );

    const loansRef = getLoansCollectionRef();

    const transactionSnapshot = await getDocs(transactionsRef);
    const loanSnapshot = await getDocs(loansRef);

    // -----------------------------------------
    // FIND ACTIVE HOME LOAN
    // -----------------------------------------

    let homeLoan = null;

    loanSnapshot.forEach((loanDoc) => {

        const loan = loanDoc.data();

        if (
            loan.loanType === "Home Loan" &&
            loan.status === "active"
        ) {
            homeLoan = {
                id: loanDoc.id,
                ...loan
            };
        }
    });

    if (!homeLoan) {
        console.log("❌ Active Home Loan not found");
        return;
    }

    // -----------------------------------------
    // FIND SEPTEMBER EXTRA PRINCIPAL TRANSACTIONS
    // -----------------------------------------

    const transactionIds = [
        "1lvoH15hmGXZh9bd7Mbz",
        "o9Jg1hKO4otPibrmt9J1"
    ];

    const matchedTransactions = [];

    transactionSnapshot.forEach((transactionDoc) => {

        if (!transactionIds.includes(transactionDoc.id)) {
            return;
        }

        const t = transactionDoc.data();

        matchedTransactions.push({
            id: transactionDoc.id,
            date: t.date || "",
            amount: Number(t.amount || 0),
            category: t.category || "",
            type: t.type || "",
            fromAccountId: t.fromAccountId || "",
            partyName: t.partyName || ""
        });
    });

    // -----------------------------------------
    // CALCULATE TEST VALUES
    // -----------------------------------------

    const openingOutstanding =
        Number(homeLoan.outstandingBalance || 0);

    const totalExtraPrincipal =
        matchedTransactions.reduce(
            (total, transaction) =>
                total + Number(transaction.amount || 0),
            0
        );

    const closingOutstanding =
        openingOutstanding - totalExtraPrincipal;

    const remainingTenure =
        Number(homeLoan.remainingTenure || 0);

    // -----------------------------------------
    // TEST OUTPUT
    // -----------------------------------------

    console.log("==========================================");
    console.log("🏠 HOME LOAN EXTRA PRINCIPAL LINKAGE TEST");
    console.log("==========================================");

    console.log("Loan ID:", homeLoan.id);
    console.log("Loan Name:", homeLoan.loanName);
    console.log("Opening Outstanding:", openingOutstanding);

    console.log("------------------------------------------");

    matchedTransactions.forEach((transaction) => {

        console.log(
            transaction.date,
            "→ ₹" + transaction.amount,
            "→ Transaction ID:",
            transaction.id
        );
    });

    console.log("------------------------------------------");

    console.log("Total Extra Principal:", totalExtraPrincipal);
    console.log("Balance Tenure:", remainingTenure, "months");
    console.log("Test Closing Outstanding:", closingOutstanding);

    console.log("------------------------------------------");

    if (totalExtraPrincipal === 20000) {

        console.log(
            "✅ LINKAGE TEST PASSED: ₹20,000 EXTRA PRINCIPAL FOUND"
        );

    } else {

        console.log(
            "⚠️ LINKAGE TEST FAILED: Expected ₹20,000"
        );
    }

    console.log("==========================================");
}

// Expose test function
window.testHomeLoanExtraPrincipalLinkage =
    testHomeLoanExtraPrincipalLinkage;


    // =========================================================
// TEST: LOAN REPAYMENT RECORD STRUCTURE
// =========================================================

async function testHomeLoanRepaymentRecord() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    // -----------------------------------------
    // VERIFIED DATA
    // -----------------------------------------

    const loanId = "6pW3C6C0VVSwaoWfOozf";

    const transactionIds = [
        "1lvoH15hmGXZh9bd7Mbz",
        "o9Jg1hKO4otPibrmt9J1"
    ];

    const openingOutstanding = 4336743;
    const extraPrincipal = 20000;
    const closingOutstanding =
        openingOutstanding - extraPrincipal;

    // -----------------------------------------
    // TEST REPAYMENT OBJECT
    // -----------------------------------------

    const repaymentRecord = {

        loanId: loanId,

        paymentDate: "2026-09-25",

        repaymentType: "extra_principal",

        amount: extraPrincipal,

        emiAmount: 0,

        principalAmount: extraPrincipal,

        interestAmount: 0,

        prepaymentAmount: extraPrincipal,

        outstandingBefore: openingOutstanding,

        outstandingAfter: closingOutstanding,

        transactionIds: transactionIds,

        balanceTenureBefore: 121,

        source: "ERP Transaction Entry",

        status: "test_only"
    };

    // -----------------------------------------
    // DISPLAY ONLY
    // -----------------------------------------

    console.log("==========================================");
    console.log("🏦 LOAN REPAYMENT RECORD TEST");
    console.log("==========================================");

    console.log(
        "Loan ID:",
        repaymentRecord.loanId
    );

    console.log(
        "Payment Date:",
        repaymentRecord.paymentDate
    );

    console.log(
        "Repayment Type:",
        repaymentRecord.repaymentType
    );

    console.log(
        "Amount:",
        repaymentRecord.amount
    );

    console.log(
        "Principal:",
        repaymentRecord.principalAmount
    );

    console.log(
        "Interest:",
        repaymentRecord.interestAmount
    );

    console.log(
        "Outstanding Before:",
        repaymentRecord.outstandingBefore
    );

    console.log(
        "Outstanding After:",
        repaymentRecord.outstandingAfter
    );

    console.log(
        "Transaction IDs:",
        repaymentRecord.transactionIds
    );

    console.log(
        "Balance Tenure:",
        repaymentRecord.balanceTenureBefore,
        "months"
    );

    console.log("------------------------------------------");
    console.log(
        "Firestore WRITE:",
        "❌ NOT PERFORMED"
    );

    console.log(
        "Loan Balance Changed:",
        "❌ NO"
    );

    console.log(
        "Transaction Changed:",
        "❌ NO"
    );

    console.log("==========================================");
    console.log("✅ REPAYMENT STRUCTURE TEST COMPLETE");
    console.log("==========================================");

    return repaymentRecord;
}

window.testHomeLoanRepaymentRecord =
    testHomeLoanRepaymentRecord;


    // =========================================================
// SAVE: HOME LOAN EXTRA PRINCIPAL REPAYMENT
// =========================================================

async function saveHomeLoanExtraPrincipalRepayment() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    const loanId = "6pW3C6C0VVSwaoWfOozf";

    const transactionIds = [
        "1lvoH15hmGXZh9bd7Mbz",
        "o9Jg1hKO4otPibrmt9J1"
    ];

    const extraPrincipal = 20000;

    // -----------------------------------------
    // GET LOAN
    // -----------------------------------------

    const loansRef = getLoansCollectionRef();
    const loanSnapshot = await getDocs(loansRef);

    let homeLoanDoc = null;
    let homeLoan = null;

    loanSnapshot.forEach((loanDoc) => {

        if (loanDoc.id !== loanId) {
            return;
        }

        homeLoanDoc = loanDoc;
        homeLoan = loanDoc.data();
    });

    if (!homeLoanDoc || !homeLoan) {
        console.log("❌ Home Loan not found");
        return;
    }

    // -----------------------------------------
    // CHECK DUPLICATE REPAYMENT
    // -----------------------------------------

    const repaymentsRef = collection(
        db,
        "users",
        userId,
        "loanRepayments"
    );

    const repaymentSnapshot =
        await getDocs(repaymentsRef);

    let alreadyLinked = false;
    let existingRepaymentId = "";

    repaymentSnapshot.forEach((repaymentDoc) => {

        const repayment = repaymentDoc.data();

        const existingIds =
            repayment.transactionIds || [];

        const matchingIds =
            transactionIds.filter(id =>
                existingIds.includes(id)
            );

        if (matchingIds.length > 0) {

            alreadyLinked = true;
            existingRepaymentId = repaymentDoc.id;
        }
    });

    if (alreadyLinked) {

        console.log(
            "⚠️ THESE TRANSACTIONS ARE ALREADY LINKED."
        );

        console.log(
            "Existing Repayment ID:",
            existingRepaymentId
        );

        console.log(
            "❌ NO NEW RECORD CREATED"
        );

        return;
    }

    // -----------------------------------------
    // CURRENT OUTSTANDING
    // -----------------------------------------

    const outstandingBefore =
        Number(homeLoan.outstandingBalance || 0);

    const outstandingAfter =
        outstandingBefore - extraPrincipal;

    // -----------------------------------------
    // CREATE REPAYMENT RECORD
    // -----------------------------------------

    const repaymentRecord = {

        loanId: loanId,

        paymentDate: "2026-09-25",

        dueDate: "2026-09-10",

        repaymentType: "extra_principal",

        amount: extraPrincipal,

        emiAmount: 0,

        principalAmount: extraPrincipal,

        interestAmount: 0,

        prepaymentAmount: extraPrincipal,

        outstandingBefore: outstandingBefore,

        outstandingAfter: outstandingAfter,

        transactionIds: transactionIds,

        balanceTenureBefore:
            Number(homeLoan.remainingTenure || 0),

        source: "ERP Transaction Entry",

        status: "completed",

        createdAt: new Date(),

        createdBy: userId,

        updatedAt: new Date(),

        updatedBy: userId
    };

    // -----------------------------------------
    // SAVE REPAYMENT
    // -----------------------------------------

    const repaymentDoc =
        await addDoc(
            repaymentsRef,
            repaymentRecord
        );

    // -----------------------------------------
    // UPDATE LOAN BALANCE
    // -----------------------------------------

    await updateDoc(
        doc(loansRef, loanId),
        {
            outstandingBalance: outstandingAfter,

            updatedAt: new Date(),

            updatedBy: userId
        }
    );

    // -----------------------------------------
    // SUCCESS
    // -----------------------------------------

    console.log("==========================================");
    console.log("✅ HOME LOAN REPAYMENT SAVED");
    console.log("==========================================");

    console.log(
        "Repayment ID:",
        repaymentDoc.id
    );

    console.log(
        "Extra Principal:",
        extraPrincipal
    );

    console.log(
        "Outstanding Before:",
        outstandingBefore
    );

    console.log(
        "Outstanding After:",
        outstandingAfter
    );

    console.log(
        "Transaction IDs:",
        transactionIds
    );

    console.log(
        "Loan Balance Updated:",
        "YES"
    );

    console.log(
        "Transactions Changed:",
        "NO"
    );

    console.log("==========================================");
}

window.saveHomeLoanExtraPrincipalRepayment =
    saveHomeLoanExtraPrincipalRepayment;

    // =========================================================
// TEST: LOAN REPAYMENT WRITE PERMISSION
// =========================================================

async function testLoanRepaymentWritePermission() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    const repaymentsRef = collection(
        db,
        "users",
        userId,
        "loanRepayments"
    );

    const testRecord = {
        test: true,
        createdAt: new Date(),
        createdBy: userId
    };

    try {

        const testDoc = await addDoc(
            repaymentsRef,
            testRecord
        );

        console.log("==========================================");
        console.log("✅ LOAN REPAYMENT WRITE PERMISSION PASSED");
        console.log("Test Document ID:", testDoc.id);
        console.log("==========================================");

        // तुरंत test document delete करें
        await deleteDoc(testDoc.ref);

        console.log(
            "✅ TEST DOCUMENT DELETED SUCCESSFULLY"
        );

        console.log(
            "No actual loan repayment was created."
        );

    } catch (error) {

        console.error(
            "❌ LOAN REPAYMENT WRITE FAILED:",
            error
        );
    }
}

window.testLoanRepaymentWritePermission =
    testLoanRepaymentWritePermission;


// =========================================================
// SAFE SAVE: HOME LOAN EXTRA PRINCIPAL
// =========================================================

async function saveHomeLoanExtraPrincipalRepaymentSafe() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    const loanId = "6pW3C6C0VVSwaoWfOozf";

    const transactionIds = [
        "1lvoH15hmGXZh9bd7Mbz",
        "o9Jg1hKO4otPibrmt9J1"
    ];

    const extraPrincipal = 20000;

    try {

        // =========================================
        // LOAN REFERENCE
        // =========================================

        const loanRef = doc(
            db,
            "users",
            userId,
            "loans",
            loanId
        );

        // =========================================
        // REPAYMENT COLLECTION
        // =========================================

        const repaymentsRef = collection(
            db,
            "users",
            userId,
            "loanRepayments"
        );

        // =========================================
        // READ CURRENT LOAN
        // =========================================

        const loanSnapshot = await getDoc(loanRef);

        if (!loanSnapshot.exists()) {

            console.log(
                "❌ HOME LOAN NOT FOUND"
            );

            return;
        }

        const loan = loanSnapshot.data();

        const openingOutstanding =
            Number(
                loan.outstandingBalance || 0
            );

        const balanceTenure =
            Number(
                loan.remainingTenure || 0
            );

        const closingOutstanding =
            openingOutstanding -
            extraPrincipal;

        if (closingOutstanding < 0) {

            console.log(
                "❌ INVALID REPAYMENT AMOUNT"
            );

            return;
        }

        // =========================================
        // DUPLICATE CHECK
        // =========================================

        const existingSnapshot =
            await getDocs(repaymentsRef);

        let duplicateFound = false;

        existingSnapshot.forEach(
            (repaymentDoc) => {

                const repayment =
                    repaymentDoc.data();

                const existingIds =
                    repayment.transactionIds || [];

                const matched =
                    transactionIds.some(
                        id =>
                            existingIds.includes(id)
                    );

                if (matched) {
                    duplicateFound = true;
                }
            }
        );

        if (duplicateFound) {

            console.log(
                "❌ DUPLICATE REPAYMENT FOUND"
            );

            console.log(
                "Save cancelled for safety."
            );

            return;
        }

        // =========================================
        // REPAYMENT RECORD
        // =========================================

        // =============================================
// SAFE ROI SAVE VERIFICATION
// =============================================

const roiSaveCheck =
    confirm(
        "🔍 REPAYMENT ROI VERIFICATION\n\n" +
        "Payment Date: " +
        (paymentDate?.value || "") +
        "\n" +
        "ROI Applied: " +
        Number(annualRate).toFixed(2) +
        "%\n\n" +
        "क्या यही ROI rateApplied में save करना है?"
    );

if (!roiSaveCheck) {
    return;
}

        const repaymentRecord = {

            loanId: loanId,

            paymentDate: "2026-09-25",

            dueDate: null,

            repaymentType:
                "extra_principal",

            amount:
                extraPrincipal,

            emiAmount: 0,

            principalAmount:
                extraPrincipal,

            interestAmount: 0,

            prepaymentAmount:
                extraPrincipal,

            outstandingBefore:
                openingOutstanding,

            outstandingAfter:
                closingOutstanding,

            transactionIds:
                transactionIds,

            balanceTenureBefore:
                balanceTenure,

            source:
                "ERP Transaction Entry",

            status:
                "completed",

            createdAt:
                serverTimestamp(),

            createdBy:
                userId,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                userId
        };

        // =========================================
        // STEP 1: SAVE REPAYMENT RECORD
        // =========================================

        const repaymentDoc =
            await addDoc(
                repaymentsRef,
                repaymentRecord
            );

        console.log(
            "✅ REPAYMENT RECORD CREATED"
        );

        console.log(
            "Repayment ID:",
            repaymentDoc.id
        );

        // =========================================
        // STEP 2: UPDATE LOAN BALANCE
        // =========================================

        await updateDoc(
            loanRef,
            {
                outstandingBalance:
                    closingOutstanding,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    userId
            }
        );

        console.log(
            "✅ LOAN BALANCE UPDATED"
        );

        // =========================================
        // FINAL RESULT
        // =========================================

        console.log("==========================================");
        console.log("🎉 HOME LOAN EXTRA PRINCIPAL SAVED");
        console.log("==========================================");

        console.log(
            "Loan ID:",
            loanId
        );

        console.log(
            "Payment Date:",
            "25-09-2026"
        );

        console.log(
            "Extra Principal:",
            "₹20,000"
        );

        console.log(
            "Outstanding Before:",
            "₹" +
            openingOutstanding.toLocaleString("en-IN")
        );

        console.log(
            "Outstanding After:",
            "₹" +
            closingOutstanding.toLocaleString("en-IN")
        );

        console.log(
            "Balance Tenure:",
            balanceTenure,
            "months"
        );

        console.log(
            "Linked Transactions:",
            transactionIds
        );

        console.log("==========================================");

    } catch (error) {

        console.error(
            "❌ HOME LOAN REPAYMENT SAVE FAILED:",
            error
        );

        console.log(
            "⚠️ Please verify Firestore before retrying."
        );
    }
}

window.saveHomeLoanExtraPrincipalRepaymentSafe =
    saveHomeLoanExtraPrincipalRepaymentSafe;

// =========================================================
// TEST: HOME LOAN NEXT EMI CALCULATION
// NO FIRESTORE WRITE
// =========================================================

async function testHomeLoanNextEMICalculation() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    const loanId = "6pW3C6C0VVSwaoWfOozf";

    try {

        // =========================================
        // READ HOME LOAN
        // =========================================

        const loanRef = doc(
            db,
            "users",
            userId,
            "loans",
            loanId
        );

        const loanSnapshot =
            await getDoc(loanRef);

        if (!loanSnapshot.exists()) {

            console.log(
                "❌ HOME LOAN NOT FOUND"
            );

            return;
        }

        const loan =
            loanSnapshot.data();

        // =========================================
        // CURRENT LOAN VALUES
        // =========================================

        const outstanding =
            Number(
                loan.outstandingBalance || 0
            );

        const annualRate =
            Number(
                loan.interestRate || 0
            );

        const emi =
            Number(
                loan.emi || 0
            );

        const emiDay =
            Number(
                loan.emiDay || 10
            );

        // =========================================
        // CALCULATE NEXT EMI DATE
        // =========================================

        const today =
            new Date();

        let nextEMIDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                emiDay
            );

        if (
            today.getDate() >
            emiDay
        ) {

            nextEMIDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    emiDay
                );
        }

        // =========================================
        // PREVIOUS EMI DATE
        // =========================================

        const previousEMIDate =
            new Date(
                nextEMIDate.getFullYear(),
                nextEMIDate.getMonth() - 1,
                emiDay
            );

        // =========================================
        // ACTUAL DAYS
        // =========================================

        const millisecondsPerDay =
            1000 * 60 * 60 * 24;

        const actualDays =
            Math.round(
                (
                    nextEMIDate -
                    previousEMIDate
                ) /
                millisecondsPerDay
            );

        // =========================================
        // INTEREST CALCULATION
        // =========================================

        const interest =
            outstanding *
            (annualRate / 100) *
            actualDays /
            365;

        // =========================================
        // PRINCIPAL
        // =========================================

        const principal =
            emi -
            interest;

        // =========================================
        // CLOSING OUTSTANDING
        // =========================================

        const closingOutstanding =
            outstanding -
            principal;

        // =========================================
        // DISPLAY
        // =========================================

        console.log("==========================================");
        console.log("🏦 HOME LOAN NEXT EMI CALCULATION TEST");
        console.log("==========================================");

        console.log(
            "Loan ID:",
            loanId
        );

        console.log(
            "Outstanding:",
            outstanding
        );

        console.log(
            "Interest Rate:",
            annualRate + "%"
        );

        console.log(
            "EMI:",
            emi
        );

        console.log(
            "Previous EMI Date:",
            previousEMIDate
                .toLocaleDateString("en-GB")
        );

        console.log(
            "Next EMI Date:",
            nextEMIDate
                .toLocaleDateString("en-GB")
        );

        console.log(
            "Actual Days:",
            actualDays
        );

        console.log(
            "Calculated Interest:",
            interest.toFixed(2)
        );

        console.log(
            "Calculated Principal:",
            principal.toFixed(2)
        );

        console.log(
            "Calculated Closing Outstanding:",
            closingOutstanding.toFixed(2)
        );

        console.log("------------------------------------------");

        console.log(
            "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
        );

        console.log(
            "Loan Balance Changed: ❌ NO"
        );

        console.log(
            "Transaction Changed: ❌ NO"
        );

        console.log("==========================================");

        return {

            loanId,

            outstanding,

            annualRate,

            emi,

            previousEMIDate,

            nextEMIDate,

            actualDays,

            interest,

            principal,

            closingOutstanding,

            firestoreWrite:
                false

        };

    } catch (error) {

        console.error(
            "❌ EMI CALCULATION TEST FAILED:",
            error
        );
    }
}

window.testHomeLoanNextEMICalculation =
    testHomeLoanNextEMICalculation;

    // =========================================================
// DIAGNOSTIC: AXIS HOME LOAN 10-09-2026 EMI
// READ / CALCULATION ONLY - NO FIRESTORE WRITE
// =========================================================

function testAxisHomeLoanSeptemberEMI() {

    // =========================================
    // ACTUAL AXIS SCHEDULE VALUES
    // =========================================

    const openingPrincipal = 4360488;

    const emi = 51240;

    const actualInterest = 27495;

    const actualPrincipal = 23745;

    const closingPrincipal = 4336743;

    const annualRate = 7.40;

    const previousEMIDate =
        new Date(2026, 7, 10);   // 10-08-2026

    const emiDate =
        new Date(2026, 8, 10);   // 10-09-2026

    // =========================================
    // ACTUAL DAYS
    // =========================================

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const actualDays =
        Math.round(
            (
                emiDate -
                previousEMIDate
            ) /
            millisecondsPerDay
        );

    // =========================================
    // OUR STANDARD 365-DAY CALCULATION
    // =========================================

    const calculatedInterest =
        openingPrincipal *
        (annualRate / 100) *
        actualDays /
        365;

    // =========================================
    // IMPLIED RATE FROM BANK INTEREST
    // =========================================

    const impliedAnnualRate =
        (
            actualInterest *
            365
        ) /
        (
            openingPrincipal *
            actualDays
        ) *
        100;

    // =========================================
    // IMPLIED DAYS AT 7.40%
    // =========================================

    const impliedDays =
        (
            actualInterest *
            365
        ) /
        (
            openingPrincipal *
            (annualRate / 100)
        );

    // =========================================
    // EMI CHECK
    // =========================================

    const calculatedPrincipal =
        emi -
        actualInterest;

    const calculatedClosing =
        openingPrincipal -
        actualPrincipal;

    // =========================================
    // DISPLAY
    // =========================================

    console.log("==========================================");
    console.log("🏦 AXIS HOME LOAN — SEPTEMBER EMI DIAGNOSTIC");
    console.log("==========================================");

    console.log(
        "Opening Principal:",
        "₹" + openingPrincipal.toLocaleString("en-IN")
    );

    console.log(
        "EMI:",
        "₹" + emi.toLocaleString("en-IN")
    );

    console.log(
        "Bank Interest:",
        "₹" + actualInterest.toLocaleString("en-IN")
    );

    console.log(
        "Bank Principal:",
        "₹" + actualPrincipal.toLocaleString("en-IN")
    );

    console.log(
        "Bank Closing:",
        "₹" + closingPrincipal.toLocaleString("en-IN")
    );

    console.log("------------------------------------------");

    console.log(
        "Rate Used:",
        annualRate + "%"
    );

    console.log(
        "Period:",
        "10-08-2026 → 10-09-2026"
    );

    console.log(
        "Actual Days:",
        actualDays
    );

    console.log("------------------------------------------");

    console.log(
        "Our 7.40% / 365 Interest:",
        "₹" + calculatedInterest.toFixed(2)
    );

    console.log(
        "Bank Interest:",
        "₹" + actualInterest.toFixed(2)
    );

    console.log(
        "Difference:",
        "₹" +
        (
            actualInterest -
            calculatedInterest
        ).toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "Implied Annual Rate:",
        impliedAnnualRate.toFixed(6) + "%"
    );

    console.log(
        "Implied Days at 7.40%:",
        impliedDays.toFixed(6)
    );

    console.log("------------------------------------------");

    console.log(
        "EMI Principal Check:",
        "₹" + calculatedPrincipal.toFixed(2)
    );

    console.log(
        "Closing Balance Check:",
        "₹" + calculatedClosing.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
    );

    console.log(
        "Loan Balance Changed: ❌ NO"
    );

    console.log(
        "Transaction Changed: ❌ NO"
    );

    console.log("==========================================");

    return {

        openingPrincipal,

        emi,

        actualInterest,

        actualPrincipal,

        closingPrincipal,

        annualRate,

        actualDays,

        calculatedInterest,

        impliedAnnualRate,

        impliedDays,

        firestoreWrite: false
    };
}

window.testAxisHomeLoanSeptemberEMI =
    testAxisHomeLoanSeptemberEMI;


    // =========================================================
// TEST: HOME LOAN EMI WITH MID-CYCLE EXTRA PRINCIPAL
// 10-09-2026 → 25-09-2026 → 10-10-2026
// NO FIRESTORE WRITE
// =========================================================

function testHomeLoanSplitPeriodEMI() {

    // =========================================
    // STARTING BALANCE AFTER 10-09-2026 EMI
    // =========================================

    const openingOutstanding =
        4336743;

    // =========================================
    // EXTRA PRINCIPAL PAID ON 25-09-2026
    // =========================================

    const extraPrincipal =
        20000;

    // =========================================
    // LOAN RATE
    // =========================================

    const annualRate =
        7.40;

    // =========================================
    // EMI
    // =========================================

    const emi =
        51240;

    // =========================================
    // DATES
    // =========================================

    const previousEMIDate =
        new Date(2026, 8, 10); // 10-09-2026

    const extraPrincipalDate =
        new Date(2026, 8, 25); // 25-09-2026

    const nextEMIDate =
        new Date(2026, 9, 10); // 10-10-2026

    // =========================================
    // DAYS CALCULATOR
    // =========================================

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const daysBeforePrepayment =
        Math.round(
            (
                extraPrincipalDate -
                previousEMIDate
            ) /
            millisecondsPerDay
        );

    const daysAfterPrepayment =
        Math.round(
            (
                nextEMIDate -
                extraPrincipalDate
            ) /
            millisecondsPerDay
        );

    // =========================================
    // BALANCE AFTER PREPAYMENT
    // =========================================

    const balanceAfterPrepayment =
        openingOutstanding -
        extraPrincipal;

    // =========================================
    // INTEREST — PERIOD 1
    // =========================================

    const interestBeforePrepayment =
        openingOutstanding *
        (annualRate / 100) *
        daysBeforePrepayment /
        365;

    // =========================================
    // INTEREST — PERIOD 2
    // =========================================

    const interestAfterPrepayment =
        balanceAfterPrepayment *
        (annualRate / 100) *
        daysAfterPrepayment /
        365;

    // =========================================
    // TOTAL INTEREST
    // =========================================

    const totalInterest =
        interestBeforePrepayment +
        interestAfterPrepayment;

    // =========================================
    // EMI PRINCIPAL
    // =========================================

    const emiPrincipal =
        emi -
        totalInterest;

    // =========================================
    // CLOSING BALANCE
    // =========================================

    const closingOutstanding =
        balanceAfterPrepayment -
        emiPrincipal;

    // =========================================
    // DISPLAY
    // =========================================

    console.log("==========================================");
    console.log(
        "🏦 HOME LOAN SPLIT-PERIOD EMI TEST"
    );
    console.log("==========================================");

    console.log(
        "Opening Outstanding:",
        "₹" +
        openingOutstanding.toLocaleString("en-IN")
    );

    console.log(
        "Interest Rate:",
        annualRate + "%"
    );

    console.log(
        "EMI:",
        "₹" +
        emi.toLocaleString("en-IN")
    );

    console.log("------------------------------------------");

    console.log(
        "PERIOD 1:"
    );

    console.log(
        "10-09-2026 → 25-09-2026"
    );

    console.log(
        "Days:",
        daysBeforePrepayment
    );

    console.log(
        "Principal:",
        "₹" +
        openingOutstanding.toLocaleString("en-IN")
    );

    console.log(
        "Interest:",
        "₹" +
        interestBeforePrepayment.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "EXTRA PRINCIPAL:"
    );

    console.log(
        "Date:",
        "25-09-2026"
    );

    console.log(
        "Extra Principal:",
        "₹" +
        extraPrincipal.toLocaleString("en-IN")
    );

    console.log(
        "Balance After Prepayment:",
        "₹" +
        balanceAfterPrepayment.toLocaleString("en-IN")
    );

    console.log("------------------------------------------");

    console.log(
        "PERIOD 2:"
    );

    console.log(
        "25-09-2026 → 10-10-2026"
    );

    console.log(
        "Days:",
        daysAfterPrepayment
    );

    console.log(
        "Principal:",
        "₹" +
        balanceAfterPrepayment.toLocaleString("en-IN")
    );

    console.log(
        "Interest:",
        "₹" +
        interestAfterPrepayment.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "TOTAL INTEREST:",
        "₹" +
        totalInterest.toFixed(2)
    );

    console.log(
        "EMI PRINCIPAL:",
        "₹" +
        emiPrincipal.toFixed(2)
    );

    console.log(
        "CLOSING OUTSTANDING:",
        "₹" +
        closingOutstanding.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
    );

    console.log(
        "Loan Balance Changed: ❌ NO"
    );

    console.log(
        "Transaction Changed: ❌ NO"
    );

    console.log("==========================================");

    return {

        openingOutstanding,

        extraPrincipal,

        balanceAfterPrepayment,

        daysBeforePrepayment,

        daysAfterPrepayment,

        interestBeforePrepayment,

        interestAfterPrepayment,

        totalInterest,

        emiPrincipal,

        closingOutstanding,

        firestoreWrite:
            false
    };
}

window.testHomeLoanSplitPeriodEMI =
    testHomeLoanSplitPeriodEMI;

// =========================================================
// TEST: AXIS SCHEDULE vs ERP ADJUSTED EMI
// 10-10-2026
// NO FIRESTORE WRITE
// =========================================================

function testHomeLoanScheduleVsAdjustedEMI() {

    // =========================================
    // AXIS SCHEDULED VALUES
    // =========================================

    const openingOutstanding =
        4336743;

    const emi =
        51240;

    const annualRate =
        7.40;

    // Axis scheduled calculation
    // No 25-09 prepayment considered
    const scheduledDays =
        30;

    const scheduledInterest =
        openingOutstanding *
        (annualRate / 100) *
        scheduledDays /
        365;

    const scheduledPrincipal =
        emi -
        scheduledInterest;

    const scheduledClosing =
        openingOutstanding -
        scheduledPrincipal;

    // =========================================
    // ERP ADJUSTED CALCULATION
    // ₹20,000 paid on 25-09-2026
    // =========================================

    const extraPrincipal =
        20000;

    const prepaymentDate =
        new Date(2026, 8, 25);

    const previousEMIDate =
        new Date(2026, 8, 10);

    const nextEMIDate =
        new Date(2026, 9, 10);

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const daysBeforePrepayment =
        Math.round(
            (
                prepaymentDate -
                previousEMIDate
            ) /
            millisecondsPerDay
        );

    const daysAfterPrepayment =
        Math.round(
            (
                nextEMIDate -
                prepaymentDate
            ) /
            millisecondsPerDay
        );

    const balanceAfterPrepayment =
        openingOutstanding -
        extraPrincipal;

    const interestBeforePrepayment =
        openingOutstanding *
        (annualRate / 100) *
        daysBeforePrepayment /
        365;

    const interestAfterPrepayment =
        balanceAfterPrepayment *
        (annualRate / 100) *
        daysAfterPrepayment /
        365;

    const adjustedInterest =
        interestBeforePrepayment +
        interestAfterPrepayment;

    const adjustedPrincipal =
        emi -
        adjustedInterest;

    const adjustedClosing =
        balanceAfterPrepayment -
        adjustedPrincipal;

    // =========================================
    // DIFFERENCES
    // =========================================

    const interestSaving =
        scheduledInterest -
        adjustedInterest;

    const principalIncrease =
        adjustedPrincipal -
        scheduledPrincipal;

    const closingDifference =
        scheduledClosing -
        adjustedClosing;

    // =========================================
    // DISPLAY
    // =========================================

    console.log("==========================================");
    console.log(
        "🏦 AXIS SCHEDULE vs ERP ADJUSTED EMI"
    );
    console.log("==========================================");

    console.log(
        "EMI Date:",
        "10-10-2026"
    );

    console.log(
        "Opening Outstanding:",
        "₹" +
        openingOutstanding.toLocaleString("en-IN")
    );

    console.log("------------------------------------------");

    console.log(
        "📘 AXIS SCHEDULE"
    );

    console.log(
        "Interest:",
        "₹" +
        scheduledInterest.toFixed(2)
    );

    console.log(
        "Principal:",
        "₹" +
        scheduledPrincipal.toFixed(2)
    );

    console.log(
        "Closing:",
        "₹" +
        scheduledClosing.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "📗 ERP ADJUSTED"
    );

    console.log(
        "Extra Principal Date:",
        "25-09-2026"
    );

    console.log(
        "Extra Principal:",
        "₹" +
        extraPrincipal.toLocaleString("en-IN")
    );

    console.log(
        "Interest:",
        "₹" +
        adjustedInterest.toFixed(2)
    );

    console.log(
        "Principal:",
        "₹" +
        adjustedPrincipal.toFixed(2)
    );

    console.log(
        "Closing:",
        "₹" +
        adjustedClosing.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "💰 INTEREST SAVING:",
        "₹" +
        interestSaving.toFixed(2)
    );

    console.log(
        "📈 EXTRA PRINCIPAL IN EMI:",
        "₹" +
        principalIncrease.toFixed(2)
    );

    console.log(
        "📉 CLOSING BALANCE DIFFERENCE:",
        "₹" +
        closingDifference.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "Expected Relationship:"
    );

    console.log(
        "₹20,000 Prepayment"
    );

    console.log(
        "+ Interest Saving"
    );

    console.log(
        "= Lower Closing Outstanding"
    );

    console.log("------------------------------------------");

    console.log(
        "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
    );

    console.log(
        "Loan Balance Changed: ❌ NO"
    );

    console.log(
        "Transaction Changed: ❌ NO"
    );

    console.log("==========================================");

    return {

        openingOutstanding,

        emi,

        scheduledInterest,

        scheduledPrincipal,

        scheduledClosing,

        extraPrincipal,

        adjustedInterest,

        adjustedPrincipal,

        adjustedClosing,

        interestSaving,

        principalIncrease,

        closingDifference,

        firestoreWrite:
            false
    };
}

window.testHomeLoanScheduleVsAdjustedEMI =
    testHomeLoanScheduleVsAdjustedEMI;

    // =========================================================
// TEST: GENERIC HOME LOAN EMI ENGINE
// MULTIPLE EXTRA PRINCIPAL PAYMENTS
// NO FIRESTORE WRITE
// =========================================================

function testGenericHomeLoanEMIEngine() {

    // =========================================
    // LOAN MASTER VALUES
    // =========================================

    let outstanding = 4336743;

    const annualRate = 7.40;

    const emi = 51240;

    const previousEMIDate =
        new Date(2026, 8, 10); // 10-09-2026

    const nextEMIDate =
        new Date(2026, 9, 10); // 10-10-2026

    // =========================================
    // EXTRA PRINCIPAL PAYMENTS
    //
    // Future में यही list dynamically आएगी
    // =========================================

    const extraPayments = [
        {
            date: new Date(2026, 8, 25),
            amount: 20000
        }
    ];

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    let currentDate =
        previousEMIDate;

    let totalInterest = 0;

    let totalExtraPrincipal = 0;

    console.log("==========================================");
    console.log(
        "🏦 GENERIC HOME LOAN EMI ENGINE TEST"
    );
    console.log("==========================================");

    console.log(
        "Opening Outstanding:",
        "₹" +
        outstanding.toLocaleString("en-IN")
    );

    console.log(
        "Rate:",
        annualRate + "%"
    );

    console.log(
        "EMI:",
        "₹" +
        emi.toLocaleString("en-IN")
    );

    console.log("------------------------------------------");

    // =========================================
    // SORT EXTRA PAYMENTS BY DATE
    // =========================================

    extraPayments.sort(
        (a, b) => a.date - b.date
    );

    // =========================================
    // PROCESS EACH EXTRA PAYMENT
    // =========================================

    for (
        const payment
        of extraPayments
    ) {

        // Ignore payments outside EMI period
        if (
            payment.date <= previousEMIDate ||
            payment.date >= nextEMIDate
        ) {
            continue;
        }

        // -----------------------------------------
        // DAYS BEFORE EXTRA PAYMENT
        // -----------------------------------------

        const days =
            Math.round(
                (
                    payment.date -
                    currentDate
                ) /
                millisecondsPerDay
            );

        // -----------------------------------------
        // INTEREST FOR THIS PERIOD
        // -----------------------------------------

        const periodInterest =
            outstanding *
            (annualRate / 100) *
            days /
            365;

        totalInterest +=
            periodInterest;

        // -----------------------------------------
        // DISPLAY PERIOD
        // -----------------------------------------

        console.log(
            "Period:",
            currentDate.toLocaleDateString("en-GB"),
            "→",
            payment.date.toLocaleDateString("en-GB")
        );

        console.log(
            "Days:",
            days
        );

        console.log(
            "Opening Principal:",
            "₹" +
            outstanding.toLocaleString("en-IN")
        );

        console.log(
            "Interest:",
            "₹" +
            periodInterest.toFixed(2)
        );

        // -----------------------------------------
        // APPLY EXTRA PRINCIPAL
        // -----------------------------------------

        outstanding -=
            payment.amount;

        totalExtraPrincipal +=
            payment.amount;

        console.log(
            "Extra Principal:",
            "₹" +
            payment.amount.toLocaleString("en-IN")
        );

        console.log(
            "Balance After Payment:",
            "₹" +
            outstanding.toLocaleString("en-IN")
        );

        console.log("------------------------------------------");

        currentDate =
            payment.date;
    }

    // =========================================
    // FINAL PERIOD
    // =========================================

    const finalDays =
        Math.round(
            (
                nextEMIDate -
                currentDate
            ) /
            millisecondsPerDay
        );

    const finalInterest =
        outstanding *
        (annualRate / 100) *
        finalDays /
        365;

    totalInterest +=
        finalInterest;

    console.log(
        "Period:",
        currentDate.toLocaleDateString("en-GB"),
        "→",
        nextEMIDate.toLocaleDateString("en-GB")
    );

    console.log(
        "Days:",
        finalDays
    );

    console.log(
        "Opening Principal:",
        "₹" +
        outstanding.toLocaleString("en-IN")
    );

    console.log(
        "Interest:",
        "₹" +
        finalInterest.toFixed(2)
    );

    console.log("------------------------------------------");

    // =========================================
    // EMI PRINCIPAL
    // =========================================

    const emiPrincipal =
        emi -
        totalInterest;

    // =========================================
    // FINAL OUTSTANDING
    // =========================================

    const closingOutstanding =
        outstanding -
        emiPrincipal;

    // =========================================
    // FINAL RESULT
    // =========================================

    console.log(
        "Total Extra Principal:",
        "₹" +
        totalExtraPrincipal.toLocaleString("en-IN")
    );

    console.log(
        "Total Interest:",
        "₹" +
        totalInterest.toFixed(2)
    );

    console.log(
        "EMI Principal:",
        "₹" +
        emiPrincipal.toFixed(2)
    );

    console.log(
        "Closing Outstanding:",
        "₹" +
        closingOutstanding.toFixed(2)
    );

    console.log("------------------------------------------");

    console.log(
        "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
    );

    console.log(
        "Loan Balance Changed: ❌ NO"
    );

    console.log(
        "Transaction Changed: ❌ NO"
    );

    console.log("==========================================");

    return {

        openingOutstanding: 4336743,

        totalExtraPrincipal,

        totalInterest,

        emi,

        emiPrincipal,

        closingOutstanding,

        firestoreWrite:
            false
    };
}

window.testGenericHomeLoanEMIEngine =
    testGenericHomeLoanEMIEngine;

    // =========================================================
// TEST: READ HOME LOAN EXTRA PRINCIPAL FROM TRANSACTIONS
// NO FIRESTORE WRITE
// =========================================================

async function testReadHomeLoanExtraPrincipalTransactions() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    try {

        const transactionsRef =
            collection(
                db,
                "users",
                userId,
                "transactions"
            );

        const snapshot =
            await getDocs(transactionsRef);

        const extraPayments = [];

        // =========================================
        // READ TRANSACTIONS
        // =========================================

        snapshot.forEach((transactionDoc) => {

            const transaction =
                transactionDoc.data();

            // -----------------------------------------
            // IGNORE DELETED TRANSACTIONS
            // -----------------------------------------

            if (
                transaction.deleted === true
            ) {
                return;
            }

            // -----------------------------------------
            // HOME LOAN PRINCIPAL PREPAYMENT
            // -----------------------------------------

            if (
                transaction.category ===
                "Home Loan-Principal Prepayment"
            ) {

                const amount =
                    Number(
                        transaction.amount || 0
                    );

                if (amount <= 0) {
                    return;
                }

                extraPayments.push({

                    transactionId:
                        transactionDoc.id,

                    date:
                        transaction.date ||
                        transaction.transactionDate ||
                        null,

                    amount,

                    fromAccountId:
                        transaction.fromAccountId ||
                        null,

                    party:
                        transaction.party ||
                        "",

                    notes:
                        transaction.notes ||
                        ""
                });
            }
        });

        // =========================================
        // SORT BY DATE
        // =========================================

        extraPayments.sort(
            (a, b) => {

                const dateA =
                    new Date(a.date);

                const dateB =
                    new Date(b.date);

                return dateA - dateB;
            }
        );

        // =========================================
        // TOTAL
        // =========================================

        const totalExtraPrincipal =
            extraPayments.reduce(
                (total, payment) =>
                    total + payment.amount,
                0
            );

        // =========================================
        // DISPLAY
        // =========================================

        console.log("==========================================");
        console.log(
            "🏦 HOME LOAN EXTRA PRINCIPAL TRANSACTIONS"
        );
        console.log("==========================================");

        console.log(
            "Transactions Found:",
            extraPayments.length
        );

        console.log("------------------------------------------");

        extraPayments.forEach(
            (payment, index) => {

                console.log(
                    `${index + 1}. Date:`,
                    payment.date
                );

                console.log(
                    "   Amount:",
                    "₹" +
                    payment.amount.toLocaleString("en-IN")
                );

                console.log(
                    "   Transaction ID:",
                    payment.transactionId
                );

                console.log(
                    "   From Account:",
                    payment.fromAccountId
                );

                console.log(
                    "   Party:",
                    payment.party
                );

                console.log(
                    "   Notes:",
                    payment.notes
                );

                console.log("------------------------------------------");
            }
        );

        console.log(
            "TOTAL EXTRA PRINCIPAL:",
            "₹" +
            totalExtraPrincipal.toLocaleString("en-IN")
        );

        console.log("------------------------------------------");

        console.log(
            "🔥 FIRESTORE WRITE: ❌ NOT PERFORMED"
        );

        console.log(
            "Transactions Changed: ❌ NO"
        );

        console.log(
            "Loan Balance Changed: ❌ NO"
        );

        console.log("==========================================");

        return {

            transactionsFound:
                extraPayments.length,

            extraPayments,

            totalExtraPrincipal,

            firestoreWrite:
                false
        };

    } catch (error) {

        console.error(
            "❌ TRANSACTION READ TEST FAILED:",
            error
        );
    }
}

window.testReadHomeLoanExtraPrincipalTransactions =
    testReadHomeLoanExtraPrincipalTransactions;


// =========================================================
// TEST: CHECK EXISTING HOME LOAN REPAYMENT
// =========================================================

async function testExistingHomeLoanRepayment() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const userId = auth.currentUser.uid;

    const repaymentsRef = collection(
        db,
        "users",
        userId,
        "loanRepayments"
    );

    const snapshot = await getDocs(repaymentsRef);

    let found = false;

    console.log("==========================================");
    console.log("🔎 EXISTING HOME LOAN REPAYMENT CHECK");
    console.log("==========================================");

    snapshot.forEach((repaymentDoc) => {

        const repayment = repaymentDoc.data();

        const transactionIds =
            repayment.transactionIds || [];

        const matches =
            transactionIds.includes(
                "1lvoH15hmGXZh9bd7Mbz"
            ) ||
            transactionIds.includes(
                "o9Jg1hKO4otPibrmt9J1"
            );

        if (matches) {

            found = true;

            console.log(
                "⚠️ EXISTING REPAYMENT FOUND"
            );

            console.log(
                "Repayment ID:",
                repaymentDoc.id
            );

            console.log(
                "Amount:",
                repayment.amount
            );

            console.log(
                "Outstanding Before:",
                repayment.outstandingBefore
            );

            console.log(
                "Outstanding After:",
                repayment.outstandingAfter
            );

            console.log(
                "Transaction IDs:",
                transactionIds
            );
        }
    });

    if (!found) {

        console.log(
            "✅ NO EXISTING REPAYMENT FOUND"
        );

        console.log(
            "Safe to proceed with first save."
        );
    }

    console.log("==========================================");

    return found;
}

window.testExistingHomeLoanRepayment =
    testExistingHomeLoanRepayment;

// =========================================================
// TEST - FIND SEPTEMBER HOME LOAN EXTRA PRINCIPAL TRANSACTIONS
// =========================================================

async function findHomeLoanExtraPrincipalTransactions() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
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

        const snapshot =
            await getDocs(transactionsRef);

        const matchedTransactions = [];

        snapshot.forEach((transactionDoc) => {

            const transaction =
                transactionDoc.data();

            const amount =
                Number(transaction.amount || 0);

            const date =
                transaction.date || "";

            // =========================================
            // FIND 15-09 ₹15,000
            // OR 25-09 ₹5,000
            // =========================================

            const is15Sep =
                date === "2026-09-15" &&
                amount === 15000;

            const is25Sep =
                date === "2026-09-25" &&
                amount === 5000;

            if (
                is15Sep ||
                is25Sep
            ) {

                matchedTransactions.push({
                    id: transactionDoc.id,
                    ...transaction
                });

            }

        });

        console.log(
            "🔎 HOME LOAN EXTRA PRINCIPAL TRANSACTIONS FOUND:"
        );

        console.table(
            matchedTransactions
        );

        console.log(
            "Total Matching Transactions:",
            matchedTransactions.length
        );

    }
    catch (error) {

        console.error(
            "❌ Transaction Search Error:",
            error
        );

    }

}


// =========================================================
// EXPOSE TEST FUNCTION
// =========================================================

window.findHomeLoanExtraPrincipalTransactions =
    findHomeLoanExtraPrincipalTransactions;

    // =========================================================
// TEST - SHOW ALL SEPTEMBER 15 & 25 TRANSACTIONS
// =========================================================

async function testSeptemberLoanTransactions() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
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

        const snapshot =
            await getDocs(transactionsRef);

        const results = [];

        snapshot.forEach((transactionDoc) => {

            const transaction =
                transactionDoc.data();

            const date =
                transaction.date || "";

            // केवल 15 और 25 September
            if (
                date === "2026-09-15" ||
                date === "2026-09-25"
            ) {

                results.push({
                    id: transactionDoc.id,
                    date: transaction.date || "",
                    type: transaction.type || "",
                    category: transaction.category || "",
                    amount: transaction.amount || 0,
                    partyName: transaction.partyName || "",
                    fromAccountId:
                        transaction.fromAccountId || "",
                    toAccountId:
                        transaction.toAccountId || "",
                    notes: transaction.notes || "",
                    behavior:
                        transaction.behavior || ""
                });

            }

        });

        console.log(
            "🔎 SEPTEMBER 15 & 25 TRANSACTIONS:"
        );

        console.table(results);

        console.log(
            "Total Found:",
            results.length
        );

    }
    catch (error) {

        console.error(
            "❌ Search Error:",
            error
        );

    }

}


// =========================================================
// EXPOSE TEST
// =========================================================

window.testSeptemberLoanTransactions =
    testSeptemberLoanTransactions;

    async function findAllSeptemberHomeLoanTransactions() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const transactionsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "transactions"
    );

    const snapshot = await getDocs(transactionsRef);

    const results = [];

    snapshot.forEach((transactionDoc) => {

        const transaction = transactionDoc.data();

        const date = transaction.date || "";
        const category = String(transaction.category || "").toLowerCase();
        const partyName = String(transaction.partyName || "").toLowerCase();
        const notes = String(transaction.notes || "").toLowerCase();
        const amount = Number(transaction.amount || 0);

        // September 2026 only
        if (!date.startsWith("2026-09")) {
            return;
        }

        // Find anything related to Home Loan OR the expected amounts
        const isHomeLoan =
            category.includes("home loan") ||
            partyName.includes("home loan") ||
            notes.includes("home loan");

        const isExpectedAmount =
            amount === 5000 ||
            amount === 10000 ||
            amount === 15000 ||
            amount === 20000;

        if (isHomeLoan || isExpectedAmount) {

            results.push({
                id: transactionDoc.id,
                date: transaction.date || "",
                type: transaction.type || "",
                category: transaction.category || "",
                amount: amount,
                partyName: transaction.partyName || "",
                fromAccountId: transaction.fromAccountId || "",
                toAccountId: transaction.toAccountId || "",
                notes: transaction.notes || "",
                behavior: transaction.behavior || ""
            });
        }
    });

    results.sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
    );

    console.log("🔎 ALL SEPTEMBER HOME LOAN RELATED TRANSACTIONS:");
    console.table(results);

    console.log("Total Found:", results.length);
}

window.findAllSeptemberHomeLoanTransactions =
    findAllSeptemberHomeLoanTransactions;

    async function verifyCorrectedHomeLoanTransactions() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    const transactionsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "transactions"
    );

    const snapshot = await getDocs(transactionsRef);

    const results = [];

    snapshot.forEach((transactionDoc) => {

        const t = transactionDoc.data();

        if (
            t.date === "2026-09-18" ||
            t.date === "2026-09-25"
        ) {

            const amount = Number(t.amount || 0);

            if (
                amount === 15000 ||
                amount === 10000 ||
                amount === 5000
            ) {
                results.push({
                    id: transactionDoc.id,
                    date: t.date || "",
                    type: t.type || "",
                    category: t.category || "",
                    amount: amount,
                    partyName: t.partyName || "",
                    fromAccountId: t.fromAccountId || "",
                    toAccountId: t.toAccountId || "",
                    notes: t.notes || "",
                    behavior: t.behavior || ""
                });
            }
        }
    });

    results.sort((a, b) => {
        return a.date.localeCompare(b.date);
    });

    console.log("✅ CORRECTED HOME LOAN RELATED ENTRIES:");
    console.table(results);

    console.log("Total Found:", results.length);
}

window.verifyCorrectedHomeLoanTransactions =
    verifyCorrectedHomeLoanTransactions;

// =========================================================
// TEST - READ SELECTED LOAN FROM FIRESTORE
// =========================================================

async function testSelectedHomeLoanData() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    try {

        const loansRef = getLoansCollectionRef();

        const loansSnapshot = await getDocs(loansRef);

        let homeLoanFound = false;

        loansSnapshot.forEach((loanDoc) => {

            const loan = loanDoc.data();

            if (
                loan.loanType === "Home Loan" &&
                loan.status === "active"
            ) {

                homeLoanFound = true;

                console.log("=================================");
                console.log("🏠 HOME LOAN FIRESTORE TEST");
                console.log("=================================");

                console.log("Document ID:", loanDoc.id);
                console.log("Loan Type:", loan.loanType);
                console.log("Loan Name:", loan.loanName);
                console.log("Lender:", loan.lender);
                console.log("Original Amount:", loan.originalAmount);
                console.log("Outstanding Balance:", loan.outstandingBalance);
                console.log("Interest Rate:", loan.interestRate);
                console.log("EMI:", loan.emi);
                console.log("Start Date:", loan.startDate);
                console.log("Original Tenure:", loan.originalTenure);
                console.log("Remaining Tenure:", loan.remainingTenure);
                console.log("EMI Day:", loan.emiDay);
                console.log("Extra Principal:", loan.extraPrincipal);
                console.log("Payment Account:", loan.paymentAccount);
                console.log("Status:", loan.status);

                console.log("FULL FIRESTORE OBJECT:", loan);

            }

        });

        if (!homeLoanFound) {

            console.log(
                "❌ Active Home Loan Firestore record नहीं मिला."
            );

        }

    } catch (error) {

        console.error(
            "❌ Home Loan Firestore test error:",
            error
        );

    }

}


// Make test available in browser console
window.testSelectedHomeLoanData =
    testSelectedHomeLoanData;

// =========================================================
// LOAD HOME LOAN DATA INTO REPAYMENT DASHBOARD
// FINAL CLEAN VERSION
// =========================================================

async function loadHomeLoanRepaymentDashboard() {

    if (!auth.currentUser) {

        console.log(
            "❌ User not logged in"
        );

        return;

    }


    try {

        // =================================================
        // GET ALL LOANS
        // =================================================

        const loansRef =
            getLoansCollectionRef();


        const loansSnapshot =
            await getDocs(
                loansRef
            );


        let homeLoan = null;


        loansSnapshot.forEach(
            (loanDoc) => {

                const loan =
                    loanDoc.data();


                if (
                    loan.loanType ===
                        "Home Loan"
                    &&
                    loan.status ===
                        "active"
                ) {

                    homeLoan = {

                        id:
                            loanDoc.id,

                        ...loan

                    };

                }

            }
        );


        if (!homeLoan) {

            console.log(
                "❌ Active Home Loan नहीं मिला"
            );

            return;

        }


        // =================================================
        // MONEY FORMATTER
        // =================================================

        const money =
            (value) => {

                return "₹" +
                    Number(
                        value || 0
                    ).toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 2
                        }
                    );

            };


        // =================================================
        // DASHBOARD SUMMARY
        // =================================================

        const balance =
            document.getElementById(
                "repaymentCurrentBalance"
            );


        const emi =
            document.getElementById(
                "repaymentCurrentEMI"
            );


        const rate =
            document.getElementById(
                "repaymentCurrentRate"
            );


        const nextEmi =
            document.getElementById(
                "repaymentNextEMIDate"
            );


        if (balance) {

            balance.textContent =
                money(
                    homeLoan.outstandingBalance
                );

        }


        if (emi) {

            emi.textContent =
                money(
                    homeLoan.emi
                );

        }


        if (rate) {

            rate.textContent =
                Number(
                    homeLoan.interestRate || 0
                ).toFixed(2)
                + "%";

        }


        // =================================================
        // LEFT HOME LOAN CARD
        // =================================================

        const homeLoanCardBalance =
            document.getElementById(
                "repaymentHomeLoanBalance"
            );


        const homeLoanCardEMI =
            document.getElementById(
                "repaymentHomeLoanEMI"
            );


        if (homeLoanCardBalance) {

            homeLoanCardBalance.textContent =
                money(
                    homeLoan.outstandingBalance
                );

        }


        if (homeLoanCardEMI) {

            homeLoanCardEMI.textContent =
                money(
                    homeLoan.emi
                );

        }


        // =================================================
        // CALCULATE NEXT EMI DATE
        // =================================================

        const emiDay =
            Number(
                homeLoan.emiDay || 10
            );


        const today =
            new Date();


        let nextEMIDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                emiDay
            );


        if (
            today.getDate() >
            emiDay
        ) {

            nextEMIDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    emiDay
                );

        }


        const formattedNextEMIDate =

            String(
                nextEMIDate.getDate()
            ).padStart(2, "0")

            + "-"

            +

            String(
                nextEMIDate.getMonth() + 1
            ).padStart(2, "0")

            + "-"

            +

            nextEMIDate.getFullYear();


        if (nextEmi) {

            nextEmi.textContent =
                formattedNextEMIDate;

        }


        // =================================================
        // REPAYMENT PROGRESS SUMMARY
// =================================================

const repaymentUserId =
    auth.currentUser.uid;

const repaymentSummaryRef =
    collection(
        db,
        "users",
        repaymentUserId,
        "loanRepayments"
    );

const repaymentSummarySnapshot =
    await getDocs(
        repaymentSummaryRef
    );

let totalPrincipalPaid = 0;
let totalInterestPaid = 0;
let totalExtraPrincipal = 0;

repaymentSummarySnapshot.forEach(
    (repaymentDoc) => {

        const repayment =
            repaymentDoc.data();

        // Only current Home Loan
        if (
            repayment.loanId !==
            homeLoan.id
        ) {
            return;
        }

        const repaymentType =
            repayment.repaymentType || "";

        const principal =
            Number(
                repayment.principalAmount || 0
            );

        const interest =
            Number(
                repayment.interestAmount || 0
            );

        const prepayment =
            Number(
                repayment.prepaymentAmount || 0
            );


// =============================================
// TOTAL PRINCIPAL + INTEREST PAID
// =============================================

totalPrincipalPaid +=
    principal;

totalInterestPaid +=
    interest;


// =============================================
// EXTRA PRINCIPAL / PREPAYMENT
// =============================================

if (
    repaymentType ===
        "principal_prepayment"
    ||
    repaymentType ===
        "part_prepayment"
    ||
    repaymentType ===
        "extra_principal"
) {

    totalExtraPrincipal +=
        prepayment;

}
    }
);


// =================================================
// UPDATE LOAN PROGRESS UI
// =================================================

const principalPaidElement =
    document.getElementById(
        "loanDashboardPrincipalPaid"
    );

const interestPaidElement =
    document.getElementById(
        "loanDashboardInterestPaid"
    );

const prepaymentElement =
    document.getElementById(
        "loanDashboardPrepayment"
    );


if (principalPaidElement) {

    principalPaidElement.textContent =
        money(
            totalPrincipalPaid
        );

}


if (interestPaidElement) {

    interestPaidElement.textContent =
        money(
            totalInterestPaid
        );

}


if (prepaymentElement) {

    prepaymentElement.textContent =
        money(
            totalExtraPrincipal
        );

}

// =================================================
// LATEST HOME LOAN REPAYMENT
// =================================================

const latestRepaymentsRef =
    collection(
        db,
        "users",
        repaymentUserId,
        "loanRepayments"
    );

const latestRepaymentsSnapshot =
    await getDocs(
        latestRepaymentsRef
    );

const homeLoanRepayments = [];

latestRepaymentsSnapshot.forEach(
    (repaymentDoc) => {

        const repayment =
            repaymentDoc.data();

        // Only current Home Loan
        if (
            repayment.loanId !==
            homeLoan.id
        ) {
            return;
        }

        // Ignore deleted records
        if (
            repayment.status ===
            "deleted"
        ) {
            return;
        }

        homeLoanRepayments.push(
            {
                id:
                    repaymentDoc.id,

                ...repayment
            }
        );

    }
);


// =================================================
// FIND MOST RECENT REPAYMENT
// =================================================

homeLoanRepayments.sort(
    (a, b) => {

        const dateA =
            a.paymentDate || "";

        const dateB =
            b.paymentDate || "";

        if (dateA !== dateB) {

            return dateB.localeCompare(
                dateA
            );

        }

        // Same payment date:
        // latest created record first

        const createdA =
            a.createdAt?.seconds
                ? Number(
                    a.createdAt.seconds
                )
                : 0;

        const createdB =
            b.createdAt?.seconds
                ? Number(
                    b.createdAt.seconds
                )
                : 0;

        return createdB - createdA;

    }
);


const latestRepayment =
    homeLoanRepayments.length > 0
        ? homeLoanRepayments[0]
        : null;


// =================================================
// UPDATE LATEST PAYMENT UI
// =================================================

const latestDateElement =
    document.getElementById(
        "repaymentLatestPaymentDate"
    );

const latestAmountElement =
    document.getElementById(
        "repaymentLatestAmount"
    );

const latestPrincipalElement =
    document.getElementById(
        "repaymentLatestPrincipal"
    );

const latestInterestElement =
    document.getElementById(
        "repaymentLatestInterest"
    );

const latestOutstandingElement =
    document.getElementById(
        "repaymentLatestOutstanding"
    );


if (latestRepayment) {

    const latestDate =
        latestRepayment.paymentDate ||
        "";

    let formattedLatestDate =
        latestDate;

    if (
        latestDate.includes("-")
    ) {

        const parts =
            latestDate.split("-");

        if (
            parts.length === 3
        ) {

            formattedLatestDate =
                `${parts[2]}-${parts[1]}-${parts[0]}`;

        }

    }


    if (latestDateElement) {

        latestDateElement.textContent =
            formattedLatestDate;

    }


    if (latestAmountElement) {

        latestAmountElement.textContent =
            money(
                latestRepayment.amount
            );

    }


    if (latestPrincipalElement) {

        latestPrincipalElement.textContent =
            money(
                latestRepayment.principalAmount
            );

    }


    if (latestInterestElement) {

        latestInterestElement.textContent =
            money(
                latestRepayment.interestAmount
            );

    }


    if (latestOutstandingElement) {

        latestOutstandingElement.textContent =
            money(
                latestRepayment.outstandingAfter
            );

    }

}

        // =================================================
        // VISIBLE REPAYMENT FORM
        // =================================================

        const repaymentSection =
            document.getElementById(
                "loanRepaymentSection"
            );


        if (repaymentSection) {


            // =============================================
            // LOAN DROPDOWN
            // =============================================

            const loanField =
                repaymentSection.querySelector(
                    "#repaymentLoan"
                );


            if (loanField) {

                loanField.innerHTML = `
                    <option value="">
                        -- Select Loan --
                    </option>
                `;


                loansSnapshot.forEach(
                    (loanDoc) => {

                        const loan =
                            loanDoc.data();


                        if (
                            loan.status !==
                            "active"
                        ) {

                            return;

                        }


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            loanDoc.id;


                        option.textContent =
                            loan.loanName ||
                            loan.loanType ||
                            "Loan";


                        loanField.appendChild(
                            option
                        );

                    }
                );


                loanField.value =
                    homeLoan.id;

            }


            // =============================================
            // PAYMENT DATE
            // =============================================

            const paymentDateField =
                repaymentSection.querySelector(
                    "#repaymentPaymentDate"
                );


            if (paymentDateField) {

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


                paymentDateField.value =
                    `${yyyy}-${mm}-${dd}`;

            }


            // =============================================
            // EMI DUE DATE
            // =============================================

            const dueDateField =
                repaymentSection.querySelector(
                    "#repaymentDueDate"
                );


            if (dueDateField) {

                const yyyy =
                    nextEMIDate.getFullYear();


                const mm =
                    String(
                        nextEMIDate.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const dd =
                    String(
                        nextEMIDate.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                dueDateField.value =
                    `${yyyy}-${mm}-${dd}`;

            }


            // =============================================
            // PAYMENT TYPE
            // =============================================

            const paymentTypeField =
                repaymentSection.querySelector(
                    "#repaymentType"
                );


            if (paymentTypeField) {

                paymentTypeField.value =
                    "regular_emi";

            }


            // =============================================
            // EMI AMOUNT
            // =============================================

            const amountField =
                repaymentSection.querySelector(
                    "#repaymentAmount"
                );


           if (amountField) {

    amountField.value = "";

    amountField.placeholder =
        "₹" +
        Number(homeLoan.emi).toLocaleString("en-IN");

}


            // =============================================
            // PAID BY
            // =============================================

            const paidByField =
                repaymentSection.querySelector(
                    "#repaymentPaidBy"
                );


            if (paidByField) {

                paidByField.value =
                    "aadesh";

            }


            // =============================================
            // PAYMENT ACCOUNT
            // =============================================

            const accountField =
                repaymentSection.querySelector(
                    "#repaymentAccount"
                );


            if (accountField) {

                accountField.innerHTML = `
                    <option value="">
                        -- Select Account --
                    </option>
                `;


                try {

                    const accountsRef =
                        collection(
                            db,
                            "users",
                            auth.currentUser.uid,
                            "accounts"
                        );


                    const accountsSnapshot =
                        await getDocs(
                            accountsRef
                        );


                    accountsSnapshot.forEach(
                        (accountDoc) => {

                            const account =
                                accountDoc.data();


                            const option =
                                document.createElement(
                                    "option"
                                );


                            option.value =
                                accountDoc.id;


                            option.textContent =
                                account.name ||
                                account.accountName ||
                                account.bankName ||
                                "Account";


                            accountField.appendChild(
                                option
                            );

                        }
                    );


                    // Select Loan Master account

                    accountField.value =
                        homeLoan.paymentAccount;


                } catch (accountError) {

                    console.error(
                        "❌ Account loading error:",
                        accountError
                    );

                }

            }

        }


        // =================================================
        // CONSOLE
        // =================================================

        console.log(
            "=========================================="
        );


        console.log(
            "✅ HOME LOAN DASHBOARD UPDATED"
        );


        console.log(
            "Loan:",
            homeLoan.loanName
        );


        console.log(
            "Loan ID:",
            homeLoan.id
        );


        console.log(
            "Outstanding:",
            money(
                homeLoan.outstandingBalance
            )
        );


        console.log(
            "EMI:",
            money(
                homeLoan.emi
            )
        );


        console.log(
            "Interest Rate:",
            homeLoan.interestRate + "%"
        );


        console.log(
            "EMI Day:",
            emiDay
        );


        console.log(
            "Next EMI:",
            formattedNextEMIDate
        );


        console.log(
            "Payment Account:",
            homeLoan.paymentAccount
        );


        console.log(
            "Paid By: आदेश"
        );


        console.log(
            "=========================================="
        );


    } catch (error) {

        console.error(
            "❌ Dashboard loading error:",
            error
        );

    }

}


// =========================================================
// MAKE FUNCTION AVAILABLE FOR TESTING
// =========================================================

window.loadHomeLoanRepaymentDashboard =
    loadHomeLoanRepaymentDashboard;

    // =========================================================
// AUTO SYNC HOME LOAN REPAYMENT DASHBOARD
// =========================================================

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", async function () {
        await loadHomeLoanRepaymentDashboard();
    });

} else {

    await loadHomeLoanRepaymentDashboard();

}

// =========================================================
// TEST: AADESH FUNDING vs ACTUAL HOME LOAN REPAYMENT
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testHomeLoanContributionSeparation() {

    console.log("==============================================");
    console.log("HOME LOAN CONTRIBUTION SEPARATION TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        // -----------------------------------------
        // READ ALL TRANSACTIONS
        // -----------------------------------------
        const transactionsRef =
            collection(db, "users", userId, "transactions");

        const snapshot = await getDocs(transactionsRef);

        const contributions = [];
        const actualRepayments = [];

        snapshot.forEach(transactionDoc => {

            const t = transactionDoc.data();

            if (t.deleted === true) return;

            const category = String(t.category || "").trim();
            const notes = String(t.notes || "").toLowerCase();

            // -----------------------------------------
            // AADESH FUNDING / CONTRIBUTION
            // -----------------------------------------
            if (
                category === "Home Loan-Principal Prepayment" &&
                (
                    notes.includes("aadesh") ||
                    notes.includes("transfer to aadesh")
                )
            ) {

                contributions.push({
                    id: transactionDoc.id,
                    date: t.date || "",
                    amount: Number(t.amount || 0),
                    fromAccountId: t.fromAccountId || "",
                    notes: t.notes || ""
                });
            }

            // -----------------------------------------
            // OTHER HOME LOAN PRINCIPAL TRANSACTIONS
            // These may represent actual repayment
            // -----------------------------------------
            else if (
                category === "Home Loan-Principal Prepayment"
            ) {

                actualRepayments.push({
                    id: transactionDoc.id,
                    date: t.date || "",
                    amount: Number(t.amount || 0),
                    fromAccountId: t.fromAccountId || "",
                    notes: t.notes || ""
                });
            }
        });

        // Sort by date
        contributions.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );

        actualRepayments.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );

        console.log("");
        console.log("🔵 AADESH FUNDING / CONTRIBUTIONS");
        console.log("----------------------------------------------");

        let contributionTotal = 0;

        contributions.forEach((item, index) => {

            contributionTotal += item.amount;

            console.log(
                `${index + 1}. ${item.date} | ₹${item.amount.toLocaleString("en-IN")} | ${item.notes}`
            );

            console.log("   Transaction ID:", item.id);
        });

        console.log(
            "TOTAL AADESH CONTRIBUTION: ₹" +
            contributionTotal.toLocaleString("en-IN")
        );


        console.log("");
        console.log("🟢 ACTUAL HOME LOAN PRINCIPAL PAYMENTS");
        console.log("----------------------------------------------");

        let repaymentTotal = 0;

        actualRepayments.forEach((item, index) => {

            repaymentTotal += item.amount;

            console.log(
                `${index + 1}. ${item.date} | ₹${item.amount.toLocaleString("en-IN")} | ${item.notes}`
            );

            console.log("   Transaction ID:", item.id);
        });

        console.log(
            "TOTAL ACTUAL REPAYMENT: ₹" +
            repaymentTotal.toLocaleString("en-IN")
        );


        console.log("");
        console.log("==============================================");
        console.log("RESULT");
        console.log("==============================================");

        console.log(
            "Aadesh Funding Total: ₹" +
            contributionTotal.toLocaleString("en-IN")
        );

        console.log(
            "Actual Loan Repayment Total: ₹" +
            repaymentTotal.toLocaleString("en-IN")
        );

        console.log("");
        console.log("⚠️ IMPORTANT:");
        console.log(
            "Aadesh को दिया गया पैसा Loan Outstanding कम नहीं करेगा।"
        );

        console.log(
            "Actual Axis Home Loan payment ही Principal को कम करेगा।"
        );

        console.log("");
        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");

        return {
            contributions,
            actualRepayments,
            contributionTotal,
            repaymentTotal
        };

    } catch (error) {

        console.error(
            "❌ TEST ERROR:",
            error
        );
    }
}

window.testHomeLoanContributionSeparation =
    testHomeLoanContributionSeparation;

    
// =========================================================
// TEST: FIND AADESH BANK ACCOUNT
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testFindAadeshBankAccount() {

    console.log("==============================================");
    console.log("AADESH BANK ACCOUNT TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        const accountsRef =
            collection(db, "users", userId, "accounts");

        const snapshot = await getDocs(accountsRef);

        const matches = [];

        snapshot.forEach(accountDoc => {

            const account = accountDoc.data();

            const text = (
                String(account.accountName || "") + " " +
                String(account.name || "") + " " +
                String(account.bankName || "") + " " +
                String(account.party || "") + " " +
                String(account.owner || "")
            ).toLowerCase();

            if (text.includes("aadesh")) {

                matches.push({
                    id: accountDoc.id,
                    accountName: account.accountName || account.name || "",
                    bankName: account.bankName || "",
                    owner: account.owner || "",
                    accountType: account.accountType || ""
                });
            }
        });

        console.log("");
        console.log("🔎 AADESH ACCOUNT MATCHES");
        console.log("----------------------------------------------");

        if (matches.length === 0) {

            console.log("❌ Aadesh नाम से कोई account नहीं मिला.");

        } else {

            matches.forEach((account, index) => {

                console.log(`${index + 1}. Account Name:`, account.accountName);
                console.log("   Bank:", account.bankName);
                console.log("   Owner:", account.owner);
                console.log("   Account Type:", account.accountType);
                console.log("   Account ID:", account.id);
                console.log("----------------------------------------------");
            });
        }

        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");

        return matches;

    } catch (error) {

        console.error("❌ TEST ERROR:", error);
    }
}

window.testFindAadeshBankAccount =
    testFindAadeshBankAccount;

    // =========================================================
// TEST: INSPECT HOME LOAN CONTRIBUTION TRANSACTIONS
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testInspectHomeLoanContributionFields() {

    console.log("==============================================");
    console.log("HOME LOAN CONTRIBUTION FIELD TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        const transactionsRef =
            collection(db, "users", userId, "transactions");

        const snapshot = await getDocs(transactionsRef);

        snapshot.forEach(transactionDoc => {

            const t = transactionDoc.data();

            if (t.deleted === true) return;

            if (
                t.category === "Home Loan-Principal Prepayment"
            ) {

                console.log("");
                console.log("==============================================");
                console.log("TRANSACTION ID:", transactionDoc.id);
                console.log("==============================================");

                console.log("DATE:", t.date);
                console.log("AMOUNT:", t.amount);
                console.log("TYPE:", t.type);
                console.log("CATEGORY:", t.category);

                console.log("FROM ACCOUNT ID:", t.fromAccountId);
                console.log("TO ACCOUNT ID:", t.toAccountId);

                console.log("PARTY ID:", t.partyId);
                console.log("PARTY:", t.party);

                console.log("DESCRIPTION:", t.description);
                console.log("NOTES:", t.notes);

                console.log("TRANSACTION BEHAVIOR:", t.behavior);

                console.log("FULL TRANSACTION OBJECT:");
                console.log(t);
            }
        });

        console.log("");
        console.log("==============================================");
        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");
        console.log("==============================================");

    } catch (error) {

        console.error("❌ TEST ERROR:", error);
    }
}

window.testInspectHomeLoanContributionFields =
    testInspectHomeLoanContributionFields;

    // =========================================================
// TEST: CHECK HOME LOAN LINKED MODULE
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testHomeLoanLinkedModule() {

    console.log("==============================================");
    console.log("HOME LOAN LINKED MODULE TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        const transactionsRef =
            collection(db, "users", userId, "transactions");

        const snapshot = await getDocs(transactionsRef);

        let count = 0;

        snapshot.forEach(transactionDoc => {

            const t = transactionDoc.data();

            if (t.deleted === true) return;

            if (
                t.category === "Home Loan-Principal Prepayment"
            ) {

                count++;

                console.log("");
                console.log("----------------------------------------------");
                console.log("Transaction ID:", transactionDoc.id);
                console.log("Date:", t.date);
                console.log("Amount:", t.amount);
                console.log("Category:", t.category);
                console.log("Behavior:", t.behavior);
                console.log("Linked Module:", t.linkedModule);
                console.log("Party Name:", t.partyName);
                console.log("Payment Method:", t.paymentMethod);
                console.log("Notes:", t.notes);
                console.log("----------------------------------------------");
            }
        });

        console.log("");
        console.log("==============================================");
        console.log("TOTAL HOME LOAN TRANSACTIONS:", count);
        console.log("==============================================");

        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");

    } catch (error) {

        console.error("❌ TEST ERROR:", error);
    }
}

window.testHomeLoanLinkedModule =
    testHomeLoanLinkedModule;

    // =========================================================
// TEST: CLASSIFY HOME LOAN TRANSACTIONS
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testClassifyHomeLoanTransactions() {

    console.log("==============================================");
    console.log("HOME LOAN TRANSACTION CLASSIFICATION TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        const transactionsRef =
            collection(db, "users", userId, "transactions");

        const snapshot = await getDocs(transactionsRef);

        const contributions = [];
        const actualRepayments = [];
        const unidentified = [];

        snapshot.forEach(transactionDoc => {

            const t = transactionDoc.data();

            if (t.deleted === true) return;

            if (
                t.category !== "Home Loan-Principal Prepayment"
            ) {
                return;
            }

            const record = {
                id: transactionDoc.id,
                date: t.date || "",
                amount: Number(t.amount || 0),
                linkedModule: t.linkedModule || "",
                partyName: t.partyName || "",
                notes: t.notes || ""
            };

            // =========================================
            // ACTUAL AXIS HOME LOAN REPAYMENT
            // =========================================
            if (t.linkedModule === "home_loan") {

                actualRepayments.push(record);

            }

            // =========================================
            // AADESH FUNDING / CONTRIBUTION
            // =========================================
            else if (!t.linkedModule) {

                contributions.push(record);

            }

            // =========================================
            // ANYTHING ELSE
            // =========================================
            else {

                unidentified.push(record);

            }
        });

        contributions.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );

        actualRepayments.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );

        unidentified.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );


        // =========================================
        // DISPLAY CONTRIBUTIONS
        // =========================================

        console.log("");
        console.log("🔵 AADESH FUNDING / CONTRIBUTIONS");
        console.log("----------------------------------------------");

        let contributionTotal = 0;

        contributions.forEach((item, index) => {

            contributionTotal += item.amount;

            console.log(
                `${index + 1}. ${item.date} | ₹${item.amount.toLocaleString("en-IN")}`
            );

            console.log("   ID:", item.id);
            console.log("   Party:", item.partyName);
            console.log("   Notes:", item.notes);
        });

        console.log(
            "TOTAL CONTRIBUTION: ₹" +
            contributionTotal.toLocaleString("en-IN")
        );


        // =========================================
        // DISPLAY ACTUAL REPAYMENTS
        // =========================================

        console.log("");
        console.log("🟢 ACTUAL AXIS HOME LOAN REPAYMENTS");
        console.log("----------------------------------------------");

        let repaymentTotal = 0;

        actualRepayments.forEach((item, index) => {

            repaymentTotal += item.amount;

            console.log(
                `${index + 1}. ${item.date} | ₹${item.amount.toLocaleString("en-IN")}`
            );

            console.log("   ID:", item.id);
            console.log("   Linked Module:", item.linkedModule);
            console.log("   Party:", item.partyName);
            console.log("   Notes:", item.notes);
        });

        console.log(
            "TOTAL ACTUAL REPAYMENT: ₹" +
            repaymentTotal.toLocaleString("en-IN")
        );


        // =========================================
        // DISPLAY UNIDENTIFIED
        // =========================================

        console.log("");
        console.log("🟠 UNIDENTIFIED HOME LOAN TRANSACTIONS");
        console.log("----------------------------------------------");

        if (unidentified.length === 0) {

            console.log("None");

        } else {

            unidentified.forEach((item, index) => {

                console.log(
                    `${index + 1}. ${item.date} | ₹${item.amount.toLocaleString("en-IN")}`
                );

                console.log("   ID:", item.id);
                console.log("   Linked Module:", item.linkedModule);
            });
        }


        // =========================================
        // FINAL RESULT
        // =========================================

        console.log("");
        console.log("==============================================");
        console.log("FINAL RESULT");
        console.log("==============================================");

        console.log(
            "Contribution Total: ₹" +
            contributionTotal.toLocaleString("en-IN")
        );

        console.log(
            "Actual Repayment Total: ₹" +
            repaymentTotal.toLocaleString("en-IN")
        );

        console.log(
            "Unidentified Count:",
            unidentified.length
        );

        console.log("");
        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");

        return {
            contributions,
            actualRepayments,
            unidentified,
            contributionTotal,
            repaymentTotal
        };

    } catch (error) {

        console.error("❌ TEST ERROR:", error);
    }
}

window.testClassifyHomeLoanTransactions =
    testClassifyHomeLoanTransactions;   

    // =========================================================
// TEST: ACTUAL HOME LOAN PAYMENT -> EMI ENGINE
// READ ONLY - NO FIRESTORE WRITE
// =========================================================

async function testActualHomeLoanPaymentEMIEngine() {

    console.log("==============================================");
    console.log("ACTUAL HOME LOAN PAYMENT -> EMI ENGINE TEST");
    console.log("==============================================");

    try {

        if (!auth.currentUser) {
            console.error("❌ User login नहीं है");
            return;
        }

        const userId = auth.currentUser.uid;

        // =========================================
        // 1. GET ACTIVE HOME LOAN
        // =========================================

        const loansRef =
            collection(db, "users", userId, "loans");

        const loanSnapshot = await getDocs(loansRef);

        let homeLoan = null;
        let homeLoanId = null;

        loanSnapshot.forEach(loanDoc => {

            const loan = loanDoc.data();

            if (
                !homeLoan &&
                loan.loanType === "Home Loan" &&
                loan.status === "active"
            ) {

                homeLoan = loan;
                homeLoanId = loanDoc.id;
            }
        });

        if (!homeLoan) {
            console.error("❌ Active Home Loan नहीं मिला");
            return;
        }

        console.log("");
        console.log("🏠 HOME LOAN");
        console.log("----------------------------------------------");
        console.log("Loan ID:", homeLoanId);
        console.log(
            "Current Outstanding: ₹" +
            Number(homeLoan.outstandingBalance || 0)
                .toLocaleString("en-IN")
        );
        console.log("Interest Rate:", homeLoan.interestRate + "%");
        console.log("EMI:", homeLoan.emi);
        console.log("Remaining Tenure:", homeLoan.remainingTenure);


        // =========================================
        // 2. GET TRANSACTIONS
        // =========================================

        const transactionsRef =
            collection(db, "users", userId, "transactions");

        const transactionSnapshot =
            await getDocs(transactionsRef);

        const actualPayments = [];

        transactionSnapshot.forEach(transactionDoc => {

            const t = transactionDoc.data();

            if (t.deleted === true) return;

            if (
                t.category === "Home Loan-Principal Prepayment" &&
                t.linkedModule === "home_loan"
            ) {

                actualPayments.push({
                    id: transactionDoc.id,
                    date: t.date,
                    amount: Number(t.amount || 0),
                    notes: t.notes || ""
                });
            }
        });


        actualPayments.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );


        console.log("");
        console.log("🟢 ACTUAL HOME LOAN PAYMENTS");
        console.log("----------------------------------------------");

        let totalActualPayment = 0;

        actualPayments.forEach((payment, index) => {

            totalActualPayment += payment.amount;

            console.log(
                `${index + 1}. ${payment.date} | ₹${payment.amount.toLocaleString("en-IN")}`
            );

            console.log("   Transaction ID:", payment.id);
        });

        console.log(
            "TOTAL ACTUAL PRINCIPAL PAYMENT: ₹" +
            totalActualPayment.toLocaleString("en-IN")
        );


        // =========================================
        // 3. NEXT EMI DATE
        // =========================================

        const emiDay = Number(homeLoan.emiDay || 10);

        const today = new Date();

        let nextEMIDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                emiDay
            );

        if (today.getDate() > emiDay) {

            nextEMIDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    emiDay
                );
        }


        // =========================================
        // 4. PREVIOUS EMI DATE
        // =========================================

        let previousEMIDate =
            new Date(
                nextEMIDate.getFullYear(),
                nextEMIDate.getMonth() - 1,
                emiDay
            );


        const formatDate = date => {

            const d = String(date.getDate()).padStart(2, "0");
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const y = date.getFullYear();

            return `${d}-${m}-${y}`;
        };


        console.log("");
        console.log("📅 EMI PERIOD");
        console.log("----------------------------------------------");
        console.log(
            "Previous EMI Date:",
            formatDate(previousEMIDate)
        );

        console.log(
            "Next EMI Date:",
            formatDate(nextEMIDate)
        );


        // =========================================
        // 5. GET PAYMENTS INSIDE THIS EMI PERIOD
        // =========================================

        const periodPayments =
            actualPayments.filter(payment => {

                const paymentDate =
                    new Date(payment.date + "T00:00:00");

                return (
                    paymentDate > previousEMIDate &&
                    paymentDate < nextEMIDate
                );
            });


        console.log("");
        console.log("💰 PAYMENTS IN CURRENT EMI PERIOD");
        console.log("----------------------------------------------");

        if (periodPayments.length === 0) {

            console.log("No actual principal prepayment.");

        } else {

            periodPayments.forEach(payment => {

                console.log(
                    payment.date +
                    " → ₹" +
                    payment.amount.toLocaleString("en-IN")
                );
            });
        }


        // =========================================
        // 6. CALCULATE SPLIT-PERIOD INTEREST
        // =========================================

        let runningBalance =
            Number(homeLoan.outstandingBalance || 0);

        let runningDate = previousEMIDate;

        let totalInterest = 0;

        const rate =
            Number(homeLoan.interestRate || 0) / 100;


        for (const payment of periodPayments) {

            const paymentDate =
                new Date(payment.date + "T00:00:00");

            const days =
                Math.round(
                    (paymentDate - runningDate) /
                    (1000 * 60 * 60 * 24)
                );

            const interest =
                runningBalance *
                rate *
                days /
                365;

            totalInterest += interest;

            console.log("");
            console.log(
                `${formatDate(runningDate)} → ${formatDate(paymentDate)}`
            );

            console.log("Days:", days);

            console.log(
                "Opening Balance: ₹" +
                runningBalance.toLocaleString("en-IN")
            );

            console.log(
                "Interest: ₹" +
                interest.toFixed(2)
            );

            runningBalance -= payment.amount;

            console.log(
                "After Principal Payment: ₹" +
                runningBalance.toLocaleString("en-IN")
            );

            runningDate = paymentDate;
        }


        // =========================================
        // 7. FINAL PERIOD → EMI DATE
        // =========================================

        const finalDays =
            Math.round(
                (nextEMIDate - runningDate) /
                (1000 * 60 * 60 * 24)
            );

        const finalInterest =
            runningBalance *
            rate *
            finalDays /
            365;

        totalInterest += finalInterest;


        console.log("");
        console.log(
            `${formatDate(runningDate)} → ${formatDate(nextEMIDate)}`
        );

        console.log("Days:", finalDays);

        console.log(
            "Opening Balance: ₹" +
            runningBalance.toLocaleString("en-IN")
        );

        console.log(
            "Interest: ₹" +
            finalInterest.toFixed(2)
        );


        // =========================================
        // 8. EMI PRINCIPAL
        // =========================================

        const emi =
            Number(homeLoan.emi || 0);

        const emiPrincipal =
            emi - totalInterest;

        const projectedClosing =
            runningBalance - emiPrincipal;


        console.log("");
        console.log("==============================================");
        console.log("📊 EMI CALCULATION RESULT");
        console.log("==============================================");

        console.log(
            "Starting Balance: ₹" +
            Number(homeLoan.outstandingBalance || 0)
                .toLocaleString("en-IN")
        );

        console.log(
            "Actual Principal Prepayment: ₹" +
            totalActualPayment.toLocaleString("en-IN")
        );

        console.log(
            "Total Interest: ₹" +
            totalInterest.toFixed(2)
        );

        console.log(
            "EMI: ₹" +
            emi.toLocaleString("en-IN")
        );

        console.log(
            "EMI Principal: ₹" +
            emiPrincipal.toFixed(2)
        );

        console.log(
            "Projected Closing Balance: ₹" +
            projectedClosing.toFixed(2)
        );

        console.log("");
        console.log("✅ READ ONLY TEST COMPLETE");
        console.log("❌ Firestore में कुछ भी बदला नहीं गया।");


        return {
            loanId: homeLoanId,
            previousEMIDate: formatDate(previousEMIDate),
            nextEMIDate: formatDate(nextEMIDate),
            actualPayments: periodPayments,
            totalActualPayment,
            totalInterest,
            emi,
            emiPrincipal,
            projectedClosing
        };

    } catch (error) {

        console.error(
            "❌ TEST ERROR:",
            error
        );
    }
}

window.testActualHomeLoanPaymentEMIEngine =
    testActualHomeLoanPaymentEMIEngine;


    // =========================================================
// LOAN REPAYMENT MANAGEMENT - MASTER VISIBILITY CONTROL
// =========================================================

(function () {

    const repaymentSection =
        document.getElementById("loanRepaymentSection");

    const viewAllLoansButton =
        document.getElementById("viewAllLoansButton");

    const loanSummaryButton =
        document.getElementById("loanSummaryButton");

    const loanCards =
        document.querySelector(".loan-type-grid");

    const loanSummary =
        document.getElementById("loanSummary");

    const loanForm =
        document.getElementById("loanFormContainer");

    const loansList =
        document.getElementById("loansListContainer");


    // =====================================================
    // ALWAYS HIDE OLD 8 LOAN TYPE CARDS
    // =====================================================

    if (loanCards) {

        loanCards.style.setProperty(
            "display",
            "none",
            "important"
        );

    }


    // =====================================================
    // REPAYMENT DASHBOARD - HIDDEN BY DEFAULT
    // =====================================================

    if (repaymentSection) {

        repaymentSection.style.setProperty(
            "display",
            "none",
            "important"
        );

    }

// =====================================================
// MANAGE LOAN MASTER - CONTAINER
// =====================================================

let manageLoanMasterSection =
    document.getElementById(
        "manageLoanMasterSection"
    );

if (!manageLoanMasterSection) {

    manageLoanMasterSection =
        document.createElement("div");

    manageLoanMasterSection.id =
        "manageLoanMasterSection";

    manageLoanMasterSection.style.setProperty(
        "display",
        "none",
        "important"
    );

    manageLoanMasterSection.style.margin =
        "20px auto";

    manageLoanMasterSection.style.maxWidth =
        "1400px";

    manageLoanMasterSection.innerHTML = `

        <div style="
            background:#ffffff;
            border-radius:12px;
            padding:20px;
            box-shadow:0 2px 10px rgba(0,0,0,0.08);
        ">

            <h2 style="
                margin:0 0 6px 0;
                color:#173f7a;
            ">
                🏦 Manage Loan Master
            </h2>

            <div style="
                color:#666;
                margin-bottom:20px;
            ">
                View and manage your existing loans
            </div>

            <div id="manageLoanMasterList">
            </div>

        </div>
    `;

    const loanSection =
        document.getElementById(
            "loansSection"
        );

    if (loanSection) {

        loanSection.appendChild(
            manageLoanMasterSection
        );

    }

}
// =====================================================
// LOAD MANAGE LOAN MASTER LIST
// =====================================================

async function loadManageLoanMaster() {

    try {

        const list =
            document.getElementById(
                "manageLoanMasterList"
            );

        if (!list) return;


        list.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#666;
            ">
                ⏳ Loading Loan Master...
            </div>
        `;


        // Get Loans Collection

        const loansRef =
            getLoansCollectionRef();

        const snapshot =
            await getDocs(
                loansRef
            );


        if (snapshot.empty) {

            list.innerHTML = `
                <div style="
                    padding:20px;
                    text-align:center;
                    color:#777;
                ">
                    No loans found.
                </div>
            `;

            return;
        }


        let html = "";


        snapshot.forEach(
            (loanDoc) => {

                const loan =
                    loanDoc.data();


                const loanName =
                    loan.loanName ||
                    "Unnamed Loan";


                const loanType =
                    loan.loanType ||
                    "—";


                const lender =
                    loan.lender ||
                    "—";


                const outstanding =
                    Number(
                        loan.outstandingBalance ||
                        0
                    );


                const emi =
                    Number(
                        loan.emi ||
                        0
                    );


                const roi =
                    Number(
                        loan.interestRate ||
                        0
                    );


                const status =
                    loan.status ||
                    "active";

// =====================================================
// LOCAL MONEY FORMATTER
// =====================================================

const formatManageLoanAmount = (amount) => {

    return (
        "₹" +
        Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );

};

html += `

<div style="
    position:relative;
    overflow:hidden;
    border:1px solid #e2e8f0;
    border-left:6px solid #2563eb;
    border-radius:16px;
    padding:22px;
    margin-bottom:18px;
    background:
        linear-gradient(
            135deg,
            #ffffff 0%,
            #f8fbff 55%,
            #ffffff 100%
        );
    box-shadow:
        0 8px 24px rgba(37,99,235,0.10);
">

    <!-- TOP -->
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:15px;
        margin-bottom:18px;
    ">

        <div>

            <div style="
                font-size:21px;
                font-weight:700;
                color:#173f7a;
                margin-bottom:8px;
            ">
                🏦 ${loanName}
            </div>

            <div style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
            ">

                <span style="
                    padding:5px 12px;
                    border-radius:20px;
                    background:#eaf3ff;
                    color:#2563eb;
                    font-size:13px;
                    font-weight:600;
                ">
                    🏠 ${loanType}
                </span>

                <span style="
                    padding:5px 12px;
                    border-radius:20px;
                    background:#fff0f0;
                    color:#dc2626;
                    font-size:13px;
                    font-weight:600;
                ">
                    🏦 ${lender}
                </span>

            </div>

        </div>


        <!-- STATUS -->
        <div style="
            padding:7px 14px;
            border-radius:20px;
            background:#dcfce7;
            color:#15803d;
            font-size:13px;
            font-weight:700;
            white-space:nowrap;
        ">
            🟢 ${status}
        </div>

    </div>


    <!-- FINANCIAL CARDS -->
    <div style="
        display:grid;
        grid-template-columns:
            repeat(
                auto-fit,
                minmax(190px,1fr)
            );
        gap:12px;
        margin-bottom:20px;
    ">


        <!-- OUTSTANDING -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #edf5ff,
                #f8fbff
            );
        ">

            <div style="
                font-size:13px;
                color:#315b91;
                margin-bottom:5px;
            ">
                💰 Outstanding Balance
            </div>

            <div style="
                font-size:22px;
                font-weight:700;
                color:#173f7a;
            ">
                ${formatManageLoanAmount(outstanding)}
            </div>

        </div>


        <!-- EMI -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #ecfdf5,
                #f7fff9
            );
        ">

            <div style="
                font-size:13px;
                color:#166534;
                margin-bottom:5px;
            ">
                📅 Monthly EMI
            </div>

            <div style="
                font-size:22px;
                font-weight:700;
                color:#15803d;
            ">
                ${formatManageLoanAmount(emi)}
            </div>

        </div>


        <!-- ROI -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #fff7ed,
                #fffaf5
            );
        ">

            <div style="
                font-size:13px;
                color:#9a3412;
                margin-bottom:5px;
            ">
                📈 Interest Rate (ROI)
            </div>

            <div style="
                font-size:22px;
                font-weight:700;
                color:#ea580c;
            ">
                ${roi.toFixed(2)}%
            </div>

        </div>


        <!-- LOAN TYPE -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #f5f3ff,
                #faf9ff
            );
        ">

            <div style="
                font-size:13px;
                color:#6d28d9;
                margin-bottom:5px;
            ">
                🏠 Loan Type
            </div>

            <div style="
                font-size:20px;
                font-weight:700;
                color:#6d28d9;
            ">
                ${loanType}
            </div>

        </div>


        <!-- BALANCE TENURE -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #ecfeff,
                #f5ffff
            );
        ">

            <div style="
                font-size:13px;
                color:#0f766e;
                margin-bottom:5px;
            ">
                ⏳ Balance Tenure
            </div>

            <div style="
                font-size:22px;
                font-weight:700;
                color:#0f766e;
            ">
                ${Number(
                    loan.remainingTenure || 0
                ).toLocaleString("en-IN")}
                <span style="
                    font-size:13px;
                    font-weight:600;
                ">
                    Months
                </span>
            </div>

        </div>


        <!-- STATUS -->
        <div style="
            padding:16px;
            border-radius:13px;
            background:linear-gradient(
                135deg,
                #f0fdfa,
                #f7fffd
            );
        ">

            <div style="
                font-size:13px;
                color:#0f766e;
                margin-bottom:5px;
            ">
                📋 Status
            </div>

            <div style="
                font-size:20px;
                font-weight:700;
                color:#059669;
                text-transform:capitalize;
            ">
                ${status}
            </div>

        </div>

    </div>


    <!-- BOTTOM -->
    <div style="
        border-top:1px solid #e2e8f0;
        padding-top:16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        flex-wrap:wrap;
    ">

       <div style="
    display:flex;
    align-items:center;
    gap:10px;
    color:#64748b;
    font-size:14px;
">

    <!-- AXIS BANK LOGO -->
    <img
        src="https://commons.wikimedia.org/wiki/Special:FilePath/AXISBank%20Logo.svg"
        alt="Axis Bank"
        style="
            width:75px;
            height:75px;
            object-fit:contain;
            flex-shrink:0;
        "
    >

    <!-- ACCOUNT DETAILS -->
    <div>

        <div style="
            color:#334155;
            font-weight:700;
            line-height:20px;
        ">
            Loan Account
        </div>

        <div style="
            color:#64748b;
            line-height:20px;
        ">
            ${loan.accountNumber || "—"}
        </div>

    </div>

</div>

        <!-- ACTION PLACEHOLDER -->
        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">

            <button
    type="button"
    data-action="view-loan"
    data-loan-id="${loanDoc.id}"
    style="
        border:none;
        padding:10px 20px;
        border-radius:9px;
        background:#2563eb;
        color:white;
        font-weight:600;
        cursor:pointer;
        box-shadow:
            0 4px 10px
            rgba(37,99,235,0.20);
    "
>
    👁 View
</button>

            <button
                type="button"
                style="
                    border:none;
                    padding:10px 20px;
                    border-radius:9px;
                    background:#f59e0b;
                    color:white;
                    font-weight:600;
                    cursor:pointer;
                    box-shadow:
                        0 4px 10px
                        rgba(245,158,11,0.20);
                "
            >
                ✏️ Edit
            </button>

            <button
                type="button"
                style="
                    border:none;
                    padding:10px 20px;
                    border-radius:9px;
                    background:#16a34a;
                    color:white;
                    font-weight:600;
                    cursor:pointer;
                    box-shadow:
                        0 4px 10px
                        rgba(22,163,74,0.20);
                "
            >
                💳 Repayment
            </button>

        </div>

    </div>

</div>
`;

            }
        );


        list.innerHTML =
            html;


    } catch (error) {

        console.error(
            "❌ Manage Loan Master Error:",
            error
        );


        const list =
            document.getElementById(
                "manageLoanMasterList"
            );


        if (list) {

            list.innerHTML = `
                <div style="
                    padding:20px;
                    color:#b00020;
                ">
                    ❌ Unable to load Loan Master.
                    <br>
                    Please check Console.
                </div>
            `;

        }

    }

}


    // =====================================================
    // VIEW ALL LOANS
    // =====================================================

    if (viewAllLoansButton) {

        viewAllLoansButton.addEventListener(
            "click",
            async function () {

                console.log(
                    "💳 VIEW ALL LOANS → REPAYMENT DASHBOARD"
                );


                // Hide old views

                if (loanCards) {

    loanCards.style.setProperty(
        "display",
        "grid",
        "important"
    );

}


                if (loanSummary) {

                    loanSummary.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }


                if (loanForm) {

                    loanForm.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }


                if (loansList) {

                    loansList.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }
// =====================================================
// ALWAYS CLOSE ADD REPAYMENT FORM
// WHEN OPENING LOAN DASHBOARD
// =====================================================

const repaymentForm =
    document.getElementById(
        "newLoanRepaymentEntry"
    );

const addRepaymentButton =
    document.getElementById(
        "openLoanRepaymentButton"
    );

if (repaymentForm) {

    repaymentForm.style.setProperty(
        "display",
        "none",
        "important"
    );

}

if (addRepaymentButton) {

    addRepaymentButton.textContent =
        "➕ Add Repayment";

    addRepaymentButton.dataset.open =
        "false";

}


// =====================================================
// SHOW MANAGE LOAN MASTER
// =====================================================

const manageLoanMasterSection =
    document.getElementById(
        "manageLoanMasterSection"
    );

if (manageLoanMasterSection) {

    manageLoanMasterSection.style.setProperty(
        "display",
        "block",
        "important"
    );

}

// LOAD EXISTING LOANS
await loadManageLoanMaster();

// =====================================================
// SCROLL TO MANAGE LOAN MASTER
// =====================================================

if (manageLoanMasterSection) {

    manageLoanMasterSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}
            }
        );

    }


    // =====================================================
    // LOAN SUMMARY
    // Old 8 cards MUST remain hidden
    // =====================================================

    if (loanSummaryButton) {

        loanSummaryButton.addEventListener(
            "click",
            function () {

                if (loanCards) {

                    loanCards.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }

                if (repaymentSection) {

                    repaymentSection.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );

                }

            }
        );

    }

})();

// =========================================================
// FINAL LOAN NAVIGATION & VISIBILITY CONTROL
// =========================================================

(function () {

    function hideOldLoanCards() {

        const cards =
            document.querySelector(".loan-type-grid");

        if (cards) {

            cards.style.setProperty(
                "display",
                "none",
                "important"
            );

        }

    }


    function hideLoanRepayment() {

        const repayment =
            document.getElementById(
                "loanRepaymentSection"
            );

        if (repayment) {

            repayment.style.setProperty(
                "display",
                "none",
                "important"
            );

        }

    }


    function showLoanRepayment() {

        const repayment =
            document.getElementById(
                "loanRepaymentSection"
            );

        if (repayment) {

            repayment.style.setProperty(
                "display",
                "block",
                "important"
            );

        }

    }


    // =====================================================
    // 1. OLD 8 CARDS - NEVER SHOW
    // =====================================================

    hideOldLoanCards();


    // =====================================================
    // 2. FIND "🏦 Loan Dashboard"
    //    It is currently a DIV, not a button
    // =====================================================

    const repaymentSection =
        document.getElementById(
            "loanRepaymentSection"
        );

    let loanDashboardButton = null;

    if (repaymentSection) {

        const allElements =
            repaymentSection.querySelectorAll("*");

        allElements.forEach(element => {

            if (
                element.textContent.trim()
                === "🏦 Loan Dashboard"
            ) {

                loanDashboardButton = element;

            }

        });

    }


    // =====================================================
    // 3. MAKE LOAN DASHBOARD CLICKABLE
    // =====================================================

    if (loanDashboardButton) {

        loanDashboardButton.id =
            "loanDashboardButton";

        loanDashboardButton.style.cursor =
            "pointer";

        loanDashboardButton.title =
            "Return to Loan Dashboard";

    }


    // =====================================================
    // 4. LOAN DASHBOARD BUTTON
    // =====================================================

    document.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "#loanDashboardButton"
                );

            if (!button) return;


            console.log(
                "🏦 LOAN DASHBOARD BUTTON CLICKED"
            );


            // Hide old views

            const loanSummary =
                document.getElementById(
                    "loanSummary"
                );

            const loanForm =
                document.getElementById(
                    "loanFormContainer"
                );

            const loansList =
                document.getElementById(
                    "loansListContainer"
                );


            if (loanSummary) {

                loanSummary.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (loanForm) {

                loanForm.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (loansList) {

                loansList.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            hideOldLoanCards();


            // Show repayment dashboard

            showLoanRepayment();


            // Refresh Home Loan data

            if (
                typeof loadHomeLoanRepaymentDashboard
                === "function"
            ) {

                await loadHomeLoanRepaymentDashboard();

            }


            // Scroll to dashboard

            if (repaymentSection) {

                repaymentSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );


    // =====================================================
    // 5. ADD LOAN → CANCEL
    //    OLD 8 CARDS MUST NOT RETURN
    // =====================================================

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "#cancelLoanButton"
                );

            if (!button) return;


            console.log(
                "❌ ADD LOAN CANCELLED"
            );


            // Hide form

            const loanForm =
                document.getElementById(
                    "loanFormContainer"
                );

            if (loanForm) {

                loanForm.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // Hide old 8 cards

            hideOldLoanCards();


            // Hide repayment dashboard

            hideLoanRepayment();


            // Hide summary/list

            const loanSummary =
                document.getElementById(
                    "loanSummary"
                );

            const loansList =
                document.getElementById(
                    "loansListContainer"
                );


            if (loanSummary) {

                loanSummary.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            if (loansList) {

                loansList.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // Return to top of Loans section

            document
                .getElementById("loansSection")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );


    // =====================================================
    // 6. BACK TO DASHBOARD
    //    REPAYMENT SECTION MUST ALSO DISAPPEAR
    // =====================================================

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".back-to-dashboard-button"
                );

            if (!button) return;


            console.log(
                "← BACK TO MAIN DASHBOARD"
            );


            // IMPORTANT:
            // Existing global handler may show
            // the master dashboard first.
            // This hides our new repayment area.

            hideLoanRepayment();


            // Old 8 cards also stay hidden

            hideOldLoanCards();

        }
    );


})();

// =========================================================
// FINAL LOAN REPAYMENT FORM CONTROLLER
// Uses ONLY visible #loanRepaymentSection
// =========================================================

(function () {

    console.log("🏦 Final Loan Repayment Controller Loaded");


    // =====================================================
    // GET VISIBLE REPAYMENT FORM
    // =====================================================

    function getRepaymentSection() {

        return document.getElementById(
            "loanRepaymentSection"
        );

    }


    // =====================================================
    // GET FIELD SAFELY FROM VISIBLE SECTION
    // =====================================================

    function getField(id) {

        const section = getRepaymentSection();

        if (!section) return null;

        return section.querySelector(
            "#" + id
        );

    }


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatMoney(amount) {

        return "₹" +
            Number(amount || 0).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDateDisplay(dateString) {

        if (!dateString) return "—";

        const parts =
            String(dateString).split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        return (
            parts[2] +
            "-" +
            parts[1] +
            "-" +
            parts[0]
        );

    }


    // =====================================================
    // LOAD REPAYMENT HISTORY
    // =====================================================

    async function loadFinalRepaymentHistory() {

        if (!auth.currentUser) return;

        const tbody =
            document.getElementById(
                "loanRepaymentHistoryBody"
            );

        if (!tbody) return;

        try {

            const userId =
                auth.currentUser.uid;

            const repaymentsRef =
                collection(
                    db,
                    "users",
                    userId,
                    "loanRepayments"
                );

            const snapshot =
                await getDocs(
                    repaymentsRef
                );


            const records = [];

            snapshot.forEach(
                repaymentDoc => {

                    const repayment =
                        repaymentDoc.data();

                        if (repayment.test === true) {
    return;
}
                    records.push({

                        id:
                            repaymentDoc.id,

                        ...repayment

                    });


                }
            );


            // Latest first

            records.sort(
                (a, b) =>
                    String(
                        b.paymentDate || ""
                    ).localeCompare(
                        String(
                            a.paymentDate || ""
                        )
                    )
            );


            tbody.innerHTML = "";


            // =================================================
            // NO RECORDS
            // =================================================

            if (records.length === 0) {

                tbody.innerHTML = `
                    <tr>
                        <td
                            colspan="12"
                            style="
                                text-align:center;
                                padding:20px;
                                color:#64748b;
                            ">
                            No repayment records found.
                        </td>
                    </tr>
                `;

                return;

            }


            // =================================================
            // DISPLAY RECORDS
            // =================================================

            records.forEach(
                repayment => {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${formatDateDisplay(
                                repayment.paymentDate
                            )}
                        </td>

                        <td>
                            Home Loan
                        </td>

                        <td>
                            ${
                                repayment.repaymentType ||
                                "—"
                            }
                        </td>

                        <td style="text-align:right;">
                            ${formatMoney(
                                repayment.amount
                            )}
                        </td>

                        <td style="text-align:right;">
                            ${formatMoney(
                                repayment.principalAmount
                            )}
                        </td>

                        <td style="text-align:right;">
                            ${formatMoney(
                                repayment.interestAmount
                            )}
                        </td>

                        <td>
                            ${
                                repayment.rateApplied
                                    ? Number(
                                        repayment.rateApplied
                                      ).toFixed(2) + "%"
                                    : "—"
                            }
                        </td>

                        <td>
                            ${
                                repayment.paidByName ||
                                repayment.paidBy ||
                                "—"
                            }
                        </td>

                        <td>
                            ${
                                repayment.paymentAccountName ||
                                repayment.paymentAccount ||
                                "—"
                            }
                        </td>

                        <td style="text-align:right;">
                            ${formatMoney(
                                repayment.outstandingAfter
                            )}
                        </td>

                        <td>
                            ${
                                repayment.transactionIds &&
                                repayment.transactionIds.length
                                    ? "🔗 Linked"
                                    : "—"
                            }
                        </td>

<td style="white-space:nowrap;">

    <button
        type="button"
        class="loan-repayment-edit-button"
        data-repayment-id="${repayment.id}"
        style="
            background:#2563eb;
            color:#ffffff;
            border:none;
            padding:5px 10px;
            border-radius:6px;
            cursor:pointer;
            font-size:12px;
            font-weight:600;
            margin-right:5px;
        ">
        ✏️ Edit
    </button>

    <button
        type="button"
        class="loan-repayment-delete-button"
        data-repayment-id="${repayment.id}"
        style="
            background:#dc2626;
            color:#ffffff;
            border:none;
            padding:5px 10px;
            border-radius:6px;
            cursor:pointer;
            font-size:12px;
            font-weight:600;
        ">
        🗑 Delete
    </button>

</td>                    `;


                    tbody.appendChild(row);

                }
            );


        } catch (error) {

            console.error(
                "❌ REPAYMENT HISTORY LOAD ERROR:",
                error
            );

        }

    }

// =====================================================
// DELETE REPAYMENT RECORD
// =====================================================

document.addEventListener(
    "click",
    async function (event) {

        const deleteButton =
            event.target.closest(
                ".loan-repayment-delete-button"
            );

        if (!deleteButton) return;


        const repaymentId =
            deleteButton.dataset.repaymentId;

        if (!repaymentId) return;


        // =============================================
        // CONFIRM DELETE
        // =============================================

        const confirmDelete =
            confirm(
                "⚠️ क्या आप इस repayment record को delete करना चाहते हैं?\n\n" +
                "Loan balance भी previous value पर restore किया जाएगा."
            );

        if (!confirmDelete) {
            return;
        }


        try {

            // =============================================
            // USER CHECK
            // =============================================

            const userId =
                auth.currentUser?.uid;

            if (!userId) {

                alert(
                    "❌ User login नहीं है."
                );

                return;
            }


            // =============================================
            // REPAYMENT REFERENCE
            // =============================================

            const repaymentRef =
                doc(
                    db,
                    "users",
                    userId,
                    "loanRepayments",
                    repaymentId
                );


            // =============================================
            // READ REPAYMENT
            // =============================================

            const repaymentSnap =
                await getDoc(
                    repaymentRef
                );


            if (!repaymentSnap.exists()) {

                alert(
                    "❌ Repayment record नहीं मिला."
                );

                return;
            }


            const repayment =
                repaymentSnap.data();


            const loanId =
                repayment.loanId;


            if (!loanId) {

                alert(
                    "❌ इस repayment में Loan ID नहीं मिला."
                );

                return;
            }


            // =============================================
            // REPAYMENT COLLECTION
            // =============================================

            const repaymentsRef =
                collection(
                    db,
                    "users",
                    userId,
                    "loanRepayments"
                );


            // =============================================
            // GET ALL REPAYMENTS
            // =============================================

            const snapshot =
                await getDocs(
                    repaymentsRef
                );


            const loanRecords = [];


            snapshot.forEach(
                repaymentDoc => {

                    const data =
                        repaymentDoc.data();


                    // Test records ignore
                    if (data.test === true) {
                        return;
                    }


                    // Same loan only
                    if (
                        data.loanId !==
                        loanId
                    ) {
                        return;
                    }


                    loanRecords.push({

                        id:
                            repaymentDoc.id,

                        ...data

                    });

                }
            );


            // =============================================
            // SORT OLDEST → LATEST
            // =============================================

            loanRecords.sort(
                (a, b) => {

                    const dateA =
                        String(
                            a.paymentDate || ""
                        );

                    const dateB =
                        String(
                            b.paymentDate || ""
                        );


                    if (
                        dateA !==
                        dateB
                    ) {

                        return dateA.localeCompare(
                            dateB
                        );

                    }


                    const timeA =
                        a.createdAt?.toMillis
                            ? a.createdAt.toMillis()
                            : 0;


                    const timeB =
                        b.createdAt?.toMillis
                            ? b.createdAt.toMillis()
                            : 0;


                    return (
                        timeA -
                        timeB
                    );

                }
            );


            // =============================================
            // ONLY LATEST REPAYMENT CAN BE DELETED
            // =============================================

            const latestRecord =
                loanRecords[
                    loanRecords.length - 1
                ];


            if (
                !latestRecord ||
                latestRecord.id !==
                repaymentId
            ) {

                alert(
                    "⚠️ अभी केवल सबसे नई repayment delete की जा सकती है.\n\n" +
                    "पहले उसके बाद वाली repayment delete करें."
                );

                return;
            }


            // =============================================
            // PREVIOUS REPAYMENT
            // =============================================

            const previousRecord =
                loanRecords[
                    loanRecords.length - 2
                ];


            // =============================================
            // LOAN REFERENCE
            // =============================================

            const loanRef =
                doc(
                    db,
                    "users",
                    userId,
                    "loans",
                    loanId
                );


            // =============================================
            // VALUES TO RESTORE
            // =============================================

            const restoredOutstanding =
                Number(
                    repayment.outstandingBefore ??
                    previousRecord?.outstandingAfter ??
                    0
                );


            let restoredTenure;


            if (
                previousRecord &&
                previousRecord.balanceTenureAfter !==
                    undefined &&
                previousRecord.balanceTenureAfter !==
                    null
            ) {

                restoredTenure =
                    Number(
                        previousRecord.balanceTenureAfter
                    );

            }


            // =============================================
            // SAFE FIRESTORE TRANSACTION
            // =============================================

            await runTransaction(
                db,
                async transaction => {

                    // READS FIRST

                    const currentRepaymentSnap =
                        await transaction.get(
                            repaymentRef
                        );


                    const currentLoanSnap =
                        await transaction.get(
                            loanRef
                        );


                    if (
                        !currentRepaymentSnap.exists()
                    ) {

                        throw new Error(
                            "Repayment record already deleted."
                        );

                    }


                    if (
                        !currentLoanSnap.exists()
                    ) {

                        throw new Error(
                            "Loan record not found."
                        );

                    }


                    // =================================
                    // UPDATE LOAN MASTER
                    // =================================

                    const loanUpdate = {

                        outstandingBalance:
                            Number(
                                restoredOutstanding.toFixed(2)
                            ),

                        updatedAt:
                            serverTimestamp(),

                        updatedBy:
                            userId

                    };


                    if (
                        restoredTenure !==
                        undefined
                    ) {

                        loanUpdate.remainingTenure =
                            restoredTenure;

                    }


                    transaction.update(
                        loanRef,
                        loanUpdate
                    );


                    // =================================
                    // DELETE REPAYMENT
                    // =================================

                    transaction.delete(
                        repaymentRef
                    );

                }
            );


            // =============================================
            // CLEAR EDIT MODE
            // =============================================

            window.editingRepaymentId =
                null;


            // =============================================
            // REFRESH DASHBOARD
            // =============================================

            if (
                typeof loadHomeLoanRepaymentDashboard ===
                "function"
            ) {

                await
                    loadHomeLoanRepaymentDashboard();

            }


            // =============================================
            // REFRESH HISTORY
            // =============================================

            await
                loadFinalRepaymentHistory();


            // =============================================
            // SUCCESS
            // =============================================

            alert(
                "✅ Repayment deleted successfully.\n\n" +
                "Loan balance previous value पर restore हो गया."
            );


        } catch (error) {

            console.error(
                "❌ DELETE REPAYMENT ERROR:",
                error
            );


            alert(
                "❌ Repayment delete नहीं हो पाया.\n\n" +
                "Console में error देखें."
            );

        }

    }
);

    // =====================================================
    // RESET FORM
    // =====================================================

    function resetFinalRepaymentForm() {

        const section =
            getRepaymentSection();

        if (!section) return;


        const paymentDate =
            getField(
                "repaymentPaymentDate"
            );

        const dueDate =
            getField(
                "repaymentDueDate"
            );

        const type =
            getField(
                "repaymentType"
            );

        const amount =
            getField(
                "repaymentAmount"
            );

        const paidBy =
            getField(
                "repaymentPaidBy"
            );

        const reference =
            getField(
                "repaymentReference"
            );

        const notes =
            getField(
                "repaymentNotes"
            );


        // Payment date = today

        const today =
            new Date();

        const yyyy =
            today.getFullYear();

        const mm =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const dd =
            String(
                today.getDate()
            ).padStart(2, "0");


        if (paymentDate) {

            paymentDate.value =
                `${yyyy}-${mm}-${dd}`;

        }


        // Keep dynamic EMI due date
        // if already populated

        if (type) {

            type.value =
                "regular_emi";

        }


        if (amount) {

            amount.value = "";

        }


        if (paidBy) {

            paidBy.value =
                "aadesh";

        }


        if (reference) {

            reference.value = "";

        }


        if (notes) {

            notes.value = "";

        }


        // Reset calculated values

        const calculatedIds = [

            "repaymentApplicableRate",
            "repaymentOpeningPrincipal",
            "repaymentInterestAmount",
            "repaymentPrincipalAmount",
            "repaymentClosingPrincipal"

        ];


        calculatedIds.forEach(
            id => {

                const element =
                    getField(id);

                if (!element) return;

                if (
                    id ===
                    "repaymentApplicableRate"
                ) {

                    element.textContent =
                        "—";

                } else {

                    element.textContent =
                        "₹0";

                }

            }
        );

    }


// =========================================================
// ROI HELPER - AVAILABLE FOR REPAYMENT SAVE
// =========================================================

function getApplicableROIByPaymentDate(
    selectedLoan,
    paymentDateValue
) {

    const fallbackRate =
        Number(
            selectedLoan?.interestRate || 0
        );

    if (!paymentDateValue) {
        return fallbackRate;
    }

    let roiHistory =
        Array.isArray(
            selectedLoan?.roiHistory
        )
            ? [...selectedLoan.roiHistory]
            : [];

    if (
        roiHistory.length === 0
    ) {
        return fallbackRate;
    }

    roiHistory =
        roiHistory
            .filter(
                item =>
                    item &&
                    item.effectiveFrom &&
                    Number(item.rate) > 0
            )
            .sort(
                (a, b) =>
                    String(
                        a.effectiveFrom
                    ).localeCompare(
                        String(
                            b.effectiveFrom
                        )
                    )
            );

    let applicableRate =
        fallbackRate;

    for (
        const item of roiHistory
    ) {

        if (
            String(
                item.effectiveFrom
            ) <=
            String(
                paymentDateValue
            )
        ) {

            applicableRate =
                Number(
                    item.rate
                );

        }

    }

    return applicableRate;
}

// =========================================
// TEMPORARY LOAN BALANCE DIAGNOSTIC
// =========================================

window.checkLoanBalanceDiagnostic = async function () {

    try {

        const loanId =
            "6pW3C6C0VVSwaoWfOozf";

        const userId =
            auth.currentUser.uid;

        // =========================================
        // LOAN MASTER
        // =========================================

        const loanRef =
            doc(
                db,
                "users",
                userId,
                "loans",
                loanId
            );

        const loanSnap =
            await getDoc(loanRef);

        if (!loanSnap.exists()) {

            console.error(
                "❌ Loan Master नहीं मिला"
            );

            return;
        }

        const loan =
            loanSnap.data();

        console.log(
            "========== LOAN MASTER =========="
        );

        console.log(
            "Loan ID:",
            loanId
        );

        console.log(
            "Loan Name:",
            loan.loanName
        );

        console.log(
            "Current Balance:",
            loan.outstandingBalance
        );

        console.log(
            "Remaining Tenure:",
            loan.remainingTenure
        );

        console.log(
            "EMI:",
            loan.emi
        );

        console.log(
            "ROI:",
            loan.interestRate
        );


        // =========================================
        // COMPLETED REPAYMENTS
        // =========================================

        const repaymentsRef =
            collection(
                db,
                "users",
                userId,
                "loanRepayments"
            );

        const repaymentSnap =
            await getDocs(
                repaymentsRef
            );

        const repayments = [];


        repaymentSnap.forEach(
            (repaymentDoc) => {

                const repayment =
                    repaymentDoc.data();

                if (
                    repayment.loanId === loanId &&
                    repayment.status === "completed"
                ) {

                    repayments.push({

                        id:
                            repaymentDoc.id,

                        ...repayment

                    });

                }

            }
        );


        // =========================================
        // SORT BY PAYMENT DATE
        // =========================================

        repayments.sort(
            (a, b) =>
                String(
                    a.paymentDate || ""
                ).localeCompare(
                    String(
                        b.paymentDate || ""
                    )
                )
        );


        console.log(
            "========== COMPLETED REPAYMENTS =========="
        );


        repayments.forEach(
            (r, index) => {

                console.log(

                    index + 1,

                    "| ID:",
                    r.id,

                    "| Date:",
                    r.paymentDate,

                    "| Type:",
                    r.repaymentType,

                    "| Amount:",
                    r.amount,

                    "| Principal:",
                    r.principalAmount,

                    "| Interest:",
                    r.interestAmount,

                    "| Before:",
                    r.outstandingBefore,

                    "| After:",
                    r.outstandingAfter,

                    "| Rate:",
                    r.rateApplied

                );

            }
        );


        // =========================================
        // LATEST REPAYMENT
        // =========================================

        const latest =
            repayments.length
                ? repayments[repayments.length - 1]
                : null;


        console.log(
            "========== LATEST REPAYMENT =========="
        );


        if (latest) {

            console.log(
                "Latest ID:",
                latest.id
            );

            console.log(
                "Latest Payment Date:",
                latest.paymentDate
            );

            console.log(
                "Latest Type:",
                latest.repaymentType
            );

            console.log(
                "Latest Amount:",
                latest.amount
            );

            console.log(
                "Latest Principal:",
                latest.principalAmount
            );

            console.log(
                "Latest Interest:",
                latest.interestAmount
            );

            console.log(
                "Latest Outstanding Before:",
                latest.outstandingBefore
            );

            console.log(
                "Latest Outstanding After:",
                latest.outstandingAfter
            );

        }


        // =========================================
        // BALANCE COMPARISON
        // =========================================

        const masterBalance =
            Number(
                loan.outstandingBalance || 0
            );

        const latestBalance =
            Number(
                latest?.outstandingAfter || 0
            );

        const difference =
            masterBalance -
            latestBalance;


        console.log(
            "========== BALANCE COMPARISON =========="
        );

        console.log(
            "Loan Master Balance:",
            masterBalance
        );

        console.log(
            "Latest Repayment Balance:",
            latestBalance
        );

        console.log(
            "Difference:",
            difference
        );


        // =========================================
        // SEARCH ₹7,481.24
        // =========================================

        console.log(
            "========== ₹7,481.24 SEARCH =========="
        );


        repayments.forEach(
            (r) => {

                const fields = {

                    amount:
                        Number(
                            r.amount || 0
                        ),

                    principalAmount:
                        Number(
                            r.principalAmount || 0
                        ),

                    interestAmount:
                        Number(
                            r.interestAmount || 0
                        ),

                    outstandingBefore:
                        Number(
                            r.outstandingBefore || 0
                        ),

                    outstandingAfter:
                        Number(
                            r.outstandingAfter || 0
                        )

                };


                Object.entries(fields)
                    .forEach(
                        ([field, value]) => {

                            if (
                                Math.abs(
                                    value -
                                    7481.24
                                ) < 0.01
                            ) {

                                console.warn(
                                    "⚠️ ₹7,481.24 MATCH →",
                                    field,
                                    r
                                );

                            }

                        }
                    );

            }
        );


        console.log(
            "========== DIAGNOSTIC COMPLETE =========="
        );


    } catch (error) {

        console.error(
            "❌ Diagnostic Error:",
            error
        );

    }

};

// =====================================================
// SAVE REPAYMENT
// =====================================================

async function saveFinalRepayment() {

        if (!auth.currentUser) {

            alert(
                "Please login first."
            );

            return;

        }


        const saveButton =
            getField(
                "saveRepaymentButton"
            );


        try {

            // =============================================
            // READ FORM
            // =============================================

            const loanSelect =
                getField(
                    "repaymentLoan"
                );

            const paymentDate =
                getField(
                    "repaymentPaymentDate"
                );

            const dueDate =
                getField(
                    "repaymentDueDate"
                );

            const repaymentType =
                getField(
                    "repaymentType"
                );

            const amount =
                getField(
                    "repaymentAmount"
                );

            const account =
                getField(
                    "repaymentAccount"
                );

            const paidBy =
                getField(
                    "repaymentPaidBy"
                );

            const reference =
                getField(
                    "repaymentReference"
                );

            const notes =
                getField(
                    "repaymentNotes"
                );

                const balanceTenureField =
    getField(
        "repaymentBalanceTenure"
    );

            // =============================================
            // VALIDATION
            // =============================================

            if (!loanSelect || !loanSelect.value) {

                alert(
                    "Please select Loan."
                );

                return;

            }


            if (
                !paymentDate ||
                !paymentDate.value
            ) {

                alert(
                    "Please select Payment Date."
                );

                return;

            }

// =============================================
// REGULAR EMI FUTURE / DUE DATE VALIDATION
// =============================================

if (
    repaymentType.value === "regular_emi"
) {

    const paymentDateValue =
        paymentDate.value || "";

    const dueDateValue =
        dueDate?.value || "";

    if (
        paymentDateValue &&
        dueDateValue
    ) {

        // -----------------------------------------
        // TODAY
        // -----------------------------------------

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        // -----------------------------------------
        // NEXT EMI DUE DATE
        // -----------------------------------------

        const dueDateObj =
            new Date(
                dueDateValue +
                "T00:00:00"
            );


        // -----------------------------------------
        // SELECTED PAYMENT DATE
        // -----------------------------------------

        const paymentDateObj =
            new Date(
                paymentDateValue +
                "T00:00:00"
            );


        // -----------------------------------------
        // FORMAT DUE DATE
        // -----------------------------------------

        const parts =
            dueDateValue.split("-");

        const formattedDueDate =
            `${parts[2]}-${parts[1]}-${parts[0]}`;


// =========================================
// PAYMENT DATE BEFORE DUE DATE NOT ALLOWED
// =========================================

if (
    paymentDateObj.getTime() <
    dueDateObj.getTime()
) {

    alert(
        "Your next EMI is due on " +
        formattedDueDate +
        ".\n\n" +
        "Payment Date cannot be before the EMI Due Date."
    );

    return;

}

    }

}
            const paymentAmount =
                Number(
                    amount?.value || 0
                );


            if (
                !paymentAmount ||
                paymentAmount <= 0
            ) {

                alert(
                    "Please enter Payment Amount."
                );

                return;

            }


            if (
                !account ||
                !account.value
            ) {

                alert(
                    "Please select Paid From Account."
                );

                return;

            }


            // =============================================
            // DISABLE BUTTON
            // =============================================

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "⏳ Saving...";

            }


            const userId =
                auth.currentUser.uid;


            // =============================================
            // GET SELECTED LOAN
            // =============================================

            const loansRef =
                getLoansCollectionRef();

            const loanSnapshot =
                await getDocs(
                    loansRef
                );


            let selectedLoan =
                null;

            let selectedLoanId =
                null;


            loanSnapshot.forEach(
                loanDoc => {

                    const loan =
                        loanDoc.data();


                    if (
                        loanDoc.id ===
                        loanSelect.value
                    ) {

                        selectedLoan =
                            loan;

                        selectedLoanId =
                            loanDoc.id;

                    }

                }
            );


            // Fallback:
            // dropdown may contain Loan Type

            if (!selectedLoan) {

                loanSnapshot.forEach(
                    loanDoc => {

                        const loan =
                            loanDoc.data();


                        if (
                            !selectedLoan &&
                            (
                                loan.loanType ===
                                loanSelect.value
                                ||
                                loan.loanName ===
                                loanSelect.value
                            )
                        ) {

                            selectedLoan =
                                loan;

                            selectedLoanId =
                                loanDoc.id;

                        }

                    }
                );

            }


            if (!selectedLoan) {

                alert(
                    "Selected loan record नहीं मिला."
                );

                return;

            }

// =============================================
// BALANCE TENURE
// =============================================

const balanceTenureBefore =
    Number(
        selectedLoan.remainingTenure || 0
    );


const balanceTenureAfter =
    Number(
        balanceTenureField?.value ||
        balanceTenureBefore
    );


if (
    !Number.isFinite(
        balanceTenureAfter
    ) ||
    balanceTenureAfter < 0
) {

    alert(
        "Please enter a valid Balance Tenure."
    );

    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "💾 Save Repayment";

    }

    return;

}

// =============================================
// CALCULATION
// =============================================

const openingOutstanding =
    Number(
        selectedLoan.outstandingBalance || 0
    );


const annualRate =
    getApplicableROIByPaymentDate(
        selectedLoan,
        paymentDate?.value || ""
    );


const emiAmount =
    Number(
        selectedLoan.emi || 0
    );


let interestAmount = 0;

let principalAmount =
    paymentAmount;

            // =============================================
            // REGULAR EMI
            // =============================================

            if (
                repaymentType?.value ===
                "regular_emi"
            ) {

                const payment =
                    new Date(
                        paymentDate.value +
                        "T00:00:00"
                    );


                let previousDate =
                    new Date(
                        payment
                    );


                const emiDay =
                    Number(
                        selectedLoan.emiDay || 10
                    );


                previousDate =
                    new Date(
                        payment.getFullYear(),
                        payment.getMonth() - 1,
                        emiDay
                    );


                const millisecondsPerDay =
                    1000 *
                    60 *
                    60 *
                    24;


                const actualDays =
                    Math.max(
                        1,
                        Math.round(
                            (
                                payment -
                                previousDate
                            ) /
                            millisecondsPerDay
                        )
                    );


                interestAmount =
                    openingOutstanding *
                    (
                        annualRate / 100
                    ) *
                    actualDays /
                    365;


                principalAmount =
                    Math.max(
                        0,
                        paymentAmount -
                        interestAmount
                    );


                // Never allow principal
                // above outstanding

                principalAmount =
                    Math.min(
                        principalAmount,
                        openingOutstanding
                    );

            }


            // =============================================
            // PREPAYMENT
            // =============================================

            else {

                interestAmount = 0;

                principalAmount =
                    Math.min(
                        paymentAmount,
                        openingOutstanding
                    );

            }


            const closingOutstanding =
                Math.max(
                    0,
                    openingOutstanding -
                    principalAmount
                );


            // =============================================
            // DUPLICATE PROTECTION
            // =============================================

            const repaymentsRef =
                collection(
                    db,
                    "users",
                    userId,
                    "loanRepayments"
                );


            const existingSnapshot =
                await getDocs(
                    repaymentsRef
                );


            let duplicateFound =
                false;


            existingSnapshot.forEach(
                repaymentDoc => {

                    const r =
                        repaymentDoc.data();

if (
    repaymentDoc.id ===
    window.editingRepaymentId
) {
    return;
}

                    if (
                        r.loanId ===
                        selectedLoanId &&
                        r.paymentDate ===
                        paymentDate.value &&
                        Number(
                            r.amount || 0
                        ) ===
                        paymentAmount &&
                        r.status !==
                        "deleted"
                    ) {

                        duplicateFound =
                            true;

                    }

                }
            );


            if (duplicateFound) {

                alert(
                    "यह repayment पहले से saved है.\n\nDuplicate entry नहीं बनाई गई."
                );

                return;

            }


            // =============================================
            // ACCOUNT NAME
            // =============================================

            let paymentAccountName =
                account.value;


            try {

                const accountRef =
                    doc(
                        db,
                        "users",
                        userId,
                        "accounts",
                        account.value
                    );


                const accountSnapshot =
                    await getDoc(
                        accountRef
                    );


                if (
                    accountSnapshot.exists()
                ) {

                    const accountData =
                        accountSnapshot.data();


                    paymentAccountName =
                        accountData.name ||
                        accountData.accountName ||
                        account.value;

                }

            } catch (accountError) {

                console.warn(
                    "Account name lookup skipped:",
                    accountError
                );

            }


            // =============================================
            // PAID BY NAME
            // =============================================

            const paidByNames = {

                shashi_bhushan_mishra:
                    "शशी भूषण मिश्र",

                aadesh:
                    "आदेश",

                shashi_mishra:
                    "शशी मिश्रा",

                other:
                    "Other"

            };


            const paidByValue =
                paidBy?.value || "";


            const paidByName =
                paidByNames[
                    paidByValue
                ] ||
                paidByValue ||
                "—";


            // =============================================
            // REPAYMENT RECORD
            // =============================================

            const repaymentRecord = {

                loanId:
                    selectedLoanId,

                loanType:
                    selectedLoan.loanType ||
                    "",

                loanName:
                    selectedLoan.loanName ||
                    "",

                paymentDate:
                    paymentDate.value,

                dueDate:
                    dueDate?.value ||
                    null,

                repaymentType:
                    repaymentType?.value ||
                    "regular_emi",

                amount:
                    paymentAmount,

                emiAmount:
                    repaymentType?.value ===
                    "regular_emi"
                        ? paymentAmount
                        : 0,

                principalAmount:
                    Number(
                        principalAmount.toFixed(2)
                    ),

                interestAmount:
                    Number(
                        interestAmount.toFixed(2)
                    ),

                prepaymentAmount:
                    (
                        repaymentType?.value ===
                        "principal_prepayment"
                        ||
                        repaymentType?.value ===
                        "part_prepayment"
                    )
                        ? paymentAmount
                        : 0,

                outstandingBefore:
                    Number(
                        openingOutstanding.toFixed(2)
                    ),

                outstandingAfter:
                    Number(
                        closingOutstanding.toFixed(2)
                    ),

                rateApplied:
                    annualRate,

                balanceTenureAfter:
    repaymentType?.value === "regular_emi"
        ? Math.max(
            0,
            Number(selectedLoan.remainingTenure || 0) - 1
          )
        : Number(
            getField("repaymentBalanceTenure")?.value ||
            selectedLoan.remainingTenure ||
            0
          ),
                balanceTenureAfter:
    Number(
        document.getElementById(
            "repaymentBalanceTenure"
        )?.value || 
        selectedLoan.remainingTenure ||
        0
    ),
                paymentAccount:
                    account.value,

                paymentAccountName:
                    paymentAccountName,

                paidBy:
                    paidByValue,

                paidByName:
                    paidByName,

                reference:
                    reference?.value.trim() ||
                    "",

                notes:
                    notes?.value.trim() ||
                    "",

                transactionIds:
                    [],

                source:
                    "Loan Repayment Management",

                status:
                    "completed",

                createdAt:
                    serverTimestamp(),

                createdBy:
                    userId,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    userId

            };


            // =============================================
// SAVE / UPDATE REPAYMENT RECORD
// =============================================

let repaymentDoc;

if (window.editingRepaymentId) {

    // =========================================
    // UPDATE EXISTING REPAYMENT
    // =========================================

    const existingRepaymentRef =
        doc(
            db,
            "users",
            userId,
            "loanRepayments",
            window.editingRepaymentId
        );

    await updateDoc(
        existingRepaymentRef,
        {
            ...repaymentRecord,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                userId
        }
    );

    repaymentDoc = {
        id: window.editingRepaymentId
    };

    console.log(
        "✏️ REPAYMENT UPDATED:",
        window.editingRepaymentId
    );

} else {

    // =========================================
    // CREATE NEW REPAYMENT
    // =========================================

    repaymentDoc =
        await addDoc(
            repaymentsRef,
            repaymentRecord
        );

    console.log(
        "✅ NEW REPAYMENT CREATED:",
        repaymentDoc.id
    );

}


            // =============================================
            // UPDATE LOAN MASTER
            // =============================================

            await updateDoc(
                doc(
                    loansRef,
                    selectedLoanId
                ),
                {

                    outstandingBalance:
                        Number(
                            closingOutstanding.toFixed(2)
                        ),

                    updatedAt:
                        serverTimestamp(),

                    updatedBy:
                        userId

                }
            );


            // =============================================
            // UPDATE CALCULATED VALUES
            // =============================================

            const rateElement =
                getField(
                    "repaymentApplicableRate"
                );

            const openingElement =
                getField(
                    "repaymentOpeningPrincipal"
                );

            const interestElement =
                getField(
                    "repaymentInterestAmount"
                );

            const principalElement =
                getField(
                    "repaymentPrincipalAmount"
                );

            const closingElement =
                getField(
                    "repaymentClosingPrincipal"
                );


            if (rateElement) {

                rateElement.textContent =
                    Number(
                        annualRate
                    ).toFixed(2) + "%";

            }


            if (openingElement) {

                openingElement.textContent =
                    formatMoney(
                        openingOutstanding
                    );

            }


            if (interestElement) {

                interestElement.textContent =
                    formatMoney(
                        interestAmount
                    );

            }


            if (principalElement) {

                principalElement.textContent =
                    formatMoney(
                        principalAmount
                    );

            }


            if (closingElement) {

                closingElement.textContent =
                    formatMoney(
                        closingOutstanding
                    );

            }


            // =============================================
            // SUCCESS
            // =============================================

            console.log(
                "========================================"
            );

            console.log(
                "✅ LOAN REPAYMENT SAVED"
            );

            console.log(
                "Repayment ID:",
                repaymentDoc.id
            );

            console.log(
                "Loan:",
                selectedLoan.loanName
            );

            console.log(
                "Amount:",
                paymentAmount
            );

            console.log(
                "Interest:",
                interestAmount
            );

            console.log(
                "Principal:",
                principalAmount
            );

            console.log(
                "Outstanding Before:",
                openingOutstanding
            );

            console.log(
                "Outstanding After:",
                closingOutstanding
            );

            console.log(
                "========================================"
            );


            alert(
                "✅ Loan Repayment saved successfully."
            );

            // =============================================
// EXIT EDIT MODE
// =============================================

window.editingRepaymentId = null;


            // =============================================
            // REFRESH DASHBOARD
            // =============================================

            if (
                typeof loadHomeLoanRepaymentDashboard ===
                "function"
            ) {

                await
                    loadHomeLoanRepaymentDashboard();

            }


            // =============================================
            // REFRESH HISTORY
            // =============================================

            await
                loadFinalRepaymentHistory();


            // =============================================
            // BUTTON RESET
            // =============================================

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "💾 Save Repayment";

            }


        } catch (error) {

            console.error(
                "❌ FINAL REPAYMENT SAVE ERROR:",
                error
            );


            alert(
                "❌ Repayment save नहीं हो पाया.\n\nConsole में error देखें."
            );


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "💾 Save Repayment";

            }

        }

    }

// =====================================================
// EDIT REPAYMENT RECORD
// =====================================================

document.addEventListener(
    "click",
    async function (event) {

        const editButton =
            event.target.closest(
                ".loan-repayment-edit-button"
            );

        if (!editButton) return;


        const repaymentId =
            editButton.dataset.repaymentId;

        if (!repaymentId) return;

        // =============================================
// STORE EDITING REPAYMENT ID
// =============================================

window.editingRepaymentId =
    repaymentId;

        try {

            const userId =
                auth.currentUser.uid;


            const repaymentRef =
                doc(
                    db,
                    "users",
                    userId,
                    "loanRepayments",
                    repaymentId
                );


            const repaymentSnap =
                await getDoc(repaymentRef);


            if (!repaymentSnap.exists()) {

                alert(
                    "❌ Repayment record नहीं मिला."
                );

                return;

            }


            const repayment =
                repaymentSnap.data();


// =============================================
// OPEN REPAYMENT FORM
// =============================================

const repaymentSection =
    document.getElementById(
        "loanRepaymentSection"
    );

if (repaymentSection) {

    repaymentSection.style.setProperty(
        "display",
        "block",
        "important"
    );

}


            // =============================================
            // FILL FORM
            // =============================================

            const loan =
                getField("repaymentLoan");

            const paymentDate =
                getField("repaymentPaymentDate");

            const dueDate =
                getField("repaymentDueDate");

            const type =
                getField("repaymentType");

            const amount =
                getField("repaymentAmount");

            const account =
                getField("repaymentAccount");

            const paidBy =
                getField("repaymentPaidBy");

            const reference =
                getField("repaymentReference");

            const notes =
                getField("repaymentNotes");

            const balanceTenure =
                getField(
                    "repaymentBalanceTenure"
                );


            if (loan) {

                loan.value =
                    repayment.loanId || "";

            }


            if (paymentDate) {

                paymentDate.value =
                    repayment.paymentDate || "";

            }


            if (dueDate) {

                dueDate.value =
                    repayment.dueDate || "";

            }


            if (type) {

                type.value =
                    repayment.repaymentType || "";

            }


            if (amount) {

                amount.value =
                    repayment.amount || "";

            }


            if (account) {

                account.value =
                    repayment.paymentAccount || "";

            }


            if (paidBy) {

                paidBy.value =
                    repayment.paidBy || "";

            }


            if (reference) {

                reference.value =
                    repayment.reference || "";

            }


            if (notes) {

                notes.value =
                    repayment.notes || "";

            }


            if (balanceTenure) {

                balanceTenure.value =
                    repayment.balanceTenureAfter ??
                    "";

            }


            // Recalculate preview

            if (
                typeof calculateRepaymentPreview ===
                "function"
            ) {

                calculateRepaymentPreview();

            }


            console.log(
                "✏️ REPAYMENT EDIT MODE:",
                repaymentId
            );


        } catch (error) {

            console.error(
                "❌ EDIT REPAYMENT ERROR:",
                error
            );

            alert(
                "❌ Repayment edit खोलने में समस्या हुई."
            );

        }

    }
);

    // =====================================================
    // CLICK HANDLER
    // =====================================================

    document.addEventListener(
        "click",
        async function (event) {


            // =============================================
            // SAVE
            // =============================================

            const saveButton =
                event.target.closest(
                    "#loanRepaymentSection #saveRepaymentButton"
                );


            if (saveButton) {

                await
                    saveFinalRepayment();

                return;

            }


            // =============================================
            // CANCEL
            // =============================================

            const cancelButton =
                event.target.closest(
                    "#loanRepaymentSection #cancelRepaymentButton"
                );


            if (cancelButton) {

                resetFinalRepaymentForm();

                console.log(
                    "↩️ REPAYMENT FORM RESET"
                );

                return;

            }

        }
    );


    // =====================================================
    // INITIAL HISTORY LOAD
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            async function () {

                await
                    loadFinalRepaymentHistory();

            }
        );

    } else {

        loadFinalRepaymentHistory();

    }


    // =====================================================
    // EXPOSE FOR FUTURE USE
    // =====================================================

    window.loadFinalRepaymentHistory =
        loadFinalRepaymentHistory;

    window.resetFinalRepaymentForm =
        resetFinalRepaymentForm;

    window.saveFinalRepayment =
        saveFinalRepayment;


})();

// =========================================================
// ADD REPAYMENT BUTTON → OPEN / CLOSE FORM
// =========================================================

(function () {

    document.addEventListener("click", async function (event) {

        const button =
            event.target.closest(
                "#openLoanRepaymentButton"
            );

        if (!button) return;


        const form =
            document.getElementById(
                "newLoanRepaymentEntry"
            );

        if (!form) {

            console.error(
                "❌ newLoanRepaymentEntry नहीं मिला"
            );

            return;

        }


        const isOpen =
            button.dataset.open === "true";


        // =================================================
        // CLOSE
        // =================================================

        if (isOpen) {

            form.style.setProperty(
                "display",
                "none",
                "important"
            );

            button.textContent =
                "➕ Add Repayment";

            button.style.background =
                "linear-gradient(135deg,#2563b8,#1d4ed8)";

            button.dataset.open =
                "false";

            console.log(
                "✖ Repayment Form CLOSED"
            );

            return;

        }


        // =================================================
        // OPEN
        // =================================================

        form.style.setProperty(
            "display",
            "block",
            "important"
        );


        button.textContent =
            "✖ Close Repayment";

            
        button.style.background =
            "linear-gradient(135deg,#64748b,#475569)";

        button.dataset.open =
            "true";


        // Load Home Loan data

        if (
            typeof loadHomeLoanRepaymentDashboard ===
            "function"
        ) {

            await
                loadHomeLoanRepaymentDashboard();

        }

// Refresh repayment history

if (
    typeof window.loadFinalRepaymentHistory ===
    "function"
) {

    await
        window.loadFinalRepaymentHistory();

}   

        // Calculate repayment values after loan data is loaded
setTimeout(() => {

    const repaymentType =
        document.getElementById(
            "repaymentType"
        );

    if (repaymentType) {

        repaymentType.dispatchEvent(
            new Event("change")
        );

    }

}, 100);

       // Refresh repayment calculation
const repaymentTypeSelect =
    document.getElementById(
        "repaymentType"
    );

if (repaymentTypeSelect) {

    repaymentTypeSelect.dispatchEvent(
        new Event("change")
    );

}

// =============================================
// SHOW AMOUNT VALIDATION WHEN FORM OPENS
// =============================================

const repaymentAmount =
    document.getElementById(
        "repaymentAmount"
    );

if (repaymentAmount) {

    const amountValidation =
        document.getElementById(
            "repaymentAmountValidation"
        );

    if (amountValidation) {

        amountValidation.style.display =
            "block";

    }

}   

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        console.log(
            "➕ Repayment Form OPENED"
        );

    });

})();

// =========================================================
// LIVE REPAYMENT CALCULATION
// PRINCIPAL PREPAYMENT + BALANCE TENURE
// READ / CALCULATION ONLY
// ❌ NO FIRESTORE WRITE
// =========================================================

(function () {

    function setupLiveRepaymentCalculation() {

        const section =
            document.getElementById(
                "loanRepaymentSection"
            );

        if (!section) return;


        const amount =
            section.querySelector(
                "#repaymentAmount"
            );

        const repaymentType =
            section.querySelector(
                "#repaymentType"
            );

        if (!amount || !repaymentType) return;


        // =================================================
        // ADD BALANCE TENURE CARD
        // =================================================

        const closingElement =
            section.querySelector(
                "#repaymentClosingPrincipal"
            );

        if (!closingElement) return;


        const calculatedGrid =
            closingElement.parentElement.parentElement;


        if (
            calculatedGrid &&
            !section.querySelector(
                "#repaymentBalanceTenure"
            )
        ) {

            const tenureCard =
                document.createElement("div");

            tenureCard.innerHTML = `

    <small>
        Balance Tenure
    </small>

    <div style="
        display:flex;
        align-items:center;
        gap:6px;
        margin-top:4px;
    ">

        <input
            type="number"
            id="repaymentBalanceTenure"
            min="0"
            step="1"
            value=""
            style="
                width:90px;
                padding:6px 8px;
                font-size:16px;
                font-weight:600;
                border:1px solid #cbd5e1;
                border-radius:6px;
                box-sizing:border-box;
            "
        >

        <span style="
            font-size:14px;
            color:#64748b;
        ">
            Months
        </span>

    </div>

`;

            calculatedGrid.appendChild(
                tenureCard
            );

        }

// =========================================================
// ROI HELPER - FIND APPLICABLE ROI BY PAYMENT DATE
// =========================================================

function getApplicableROIByPaymentDate(
    selectedLoan,
    paymentDateValue
) {

    const fallbackRate =
        Number(
            selectedLoan?.interestRate || 0
        );

    if (!paymentDateValue) {
        return fallbackRate;
    }

    let roiHistory =
        Array.isArray(
            selectedLoan?.roiHistory
        )
            ? [...selectedLoan.roiHistory]
            : [];

    if (
        roiHistory.length === 0
    ) {
        return fallbackRate;
    }

    roiHistory =
        roiHistory
            .filter(
                item =>
                    item &&
                    item.effectiveFrom &&
                    Number(item.rate) > 0
            )
            .sort(
                (a, b) =>
                    String(
                        a.effectiveFrom
                    ).localeCompare(
                        String(
                            b.effectiveFrom
                        )
                    )
            );

    let applicableRate =
        fallbackRate;

    for (
        const item of roiHistory
    ) {

        if (
            String(
                item.effectiveFrom
            ) <=
            String(
                paymentDateValue
            )
        ) {

            applicableRate =
                Number(
                    item.rate
                );

        }

    }

    return applicableRate;
}

        // =================================================
        // CALCULATION FUNCTION
        // =================================================
async function calculateRepaymentPreview() {

    const tenureElement =
        section.querySelector(
            "#repaymentBalanceTenure"
        );

    const openingElement =
        section.querySelector(
            "#repaymentOpeningPrincipal"
        );

    const interestElement =
        section.querySelector(
            "#repaymentInterestAmount"
        );

    const principalElement =
        section.querySelector(
            "#repaymentPrincipalAmount"
        );

    const closingElement =
        section.querySelector(
            "#repaymentClosingPrincipal"
        );


    if (!tenureElement) return;


    try {

        if (
            !auth ||
            !auth.currentUser
        ) {
            return;
        }


        // =================================================
        // GET SELECTED LOAN
        // =================================================

        const loanSelect =
            section.querySelector(
                "#repaymentLoan"
            );

        if (!loanSelect) return;


        const loansRef =
            getLoansCollectionRef();

        const loansSnapshot =
            await getDocs(
                loansRef
            );


        let selectedLoan = null;


        loansSnapshot.forEach(
            loanDoc => {

                const loan =
                    loanDoc.data();


                if (
                    loanDoc.id ===
                    loanSelect.value
                ) {

                    selectedLoan = {
                        id: loanDoc.id,
                        ...loan
                    };

                }

            }
        );


        // =================================================
        // FALLBACK
        // =================================================

        if (!selectedLoan) {

            loansSnapshot.forEach(
                loanDoc => {

                    const loan =
                        loanDoc.data();


                    if (
                        !selectedLoan &&
                        (
                            loan.loanType ===
                            loanSelect.value
                            ||
                            loan.loanName ===
                            loanSelect.value
                        )
                    ) {

                        selectedLoan = {
                            id: loanDoc.id,
                            ...loan
                        };

                    }

                }
            );

        }


        if (!selectedLoan) {
            return;
        }


        // =================================================
        // CURRENT LOAN VALUES
        // =================================================

        const openingPrincipal =
            Number(
                selectedLoan.outstandingBalance || 0
            );


        const paymentDateValue =
    section.querySelector(
        "#repaymentPaymentDate"
    )?.value || "";

const annualRate =
    getApplicableROIByPaymentDate(
        selectedLoan,
        paymentDateValue
    );


        const emi =
            Number(
                selectedLoan.emi || 0
            );


        const existingTenure =
            Number(
                selectedLoan.remainingTenure || 0
            );


        const paymentAmount =
            Number(
                amount.value || 0
            );

            // =================================================
// AMOUNT VALIDATION
// =================================================

let amountValidation =
    section.querySelector(
        "#repaymentAmountValidation"
    );

if (!amountValidation) {

    amountValidation =
        document.createElement("div");

    amountValidation.id =
        "repaymentAmountValidation";

    amountValidation.style.cssText = `
        color: #dc2626;
        font-size: 12px;
        font-weight: 700;
        margin-top: 5px;
        display: none;
    `;

    amountValidation.textContent =
        "Enter Amount";

    amount.parentElement.appendChild(
        amountValidation
    );

}


// =================================================
// AMOUNT EMPTY → STOP CALCULATION
// =================================================

if (
    !amount.value ||
    amount.value.trim() === ""
) {

    amountValidation.style.display =
        "block";

    if (openingElement) {
        openingElement.textContent = "₹0";
    }

    if (interestElement) {
        interestElement.textContent = "₹0";
    }

    if (principalElement) {
        principalElement.textContent = "₹0";
    }

    if (closingElement) {
        closingElement.textContent = "₹0";
    }

    tenureElement.value = "";

    return;

}


amountValidation.style.display =
    "none";

        let interestAmount = 0;

        let principalAmount = 0;

        let closingPrincipal =
            openingPrincipal;


        let balanceTenure =
            existingTenure;


        // =================================================
        // REGULAR EMI
        // =================================================

        if (
            repaymentType.value ===
            "regular_emi"
        ) {

            // ---------------------------------------------
            // BALANCE TENURE
            // One regular EMI reduces tenure by 1 month
            // ---------------------------------------------

            balanceTenure =
                Math.max(
                    0,
                    existingTenure - 1
                );


            // ---------------------------------------------
            // FINANCIAL CALCULATION
            // ---------------------------------------------

            if (
                paymentAmount > 0
            ) {

const paymentDateValue =
    section.querySelector(
        "#repaymentPaymentDate"
    )?.value || "";


let payment;

if (
    /^\d{4}-\d{2}-\d{2}$/.test(
        paymentDateValue
    )
) {

    payment = new Date(
        paymentDateValue +
        "T00:00:00"
    );

} else if (
    /^\d{2}-\d{2}-\d{4}$/.test(
        paymentDateValue
    )
) {

    const [
        dd,
        mm,
        yyyy
    ] =
        paymentDateValue.split("-");

    payment = new Date(
        `${yyyy}-${mm}-${dd}T00:00:00`
    );

} else {

    payment =
        new Date(
            paymentDateValue
        );

}

const dueDateValue =
    section.querySelector(
        "#repaymentDueDate"
    )?.value || "";


const dueDate =
    new Date(
        dueDateValue +
        "T00:00:00"
    );


const previousDueDate =
    new Date(
        dueDate.getFullYear(),
        dueDate.getMonth() - 1,
        dueDate.getDate()
    );


const millisecondsPerDay =
    1000 *
    60 *
    60 *
    24;


const actualDays =
    Math.max(
        1,
        Math.round(
            (
                dueDate -
                previousDueDate
            ) /
            millisecondsPerDay
        )
    );

                interestAmount =
                    openingPrincipal *
                    (
                        annualRate / 100
                    ) *
                    actualDays /
                    365;


                principalAmount =
                    Math.max(
                        0,
                        paymentAmount -
                        interestAmount
                    );


                principalAmount =
                    Math.min(
                        principalAmount,
                        openingPrincipal
                    );


                closingPrincipal =
                    Math.max(
                        0,
                        openingPrincipal -
                        principalAmount
                    );

            }

        }


        // =================================================
        // PRINCIPAL / PART PREPAYMENT
        // =================================================

        else {

            interestAmount = 0;


            principalAmount =
                Math.min(
                    paymentAmount,
                    openingPrincipal
                );


            closingPrincipal =
                Math.max(
                    0,
                    openingPrincipal -
                    principalAmount
                );


            // ---------------------------------------------
            // PREPAYMENT TENURE CALCULATION
            // ---------------------------------------------

            if (
                paymentAmount > 0 &&
                closingPrincipal > 0 &&
                annualRate > 0 &&
                emi > 0
            ) {

                const monthlyRate =
                    annualRate /
                    100 /
                    12;


                const denominator =
                    Math.log(
                        1 +
                        monthlyRate
                    );


                const newTenureBase =
                    emi -
                    (
                        monthlyRate *
                        closingPrincipal
                    );


                const originalTenureBase =
                    emi -
                    (
                        monthlyRate *
                        openingPrincipal
                    );


                if (
                    newTenureBase > 0 &&
                    originalTenureBase > 0
                ) {

                    const calculatedTenure =
                        Math.ceil(
                            Math.log(
                                emi /
                                newTenureBase
                            ) /
                            denominator
                        );


                    const originalCalculatedTenure =
                        Math.ceil(
                            Math.log(
                                emi /
                                originalTenureBase
                            ) /
                            denominator
                        );


                    const tenureReduction =
                        Math.max(
                            0,
                            originalCalculatedTenure -
                            calculatedTenure
                        );


                    balanceTenure =
                        Math.max(
                            0,
                            existingTenure -
                            tenureReduction
                        );

                }

            }

        }


        // =================================================
        // UPDATE FINANCIAL DISPLAY
        // =================================================

        const rateElement =
            section.querySelector(
                "#repaymentApplicableRate"
            );


        if (rateElement) {

            rateElement.textContent =
                annualRate.toFixed(2) +
                "%";

        }


        if (openingElement) {

            openingElement.textContent =
                "₹" +
                openingPrincipal.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }
                );

        }


        if (interestElement) {

            interestElement.textContent =
                "₹" +
                interestAmount.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }
                );

        }


        if (principalElement) {

            principalElement.textContent =
                "₹" +
                principalAmount.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }
                );

        }


        if (closingElement) {

            closingElement.textContent =
                "₹" +
                closingPrincipal.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }
                );

        }


        // =================================================
        // BALANCE TENURE INPUT
        // =================================================

        tenureElement.value =
            String(
                balanceTenure
            );


    } catch (error) {

        // UI calculation failure should not
        // break the repayment form.

        return;

    }

}

        // =================================================
        // INPUT CHANGE
        // =================================================

        amount.addEventListener(
            "input",
            calculateRepaymentPreview
        );


        repaymentType.addEventListener(
            "change",
            calculateRepaymentPreview
        );

const loanSelect =
    section.querySelector(
        "#repaymentLoan"
    );

if (loanSelect) {

    loanSelect.addEventListener(
        "change",
        calculateRepaymentPreview
    );

}

// INITIAL CALCULATION
calculateRepaymentPreview();

        console.log(
            "✅ LIVE LOAN PREPAYMENT CALCULATION READY"
        );

    }


    // =====================================================
    // WAIT FOR PAGE
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            setupLiveRepaymentCalculation
        );

    } else {

        setupLiveRepaymentCalculation();

    }

})();

// =========================================================
// ROI CHANGE FORM → OPEN / CLOSE
// =========================================================

(function () {

    document.addEventListener("click", function (event) {

        // ADD ROI CHANGE
        const addButton =
            event.target.closest("#addROIChangeBtn");

        if (addButton) {

            const form =
                document.getElementById("roiChangeForm");

            if (form) {

                form.style.display = "block";

            }

            return;
        }


        // CANCEL ROI CHANGE
        const cancelButton =
            event.target.closest("#cancelROIChangeBtn");

        if (cancelButton) {

            const form =
                document.getElementById("roiChangeForm");

            if (form) {

                form.style.display = "none";

            }

        }

    });

})();

// =========================================================
// REPAYMENT ROI CHANGE FORM → OPEN / CLOSE
// =========================================================

(function () {

    document.addEventListener("click", function (event) {

        // OPEN REPAYMENT ROI FORM
        const addButton =
            event.target.closest("#addRepaymentROIChangeBtn");

        if (addButton) {

            const form =
                document.getElementById(
                    "repaymentROIChangeForm"
                );

            if (form) {

                form.style.display = "block";

            }

            return;
        }


        // CLOSE REPAYMENT ROI FORM
        const cancelButton =
            event.target.closest(
                "#cancelRepaymentROIChangeBtn"
            );

        if (cancelButton) {

            const form =
                document.getElementById(
                    "repaymentROIChangeForm"
                );

            if (form) {

                form.style.display = "none";

            }

        }

    });

})();

// =========================================================
// REPAYMENT ROI PANEL - OPEN / CLOSE
// =========================================================

(function () {

    document.addEventListener("click", function (event) {

        // =========================================
        // CHANGE ROI → OPEN
        // =========================================

        const changeROIButton =
            event.target.closest("#changeRepaymentROIBtn");

        if (changeROIButton) {

            const panel =
                document.getElementById(
                    "repaymentROIChangePanel"
                );

            if (panel) {
                panel.style.display = "block";
            }

            return;
        }


        // =========================================
        // CANCEL → CLOSE + CLEAR
        // =========================================

        const cancelROIButton =
            event.target.closest("#cancelRepaymentROIBtn");

        if (cancelROIButton) {

            const panel =
                document.getElementById(
                    "repaymentROIChangePanel"
                );

            const rateInput =
                document.getElementById(
                    "repaymentNewROIRate"
                );

            const dateInput =
                document.getElementById(
                    "repaymentNewROIEffectiveFrom"
                );


            if (rateInput) {
                rateInput.value = "";
            }


            if (dateInput) {
                dateInput.value = "";
            }


            if (panel) {
                panel.style.display = "none";
            }

            return;
        }

    });

})();


// =========================================================
// REPAYMENT ROI HISTORY - OPEN / CLOSE
// =========================================================

(function () {

    document.addEventListener("click", function (event) {

        // =========================================
        // ROI HISTORY → OPEN
        // =========================================

        const historyButton =
            event.target.closest("#repaymentROIHistoryBtn");

        if (historyButton) {

            const changePanel =
                document.getElementById(
                    "repaymentROIChangePanel"
                );

            const historyPanel =
                document.getElementById(
                    "repaymentROIHistoryPanel"
                );

            if (changePanel) {
                changePanel.style.display = "none";
            }

            if (historyPanel) {
                historyPanel.style.display = "block";
            }

            return;
        }


        // =========================================
        // HISTORY CLOSE → BACK TO CHANGE ROI
        // =========================================

        const closeHistoryButton =
            event.target.closest(
                "#closeRepaymentROIHistoryBtn"
            );

        if (closeHistoryButton) {

            const changePanel =
                document.getElementById(
                    "repaymentROIChangePanel"
                );

            const historyPanel =
                document.getElementById(
                    "repaymentROIHistoryPanel"
                );

            if (historyPanel) {
                historyPanel.style.display = "none";
            }

            if (changePanel) {
                changePanel.style.display = "block";
            }

            return;
        }

    });

})();


// =========================================================
// REPAYMENT ROI HISTORY - LOAD FROM FIREBASE
// =========================================================

(function () {

    document.addEventListener("click", async function (event) {

        const historyButton =
            event.target.closest("#repaymentROIHistoryBtn");

        if (!historyButton) {
            return;
        }

        const historyContent =
            document.getElementById(
                "repaymentROIHistoryContent"
            );

        const repaymentSection =
            document.getElementById(
                "loanRepaymentSection"
            );

        const loanSelect =
            repaymentSection
                ? repaymentSection.querySelector(
                    "#repaymentLoan"
                )
                : null;

        if (!historyContent) {
            return;
        }

        if (!loanSelect || !loanSelect.value) {

            historyContent.innerHTML = `
                <div
                    style="
                        color:#dc2626;
                        font-size:13px;
                        padding:8px 0;
                        text-align:center;
                    "
                >
                    ⚠️ Please select a Loan first.
                </div>
            `;

            return;
        }

        try {

            historyContent.innerHTML = `
                <div
                    style="
                        color:#64748b;
                        font-size:13px;
                        padding:8px 0;
                        text-align:center;
                    "
                >
                    ⏳ Loading ROI history...
                </div>
            `;

            const loansRef =
                getLoansCollectionRef();

            const loansSnapshot =
                await getDocs(loansRef);

            let selectedLoan = null;

            loansSnapshot.forEach(
                (loanDoc) => {

                    if (
                        loanDoc.id ===
                        loanSelect.value
                    ) {
                        selectedLoan =
                            loanDoc.data();
                    }

                }
            );

            if (!selectedLoan) {

                historyContent.innerHTML = `
                    <div
                        style="
                            color:#dc2626;
                            font-size:13px;
                            padding:8px 0;
                            text-align:center;
                        "
                    >
                        ⚠️ Selected Loan could not be found.
                    </div>
                `;

                return;
            }

            let roiHistory =
                Array.isArray(
                    selectedLoan.roiHistory
                )
                    ? [...selectedLoan.roiHistory]
                    : [];

            // -----------------------------------------
            // BACKWARD COMPATIBILITY
            // -----------------------------------------

            if (
                roiHistory.length === 0 &&
                Number(
                    selectedLoan.interestRate || 0
                ) > 0
            ) {

                roiHistory.push({
                    rate:
                        Number(
                            selectedLoan.interestRate
                        ),

                    effectiveFrom:
                        selectedLoan.roiEffectiveFrom ||
                        selectedLoan.startDate ||
                        null
                });

            }

            // -----------------------------------------
            // SORT BY EFFECTIVE DATE
            // -----------------------------------------

            roiHistory.sort(
                (a, b) => {

                    return String(
                        a.effectiveFrom || ""
                    ).localeCompare(
                        String(
                            b.effectiveFrom || ""
                        )
                    );

                }
            );

            if (roiHistory.length === 0) {

                historyContent.innerHTML = `
                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                            padding:8px 0;
                            text-align:center;
                        "
                    >
                        No ROI history available.
                    </div>
                `;

                return;
            }

            // -----------------------------------------
// CHECK ROI HISTORY LOCK STATUS
// -----------------------------------------

const repaymentsRef =
    collection(
        db,
        "users",
        auth.currentUser.uid,
        "loanRepayments"
    );

const repaymentsSnapshot =
    await getDocs(
        repaymentsRef
    );

const loanRepayments = [];

repaymentsSnapshot.forEach(
    (repaymentDoc) => {

        const repayment =
            repaymentDoc.data();

        if (
            repayment.loanId ===
            loanSelect.value
        ) {

            loanRepayments.push(
                repayment
            );

        }

    }
);

const lockedROIIndexes =
    roiHistory.map(
        (item) => {

            const roiRate =
                Number(
                    item.rate || 0
                );

            if (!roiRate) {
                return false;
            }

            return loanRepayments.some(
                (repayment) => {

                    const appliedRate =
                        Number(
                            repayment.rateApplied || 0
                        );

                    return (
                        repayment.status ===
                            "completed"
                        &&
                        appliedRate > 0
                        &&
                        Math.abs(
                            appliedRate - roiRate
                        ) < 0.001
                    );

                }
            );

        }
    );    
            // -----------------------------------------
            // BUILD HISTORY TABLE
            // -----------------------------------------

            let rows = "";

            roiHistory.forEach(
    (item, index) => {

        const isROILocked =
    lockedROIIndexes[index] === true;

                    let displayDate =
                        item.effectiveFrom || "—";

                    if (
                        displayDate.includes("-")
                    ) {

                        const parts =
                            displayDate.split("-");

                        if (
                            parts.length === 3 &&
                            parts[0].length === 4
                        ) {

                            displayDate =
                                `${parts[2]}-${parts[1]}-${parts[0]}`;

                        }

                    }

                    rows += `
                        <tr>
                            <td
                                style="
                                    padding:8px 10px;
                                    border-bottom:1px solid #e2e8f0;
                                    text-align:center;
                                "
                            >
                                ${displayDate}
                            </td>

                            <td
                                style="
                                    padding:8px 10px;
                                    border-bottom:1px solid #e2e8f0;
                                    text-align:center;
                                    font-weight:700;
                                    color:#b45309;
                                "
                            >
                                ${Number(
                                    item.rate || 0
                                ).toFixed(2)}%
                            </td>

<td
    style="
        padding:8px 10px;
        border-bottom:1px solid #e2e8f0;
        text-align:center;
    "
>
    ${
        isROILocked
            ? `
                <span
                    style="
                        display:inline-block;
                        padding:5px 10px;
                        border:1px solid #cbd5e1;
                        border-radius:5px;
                        background:#f1f5f9;
                        color:#64748b;
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    🔒 Locked
                </span>
            `
            : `
                <button
                    type="button"
                    class="repaymentROIEditBtn"
                    data-roi-index="${index}"
                    style="
                        padding:5px 10px;
                        border:1px solid #2563eb;
                        border-radius:5px;
                        background:#eff6ff;
                        color:#1d4ed8;
                        font-size:12px;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="repaymentROIDeleteBtn"
                    data-roi-index="${index}"
                    style="
                        margin-left:6px;
                        padding:5px 10px;
                        border:1px solid #dc2626;
                        border-radius:5px;
                        background:#fef2f2;
                        color:#b91c1c;
                        font-size:12px;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    🗑️ Delete
                </button>
            `
    }
</td>

</tr>
                    `;

                }
            );

            historyContent.innerHTML = `
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
                                background:#f1f5f9;
                                color:#334155;
                            "
                        >

                            <th
                                style="
                                    padding:8px 10px;
                                    border-bottom:1px solid #cbd5e1;
                                    text-align:center;
                                "
                            >
                                W.E.F. Date
                            </th>

                            <th
                                style="
                                    padding:8px 10px;
                                    border-bottom:1px solid #cbd5e1;
                                    text-align:center;
                                "
                            >
                                ROI
                            </th>

                            <th
    style="
        padding:8px 10px;
        border-bottom:1px solid #cbd5e1;
        text-align:center;
    "
>
    Action
</th>
                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>
            `;

            console.log(
                "✅ ROI HISTORY LOADED:",
                roiHistory
            );

        } catch (error) {

            console.error(
                "❌ ERROR LOADING ROI HISTORY:",
                error
            );

            historyContent.innerHTML = `
                <div
                    style="
                        color:#dc2626;
                        font-size:13px;
                        padding:8px 0;
                        text-align:center;
                    "
                >
                    ❌ Unable to load ROI history.
                </div>
            `;

        }

    });

})();

// =========================================================
// REPAYMENT ROI HISTORY - EDIT BUTTON
// =========================================================

(function () {

    document.addEventListener("click", function (event) {

        const editButton =
            event.target.closest(".repaymentROIEditBtn");

        if (!editButton) {
            return;
        }

        const roiIndex =
            Number(
                editButton.dataset.roiIndex
            );

        console.log(
            "✏️ ROI EDIT CLICKED - INDEX:",
            roiIndex
        );

        const editForm =
    document.getElementById("repaymentROIEditForm");

if (editForm) {
    editForm.remove();
}

const currentRow =
    editButton.closest("tr");

const dateCell =
    currentRow?.querySelector("td:nth-child(1)");

const roiCell =
    currentRow?.querySelector("td:nth-child(2)");

const currentDate =
    dateCell
        ? dateCell.textContent.trim()
        : "";

const currentROI =
    roiCell
        ? roiCell.textContent
            .replace("%", "")
            .trim()
        : "";

const formHTML = `
    <div
    id="repaymentROIEditForm"
    data-roi-index="${roiIndex}"
    style="
            margin-top:12px;
            padding:12px;
            border:1px solid #93c5fd;
            border-radius:8px;
            background:#eff6ff;
        "
    >

        <strong
            style="
                color:#1e3a8a;
                font-size:13px;
            "
        >
            ✏️ Edit ROI
        </strong>

        <div
            style="
                display:grid;
                grid-template-columns:1fr 1fr auto auto;
                gap:10px;
                align-items:end;
                margin-top:10px;
            "
        >

            <div>
                <label
                    style="
                        display:block;
                        margin-bottom:4px;
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    W.E.F. Date
                </label>

                <input
                    type="date"
                    id="editRepaymentROIFrom"
                    value="${currentDate.split("-").reverse().join("-")}"
                    style="
                        width:100%;
                        min-height:36px;
                        box-sizing:border-box;
                    "
                >
            </div>

            <div>
                <label
                    style="
                        display:block;
                        margin-bottom:4px;
                        font-size:12px;
                        font-weight:700;
                    "
                >
                    ROI (%)
                </label>

                <input
                    type="number"
                    id="editRepaymentROIRate"
                    value="${currentROI}"
                    min="0"
                    step="0.01"
                    style="
                        width:100%;
                        min-height:36px;
                        box-sizing:border-box;
                    "
                >
            </div>

            <button
                type="button"
                id="saveEditedRepaymentROIBtn"
                style="
                    min-height:36px;
                    padding:6px 12px;
                    border:1px solid #16a34a;
                    border-radius:6px;
                    background:#16a34a;
                    color:white;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                💾 Save Changes
            </button>

            <button
                type="button"
                id="cancelEditedRepaymentROIBtn"
                style="
                    min-height:36px;
                    padding:6px 12px;
                    border:1px solid #94a3b8;
                    border-radius:6px;
                    background:white;
                    color:#475569;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                ✖ Cancel
            </button>

        </div>

    </div>
`;

const historyContent =
    document.getElementById(
        "repaymentROIHistoryContent"
    );

if (historyContent) {

    historyContent.insertAdjacentHTML(
        "beforeend",
        formHTML
    );

}

    });

    // =========================================================
// REPAYMENT ROI HISTORY - SAVE EDITED ROI
// =========================================================

document.addEventListener(
    "click",
    async function (event) {

        const saveButton =
            event.target.closest(
                "#saveEditedRepaymentROIBtn"
            );

        if (!saveButton) {
            return;
        }

        const editForm =
            document.getElementById(
                "repaymentROIEditForm"
            );

        const rateInput =
            document.getElementById(
                "editRepaymentROIRate"
            );

        const dateInput =
            document.getElementById(
                "editRepaymentROIFrom"
            );

        const historyContent =
            document.getElementById(
                "repaymentROIHistoryContent"
            );

        const repaymentSection =
            document.getElementById(
                "loanRepaymentSection"
            );

        const loanSelect =
            repaymentSection
                ? repaymentSection.querySelector(
                    "#repaymentLoan"
                )
                : null;

        const roiIndex =
    Number(
        editForm?.dataset.roiIndex
    );

        const newRate =
            Number(
                rateInput?.value || 0
            );

        const newDate =
            dateInput?.value || "";

        // =========================================
        // VALIDATION
        // =========================================

        if (
            !loanSelect ||
            !loanSelect.value
        ) {

            alert(
                "Please select a Loan first."
            );

            return;
        }

        if (
            !Number.isFinite(roiIndex) ||
            roiIndex < 0
        ) {

            alert(
                "ROI History entry could not be identified."
            );

            return;
        }

        if (
            !newRate ||
            newRate <= 0
        ) {

            alert(
                "Please enter a valid ROI."
            );

            return;
        }

        if (!newDate) {

            alert(
                "Please select W.E.F. Date."
            );

            return;
        }

        if (
            !auth ||
            !auth.currentUser
        ) {

            alert(
                "User session not available."
            );

            return;
        }

        try {

            saveButton.disabled = true;

            saveButton.textContent =
                "⏳ Saving...";

            // =====================================
            // GET LOAN
            // =====================================

            const loansRef =
                getLoansCollectionRef();

            const loansSnapshot =
                await getDocs(
                    loansRef
                );

            let selectedLoan = null;

            let selectedLoanId = null;

            loansSnapshot.forEach(
                (loanDoc) => {

                    if (
                        loanDoc.id ===
                        loanSelect.value
                    ) {

                        selectedLoan =
                            loanDoc.data();

                        selectedLoanId =
                            loanDoc.id;

                    }

                }
            );

            if (
                !selectedLoan ||
                !selectedLoanId
            ) {

                alert(
                    "Selected Loan could not be found."
                );

                return;
            }

            // =====================================
            // GET ROI HISTORY
            // =====================================

            let roiHistory =
                Array.isArray(
                    selectedLoan.roiHistory
                )
                    ? [
                        ...selectedLoan.roiHistory
                    ]
                    : [];

            if (
                !roiHistory[roiIndex]
            ) {

                alert(
                    "ROI History entry could not be found."
                );

                return;
            }

            // =====================================
            // UPDATE SELECTED ROI
            // =====================================

            roiHistory[roiIndex] = {

                ...roiHistory[roiIndex],

                rate:
                    Number(
                        newRate.toFixed(2)
                    ),

                effectiveFrom:
                    newDate

            };

            // =====================================
            // SORT BY W.E.F. DATE
            // =====================================

            roiHistory.sort(
                (a, b) => {

                    return String(
                        a.effectiveFrom || ""
                    ).localeCompare(
                        String(
                            b.effectiveFrom || ""
                        )
                    );

                }
            );

            // =====================================
            // SAVE TO FIRESTORE
            // =====================================

            await updateDoc(

                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "loans",
                    selectedLoanId
                ),

                {
                    roiHistory:
                        roiHistory,

                    updatedAt:
                        serverTimestamp(),

                    updatedBy:
                        auth.currentUser.uid
                }

            );

            alert(
                "✅ ROI updated successfully."
            );

            // =====================================
            // CLOSE EDIT FORM
            // =====================================

            if (editForm) {

                editForm.remove();

            }

            // =====================================
            // REFRESH ROI HISTORY
            // =====================================

            if (historyContent) {

    const historyButton =
        document.getElementById(
            "repaymentROIHistoryBtn"
        );

    if (historyButton) {

        historyButton.click();

    }

}

        } catch (error) {

            console.error(
                "❌ ERROR UPDATING ROI:",
                error
            );

            alert(
                "❌ Unable to update ROI.\n\n" +
                error.message
            );

        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "💾 Save Changes";

            }

        }

    }
);

// =========================================================
// REPAYMENT ROI HISTORY - CANCEL EDIT
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        const cancelButton =
            event.target.closest(
                "#cancelEditedRepaymentROIBtn"
            );

        if (!cancelButton) {
            return;
        }

        const editForm =
            document.getElementById(
                "repaymentROIEditForm"
            );

        if (editForm) {

            editForm.remove();

        }

    }
);

})();

// =========================================================
// REPAYMENT ROI - SAVE TO LOAN MASTER
// =========================================================

(function () {

    document.addEventListener("click", async function (event) {

        const saveROIButton =
            event.target.closest("#saveRepaymentROIBtn");

        if (!saveROIButton) {
            return;
        }


        // =========================================
        // GET INPUTS
        // =========================================

        const rateInput =
            document.getElementById(
                "repaymentNewROIRate"
            );

        const dateInput =
            document.getElementById(
                "repaymentNewROIEffectiveFrom"
            );

        const repaymentSection =
    document.getElementById(
        "loanRepaymentSection"
    );

const loanSelect =
    repaymentSection
        ? repaymentSection.querySelector(
            "#repaymentLoan"
        )
        : null;


        const newRate =
            Number(rateInput?.value || 0);

        const effectiveFrom =
            dateInput?.value || "";

        const loanValue =
            loanSelect?.value || "";


        // =========================================
        // VALIDATION
        // =========================================

        if (!loanValue) {

            alert(
                "Please select a Loan first."
            );

            return;
        }


        if (!newRate || newRate <= 0) {

            alert(
                "Please enter a valid New ROI."
            );

            return;
        }


        if (!effectiveFrom) {

            alert(
                "Please select W.E.F. Date."
            );

            return;
        }


        // =========================================
        // GET CURRENT USER
        // =========================================

        if (
            !auth ||
            !auth.currentUser
        ) {

            alert(
                "User session not available."
            );

            return;
        }


        const userId =
            auth.currentUser.uid;


        try {

            saveROIButton.disabled = true;

            saveROIButton.textContent =
                "⏳ Saving...";


            // =========================================
            // GET LOANS
            // =========================================

            const loansRef =
                getLoansCollectionRef();

            const loansSnapshot =
                await getDocs(
                    loansRef
                );


            let selectedLoan = null;

            let selectedLoanId = null;


            // =========================================
            // FIND SELECTED LOAN
            // =========================================

            loansSnapshot.forEach(
                loanDoc => {

                    const loan =
                        loanDoc.data();


                    if (
                        loanDoc.id ===
                        loanValue
                    ) {

                        selectedLoan =
                            loan;

                        selectedLoanId =
                            loanDoc.id;

                    }

                }
            );


            // =========================================
            // FALLBACK
            // =========================================

            if (!selectedLoan) {

                loansSnapshot.forEach(
                    loanDoc => {

                        const loan =
                            loanDoc.data();


                        if (
                            !selectedLoan &&
                            (
                                loan.loanType ===
                                loanValue
                                ||
                                loan.loanName ===
                                loanValue
                            )
                        ) {

                            selectedLoan =
                                loan;

                            selectedLoanId =
                                loanDoc.id;

                        }

                    }
                );

            }


            if (
                !selectedLoan ||
                !selectedLoanId
            ) {

                alert(
                    "Selected Loan could not be found."
                );

                return;
            }


            // =========================================
            // EXISTING ROI HISTORY
            // =========================================

            let roiHistory = Array.isArray(
                selectedLoan.roiHistory
            )
                ? [
                    ...selectedLoan.roiHistory
                ]
                : [];


            // =========================================
            // ADD CURRENT ROI AS BASELINE
            // =========================================

            if (
                roiHistory.length === 0 &&
                Number(
                    selectedLoan.interestRate || 0
                ) > 0
            ) {

                roiHistory.push({

                    rate:
                        Number(
                            selectedLoan.interestRate
                        ),

                    effectiveFrom:
                        selectedLoan.roiEffectiveFrom
                        ||
                        selectedLoan.startDate
                        ||
                        null

                });

            }


            // =========================================
            // ADD NEW ROI
            // =========================================

            roiHistory.push({

                rate:
                    Number(
                        newRate.toFixed(2)
                    ),

                effectiveFrom:
                    effectiveFrom

            });


            // =========================================
            // SORT ROI HISTORY
            // =========================================

            roiHistory.sort(
                (a, b) => {

                    return String(
                        a.effectiveFrom || ""
                    ).localeCompare(
                        String(
                            b.effectiveFrom || ""
                        )
                    );

                }
            );


            // =========================================
            // CHECK WHETHER NEW ROI IS CURRENT
            // =========================================

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const updateData = {

                roiHistory:
                    roiHistory,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    userId

            };


            // =========================================
            // UPDATE CURRENT ROI ONLY IF
            // EFFECTIVE DATE HAS ARRIVED
            // =========================================

            if (
                effectiveFrom <= today
            ) {

                updateData.interestRate =
                    Number(
                        newRate.toFixed(2)
                    );

                updateData.roiEffectiveFrom =
                    effectiveFrom;

            }


            // =========================================
            // SAVE TO LOAN MASTER
            // =========================================

            await updateDoc(

                doc(
                    db,
                    "users",
                    userId,
                    "loans",
                    selectedLoanId
                ),

                updateData

            );


            // =========================================
            // UPDATE HEADER IF CURRENT ROI CHANGED
            // =========================================

            const inlineROI =
                document.getElementById(
                    "repaymentCurrentROIInline"
                );


            if (
                inlineROI &&
                effectiveFrom <= today
            ) {

                inlineROI.textContent =
                    Number(newRate)
                        .toFixed(2) + "%";

            }


            // =========================================
            // CLEAR FORM
            // =========================================

            if (rateInput) {
                rateInput.value = "";
            }

            if (dateInput) {
                dateInput.value = "";
            }


            // =========================================
            // CLOSE PANEL
            // =========================================

            const panel =
                document.getElementById(
                    "repaymentROIChangePanel"
                );

            if (panel) {
                panel.style.display = "none";
            }


            alert(
                "ROI change saved successfully."
            );


            console.log(
                "✅ ROI HISTORY UPDATED:",
                roiHistory
            );


        } catch (error) {

            console.error(
                "❌ ERROR SAVING ROI:",
                error
            );

            alert(
                "Unable to save ROI. Please check Console."
            );

        } finally {

            saveROIButton.disabled =
                false;

            saveROIButton.textContent =
                "💾 Save ROI";

        }

    });

})();

// =========================================
// REPAYMENT ROI HISTORY - DELETE
// =========================================
document.addEventListener("click", async function (event) {

    const deleteButton =
        event.target.closest(".repaymentROIDeleteBtn");

    if (!deleteButton) return;

    const roiIndex =
        Number(deleteButton.dataset.roiIndex);

    if (Number.isNaN(roiIndex)) {
        alert("Invalid ROI selected.");
        return;
    }

    const confirmed = confirm(
        "क्या आप इस ROI History entry को Delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    try {

        // -----------------------------------------
        // CURRENT LOAN
        // -----------------------------------------
 const repaymentSection =
    document.getElementById(
        "loanRepaymentSection"
    );

const loanSelect =
    repaymentSection
        ? repaymentSection.querySelector(
            "#repaymentLoan"
        )
        : document.getElementById(
            "repaymentLoan"
        );

const selectedLoanId =
    loanSelect?.value || "";

        // -----------------------------------------
        // GET LOAN MASTER
        // -----------------------------------------
        const loansRef =
            getLoansCollectionRef();

        const loansSnapshot =
            await getDocs(loansRef);

        let selectedLoan = null;

        loansSnapshot.forEach((loanDoc) => {

            if (loanDoc.id === selectedLoanId) {
                selectedLoan = {
                    id: loanDoc.id,
                    ...loanDoc.data()
                };
            }

        });

        if (!selectedLoan) {
            alert("Selected Loan नहीं मिला.");
            return;
        }

        // -----------------------------------------
        // ROI HISTORY
        // -----------------------------------------
        let roiHistory =
            Array.isArray(selectedLoan.roiHistory)
                ? [...selectedLoan.roiHistory]
                : [];

        if (!roiHistory[roiIndex]) {
            alert("ROI History entry नहीं मिली.");
            return;
        }

        // -----------------------------------------
// SAFETY CHECK:
// LOCK ROI IF A COMPLETED REPAYMENT
// HAS ALREADY USED THIS ROI
// -----------------------------------------

const repaymentsRef =
    collection(
        db,
        "users",
        auth.currentUser.uid,
        "loanRepayments"
    );

const repaymentsSnapshot =
    await getDocs(repaymentsRef);

const roiToDelete =
    roiHistory[roiIndex];

const roiRate =
    Number(roiToDelete?.rate || 0);

const roiIsUsed =
    repaymentsSnapshot.docs.some(
        (repaymentDoc) => {

            const repayment =
                repaymentDoc.data();

            if (
                repayment.loanId !==
                selectedLoanId
            ) {
                return false;
            }

            if (
                repayment.status !==
                "completed"
            ) {
                return false;
            }

            const appliedRate =
                Number(
                    repayment.rateApplied || 0
                );

            return (
                appliedRate > 0 &&
                Math.abs(
                    appliedRate - roiRate
                ) < 0.001
            );

        }
    );

if (roiIsUsed) {

    alert(
        "🔒 This ROI is locked.\n\n" +
        "इस ROI पर repayment/EMI already process हो चुकी है, " +
        "इसलिए इसे Delete नहीं किया जा सकता।"
    );

    return;
}

        // -----------------------------------------
        // DELETE SELECTED ROI
        // -----------------------------------------
        roiHistory.splice(roiIndex, 1);

        // -----------------------------------------
        // UPDATE LOAN MASTER
        // -----------------------------------------
        await updateDoc(
            doc(
                db,
                "users",
                auth.currentUser.uid,
                "loans",
                selectedLoanId
            ),
            {
                roiHistory: roiHistory,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser.uid
            }
        );

        alert("ROI History successfully deleted.");

        // -----------------------------------------
        // REFRESH ROI HISTORY
        // -----------------------------------------
        const historyButton =
            document.getElementById(
                "repaymentROIHistoryBtn"
            );

        if (historyButton) {
            historyButton.click();
        }

    } catch (error) {

        console.error(
            "Error deleting ROI History:",
            error
        );

        alert(
            "ROI History delete करते समय error आया.\n\n" +
            error.message
        );
    }

});

// =====================================================
// MANAGE LOAN MASTER → VIEW LOAN
// READ ONLY
// =====================================================

document.addEventListener("click", async function (event) {

    const viewButton =
        event.target.closest(
            '[data-action="view-loan"]'
        );

    if (!viewButton) return;

    const loanId =
        viewButton.dataset.loanId;

    if (!loanId) {
        alert("Loan ID not found.");
        return;
    }

    try {

        // Get Loan Master collection
        const loansRef =
            getLoansCollectionRef();

        const snapshot =
            await getDocs(loansRef);

        let selectedLoan = null;

        snapshot.forEach((doc) => {

            if (doc.id === loanId) {

                selectedLoan = {
                    id: doc.id,
                    ...doc.data()
                };

            }

        });

        if (!selectedLoan) {

            alert(
                "Loan details could not be found."
            );

            return;
        }

// =================================================
// VIEW POPUP MONEY FORMATTER
// =================================================

const formatViewLoanAmount = (value) => {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

};

        // =================================================
        // VIEW POPUP
        // =================================================

        const existingPopup =
            document.getElementById(
                "manageLoanViewPopup"
            );

        if (existingPopup) {
            existingPopup.remove();
        }


        const popup =
            document.createElement("div");

        popup.id =
            "manageLoanViewPopup";

        popup.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(15,23,42,0.55);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:99999;
            padding:20px;
        `;


        popup.innerHTML = `

            <div style="
                width:min(650px,100%);
                max-height:90vh;
                overflow-y:auto;
                background:#ffffff;
                border-radius:18px;
                box-shadow:0 20px 60px
                    rgba(0,0,0,0.25);
                padding:25px;
            ">

                <!-- HEADER -->

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    margin-bottom:22px;
                ">

                    <div>

                        <div style="
                            font-size:22px;
                            font-weight:700;
                            color:#173f7a;
                        ">
                            👁 Loan Details
                        </div>

                        <div style="
                            margin-top:4px;
                            color:#64748b;
                            font-size:14px;
                        ">
                            Read-only Loan Master information
                        </div>

                    </div>

                    <button
                        type="button"
                        id="closeManageLoanView"
                        style="
                            border:none;
                            background:#f1f5f9;
                            color:#334155;
                            width:36px;
                            height:36px;
                            border-radius:50%;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ✕
                    </button>

                </div>


                <!-- LOAN NAME -->

                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:#eff6ff;
                    margin-bottom:15px;
                ">

                    <div style="
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:5px;
                    ">
                        Loan Name
                    </div>

                    <div style="
                        font-size:19px;
                        font-weight:700;
                        color:#173f7a;
                    ">
                        ${selectedLoan.loanName || "—"}
                    </div>

                </div>


                <!-- DETAILS GRID -->

                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(220px,1fr)
                        );
                    gap:12px;
                ">

                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Loan Type
                        </div>
                        <strong>
                            ${selectedLoan.loanType || "—"}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Lender
                        </div>
                        <strong>
                            ${selectedLoan.lender || "—"}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Account Number
                        </div>
                        <strong>
                            ${selectedLoan.accountNumber || "—"}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Original Loan Amount
                        </div>
                        <strong>
                            ${formatViewLoanAmount(
                                Number(
                                    selectedLoan.originalAmount || 0
                                )
                            )}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#eff6ff;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Outstanding Balance
                        </div>
                        <strong style="
                            color:#173f7a;
                            font-size:17px;
                        ">
                            ${formatViewLoanAmount(
                                Number(
                                    selectedLoan.outstandingBalance || 0
                                )
                            )}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#ecfdf5;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Monthly EMI
                        </div>
                        <strong style="
                            color:#15803d;
                            font-size:17px;
                        ">
                            ${formatViewLoanAmount(
                                Number(
                                    selectedLoan.emi || 0
                                )
                            )}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#fff7ed;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Interest Rate
                        </div>
                        <strong style="
                            color:#ea580c;
                            font-size:17px;
                        ">
                            ${Number(
                                selectedLoan.interestRate || 0
                            ).toFixed(2)}%
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#ecfeff;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Balance Tenure
                        </div>
                        <strong style="
                            color:#0f766e;
                            font-size:17px;
                        ">
                            ${Number(
                                selectedLoan.remainingTenure || 0
                            ).toLocaleString("en-IN")}
                            Months
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            EMI Day
                        </div>
                        <strong>
                            ${selectedLoan.emiDay || "—"}
                        </strong>
                    </div>


                    <div style="
                        padding:14px;
                        background:#f8fafc;
                        border-radius:10px;
                    ">
                        <div style="
                            font-size:12px;
                            color:#64748b;
                        ">
                            Status
                        </div>
                        <strong style="
                            color:#15803d;
                            text-transform:capitalize;
                        ">
                            ${selectedLoan.status || "—"}
                        </strong>
                    </div>

                </div>


                <!-- NOTES -->

                <div style="
                    margin-top:15px;
                    padding:14px;
                    background:#f8fafc;
                    border-radius:10px;
                ">

                    <div style="
                        font-size:12px;
                        color:#64748b;
                        margin-bottom:5px;
                    ">
                        Notes
                    </div>

                    <div style="
                        color:#334155;
                    ">
                        ${selectedLoan.notes || "—"}
                    </div>

                </div>


                <!-- CLOSE -->

                <div style="
                    margin-top:22px;
                    text-align:right;
                ">

                    <button
                        type="button"
                        id="closeManageLoanViewBottom"
                        style="
                            border:none;
                            padding:10px 24px;
                            border-radius:9px;
                            background:#2563eb;
                            color:white;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Close
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(popup);


        // =================================================
        // CLOSE POPUP
        // =================================================

        const closePopup = () => {

            const popupElement =
                document.getElementById(
                    "manageLoanViewPopup"
                );

            if (popupElement) {
                popupElement.remove();
            }

        };


        document
            .getElementById("closeManageLoanView")
            ?.addEventListener(
                "click",
                closePopup
            );


        document
            .getElementById("closeManageLoanViewBottom")
            ?.addEventListener(
                "click",
                closePopup
            );


        popup.addEventListener(
            "click",
            function (event) {

                if (event.target === popup) {
                    closePopup();
                }

            }
        );


    } catch (error) {

        console.error(
            "❌ View Loan Error:",
            error
        );

        alert(
            "Unable to load loan details. Please check Console."
        );

    }

});