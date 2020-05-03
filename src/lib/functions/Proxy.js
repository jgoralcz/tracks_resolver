const request = require('request-promise');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const getProxies = async () => {
  const options = {
    uri: 'https://free-proxy-list.net',
  };

  try {
    const page = await request(options);
    if (page) {
      const { document } = (new JSDOM(page)).window;

      // get all of our info
      const ipCollection = document.querySelectorAll('tr > td:nth-of-type(1)');
      const portCollection = document.querySelectorAll('tr >  td:nth-of-type(2)');
      const httpsCollection = document.querySelectorAll('tr >  td:nth-of-type(7)');

      const proxies = [];
      // go backwards for freshest
      for (let i = httpsCollection.length - 1; i > 0; i -= 1) {
        // we want https
        if (httpsCollection[i].innerHTML === 'yes') {
          const obj = {
            ipAddress: ipCollection[i].innerHTML,
            port: portCollection[i].innerHTML,
          };

          // don't need all of them, waste of time then
          proxies.push(obj);
          if (proxies.length >= 50) break;
        }
      }
      return proxies;
    }
    return [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
};


module.exports = {
  getProxies,
};
