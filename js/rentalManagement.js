/* =========================================
   RENTAL MANAGEMENT
   ========================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        const manageRentalTenantsButton =
            document.querySelector(
                "#manageRentalTenantsButton"
            );


        const backToPropertiesFromRentalButton =
            document.querySelector(
                "#backToPropertiesFromRentalButton"
            );


        const rentalManagementView =
            document.querySelector(
                "#rentalManagementView"
            );

const propertiesSection =
    document.querySelector(
        "#propertiesSection"
    );


        /* =========================================
           OPEN RENTAL MANAGEMENT
           ========================================= */

        if (
            manageRentalTenantsButton &&
            rentalManagementView &&
            propertiesSection
        ) {

            manageRentalTenantsButton.addEventListener(
                "click",
                () => {


                    propertiesSection.style.display =
                        "none";


                    rentalManagementView.style.display =
                        "block";


                    rentalManagementView.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                }
            );

        }


        /* =========================================
           BACK TO PROPERTIES
           ========================================= */

if (
    backToPropertiesFromRentalButton &&
    rentalManagementView &&
    propertiesSection
) {

    backToPropertiesFromRentalButton.addEventListener(
        "click",
        () => {

            // =================================
            // CLOSE RENTAL MANAGEMENT
            // =================================

            rentalManagementView.style.setProperty(
                "display",
                "none",
                "important"
            );


            // =================================
            // SHOW PROPERTIES AGAIN
            // =================================

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


            // =================================
            // HIDE OPEN SUB-VIEWS
            // =================================

            const allPropertiesView =
                document.getElementById(
                    "allPropertiesView"
                );

            const propertySummary =
                document.getElementById(
                    "propertySummary"
                );

            const propertyFormContainer =
                document.getElementById(
                    "propertyFormContainer"
                );

            const editPropertyFormContainer =
                document.getElementById(
                    "editPropertyFormContainer"
                );


            if (allPropertiesView) {

                allPropertiesView.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }

            if (propertySummary) {

                propertySummary.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }

            if (propertyFormContainer) {

                propertyFormContainer.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }

            if (editPropertyFormContainer) {

                editPropertyFormContainer.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

            }


            // =================================
            // RETURN TO PROPERTIES TOP
            // =================================

            propertiesSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


    }
);

/* =========================================
   ADD RENTAL UNIT / TENANT FORM
   ========================================= */

const addRentalUnitButton =
    document.querySelector(
        "#addRentalUnitButton"
    );


const rentalUnitFormContainer =
    document.querySelector(
        "#rentalUnitFormContainer"
    );


const cancelRentalUnitButton =
    document.querySelector(
        "#cancelRentalUnitButton"
    );


/* =========================================
   OPEN ADD RENTAL FORM
   ========================================= */

if (
    addRentalUnitButton &&
    rentalUnitFormContainer
) {

    addRentalUnitButton.addEventListener(
        "click",
        () => {

            rentalUnitFormContainer.style.display =
                "block";

            rentalUnitFormContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =========================================
   CANCEL ADD RENTAL FORM
   ========================================= */

if (
    cancelRentalUnitButton &&
    rentalUnitFormContainer
) {

    cancelRentalUnitButton.addEventListener(
        "click",
        () => {

            rentalUnitFormContainer.style.display =
                "none";

        }
    );

}