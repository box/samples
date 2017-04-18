import { browser, element, by } from 'protractor';

export class AdminPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('box-root h1')).getText();
  }
}
