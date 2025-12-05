# ServeRest - Test Project

This project contains End-to-End (E2E) and API automated tests for the [ServeRest](https://front.serverest.dev/) application using Cypress. The goal is to validate critical flows such as user registration, login, product management, and shopping carts, combining both API and GUI validations.

## 🚀 Technologies Used

* **Test Framework:** [Cypress](https://www.cypress.io/)
* **Data Generation:** [@faker-js/faker](https://fakerjs.dev/)
* **Test Reports:** [Cypress Mochawesome Reporter](https://github.com/LironEr/cypress-mochawesome-reporter)
* **CI/CD:** GitHub Actions

---

## 📋 Prerequisites

Before starting, you need to have [Node.js](https://nodejs.org/en/) (LTS version recommended) installed on your machine.

---

## ⚙️ Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/jansenmelo/serverestCypress
    cd serverestCypress
    ```

2.  Install project dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    The project uses the `cypress.env.json` file in the root directory to define URLs and credentials. **This file is intended for local execution only and should not be committed with sensitive real data.**
    
    Ensure it contains the necessary keys:
    ```json
    {
        "api_url": "https://serverest.dev",
        "front_url": "https://front.serverest.dev",
    }
    ```

---

## 🧪 Test Structure

### 1. API (`cypress/e2e/apiServerRest/apiServerRest.cy.js`)
Tests focused on the backend layer, validating REST endpoints:
- **Login:** Authentication validation (200) and failures (401).
- **Products:**
    - Complete product CRUD.
    - Business rule validation (integer price, duplicate names).
    - Automatic data handling (creates dummy products if stock is insufficient).
- **Carts:**
    - Adding products to the cart validating stock.
    - Environment cleanup (DELETE) before tests.

### 2. Frontend (`cypress/e2e/frontServeRest/frontServeRest.cy.js`)
E2E tests focused on the user interface:
- **Hybrid Flow:** User registration via API -> Login via GUI.
- **Product Registration:** Complete registration flow via interface, including image upload (base64).
- **Page Objects:** Using `cypress/support/selectors/locators.js` to centralize selectors.
- **Custom Commands:** `cy.login()`, `cy.registerProductUI()`, `cy.apiRegisterUser()` encapsulating repetitive logic.

---

## ▶️ Running Tests

This project has two main execution modes.

### 1. Interactive Mode (Cypress Open)

To open the Cypress graphical interface, run tests individually, and see execution in real-time:

```bash
npx cypress open
```

### 2. Headless Mode (Cypress Run)

To run all tests in the background (ideal for CI/CD) and generate the test report:

```bash
npm test
```

---

## 📊 Viewing the Report

After running the ```npm test``` command, the HTML test report will be automatically generated using Mochawesome.

Open the file:

```bash
cypress/reports/mochawesome/index.html
```

---

## 🤖 Automation & CI/CD (GitHub Actions)

This repository uses a CI/CD workflow (```.github/workflows/ci.yml```) to automate test execution.

The workflow is triggered automatically on the following events:

1. **Push to main:** Runs on every push or merge to the main branch.
2. **Pull Request:** Runs on every Pull Request opening or update targeting the main branch.
3. **Manual Trigger:** Can be triggered manually via the GitHub "Actions" tab.


After execution on the main branch, the workflow publishes the final Mochawesome report to GitHub Pages.
