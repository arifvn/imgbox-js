# imgbox-js 🗳️
[![Code Quality Score](https://www.code-inspector.com/project/29187/status/svg)](https://frontend.code-inspector.com/public/project/29187/imgbox-js/dashboard)
[![Code Quality Score](https://www.code-inspector.com/project/29187/score/svg)](https://frontend.code-inspector.com/public/project/29187/imgbox-js/dashboard)

Lightweight [IMGBOX](https://imgbox.com) API. Unlimited free hosting for images 🗳️.

## Installation

```bash
npm install imgbox-js
```

## Import

```ts
import { imgbox } from 'imbox-js'
// or
const imgbox = require('imgbox-js')
```

## Usage

- **Pattern**
```ts
imgbox(images, options)
    .then(res => console.log(res))

// images is mandatory
// options is optional
```

- **Singe URL/Path**
```ts
imgbox('https://picsum.photos/200/300')
    .then(res => console.log(res));

imgbox('my_folder/img.jpg')
    .then(res => console.log(res));
```

- **Multiple URL/Path**
```ts
const images = [
    'https://picsum.photos/200/300',
    'my_folder/img.jpg',
    'my_folder/photo.png'
]

imgbox(images)
    .then(res => console.log(res));
```

- **Singe URL/Path + Filename**
```ts
const image1 = { source: 'https://picsum.photos/200/300', filename: 'Photo from URL' }
imgbox(image1)
    .then(res => console.log(res));

const image2 = { source: 'my_folder/photo.png', filename: 'Photo from Local Path' }
imgbox(image2)
    .then(res => console.log(res));
```

- **Multiple URL/Path + Filename**
```ts
const image1 = { source: 'https://picsum.photos/200/300', filename: 'Lorem Photos from URL' }
const image2 = { source: 'img.jpg', filename: 'Lorem Photos from Path' }

imgbox([ image1, image2 ])
    .then(res => console.log(res));
```

---

- **Images + Options**
```ts
const images = [
    'https://picsum.photos/200/300',
    'img.jpg'
]

const options = {
    auth_cookie: 'nxIksl91sXxS8ls1', // default null 
    album_title: 'Lorem Photos Album', // default null 
    content_type: 'safe', // default 'safe' 
    thumbnail_size: '350c', // default '100c'
    comments_enabled: false, // default false 
    logger: true // default true 
}

imgbox(images, options)
    .then(res => console.log(res));
```

**Note :** 🚀
| options            | type      | description                                                                                                                                                                                                                                      |
|------------------  |---------  |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------     |
| `auth_cookie`      | `string`  | As default images is uploaded as a guest. <br />To get cookie and upload as logged in user jump [here](#get-login-cookie)                                                                                                |
| `album_title`      | `string`  | Title of gallery/album                                                                                                                                                                                                                           |
| `content_type`     | `string`  | `'safe'`= family safe content <br /> `'adult'`= adult content                                                                                                                                                                                    |   
| `thumbnail_size`   | `string`  | c = thumbnail will be cropped <br /> r = thumbnail will be resized <br />  `'100c'`, `'150c'`, `'200c'`, `'250c'`, `'300c'`, `'350c'`, `'500c'`, `'800c'` <br /> `'100r'`, `'150r'`, `'200r'`, `'250r'`, `'300r'`, `'350r'`, `'500r'`, `'800r'`  |
| `comments_enabled` | `boolean` | enable/disable comment section for particular image/gallery <br /> `true`, `false`                                                                                                                                                               |
| `logger`           | `boolean` | enable/disable request log <br /> `true`, `false`                                                                                                                                                                                                |


- **Multiple URL/Path + Filename + Create Album**
```ts
const auth_cookie = '_imgbox_session=ZmtjTFR...'

const images = [
    { source: 'https://picsum.photos/200/300', filename: 'Lorem Photos from URL' },
    { source: 'https://picsum.photos/200', filename: 'Lorem Photos from URL' },
    { source: 'https://picsum.photos/300', filename: 'Lorem Photos from URL' },
    { source: 'img.jpg', filename: 'Lorem Photos from Path' }
]

const options = {
    auth_cookie: auth_cookie,
    album_title: 'Lorem Photos Album',
    content_type: 'safe',
    thumbnail_size: '350c',
    comments_enabled: false,
    logger: false
}

imgbox(images, options).then(res => console.log(res));
```

- **URL/Path + Create Album**
```ts
const options = {
    album_title: 'My Album',
    content_type: 'safe',
    thumbnail_size: '350r',
    comments_enabled: 1
}

imgbox('https://picsum.photos/200', options)
    .then(res => console.log(res));

imgbox('img.jpg', options)
    .then(res => console.log(res));
```

---

- **Get Images**
```ts
const auth_cookie = '_imgbox_session=ZmtjTFR...'

const options = {
    auth_cookie: auth_cookie, // mandatory
    scope: 'all', // optional, default 'all'
    page: 1, // optional, default 1
    logger: true // optional, default true
}

imgbox
    .getImages(options)
    .then(res => console.log(res));
```

**Note :** 🚀
| options         | type      | description                                                                                       |
|------------     |---------  |--------------------------------------------------------------------------------------------       |
| `auth_cookie`   | `string`  | this is mandatory to get access to your images.                                                   |
| `scope`         | `string`  | `'all'`= get all images from your account <br /> `'unbound'`= get images that belong to a gallery |
| `page`          | `number`  | pagination, return empty array `[]` if images are empty in particular page                        |
| `logger`        | `boolean` | enable/disable request log <br /> `true`, `false`                                                 |   

- **Get Galleries**
```ts
const options = {
    auth_cookie: '_imgbox_session=ZmtjTFR...', // mandatory
    page: 1, // optional, default 1
    logger: true,  // optional, default true
    order_by: 'updated'  // optional, default 'updated'
}

// get galleries along with it's images from your account
imgbox
    .getGalleries(options)
    .then(res => console.log(res));
```

**Note :** 🚀
`order_by` is `string`. 
Possible values : `'updated'` or  `'created'` or  `'title'`

---

- **Delete Images**
```ts
// you can pass ID or Image's URL
// as Array 
const images = [
    'KEqFMTKX',
    'https://imgbox.com/xxXsDvUv'
]

// delete images from your account
imgbox
    .deleteImages(images, { auth_cookie: '_imgbox_session=ZmtjTFR...' })
    .then(res => console.log(res));
```

- **Delete Gallery**
```ts
// url got from upload images + create album
const gallery_edit_url = 'https://imgbox.com/gallery/edit/zTFrSKPFF4/JR0hdNWKEAeChDFi'

// delete as logged in user
imgbox
    .deleteGallery(gallery_edit_url, { auth_cookie: '_imgbox_session=ZmtjTFR...' })
    .then(res => console.log(res
```

---

- **Enable/Disable Gallery Comment**
```ts
// url got from upload images + create album
const gallery_edit_url = 'https://imgbox.com/gallery/edit/zTFrSKPFF4/JR0hdNWKEAeChDFi'

imgbox
    .updateComment(gallery_edit_url, { comments_enabled: true })
    .then(res => console.log(res));
```

## Get Login Cookie
Unfortunately, there's no way to get `Http Only Cookie` by just using Javascript. [IMGBOX](https://imgbox.com) does not provide such as `api_token` either. So, to get access it's protected route we need to open up the browser and grab the Cookie after we are logged in.
![get_login_cookie.jpg](imgbox-cookie.png?raw=true "Title")

```ts
// then you can use it whenever you dealing with this API, eg.
const auth_cookie = '_imgbox_session=ZmtjTFR...'
```

## Contributing
[Pull requests](https://github.com/empun/imgbox-js/pulls) are welcome.

## License
[MIT](https://github.com/empun/imgbox-js/blob/main/LICENSE)
