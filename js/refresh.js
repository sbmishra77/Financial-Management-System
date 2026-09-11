// ======================================================
// GLOBAL MODULE DATA REFRESH
// ======================================================

async function refreshModuleData(moduleName) {

    console.log("🔄 Refreshing module:", moduleName);

    try {

        // ------------------------------------------
        // TRANSACTIONS
        // ------------------------------------------

        if (moduleName === "transactions") {

            if (typeof initializeTransactionMasterData === "function") {
                await initializeTransactionMasterData();
            }

            if (typeof loadTransactionAccounts === "function") {
                await loadTransactionAccounts();
            }

            if (typeof loadTransactionParties === "function") {
                loadTransactionParties();
            }

            if (typeof loadTransactionInvestments === "function") {
                await loadTransactionInvestments();
            }

            if (typeof loadSavedTransactions === "function") {
                await loadSavedTransactions();
            }
        }


        // ------------------------------------------
        // ACCOUNTS
        // ------------------------------------------

        if (moduleName === "accounts") {

            if (typeof loadAccounts === "function") {
                await loadAccounts();
            }
        }


        // ------------------------------------------
        // INVESTMENTS
        // ------------------------------------------

        if (moduleName === "investments") {

            if (typeof loadInvestments === "function") {
                await loadInvestments();
            }
        }


        // ------------------------------------------
        // INSURANCE
        // ------------------------------------------

        if (moduleName === "insurance") {

            if (typeof loadInsurance === "function") {
                await loadInsurance();
            }
        }


        // ------------------------------------------
        // PROPERTIES
        // ------------------------------------------

        if (moduleName === "properties") {

            if (typeof loadProperties === "function") {
                await loadProperties();
            }
        }


        // ------------------------------------------
        // LOANS
        // ------------------------------------------

        if (moduleName === "loans") {

            if (typeof loadLoans === "function") {
                await loadLoans();
            }
        }


        console.log(
            "✅ Module refresh completed:",
            moduleName
        );

    } catch (error) {

        console.error(
            "❌ Module refresh error:",
            moduleName,
            error
        );

    }
}


// Make globally available
window.refreshModuleData =
    refreshModuleData;