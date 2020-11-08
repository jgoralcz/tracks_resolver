/* eslint-disable no-console */
const SpotifyAPI = require('spotify-web-api-node');
const { api } = require('../constants/paths');

const {
  spotify_clientSecret: spotifyClientSecret,
  spotify_clientId: spotifyClientID,
} = require(api);

const maxSongs = 50;
const nextPlaylistURL = 'https://api.spotify.com/v1/playlists/';

module.exports = class Spotify {
  constructor() {
    this.spotify = null;
  }

  async initialization() {
    const data = await this.spotify.clientCredentialsGrant();
    this.spotify.setAccessToken(data.body.access_token);
  }

  /**
   * builds our spotify object because the constructor cannot be async.
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

  async getLinks(playlistID) {
    let playlist = await this.spotify.getPlaylist(playlistID);

    if (!playlist || !playlist.body || !playlist.body.tracks) return [];
    // set this up so it's easier to access
    let list = playlist.body;
    playlist.body.items = list.tracks.items;
    playlist.body.limit = list.tracks.limit;

    let links = Spotify.addTracks(playlist);

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
    return links;
  }

  static addTracks(playlist) {
    if (!playlist || !playlist.body || !playlist.body.items) return [];
    return playlist.body.items.filter((sp) => sp && sp.track).map((sp) => ({ info: Spotify.createSpotifyObject(sp.track) }));
  }

  async getAlbum(id) {
    try {
      const info = await this.spotify.getAlbum(id);
      if (info && info.body && info.body.tracks && info.body.tracks.items) {
        return info.body.tracks.items.map((sp) => ({ info: Spotify.createSpotifyObject(sp, info) }));
      }
    } catch (error) {
      console.error(error);
    }
    return undefined;
  }

  async getTrack(trackID) {
    try {
      const info = await this.spotify.getTrack(trackID);
      return { info: Spotify.createSpotifyObject(info.body, info) };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getArtist(id) {
    try {
      const info = await this.spotify.getArtistTopTracks(id, 'US');

      if (info && info.body && info.body.tracks) {
        return info.body.tracks.map((sp) => ({ info: Spotify.createSpotifyObject(sp, info) }));
      }
      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  static createSpotifyObject(sp, info) {
    return {
      title: `${sp.artists[0].name} - ${sp.name}`,
      name: sp.name,
      album: (info && info.body) ? info.body.name : sp.album.name,
      artists: sp.artists.map((artist) => artist.name),
      length: sp.duration_ms,
      position: 0,
      uri: sp.external_urls.spotify,
    };
  }
};
