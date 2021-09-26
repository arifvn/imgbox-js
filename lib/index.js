"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imgbox = void 0;
const request_1 = require("./request");
const helper_1 = require("./helper");
const form_data_1 = __importDefault(require("form-data"));
const is_url_1 = __importDefault(require("is-url"));
const fs_1 = __importDefault(require("fs"));
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
const imgbox = (images, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content_type = (options === null || options === void 0 ? void 0 : options.content_type) ? options.content_type : 'safe';
        const thumbnail_size = (options === null || options === void 0 ? void 0 : options.thumbnail_size) ? options.thumbnail_size : '100c';
        const comments_enabled = (options === null || options === void 0 ? void 0 : options.comments_enabled) ? options.comments_enabled : false;
        const album_config = {
            gallery: (options === null || options === void 0 ? void 0 : options.album_title) ? true : false,
            gallery_title: (options === null || options === void 0 ? void 0 : options.album_title) ? options.album_title : 'Album ' + new Date().getTime(),
            comments_enabled
        };
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        let token = (options === null || options === void 0 ? void 0 : options.auth_cookie)
            ? yield (0, helper_1.getToken)(album_config, options.auth_cookie, request_1.default_token)
            : yield (0, helper_1.getToken)(album_config);
        const form = (0, helper_1.createFormData)(token, content_type, thumbnail_size, comments_enabled);
        let result = { ok: false, message: '', data: [] };
        if (typeof images === 'string') {
            // 1. 'http://lorem.photo/photo.jpg'
            if ((0, is_url_1.default)(images)) {
                const data = yield (0, helper_1.postImage)(images, form);
                result = { ok: true, message: 'Image URL has been uploaded.', data };
                (0, helper_1.addGalleryEditResponse)(result, token);
            }
            // 2. 'src/foo.jpg'
            if (!(0, is_url_1.default)(images)) {
                try {
                    if (fs_1.default.statSync(images).isFile()) {
                        const data = yield (0, helper_1.postImage)(fs_1.default.readFileSync(images), form);
                        result = { ok: true, message: 'Image file has been uploaded.', data };
                        (0, helper_1.addGalleryEditResponse)(result, token);
                    }
                }
                catch (error) {
                    throw new Error(error.message);
                }
            }
        }
        if (images.source) {
            // 3. { source: 'http://lorem.photo/photo.jpg', filename: 'sky from url' }
            if ((0, is_url_1.default)(images.source)) {
                const data = yield (0, helper_1.postImage)(images.source, form, images.filename);
                result = { ok: true, message: 'Image URL has been uploaded.', data };
                (0, helper_1.addGalleryEditResponse)(result, token);
            }
            // 4. { source: 'src/foo.jpg', filename: 'sky from path' }
            if (!(0, is_url_1.default)(images.source)) {
                try {
                    if (fs_1.default.statSync(images.source).isFile()) {
                        const data = yield (0, helper_1.postImage)(fs_1.default.readFileSync(images.source), form, images.filename);
                        result = { ok: true, message: 'Image file has been uploaded.', data };
                        (0, helper_1.addGalleryEditResponse)(result, token);
                    }
                }
                catch (error) {
                    throw new Error(error.message);
                }
            }
        }
        if (images.constructor === Array) {
            let dataArray = [];
            // 5. ['http://lorem.photo/photo.jpg', 'src/photo2.jpg']
            if (images) {
                dataArray = yield Promise.allSettled(images.map((source, _) => __awaiter(void 0, void 0, void 0, function* () {
                    if (typeof source === 'string' && (0, is_url_1.default)(source)) {
                        const form = (0, helper_1.createFormData)(token, content_type, thumbnail_size, comments_enabled);
                        const data = yield (0, helper_1.postImage)(source, form);
                        return data;
                    }
                    if (typeof source === 'string' && !(0, is_url_1.default)(source)) {
                        try {
                            if (fs_1.default.statSync(source).isFile()) {
                                const form = (0, helper_1.createFormData)(token, content_type, thumbnail_size, comments_enabled);
                                const data = yield (0, helper_1.postImage)(fs_1.default.readFileSync(source), form);
                                return data;
                            }
                        }
                        catch (error) {
                            throw new Error(error.message);
                        }
                    }
                })));
            }
            /* 6.
            [
                { source: 'http://lorem.photo/photo.jpg', filename: 'sky from url' },
                { source: 'src/foo.jpg', filename: 'sky from path' }
            ]
            */
            if (images.every(file => file.source)) {
                dataArray = yield Promise.allSettled(images.map((image, _) => __awaiter(void 0, void 0, void 0, function* () {
                    if (typeof image.source === 'string' && (0, is_url_1.default)(image.source)) {
                        const form = (0, helper_1.createFormData)(token, content_type, thumbnail_size, comments_enabled);
                        const data = yield (0, helper_1.postImage)(image.source, form, image.filename);
                        return data;
                    }
                    if (typeof image.source === 'string' && !(0, is_url_1.default)(image.source)) {
                        try {
                            if (fs_1.default.statSync(image.source).isFile()) {
                                const form = (0, helper_1.createFormData)(token, content_type, thumbnail_size, comments_enabled);
                                const data = yield (0, helper_1.postImage)(fs_1.default.readFileSync(image.source), form, image.filename);
                                return data;
                            }
                        }
                        catch (error) {
                            throw new Error(error.message);
                        }
                    }
                })));
            }
            const successResponse = dataArray.filter(data => data.status === 'fulfilled');
            const failedResponse = dataArray.filter(data => data.status === 'rejected');
            result = {
                ok: successResponse.length >= 1 ? true : false,
                message: successResponse.length >= 1 ? 'Image has been uploaded.' : 'Image has not been uploaded.',
                data: {
                    success: successResponse.map((res, _) => res.value[0]),
                    failed: failedResponse.map((res, _) => res.reason.toString()),
                    successTotal: successResponse.length,
                    failedTotal: failedResponse.length
                }
            };
            if (successResponse.length >= 1) {
                result.data['gallery_edit'] = `${request_1.URL.baseURL}/${request_1.URL.gallery_edit}/${token.gallery_id}/${token.gallery_secret}`;
            }
        }
        return result;
    }
    catch (error) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
});
exports.imgbox = imgbox;
/*
 *
 * Delete gallery and get Successfull/Failed response
 *
 * @param {string} galleryEditUrl - edit_gallery URL got from each upload request
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>}
 */
