/// <reference types="cypress" />

import locators from "../../support/selectors/locators";
import { dataUser } from "../../support/utils/dataUser";
import { faker } from '@faker-js/faker'

describe('Frontend Tests - Login Page', () => {
    context('Register User', () => {
      it('should navigate to the signup page when clicking the register link', () => {
        cy.visit(`${Cypress.env('front_url')}/login`)
        // Register user via UI
        cy.registerUserUI()
      });
    });
  });

describe('Frontend Tests - Product Registration', () => {

  before(() => {
    // Register user and store in environment variable
    Cypress.env('user', dataUser())
    cy.apiRegisterUser(Cypress.env('user'), true)
  });

  beforeEach(() => {
    // Perform login as admin
    cy.login(Cypress.env('user').email, Cypress.env('user').password, true)
  })
  context('Manage Products', () => {
    it('should register a new product', () => {
      // register new product
      cy.registerProduct()

      // Assertions
      cy.then(() => {
        const productName = Cypress.env('productName')
        cy.get(locators.productPage.fnProductRegisterSuccess(productName)).should('be.visible')
      })
    });

    it('should remove a product', () => {
      const productName = 'Duplicate Product ' + faker.string.uuid()
      // take the token and create a product to remove then
      cy.window().then((window) => {
          const token = window.localStorage.getItem('serverest/userToken')
          cy.apiCreateProductRequest(token, { nome: productName })
      })
      // Remove the product
      cy.removeProduct(productName)
      // Assertions
      cy.assertProductRemoved(productName)   
    });
  });
});
