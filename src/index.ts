import { REQUEST, DisableLogger, URL, default_token } from './request';
import {
    IAlbumConfig,
    ThumbnailSize,
    ContentType,
    CommentEnabled,
    LoggerEnabled,
    Images,
    WithName,
    IResponseObject,
    ImageScope,
    OrderBy,
    IToken
} from './interfaces';
import {
    getCsrfAndCookie,
    getAuthCsrf,
    setHeadersConfig,
    getToken,
    createFormData,
    postImage,
    addGalleryEditResponse
} from './helper';
import FormData from 'form-data';
import isUrl from 'is-url';
import fs from 'fs';

/* 
 * 
 * Upload pictures to Imgbox and get URLs in response
 *
 * @param {Object} images - [MANDATORY] URL | URL[] | FilePath | FilePath[] | WithName | WithName[]
 * @param {Object} options - [OPTIONAL]
 * @param {string} options.auth_cookie - AuthCookie you got after login (from browser)
 * @param {string} options.album_title - Title of your Album
 * @param {number} options.content_type - 1 = FamilySafeContent | 2 = AdultContent
 * @param {string} options.thumbnail_size - '100c'| '150c'| '200c'| '250c'| '300c'| '350c'| '500c'| '800c'| '100r'| '150r'| '200r'| '250r'| '300r'| '350r'| '500r'| '800r';
 * @param {string} options.comments_enabled - 0 = Disabled | 1 = Enabled
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>}
 * a promise. Access your data using `.then` as shown in [the README](https://github.com/empun/imgbox-js#readme)
 */
