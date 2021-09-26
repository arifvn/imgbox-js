import axios from 'axios';
import util from 'util';

const URL = {
    baseURL: 'https://imgbox.com',
    root: '/',
    token: 'ajax/token/generate',
    upload: 'upload/process',
    gallery_edit: 'gallery/edit',
    images: 'api/v1/images',
    gallery: 'api/v1/galleries',
    delete_images: 'api/v1/images/delete'
};

const default_token = '0896d8a6ccfb6f5d6ccf102262720e7f';

const REQUEST = axios.create({ baseURL: URL.baseURL });
const interceptors = REQUEST.interceptors.request.use(config => {
    try {
        const filename = config.data && config.method == 'post' && config.url === 'upload/process'
            ? config.data._streams.toString().split('filename="')[1].split('"')[0] : '';

        console.log(util.inspect(
            `${config.method?.toUpperCase()} request to ` +
            `${config.baseURL}${config.url !== '/' ? '/' : ''}${config.url}` +
            `${filename !== '' ? ' with ' + filename : ''}`,
            false, null, true
        ));
        return config;
    } catch (error) {
        return config;
    }
});

const DisableLogger = () => {
    REQUEST.interceptors.request.eject(interceptors);
};

export {
    REQUEST,
    DisableLogger,
    URL,
    default_token
};
