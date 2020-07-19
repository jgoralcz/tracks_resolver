/* eslint-disable max-len */
// const { scheduleJob: ScheduleJob } = require('node-schedule');
const jsdom = require('jsdom');
const { findBestMatch } = require('string-similarity');
const request = require('request-promise');
// const puppeteer = require('puppeteer');

const timeout = 10000;
const { getMilliseconds } = require('../functions/milliseconds.js');

const { JSDOM } = jsdom;

class YouTube {

  static async getYoutubePlaylist(uri) {
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

    const info = await request(`https://invidio.us/playlist?list=${ID}`).catch((error) => console.error(error));
    if (!info) return undefined;

    return YouTube.getInvidioUsTracks(info);
  }

  static async getInvidioUsTracks(info) {
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

        if (trackMeta != null && trackMeta.length >= 2 && trackMeta[0] && trackMeta[0].innerHTML
          && idMeta != null && idMeta.length > 0 && idMeta[0] && idMeta[0].src
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
  }

  static async getPlayClipMegaURL(uri) {
    if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
    if (uri.includes('list')) return YouTube.getYoutubePlaylist(uri);

    let url = uri.replace('m.youtube', 'clipmega').replace('youtube', 'clipmega');
    if (url.includes('youtu.be')) {
      url = url.replace('youtu.be/', 'clipmega.com/watch?v=');
    }

    const info = await request({ url, timeout }).catch((error) => console.error(error));
    if (!info) return YouTube.getPlayTunez(uri);

    const { document } = (new JSDOM(info)).window;

    const titleElement = document.querySelector('div.video-title');
    if (!titleElement || !titleElement.innerHTML) return YouTube.getPlayTunez(uri);
    const title = titleElement.innerHTML;

    const videoElement = document.querySelector('video source');
    if (!videoElement || !videoElement.src) return YouTube.getPlayTunez(uri);
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
    return YouTube.getPlayTunez(uri);
  }

  static async getPlayTunez(uri) {
    // return YouTube.getHDTracksInvidio(uri);
    // http://playtunez.com/watch/tmozGmGoJuw
    if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
    if (uri.includes('list')) return YouTube.getYoutubePlaylist(uri);

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

    const info = await request({ url, timeout }).catch((error) => console.error(error));
    if (!info) return undefined;

    const { document } = (new JSDOM(info)).window;

    const videoResult = await request({ url: `http://playtunez.com/embed/${id}`, timeout }).catch((error) => console.error(error));
    if (!videoResult) return undefined;

    const video = videoResult.substring(videoResult.indexOf("src:'") + 5, videoResult.indexOf("',type"));

    const titleElement = document.querySelector('h2');
    if (!titleElement || !titleElement.innerHTML) return undefined;

    const tempTitle = titleElement.innerHTML.replace('- playtunez.com', '').replace('playtunez', '').replace('.com', '').trim();
    const title = tempTitle.substring(0, tempTitle.indexOf('<br>')).trim();

    if (video && video.startsWith('https://') && title && title.length < 300) {
      return {
        title,
        uri: video,
        identifier: `https://ytimg.googleusercontent.com/vi/${id}/hqdefault.jpg`,
        type: 'playtunez',
      };
    }
    return undefined;
  }

  static async getHDTracksInvidio(uri) {
    if (!uri.includes('m.youtube') && !uri.includes('youtube') && !uri.includes('youtu.be')) return undefined;
    if (uri.includes('list')) return YouTube.getYoutubePlaylist(uri);

    let url = uri.replace('m.youtube', 'invidio.us').replace('youtube', 'invidio.us');
    if (url.includes('youtu.be')) {
      url = url.replace('youtu.be/', 'invidio.us/watch?v=');
    }
    url = url.replace('.com', '');

    const info = await request({ url, timeout }).catch((error) => console.error(error));
    if (!info) return YouTube.getPlayClipMegaURL(uri);

    const { document } = (new JSDOM(info)).window;

    // eslint-disable-next-line quotes
    const urlVideo = info.substring(info.indexOf('source src="') + 12, info.indexOf(`" type='`));
    if (!urlVideo || urlVideo.length > 200) return YouTube.getPlayClipMegaURL(uri);

    const titleElement = document.querySelector('h1');
    if (!titleElement || !titleElement.innerHTML || !titleElement.innerHTML.trim) return YouTube.getPlayClipMegaURL(uri);

    const tempTitle = titleElement.innerHTML.trim();
    const title = tempTitle.substring(0, tempTitle.indexOf('<a title=')).trim();

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
      uri: `https://www.invidio.us${urlVideo}`,
      identifier: `https://ytimg.googleusercontent.com/vi/${id}/hqdefault.jpg`,
      type: 'invidio',
    };
  }

  static async getTracksBackup(str) {
    const url = `https://invidio.us/search?q=${encodeURIComponent(str).replace(/%20/g, '+')}`;
    const info = await request(url);
    return YouTube.getInvidioUsTracks(info);
  }

  static async getTracks(str) {
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
    if (!tracks || !tracks.length || tracks.length <= 0) return YouTube.getTracksBackup(str);

    return { tracks, type: 'clipmega' };
  }

