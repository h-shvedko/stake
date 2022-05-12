require('babel-core/register');
exports.config = {
    framework: 'jasmine',
    specs: ['bet365.js'],
    multiCapabilities: [
        {
            name: 'Chrome',
            logName: 'Chrome',
            browserName: 'chrome',
            chromeOptions: {
                excludeSwitches: ['enable-automation'],
                args: ["--disable-blink-features=AutomationControlled"]
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
