const assert = require('assert');
const t = require('../index');
const auth = require('./auth.json');

describe('getNotifications', function () {
  it('can get notifications', function () {
    t.getNotifications(auth.username, auth.password).then((notifications) => {
      assert.ok(notifications, 'Response was not truthy.');      
    }).catch((error) => {
      assert.fail(error);
    })
  })
});

describe('GitHub', () => {
  let app = new t.GitHub();
  
  app.processConfig({
    extensionId: 777,
    geometry: {
      width: 1,
      height: 1,
    },
    authorization: auth,
    applet: {}
  });

  describe('#run()', () => {
    app.run().then((signal) => {
      console.log(signal);
      assert.ok(signal);
    }).catch((error) => {
      assert.fail(error)
    });
  })
})