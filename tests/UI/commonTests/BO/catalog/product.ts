// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import BO pages
import dashboardPage from '@pages/BO/dashboard';
import productsPage from '@pages/BO/catalog/products';
import addProductPage from '@pages/BO/catalog/products/add';

// Import data
import ProductData from '@data/faker/product';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

let browserContext: BrowserContext;
let page: Page;
let numberOfProducts: number;
let numberOfProductsToDelete: number;

/**
 * Function to create standard product
 * @param productData {ProductData} Data to set to create product
 * @param baseContext {string} String to identify the test
 */
function createProductTest(productData: ProductData, baseContext: string = 'commonTests-createProductTest'): void {
  describe(`PRE-TEST: Create product '${productData.name}'`, async () => {
    // before and after functions
    before(async function () {
      browserContext = await helper.createBrowserContext(this.browser);
      page = await helper.newTab(browserContext);
    });

    after(async () => {
      await helper.closeBrowserContext(browserContext);
    });

    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Catalog > Products\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPage', baseContext);

      await dashboardPage.goToSubMenu(page, dashboardPage.catalogParentLink, dashboardPage.productsLink);
      await productsPage.closeSfToolBar(page);

      const pageTitle = await productsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(productsPage.pageTitle);
    });

    it('should reset all filters and get number of products', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFiltersBeforeCreate', baseContext);

      const numberOfProducts = await productsPage.resetAndGetNumberOfLines(page);
      await expect(numberOfProducts).to.be.above(0);
    });

    it('should go to add product page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddProductPage', baseContext);

      await productsPage.goToAddProductPage(page);

      const pageTitle = await addProductPage.getPageTitle(page);
      await expect(pageTitle).to.contains(addProductPage.pageTitle);
    });

    it('should create product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createProduct', baseContext);

      const createProductMessage = await addProductPage.createEditBasicProduct(page, productData);
      await expect(createProductMessage).to.equal(addProductPage.settingUpdatedMessage);
    });
  });
}

/**
 * Function to delete product
 * @param productData {ProductData} Data to set to delete product
 * @param baseContext {string} String to identify the test
 */
function deleteProductTest(productData: ProductData, baseContext: string = 'commonTests-deleteProductTest'): void {
  describe(`POST-TEST: Delete product '${productData.name}'`, async () => {
    // before and after functions
    before(async function () {
      browserContext = await helper.createBrowserContext(this.browser);
      page = await helper.newTab(browserContext);
    });

    after(async () => {
      await helper.closeBrowserContext(browserContext);
    });

    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Catalog > Products\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPageToDelete', baseContext);

      await dashboardPage.goToSubMenu(page, dashboardPage.catalogParentLink, dashboardPage.productsLink);

      const pageTitle = await productsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(productsPage.pageTitle);
    });

    it('should delete product from dropdown menu', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteProduct', baseContext);

      const deleteTextResult = await productsPage.deleteProduct(page, productData);
      await expect(deleteTextResult).to.equal(productsPage.productDeletedSuccessfulMessage);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFiltersAfterDelete', baseContext);

      const numberOfProducts = await productsPage.resetAndGetNumberOfLines(page);
      await expect(numberOfProducts).to.be.above(0);
    });
  });
}

/**
 * Function to bulk delete product
 * @param productName {string} Value to set on product name input
 * @param baseContext {string} String to identify the test
 */
function bulkDeleteProductsTest(productName: string, baseContext: string = 'commonTests-bulkDeleteProductsTest'): void {
  describe('POST-TEST: Bulk delete created products', async () => {
    // before and after functions
    before(async function () {
      browserContext = await helper.createBrowserContext(this.browser);
      page = await helper.newTab(browserContext);
    });

    after(async () => {
      await helper.closeBrowserContext(browserContext);
    });

    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Catalog > Products\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPageToBulkDelete', baseContext);

      await dashboardPage.goToSubMenu(page, dashboardPage.catalogParentLink, dashboardPage.productsLink);

      const pageTitle = await productsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(productsPage.pageTitle);
    });

    it('should get number of products', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'getNumberOfProducts', baseContext);

      numberOfProducts = await productsPage.getNumberOfProductsFromList(page);
      await expect(numberOfProducts).to.be.at.least(0);
    });

    it('should filter products by name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToBulkDelete', baseContext);

      await productsPage.filterProducts(page, 'name', productName);

      numberOfProductsToDelete = await productsPage.getNumberOfProductsFromList(page);
      await expect(numberOfProductsToDelete).to.be.at.least(0);

      const textColumn = await productsPage.getProductNameFromList(page, 1);
      await expect(textColumn).to.contains(productName);
    });

    it('should delete products by bulk actions', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'bulkDeleteProducts', baseContext);

      const deleteTextResult = await productsPage.deleteAllProductsWithBulkActions(page);
      await expect(deleteTextResult).to.equal(productsPage.productMultiDeletedSuccessfulMessage);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetAfterBulkDelete', baseContext);

      const numberOfProductsAfterReset = await productsPage.resetAndGetNumberOfLines(page);
      await expect(numberOfProductsAfterReset).to.be.equal(numberOfProducts - numberOfProductsToDelete);
    });
  });
}

export {createProductTest, deleteProductTest, bulkDeleteProductsTest};
