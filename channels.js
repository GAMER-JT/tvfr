export const channels = [
  {
    id: 1,
    name: "Sony Novelas",
    image: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/a3bd552eca6645942a60a053fe61fafb.webp",
    country: "Series",
    genre: "Entertainment",
    currentShow: "Estados Unidos",
    language: "Español",
    url: "https://a89829b8dca2471ab52ea9a57bc28a35.mediatailor.us-east-1.amazonaws.com/v1/master/0fb304b2320b25f067414d481a779b77db81760d/CanelaTV_SonyCanalNovelas/playlist.m3u8",
    isLive: true
  },
  {
    id: 2,
    name: "Telemundo Miami",
    image: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/70ef4b19ce0f5b973ff48dffd540d3d8.webp", 
    country: "Noticias",
    genre: "News",
    currentShow: "Estados Unidos",
    language: "Español",
    url: "https://d2kowtvrzzi7ps.cloudfront.net/manifest/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod_default_nbc/5a817dba-a6f1-4dac-9871-91e9e76e1762/2.m3u8",
    isLive: true
  },
  {
    id: 3,
    name: "Canela Deportes",
    image: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/3a49e44efce01bea59de8af9e253695f.webp",
    country: "Deportes",
    genre: "Sports",
    currentShow: "Estados Unidos",
    language: "Español",
    url: "https://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8",
    isLive: true
  },
  {
    id: 4,
    name: "3ABN KIDS",
    image: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/42de800d69d78117b03852bac7ae3818.webp",
    country: "Infantil",
    genre: "Kids",
    currentShow: "Estados Unidos",
    language: "English",
    url: "https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8",
    isLive: true
  },
  {
    id: 5,
    name: "FOX Sports",
    image: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/5c2f33d5ee4ec2d82edb58610f2b0ff7.webp",
    country: "Deportes",
    genre: "Sports",
    currentShow: "Estados Unidos",
    language: "Español",
    url: "https://live-news-manifest.tubi.video/live-news-manifest/csm/extlive/tubiprd01,Fox-Sports-Espanol2.m3u8",
    isLive: true
  },
  {
    id: 6,
    name: "DW Español",
    image: "https://static.dw.com/image/69105274_6.jpg",
    country: "Noticias",
    genre: "Noticias",
    currentShow: "Alemania",
    language: "Español",
    url: "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8",
    isLive: true
  },
  {
    id: 28,
    name: "Cali TV",
    image: "https://image.roku.com/developer_channels/prod/5c8001a2b29bd6e02113870b26f1abaf38d428f3bf2ef15d93539b5b7730c1dd.png",
    country: "Variedades",
    genre: "Variedades", 
    currentShow: "Colombia",
    language: "Español",
    url: "https://5ab772334c39c.streamlock.net/live-calitv/_definst_/calitv1/playlist.m3u8",
    isLive: true
  }
].map(channel => ({
  ...channel,
  image: channel.logo || channel.image,
  url: channel.streamUrl || channel.url
}));

export const getUniqueCategories = () => {
  return [...new Set(channels.map(ch => ch.country))];
};

export const filterChannelsByCategory = (category) => {
  return category ? channels.filter(ch => ch.country === category) : channels;
};

export const searchChannels = (query) => {
  query = query.toLowerCase();
  return channels.filter(ch => 
    ch.name.toLowerCase().includes(query) || 
    ch.country.toLowerCase().includes(query)
  );
};