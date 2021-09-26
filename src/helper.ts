import { REQUEST, URL } from './request';
import {
    ICsrfCookie,
    IAlbumConfig,
    IToken,
    ThumbnailSize,
    ContentType,
    CommentEnabled,
    IResponseObject
} from './interfaces';
import FormData from 'form-data';

const getCsrfAndCookie = async (): Promise<ICsrfCookie> => {
    try {
        const { data, headers } = await REQUEST.get(URL.root);

        const csrf_token = data.split('<input name="authenticity_token" type="hidden" value=')[1].split(' ')[0].replace(/"/g, '');
        const cookie = headers['set-cookie'][1].split(';')[0];

        return { csrf_token, cookie };
    } catch (error: any) {
        throw new Error('Failed to get CSRF-Token and Cookie. Try Again');
    }
};

const getAuthCsrf = async (authCookie: string, token: string): Promise<ICsrfCookie> => {
    try {

        const csrfConfig = setHeadersConfig([
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'Cookie', value: authCookie },
            { key: 'If-None-Match', value: token },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'Accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Origin', value: URL.baseURL },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Mode', value: 'cors' },
            { key: 'Sec-Fetch-Dest', value: 'empty' },
            { key: 'Referer', value: URL.baseURL + '/' },
            { key: 'Accept-Language', value: 'en-US,en;q=0.9,id;q=0.8' },
            { key: 'Cookie', value: authCookie }
        ]);

        const { data } = await REQUEST.get('images#/all/1', csrfConfig);

        let csrf_token = '';
        let cookie = '';

        const regex = /<meta content="(.*?)" name="csrf-token"/;
        const match = data.match(regex);
        csrf_token = match[1];

        return { csrf_token, cookie };
    } catch (error: any) {
        throw new Error('Failed to get CSRF-Token and Cookie. Try Again');
    }
};

const setHeadersConfig = (configs: { key: string, value: string; }[]): object => {
    const config: any = {
        headers: {
            DNT: 1,
            Origin: URL.root,
            Referer: URL.root + '/',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Connection: 'keep-alive',
            'User-Agent':
                'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Sec-GPC': 1,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    };
    configs.forEach((val, _) => {
        config.headers[val.key] = val.value;
    });
    return config;
};

const getToken = async (album_config: IAlbumConfig, auth_cookie?: string, default_token?: string): Promise<IToken> => {
    let csrfCookie = null;

    if (auth_cookie) {
        csrfCookie = await getAuthCsrf(auth_cookie, default_token!);
    } else {
        csrfCookie = await getCsrfAndCookie();
    }

    const config = setHeadersConfig([
        { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
        { key: 'Cookie', value: auth_cookie ? auth_cookie : csrfCookie.cookie }
    ]);

    try {
        let data = null;

        if (album_config.gallery) {
            const response = await REQUEST.post(URL.token, album_config, config);
            data = response.data;
        } else {
            const response = await REQUEST.post(URL.token, null, config);
            data = response.data;
        }

        return {
            token_id: data.token_id,
            token_secret: data.token_secret,
            gallery_id: data.gallery_id ? data.gallery_id : 'null',
            gallery_secret: data.gallery_secret ? data.gallery_secret : 'null'
        };
    } catch (error: any) {
        throw new Error('Failed to get Token. Try Again');
    }
};

const createFormData = (
    token: IToken,
    contentType: ContentType,
    thumbnail_size: ThumbnailSize,
    comments_enabled: CommentEnabled
): FormData => {
    const form = new FormData();
    form.append('token_id', token.token_id);
    form.append('token_secret', token.token_secret);
    form.append('gallery_id', token.gallery_id);
    form.append('gallery_secret', token.gallery_secret);
    form.append('content_type', contentType === 'safe' ? 1 : 2);
    form.append('thumbnail_size', thumbnail_size);
    form.append('comments_enabled', comments_enabled ? 1 : 0);

    return form;
};

const urlToBuffer = async (url: string): Promise<Buffer> => {
    try {
        const { data } = await REQUEST.get(url, { responseType: 'arraybuffer' });
        return data;
    } catch (error) {
        throw new Error(`Invalid URL Path Error ${url}`);
    }
};

const postImage = async (url: string | Buffer, form: FormData, filename?: string): Promise<object> => {
    try {
        const buffer = typeof url === 'string' ? await urlToBuffer(url) : url;

        form.append('files[]', buffer, filename ? filename + '.jpg' : new Date().getTime().toString() + '.jpg');
        const config = setHeadersConfig([
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);

        const { data } = await REQUEST.post(URL.upload, form, config);
        return data.files;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

const addGalleryEditResponse = (result: IResponseObject, token: IToken) => {
    if (token.gallery_id !== 'null') {
        result.data['gallery_edit'] = `${URL.baseURL}/${URL.gallery_edit}/${token.gallery_id}/${token.gallery_secret}`;
    }
};

export {
    getCsrfAndCookie,
    getAuthCsrf,
    setHeadersConfig,
    getToken,
    createFormData,
    urlToBuffer,
    postImage,
    addGalleryEditResponse
};