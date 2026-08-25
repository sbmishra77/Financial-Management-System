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
                ".properties-section"
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


                    rentalManagementView.style.display =
                        "none";


                    propertiesSection.style.display =
                        "block";


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