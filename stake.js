const fileSystem = require('fs');
const constants = require("constants.js");
const {browser} = require("protractor");
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let window_client_id;
let myCode;
let authContent;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
    return new Promise((resolve, reject) => {
        const {client_secret, client_id, redirect_uris} = credentials;
        window_client_id = client_id;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        // Check if we have previously stored a token.
        fileSystem.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getNewToken(oAuth2Client);
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fileSystem.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            authorize(authContent);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.list({
            userId: 'me',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const messages = res.data.messages;
            if (messages.length) {
                console.log('Messages:');
                messages.forEach((message) => {
                    console.log(`- ${message.id}`);
                    gmail.users.messages.get({userId: 'me', id: message.id, format: 'raw'},
                        (err, messageToDecode) => {
                            const content = new Buffer(messageToDecode.data.raw, 'base64').toString('ascii');
                            const labelIds = messageToDecode.data.labelIds;
                            let isUnread = false;
                            if (labelIds.length) {
                                labelIds.forEach((labelId) => {
                                    if (labelId.toLowerCase().includes('unread')) {
                                        isUnread = true;
                                    }
                                });
                            }
                            if (!content.includes('stake.com') || !isUnread) {
                                return;
                            }
                            myCode = content.substring(
                                content.indexOf("<center><h2>") + ("<center><h2>").length,
                                content.lastIndexOf("</h2></center>")
                            );
                            console.log(myCode);

                            if(typeof parseInt(myCode) !== 'undefined'){
                                resolve(myCode);
                            } else {
                                reject();
                            }
                            gmail.users.messages.trash({userId:'me', id:message.id},
                                (err, res) => {
                                    if (err) return console.log('The API returned an error: ' + err);
                                });
                        });
                });
            } else {
                reject();
                console.log('No messages found.');
            }
        });
    });
}

async function writeLog(d) {
    console.log(d);
    // log_file.write(util.format(d) + '\n');
}

describe('Login ', function () {

    const EC = protractor.ExpectedConditions;

    beforeAll(async function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
        browser.waitForAngularEnabled(false);
        browser.get('https://stake.com/');
    });

    it('should see button', async function () {
        browser.sleep(1000);
        expect(element(By.css('[data-test="login-link"]')).isPresent()).toBeTruthy();
    });

    it('should sign in', function (done) {
        const until = protractor.ExpectedConditions;
        const loginModalButton = element(By.css('[data-test="login-link"]'));
        // browser.executeScript('window.scrollTo(0,0);');
        browser.sleep(1000);
        browser.actions().mouseMove(loginModalButton).click().perform().then(async () => {
            let userNameField = element(By.css('[name="emailOrName"]'));
            let userPassField = element(By.css('[name="password"]'));
            let userLoginBtn = element(By.css('[data-test="button-login"]'));

            await browser.sleep(1000);
            userNameField.sendKeys(constants.LOGIN);

            await browser.sleep(1000);
            userPassField.sendKeys(constants.PASSWD);

            await browser.sleep(500);
            await browser.actions().mouseMove(userLoginBtn).click().perform().then(async function () {
                await browser.sleep(5000);
                await fileSystem.readFile('credentials.json', (err, content) => {
                    if (err) return console.log('Error loading client secret file:', err);
                    // Authorize a client with credentials, then call the Gmail API.
                    authContent = JSON.parse(content);
                    authorize(authContent).then((oAuth) => {
                        listLabels(oAuth).then(async (code) => {
                            const codeInput = element(By.css('[name="code"]'));
                            const loginComplete = element(By.css('[data-test="login-complete"]'));
                            codeInput.sendKeys(code);

                            await browser.actions().mouseMove(loginComplete).click().perform().then(async () => {
                                await browser.wait(until.presenceOf(element(By.css('[data-test="user-dropdown-toggle"]'))), 15000,
                                    'Element taking too long to appear in the DOM').catch(async (e) => {
                                   await writeLog("Looong time");
                                });
                                writeLog("Logged In!!!!");
                            });
                        });
                    });
                });
            });
        });
    });
});
