# Track Resolver
Middleware to resolve tracks.

## Setup
Setup your `config.json` file at the root of the project like so:
```json
  {
    "yt_api_keys": [
      "youtube_api_key_look_up_online",
      "I_recommend_multiple_keys",
    ]
  }
```

## Usage
Make a POST request to the url and a response body like so:
 
```js
{ "uri": "youtube.com/watch?v=stuff" }
```
example response:
```json
{
    "title": "Where Are We Going [OFFICIAL] 2018 lyrics",
    "uri": "https://redirector.googlevideo.com/videoplayback?expire=1571576839&ei=pwesXcO4J4uHir4Pvqyv2Ao&ip=35.187.132.251&id=o-AJKGQqWvJDsL45oN4zfRO5HPlpp7jX7grDRxi-ndUJeY&itag=18&source=youtube&requiressl=yes&mm=31,29&mn=sn-qxoedn7e,sn-qxo7sney&ms=au,rdu&mv=m&mvi=0&pl=28&mime=video/mp4&gir=yes&clen=9404565&ratebypass=yes&dur=309.080&lmt=1539265400861934&mt=1571555076&fvip=1&fexp=23842630&c=WEB&txp=5531432&sparams=expire,ei,ip,id,itag,source,requiressl,mime,gir,clen,ratebypass,dur,lmt&sig=ALgxI2wwRQIgLLK8X08FiwDaPmvsMV-mTme7vGO2Mxm9OZvMUKno2Y4CIQD_8doLoj5-trPtaSWxFSWGfbqo7vEmZpCZprOUE2HfuQ==&lsparams=mm,mn,ms,mv,mvi,pl&lsig=AHylml4wRgIhAKAossY_ZCAwggQD5HwxYgeMcDquy2gLVsFLC4j86UEHAiEA6Qdv17NiYw1KFzdGl4SRsrMz1bB_FmjiyAUEZSlI3e4=",
    "identifier": "E7Sa6ZQRqFM"
}
```

or search for a word

```js
{ "search": "Mr. Blue Sky" }
```
example response:
```json
{
    "tracks": [
        {
            "info": {
                "title": "Electric Light Orchestra - Mr. Blue Sky (Audio)",
                "uri": "https://www.youtube.com/watch?v=s7dTBoW5H9k",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/s7dTBoW5H9k/mqdefault.jpg",
                "length": 305000,
                "author": "ELOVEVO",
                "identifier": "s7dTBoW5H9k"
            }
        },
        {
            "info": {
                "title": "Electric Light Orchestra - Mr Blue Sky (Guardians of the Galaxy 2: Awesome Mix Vol. 2 )",
                "uri": "https://www.youtube.com/watch?v=VMtarj8Ua0s",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/VMtarj8Ua0s/mqdefault.jpg",
                "length": 304000,
                "author": "DJ Rome",
                "identifier": "VMtarj8Ua0s"
            }
        },
        {
            "info": {
                "title": "Electric Light Orchestra - Mr. Blue Sky (Animated Video)",
                "uri": "https://www.youtube.com/watch?v=G8dsvclf3Tk",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/G8dsvclf3Tk/mqdefault.jpg",
                "length": 223000,
                "author": "ELOVEVO",
                "identifier": "G8dsvclf3Tk"
            }
        },
        {
            "info": {
                "title": "Electric Light Orchestra - Mr. Blue Sky",
                "uri": "https://www.youtube.com/watch?v=aQUlA8Hcv4s",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/aQUlA8Hcv4s/mqdefault.jpg",
                "length": 295000,
                "author": "ELOVEVO",
                "identifier": "aQUlA8Hcv4s"
            }
        },
        {
            "info": {
                "title": "Weezer - Mr. Blue Sky",
                "uri": "https://www.youtube.com/watch?v=6_aqeCDk1Yk",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/6_aqeCDk1Yk/mqdefault.jpg",
                "length": 287000,
                "author": "weezer",
                "identifier": "6_aqeCDk1Yk"
            }
        },
        {
            "info": {
                "title": "Mr. Blue Sky with Lyrics",
                "uri": "https://www.youtube.com/watch?v=CPAC2SWvo6E",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/CPAC2SWvo6E/mqdefault.jpg",
                "length": 309000,
                "author": "The Cove",
                "identifier": "CPAC2SWvo6E"
            }
        },
        {
            "info": {
                "title": "Mr blue sky Fanimation music video",
                "uri": "https://www.youtube.com/watch?v=8MjjCuSEBsM",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/8MjjCuSEBsM/mqdefault.jpg",
                "length": 224000,
                "author": "Tristans Toons",
                "identifier": "8MjjCuSEBsM"
            }
        },
        {
            "info": {
                "title": "Jeff Lynne",
                "uri": "https://www.youtube.com/watch?v=Nubi_xJJ1Jg",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/Nubi_xJJ1Jg/mqdefault.jpg",
                "length": 300000,
                "author": "David Webb",
                "identifier": "Nubi_xJJ1Jg"
            }
        },
        {
            "info": {
                "title": "Discord Sings Mr. Blue Sky (gone wrong)",
                "uri": "https://www.youtube.com/watch?v=2KG-vH46U0c",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/2KG-vH46U0c/mqdefault.jpg",
                "length": 342000,
                "author": "FizzyGoldTing",
                "identifier": "2KG-vH46U0c"
            }
        },
        {
            "info": {
                "title": "Beat Saber - Mr. Blue Sky - Electric Light Orchestra (custom song) | FC",
                "uri": "https://www.youtube.com/watch?v=ziWXxg2NhYs",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/ziWXxg2NhYs/mqdefault.jpg",
                "length": 233000,
                "author": "Tempex",
                "identifier": "ziWXxg2NhYs"
            }
        },
        {
            "info": {
                "title": "Mr. Blue Sky (ft. Cursed Images)",
                "uri": "https://www.youtube.com/watch?v=gW4Q8y7Zde8",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/gW4Q8y7Zde8/mqdefault.jpg",
                "length": 229000,
                "author": "sm33r",
                "identifier": "gW4Q8y7Zde8"
            }
        },
        {
            "info": {
                "title": "Every time Mr. Blue Sky shows up on movies (Montage)",
                "uri": "https://www.youtube.com/watch?v=BAK1EErTyOc",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/BAK1EErTyOc/mqdefault.jpg",
                "length": 258000,
                "author": "Jovi Prata",
                "identifier": "BAK1EErTyOc"
            }
        },
        {
            "info": {
                "title": "Mr Blue Sky Guardians of the Galaxy Vol 2",
                "uri": "https://www.youtube.com/watch?v=t2xOT9-DZGE",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/t2xOT9-DZGE/mqdefault.jpg",
                "length": 303000,
                "author": "Lyrics music",
                "identifier": "t2xOT9-DZGE"
            }
        },
        {
            "info": {
                "title": "MegaMind - Electric Light Orchestra - Mr Blue Sky",
                "uri": "https://www.youtube.com/watch?v=ET5pj7HmQ08",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/ET5pj7HmQ08/mqdefault.jpg",
                "length": 178000,
                "author": "Avatarthelastbenderheaven",
                "identifier": "ET5pj7HmQ08"
            }
        },
        {
            "info": {
                "title": "Jeff Lynne",
                "uri": "https://www.youtube.com/watch?v=LMY5xe36cfE",
                "thumbnail": "https://ytimg.googleusercontent.com/vi/LMY5xe36cfE/mqdefault.jpg",
                "length": 310000,
                "author": "BBC Radio 2",
                "identifier": "LMY5xe36cfE"
            }
        }
    ]
}
```
