const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Cierre de sesión', function () {
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

  it('debería registrar, iniciar sesión y luego cerrar sesión correctamente', async function () {
    const username = 'user_logout_test';
    const password = 'test123_#logout';

    await driver.get('https://blog-app-eosin-alpha.vercel.app/register');
    await driver.wait(until.elementLocated(By.id('registerForm')), 5000);

    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.css('#registerForm button[type="submit"]')).click();

    await driver.wait(until.alertIsPresent(), 5000);
    await (await driver.switchTo().alert()).accept();

    await driver.get('https://blog-app-eosin-alpha.vercel.app/login');
    await driver.wait(until.elementLocated(By.id('loginForm')), 5000);
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.css('#loginForm button[type="submit"]')).click();

    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/dashboard'), 10000);

    const logoutBtn = await driver.wait(until.elementLocated(By.css('button.btn_out_session')), 5000);
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'})", logoutBtn);
    await driver.sleep(500); 
    await logoutBtn.click();

    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/login'), 5000).catch(async () => {
      await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/'), 5000);
    });

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('screenshots/logout_session.png', screenshot, 'base64');
  });
});
