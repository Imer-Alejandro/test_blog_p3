const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Validación de creación de publicaciones sin categorías', function () {
  this.timeout(30000);
  let driver;

  const username = `user__${Date.now()}`;
  const password = 'user123!';

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

  it('debería estar deshabilitado el selector de categoría si no hay categorías disponibles', async function () {
    await driver.get('https://blog-app-eosin-alpha.vercel.app/post/new');
    await driver.wait(until.elementLocated(By.id('categorySelect')), 5000);

    const categorySelect = await driver.findElement(By.id('categorySelect'));
    const isDisabled = await categorySelect.getAttribute('disabled');

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/fail_create_post.png', screenshot, 'base64');

    assert.ok(isDisabled, 'El selector de categoría debería estar deshabilitado cuando no existen categorías');
  });
});
