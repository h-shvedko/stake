require('babel-core/register');
exports.config = {
    framework: 'jasmine',
    specs: ['login.js'],
    multiCapabilities: [
        {
            name: 'Chrome',
            logName: 'Chrome',
            browserName: 'chrome',
            chromeOptions: {
                excludeSwitches: ['enable-automation'],
                args: ["--disable-blink-features=AutomationControlled",
                    "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"]
            }

        }
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 1000000
    },

    onPrepare: function () {
        browser.driver.manage().window().maximize();
    },
    directConnect: true,
    allScriptsTimeout: 1000000,
    getPageTimeout: 1000000
};