imgbox.deleteGallery = (galleryEditUrl, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        if (!(0, is_url_1.default)(galleryEditUrl)) {
            throw new Error('Url is invalid.');
        }
        const url = galleryEditUrl.split(`${request_1.URL.baseURL}/`)[1];
        const csrfCookie = (options === null || options === void 0 ? void 0 : options.auth_cookie)
            ? yield (0, helper_1.getAuthCsrf)(options.auth_cookie, request_1.default_token)
            : yield (0, helper_1.getCsrfAndCookie)();
        const resGallery = yield request_1.REQUEST.get(url);
        if (resGallery.data.toString().includes('The specified gallery could not be found')) {
            throw new Error('The specified gallery could not be found');
        }
        const confirmation = resGallery.data.toString().split('name="confirmation" type="submit" value="')[1].split('"')[0];
        const form = new form_data_1.default();
        form.append('utf8', '✓');
        form.append('authenticity_token', csrfCookie.csrf_token);
        form.append('confirmation', confirmation);
        const config = (0, helper_1.setHeadersConfig)([
            { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
            { key: 'Cookie', value: csrfCookie.cookie },
            { key: 'Referer', value: galleryEditUrl },
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);
        const response = yield request_1.REQUEST.post(url, form, config);
        if (response.status === 200) {
            return { ok: true, message: 'Gallery has been deleted', data: [] };
        }
        else {
            return { ok: false, message: 'Gallery has not been deleted. Try again.', data: [] };
        }
    }
    catch (error) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
});
/*
 *
 * Enable/Disable comment for specified Gallery
 *
 * @param {string} galleryEditUrl - edit_gallery URL got from each upload request
 * @param {boolean} isEnabled - true = enabled | false = disabled
 * @param {boolean} options.logger - Enable request logger. false = Disabled | true = Enabled
 * @returns {Promise.<IResponseObject>}
 */
