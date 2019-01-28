const q = require('daskeyboard-applet');

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

    if (!this.authorization.apiKey) {
      logger.error(`No apiKey available.`);
      throw new Error('No apiKey available.');
    }

    /**
     * Use daskeyboard Oauth Proxy to make the request
     */
    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: apiUrl
    });
    return this.oauth2ProxyRequest(proxyRequest);
  }

  async run() {
    logger.info("Running.");
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
      logger.error("Error while getting notifications:", error);
      return null;
    })

  }
}


module.exports = {
  GitHub: GitHub
}

const applet = new GitHub();