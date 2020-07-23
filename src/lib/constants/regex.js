module.exports = Object.freeze({
  spotify: {
    list: /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/i,
    user: /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/user\/(\w))/i,
    album: /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/i,
    track: /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/i,
    artist: /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:artist\/|\?uri=spotify:album:)((\w|-){22})/i,
  },
});
