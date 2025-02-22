import LocalizationBasePage from '@pages/BO/international/localization/localizationBasePage';

import type CurrencyData from '@data/faker/currency';

import type {Page} from 'playwright';

/**
 * Add currency page, contains functions that can be used on the page
 * @class
 * @extends LocalizationBasePage
 */
class AddCurrency extends LocalizationBasePage {
  public readonly pageTitle: string;

  public readonly editCurrencyPage: string;

  private readonly currencySelect: string;

  private readonly alternativeCurrencyCheckBox: string;

  private readonly currencyNameInput: (id: number) => string;

  private readonly isoCodeInput: string;

  private readonly exchangeRateInput: string;

  private readonly precisionInput: string;

  private readonly statusToggleInput: (toggle: number) => string;

  private readonly saveButton: string;

  private readonly currencyLoadingModal: string;

  /**
   * @constructs
   * Setting up texts and selectors to use on add currency page
   */
  constructor() {
    super();

    this.pageTitle = `New currency • ${global.INSTALL.SHOP_NAME}`;
    this.editCurrencyPage = 'Editing currency';

    // Selectors
    this.currencySelect = '#currency_selected_iso_code';
    this.alternativeCurrencyCheckBox = '#currency_unofficial';
    this.currencyNameInput = (id: number) => `#currency_names_${id}`;
    this.isoCodeInput = '#currency_iso_code';
    this.exchangeRateInput = '#currency_exchange_rate';
    this.precisionInput = '#currency_precision';
    this.statusToggleInput = (toggle: number) => `#currency_active_${toggle}`;
    this.saveButton = '#save-button';

    // currency modal
    this.currencyLoadingModal = '#currency_loading_data_modal';
  }

  /*
  Methods
   */

  /**
   * Add official currency
   * @param page {Page} Browser tab
   * @param currencyData {CurrencyData} Data to set on add currency form
   * @returns {Promise<string>}, successful text message that appears
   */
  async addOfficialCurrency(page: Page, currencyData: CurrencyData): Promise<string> {
    // Select currency
    await page.selectOption(this.currencySelect, currencyData.isoCode);
    await this.waitForVisibleSelector(page, `${this.currencyLoadingModal}.show`);
    // Waiting for currency to be loaded : 10 sec max
    // To check if modal still exist
    let displayed = false;

    for (let i = 0; i < 50 && !displayed; i++) {
      /* eslint-env browser */
      displayed = await page.evaluate(
        (selector) => window.getComputedStyle(document.querySelector(selector))
          .getPropertyValue('display') === 'none',
        this.currencyLoadingModal,
      );
      await page.waitForTimeout(200);
    }

    // Wait for input to have value
    let inputHasValue = false;

    for (let i = 0; i < 50 && !inputHasValue; i++) {
      /* eslint-env browser */
      inputHasValue = await page.evaluate(
        (selector) => document.querySelector(selector).value !== '',
        this.currencyNameInput(1),
      );

      await page.waitForTimeout(200);
    }

    await this.setChecked(page, this.statusToggleInput(currencyData.enabled ? 1 : 0));
    await this.clickAndWaitForNavigation(page, this.saveButton);

    return this.getAlertSuccessBlockParagraphContent(page);
  }

  /**
   * Create unofficial currency
   * @param page {Page} Browser tab
   * @param currencyData {CurrencyData} Data to set on add currency form
   * @returns {Promise<string>}
   */
  async createUnOfficialCurrency(page: Page, currencyData: CurrencyData): Promise<string> {
    await this.setCheckedWithIcon(page, this.alternativeCurrencyCheckBox);
    await this.setValue(page, this.currencyNameInput(1), currencyData.name);
    await this.setValue(page, this.isoCodeInput, currencyData.isoCode);
    await this.setValue(page, this.exchangeRateInput, currencyData.exchangeRate.toString());
    await this.setChecked(page, this.statusToggleInput(currencyData.enabled ? 1 : 0));
    await this.clickAndWaitForNavigation(page, this.saveButton);

    return this.getAlertSuccessBlockParagraphContent(page);
  }

  /**
   * Update exchange rate
   * @param page {Page} Browser tab
   * @param value {number} Value to set on exchange rate input
   * @returns {Promise<string>}
   */
  async updateExchangeRate(page: Page, value: number): Promise<string> {
    await this.setValue(page, this.exchangeRateInput, value.toString());
    await this.clickAndWaitForNavigation(page, this.saveButton);

    return this.getAlertSuccessBlockParagraphContent(page);
  }

  /**
   * Set precision for a currency
   * @param page {Page} Browser tab
   * @param value {number} Value to set on exchange rate input
   * @return {Promise<string>}
   */
  async setCurrencyPrecision(page: Page, value: number = 2): Promise<string> {
    await this.setValue(page, this.precisionInput, value.toString());

    // Save new value
    await this.clickAndWaitForNavigation(page, this.saveButton);

    return this.getAlertSuccessBlockParagraphContent(page);
  }
}

export default new AddCurrency();
