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
    serverTimestamp
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

const loanSummaryButton =
    document.getElementById("loanSummaryButton");

if (loanSummaryButton) {

    loanSummaryButton.addEventListener("click", async function () {

        const loanSummary =
            document.getElementById("loanSummary");

        const loanCards =
            document.querySelector(".loan-type-grid");

        const loanForm =
            document.getElementById("loanFormContainer");

        const loansList =
            document.getElementById("loansListContainer");


        /* Hide other Loan views */

        if (loanCards) {
            loanCards.style.setProperty(
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


        /* Load latest loan data */

        await loadSavedLoans();


        /* Show Summary */

        if (loanSummary) {

            const currentDisplay =
                getComputedStyle(loanSummary).display;

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

                if (loanCards) {
                    loanCards.style.setProperty(
                        "display",
                        "grid",
                        "important"
                    );
                }

            }

        }

    });

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