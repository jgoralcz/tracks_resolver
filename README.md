# Track Resolver
API to resolve very minimal youtube metadata without actually using youtube.

## Setup
Setup your `api.json` file at the root of the project like so (this is found on spotify):
```json
{
    "spotify_clientId": "client_id",
    "spotify_clientSecret": "client_secret"
}
```

Setup your `auth.json` file at the root of the project like so (change username and password):
```json
{
    "username": "yo",
    "password": "wudup"
}
```

Setup your `config.json` file at the root of the project like so (you can custom 1-59; default 30); the refresh time for the spotify token because i'm lazy:
```json
{
  "refreshTimeInMinutes": 30
}
```
<br>
<br>

## Usage
---
### Youtube
`GET - /youtube/search` - `name` or `url` query params required; `type` query param (`invidio` for invidio) \
ex: `localhost:8443/youtube/search?name=thanks+for+the+memories`
```js
{
    "tracks": [
        {
            "info": {
                "title": "Fall Out Boy - Thanks For The Memories lyrics with song",
                "uri": "https://www.youtube.com/watch?v=3jx7SF65wbs",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/3jx7SF65wbs/mqdefault.jpg",
                "length": 207000,
                "author": "mo8955",
                "identifier": "3jx7SF65wbs"
            }
        },
        {
            "info": {
                "title": "Fall Out Boy - Thnks fr th Mmrs (Official Music Video)",
                "uri": "https://www.youtube.com/watch?v=onzL0EM1pKY",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/onzL0EM1pKY/mqdefault.jpg",
                "length": 254000,
                "author": "Fall Out Boy",
                "identifier": "onzL0EM1pKY"
            }
        },
        {
            "info": {
                "title": "Nightcore - Thanks For The Memories",
                "uri": "https://www.youtube.com/watch?v=NRj8n4a7kpU",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/NRj8n4a7kpU/mqdefault.jpg",
                "length": 173000,
                "author": "NightcoreReality",
                "identifier": "NRj8n4a7kpU"
            }
        },
        {
            "info": {
                "title": "Thanks for the Memory",
                "uri": "https://www.youtube.com/watch?v=nKgUq5dziEk",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/nKgUq5dziEk/mqdefault.jpg",
                "length": 288000,
                "author": "scott9445",
                "identifier": "nKgUq5dziEk"
            }
        },
        {
            "info": {
                "title": "Fall Out Boy - Thnks Fr Th Mmrs (Audio) (HD)",
                "uri": "https://www.youtube.com/watch?v=cMY5VwfcGdU",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/cMY5VwfcGdU/mqdefault.jpg",
                "length": 204000,
                "author": "TheMephBot",
                "identifier": "cMY5VwfcGdU"
            }
        },
        .
        .
        .
        
    ],
    "type": "clipmega"
}
```
ex: `localhost:8443/youtube/search?url=https://www.youtube.com/watch?v=3jx7SF65wbs`
```js
{
    "title": "Fall Out Boy - Thanks For The Memories lyrics with song",
    "uri": "https://redirector.googlevideo.com/videoplayback?expire=1595495753&ei=6QAZX6uFFsilhwbW9o6wDA&ip=66.249.83.119&id=o-ACOXNzzMuu869FBLXkVQq0Ljwuq7-bVsLslAF406D-79&itag=18&source=youtube&requiressl=yes&mh=AV&mm=31,26&mn=sn-5uaezn7e,sn-5hne6n7e&ms=au,onr&mv=m&mvi=3&pl=28&initcwndbps=19561250&vprv=1&mime=video/mp4&gir=yes&clen=6880762&ratebypass=yes&dur=206.425&lmt=1540239407082860&mt=1595474069&fvip=3&fexp=23883097&c=WEB&txp=5531432&sparams=expire,ei,ip,id,itag,source,requiressl,vprv,mime,gir,clen,ratebypass,dur,lmt&lsparams=mh,mm,mn,ms,mv,mvi,pl,initcwndbps&lsig=AG3C_xAwRQIhAJY_UhLkV5IBmvuA7Enp51C5ExAkyfY5gAp8SrSlxxlTAiBABCVWYc35tjMA2VDqdrqyDGopm9uBQRlXmK56BCPexg==&sig=AOq0QJ8wRQIgaR0Ul_3-B1OIcHIc6PEa-cbq3RZm5D4C-p2QbIUOFNICIQDtcN3jIoFZMkWOGYpDD9WAl6QdG0auxR01GpHoFFhvWQ==",
    "type": "clipmega"
}
```

`GET - /youtube/similarto` - url query param required \
ex: `localhost:8443/youtube/similarto?url=https://www.youtube.com/watch?v=3jx7SF65wbs`

```js
{
    "tracks": [
        {
            "info": {
                "videoID": "Ufb70h78eO4",
                "url": "https://www.youtube.com/watch?v=Ufb70h78eO4",
                "title": "Fall Out Boy - Sugar We",
                "thumbnail": "//ytimg.googleusercontent.com/vi/Ufb70h78eO4/mqdefault.jpg",
                "length": 217000,
                "author": "deejayelectronic"
            }
        },
        {
            "info": {
                "videoID": "qVmnkZdbH2U",
                "url": "https://www.youtube.com/watch?v=qVmnkZdbH2U",
                "title": "Fall Out Boy - Dance, Dance Lyrics",
                "thumbnail": "//ytimg.googleusercontent.com/vi/qVmnkZdbH2U/mqdefault.jpg",
                "length": 182000,
                "author": "Amber Thomas"
            }
        },
        .
        .
        .
    ]
}
```

