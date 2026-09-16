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