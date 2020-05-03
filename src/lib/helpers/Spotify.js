/* eslint-disable no-console */
const SpotifyAPI = require('spotify-web-api-node');
const { spotify_clientSecret: spotifyClientSecret, spotify_clientId: spotifyClientID } = require('../../../config.json');

const maxSongs = 50;
const nextPlaylistURL = 'https://api.spotify.com/v1/playlists/';

module.exports = class Spotify {
  constructor() {
    this.spotify = null;
  }

  /**
   * initialize our spotify client
   * @returns {Promise<void>}
   */
  async initialization() {
    const data = await this.spotify.clientCredentialsGrant();
    this.spotify.setAccessToken(data.body.access_token);
  }

  /**
   * builds our spotify object because the constructor
   * cannot be async.
   * @returns {Promise<module.Spotify>}
   */
  async create() {
    this.spotify = new SpotifyAPI({
      clientId: spotifyClientID,
      clientSecret: spotifyClientSecret,
    });
    await this.initialization();
    return this;
  }

  /**
   * gets the links from a spotify playlist based off the ID
   * @param playlistID the spotify playlist ID.
   * @returns {Promise<void>}
   */
  async getLinks(playlistID) {
    let playlist = await this.spotify.getPlaylist(playlistID);
    let links = [];
    // get max amount of songs
    if (playlist && playlist.body && playlist.body.tracks) {
      // set this up so it's easier to access
      let list = playlist.body;
      playlist.body.items = list.tracks.items;
      playlist.body.limit = list.tracks.limit;

      // then add tracks
      links = [...Spotify.addTracks(playlist), ...links];

      // get new url to page through
      let url = '';
      if (list.tracks.next) {
        url = list.tracks.next.substring(nextPlaylistURL.length, list.tracks.next.length); // https://api.spotify.com/v1/playlists/
      }

      // total number of times I need to request spotify, max of 1200 songs sorry.
      let totalTimes = Math.ceil(playlist.body.tracks.total / 100);
      if (totalTimes >= maxSongs) totalTimes = maxSongs;

      // set interval to request info
      for (let i = 0; i < totalTimes; i += 1) {
        // found a valid url
        if (url) {
          // get next info, and add to list
          // eslint-disable-next-line no-await-in-loop
          playlist = await this.spotify.getPlaylist(url);
          links = [...Spotify.addTracks(playlist), ...links];
          list = playlist.body;
        }

        url = '';
        // get info for the url
        if (playlist && playlist.body) {
          // list next url to retrieve data from
          if (list.next) {
            url = list.next.substring(nextPlaylistURL.length, list.next.length); // https://api.spotify.com/v1/playlists/
          }
        }
      }
    }
    return links;
  }

  /**
   * adds tracks from the spotify playlist
   * @param {Array<Object>} playlist the spotify playlist
   * @return {String} the next playlist
   */
  static addTracks(playlist) {
    // playlist has info
    if (playlist && playlist.body && playlist.body.items) {
      return playlist.body.items.map(sp => ({ info: Spotify.initSpotifyObject(sp.track) }));
    }
    return [];
  }

  /**
   * get spotify album
   * @param id the id of the album
   * @returns {Promise<void>}
   */
  async getAlbum(id) {
    try {
      const info = await this.spotify.getAlbum(id);

      // found our info
      if (info && info.body && info.body.tracks && info.body.tracks.items) {
        return info.body.tracks.items.map(sp => ({ info: Spotify.initSpotifyObject(sp, info) }));
      }
    } catch (error) {
      console.error(error);
    }
    return undefined;
  }

  /**
   * get a spotify track
   * @param trackID the id of the track
   * @returns {Promise<void>}
   */
  async getTrack(trackID) {
    try {
      const info = await this.spotify.getTrack(trackID);
      return { info: Spotify.initSpotifyObject(info.body, info) };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /**
   * gets artist content
   * @param id the ID of the artist.
   * @returns {Promise<void>}
   */
  async getArtist(id) {
    try {
      const info = await this.spotify.getArtistTopTracks(id, 'US');

      if (info && info.body && info.body.tracks) {
        return info.body.tracks.map(sp => ({ info: Spotify.initSpotifyObject(sp, info) }));
      }
      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /**
   * initiates a spotify object
   * @param sp the spotify api object
   * @param info our info
   * @returns {{title: string, name: *, album: *,
   * artists: any[], length: *, position: number, uri: (null|SpotifyWebApi)}}
   */
  static initSpotifyObject(sp, info) {
    return {
      title: `${sp.artists[0].name} - ${sp.name}`,
      name: sp.name,
      album: (info && info.body) ? info.body.name : sp.album.name,
      artists: sp.artists.map(artist => artist.name),
      length: sp.duration_ms,
      position: 0,
      uri: sp.external_urls.spotify,
    };
  }
};
