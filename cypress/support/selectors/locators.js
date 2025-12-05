const locators = {

    loginPage: {
        btnRegister: '[data-testid="cadastrar"]',
        fieldEmail: '[data-testid="email"]',
        fieldPassword: '[data-testid="senha"]',
        btnSubmit: '[data-testid="entrar"]',
    },
    registerPage: {
        fieldName: '[data-testid="nome"]',
        fieldEmail: '[data-testid="email"]',
        fieldPassword: '[data-testid="password"]',
        btnSubmit: '[data-testid="cadastrar"]',
        alertSuccess: '.alert-link',
    },
    homePage: {
        btnLogout: '[data-testid="logout"]',
        btnRegisterProducts: '[data-testid="cadastrarProdutos"]',
        btnListProducts: '[data-testid="listarProdutos"]',
    },
    productPage: {
        fieldName: '[data-testid="nome"]',
        fieldPrice: '[data-testid="preco"]',
        fieldDescription: '[data-testid="descricao"]',
        fieldQuantity: '[data-testid="quantity"]',
        btnSubmit: '[data-testid="cadastarProdutos"]',
        inputImage: '[data-testid="imagem"]',
        // Using contains from Cypress for text
        fnProductRegisterSuccess: (productName) => `td:contains("${productName}")`,
        fnBtnDelete: (productName) => `tr:contains("${productName}") .btn-danger`
    },
}

export default locators
