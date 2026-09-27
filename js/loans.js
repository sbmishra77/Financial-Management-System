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
// =========================================================

async function loadHomeLoanRepaymentDashboard() {

    if (!auth.currentUser) {
        console.log("❌ User not logged in");
        return;
    }

    try {

        const loansRef = getLoansCollectionRef();

        const loansSnapshot = await getDocs(loansRef);

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

            console.log("❌ Active Home Loan नहीं मिला");
            return;

        }


        // =================================================
        // FORMAT MONEY
        // =================================================

        const money = (value) => {

            return "₹" + Number(value || 0)
                .toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                });

        };


        // =================================================
        // TOP SUMMARY CARDS
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
                money(homeLoan.outstandingBalance);

        }


        // =================================================
// UPDATE LEFT HOME LOAN CARD
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
        money(homeLoan.outstandingBalance);

}

if (homeLoanCardEMI) {

    homeLoanCardEMI.textContent =
        money(homeLoan.emi);

}

        if (emi) {

            emi.textContent =
                money(homeLoan.emi);

        }

        if (rate) {

            rate.textContent =
                Number(homeLoan.interestRate).toFixed(2) + "%";

        }

        if (nextEmi) {

            nextEmi.textContent =
                "10-" +
                String(new Date().getMonth() + 2)
                    .padStart(2, "0") +
                "-" +
                new Date().getFullYear();

        }


        // =================================================
        // REPAYMENT LOAN SELECT
        // =================================================

        const repaymentLoan =
            document.getElementById(
                "repaymentLoan"
            );

        if (repaymentLoan) {

            const option =
                Array.from(
                    repaymentLoan.options
                ).find(
                    option =>
                        option.textContent
                            .trim()
                            === homeLoan.loanName
                );

            if (option) {

                repaymentLoan.value =
                    option.value;

            }

        }

// =========================================================
// HOME LOAN - DYNAMIC EMI DATE + PAYMENT ACCOUNT
// =========================================================

// EMI day Firestore Loan Master से आएगा
const emiDay = Number(homeLoan.emiDay || 10);


// =========================================================
// NEXT EMI DATE
// =========================================================

const today = new Date();

let emiYear = today.getFullYear();
let emiMonth = today.getMonth();

// पहले current month की EMI date बनाएँ
let nextEMIDate = new Date(
    emiYear,
    emiMonth,
    emiDay
);


// अगर आज EMI date के बाद है,
// तो अगले महीने की EMI date
if (today.getDate() > emiDay) {

    nextEMIDate = new Date(
        emiYear,
        emiMonth + 1,
        emiDay
    );

}


// DD-MM-YYYY format
const formattedNextEMIDate =
    String(nextEMIDate.getDate()).padStart(2, "0") +
    "-" +
    String(nextEMIDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    nextEMIDate.getFullYear();


// Dashboard में Next EMI दिखाएँ
const nextEMI =
    document.getElementById(
        "repaymentNextEMIDate"
    );

if (nextEMI) {

    nextEMI.textContent =
        formattedNextEMIDate;

}


// =========================================================
// PAYMENT ACCOUNT PREFILL
// =========================================================

const repaymentAccount =
    document.getElementById(
        "repaymentAccount"
    );

if (repaymentAccount) {

    // Loan Master में stored Aadesh Axis Bank account
    repaymentAccount.value =
        homeLoan.paymentAccount;

}


// =========================================================
// PAYMENT TYPE PREFILL
// =========================================================

const repaymentType =
    document.getElementById(
        "repaymentType"
    );

if (repaymentType) {

    repaymentType.value =
        "regular_emi";

}


// =========================================================
// EMI AMOUNT PREFILL
// =========================================================

const repaymentAmount =
    document.getElementById(
        "repaymentAmount"
    );

if (repaymentAmount) {

    repaymentAmount.value =
        homeLoan.emi;

}


// =========================================================
// EMI DUE DATE PREFILL
// =========================================================

const repaymentDueDate =
    document.getElementById(
        "repaymentDueDate"
    );

if (repaymentDueDate) {

    // HTML date input requires YYYY-MM-DD
    repaymentDueDate.value =
        nextEMIDate.toISOString()
            .split("T")[0];

}


// =========================================================
// CONSOLE TEST
// =========================================================

console.log(
    "📅 Dynamic EMI Day:",
    emiDay
);

console.log(
    "📅 Next EMI Date:",
    formattedNextEMIDate
);

console.log(
    "🏦 EMI Payment Account:",
    homeLoan.paymentAccount
);

console.log(
    "💰 EMI Amount:",
    homeLoan.emi
);
        // =================================================
        // CONSOLE CONFIRMATION
        // =================================================

        console.log(
            "✅ HOME LOAN DASHBOARD UPDATED"
        );

        console.log(
            "Outstanding:",
            money(homeLoan.outstandingBalance)
        );

        console.log(
            "EMI:",
            money(homeLoan.emi)
        );

        console.log(
            "Interest Rate:",
            homeLoan.interestRate + "%"
        );

        console.log(
            "EMI Day:",
            homeLoan.emiDay
        );

        console.log(
            "Loan ID:",
            homeLoan.id
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
                        "none",
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


                // Show repayment dashboard

                if (repaymentSection) {

                    repaymentSection.style.setProperty(
                        "display",
                        "block",
                        "important"
                    );

                }


                // Refresh Home Loan data

                await loadHomeLoanRepaymentDashboard();


                // Scroll to repayment dashboard

                if (repaymentSection) {

                    repaymentSection.scrollIntoView({
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