imgbox.updateComment = (galleryEditUrl, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        if (!(0, is_url_1.default)(galleryEditUrl)) {
            throw new Error('Url is invalid.');
        }
        const url = galleryEditUrl.split(`${request_1.URL.baseURL}/`)[1];
        const csrfCookie = yield (0, helper_1.getCsrfAndCookie)();
        const resGallery = yield request_1.REQUEST.get(url);
        if (resGallery.data.toString().includes('The specified gallery could not be found')) {
            throw new Error('The specified gallery could not be found');
        }
        const form = new form_data_1.default();
        form.append('utf8', '✓');
        form.append('authenticity_token', csrfCookie.csrf_token);
        form.append('comments_enabled', (options === null || options === void 0 ? void 0 : options.isEnabled) ? 1 : 0);
        form.append('commit', 'Save');
        const config = (0, helper_1.setHeadersConfig)([
            { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
            { key: 'Cookie', value: csrfCookie.cookie },
            { key: 'Referer', value: galleryEditUrl },
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);
        const response = yield request_1.REQUEST.post(url, form, config);
        if (response.status === 200) {
            return { ok: true, message: `Gallery comment has been ${(options === null || options === void 0 ? void 0 : options.isEnabled) ? 'enabled' : 'disabled'} `, data: [] };
        }
        else {
            return { ok: false, message: 'Edit gallery comment failed. Try again.', data: [] };
        }
    }
    catch (error) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
});
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
imgbox.getImages = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        let result = { ok: false, message: '', data: [] };
        const config = (0, helper_1.setHeadersConfig)([
            { key: 'Accept', value: 'application/json' },
            { key: 'Cookie', value: options.auth_cookie },
            { key: 'If-None-Match', value: request_1.default_token },
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Sec-Fetch-Mode', value: 'navigate' },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Use', value: '?1' },
            { key: 'Upgrade-Insecure-Requests', value: '1' },
            { key: 'Referer', value: request_1.URL.baseURL + '/' }
        ]);
        const response = yield request_1.REQUEST.get(request_1.URL.images + `?&page=${(options === null || options === void 0 ? void 0 : options.page) ? options.page : 1}&scope=${(options === null || options === void 0 ? void 0 : options.scope) ? options.scope : 'all'}`, config);
        result = {
            ok: true,
            message: `${response.data.length >= 1 ? 'Images has been retrieved.' : `Images is empty on page ${(options === null || options === void 0 ? void 0 : options.page) ? options.page : 1}`} `,
            data: {
                page: (options === null || options === void 0 ? void 0 : options.page) ? options.page : 1,
                total_images: response.data.length,
                images: response.data
            }
        };
        return result;
    }
    catch (error) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
});
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
imgbox.getGalleries = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        let result = { ok: false, message: '', data: [] };
        const config = (0, helper_1.setHeadersConfig)([
            { key: 'Accept', value: 'application/json' },
            { key: 'Cookie', value: options.auth_cookie },
            { key: 'If-None-Match', value: request_1.default_token },
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Sec-Fetch-Mode', value: 'navigate' },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Use', value: '?1' },
            { key: 'Upgrade-Insecure-Requests', value: '1' },
            { key: 'Referer', value: request_1.URL.baseURL + '/galleries' }
        ]);
        const response = yield request_1.REQUEST.get(request_1.URL.gallery +
            `?&page=${(options === null || options === void 0 ? void 0 : options.page) ? options.page : 1}&orderby=${(options === null || options === void 0 ? void 0 : options.order_by) ? options.order_by : 'updated'}`, config);
        result = {
            ok: true,
            message: `${response.data.length >= 1 ? 'Gallery has been retrieved.' : `Gallery is empty on page ${(options === null || options === void 0 ? void 0 : options.page) ? options.page : 1}`} `,
            data: {
                page: (options === null || options === void 0 ? void 0 : options.page) ? options.page : 1,
                total_gallery: response.data.length,
                images: response.data
            }
        };
        return result;
    }
    catch (error) {
        return {
            ok: false,
            message: error.message,
            data: []
        };
    }
});
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
imgbox.deleteImages = (images_url, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((options === null || options === void 0 ? void 0 : options.logger) === false) {
            (0, request_1.DisableLogger)();
        }
        const csrfCookie = yield (0, helper_1.getAuthCsrf)(options.auth_cookie, request_1.default_token);
        const body = {
            images: images_url.map(url => {
                if ((0, is_url_1.default)(url) && url.includes(request_1.URL.baseURL)) {
                    return url.split(request_1.URL.baseURL + '/')[1];
                }
                else {
                    return url;
                }
            })
        };
        const slugExist = yield Promise.allSettled(body.images.map((slug, _) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield request_1.REQUEST.get(slug);
            if (!res.data.includes('<span>The image in question does not exist.</span>')) {
                return slug;
            }
        })));
        const newBody = { images: slugExist.filter(val => val.status === 'fulfilled' && val.value !== undefined) };
        if (newBody.images.length === 0) {
            return {
                ok: false,
                message: `Images does not exist. Delete canceled.`,
                data: []
            };
        }
        const config = (0, helper_1.setHeadersConfig)([
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'X-CSRF-TOKEN', value: csrfCookie.csrf_token },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'Accept', value: 'application/json;charset=UTF-8' },
            { key: 'Content-Type', value: 'application/json, text/plain, */*' },
            { key: 'X-Requested-With', value: 'XMLHttpRequest' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Origin', value: request_1.URL.baseURL },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Mode', value: 'cors' },
            { key: 'Sec-Fetch-Dest', value: 'empty' },
            { key: 'Referer', value: request_1.URL.baseURL + '/images' },
            { key: 'Accept-Language', value: 'en-US,en;q=0.9,id;q=0.8' },
            { key: 'Cookie', value: options.auth_cookie }
        ]);
        const response = yield request_1.REQUEST.post(request_1.URL.delete_images, newBody, config);
        if (response.data === 'OK') {
            return {
                ok: true,
                message: `${newBody.images.length} Images was deleted. ${images_url.length - newBody.images.length} was not.`,
                data: []
            };
        }
        else {
            return { ok: false, message: 'Images not deleted. Try again.', data: [] };
        }
    }
    catch (error) {
        return {
            ok: false,
            message: error,
            data: []
        };
    }
});
//# sourceMappingURL=index.js.map