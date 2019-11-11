const assert = require('assert');
const authProxyUri = require('./auth.json').oAuth2ProxyUri;
process.env = {
  ...process.env,
  oAuth2ProxyUri: authProxyUri
}
const t = require('../index');
const apiKey = require('./auth.json').apiKey;


describe('GitHubNotifications', () => {
  it('should get notifications', async function () {
    this.timeout(10000);
    return buildApp().then(async (app) => {
      return app.getNotifications().then((notification) => {
        assert.ok(notification, 'Response was not truthy.')
      }).catch(err => assert.fail(err));
    });
  });


  describe('#run()', () => {
    it('should get a signal', async function () {
      return buildApp().then((signal) => {
        assert.ok(signal);
      }).catch((error) => {
        assert.fail(error)
      });
    })
  });

});

async function buildApp() {
  let app = new t.GitHub();
  return app.processConfig({
    authorization: {
      apiKey: apiKey
    }
  }).then(() => {
    return app;
  });
}