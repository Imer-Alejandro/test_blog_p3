const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Eliminar categoría', function () {
  this.timeout(30000);
  let driver;

  const username = `user_delete_${Date.now()}`;
  const password = 'test123_Eliminar';
  const categoryName = 'Temporal';

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

  it('debería registrar y luego eliminar una categoría', async function () {
    await driver.findElement(By.css('a[href="/categories"]')).click();
    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/categories'), 5000);
    await driver.wait(until.elementLocated(By.id('categoryForm')), 5000);

    const nameInput = await driver.findElement(By.id('categoryNameInput'));
    await nameInput.clear();
    await nameInput.sendKeys(categoryName);
    await driver.findElement(By.css('#categoryForm button[type="submit"]')).click();

    await driver.sleep(1000);

    const categoryList = await driver.findElement(By.id('categoryList'));
    const categoryItems = await categoryList.findElements(By.tagName('li'));

    assert.ok(categoryItems.length > 0, 'No se agregó ninguna categoría.');

    const beforeScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/before_delete_category.png', beforeScreenshot, 'base64');

    let categoryFound = false;
    for (let item of categoryItems) {
      const text = await item.getText();
      if (text.includes(categoryName)) {
        const deleteBtn = await item.findElement(By.css('.btn-outline-danger'));
        await deleteBtn.click();
        categoryFound = true;
        break;
      }
    }

    assert.ok(categoryFound, `No se encontró la categoría "${categoryName}" para eliminar.`);

    await driver.wait(until.alertIsPresent(), 3000);
    await (await driver.switchTo().alert()).accept();

    await driver.sleep(1000);

    const updatedItems = await driver.findElements(By.css('#categoryList li'));
    let categoryStillExists = false;
    for (let li of updatedItems) {
      const text = await li.getText();
      if (text.includes(categoryName)) {
        categoryStillExists = true;
        break;
      }
    }

    const afterScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/after_delete_category.png', afterScreenshot, 'base64');

    assert.strictEqual(categoryStillExists, false, `La categoría "${categoryName}" no fue eliminada correctamente.`);
  });
});
