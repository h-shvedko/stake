const fileSystem = require('fs');
const constants = require("./constants");
const {browser, element} = require("protractor");
const responseFile = 'betInfoResponse.json';
const URL = 'https://www.bet365.de/';
let isFinalized = false;

let until, parsedJsonConfig;

async function writeLog(d) {
    console.log(d);
    // log_file.write(util.format(d) + '\n');
}

async function createResponseFile(isSuccess) {
    const data = JSON.stringify(isSuccess ? 1 : 0);
    fileSystem.writeFile(responseFile, data, err => {
        if (err) {
            writeLog(err);
        }
    });
}


async function readConfig() {
    try {
        const rawdata = fileSystem.readFileSync('betInfo.json');
        parsedJsonConfig = JSON.parse(rawdata);
        await writeLog(parsedJsonConfig);

        fileSystem.unlink(responseFile, (err) => {
            if (err) throw err;
            console.log(responseFile + ' was deleted');
        });
    } catch (e) {
        writeLog(e);
    }
}

describe('Login ', function () {

    const EC = protractor.ExpectedConditions;

    beforeAll(async function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
        browser.waitForAngularEnabled(false);
        browser.get(URL);
        until = protractor.ExpectedConditions;
        await readConfig();
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
                    await createResponseFile(false);
                });
                browser.waitForAngular();
                await writeLog("Logged in!");
                await browser.wait(until.presenceOf(element(By.css('iframe.lp-UserNotificationsPopup_Frame'))), 15000,
                    'Element taking too long to appear in the DOM').catch(async (e) => {
                    await writeLog("Looong time to continue");
                    await createResponseFile(false);
                });
            }).catch(async (e) => {
                await createResponseFile(false);
            });
        }).catch(async (e) => {
            await createResponseFile(false);
        });
    });

    it('should go to main page', function (done) {
        browser.switchTo().frame(element(By.css('iframe.lp-UserNotificationsPopup_Frame')).getWebElement());
        browser.sleep(1000);
        const continueElement = element(By.css('#Continue'));
        continueElement.click().then(async () => {
            browser.switchTo().defaultContent();
            const continue2Element = element(By.css('.llm-LastLoginModule_Button '));
            await browser.wait(until.presenceOf(continue2Element), 15000,
                'Element taking too long to appear in the DOM').catch(async (e) => {
                await writeLog("Looong time 1");
                await createResponseFile(false);
                done();
            });

            continue2Element.click().then(async () => {
                const closeButton = element(By.css('.pm-MessageOverlayCloseButton '));
                closeButton.click().then(() => {
                    done();
                }).catch(async (e) => {
                    await createResponseFile(false);
                    done();
                });
            });
        }).catch(async (e) => {
            await createResponseFile(false);
            done();
        });
    });

    it('should find bet', async function (done) {
        const match = parsedJsonConfig.match.replace(' vs ', ' v ');
        await createResponseFile(isFinalized);
        const searchIcon = element(By.css('.hm-SiteSearchIconLoggedIn_Icon'));
        const searchInput = element(By.css('.sml-SearchTextInput'));
        searchIcon.click().then(async () => {
            await browser.wait(until.presenceOf(searchInput), 15000,
                'Element taking too long to appear in the DOM').catch(async (e) => {
                await writeLog("Looong time 2");
                await createResponseFile(false);
                done();
            });

            searchInput.sendKeys(match);
            browser.sleep(2000);

            const classificationRibbonItemTitle = element(By.css('.ssm-SearchClassificationRibbonItem'));
            classificationRibbonItemTitle.getText().then(async (text) => {
                const classificationTitle = text.toLowerCase();
                const configSportArt = parsedJsonConfig.sportArt.toLowerCase();

                if (classificationTitle === configSportArt) {
                    const rowOfMatchWithPlayerName = element(By.css('.ssm-DynamicSearchPane .ssm-SearchClosableContainer .ssm-SiteSearchLabelOnlyParticipant'));
                    rowOfMatchWithPlayerName.click().then(async () => {
                        const bettingTable = element(By.xpath("//div[text()='To Win']/../..//div[text()='" + parsedJsonConfig.winner + "']/.."))
                            .element(By.css('.gl-ParticipantOddsOnly.gl-Participant_General.gl-Market_General-cn1'));
                        await browser.wait(until.presenceOf(bettingTable), 5000,
                            'Element taking too long to appear in the DOM').catch(async (e) => {
                            await writeLog("Looong time 3");
                            await createResponseFile(false);
                            done();
                        });

                        bettingTable.click().then(async () => {
                            const betFooter = element(By.css('.bss-Footer_DetailsContainer'));
                            await browser.wait(until.presenceOf(betFooter), 5000,
                                'Element taking too long to appear in the DOM').catch(async (e) => {
                                await writeLog("Looong time 4");
                                await createResponseFile(false);
                                done();
                            });

                            const placeButton = element(By.css('.bsf-PlaceBetButton:not(.bsf-PlaceBetButton_Disabled)'));
                            placeButton.click().then(async () => {
                                await writeLog('Bet placed');
                                await createResponseFile(true);
                                done();
                            }).catch(async (e) => {
                                await createResponseFile(false);
                                done();
                            });
                        }).catch(async (e) => {
                            await createResponseFile(false);
                            done();
                        });
                    }).catch(async (e) => {
                        await createResponseFile(false);
                        done();
                    });
                } else {
                    isFinalized = false;
                    writeLog("Bet not found: sport art is wrong!");
                    await createResponseFile(isFinalized);
                    done();
                }
            });
        });
    });
});
