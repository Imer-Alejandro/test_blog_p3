const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const assert = require('assert');
require('chromedriver');

describe('Crear categoría y publicación correctamente', function () {
  this.timeout(30000); 
  let driver;

  const username = 'user_test';
  const password = 'test123_#23121%_Q';
  const categoryName = 'Tecnología';
  const tituloPost = 'Nuevo avance en IA';
  const contenidoPost = 'Hoy se anunció un nuevo modelo de lenguaje.';

  before(async function () {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options())
      .build();

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

  it('debería crear una nueva categoría y una publicación, luego mostrarla en el home', async function () {
    await driver.get('https://blog-app-eosin-alpha.vercel.app/categories');
    await driver.wait(until.elementLocated(By.id('categoryForm')), 5000);

    const nameInput = await driver.findElement(By.id('categoryNameInput'));
    await nameInput.clear();
    await nameInput.sendKeys(categoryName);

    const saveBtn = await driver.findElement(By.css('#categoryForm button[type="submit"]'));
    await saveBtn.click();

    await driver.sleep(1000);

    const categoriesList = await driver.findElements(By.css('#categoryList li'));
    let categoriaEncontrada = false;
    for (let item of categoriesList) {
      const text = await item.getText();
      if (text.includes(categoryName)) {
        categoriaEncontrada = true;
        break;
      }
    }
    assert.ok(categoriaEncontrada, ' La categoría no fue encontrada en la lista.');

    await driver.get('https://blog-app-eosin-alpha.vercel.app/post/new');
    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/post/new'), 5000);

    await driver.findElement(By.id('title')).sendKeys(tituloPost);
    await driver.findElement(By.id('content')).sendKeys(contenidoPost);

    await driver.wait(until.elementLocated(By.id('categorySelect')), 5000);
    const categorySelect = await driver.findElement(By.id('categorySelect'));
    await categorySelect.click();
    const categoryOption = await driver.findElement(By.xpath(`//select[@id='categorySelect']/option[contains(., '${categoryName}')]`));
    await categoryOption.click();

    const submitBtn = await driver.findElement(By.css('#newPostForm button[type="submit"]'));
    await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
    await driver.executeScript("arguments[0].click();", submitBtn);

    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      await alert.accept(); 
    } catch (err) {
      console.log('No se encontró la alerta o ya fue manejada');
    }

    await driver.wait(until.urlIs('https://blog-app-eosin-alpha.vercel.app/dashboard'), 5000);

    const postCards = await driver.findElements(By.css('.card-title'));
    let postEncontrado = false;
    for (let card of postCards) {
      const text = await card.getText();
      if (text.includes(tituloPost)) {
        postEncontrado = true;
        break;
      }
    }
    assert.ok(postEncontrado, ' La publicación no se encontró en el dashboard.');

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(`screenshots/publicacion_${Date.now()}.png`, screenshot, 'base64');
  });
});
