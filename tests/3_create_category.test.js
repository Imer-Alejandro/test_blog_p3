const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
require('chromedriver');

describe('Crear categoría', function () {
  this.timeout(30000);
  let driver;

  const username = `user_cat_${Date.now()}`;
  const password = 'test123_#23121%_Q';
  const categoryName = 'Tecnología';

  before(async function () {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options())
      .build();

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    await driver.get('https://blog-app-eosin-alpha.vercel.app/register');
    await driver.wait(until.elementLocated(By.id('registerForm')), 5000);
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.css('#registerForm button[type="submit"]')).click();

    try {
      await driver.wait(until.alertIsPresent(), 5000);
      await (await driver.switchTo().alert()).accept();
    } catch (_) {}

    await driver.get('https://blog-app-eosin-alpha.vercel.app/login');
    await driver.wait(until.elementLocated(By.id('loginForm')), 5000);
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

  it('debería crear una nueva categoría correctamente', async function () {
    await driver.get('https://blog-app-eosin-alpha.vercel.app/categories');
    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/categories'), 5000);
    await driver.wait(until.elementLocated(By.id('categoryForm')), 5000);

    const nameInput = await driver.findElement(By.id('categoryNameInput'));
    await nameInput.clear();
    await nameInput.sendKeys(categoryName);

    const saveBtn = await driver.findElement(By.css('#categoryForm button[type="submit"]'));
    await saveBtn.click();

    await driver.sleep(1000);

    const categoryList = await driver.findElement(By.id('categoryList'));
    const categoryItems = await categoryList.findElements(By.tagName('li'));

    let categoryFound = false;
    for (let li of categoryItems) {
      const text = await li.getText();
      if (text.includes(categoryName)) {
        categoryFound = true;
        break;
      }
    }

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/create_category.png', screenshot, 'base64');

    if (!categoryFound) {
      throw new Error(`La categoría "${categoryName}" no se encontró en la lista.`);
    }
  });
});