  /**
   * finds the closets match
   * @param {Array<String>} videos the list of videos.
   * @param {Float64Array} threshold the threshold to test against
   * @param {Array<String>} titles the titles to test against
   * @param {String} phrase the phrase to add
   * @param {String} album the album.
   * @param {String} artists the artists.
   * @returns {*}
   */
  static async findClosest(videos, threshold, titles, phrase, album, artists) {
    // find the best match whether using album or phrase, it's a toss up; it's strange for small songs.
    const albumSearch = findBestMatch(`${phrase} ${album}`, titles);
    const artistsSearch = findBestMatch(`${phrase} ${artists}`, titles);
    const artistsSearch2 = findBestMatch(`${artists} ${phrase} `, titles);
    let songSearch = findBestMatch(phrase, titles);

    // which one is closer?, find out here, give a less weight to album
    if ((albumSearch.ratings[albumSearch.bestMatchIndex].rating - 0.06) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = albumSearch;

    if ((artistsSearch.ratings[artistsSearch.bestMatchIndex].rating - 0.02) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = artistsSearch;

    if ((artistsSearch2.ratings[artistsSearch2.bestMatchIndex].rating - 0.02) >= songSearch.ratings[songSearch.bestMatchIndex].rating) songSearch = artistsSearch2;

    // final test against threshold
    if (songSearch.ratings[songSearch.bestMatchIndex].rating >= threshold) return videos.tracks[songSearch.bestMatchIndex];
    return false;
  }

  /**
   * searches youtube videos and performs three checks to find out which is the closest match to the track.
   * @param {String} phrase the phrase to search for
   * @param {String} phrase2 the 2nd phrase to search for
   * @param {String} album the album to also help search for
   * @param {String} artists the artists of the song.
   * @returns {Promise<void>}
   */
  static async closestYouTubeMatch(phrase, phrase2, album, artists) {
    const videos = await YouTube.getTracks(`${phrase} lyrics`);

    // ex: https://open.spotify.com/track/1ajLuAuxGHWKwdCJ4MoiqL?si=QLBg4MXiSnKb8DJY_zSOMQ
    if (videos && videos.tracks && videos.tracks[0] && videos.tracks[0].info) {
      const threshold = 0.55;
      const titles = videos.tracks.map((video) => video.info.title);

      // find closest match, if found then we have a pretty accurate match, otherwise we need to try again.
      const found = YouTube.findClosest(videos, threshold, titles, phrase, album, artists);

      if (found) {
        return found;
      }
      // else try 1 more time with just the phrase
      if (phrase2) {
        const videos2 = await YouTube.findClosest(phrase);

        // higher threshold because we're being less restrictive
        const threshold2 = 0.62;
        // 2nd attempt to find the next closest
        if (videos2 && videos2.tracks && videos2.tracks[0] && videos2.tracks[0].info) {
          const titles2 = videos2.tracks.map((video) => video.info.title);
          const found2 = YouTube.findClosest(videos2, threshold2, titles2, phrase2, album, artists);
          if (found2) return found2;
        }
      }
    }
    return undefined;
  }

  async findRelevantVideos(uri) {
    let videoID;

    if (uri.includes('watch?v=')) {
      const split = uri.split('watch?v=');
      if (split.length > 1) {
        [, videoID] = split;
      }
    }

    if (!videoID) {
      throw new Error('Invalid YouTube URI to autoplay off of.');
    }

    return this.relevantVideos(videoID).catch(() => []);
  }

  async relevantVideos(videoID) {
    const info = await request({ url: `https://clipmega.com/watch?v=${videoID}`, timeout }).catch((error) => console.error(error));
    if (!info) return [];

    const { document } = (new JSDOM(info)).window;

    const videoSelection = document.querySelectorAll('.related-video > a');
    if (!videoSelection || videoSelection.length <= 0) return [];

    const basicVideos = videoSelection.map(metaData => {
      if (!metaData || !metaData.href || !metaData.href) return {};
      video = {
        videoID: metaData.href.replace('https://clipmega.com/watch?v=', ''),
        url: metaData.href.replace('clipmega', 'youtube'),
        title: metaData.title,
      };

      return video;
    });


    const thumbnailsSelection = document.querySelectorAll('.related-thumbs > img');
    const thumbnails = thumbnailsSelection.map(thumbnail => (thumbnail && thumbnail.src) ? thumbnail.src : '');

    const durationSelection = document.querySelectorAll('.related-thumbs > span');
    const durations = durationSelection.map(duration => (duration && duration.innerHTML) ? getMilliseconds(duration.innerHTML) : '');

    const channelSelection = document.querySelectorAll('.user');
    const channels = channelSelection.map(channel => (channel && channel.innerHTML) ? channel.innerHTML : '');

    for (let i = 0; i < basicVideos.length; i += 1) {
      if (basicVideos.length === thumbnails.length && thumbnails[i]) {
        video[i].thumbnail = thumbnails[i];
      }

      if (basicVideos.length === durations.length && durations[i]) {
        video[i].thumbnail = durations[i];
      }

      if (basicVideos.length === channels.length && channels[i]) {
        video[i].thumbnail = channels[i];
      }
    }

    // convert to track format
    return basicVideos(basicVideo => ({ info: basicVideo }));
  }
}

module.exports = YouTube;
