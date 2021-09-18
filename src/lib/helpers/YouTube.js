/* eslint-disable max-len */
const logger = require('log4js').getLogger();
const jsdom = require('jsdom');
const { findBestMatch } = require('string-similarity');
const axios = require('axios');
const urlParse = require('url');

const { getMilliseconds } = require('../functions/milliseconds.js');

const timeout = 10000;
const { JSDOM } = jsdom;

const invidiousURLs = [
  'https://invidious.fdn.fr/',
  'https://ytprivate.com/',
  'https://invidious.namazso.eu',
  'https://y.com.cm',
  'https://yewtu.be/',
  'https://vid.mint.lgbt',
  'https://ytprivate.com',
  'https://invidio.xamh.de',
];

let currentInvidioUsURL = invidiousURLs[0];
const rotateInvidioUsURL = () => {
  const index = invidiousURLs.indexOf(currentInvidioUsURL);

  if (index < 0 || index >= invidiousURLs.length - 1) {
    [currentInvidioUsURL] = invidiousURLs;
    return currentInvidioUsURL;
  }

  currentInvidioUsURL = invidiousURLs[index + 1];

  return currentInvidioUsURL;
};

const getInvidioUsTracks = async (info) => {
  if (!info || !info.data || info.status !== 200) return [];
  const { data } = info;

  const { document } = (new JSDOM(data)).window;

  const tracks = [];
  const videos = document.querySelectorAll('div.pure-u-1.pure-u-md-1-4 > div.h-box');

  for (let i = 0; i < videos.length; i += 1) {
    const video = videos[i];

    if (video.hasChildNodes()) {
      const trackMeta = video.getElementsByTagName('a');
      const idMeta = video.getElementsByTagName('img');
      const timeMeta = video.getElementsByClassName('length');

      if (trackMeta && trackMeta.length >= 2 && trackMeta[0] && trackMeta[0].innerHTML
        && idMeta && idMeta.length > 0 && idMeta[0] && idMeta[0].src
        && timeMeta && timeMeta[0] && timeMeta[0].innerHTML
        && trackMeta[trackMeta.length - 1] && trackMeta[trackMeta.length - 1].href) {
        tracks.push({ info: {} });
        const index = tracks.length - 1;

        const pTag = video.getElementsByTagName('p');
        if (pTag && pTag[1] && pTag[1].innerHTML) {
          tracks[index].info.title = pTag[1].innerHTML;
        } else {
          tracks[index].info.title = 'Unknown Title';
        }

        tracks[index].info.thumbnail = `https://ytimg.googleusercontent.com${idMeta[0].src}`;

        // get times
        const time = timeMeta[0].innerHTML;
        tracks[index].info.length = getMilliseconds(time);

        // channel author
        tracks[index].info.author = trackMeta[trackMeta.length - 1].innerHTML;

        // id is fun because we only get something like https://ytimg.googleusercontent.com/vi/3jx7SF65wbs/mqdefault.jpg
        tracks[index].info.identifier = idMeta[0].src.replace('/vi/', '').replace('/mqdefault.jpg', '');
        tracks[index].info.uri = `https://www.youtube.com${trackMeta[0].href}`;
      }
    }
  }
  return { loadType: 'PLAYLIST_LOADED', tracks, type: 'invidio' };
};

const getHDTracksInvidio = async (uri) => {
  if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;

  const updatedURL = currentInvidioUsURL.replace('https://', '').replace('/', '');

  let url = uri.replace('m.youtube', updatedURL).replace('youtube', updatedURL).replace('www.', '');
  if (url.includes('youtu.be')) {
    url = url.replace('youtu.be/', `${updatedURL}/watch?v=`);
  }
  url = url.replace('.com', '');

  const info = await axios.get(url, { timeout }).catch((error) => logger.error(error));
  if (!info || !info.data || info.status !== 200) return undefined;
  const { data } = info;

  // eslint-disable-next-line quotes
  const urlVideo = data.substring(data.indexOf('source src="') + 12, data.indexOf(`" type='`));
  if (!urlVideo || urlVideo.length > 200) return undefined;

  const indexOfTitle = data.indexOf('<h1>');
  if (indexOfTitle < 0) {
    logger.error(`Could not find a title matching ${uri} - ${url}`);
    return undefined;
  }

  const tempTitle = data.substring(indexOfTitle + 4, indexOfTitle + 200); // hacky way to get only a range
  const title = tempTitle.substring(0, tempTitle.indexOf('<a title=')).trim();

  if (!title) return undefined;

  let endIndex = url.length;
  if (url.indexOf('?') > 0) {
    endIndex = url.indexOf('?') + 1;
  }

  if (url.indexOf('&') > endIndex) {
    endIndex = url.indexOf('&') + 1;
  }

  const id = urlVideo.substring(urlVideo.indexOf('id=') + 3, urlVideo.indexOf('&itag'));

  return {
    title,
    uri: currentInvidioUsURL + urlVideo,
    identifier: `https://ytimg.googleusercontent.com/vi/${id}/hqdefault.jpg`,
    type: 'invidio',
  };
};

const getTracks = async (str) => {
  rotateInvidioUsURL();
  const url = `${currentInvidioUsURL}/search?q=${encodeURIComponent(str).replace(/%20/g, '+')}`;
  const info = await axios.get(url, { timeout }).catch((error) => logger.error(error));
  return getInvidioUsTracks(info);
};

