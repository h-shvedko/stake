const fileSystem = require('fs');
const constants = require("./constants.js");
const {browser} = require("protractor");

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
    });

    it('should see button', async function () {
        browser.sleep(1000);
        expect(element(By.css('div.hm-MainHeaderRHSLoggedOutWide_Login')).isPresent()).toBeTruthy();
        browser.actions().mouseMove(element(By.css('.pl-PodLoaderModule '))).perform().then(() => {
            browser.executeScript('window.scrollTo(0,300);');
        });
    });

    it('should sign in', function (done) {
        const until = protractor.ExpectedConditions;
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
            });
        });
    });
});
