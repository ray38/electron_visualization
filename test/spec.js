const assert = require('assert');
const path = require('path');
const Application = require('spectron').Application;
const electronPath = require('electron');
const titleString = 'ElectroLens';

const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
});

describe('ElectroLens Tests', function() {
    this.timeout(10000);

    beforeEach(() => {
        return app.start();
    });

    afterEach(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it('shows an initial window', async() => {
        const count = await app.client.getWindowCount();
        return assert.strictEqual(count,1); //example used equal, deprecated
    });

    it('has the correct title', async() => {
        await app.client.waitUntilWindowLoaded();
        const title = await app.client.getTitle();
        return assert.strictEqual(title, titleString);
    });

    it('has a disabled submit button', async() => {
        await app.client.waitUntilWindowLoaded();
        const submitDisabled = await (await app.client.$('#formSubmitButton')).getProperty('disabled');
        return assert.strictEqual(submitDisabled, true);
    });
    
    //The client API is WebdriverIO's browser object.


    // it('processing time', async() => {
    //     await app.client.waitUntilWindowLoaded();

    // })

    // snippet for logging memory utilization during test
    //app.rendererProcess.getProcessMemoryInfo().then((info)=> console.log(info))


});