const q = require('daskeyboard-applet');
const request = require('request-promise');

const logger = q.logger;


const apiUrl = 'https://api.github.com/notifications';


class GitHub extends q.DesktopApp {

  async getNotifications() {
    logger.info(`Checking for new notifications`);

    if (!this.authorization.apiKey) {
      logger.error(`No apiKey available.`);
      throw new Error('No apiKey available.');
    }

    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: apiUrl
    });
    return this.oauth2ProxyRequest(proxyRequest);
  }

  async run() {
    logger.info("Running.");
    return this.getNotifications().then(notifications => {
      const numberNotifications = notifications.length;
      logger.info("I have " + numberNotifications + " notifications.");
      if (numberNotifications > 0) {
        return new q.Signal({
          points: [
            [new q.Point('#0000FF')]
          ],
          name: 'Github',
          message: numberNotifications > 1 ? 'You have unread notifications.' : 'You have an unread notification.'
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