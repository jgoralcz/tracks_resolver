/* eslint-disable max-len */
const logger = require('log4js').getLogger();
const jsdom = require('jsdom');
const { findBestMatch } = require('string-similarity');
const request = require('request-promise');
const urlParse = require('url');

const { getMilliseconds } = require('../functions/milliseconds.js');

const timeout = 10000;
const { JSDOM } = jsdom;

const invidiousURLs = [
  'https://invidious.xyz/',
  'https://invidious.site/',
  'https://invidious.fdn.fr/',
  'https://invidious.snopyta.org/',
  'https://invidious.kavin.rocks/',
  'https://yewtu.be/',
  'https://invidious.kavin.rocks',
];

const getInvidioUsTracks = async (info) => {
  if (!info) return [];

  const { document } = (new JSDOM(info)).window;

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

        // assign our title and thumbnail
        if (trackMeta.length > 2) {
          tracks[index].info.title = trackMeta[trackMeta.length - 2].innerHTML.replace(/\s+/g, ' '); // only want 1 space for formatting.
        } else {
          const pTag = video.getElementsByTagName('p');
          if (pTag && (pTag.length === 2 || pTag.length === 3) && pTag[1] && pTag[1].innerHTML) {
            tracks[index].info.title = pTag[1].innerHTML;
          } else {
            tracks[index].info.title = 'Unknown Title';
          }
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

const getYoutubePlaylist = async (uri) => {
  // https://youtube.com/playlist?list=PLRCAnALQiSQWMuY6pHxV0Y4UJAAXfTRPS0
  // https://invidio.us/playlist?list=PLRCAnALQiSQWMuY6pHxV0Y4UJAAXfTRPS
  if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be') && !uri.includes('list')) return undefined;

  const listIndex = uri.indexOf('list=') + 5;
  if (listIndex <= 5) return undefined;

  const remainingStr = uri.substring(listIndex, uri.length);
  const findIDstr = remainingStr.indexOf('&');

  const endOfID = (findIDstr > 0) ? findIDstr : remainingStr.length;

  const ID = remainingStr.substring(0, endOfID);
  if (!ID) return undefined;

  let newInfo;
  let info = [];
  let page = 1;
  do {
    const req = await request(`https://invidious.kavin.rocks/playlist?list=${ID}&page=${page}`).catch(() => undefined);
    newInfo = await getInvidioUsTracks(req);

    if (newInfo && newInfo.tracks && newInfo.tracks.length > 0) {
      info = [...info, ...newInfo.tracks];
    }

    page += 1;
  } while (newInfo && newInfo.tracks && newInfo.tracks.length > 0);

  if (!info || info.length <= 0) {
    return {};
  }

  return {
    loadType: 'PLAYLIST_LOADED',
    type: 'invidio',
    tracks: info,
  };
};

const getPlayTunez = async (uri) => {
  // return YouTube.getHDTracksInvidio(uri);
  // http://playtunez.com/watch/tmozGmGoJuw
  if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
  if (uri.includes('list')) return getYoutubePlaylist(uri);

  let url = uri.replace('m.youtube', 'playtunez').replace('youtube', 'playtunez');
  if (url.includes('youtu.be')) {
    url = url.replace('youtu.be/', 'playtunez.com/watch/');
  }
  url = url.replace('?v=', '/');

  let endIndex = url.length;
  if (url.indexOf('?') > 0) {
    endIndex = url.indexOf('?') + 1;
  }
  if (url.indexOf('&') > endIndex) {
    endIndex = url.indexOf('&') + 1;
  }

  const id = url.substring(url.lastIndexOf('/') + 1, endIndex);

  const info = await request({ url, timeout }).catch((error) => logger.error(error));
  if (!info) return undefined;

  const { document } = (new JSDOM(info)).window;

  const videoResult = await request({ url: `http://playtunez.com/embed/${id}`, timeout }).catch((error) => console.error(error));
  if (!videoResult) return undefined;

  const video = videoResult.substring(videoResult.indexOf("src:'") + 5, videoResult.indexOf("',type"));

  const titleElement = document.querySelector('h2');
  if (!titleElement || !titleElement.innerHTML) return undefined;

  const tempTitle = titleElement.innerHTML.replace('- playtunez.com', '').replace('playtunez', '').replace('.com', '').trim();
  const title = tempTitle.substring(0, tempTitle.indexOf('<br>')).trim();

  if (!video || !video.startsWith('https://') || !title || title.length >= 300) return undefined;

  return {
    title,
    uri: video,
    identifier: `https://ytimg.googleusercontent.com/vi/${id}/hqdefault.jpg`,
    type: 'playtunez',
  };
};

const getPlayClipMegaURL = async (uri) => {
  console.log('uri', uri);
  if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
  if (uri.includes('list')) return getYoutubePlaylist(uri);

  const url = uri.replace('m.youtube', 'clipmega').replace('youtube', 'clipmega').replace('youtu.be/', 'clipmega.com/watch?v=');

  const info = await request({ url, timeout }).catch((error) => logger.error(error));
  if (!info) return getPlayTunez(uri);

  const { document } = (new JSDOM(info)).window;

  const titleElement = document.querySelector('div.video-title');
  if (!titleElement || !titleElement.innerHTML) return getPlayTunez(uri);
  const title = titleElement.innerHTML;

  const videoElement = document.querySelector('video source');
  if (!videoElement || !videoElement.src) return getPlayTunez(uri);
  const video = videoElement.src;

  const possibleImage = info.substring(info.lastIndexOf('/vi/') + 4, info.lastIndexOf('/0.jpg'));

  if (video && video.startsWith('https://redirector.googlevideo.com') && title && title.length < 300) {
    return {
      title,
      uri: video,
      identifier: (possibleImage && possibleImage.length < 32) ? possibleImage : undefined,
      type: 'clipmega',
    };
  }
  return getPlayTunez(uri);
};

const getHDTracksInvidio = async (uri) => {
  if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
  if (uri.includes('list')) return getYoutubePlaylist(uri);

  let url = uri.replace('m.youtube', 'invidious.kavin.rocks').replace('youtube', 'invidious.kavin.rocks').replace('www.', '');
  if (url.includes('youtu.be')) {
    url = url.replace('youtu.be/', 'invidious.kavin.rocks/watch?v=');
  }
  url = url.replace('.com', '');

  const info = await request({ url, timeout }).catch((error) => logger.error(error));
  if (!info) return getPlayClipMegaURL(uri);

  // eslint-disable-next-line quotes
  const urlVideo = info.substring(info.indexOf('source src="') + 12, info.indexOf(`" type='`));
  if (!urlVideo || urlVideo.length > 200) return getPlayClipMegaURL(uri);

  const indexOfTitle = info.indexOf('<h1>');
  if (indexOfTitle < 0) {
    logger.error(`Could not find a title matching ${uri} - ${url}`);
    return getPlayClipMegaURL(uri);
  }

  const tempTitle = info.substring(indexOfTitle + 4, indexOfTitle + 200); // hacky way to get only a range
  const title = tempTitle.substring(0, tempTitle.indexOf('<a title=')).trim();

  if (!title) return getPlayClipMegaURL(uri);

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
    uri: `https://invidious.kavin.rocks${urlVideo}`,
    identifier: `https://ytimg.googleusercontent.com/vi/${id}/hqdefault.jpg`,
    type: 'invidio',
  };
};

const getTracksBackup = async (str) => {
  const url = `https://invidious.kavin.rocks/search?q=${encodeURIComponent(str).replace(/%20/g, '+')}`;
  const info = await request(url);
  return getInvidioUsTracks(info);
};

const getTracks = async (str) => {
  const url = `https://clipmega.com/search?q=${encodeURIComponent(str).replace(/%20/g, '+')}`;
  const info = await request({ uri: url, timeout });
  const { document } = (new JSDOM(info)).window;

  // get our videos
  const videos = document.querySelectorAll('div.col-xs-12.videopost');
  const tracks = [];

  // iterate over all possible videos.
  for (let i = 0; i < videos.length; i += 1) {
    const video = videos[i];

    // have child nodes to work with
    if (video.hasChildNodes()) {
      // scrape the info
      const trackMeta = video.getElementsByClassName('title-color');
      const idMeta = video.getElementsByClassName('videosthumbs-style');
      const timeMeta = video.getElementsByClassName('duration');
      const channelMeta = video.getElementsByClassName('by-user');

      // make sure we have this info available, otherwise it's incomplete and no good.
      if (trackMeta && trackMeta.length > 0 && trackMeta[0] && trackMeta[0].title
        && trackMeta[0].href && idMeta && idMeta.length > 0 && idMeta[0] && idMeta[0].src
        && timeMeta && timeMeta.length > 0 && timeMeta[0] && timeMeta[0].innerHTML
        && channelMeta && channelMeta.length > 0 && channelMeta[0] && channelMeta[0].href) {
        // init info
        tracks.push({ info: {} });
        const index = tracks.length - 1;

        // assign our title, uri, and thumbnail
        tracks[index].info.title = trackMeta[0].title.replace(/\s+/g, ' '); // only want 1 space for formatting.
        tracks[index].info.uri = `https://www.youtube.com/${trackMeta[0].href}`;
        tracks[index].info.thumbnail = `https:${idMeta[0].src}`;

        // get times
        const time = timeMeta[0].innerHTML;
        tracks[index].info.length = getMilliseconds(time);

        // channel author
        tracks[index].info.author = channelMeta[0].innerHTML;

        // id is fun because we only get something like https://ytimg.googleusercontent.com/vi/3jx7SF65wbs/mqdefault.jpg
        tracks[index].info.identifier = idMeta[0].src.replace('//ytimg.googleusercontent.com/vi/', '').replace('/mqdefault.jpg', '');
      }
    }
  }
  if (!tracks || !tracks.length || tracks.length <= 0) return getTracksBackup(str);

  return { tracks, type: 'clipmega' };
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
  const info = await request({ url: `https://clipmega.com/watch?v=${videoID}`, timeout }).catch((error) => logger.error(error));
  if (!info) return [];

  const { document } = (new JSDOM(info)).window;

  const videoSelection = [...document.querySelectorAll('.related-video > a')];
  if (!videoSelection || videoSelection.length <= 0) return [];

  const basicVideos = videoSelection
    .filter((metaData) => metaData && metaData.href && metaData.title)
    .map((metaData) => ({
      videoID: metaData.href.replace('watch?v=', ''),
      uri: `https://www.youtube.com/${metaData.href}`,
      title: metaData.title,
    }));

  const thumbnailsSelection = [...document.querySelectorAll('.related-thumbs > img')];
  const thumbnails = thumbnailsSelection.map((thumbnail) => ((thumbnail && thumbnail.src) ? thumbnail.src : ''));

  const durationSelection = [...document.querySelectorAll('.related-thumbs > span')];
  const durations = durationSelection.map((duration) => ((duration && duration.innerHTML) ? getMilliseconds(duration.innerHTML) : ''));

  const channelSelection = [...document.querySelectorAll('.user')];
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

const findRelevantVideos = (uri) => {
  const queryObject = urlParse.parse(uri, true).query;
  const videoID = queryObject.v;

  if (!videoID) {
    throw new Error('Invalid YouTube URI to autoplay off of.');
  }

  return relevantVideos(videoID).catch(() => []);
};

module.exports = {
  findRelevantVideos,
  getTracks,
  getHDTracksInvidio,
  getPlayClipMegaURL,
  closestYouTubeMatch,
};