const imgbox = async (
    images: Images,
    options?: {
        auth_cookie?: string,
        album_title?: string,
        content_type?: ContentType,
        thumbnail_size?: ThumbnailSize,
        comments_enabled?: CommentEnabled,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        const content_type: ContentType = options?.content_type ? options.content_type : 'safe';
        const thumbnail_size: ThumbnailSize = options?.thumbnail_size ? options.thumbnail_size : '100c';
        const comments_enabled: CommentEnabled = options?.comments_enabled ? options.comments_enabled : false;
        const album_config: IAlbumConfig = {
            gallery: options?.album_title ? true : false,
            gallery_title: options?.album_title ? options.album_title : 'Album ' + new Date().getTime(),
            comments_enabled
        };

        if (options?.logger === false) {
            DisableLogger();
        }

        let token: IToken = options?.auth_cookie
            ? await getToken(album_config, options.auth_cookie, default_token)
            : await getToken(album_config);

        const form = createFormData(
            token,
            content_type,
            thumbnail_size,
            comments_enabled
        );

        let result: IResponseObject = { ok: false, message: '', data: [] };

        if (typeof images === 'string') {
            // 1. 'http://lorem.photo/photo.jpg'
            if (isUrl(images)) {
                const data = await postImage(images, form);
                result = { ok: true, message: 'Image URL has been uploaded.', data };
                addGalleryEditResponse(result, token);
            }
            // 2. 'src/foo.jpg'
            if (!isUrl(images)) {
                try {
                    if (fs.statSync(images).isFile()) {
                        const data = await postImage(fs.readFileSync(images), form);
                        result = { ok: true, message: 'Image file has been uploaded.', data };
                        addGalleryEditResponse(result, token);
                    }
                } catch (error: any) {
                    throw new Error(error.message);
                }
            }
        }

        if ((images as WithName).source) {
            // 3. { source: 'http://lorem.photo/photo.jpg', filename: 'sky from url' }
            if (isUrl((images as WithName).source)) {
                const data = await postImage((images as WithName).source, form, (images as WithName).filename);
                result = { ok: true, message: 'Image URL has been uploaded.', data };
                addGalleryEditResponse(result, token);
            }
            // 4. { source: 'src/foo.jpg', filename: 'sky from path' }
            if (!isUrl((images as WithName).source)) {
                try {
                    if (fs.statSync((images as WithName).source).isFile()) {
                        const data = await postImage(fs.readFileSync((images as WithName).source), form, (images as WithName).filename);
                        result = { ok: true, message: 'Image file has been uploaded.', data };
                        addGalleryEditResponse(result, token);
                    }
                } catch (error: any) {
                    throw new Error(error.message);
                }
            }
        }

        if (images.constructor === Array) {
            let dataArray: any[] = [];

            // 5. ['http://lorem.photo/photo.jpg', 'src/photo2.jpg']
            if ((images as string[])) {
                dataArray = await Promise.allSettled(images.map(async (source, _) => {
                    if (typeof source === 'string' && isUrl(source)) {
                        const form = createFormData(token, content_type, thumbnail_size, comments_enabled);
                        const data = await postImage(source as string, form);
                        return data;
                    }
                    if (typeof source === 'string' && !isUrl(source)) {
                        try {
                            if (fs.statSync(source).isFile()) {
                                const form = createFormData(token, content_type, thumbnail_size, comments_enabled);
                                const data = await postImage(fs.readFileSync(source), form);
                                return data;
                            }
                        } catch (error: any) {
                            throw new Error(error.message);
                        }
                    }
                }));
            }

            /* 6. 
            [ 
                { source: 'http://lorem.photo/photo.jpg', filename: 'sky from url' }, 
                { source: 'src/foo.jpg', filename: 'sky from path' } 
            ] 
            */
            if ((images as WithName[]).every(file => file.source)) {
                dataArray = await Promise.allSettled(images.map(async (image, _) => {
                    if (typeof (image as any).source === 'string' && isUrl((image as any).source)) {
                        const form = createFormData(token, content_type, thumbnail_size, comments_enabled);
                        const data = await postImage((image as any).source, form, (image as WithName).filename);
                        return data;
                    }
                    if (typeof (image as any).source === 'string' && !isUrl((image as any).source)) {
                        try {
                            if (fs.statSync((image as any).source).isFile()) {
                                const form = createFormData(token, content_type, thumbnail_size, comments_enabled);
                                const data = await postImage(fs.readFileSync((image as any).source), form, (image as WithName).filename);
                                return data;
                            }
                        } catch (error: any) {
                            throw new Error(error.message);
                        }
                    }
                }));
            }

            const successResponse: any = dataArray.filter(data => data.status === 'fulfilled');
            const failedResponse: any = dataArray.filter(data => data.status === 'rejected');

            result = {
                ok: successResponse.length >= 1 ? true : false,
                message: successResponse.length >= 1 ? 'Image has been uploaded.' : 'Image has not been uploaded.',
                data: {
                    success: successResponse.map((res: any, _: any) => res.value[0]),
                    failed: failedResponse.map((res: any, _: any) => res.reason.toString()),
                    successTotal: successResponse.length,
                    failedTotal: failedResponse.length
                }
            };
            if (successResponse.length >= 1) {
                result.data['gallery_edit'] = `${URL.baseURL}/${URL.gallery_edit}/${token.gallery_id}/${token.gallery_secret}`;
            }
        }

        return result;
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
};

/* 
 * 
 * Delete gallery and get Successfull/Failed response
 *
 * @param {string} galleryEditUrl - edit_gallery URL got from each upload request
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>}
 */
imgbox.deleteGallery = async (
    galleryEditUrl: string,
    options?: {
        auth_cookie?: string,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        if (options?.logger === false) {
            DisableLogger();
        }

        if (!isUrl(galleryEditUrl)) {
            throw new Error('Url is invalid.');
        }

        const url = galleryEditUrl.split(`${URL.baseURL}/`)[1];

        const csrfCookie = options?.auth_cookie
            ? await getAuthCsrf(options.auth_cookie, default_token)
            : await getCsrfAndCookie();

        const resGallery = await REQUEST.get(url);

        if (resGallery.data.toString().includes('The specified gallery could not be found')) {
            throw new Error('The specified gallery could not be found');
        }
        const confirmation = resGallery.data.toString().split('name="confirmation" type="submit" value="')[1].split('"')[0];

        const form = new FormData();
        form.append('utf8', '✓');
        form.append('authenticity_token', csrfCookie.csrf_token);
        form.append('confirmation', confirmation);

        const config = setHeadersConfig([
            { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
            { key: 'Cookie', value: csrfCookie.cookie },
            { key: 'Referer', value: galleryEditUrl },
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);

        const response = await REQUEST.post(url, form, config);

        if (response.status === 200) {
            return { ok: true, message: 'Gallery has been deleted', data: [] };
        } else {
            return { ok: false, message: 'Gallery has not been deleted. Try again.', data: [] };
        }
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
};

/* 
 * 
 * Enable/Disable comment for specified Gallery
 *
 * @param {string} galleryEditUrl - edit_gallery URL got from each upload request
 * @param {boolean} isEnabled - true = enabled | false = disabled
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>}
 */
imgbox.updateComment = async (
    galleryEditUrl: string,
    options?: {
        isEnabled?: boolean,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        if (options?.logger === false) {
            DisableLogger();
        }

        if (!isUrl(galleryEditUrl)) {
            throw new Error('Url is invalid.');
        }

        const url = galleryEditUrl.split(`${URL.baseURL}/`)[1];

        const csrfCookie = await getCsrfAndCookie();
        const resGallery = await REQUEST.get(url);

        if (resGallery.data.toString().includes('The specified gallery could not be found')) {
            throw new Error('The specified gallery could not be found');
        }

        const form = new FormData();
        form.append('utf8', '✓');
        form.append('authenticity_token', csrfCookie.csrf_token);
        form.append('comments_enabled', options?.isEnabled ? 1 : 0);
        form.append('commit', 'Save');

        const config = setHeadersConfig([
            { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
            { key: 'Cookie', value: csrfCookie.cookie },
            { key: 'Referer', value: galleryEditUrl },
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);

        const response = await REQUEST.post(url, form, config);

        if (response.status === 200) {
            return { ok: true, message: `Gallery comment has been ${options?.isEnabled ? 'enabled' : 'disabled'} `, data: [] };
        } else {
            return { ok: false, message: 'Edit gallery comment failed. Try again.', data: [] };
        }
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
};

/*
 * ----------------------------------------------------- 
 * AUTH / PROTECTED ROUTES
 * ----------------------------------------------------- 
/* 

 * 
 * Get Images from your account based on auth_cookie
 *
 * @param {Object} options
 * @param {string} options.auth_cookie - authCookie got from browser when you logged in.
 *                                       There's no such way to get http-only-cookie,
 *                                       you have to get it manually from browser after you logged in
 * @param {number} options.page - page you want to show. default = 1
 * @param {string} options.scope - 'all' | 'unbound', default = 'all'
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>} - a promise containt list of images
 */
imgbox.getImages = async (
    options: {
        auth_cookie: string,
        page?: number,
        scope?: ImageScope,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        if (options?.logger === false) {
            DisableLogger();
        }

        let result: IResponseObject = { ok: false, message: '', data: [] };

        const config = setHeadersConfig([
            { key: 'Accept', value: 'application/json' },
            { key: 'Cookie', value: options.auth_cookie },
            { key: 'If-None-Match', value: default_token },
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Sec-Fetch-Mode', value: 'navigate' },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Use', value: '?1' },
            { key: 'Upgrade-Insecure-Requests', value: '1' },
            { key: 'Referer', value: URL.baseURL + '/' }
        ]);

        const response = await REQUEST.get(
            URL.images + `?&page=${options?.page ? options.page : 1}&scope=${options?.scope ? options.scope : 'all'}`,
            config);

        result = {
            ok: true,
            message: `${response.data.length >= 1 ? 'Images has been retrieved.' : `Images is empty on page ${options?.page ? options.page : 1}`} `,
            data: {
                page: options?.page ? options.page : 1,
                total_images: response.data.length,
                images: response.data
            }
        };

        return result;
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
};

/* 
 * 
 * Get Galleries along with it's Images from your account based on auth_cookie
 *
 * @param {Object} options
 * @param {string} options.auth_cookie - authCookie got from browser when you logged in.
 *                                       There's no such way to get http-only-cookie,
 *                                       you have to get it manually from browser after you logged in
 * @param {number} options.page - page you want to show. default = 1
 * @param {string} options.order_by - 'updated' | 'created' | 'title'. default = 'updated'
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>} - a promise containt list of galleries along with it's images
 */
imgbox.getGalleries = async (
    options: {
        auth_cookie: string,
        page?: number,
        order_by?: OrderBy,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        if (options?.logger === false) {
            DisableLogger();
        }

        let result: IResponseObject = { ok: false, message: '', data: [] };

        const config = setHeadersConfig([
            { key: 'Accept', value: 'application/json' },
            { key: 'Cookie', value: options.auth_cookie },
            { key: 'If-None-Match', value: default_token },
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Sec-Fetch-Mode', value: 'navigate' },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Use', value: '?1' },
            { key: 'Upgrade-Insecure-Requests', value: '1' },
            { key: 'Referer', value: URL.baseURL + '/galleries' }
        ]);

        const response = await REQUEST.get(URL.gallery +
            `?&page=${options?.page ? options.page : 1}&orderby=${options?.order_by ? options.order_by : 'updated'}`,
            config);

        result = {
            ok: true,
            message: `${response.data.length >= 1 ? 'Gallery has been retrieved.' : `Gallery is empty on page ${options?.page ? options.page : 1}`} `,
            data: {
                page: options?.page ? options.page : 1,
                total_gallery: response.data.length,
                images: response.data
            }
        };

        return result;
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
};

/* 
 * 
 * Delete array of images
 * 
 * @param {Array} images_url - URLs Images or IDs Images 
 * @param {Object} options
 * @param {string} options.auth_cookie - authCookie got from browser when you logged in.
 *                                       There's no such way to get http-only-cookie,
 *                                       you have to get it manually from browser after you logged in
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>} - a promise containts success/failed message.
 */
imgbox.deleteImages = async (
    images_url: string[],
    options: {
        auth_cookie: string,
        logger?: LoggerEnabled;
    }
): Promise<IResponseObject> => {
    try {
        if (options?.logger === false) {
            DisableLogger();
        }

        const csrfCookie = await getAuthCsrf(options.auth_cookie, default_token);

        const body = {
            images: images_url.map(url => {
                if (isUrl(url) && url.includes(URL.baseURL)) {
                    return url.split(URL.baseURL + '/')[1];
                } else {
                    return url;
                }
            })
        };

        const slugExist = await Promise.allSettled(body.images.map(async (slug, _) => {
            const res = await REQUEST.get(slug);
            if (!res.data.includes('<span>The image in question does not exist.</span>')) {
                return slug;
            }
        }));

        const newBody = { images: slugExist.filter(val => val.status === 'fulfilled' && val.value !== undefined) };

        if (newBody.images.length === 0) {
            return {
                ok: false,
                message: `Images does not exist. Delete canceled.`,
                data: []
            };
        }
        const config = setHeadersConfig([
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'X-CSRF-TOKEN', value: csrfCookie.csrf_token },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'Accept', value: 'application/json;charset=UTF-8' },
            { key: 'Content-Type', value: 'application/json, text/plain, */*' },
            { key: 'X-Requested-With', value: 'XMLHttpRequest' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Origin', value: URL.baseURL },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Mode', value: 'cors' },
            { key: 'Sec-Fetch-Dest', value: 'empty' },
            { key: 'Referer', value: URL.baseURL + '/images' },
            { key: 'Accept-Language', value: 'en-US,en;q=0.9,id;q=0.8' },
            { key: 'Cookie', value: options.auth_cookie }
        ]);

        const response = await REQUEST.post(URL.delete_images, newBody, config);

        if (response.data === 'OK') {
            return {
                ok: true,
                message: `${newBody.images.length} Images was deleted. ${images_url.length - newBody.images.length} was not.`,
                data: []
            };
        } else {
            return { ok: false, message: 'Images not deleted. Try again.', data: [] };
        }
    } catch (error: any) {
        return {
            ok: false,
            message: error,
            data: []
        };
    }
};

export { imgbox };