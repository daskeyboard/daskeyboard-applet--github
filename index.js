const q = require('daskeyboard-applet');
const request = require('request-promise');

const logger = q.logger;

const apiUrl = 'https://api.github.com/notifications';

class GitHub extends q.DesktopApp {

  constructor() {
    super();
    this.pollingInterval = 60000 * 5; // every 5 min
  }
  /**
   * Delete all previous signals
   */
  async deleteOldSignals() {
    // delete the previous signals
    while (this.signalLog && this.signalLog.length) {
      const signal = this.signalLog.pop().signal;
      logger.debug(`Deleting previous signal: ${signal.id}`)
      await q.Signal.delete(signal).catch(error => {
        logger.error(`Error deleting signal ${signal.id}: ${error}`);
      });

      logger.debug(`Deleted the signal: ${signal.id}`);
    }
  }

  /**
   * Gets notifications from github api by making an Oauth request
   * through the Das Keyboard Q Oauth proxy
   */
  async getNotifications() {
    logger.info(`Checking for new notifications`);
    // /**
    //  * Use daskeyboard Oauth Proxy to make the request
    //  */
    // const proxyRequest = new q.Oauth2ProxyRequest({
    //   apiKey: this.authorization.apiKey,
    //   uri: apiUrl
    // });
    // return this.oauth2ProxyRequest(proxyRequest);
    let options = {
      uri: apiUrl,
      json: true
    };
    return this.getGithubAccessToken().then(accessToken => {
      // save the token
      this.githubAccessToken = accessToken;
      // add token to request option
      options = {
        ...options, headers: {
          'Authorization': `Bearer ${accessToken}`,
          'user-agent': 'node.js'
        }
      }
      return request(options);
    }).catch(err => {
      logger.info(`Got error ${err}, will try to refresh access token`);
      return this.refreshGithubAccessToken().then(accessToken => {
        // save the token
        this.githubAccessToken = accessToken;
        // add token to request option
        options = {
          ...options, headers: {
            'Authorization': `Bearer ${accessToken}`,
            'user-agent': 'node.js'
          }
        }
        return request(options);
      });
    });
  }

  /**
   * Uses the daskeyboard Oauth Proxy to get an access token from github
   */
  async getGithubAccessToken() {
    if (!this.authorization.apiKey) {
      throw new Error('No apiKey available');
    }

    if (this.githubAccessToken) {
      return this.githubAccessToken;
    }

    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey
    });

    return proxyRequest.getOauth2ProxyToken().then(proxyResponse => {
      return proxyResponse.access_token;
    });
  }

  /**
   * Uses daskeyboard Oauth proxy to refresh access token
   */
  async refreshGithubAccessToken() {
    if (!this.authorization.apiKey) {
      throw new Error('No apiKey available');
    }

    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey
    });

    return proxyRequest.refreshOauth2AccessToken().then(proxyResponse => {
      return proxyResponse.access_token;
    });
  }

  async run() {
    logger.info("GitHub running.");
    return this.getNotifications().then(notifications => {
      this.deleteOldSignals();
      const numberNotifications = notifications.length;
      logger.info("I have " + numberNotifications + " notifications.");
      if (numberNotifications > 0) {
        return new q.Signal({
          points: [
            [new q.Point('#FF0000', q.Effects.BLINK)]
          ],
          name: 'GitHub',
          message: numberNotifications > 1 ? 'Unread notifications available.' : 'Unread notification available.',
          link: {
            url: 'https://www.github.com/notifications',
            label: 'Show on GitHub',
          }
        });
      }
    }).catch((error) => {
      logger.error(`Got error sending request to service: ${JSON.stringify(error)}`);
      if(`${error.message}`.includes("getaddrinfo")){
        return q.Signal.error(
          'The GitHub service returned an error. <b>Please check your internet connection</b>.'
        );
      }
      return q.Signal.error([
        'The GitHub service returned an error. <b>Please check your account</b>.',
        `Detail: ${error.message}`
      ]);
    })

  }
}


module.exports = {
  GitHub: GitHub
}

const applet = new GitHub();