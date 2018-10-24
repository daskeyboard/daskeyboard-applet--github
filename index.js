const q = require('daskeyboard-applet');
const request = require('request-promise');

const apiUrl = 'https://api.github.com/notifications';

async function getNotifications(username, token) {
  const auth = "Basic " + new Buffer(username + ":" + token).toString("base64");
  return request.get({
    url: apiUrl,
    headers: {
      "Authorization": auth,
      "User-Agent": "Das Keyboard q-applet-github"
    },
    json: true
  });
}

class GitHub extends q.DesktopApp {
  async run() {
    console.log("Running.");
    const username = this.authorization.username;
    const token = this.authorization.password;

    if (username && token) {
      return getNotifications(username, token).then(notifications => {
        const numberNotifications = notifications.length;
        console.log("I have " + numberNotifications + " notifications.");
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
        console.error("Error while getting notifications:", error);
        return null;
      })
    } else {
      console.log("No userName and password configured.");
      return null;
    }
  }
}


module.exports = {
  getNotifications: getNotifications,
  GitHub: GitHub
}

const applet = new GitHub();