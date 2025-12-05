import locators from "./selectors/locators";
import { faker } from '@faker-js/faker'
import { API_MESSAGES } from './utils/messages';


/**
 * Command to register a new user via API.
 * @param {Object} user - User object {name, email, password}
 * @param {boolean} [isAdmin=false] - If true, registers as admin. Defaults to false.
 */
Cypress.Commands.add('apiRegisterUser', (user, isAdmin = false) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('api_url')}/usuarios`,
        body: {
            nome: user.name,
            email: user.email,
            password: user.password,
            administrador: isAdmin ? 'true' : 'false'
        },
        failOnStatusCode: false
    }).then(response => {
        if (response.status !== 201 && response.status !== 400) {
           cy.log(`Register failed: ${response.body.message}`)
        }
    });
});

/**
 * Command to login via API and return the token.
 * @param {string} email 
 * @param {string} password 
 */
Cypress.Commands.add('apiLogin', (email, password) => {
    return cy.request({ // Return the chain so we can .then() it
        method: 'POST',
        url: `${Cypress.env('api_url')}/login`,
        body: {
            email: email,
            password: password
        },
        failOnStatusCode: false
    }).then(response => {
        expect(response.status).to.eq(200, API_MESSAGES.SUCCESS_LOGIN);
        return response.body.authorization;
    });
});

/**
 * Command to perform login via UI using session caching.
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} admin - If true, visits admin home; otherwise visits regular home
 */
Cypress.Commands.add('login', (email, password, admin) => {
    cy.session([email, password], () => {
        cy.visit(`${Cypress.env('front_url')}/login`)
        // Fill login form
        cy.get(locators.loginPage.fieldEmail)
            .should('be.visible')
            .type(email)
        
        cy.get(locators.loginPage.fieldPassword)
            .should('be.visible')
            .type(password, { log: false })

        // Setup intercept and submit
        cy.intercept('POST', `${Cypress.env('api_url')}/login`).as('loginApi')
        
        cy.get(locators.loginPage.btnSubmit)
            .should('be.visible')
            .click()
        
        cy.wait('@loginApi')

        // Assertions
        cy.url().should('include', '/login')
        cy.get(locators.loginPage.btnSubmit).should('be.visible')
    })

    // Navigate to the appropriate home page based on user role
    if (admin) {
        cy.visit(`${Cypress.env('front_url')}/admin/home`)
    } else {
        cy.visit(`${Cypress.env('front_url')}/home`)
    }
});

/**
 * Command to register a new product via UI.
 * Generates random data and uploads a random image.
 */
Cypress.Commands.add('registerProduct', () => {
    const randomProductName = faker.commerce.productName()
    
    // Store product name in env for later assertions
    Cypress.env('productName', randomProductName)

    // Navigate to product registration
    cy.get(locators.homePage.btnRegisterProducts)
        .should('be.visible')
        .click()

    // Fill product details
    cy.get(locators.productPage.fieldName)
        .should('be.visible')
        .type(randomProductName)

    cy.get(locators.productPage.fieldPrice)
        .should('be.visible')
        .type(faker.number.int({ min: 1, max: 1000 }).toString())

    cy.get(locators.productPage.fieldDescription)
        .should('be.visible')
        .type(faker.commerce.productDescription())

    cy.get(locators.productPage.fieldQuantity)
        .should('be.visible')
        .type(faker.number.int({ min: 1, max: 100 }).toString())

    // Handle image upload with a random image from picsum
    cy.get(locators.productPage.inputImage)
        .should('be.visible')
    
    cy.request({
        url: 'https://picsum.photos/200/300', // Fetch random image
        encoding: 'base64'
    }).then((response) => {
        const imageData = Cypress.Buffer.from(response.body, 'base64');
        cy.get(locators.productPage.inputImage)
            .selectFile({ contents: imageData, fileName: 'image.jpg', mimeType: 'image/jpeg', lastModified: Date.now() });
    })

    // Submit form
    cy.get(locators.productPage.btnSubmit)
        .should('be.visible')
        .click()

    // Verify navigation to product list
    cy.url().should('include', '/listarprodutos')

});

/**
 * Command to request product creation.
 * Does NOT assert success, allowing negative testing.
 */
Cypress.Commands.add('apiCreateProductRequest', (token, productData = {}) => {
    // Default data
    const defaultData = {
        nome: faker.commerce.productName() + ' ' + faker.string.uuid(),
        preco: faker.number.int({ min: 1, max: 1000 }),
        descricao: faker.commerce.productDescription(),
        quantidade: 50
    }
    
    // Mescla os dados default com os dados passados pelo teste (se houver)
    // O que vier em productData sobrescreve o defaultData
    const payload = { ...defaultData, ...productData }

    cy.log(payload)
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('api_url')}/produtos`,
        headers: { Authorization: token },
        body: payload,
        failOnStatusCode: false
    })
})