const findClosest = (videos, threshold, titles, phrase, album, artists) => {
  // find the best match whether using album or phrase, it's a toss up; it's strange for unpopular songs.
  const titlesArray = Array.isArray(titles) ? titles : [titles || ''];
  const albumSearch = findBestMatch(`${phrase} ${album}`, titlesArray);
  const artistsSearch = findBestMatch(`${phrase} ${artists}`, titlesArray);
  const artistsSearch2 = findBestMatch(`${artists} ${phrase} `, titlesArray);
  let songSearch = findBestMatch(phrase, titlesArray);

  // which one is closer?, find out here, give a less weight to album
  if ((albumSearch.ratings[albumSearch.bestMatchIndex].rating - 0.06) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = albumSearch;

  if ((artistsSearch.ratings[artistsSearch.bestMatchIndex].rating - 0.02) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = artistsSearch;

  if ((artistsSearch2.ratings[artistsSearch2.bestMatchIndex].rating - 0.02) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = artistsSearch2;

  // final test against threshold
  if (songSearch.ratings[songSearch.bestMatchIndex].rating >= threshold) return videos.tracks[songSearch.bestMatchIndex];
  return false;
};

const closestYouTubeMatch = async (phrase, backup, album, artists) => {
  const videos = await getTracks(`${phrase} ${artists || ''} lyrics`);
  if (!videos || !videos.tracks || !videos.tracks[0] || !videos.tracks[0].info) return undefined;

  const titlesMap = videos.tracks.map((video) => video.info.title);

  const veryCloseThreshold = 0.95;
  const veryCloseMatch = findClosest(videos, veryCloseThreshold, titlesMap, phrase, album, artists);
  if (veryCloseMatch) return veryCloseMatch;

  const titles = titlesMap.length > 5 ? titlesMap.slice(0, 5) : titlesMap;

  // find closest match, if found then we have a pretty accurate match, otherwise we need to try again.
  const threshold = 0.55;
  const found = findClosest(videos, threshold, titles, phrase, album, artists);

  if (found) return found;
  if (!backup) return undefined;

  // try 1 more time with just the phrase
  // higher threshold because we're being less restrictive
  const threshold2 = 0.62;
  const videos2 = await findClosest(videos, threshold2, titles, phrase, album, artists);
  if (videos2 && videos2.tracks && videos2.tracks[0] && videos2.tracks[0].info) {
    const titles2 = videos2.tracks.map((video) => video.info.title);

    const found2 = findClosest(videos2, threshold2, titles2, backup, album, artists);
    if (found2) return found2;
  }

  if (!phrase || !videos.tracks[0].info.title) return undefined;

  // last attempt, take first video and search them for exact words with the phrase
  const searchMax = videos.tracks.length > 5 ? 5 : videos.tracks.length;

  for (let i = 0; i < searchMax; i += 1) {
    const bestSearch = videos.tracks[i].info.title;
    const bestSearchLower = bestSearch.toLowerCase();
    const phraseLower = backup.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').replace(/-/g, '').toLowerCase();
    const phraseLowerSplit = phraseLower.split(' ');
    if (phraseLowerSplit.every((str) => bestSearchLower.includes(str))) return videos.tracks[i];
  }

  return undefined;
};

const relevantVideos = async (videoID) => {
  const info = await axios.get(`https://eachnow.com/watch?v=${videoID}`, { timeout }).catch((error) => logger.error(error));
  if (!info || !info.data || info.status !== 200) return [];
  const { data } = info;

  const { document } = (new JSDOM(data)).window;

  const videoSelection = [...document.querySelectorAll('.ytv-title > a')];
  if (!videoSelection || videoSelection.length <= 0) return [];

  const basicVideos = videoSelection
    .filter((metaData) => metaData && metaData.href && metaData.innerHTML)
    .map((metaData) => ({
      videoID: metaData.href.replace('watch?v=', ''),
      uri: `https://www.youtube.com/${metaData.href}`,
      title: metaData.innerHTML,
    }));

  const thumbnailsSelection = [...document.querySelectorAll('.ytv-thumb > a > img')];
  const thumbnails = thumbnailsSelection.map((thumbnail) => ((thumbnail && thumbnail.src) ? thumbnail.src : ''));

  const durationSelection = [...document.querySelectorAll('.ytv-thumb > a > span')];
  const durations = durationSelection.map((duration) => ((duration && duration.innerHTML) ? getMilliseconds(duration.innerHTML) : ''));

  const channelSelection = [...document.querySelectorAll('.ytv-byline > a')];
  const channels = channelSelection.map((channel) => ((channel && channel.innerHTML) ? channel.innerHTML : ''));

  for (let i = 0; i < basicVideos.length; i += 1) {
    if (basicVideos.length === thumbnails.length && thumbnails[i]) {
      basicVideos[i].thumbnail = thumbnails[i];
    }

    if (basicVideos.length === durations.length && durations[i]) {
      basicVideos[i].length = durations[i];
    }

    if (basicVideos.length === channels.length && channels[i]) {
      basicVideos[i].author = channels[i];
    }
  }

  return {
    tracks: basicVideos.map((basicVideo) => ({ info: basicVideo })),
  };
};

const findRelevantVideos = async (uri) => {
  const queryObject = urlParse.parse(uri, true).query;
  const videoID = queryObject.v;

  if (!videoID) {
    throw new Error('Invalid YouTube URI to autoplay off of.');
  }

  try {
    return relevantVideos(videoID);
  } catch (e) {
    return [];
  }
};

module.exports = {
  findRelevantVideos,
  getTracks,
  getHDTracksInvidio,
  closestYouTubeMatch,
};
