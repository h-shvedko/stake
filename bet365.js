const fileSystem = require('fs');
const constants = require("./constants.js");
const {browser, element} = require("protractor");
let until;
async function writeLog(d) {
    console.log(d);
    // log_file.write(util.format(d) + '\n');
}

describe('Login ', function () {

    const EC = protractor.ExpectedConditions;

    beforeAll(async function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
        browser.waitForAngularEnabled(false);
        browser.get('https://www.bet365.de/');
        until = protractor.ExpectedConditions;
    });

    it('should see button', async function () {
        browser.sleep(1000);
        expect(element(By.css('div.hm-MainHeaderRHSLoggedOutWide_Login')).isPresent()).toBeTruthy();
        browser.actions().mouseMove(element(By.css('.pl-PodLoaderModule '))).perform().then(() => {
            browser.executeScript('window.scrollTo(0,300);');
        });
    });

    it('should sign in', function () {
        const loginModalButton = element(By.css('div.hm-MainHeaderRHSLoggedOutWide_Login'));
        // browser.executeScript('window.scrollTo(0,0);');
        browser.sleep(1000);
        browser.actions().mouseMove(loginModalButton).click().perform().then(async () => {
            let userNameField = element(By.css('input.lms-StandardLogin_Username'));
            let userPassField = element(By.css('input.lms-StandardLogin_Password '));
            let userLoginBtn = element(By.css('div.lms-LoginButton '));

            await browser.sleep(1000);
            userNameField.sendKeys(constants.LOGIN);

            await browser.sleep(1000);
            userPassField.sendKeys(constants.PASSWD);

            await browser.sleep(500);
            await browser.actions().mouseMove(userLoginBtn).click().perform().then(async function () {
                await writeLog("Clicked");
                await browser.wait(until.presenceOf(element(By.css('div.hm-MainHeaderMembersWide_MembersMenuIcon'))), 15000,
                    'Element taking too long to appear in the DOM').catch(async (e) => {
                    await writeLog("Looong time");
                });
                browser.waitForAngular();
                await writeLog("Logged in!");
                await browser.wait(until.presenceOf(element(By.css('iframe.lp-UserNotificationsPopup_Frame'))), 15000,
                    'Element taking too long to appear in the DOM').catch(async (e) => {
                    await writeLog("Looong time to continue");
                });
            });
        });
    });

    it('should go to tennis', function (done) {
        browser.switchTo().frame(element(By.css('iframe.lp-UserNotificationsPopup_Frame')).getWebElement());
        browser.sleep(1000);
        const continueElement = element(By.css('#Continue'));
        continueElement.click().then(async () => {
            browser.switchTo().defaultContent();
            const continue2Element = element(By.css('.llm-LastLoginModule_Button '));
            await browser.wait(until.presenceOf(continue2Element), 15000,
                'Element taking too long to appear in the DOM').catch(async (e) => {
                await writeLog("Looong time 1");
            });

            continue2Element.click().then(async () => {
                const closeButton = element(By.css('.pm-MessageOverlayCloseButton '));
                closeButton.click().then(() => {
                    // const tennis = element(By.cssContainingText('.wn-PreMatchItem span', 'Tennis'));
                    // tennis.click().then(() => {
                    //     const tennisHeadline = element(By.cssContainingText('.sm-Header_TitleText', 'Tennis'));
                    //     expect(tennisHeadline.isPresent()).toBe(true);
                    // });
                    browser.get('https://www.bet365.de/#/IP/B13');
                });
            });
        });
    });
});
