const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Registro de usuario', function () {
  this.timeout(20000);
  let driver;

  before(async function () {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options())
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('debería registrar un nuevo usuario', async function () {
    const username = `user_test_${Date.now()}`;
    const password = 'test123';

    await driver.get('https://blog-app-eosin-alpha.vercel.app/login');

    const registerLink = await driver.wait(
      until.elementLocated(By.linkText('¿No tienes cuenta? Regístrate')),
      5000
    );
    await registerLink.click();

    await driver.wait(until.elementLocated(By.id('registerForm')), 5000);
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/registro.png`, screenshot, 'base64');

    await driver.findElement(By.css('#registerForm button[type="submit"]')).click();

    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    console.log('Mensaje del alert:', alertText);
    await alert.accept();

    await driver.wait(until.urlContains('/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('/login'), 'No redirigió al login después del registro');
  });
});