Cypress.Commands.add('productRegister', (adminToken) => {
  // Helper function to create a product via API
  // Reuses the generic request command to avoid code duplication
    return cy.apiCreateProductRequest(adminToken).then(res => {
      expect(res.status).to.eq(201)
      return res.body._id
    })
});

/**
 * Command to list products via API.
 */
Cypress.Commands.add('apiGetProducts', () => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('api_url')}/produtos`,
        failOnStatusCode: false
    }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('produtos')
        expect(response.body.produtos).to.be.an('array')
        expect(response.body.quantidade).to.be.greaterThan(0)
    });
});

/**
 * Command to add products to cart via API.
 * @param {string} token - Auth token
 * @param {Array} products - Array of product objects { idProduto: string, quantidade: number }
 */
Cypress.Commands.add('apiAddCart', (token, products) => {
    return cy.request({ 
        method: 'POST',
        url: `${Cypress.env('api_url')}/carrinhos`,
        headers: {
            'Authorization': token
        },
        body: {
            "produtos": products
        },
        failOnStatusCode: false
    });
});

/**
 * Command to cancel purchase/clear cart via API.
 * @param {string} token - Auth token
 */
Cypress.Commands.add('apiClearCart', (token) => {
    cy.request({
        method: 'DELETE',
        url: `${Cypress.env('api_url')}/carrinhos/cancelar-compra`,
        headers: {
            'Authorization': token
        },
        failOnStatusCode: false // Aceita falha caso não tenha carrinho para limpar
    }).then(() => {
        cy.log('Cart cleared (if existed)')
    });
});

/**
 * Command to register a new user via UI.
 * Uses Faker to generate random data.
 */
Cypress.Commands.add('registerUserUI', () => {
    const fakeName = faker.person.fullName()
    const fakeEmail = faker.internet.email()
    const fakePassword = faker.internet.password()

    cy.get(locators.loginPage.btnRegister).click();

    // Assertions
    cy.url().should('include', '/cadastrarusuarios')

    // Fill the form
    cy.get(locators.registerPage.fieldName)
        .should('be.visible')
        .type(fakeName)
    
    cy.get(locators.registerPage.fieldEmail)
        .should('be.visible')
        .type(fakeEmail)
    
    cy.get(locators.registerPage.fieldPassword)
        .should('be.visible')
        .type(fakePassword)
    
    cy.get(locators.registerPage.btnSubmit)
        .should('be.visible')
        .click()

    // Assertions
    cy.get(locators.registerPage.alertSuccess)
      .should('be.visible')
      .should('have.text', API_MESSAGES.SUCCESS_REGISTER)
    cy.url().should('include', '/home')
});

/**
 * Command to remove a product via UI.
 * @param {string} nome - Product name
 */
Cypress.Commands.add('removeProduct', (nome) => {
    cy.get(locators.homePage.btnListProducts)
        .should('be.visible')
        .click()

        cy.get(locators.productPage.fnBtnDelete(nome))
        .should('be.visible')
        .click()
})

/**
 * Command to assert that a product has been removed via UI.
 * @param {string} nome - Product name
 */
Cypress.Commands.add('assertProductRemoved', (nome) => {
    cy.intercept('GET', `${Cypress.env('front_url')}/admin/listarprodutos`).as('getListarProdutos')

    cy.wait('@getListarProdutos')
    
    cy.get(locators.productPage.fnProductRegisterSuccess(nome))
        .should('not.exist')
})