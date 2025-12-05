/// <reference types="cypress" />

import { faker } from '@faker-js/faker'
import { dataUser } from '../../support/utils/dataUser'
import { API_MESSAGES } from '../../support/utils/messages'

describe('API Tests - Endpoints', () => {

  let adminToken   // Authentication token for admin user
  const userAdmin = dataUser()  // Admin user data
  const userCommon = dataUser()  // Common user data

  // Before the tests, register the admin user and get the authentication token
  before(() => {
    // 1. Register the user
    cy.apiRegisterUser(userAdmin, true)
    
    // 2. Login and save token
    cy.apiLogin(userAdmin.email, userAdmin.password)
      .then(token => {
          adminToken = token
      })
  });

  context('POST /produtos', () => {
    
    it('should create a product successfully (201)', () => {
        cy.apiCreateProductRequest(adminToken).then(response => {
            expect(response.status).to.eq(201)
            expect(response.body.message).to.eq(API_MESSAGES.SUCCESS_REGISTER)
            expect(response.body).to.have.property('_id')
        })
    });

    it('should return error when creating duplicate product (400)', () => {
        const productName = 'Duplicate Product ' + faker.string.uuid()
        
        // 1. Create the first product (success)
        cy.apiCreateProductRequest(adminToken, { nome: productName }).then(res => {
            expect(res.status).to.eq(201)
        })

        // 2. Try to create the second with same name (error)
        cy.apiCreateProductRequest(adminToken, { nome: productName }).then(response => {
            expect(response.status).to.eq(400)
            expect(response.body.message).to.eq(API_MESSAGES.ERROR_DUPLICATE_PRODUCT)
        })
    });

    it('should return unauthorized without valid token (401)', () => {
        // Pass empty or invalid token
        cy.apiCreateProductRequest('').then(response => {
            expect(response.status).to.eq(401)
            expect(response.body.message).to.contain(API_MESSAGES.ERROR_UNAUTHORIZED)
        })
    });

    it('should return forbidden for non-admin users (403)', () => {
        // Register and login common user
        cy.apiRegisterUser(userCommon)
        cy.apiLogin(userCommon.email, userCommon.password).then(commonToken => {
            // Try to create product
            cy.apiCreateProductRequest(commonToken).then(response => {
                expect(response.status).to.eq(403)
                expect(response.body.message).to.eq(API_MESSAGES.ERROR_FORBIDDEN)
            })
        })
    });
  });

  context('GET /produtos', () => {
    it('should list all registered products', () => {
      // Create at least one product to ensure list is not empty (optional but good practice)
      cy.productRegister(adminToken)

      // Use the command and validate the response
      cy.apiGetProducts()
    });
  });

  context('POST /carrinhos - Adicionar produto ao carrinho', () => {
    let product1Id
    let product2Id

    beforeEach(() => {
      // Clean up any existing cart using the custom command
      cy.apiClearCart(adminToken) // <<<<<<< USO DO NOVO COMANDO

      // Create 2 fresh products for this test context
      cy.productRegister(adminToken).then(id => product1Id = id)
      cy.productRegister(adminToken).then(id => product2Id = id)
    });

    it('should add a product to the cart', () => {
      // Prepare the list of products
      const cartItems = [
          { idProduto: product1Id, quantidade: 1 },
          { idProduto: product2Id, quantidade: 1 }
      ]

      // Execute command and validate
      cy.apiAddCart(adminToken, cartItems).then((response) => {
        // Validate successful cart creation response
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq(API_MESSAGES.SUCCESS_REGISTER);
        expect(response.body).to.have.property('_id');
      })
    });
  });
});