`GET - /spotify` - pharse (required), artists, backupPhrase, album \
`ex: localhost:8443/youtube/spotify?phrase=I+Remember&artists=deadmau5`
```js
{
    "info": {
        "title": "deadmau5 & Kaskade - I Remember (HQ)",
        "uri": "https://www.youtube.com/watch?v=zK1mLIeXwsQ",
        "thumbnail": "https://ytimg.googleusercontent.com/vi/zK1mLIeXwsQ/mqdefault.jpg",
        "length": 594000,
        "author": "Ultra Music",
        "identifier": "zK1mLIeXwsQ"
    }
}
```
<br>
<br>

### Spotify
`GET - /spotify` - url (required) \
ex: `localhost:8443/spotify?url=https://open.spotify.com/artist/6S2tas4z6DyIklBajDqJxI?si=9Nx7X-HeT7KAsTvIIxOUHw`
```js
[
    {
        "info": {
            "title": "Infected Mushroom - Becoming Insane",
            "name": "Becoming Insane",
            "artists": [
                "Infected Mushroom"
            ],
            "length": 440266,
            "position": 0,
            "uri": "https://open.spotify.com/track/1Nukcy7xk7AbS7MtkaiOe3"
        }
    },
    {
        "info": {
            "title": "Infected Mushroom - I Wish (feat. Jay Jenner)",
            "name": "I Wish (feat. Jay Jenner)",
            "artists": [
                "Infected Mushroom",
                "Jetlag Music",
                "HOT-Q",
                "Jay Jenner",
                "WhyNot Music"
            ],
            "length": 171436,
            "position": 0,
            "uri": "https://open.spotify.com/track/22z9GL53FudbuFJqa43Nzj"
        }
    },
    {
        "info": {
            "title": "Infected Mushroom - More of Just the Same",
            "name": "More of Just the Same",
            "artists": [
                "Infected Mushroom",
                "WHITENO1SE"
            ],
            "length": 428556,
            "position": 0,
            "uri": "https://open.spotify.com/track/3c9DkPaBKxwVETIxQhQydW"
        }
    },
    {
        "info": {
            "title": "Infected Mushroom - Guitarmass",
            "name": "Guitarmass",
            "artists": [
                "Infected Mushroom"
            ],
            "length": 398896,
            "position": 0,
            "uri": "https://open.spotify.com/track/6VHBZt8T7ZdlUt3MkOZqPy"
        }
    },
    .
    .
    .
]
```
ex: `localhost:8443/spotify?url=https://open.spotify.com/album/7GjVWG39IOj4viyWplJV4H?si=NhAnY3_9SwWEXeXexQ7A2g`
```js
[
    {
        "info": {
            "title": "MGMT - She Works Out Too Much",
            "name": "She Works Out Too Much",
            "album": "Little Dark Age",
            "artists": [
                "MGMT"
            ],
            "length": 278386,
            "position": 0,
            "uri": "https://open.spotify.com/track/3XOKU8CKSiQsuQHD5vhzo5"
        }
    },
    {
        "info": {
            "title": "MGMT - Little Dark Age",
            "name": "Little Dark Age",
            "album": "Little Dark Age",
            "artists": [
                "MGMT"
            ],
            "length": 299960,
            "position": 0,
            "uri": "https://open.spotify.com/track/2Y0iGXY6m6immVb2ktbseM"
        }
    },
    {
        "info": {
            "title": "MGMT - When You Die",
            "name": "When You Die",
            "album": "Little Dark Age",
            "artists": [
                "MGMT"
            ],
            "length": 263880,
            "position": 0,
            "uri": "https://open.spotify.com/track/3td69vL9Py7Ai9wfXYnvji"
        }
    },
    {
        "info": {
            "title": "MGMT - Me and Michael",
            "name": "Me and Michael",
            "album": "Little Dark Age",
            "artists": [
                "MGMT"
            ],
            "length": 289853,
            "position": 0,
            "uri": "https://open.spotify.com/track/0t4z0WaQomQqPONghWn8c2"
        }
    },
    .
    .
    .
]
```
ex: `localhost:8443/spotify?url=https://open.spotify.com/playlist/6z20B1TeXT8zAIp6m1XtLR?si=-mhsGw4DTEyI6zYNEHLcRQ`

```js
[
    {
        "info": {
            "title": "Infected Mushroom - Becoming Insane",
            "name": "Becoming Insane",
            "album": "Vicious Delicious",
            "artists": [
                "Infected Mushroom"
            ],
            "length": 440266,
            "position": 0,
            "uri": "https://open.spotify.com/track/1Nukcy7xk7AbS7MtkaiOe3"
        }
    },
    {
        "info": {
            "title": "Infected Mushroom - Saeed",
            "name": "Saeed",
            "album": "Legend Of The Black Shawarma",
            "artists": [
                "Infected Mushroom"
            ],
            "length": 423720,
            "position": 0,
            "uri": "https://open.spotify.com/track/2NRFvNVeJ7GVQ46WW8lUbx"
        }
    },
    .
    .
    .
]
```
ex: `localhost:8443/spotify?url=https://open.spotify.com/track/0hbmFuxS3BaxdXdxYdjF0S?si=aJUXNPMsSxGJ9omQHoRf1Q`
```js
{
    "info": {
        "title": "Infected Mushroom - See Me Now",
        "name": "See Me Now",
        "album": "See Me Now",
        "artists": [
            "Infected Mushroom"
        ],
        "length": 320000,
        "position": 0,
        "uri": "https://open.spotify.com/track/0hbmFuxS3BaxdXdxYdjF0S"
    }
}
```
