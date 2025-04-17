const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Editar categoría', function () {
  this.timeout(30000);
  let driver;

  const username = `user_edit_test_${Date.now()}`;
  const password = 'test123_Editar';
  const originalName = 'Categoría Original';
  const updatedName = 'Categoría Actualizada';

  before(async function () {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options())
      .build();

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    await driver.get('https://blog-app-eosin-alpha.vercel.app/register');
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.css('#registerForm button[type="submit"]')).click();

    try {
      await driver.wait(until.alertIsPresent(), 3000);
      await (await driver.switchTo().alert()).accept();
    } catch (_) {}

    await driver.get('https://blog-app-eosin-alpha.vercel.app/login');
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.css('#loginForm button[type="submit"]')).click();

    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/dashboard'), 5000);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('debería crear y luego editar una categoría existente', async function () {
    await driver.findElement(By.css('a[href="/categories"]')).click();
    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/categories'), 5000);
    await driver.wait(until.elementLocated(By.id('categoryForm')), 5000);

    const nameInput = await driver.findElement(By.id('categoryNameInput'));
    await nameInput.clear();
    await nameInput.sendKeys(originalName);
    await driver.findElement(By.css('#categoryForm button[type="submit"]')).click();

    await driver.sleep(1000);
    const categoryItems = await driver.findElements(By.css('#categoryList li'));
    assert.ok(categoryItems.length > 0, 'No se agregó ninguna categoría.');

    const editButton = await categoryItems[0].findElement(By.css('.btn-outline-primary'));
    await editButton.click();

    const input = await driver.findElement(By.id('categoryNameInput'));
    await driver.wait(async () => {
      const value = await input.getAttribute('value');
      return value === originalName;
    }, 3000);

    const beforeScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/before_edit_category.png', beforeScreenshot, 'base64');

    // Editar categoría
    await input.clear();
    await input.sendKeys(updatedName);
    await driver.findElement(By.css('#categoryForm button[type="submit"]')).click();

    await driver.sleep(1000); 

    const afterScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/after_edit_category.png', afterScreenshot, 'base64');

    const updatedItems = await driver.findElements(By.css('#categoryList li'));
    let updatedExists = false;
    for (let li of updatedItems) {
      const text = await li.getText();
      if (text.includes(updatedName)) {
        updatedExists = true;
        break;
      }
    }

    assert.strictEqual(updatedExists, true, `La categoría no fue actualizada correctamente a "${updatedName}".`);
  });
});
